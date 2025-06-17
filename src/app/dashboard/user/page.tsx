
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getUserBookings } from '@/app/services/actions';
import type { ServerBooking } from '@/app/services/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, ShoppingBag, CalendarDays, Clock, Tag, AlertCircle, Loader2, Wrench, Info } from 'lucide-react';
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
          console.error("Error fetching user bookings in UserDashboardPage:", err);
          // err.message from actions.ts is already "Failed to fetch your bookings: ${rawError.message} (Code: ${rawError.code}). ${specificGuidance}"
          // The user wants the final error string to be:
          // "Failed to load your bookings: Failed to fetch your bookings: ... . Check console for details."
          // So, we prepend "Failed to load your bookings: " and append ". Check console for details." to the message from actions.ts
          setError(`Failed to load your bookings: ${err.message}. Check console for details.`);
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else if (!authLoading && !authUser) {
      setIsLoadingBookings(false);
      setError("Please log in to view your dashboard.");
    }
  }, [authUser, authLoading]);

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!authUser && !authLoading) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">{error || "Please log in to view your dashboard."}</p>
         <Link href="/login" passHref>
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }
  
  if (!authUser && authLoading) { 
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }


  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status.toLowerCase().includes('completed')) return 'default';
    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('assigned') || status.toLowerCase().includes('scheduled')) return 'secondary';
    if (status.toLowerCase().includes('cancelled')) return 'destructive';
    return 'outline';
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
          {authUser ? (
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
          ) : (
            <p>Loading profile...</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          {error && !isLoadingBookings ? (
            <>
              <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                <AlertCircle className="h-5 w-5" /> Error Loading Bookings
              </CardTitle>
              <CardDescription className="text-destructive whitespace-pre-wrap">
                {error}
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingBag className="text-accent" /> Your Service Bookings
              </CardTitle>
              <CardDescription>
                View the status and details of your scheduled services.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingBookings && (
            <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          )}
          
          {/* Error display is now handled in CardHeader, so no need for a separate block here unless a different style is desired. */}
          {/* For example, if you still wanted a larger, centered error icon in content despite header message:
            {error && !isLoadingBookings && (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive/70 mb-3" />
                <p className="text-sm text-muted-foreground">Details provided in the header above.</p>
              </div>
            )}
          */}
          
          {!isLoadingBookings && !error && bookings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p className="text-lg mb-2">You have no service bookings yet.</p>
              <p className="mb-6">Book one to see your updates here!</p>
              <Link href="/services" passHref>
                <Button>Book a Service</Button>
              </Link>
            </div>
          )}
          {!isLoadingBookings && !error && bookings.length > 0 && (
            <div className="space-y-6">
              {bookings.map(booking => (
                <Card key={booking.id} className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{booking.serviceType}</CardTitle>
                        <p className="text-xs text-accent font-mono mt-1">Booking ID: {booking.displayId}</p>
                      </div>
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
                      <span>Internal ID: <span className="font-mono text-xs bg-muted p-1 rounded">{booking.id.substring(0,8)}...</span></span>
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
    
