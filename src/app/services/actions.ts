
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
  bookedAt: Date; // Changed to Date for client-side, was Firestore Timestamp from server
  preferredDate: Date; // Changed to Date for client-side, was Firestore Timestamp from server
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

// Firestore counter for sequential booking IDs
const COUNTER_COLLECTION = 'counters';
const SERVICE_BOOKING_COUNTER_DOC = 'serviceBookingCounter';

async function getNextBookingDisplayId(): Promise<string> {
  const counterRef = doc(db, COUNTER_COLLECTION, SERVICE_BOOKING_COUNTER_DOC);
  let newIdNumber = 1;

  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        transaction.update(counterRef, { currentId: newIdNumber });
      }
    });
    return `OZN${String(newIdNumber).padStart(4, '0')}`;
  } catch (error: any) {
    console.error("Firestore transaction for booking ID generation failed.");
    console.error("Error details:", error);
    if (error.code && (error.code === 'permission-denied' || error.code === 'unauthenticated')) {
        console.error("This is likely a Firestore Security Rule issue. Ensure that authenticated users have read AND write permissions on the document '", COUNTER_COLLECTION, "/", SERVICE_BOOKING_COUNTER_DOC, "'.");
    }
    throw new Error("Could not generate booking ID.");
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
      preferredDate: formData.get('preferredDate'), // This will be string from FormData
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
        displayId = await getNextBookingDisplayId();
    } catch (idError) {
        // The detailed error is already logged in getNextBookingDisplayId
        return {
            message: 'Failed to generate booking ID. Please try again.', // This is the message the user is seeing
            success: false,
        };
    }

    const newBookingData = {
      ...validatedFields.data,
      displayId,
      userEmail: validatedFields.data.email,
      status: SERVICE_STATUSES[0], // Default status: Pending Confirmation
      bookedAt: serverTimestamp(), // Use Firestore server timestamp
      preferredDate: Timestamp.fromDate(validatedFields.data.preferredDate), // Convert Date to Firestore Timestamp
    };

    await addDoc(collection(db, 'serviceBookings'), newBookingData);
    console.log('New Booking Added to Firestore with Display ID:', displayId);

    return { message: 'Service booked successfully! We will contact you shortly to confirm.', success: true };
  } catch (error) {
    // This catch block is for errors outside of getNextBookingDisplayId
    console.error('Service booking error (outside ID generation):', error);
    return { message: 'An unexpected error occurred. Please try again later.', success: false };
  }
}

async function isAdminCheck(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  return ADMIN_EMAIL.includes(userEmail);
}

// Helper to convert Firestore Timestamps to JS Date objects for client-side consumption
const processBookingDoc = (docSnapshot: any): ServerBooking => {
    const data = docSnapshot.data();
    return {
      ...data,
      id: docSnapshot.id, // Firestore document ID
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
  } catch (error) {
    console.error("Error fetching user bookings from Firestore: ", error);
    return [];
  }
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  if (!await isAdminCheck(currentUserEmail)) {
    return { error: "Unauthorized: You do not have permission to view all bookings." };
  }
  console.log('Admin fetching all bookings from Firestore');
  const bookingsCol = collection(db, 'serviceBookings');
  const q = query(bookingsCol, orderBy('bookedAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docSnap => processBookingDoc(docSnap));
    return bookings;
  } catch (error) {
    console.error("Error fetching all bookings from Firestore: ", error);
    return { error: "Failed to fetch bookings from database." };
  }
}

export async function updateBookingStatus(
  bookingId: string, // This is Firestore document ID
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
    console.log(`Admin updated booking ${bookingId} to status ${newStatus} in Firestore`);
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (error) {
    console.error("Error updating booking status in Firestore: ", error);
    return { success: false, message: "Failed to update booking status in database." };
  }
}

