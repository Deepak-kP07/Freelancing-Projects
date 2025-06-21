
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
  serverTimestamp,
  orderBy,
  Timestamp,
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

// Type for user data retrieved from Firestore
export type ServerUser = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
};

// Interface for Contact Form Data
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string; // Subject is now optional
  message: string;
}


const processBookingDoc = (docSnapshot: any): ServerBooking => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      displayId: data.displayId || `OZN-OLD-${docSnapshot.id.substring(0,4)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate instanceof Timestamp ? data.preferredDate.toDate() : new Date(data.preferredDate),
      preferredTime: data.preferredTime,
      userEmail: data.userEmail,
      status: data.status,
      bookedAt: data.bookedAt instanceof Timestamp ? data.bookedAt.toDate() : new Date(data.bookedAt || Date.now()),
    };
};

export async function createServiceBooking(
  formData: BookingFormData,
  userEmail: string
): Promise<{ success: boolean; message: string; bookingId?: string; error?: string }> {
  try {
    // Generate a user-friendly display ID (client-side generation)
    const displayId = `OZN-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newBookingData = {
      ...formData,
      userEmail: userEmail,
      status: 'Pending Confirmation', // Initial status
      bookedAt: serverTimestamp(), // Firestore server timestamp
      displayId: displayId,
      preferredDate: Timestamp.fromDate(new Date(formData.preferredDate)), // Convert JS Date to Firestore Timestamp
    };

    const docRef = await addDoc(collection(db, 'serviceBookings'), newBookingData);
    return {
      success: true,
      message: 'Service booked successfully! We will contact you shortly to confirm.',
      bookingId: docRef.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to book service. Please try again.',
      error: error.message || 'Unknown Firestore error.',
    };
  }
}


export async function getUserBookings(userEmail: string): Promise<ServerBooking[]> {
  if (!userEmail) {
      return [];
  }
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, where('userEmail', '==', userEmail), orderBy('bookedAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    return bookings;
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';

    let detailMessage = `Failed to fetch your bookings: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        detailMessage += " This often means Firestore rules don't allow users to read bookings where 'userEmail' matches their own. Check your Firestore rules.";
    } else if (errorCode === 'failed-precondition' && (errorMessage.toLowerCase().includes('index') || errorMessage.toLowerCase().includes('requires an index'))) {
        detailMessage += " This query requires a Firestore index. Your console logs (browser or server-side if applicable) should contain a direct link to create it in the Firebase console (e.g., for 'userEmail' (asc) and 'bookedAt' (desc) on the 'serviceBookings' collection). Please click that link and create the index. It may take a few minutes to enable after creation.";
    }
    throw new Error(detailMessage);
  }
}

async function isUserAdmin(currentUserEmail: string | null | undefined): Promise<boolean> {
  if (!currentUserEmail) return false;
  return ADMIN_EMAIL.includes(currentUserEmail); 
}


export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  const isClientIdentifiedAsAdmin = await isUserAdmin(currentUserEmail);
  if (!isClientIdentifiedAsAdmin) {
    const denyMsg = `Unauthorized: You (email: ${currentUserEmail}) do not have permission to view all bookings (client-side check based on ADMIN_EMAIL constant). Ensure your email is listed in ADMIN_EMAIL in src/lib/constants.ts.`;
    return { error: denyMsg };
  }

  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, orderBy('bookedAt', 'desc')); 

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    return bookings;
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';
    let detailedError = `Failed to fetch bookings from database: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        detailedError += " This often means Firestore rules do not grant 'list' permission to admins for the 'serviceBookings' collection. Verify Firestore rules.";
    } else if (errorCode === 'failed-precondition' && (errorMessage.toLowerCase().includes('index') || errorMessage.toLowerCase().includes('requires an index'))) {
        detailedError += " A Firestore index is required for this query (likely on 'bookedAt' (desc) for the 'serviceBookings' collection for admin view). Your console logs or Firebase console should provide a link to create it. Please click that link and create the index. It may take a few minutes to enable.";
    }
    detailedError += " Ensure the isAdmin() function in your Firestore rules (Firebase Console -> Firestore -> Rules) correctly includes your admin email and allows 'list' and 'read' operations on 'serviceBookings'.";
    return { error: detailedError };
  }
}

export async function getAllUsers(currentUserEmail: string | null | undefined): Promise<ServerUser[] | { error: string }> {
  const isClientIdentifiedAsAdmin = await isUserAdmin(currentUserEmail);
  if (!isClientIdentifiedAsAdmin) {
    const denyMsg = `Unauthorized: You (email: ${currentUserEmail}) do not have permission to view all users.`;
    return { error: denyMsg };
  }

  const usersCol = collection(db, 'users');
  try {
    const querySnapshot = await getDocs(usersCol);
    const users = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
      } as ServerUser;
    });
    return users;
  } catch (error: any) {
    let detailedError = `Failed to fetch users from database: ${error.message}.`;
    if (error.code === 'permission-denied') {
        detailedError += " This means Firestore rules do not grant 'list' permission to admins for the 'users' collection. Verify your Firestore rules.";
    }
    return { error: detailedError };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  currentUserEmail: string | null | undefined
): Promise<{ success: boolean; message: string }> {
  const isClientIdentifiedAsAdmin = await isUserAdmin(currentUserEmail);
  if (!isClientIdentifiedAsAdmin) {
    const denyMsg = `Unauthorized: You (email: ${currentUserEmail}) do not have permission to update booking status (client-side check).`;
    return { success: false, message: denyMsg };
  }

  if (!SERVICE_STATUSES.includes(newStatus)) {
    return { success: false, message: "Invalid status value provided." };
  }

  const bookingRef = doc(db, 'serviceBookings', bookingId);

  try {
    await updateDoc(bookingRef, { status: newStatus });
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN_CODE';
    const errorMessage = error.message || 'Unknown Firestore error.';
    let message = `Failed to update booking status: ${errorMessage} (Code: ${errorCode}).`;
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        message += " This indicates a Firestore permission issue. Ensure Firestore rules allow admins to update 'serviceBookings' documents.";
    }
    return { success: false, message };
  }
}

// Function to save contact form submissions
export async function saveContactMessage(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const contactSubmissionsRef = collection(db, 'contactSubmissions');
    await addDoc(contactSubmissionsRef, {
      ...data, // Spread the data, subject will be included if present
      submittedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save message due to a database error.',
    };
  }
}
