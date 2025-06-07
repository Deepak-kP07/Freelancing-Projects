
'use server';

import { z } from 'zod';
import { SERVICE_STATUSES } from '@/lib/constants';

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

// In-memory store for bookings (for prototype purposes)
// This will be reset every time the server restarts.
// In a real app, use a database like Firestore.
export let serverBookings: ServerBooking[] = [];

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

    const newBooking: ServerBooking = {
      ...validatedFields.data,
      id: crypto.randomUUID(), // Generate a unique ID
      userEmail: validatedFields.data.email, // Associate with user's email
      status: SERVICE_STATUSES[0], // Initial status
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
