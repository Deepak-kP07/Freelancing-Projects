
'use server';

import { z } from 'zod';
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, runTransaction, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';

// Ensure date is parsed correctly
const preprocessDate = (arg: unknown) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  return arg;
};

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format." }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  preferredDate: z.preprocess(preprocessDate, z.date({ required_error: "Please pick a date." })),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time.' }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Type for stored bookings in Firestore
export type ServerBooking = BookingFormData & {
  id: string; // Firestore document ID
  displayId: string; // OZNxxxx
  userEmail: string;
  status: string;
  bookedAt: Date; 
  preferredDate: Date; 
};

export interface BookingFormState {
  message: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    serviceType?: string[];
    preferredDate?: string[];
    preferredTime?: string[];
  };
  success: boolean;
}

const COUNTER_COLLECTION = 'counters';
const SERVICE_BOOKING_COUNTER_DOC = 'serviceBookingCounter';

async function getNextBookingDisplayId(): Promise<string> {
  const counterRef = doc(db, COUNTER_COLLECTION, SERVICE_BOOKING_COUNTER_DOC);
  let newIdNumber = 1;

  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        console.log(`Counter document ${COUNTER_COLLECTION}/${SERVICE_BOOKING_COUNTER_DOC} does not exist. Creating with currentId: ${newIdNumber}`);
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        console.log(`Counter document exists. New currentId: ${newIdNumber}`);
        transaction.update(counterRef, { currentId: newIdNumber });
      }
    });
    return `OZN${String(newIdNumber).padStart(4, '0')}`;
  } catch (error: any) {
    console.error("!!! Critical Error in getNextBookingDisplayId !!!");
    console.error("Firestore transaction for booking ID generation failed dramatically.");
    console.error("Full error object:", error);
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);

    let detailedErrorMessage = "Could not generate booking ID due to a server error.";
    if (error.message) {
        detailedErrorMessage = `Could not generate booking ID: ${error.message}`;
    }
    
    if (error.code === 'permission-denied' || error.code === 'unauthenticated' || (error.message && error.message.toLowerCase().includes("permission"))) {
        detailedErrorMessage += " This strongly indicates a Firestore Security Rule issue or an authentication problem. Please verify that the authenticated user context (request.auth) is available and not null when this server action is executed, and that your Firestore rules allow read/write access to the counter document ('" + COUNTER_COLLECTION + "/" + SERVICE_BOOKING_COUNTER_DOC + "') for authenticated users.";
        console.error("Detailed Firestore Permission/Auth Error: Ensure authenticated users (request.auth != null) have read AND write permissions on the document '", COUNTER_COLLECTION, "/", SERVICE_BOOKING_COUNTER_DOC, "'. Also, verify the request.auth object in your Firestore rules is correctly populated when this server action runs.");
    }
    // Re-throw the original error so its details (like code) can be inspected by the caller if needed.
    throw error; 
  }
}


export async function bookServiceAction(
  prevState: BookingFormState | undefined,
  formData: FormData
): Promise<BookingFormState> {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      serviceType: formData.get('serviceType'),
      preferredDate: formData.get('preferredDate'),
      preferredTime: formData.get('preferredTime'),
    };

    const validatedFields = bookingSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: "Failed to book service. Please check the errors below.",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    let displayId;
    try {
        console.log("Attempting to generate booking ID...");
        displayId = await getNextBookingDisplayId();
        console.log("Successfully generated booking ID:", displayId);
    } catch (idError: any) {
        console.error('Error caught in bookServiceAction during ID generation:', idError);
        // Use the message from the original error thrown by getNextBookingDisplayId
        const reason = idError.message || "An internal error occurred during ID generation.";
        return {
            message: `Failed to generate booking ID. Reason: ${reason}. Please check server logs for more details.`,
            success: false,
        };
    }

    const newBookingData = {
      ...validatedFields.data,
      displayId,
      userEmail: validatedFields.data.email, 
      status: SERVICE_STATUSES[0], 
      bookedAt: serverTimestamp(), 
      preferredDate: Timestamp.fromDate(validatedFields.data.preferredDate),
    };

    await addDoc(collection(db, 'serviceBookings'), newBookingData);
    console.log('New Booking Added to Firestore with Display ID:', displayId);

    return { message: 'Service booked successfully! We will contact you shortly to confirm.', success: true };
  } catch (error: any) {
    // This catch block is for errors outside of ID generation (e.g., addDoc to serviceBookings)
    console.error('Service booking error (after ID generation or unrelated):', error);
    let message = 'An unexpected error occurred while saving the booking. Please try again later.';
    if(error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
        message = "Failed to save booking due to permission issues. Please check Firestore rules for 'serviceBookings' collection.";
    } else if (error.message) {
        message = `Failed to save booking: ${error.message}`;
    }
    return { message, success: false };
  }
}

