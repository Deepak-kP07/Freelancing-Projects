
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getUserBookings } from '@/app/services/actions';
import type { ServerBooking } from '@/app/services/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, ShoppingBag, CalendarDays, Clock, AlertCircle, Loader2, Info, PlusCircle, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { WHATSAPP_PHONE_NUMBER } from '@/lib/constants';

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
      console.log(`UserDashboardPage: Calling getUserBookings for user: ${authUser.email}`);
      getUserBookings(authUser.email)
        .then(data => {
          setBookings(data);
        })
        .catch(err => {
          console.error("UserDashboardPage: Error received from getUserBookings:", err);
          setError(`Failed to load your bookings: ${err.message}. Check console for details.`);
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else if (!authLoading && !authUser) {
      setIsLoadingBookings(false);
      setError("Please log in to view your dashboard.");
      console.log("UserDashboardPage: No authenticated user found. Auth loading state:", authLoading);
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

  const generateWhatsAppMessage = (booking: ServerBooking) => {
    let message = "Hello Ozonxt,\n\n";
    message += "I have a question about my service booking:\n";
    message += `Booking ID: ${booking.displayId}\n`;
    message += `Service Type: ${booking.serviceType}\n`;
    message += `Scheduled For: ${format(new Date(booking.preferredDate), 'PPP')} at ${booking.preferredTime}\n\n`;
    message += "My question is: [Please type your question here]";
    return encodeURIComponent(message);
  };


  return (
    <div className="space-y-8 py-8">
      <div className="w-full text-center md:text-left">
        <h1 className="text-3xl font-headline font-bold text-primary">Your Dashboard</h1>
      </div>

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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {error && !isLoadingBookings ? (
            <div className="flex-grow">
              <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                <AlertCircle className="h-5 w-5" /> Error Loading Bookings
              </CardTitle>
              <CardDescription className="text-destructive whitespace-pre-wrap mt-1">
                {error}
              </CardDescription>
            </div>
          ) : (
            <div className="flex-grow">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingBag className="text-accent" /> Your Service Bookings
              </CardTitle>
              <CardDescription className="mt-1">
                View the status and details of your scheduled services.
              </CardDescription>
            </div>
          )}
          <Link href="/services" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              <PlusCircle size={18} className="mr-2"/> {bookings.length > 0 ? 'Book Another Service' : 'Book New Service'}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingBookings && (
            <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          )}
          
          {!isLoadingBookings && !error && bookings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p className="text-lg mb-2">You have no service bookings yet.</p>
              <p className="mb-6">Book one to see your updates here!</p>
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
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <a href={`tel:${WHATSAPP_PHONE_NUMBER}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Us
                      </a>
                    </Button>
                    <Button asChild variant="default" size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                      <a href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${generateWhatsAppMessage(booking)}`} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat on WhatsApp
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
