
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getUserBookings } from '@/app/services/actions'; // Updated import path
import type { ServerBooking } from '@/app/services/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, ShoppingBag, CalendarDays, Clock, Tag, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function UserDashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [bookings, setBookings] = useState<ServerBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.email) {
      setIsLoadingBookings(true);
      setError(null);
      getUserBookings(authUser.email)
        .then(data => {
          setBookings(data);
        })
        .catch(err => {
          console.error("Error fetching user bookings:", err);
          setError("Failed to load your service bookings. Please try again later.");
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else if (!authLoading) {
      // If not loading and no email, means user is not logged in or email is missing
      setIsLoadingBookings(false);
    }
  }, [authUser, authLoading]);

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!authUser) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status.toLowerCase().includes('completed')) return 'default'; // Primary color for completed
    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('assigned')) return 'secondary'; // Secondary for in progress
    if (status.toLowerCase().includes('cancelled')) return 'destructive';
    return 'outline'; // Outline for pending, scheduled
 };


  return (
    <div className="space-y-8 py-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Your Dashboard</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="text-accent" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={authUser.photoURL || undefined} alt={authUser.displayName || 'User'} />
              <AvatarFallback>{authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : <User size={24} />}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{authUser.displayName || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{authUser.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="text-accent" /> Your Service Bookings
          </CardTitle>
          <CardDescription>
            View the status and details of your scheduled services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings && <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {error && <p className="text-destructive text-center py-4">{error}</p>}
          {!isLoadingBookings && !error && bookings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-3" />
              <p>You have no service bookings yet.</p>
            </div>
          )}
          {!isLoadingBookings && !error && bookings.length > 0 && (
            <div className="space-y-6">
              {bookings.sort((a,b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()).map(booking => (
                <Card key={booking.id} className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{booking.serviceType}</CardTitle>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </div>
                     <p className="text-xs text-muted-foreground pt-1">Booked on: {format(new Date(booking.bookedAt), "PPP p")}</p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>Preferred Date: {format(new Date(booking.preferredDate), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Preferred Time: {booking.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>Name: {booking.name}</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Booking ID: <span className="font-mono text-xs bg-muted p-1 rounded">{booking.id.substring(0,8)}...</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
