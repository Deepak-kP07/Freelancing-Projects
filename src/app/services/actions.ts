
'use server';

import { z } from 'zod';
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  orderBy,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';

// Helper to preprocess date strings or Date objects into Date objects
const preprocessDate = (arg: unknown): Date | unknown => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  return arg;
};

// Zod schema for validating booking form data
const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(100),
  email: z.string().email({ message: 'Invalid email address.' }).max(100),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).max(15).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format." }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  preferredDate: z.preprocess(preprocessDate, z.date({ required_error: "Please pick a date." })),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time.' }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Type for booking data as stored/retrieved from the server (includes ID, status etc.)
export type ServerBooking = BookingFormData & {
  id: string;
  displayId: string; // User-friendly booking ID
  userEmail: string; // Email of the user who made the booking
  status: string;
  bookedAt: Date; // Firestore Timestamp converted to Date
  preferredDate: Date; // Firestore Timestamp converted to Date
};

// State type for the booking form action
export interface BookingFormState {
  message: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    serviceType?: string[];
    preferredDate?: string[];
    preferredTime?: string[];
    _form?: string[]; // For form-wide errors
  };
  success: boolean;
  bookingId?: string; // The displayId of the successfully created booking
}

const COUNTER_COLLECTION = 'counters';
const SERVICE_BOOKING_COUNTER_DOC = 'serviceBookingCounter';

// Generates the next user-friendly display ID for a booking (e.g., OZN0001)
async function getNextBookingDisplayId(): Promise<{ displayId?: string; error?: string; rawError?: any }> {
  const counterRef = doc(db, COUNTER_COLLECTION, SERVICE_BOOKING_COUNTER_DOC);
  let newIdNumber = 1;
  console.log(`getNextBookingDisplayId: Initiating operation for ${COUNTER_COLLECTION}/${SERVICE_BOOKING_COUNTER_DOC}`);

  try {
    // Firestore transaction to safely increment the counter
    // This is the part most likely to fail if request.auth is null in server actions
    await runTransaction(db, async (transaction) => {
      console.log(`getNextBookingDisplayId: Transaction callback started.`);
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        newIdNumber = 1;
        console.log(`getNextBookingDisplayId: Counter doc doesn't exist. Setting initial ID: ${newIdNumber}. Attempting set.`);
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        console.log(`getNextBookingDisplayId: Counter doc exists. New ID: ${newIdNumber}. Attempting update.`);
        transaction.update(counterRef, { currentId: newIdNumber });
      }
    });
    const displayId = `OZN${String(newIdNumber).padStart(4, '0')}`;
    console.log(`getNextBookingDisplayId: Successfully generated Display ID: ${displayId}`);
    return { displayId };

  } catch (error: any) {
    console.error("!!! Critical Error in getNextBookingDisplayId Transaction !!!");
    console.error("Firestore transaction for booking ID generation FAILED.");
    console.error("Error Code From Firestore:", error.code);
    console.error("Error Message From Firestore:", error.message);
    console.error("Full Firestore error object:", error);

    let detailMessage = `Failed to generate booking ID. Firestore operation error: ${error.message} (Code: ${error.code}).`;
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED' || error.message?.toLowerCase().includes('permission')) {
        detailMessage += " This often means 'request.auth' was null when Firestore rules expected an authenticated user for the 'counters/serviceBookingCounter' document, or rules don't allow read/write on it. Check Firestore rules and ensure the server action is running with user authentication context.";
    }
    return { error: detailMessage, rawError: error };
  }
}

