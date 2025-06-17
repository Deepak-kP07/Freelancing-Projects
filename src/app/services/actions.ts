
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

export type ServerBooking = BookingFormData & {
  id: string; 
  displayId: string; 
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

async function getNextBookingDisplayId(): Promise<string | { error: string; rawError?: any }> {
  const counterRef = doc(db, COUNTER_COLLECTION, SERVICE_BOOKING_COUNTER_DOC);
  let newIdNumber = 1;

  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        console.log(`Counter document ${COUNTER_COLLECTION}/${SERVICE_BOOKING_COUNTER_DOC} does not exist. Attempting to create with currentId: ${newIdNumber}. This requires write permission on this path.`);
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        console.log(`Counter document exists. New currentId: ${newIdNumber}. Attempting to update.`);
        transaction.update(counterRef, { currentId: newIdNumber });
      }
    });
    return `OZN${String(newIdNumber).padStart(4, '0')}`;
  } catch (error: any) {
    console.error("!!! Critical Error in getNextBookingDisplayId Transaction !!!");
    console.error("Firestore transaction for booking ID generation FAILED.");
    console.error("Error Code From Firestore:", error.code); 
    console.error("Error Message From Firestore:", error.message); 
    console.error("Full Firestore error object:", error);
    
    let detail = `Firestore operation failed in getNextBookingDisplayId: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied' || error.message?.toLowerCase().includes('permission')) {
        detail += " This often means 'request.auth' was null when Firestore rules expected an authenticated user, or rules don't allow read/write on 'counters/" + SERVICE_BOOKING_COUNTER_DOC + "'. Check Firestore rules and server logs.";
    } else if (error.code === 'aborted' && error.message?.toLowerCase().includes('contention')) {
        detail += " This indicates a concurrent access issue (multiple users trying to update the counter at the exact same time). Retrying might resolve this.";
    }
    return { error: detail, rawError: error };
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
      console.warn("Booking validation failed:", validatedFields.error.flatten().fieldErrors);
      return {
        message: "Failed to book service. Please check the errors below.",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    console.log("Attempting to generate booking ID for user:", validatedFields.data.email);
    const idResult = await getNextBookingDisplayId();

    if (typeof idResult !== 'string' && idResult.error) {
        console.error('Failed to generate booking ID. Full error from getNextBookingDisplayId:', idResult.error, "Raw Firestore error:", idResult.rawError);
        return {
            message: `Failed to generate booking ID. Reason: ${idResult.error}`,
            success: false,
        };
    }
    const displayId = idResult as string;
    console.log("Successfully generated booking ID:", displayId);

    const newBookingData = {
      ...validatedFields.data,
      displayId,
      userEmail: validatedFields.data.email, 
      status: SERVICE_STATUSES[0], 
      bookedAt: serverTimestamp(), 
      // Ensure preferredDate is converted to Firestore Timestamp for consistency
      preferredDate: Timestamp.fromDate(new Date(validatedFields.data.preferredDate)),
    };
    
    console.log("Attempting to save booking to Firestore 'serviceBookings' collection for user:", newBookingData.userEmail);
    await addDoc(collection(db, 'serviceBookings'), newBookingData);
    console.log('New Booking Added to Firestore with Display ID:', displayId, "for user:", newBookingData.userEmail);

    return { message: 'Service booked successfully! Your Booking ID is '+ displayId +'. We will contact you shortly to confirm.', success: true };
  } catch (error: any) {
    console.error('!!! Unhandled error in bookServiceAction !!!', error);
    let message = `An unexpected server error occurred: ${error.message}. Please check server logs.`;
    if (error.code) { 
        message = `A server error occurred: ${error.message} (Code: ${error.code}).`;
        if (error.code === 'permission-denied' || error.message?.toLowerCase().includes('permission')) {
           message += " This indicates a Firestore permission issue, possibly because 'request.auth' was null when rules expected an authenticated user, or rules for 'serviceBookings' collection are too restrictive. Check Firestore rules and server logs.";
        }
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
  if (!userEmail) {
      console.warn("getUserBookings called with no userEmail.");
      return [];
  }

  const bookingsCol = collection(db, 'serviceBookings');
  // Ensure this query matches your Firestore index configuration if you have specific composite indexes
  const q = query(bookingsCol, where('userEmail', '==', userEmail), orderBy('bookedAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`Found ${bookings.length} Firestore bookings for ${userEmail}.`);
    return bookings;
  } catch (error: any) {
    console.error(`Error fetching user bookings from Firestore for ${userEmail}: `, error.code, error.message, error);
    if (error.code === 'permission-denied') {
        console.error("Permission denied details: Make sure your Firestore security rules allow users to read bookings where 'userEmail' matches their own email (request.auth.token.email). 'request.auth' might be null if the server action isn't authenticated properly. Check Firestore rules for 'serviceBookings'.");
    } else if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        console.error("Missing Firestore index error: The query for user bookings requires an index. Firebase usually provides a link in the error message (check server logs or browser console during development) to create it. The index should be on 'userEmail' (ascending) and 'bookedAt' (descending) for the 'serviceBookings' collection.");
    }
    throw error; 
  }
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  const isClientAdmin = await isAdminCheck(currentUserEmail);
  if (!isClientAdmin) {
    console.warn(`Unauthorized attempt to getAllBookings by: ${currentUserEmail || 'undefined/unauthenticated user'}`);
    return { error: "Unauthorized: You do not have permission to view all bookings (client-side check)." };
  }
  console.log(`Admin ${currentUserEmail} attempting to fetch all bookings from Firestore.`);
  const bookingsCol = collection(db, 'serviceBookings');
  // Ensure this query matches your Firestore index configuration if you have specific composite indexes
  const q = query(bookingsCol, orderBy('bookedAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`Admin ${currentUserEmail} successfully fetched ${bookings.length} bookings.`);
    return bookings;
  } catch (error: any) {
    console.error(`Error fetching all bookings from Firestore for admin ${currentUserEmail}: `, error.code, error.message, error);
    let detailedError = `Failed to fetch bookings from database: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied') {
        detailedError += " This often means 'request.auth' was null for the admin user in Firestore rules, or the rules do not grant 'list' permission to admins for the 'serviceBookings' collection. Verify Firestore rules and ensure the admin user is properly authenticated when this action runs.";
        console.error("Admin Firestore Permission Denied details:", error.message);
    } else if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        detailedError += " A Firestore index is required for the query used to fetch all bookings (likely ordering by 'bookedAt'). Check server logs or browser console for a Firebase link to create it. The index might be on 'bookedAt' (descending) for the 'serviceBookings' collection.";
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
  const isClientAdmin = await isAdminCheck(currentUserEmail);
  if (!isClientAdmin) {
    console.warn(`Unauthorized attempt to updateBookingStatus by: ${currentUserEmail || 'undefined/unauthenticated user'} for booking ${bookingId}`);
    return { success: false, message: "Unauthorized: You do not have permission to update booking status (client-side check)." };
  }

  if (!SERVICE_STATUSES.includes(newStatus)) {
    return { success: false, message: "Invalid status value provided." };
  }

  const bookingRef = doc(db, 'serviceBookings', bookingId);
  console.log(`Admin ${currentUserEmail} attempting to update booking ${bookingId} to status ${newStatus}.`);

  try {
    await updateDoc(bookingRef, {
      status: newStatus
    });
    console.log(`Admin ${currentUserEmail} successfully updated booking ${bookingId} to status ${newStatus} in Firestore.`);
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (error: any) {
    console.error(`Error updating booking status in Firestore for booking ${bookingId} by admin ${currentUserEmail}: `, error.code, error.message, error);
    let message = `Failed to update booking status: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied') {
        message += " This indicates a Firestore permission issue for the admin user. Ensure Firestore rules allow admins to update 'serviceBookings' documents.";
    }
    return { success: false, message };
  }
}
    

    
