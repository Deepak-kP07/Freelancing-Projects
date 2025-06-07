
'use server';

import { z } from 'zod';
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';

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

// Type for stored bookings, including ID, user email and status
export type ServerBooking = BookingFormData & {
  id: string;
  userEmail: string; // Using email as user identifier
  status: string;
  bookedAt: Date;
};

// In-memory store for bookings (for prototype purposes) - NOT EXPORTED
let serverBookings: ServerBooking[] = [];
let bookingIdCounter = 0; // Counter for sequential booking IDs

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
    
    bookingIdCounter++;
    const formattedCounter = String(bookingIdCounter).padStart(4, '0');

    const newBooking: ServerBooking = {
      ...validatedFields.data,
      id: `OZN${formattedCounter}`, // Booking ID format: OZNXXXX
      userEmail: validatedFields.data.email, 
      status: SERVICE_STATUSES[0], 
      bookedAt: new Date(),
    };

    serverBookings.push(newBooking);
    console.log('New Booking Added:', newBooking);
    console.log('All Bookings:', serverBookings);


    return { message: 'Service booked successfully! We will contact you shortly to confirm.', success: true };
  } catch (error) {
    console.error('Service booking error:', error);
    return { message: 'An unexpected error occurred. Please try again later.', success: false };
  }
}

async function isAdminCheck(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  // Check if userEmail is in the ADMIN_EMAIL array
  return ADMIN_EMAIL.includes(userEmail);
}


export async function getUserBookings(userEmail: string): Promise<ServerBooking[]> {
  console.log(`Fetching bookings for email: ${userEmail}`);
  const bookings = serverBookings.filter(booking => booking.userEmail === userEmail);
  console.log(`Found bookings for ${userEmail}:`, bookings);
  // Return a deep copy to avoid issues with RSC and client components if objects are mutated
  return JSON.parse(JSON.stringify(bookings)); 
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  if (!await isAdminCheck(currentUserEmail)) {
    return { error: "Unauthorized: You do not have permission to view all bookings." };
  }
  console.log('Admin fetching all bookings:', serverBookings);
  // Return a deep copy
  return JSON.parse(JSON.stringify(serverBookings)); 
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

  const bookingIndex = serverBookings.findIndex(booking => booking.id === bookingId);

  if (bookingIndex === -1) {
    return { success: false, message: "Booking not found." };
  }

  serverBookings[bookingIndex].status = newStatus;
  console.log(`Admin updated booking ${bookingId} to status ${newStatus}`);
  console.log('Current serverBookings:', serverBookings);

  return { success: true, message: `Booking status updated to ${newStatus}.` };
}