// Server action to handle booking a service
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
    preferredDate: formData.get('preferredDate'), // This will be a string from FormData
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
  console.log("bookServiceAction: Validation successful for user email from form:", email);

  // Get the next display ID
  const idResult = await getNextBookingDisplayId();
  if (idResult.error || !idResult.displayId) {
    console.error('bookServiceAction: Failed to generate booking ID. Error from getNextBookingDisplayId:', idResult.error, "Raw Firestore error (if any):", idResult.rawError);
    // Ensure the error message is user-friendly and passed to the form
    const errorMessage = idResult.error || 'Booking failed: Could not generate a booking ID. Please try again.';
    return {
      message: errorMessage,
      errors: { _form: [errorMessage] },
      success: false,
    };
  }
  const displayId = idResult.displayId;
  console.log("bookServiceAction: Successfully generated booking Display ID:", displayId);

  // Prepare data for Firestore
  const newBookingData = {
    name,
    email, // User's email from form (used for associating booking)
    phone,
    serviceType,
    preferredDate: Timestamp.fromDate(new Date(preferredDate)), // Convert Date to Firestore Timestamp
    preferredTime,
    displayId,
    userEmail: email, // Store the email of the user who made the booking
    status: SERVICE_STATUSES[0], // Initial status
    bookedAt: serverTimestamp(), // Firestore server-side timestamp
  };

  try {
    console.log("bookServiceAction: Attempting to save booking to Firestore 'serviceBookings' collection for userEmail:", email);
    const docRef = await addDoc(collection(db, 'serviceBookings'), newBookingData);
    console.log('bookServiceAction: New Booking Added to Firestore with Doc ID:', docRef.id, 'Display ID:', displayId, "for userEmail:", email);
    return {
      message: `Service booked successfully! Your Booking ID is ${displayId}. We will contact you shortly to confirm.`,
      success: true,
      bookingId: displayId, // Return the displayId for potential use in UI
    };
  } catch (error: any) {
    console.error("!!! Unhandled error in bookServiceAction while adding document to 'serviceBookings' !!!", error);
    let userMessage = `An unexpected server error occurred while saving your booking: ${error.message}. Please check server logs.`;
    if (error.code) { // Firebase errors have a 'code' property
      userMessage = `A server error occurred: ${error.message} (Code: ${error.code}).`;
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED' || error.message?.toLowerCase().includes('permission')) {
         userMessage += " This indicates a Firestore permission issue (e.g., 'request.auth' was null or rules for 'serviceBookings' collection are too restrictive for 'create'). Check Firestore rules and ensure the server action is running with user authentication context.";
      }
    }
    // Return form-wide error
    return { message: userMessage, success: false, errors: { _form: [userMessage] } };
  }
}

// Helper function to process a booking document snapshot from Firestore
const processBookingDoc = (docSnapshot: any): ServerBooking => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      displayId: data.displayId || `OZN-OLD-${docSnapshot.id.substring(0,4)}`, // Fallback for old data without displayId
      name: data.name,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      // Ensure preferredDate and bookedAt are converted from Firestore Timestamps to JS Dates
      preferredDate: data.preferredDate instanceof Timestamp ? data.preferredDate.toDate() : new Date(data.preferredDate),
      preferredTime: data.preferredTime,
      userEmail: data.userEmail, // Email of the user who made the booking
      status: data.status,
      bookedAt: data.bookedAt instanceof Timestamp ? data.bookedAt.toDate() : new Date(data.bookedAt || Date.now()), // Fallback for old data
    };
};

