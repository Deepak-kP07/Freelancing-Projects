
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getAllBookings, updateBookingStatus } from '@/app/services/actions';
import type { ServerBooking } from '@/app/services/actions';
import { ADMIN_EMAIL, SERVICE_STATUSES, WHATSAPP_PHONE_NUMBER } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle, Loader2, Users, RefreshCcw, Info, ChevronLeft, ChevronRight, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const RECORDS_PER_PAGE = 10;

export default function AdminDashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [bookings, setBookings] = useState<ServerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;

  const fetchBookings = useCallback(async () => {
    if (!authUser || !isAdmin) {
        let accessDeniedReason = "Access Denied: You must be logged in as an admin to view this page.";
        if (authUser && !isAdmin) accessDeniedReason = "Access Denied: You do not have permission to view this page.";
        else if (!authUser) accessDeniedReason = "Access Denied: You must be logged in to view this page.";
        setError(accessDeniedReason);
        setIsLoading(false);
        setBookings([]);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllBookings(authUser.email); 
      if ('error' in result) {
        let detailedError = `Failed to fetch bookings: ${result.error}.`;
         if (result.error.toLowerCase().includes("permission-denied")) {
            detailedError += " This could be due to Firestore rules not granting 'list' access to admins.";
        }
        setError(detailedError);
        setBookings([]);
      } else {
        setBookings(result as ServerBooking[]);
      }
    } catch (err: any) {
      console.error("Error fetching all bookings in AdminDashboardPage:", err);
      setError(`Failed to load bookings. An unexpected error occurred: ${err.message || 'Unknown error'}.`);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, authUser]);

  useEffect(() => {
    if (!authLoading) { 
        if (authUser && isAdmin) {
            fetchBookings();
        } else {
            setIsLoading(false); 
            let accessDeniedReason = "Access Denied: You must be logged in as an admin to view this page.";
            if (authUser && !isAdmin) accessDeniedReason = "Access Denied: You do not have permission to view this page.";
            else if (!authUser) accessDeniedReason = "Access Denied: You must be logged in to view this page.";
            setError(accessDeniedReason);
            setBookings([]); 
        }
    }
  }, [authLoading, isAdmin, authUser, fetchBookings]);

  useEffect(() => {
    const newTotalPages = Math.ceil(bookings.length / RECORDS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && bookings.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [bookings, currentPage]);


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

  const totalPages = Math.ceil(bookings.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentBookings = bookings.slice(startIndex, endIndex);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleRefreshBookings = () => {
    setCurrentPage(1);
    fetchBookings();
  };
  
  const generateAdminWhatsAppMessage = (booking: ServerBooking) => {
    let message = `Hello ${booking.name},\n\nThis is regarding your Ozonxt service booking (ID: ${booking.displayId} for ${booking.serviceType}).\n\n`;
    return encodeURIComponent(message);
  };


  if (authLoading || (isLoading && !error && (!authUser || !isAdmin))) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (error && !isLoading) { 
     return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">{error.startsWith("Access Denied") ? "Access Denied" : "Error Loading Bookings"}</h1>
        <p className="text-destructive px-4 whitespace-pre-wrap">{error}</p>
        {!error.startsWith("Access Denied") && <Button onClick={handleRefreshBookings} className="mt-4">Try Again</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="h-8 w-8"/> Admin Dashboard
        </h1>
        <Button variant="outline" onClick={handleRefreshBookings} disabled={isLoading} className="w-full sm:w-auto">
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
              <p className="text-lg">No service bookings found.</p>
            </div>
          )}
          {!isLoading && !error && bookings.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] hidden md:table-cell">Booking ID</TableHead>
                    <TableHead className="w-[150px] hidden lg:table-cell">Booked At</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Service</TableHead>
                    <TableHead className="hidden md:table-cell">Preferred Date</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs hidden md:table-cell">{booking.displayId}</TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">{format(new Date(booking.bookedAt), "dd MMM, yyyy HH:mm")}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{booking.serviceType}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(booking.preferredDate), 'dd MMM, yyyy')} at {booking.preferredTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={booking.status}
                            onValueChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                          >
                            <SelectTrigger className="h-8 text-xs w-full">
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
                          <Badge variant={getStatusVariant(booking.status)} className="text-xs whitespace-nowrap hidden xl:inline-flex">{booking.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-2">
                           <Button asChild variant="outline" size="icon" className="h-8 w-8 sm:h-auto sm:w-auto sm:px-2">
                             <a href={`tel:${booking.phone}`}>
                               <Phone className="h-4 w-4" /> <span className="hidden sm:ml-1 sm:inline text-xs">Call</span>
                             </a>
                           </Button>
                           <Button asChild variant="outline" size="icon" className="h-8 w-8 sm:h-auto sm:w-auto sm:px-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30">
                            <a href={`https://wa.me/${booking.phone.startsWith('+') ? booking.phone : WHATSAPP_PHONE_NUMBER.substring(0,3) + booking.phone.replace(/[^0-9]/g, '')}?text=${generateAdminWhatsAppMessage(booking)}`} target="_blank" rel="noopener noreferrer">
                               <MessageSquare className="h-4 w-4 text-green-600" /> <span className="hidden sm:ml-1 sm:inline text-xs text-green-700">Chat</span>
                             </a>
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <CardFooter className="justify-between pt-6 mt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