async function isAdminCheck(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  return ADMIN_EMAIL.includes(userEmail);
}

const processBookingDoc = (docSnapshot: any): ServerBooking => {
    const data = docSnapshot.data();
    return {
      ...data,
      id: docSnapshot.id,
      bookedAt: data.bookedAt instanceof Timestamp ? data.bookedAt.toDate() : new Date(data.bookedAt),
      preferredDate: data.preferredDate instanceof Timestamp ? data.preferredDate.toDate() : new Date(data.preferredDate),
    } as ServerBooking;
};


export async function getUserBookings(userEmail: string): Promise<ServerBooking[]> {
  console.log(`Fetching Firestore bookings for email: ${userEmail}`);
  if (!userEmail) return [];

  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, where('userEmail', '==', userEmail), orderBy('bookedAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`Found Firestore bookings for ${userEmail}:`, bookings.length);
    return bookings;
  } catch (error: any) {
    console.error("Error fetching user bookings from Firestore: ", error);
    if (error.code === 'permission-denied') {
        console.error("Permission denied error details: Make sure your Firestore security rules allow users to read bookings where 'userEmail' matches their own email.");
    } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.error("Missing Firestore index error: The query requires an index. Firebase usually provides a link in the error message to create it. Check server logs for this link.");
    }
    // Re-throw or return an empty array/error object as per your app's error handling strategy
    throw error; // Or return []; if you want to silently fail on the UI
  }
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  if (!await isAdminCheck(currentUserEmail)) {
    console.warn(`Unauthorized attempt to getAllBookings by: ${currentUserEmail || 'undefined user'}`);
    return { error: "Unauthorized: You do not have permission to view all bookings." };
  }
  console.log(`Admin ${currentUserEmail} fetching all bookings from Firestore`);
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, orderBy('bookedAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log("Admin successfully fetched all bookings. Count:", bookings.length);
    return bookings;
  } catch (error: any) {
    console.error("Error fetching all bookings from Firestore for admin: ", error);
    let detailedError = "Failed to fetch bookings from database.";
    if (error.code === 'permission-denied') {
        detailedError = "Permission Denied: Ensure admin user has 'list' permission on 'serviceBookings' collection in Firestore rules.";
        console.error("Admin Firestore Permission Denied details:", error.message);
    } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
        detailedError = "Missing Firestore Index: The query for all bookings requires an index. Check server logs for a Firebase link to create it.";
        console.error("Admin Firestore Missing Index details:", error.message);
    }
    return { error: detailedError };
  }
}

export async function updateBookingStatus(
  bookingId: string, 
  newStatus: string,
  currentUserEmail: string | null | undefined
): Promise<{ success: boolean; message: string }> {
  if (!await isAdminCheck(currentUserEmail)) {
    return { success: false, message: "Unauthorized: You do not have permission to update booking status." };
  }

  if (!SERVICE_STATUSES.includes(newStatus)) {
    return { success: false, message: "Invalid status value." };
  }

  const bookingRef = doc(db, 'serviceBookings', bookingId);

  try {
    await updateDoc(bookingRef, {
      status: newStatus
    });
    console.log(`Admin ${currentUserEmail} updated booking ${bookingId} to status ${newStatus} in Firestore`);
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (error: any) {
    console.error("Error updating booking status in Firestore: ", error);
    let message = "Failed to update booking status in database.";
    if (error.code === 'permission-denied') {
        message = "Permission Denied: Failed to update booking status. Check Firestore rules.";
    }
    return { success: false, message };
  }
}
    