// Fetches bookings for a specific user
export async function getUserBookings(userEmail: string): Promise<ServerBooking[]> {
  console.log(`getUserBookings: Attempting to fetch Firestore bookings for email: ${userEmail}`);
  if (!userEmail) {
      console.warn("getUserBookings: Called with no userEmail provided. Returning empty array.");
      return [];
  }
  const bookingsCol = collection(db, 'serviceBookings');
  // Query for bookings where 'userEmail' matches and order by 'bookedAt'
  const q = query(bookingsCol, where('userEmail', '==', userEmail), orderBy('bookedAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`getUserBookings: Found ${bookings.length} Firestore bookings for ${userEmail}.`);
    return bookings;
  } catch (error: any) {
    console.error(`getUserBookings: Raw error object from Firestore for ${userEmail}:`, error);
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';
    console.error(`getUserBookings: Error fetching user bookings from Firestore for ${userEmail}. Code: ${errorCode}, Message: ${errorMessage}`);

    let detailMessage = `Failed to fetch your bookings: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        detailMessage += " This often means 'request.auth' was null or Firestore rules don't allow users to read bookings where 'userEmail' matches their own (e.g., request.auth.token.email == resource.data.userEmail).";
    } else if (errorCode === 'failed-precondition' && errorMessage.toLowerCase().includes('index')) {
        detailMessage += " This query requires a Firestore index. Check server logs or browser console for a Firebase link to create it (usually on 'userEmail' (asc) and 'bookedAt' (desc) for the 'serviceBookings' collection).";
    }
    // Log the detailed message that will be thrown
    console.error("getUserBookings: Throwing error with detailed message:", detailMessage);
    throw new Error(detailMessage);
  }
}

// Helper to check if current user (based on email) is an admin
async function isUserAdmin(currentUserEmail: string | null | undefined): Promise<boolean> {
  if (!currentUserEmail) return false;
  return ADMIN_EMAIL.includes(currentUserEmail); // ADMIN_EMAIL is an array from constants.ts
}


// Fetches all bookings (for admin dashboard)
export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  console.log(`getAllBookings: Attempting as user: ${currentUserEmail || 'undefined/unauthenticated'}`);
  
  const isClientIdentifiedAsAdmin = await isUserAdmin(currentUserEmail);
  if (!isClientIdentifiedAsAdmin) {
    const denyMsg = `Unauthorized: You (email: ${currentUserEmail}) do not have permission to view all bookings (client-side check based on ADMIN_EMAIL constant). Ensure your email is listed in ADMIN_EMAIL in src/lib/constants.ts AND your Firestore rules' isAdmin() function correctly identifies you.`;
    console.warn(`getAllBookings: ${denyMsg}`);
    return { error: denyMsg };
  }

  console.log(`getAllBookings: Admin ${currentUserEmail} attempting to fetch all bookings from Firestore.`);
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, orderBy('bookedAt', 'desc')); // Order all bookings by date

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    console.log(`getAllBookings: Admin ${currentUserEmail} successfully fetched ${bookings.length} bookings.`);
    return bookings;
  } catch (error: any) {
    console.error(`getAllBookings: Raw error object from Firestore for admin ${currentUserEmail}:`, error);
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';
    console.error(`getAllBookings: Error fetching all bookings from Firestore for admin ${currentUserEmail}. Code: ${errorCode}, Message: ${errorMessage}`);
    let detailedError = `Failed to fetch bookings from database: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        detailedError += " This often means 'request.auth' was null for the admin user in Firestore rules, or the rules do not grant 'list' permission to admins (via isAdmin() in rules) for the 'serviceBookings' collection. Verify Firestore rules and ensure the admin user is properly authenticated when this action runs.";
    } else if (errorCode === 'failed-precondition' && errorMessage.toLowerCase().includes('index')) {
        detailedError += " A Firestore index is required for this query. Check server logs or browser console for a Firebase link to create it (usually on 'bookedAt' (desc) for 'serviceBookings' collection).";
    }
    detailedError += " Ensure the isAdmin() function in your Firestore rules (Firebase Console -> Firestore -> Rules) correctly includes your admin email and allows 'list' and 'read' operations on 'serviceBookings'. Also check server logs (terminal or Firebase Functions logs) for specific Firebase errors (e.g., missing indexes).";
    console.error("getAllBookings: Returning error object:", { error: detailedError });
    return { error: detailedError };
  }
}

// Updates the status of a specific booking (for admin use)
export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  currentUserEmail: string | null | undefined
): Promise<{ success: boolean; message: string }> {
  console.log(`updateBookingStatus: Attempting by user: ${currentUserEmail || 'undefined/unauthenticated'} for booking ${bookingId} to status ${newStatus}`);
  
  const isClientIdentifiedAsAdmin = await isUserAdmin(currentUserEmail);
  if (!isClientIdentifiedAsAdmin) {
    const denyMsg = `Unauthorized: You (email: ${currentUserEmail}) do not have permission to update booking status (client-side check).`;
    console.warn(`updateBookingStatus: ${denyMsg}`);
    return { success: false, message: denyMsg };
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
    console.error(`updateBookingStatus: Raw error object from Firestore for booking ${bookingId} by admin ${currentUserEmail}:`, error);
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';
    console.error(`updateBookingStatus: Error updating booking status in Firestore for booking ${bookingId} by admin ${currentUserEmail}. Code: ${errorCode}, Message: ${errorMessage}`);
    let message = `Failed to update booking status: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        message += " This indicates a Firestore permission issue for the admin user. Ensure Firestore rules allow admins to update 'serviceBookings' documents and 'request.auth' is not null when this action runs.";
    }
    return { success: false, message };
  }
}
