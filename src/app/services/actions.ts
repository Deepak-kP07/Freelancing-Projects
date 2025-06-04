'use server';

import { z } from 'zod';

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

    // Simulate saving to database
    console.log('Booking Data:', validatedFields.data);
    // In a real app, you'd save to Firebase Firestore or another DB here.
    // Example: await db.collection('bookings').add(validatedFields.data);

    return { message: 'Service booked successfully! We will contact you shortly.', success: true };
  } catch (error) {
    console.error('Service booking error:', error);
    return { message: 'An unexpected error occurred. Please try again later.', success: false };
  }
}
