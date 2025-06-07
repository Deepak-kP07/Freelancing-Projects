
'use server';

import { serverBookings, type ServerBooking } from '@/app/services/actions'; // Assuming serverBookings is exported
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { auth } from '@/lib/firebase'; // To get current user for some checks if needed (not directly here for now)
// For a real app, you'd use Firebase Admin SDK or similar to securely check user roles or Firestore queries.

// Helper to simulate checking if the current user is an admin
// This is a placeholder and not secure for production.
// In a real app, you'd verify this on the server using a secure method (e.g., custom claims).
async function isAdminCheck(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  return userEmail === ADMIN_EMAIL;
}


export async function getUserBookings(userEmail: string): Promise<ServerBooking[]> {
  // In a real app, this would query a database like Firestore:
  // const userBookings = await db.collection('bookings').where('userEmail', '==', userEmail).get();
  // For prototype, filter the in-memory array
  console.log(`Fetching bookings for email: ${userEmail}`);
  const bookings = serverBookings.filter(booking => booking.userEmail === userEmail);
  console.log(`Found bookings for ${userEmail}:`, bookings);
  return JSON.parse(JSON.stringify(bookings)); // Ensure plain objects are returned
}

export async function getAllBookings(currentUserEmail: string | null | undefined): Promise<ServerBooking[] | { error: string }> {
  if (!await isAdminCheck(currentUserEmail)) {
    return { error: "Unauthorized: You do not have permission to view all bookings." };
  }
  // In a real app, this would fetch all bookings from the database.
  // For prototype, return the in-memory array
  console.log('Admin fetching all bookings:', serverBookings);
  return JSON.parse(JSON.stringify(serverBookings)); // Ensure plain objects are returned
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
