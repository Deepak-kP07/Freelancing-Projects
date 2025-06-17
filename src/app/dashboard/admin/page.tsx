
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getAllBookings, updateBookingStatus } from '@/app/services/actions';
import type { ServerBooking } from '@/app/services/actions'; 
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle, Loader2, Users, RefreshCcw, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [bookings, setBookings] = useState<ServerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;

  const fetchBookings = useCallback(async () => {
    console.log('AdminDashboard: Attempting to fetch bookings. User email:', authUser?.email, 'Is client-side admin:', isAdmin);
    if (!authUser || !isAdmin) { // Ensure user is authenticated and is an admin
        let accessDeniedReason = "Access Denied: You must be logged in as an admin to view this page.";
        if (authUser && !isAdmin) accessDeniedReason = "Access Denied: You do not have permission to view this page.";
        else if (!authUser) accessDeniedReason = "Access Denied: You must be logged in to view this page.";
        setError(accessDeniedReason);
        setIsLoading(false);
        setBookings([]); // Clear bookings if access is denied
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Pass the authenticated admin's email to the server action for logging/verification if needed by the action.
      const result = await getAllBookings(authUser.email); 
      if ('error' in result) {
        let detailedError = result.error;
        if (detailedError.includes("Failed to fetch bookings from database")) {
            detailedError += " Ensure Firestore security rules grant 'list' permission on 'serviceBookings' to admins and check server logs (terminal or Firebase Functions logs) for specific Firebase errors (e.g., permissions, missing indexes).";
        }
        setError(detailedError);
        setBookings([]);
      } else {
        setBookings(result as ServerBooking[]);
      }
    } catch (err: any) {
      console.error("Error fetching all bookings in AdminDashboardPage:", err);
      setError(`Failed to load bookings. An unexpected error occurred: ${err.message || 'Unknown error'}. Check browser console and server logs.`);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, authUser]); // authUser is now a direct dependency

  useEffect(() => {
    if (!authLoading) { // Only proceed once auth state is resolved
        if (authUser && isAdmin) {
            fetchBookings();
        } else {
            setIsLoading(false); // Stop loading if not admin or not logged in
            let accessDeniedReason = "Access Denied: You must be logged in as an admin to view this page.";
            if (authUser && !isAdmin) accessDeniedReason = "Access Denied: You do not have permission to view this page. Ensure your email is in ADMIN_EMAIL constant and your Firestore rules correctly identify you as an admin.";
            else if (!authUser) accessDeniedReason = "Access Denied: You must be logged in to view this page.";
            setError(accessDeniedReason);
            setBookings([]); // Clear bookings
            console.warn("AdminDashboard: Access denied. User:", authUser?.email, "Is admin (client-side):", isAdmin);
        }
    }
  }, [authLoading, isAdmin, authUser, fetchBookings]);


  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (!authUser?.email) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to perform this action.', variant: 'destructive' });
        return;
    }
    try {
      const result = await updateBookingStatus(bookingId, newStatus, authUser.email);
      toast({
        title: result.success ? 'Status Updated' : 'Update Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        setBookings(prevBookings =>
          prevBookings.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    }
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status.toLowerCase().includes('completed')) return 'default';
    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('assigned') || status.toLowerCase().includes('scheduled')) return 'secondary';
    if (status.toLowerCase().includes('cancelled')) return 'destructive';
    return 'outline';
 };

  if (authLoading || (isLoading && !error && (!authUser || !isAdmin))) { 
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (error && !isLoading) { // This will now also show for access denied errors from useEffect
     return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">{error.startsWith("Access Denied") ? "Access Denied" : "Error Loading Bookings"}</h1>
        <p className="text-destructive px-4">{error}</p>
        {!error.startsWith("Access Denied") && <Button onClick={fetchBookings} className="mt-4">Try Again</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="h-8 w-8"/> Admin Dashboard
        </h1>
        <Button variant="outline" onClick={fetchBookings} disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Bookings
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="text-accent" /> All Service Bookings
          </CardTitle>
          <CardDescription>
            Manage and update the status of all customer service bookings. Total: {bookings.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && bookings.length === 0 && !error && <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {!isLoading && !error && bookings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-3 text-primary" />
              <p className="text-lg">No service bookings found in the system.</p>
            </div>
          )}
          {!isLoading && !error && bookings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Booking ID</TableHead>
                  <TableHead className="w-[150px]">Booked At</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => ( 
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.displayId}</TableCell>
                    <TableCell className="text-xs">{format(new Date(booking.bookedAt), "dd MMM, yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.email}</div>
                      <div className="text-xs text-muted-foreground">{booking.phone}</div>
                    </TableCell>
                    <TableCell>{booking.serviceType}</TableCell>
                    <TableCell>{format(new Date(booking.preferredDate), 'dd MMM, yyyy')} at {booking.preferredTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={booking.status}
                          onValueChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_STATUSES.map(status => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge variant={getStatusVariant(booking.status)} className="text-xs whitespace-nowrap hidden sm:inline-flex">{booking.status}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

