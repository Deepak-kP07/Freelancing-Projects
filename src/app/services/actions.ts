
'use server';

import { z } from 'zod';
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, runTransaction, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';

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

async function getNextBookingDisplayId(): Promise<{ displayId?: string; error?: string; rawError?: any }> {
  const counterRef = doc(db, COUNTER_COLLECTION, SERVICE_BOOKING_COUNTER_DOC);
  let newIdNumber = 1;
  console.log(`getNextBookingDisplayId: Initiating transaction for ${COUNTER_COLLECTION}/${SERVICE_BOOKING_COUNTER_DOC}`);

  try {
    await runTransaction(db, async (transaction) => {
      console.log(`getNextBookingDisplayId: Transaction callback started.`);
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        newIdNumber = 1;
        console.log(`getNextBookingDisplayId: Counter doc doesn't exist. Setting initial ID: ${newIdNumber}.`);
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        console.log(`getNextBookingDisplayId: Counter doc exists. New ID: ${newIdNumber}. Attempting update.`);
        transaction.update(counterRef, { currentId: newIdNumber });
      }
    });
    const displayId = `OZN${String(newIdNumber).padStart(4, '0')}`;
    console.log(`getNextBookingDisplayId: Transaction successful. Generated Display ID: ${displayId}`);
    return { displayId };
  } catch (error: any) {
    console.error("!!! Critical Error in getNextBookingDisplayId Transaction !!!");
    console.error("Firestore transaction for booking ID generation FAILED.");
    console.error("Error Code From Firestore:", error.code);
    console.error("Error Message From Firestore:", error.message);
    console.error("Full Firestore error object:", error);

    let detailMessage = `Firestore operation failed in getNextBookingDisplayId: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED' || error.message?.toLowerCase().includes('permission')) {
        detailMessage += " This often means 'request.auth' was null when Firestore rules expected an authenticated user, or rules don't allow read/write on 'counters/serviceBookingCounter'. Check Firestore rules and ensure the server action is running with user authentication context.";
    }
    return { error: detailMessage, rawError: error };
  }
}


export async function bookServiceAction(
  prevState: BookingFormState | undefined,
  formData: FormData
): Promise<BookingFormState> {
  console.log("bookServiceAction: Initiated.");
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    serviceType: formData.get('serviceType'),
    preferredDate: formData.get('preferredDate'),
    preferredTime: formData.get('preferredTime'),
  };
  console.log("bookServiceAction: Raw form data:", rawData);

  const validatedFields = bookingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.warn("bookServiceAction: Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Failed to book service. Please check the errors below.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  const { name, email, phone, serviceType, preferredDate, preferredTime } = validatedFields.data;
  console.log("bookServiceAction: Validation successful for user:", email);

  const idResult = await getNextBookingDisplayId();

  if (idResult.error || !idResult.displayId) {
    console.error('bookServiceAction: Failed to generate booking ID. Error from getNextBookingDisplayId:', idResult.error, "Raw Firestore error (if any):", idResult.rawError);
    return {
      message: `Booking failed: ${idResult.error || 'Unknown error generating booking ID.'} Please try again.`,
      success: false,
    };
  }
  const displayId = idResult.displayId;
  console.log("bookServiceAction: Successfully generated booking Display ID:", displayId);

  const newBookingData = {
    name,
    email,
    phone,
    serviceType,
    preferredDate: Timestamp.fromDate(new Date(preferredDate)), // Convert to Firestore Timestamp
    preferredTime,
    displayId,
    userEmail: email, // For querying user's bookings
    status: SERVICE_STATUSES[0], // Default status: "Pending Confirmation"
    bookedAt: serverTimestamp(),
  };

  try {
    console.log("bookServiceAction: Attempting to save booking to Firestore 'serviceBookings' collection for user:", email);
    const docRef = await addDoc(collection(db, 'serviceBookings'), newBookingData);
    console.log('bookServiceAction: New Booking Added to Firestore with Doc ID:', docRef.id, 'Display ID:', displayId, "for user:", email);
    return {
      message: `Service booked successfully! Your Booking ID is ${displayId}. We will contact you shortly to confirm.`,
      success: true
    };
  } catch (error: any) {
    console.error("!!! Unhandled error in bookServiceAction while adding document !!!", error);
    let userMessage = `An unexpected server error occurred while saving your booking: ${error.message}. Please check server logs.`;
    if (error.code) {
      userMessage = `A server error occurred: ${error.message} (Code: ${error.code}).`;
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED' || error.message?.toLowerCase().includes('permission')) {
         userMessage += " This indicates a Firestore permission issue (e.g., 'request.auth' was null or rules for 'serviceBookings' collection are too restrictive). Check Firestore rules and ensure the server action is running with user authentication context.";
      }
    }
    return { message: userMessage, success: false };
  }
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
  console.log(`getUserBookings: Fetching Firestore bookings for email: ${userEmail}`);
  if (!userEmail) {
      console.warn("getUserBookings: Called with no userEmail.");
      return [];
  }
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, where('userEmail', '==', userEmail), orderBy('bookedAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`getUserBookings: Found ${bookings.length} Firestore bookings for ${userEmail}.`);
    return bookings;
  } catch (error: any) {
    console.error(`getUserBookings: Error fetching user bookings from Firestore for ${userEmail}: `, error.code, error.message, error);
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        console.error("getUserBookings: PERMISSION_DENIED. This often means 'request.auth' was null or Firestore rules don't allow users to read bookings where 'userEmail' matches their own (e.g., request.auth.token.email == resource.data.userEmail).");
    } else if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        console.error("getUserBookings: Missing Firestore index. The query requires an index on 'userEmail' (asc) and 'bookedAt' (desc) for 'serviceBookings'. Check server logs or browser console for a Firebase link to create it.");
    }
    // Rethrow the error so the calling component can catch it and display a message
    throw new Error(`Failed to fetch your bookings: ${error.message} (Code: ${error.code})`);
  }
}

async function isAdminCheck(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  return ADMIN_EMAIL.includes(userEmail);
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  console.log(`getAllBookings: Attempting as user: ${currentUserEmail || 'undefined/unauthenticated'}`);
  const isClientSideAdmin = await isAdminCheck(currentUserEmail);
  if (!isClientSideAdmin) {
    console.warn(`getAllBookings: Unauthorized client-side attempt by: ${currentUserEmail || 'undefined/unauthenticated user'}.`);
    return { error: "Unauthorized: You do not have permission to view all bookings (client-side check)." };
  }

  console.log(`getAllBookings: Admin ${currentUserEmail} attempting to fetch all bookings from Firestore.`);
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, orderBy('bookedAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`getAllBookings: Admin ${currentUserEmail} successfully fetched ${bookings.length} bookings.`);
    return bookings;
  } catch (error: any) {
    console.error(`getAllBookings: Error fetching all bookings from Firestore for admin ${currentUserEmail}: `, error.code, error.message, error);
    let detailedError = `Failed to fetch bookings from database: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        detailedError += " This often means 'request.auth' was null for the admin user in Firestore rules, or the rules do not grant 'list' permission to admins (via isAdmin() in rules) for the 'serviceBookings' collection. Verify Firestore rules and ensure the admin user is properly authenticated when this action runs.";
    } else if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        detailedError += " A Firestore index is required for the query (likely ordering by 'bookedAt'). Check server logs or browser console for a Firebase link to create it. Index: 'bookedAt' (desc) for 'serviceBookings'.";
    }
    return { error: detailedError };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  currentUserEmail: string | null | undefined
): Promise<{ success: boolean; message: string }> {
  console.log(`updateBookingStatus: Attempting by user: ${currentUserEmail || 'undefined/unauthenticated'} for booking ${bookingId} to status ${newStatus}`);
  const isClientSideAdmin = await isAdminCheck(currentUserEmail);
  if (!isClientSideAdmin) {
    console.warn(`updateBookingStatus: Unauthorized client-side attempt by: ${currentUserEmail || 'undefined/unauthenticated user'} for booking ${bookingId}`);
    return { success: false, message: "Unauthorized: You do not have permission to update booking status (client-side check)." };
  }

  if (!SERVICE_STATUSES.includes(newStatus)) {
    console.warn(`updateBookingStatus: Invalid status value "${newStatus}" provided.`);
    return { success: false, message: "Invalid status value provided." };
  }

  const bookingRef = doc(db, 'serviceBookings', bookingId);
  console.log(`updateBookingStatus: Admin ${currentUserEmail} attempting to update booking ${bookingId} to status ${newStatus}.`);

  try {
    await updateDoc(bookingRef, { status: newStatus });
    console.log(`updateBookingStatus: Admin ${currentUserEmail} successfully updated booking ${bookingId} to status ${newStatus} in Firestore.`);
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (error: any) {
    console.error(`updateBookingStatus: Error updating booking status in Firestore for booking ${bookingId} by admin ${currentUserEmail}: `, error.code, error.message, error);
    let message = `Failed to update booking status: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        message += " This indicates a Firestore permission issue for the admin user. Ensure Firestore rules allow admins to update 'serviceBookings' documents and 'request.auth' is not null.";
    }
    return { success: false, message };
  }
}

    