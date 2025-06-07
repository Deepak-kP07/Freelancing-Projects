
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getAllBookings, updateBookingStatus } from '@/app/services/actions'; // Updated import path
import type { ServerBooking } from '@/app/services/actions';
import { ADMIN_EMAIL, SERVICE_STATUSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle, Loader2, Users, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [bookings, setBookings] = useState<ServerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;

  const fetchBookings = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      // Pass the current user's email to getAllBookings for the server-side admin check
      const result = await getAllBookings(authUser?.email);
      if ('error' in result) {
        setError(result.error);
        setBookings([]);
      } else {
        setBookings(result as ServerBooking[]);
      }
    } catch (err) {
      console.error("Error fetching all bookings:", err);
      setError("Failed to load bookings.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchBookings();
    } else if (!authLoading && !isAdmin) {
      setIsLoading(false);
      setError("Access Denied: You do not have permission to view this page.");
    }
  }, [authLoading, isAdmin, authUser]); // authUser added as dependency for fetchBookings call

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      // Pass the current user's email to updateBookingStatus for the server-side admin check
      const result = await updateBookingStatus(bookingId, newStatus, authUser?.email);
      toast({
        title: result.success ? 'Status Updated' : 'Update Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        // Refresh bookings list optimistically or by re-fetching
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
    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('assigned')) return 'secondary';
    if (status.toLowerCase().includes('cancelled')) return 'destructive';
    return 'outline';
 };


  if (authLoading || (isAdmin && isLoading && bookings.length === 0 && !error)) { // Show loader if admin is loading initial data and no error yet
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
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
          {error && !isLoading && <p className="text-destructive text-center py-4">{error}</p>}
          {!isLoading && !error && bookings.length === 0 && (
            <p className="text-muted-foreground text-center py-10">No service bookings found.</p>
          )}
          {!isLoading && !error && bookings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Booked Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.sort((a,b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()).map((booking) => (
                  <TableRow key={booking.id}>
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
