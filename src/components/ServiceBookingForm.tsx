
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_TYPES } from '@/lib/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import type React from 'react';

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(100, { message: 'Name must be 100 characters or less.' }),
  email: z.string().email({ message: 'Invalid email address.' }).max(100, { message: 'Email must be 100 characters or less.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).max(15, { message: 'Phone number must be 15 digits or less.' }).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format." }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  preferredDate: z.date({ required_error: "Please pick a date." }),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time.' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      {pending ? 'Booking...' : 'Book Service Now'}
    </Button>
  );
}

export default function ServiceBookingForm() {
  const { toast } = useToast();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  // const formRef = useRef<HTMLFormElement>(null); // Not strictly needed if RHF handles data passing

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: authUser?.displayName || '',
      email: authUser?.email || '',
      phone: '',
      serviceType: '',
      preferredDate: undefined,
      preferredTime: '',
    },
  });

  useEffect(() => {
    if (authUser) {
      if (authUser.displayName && !form.getValues('name')) {
        form.setValue('name', authUser.displayName, { shouldValidate: true });
      }
      if (authUser.email && !form.getValues('email')) {
        form.setValue('email', authUser.email, { shouldValidate: true });
      }
    }
  }, [authUser, form]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!authUser) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setIsSubmitting(true);

    const isValid = await form.trigger(); // Trigger validation for all RHF fields
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // If RHF validation passes, extract data using FormData as per prompt
    const formData = new FormData(event.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Get the actual Date object from RHF for preferredDate, as FormData stringifies it
    const preferredDateValue = form.getValues('preferredDate');
    const dataToLog = {
      ...rawData,
      preferredDate: preferredDateValue ? preferredDateValue.toISOString() : undefined,
    };
    
    console.log('Service booking submitted with data:', dataToLog);
    alert('Service booking request submitted! We will review your request.');
    // Here, you would typically make an API call to your backend (e.g., a Firebase Function)
    // For now, it's just a console log and alert as per instructions.

    // Example: Simulate API call
    // await new Promise(resolve => setTimeout(resolve, 1000));

    form.reset({
        name: authUser?.displayName || '',
        email: authUser?.email || '',
        phone: '', 
        serviceType: '', 
        preferredDate: undefined, 
        preferredTime: ''
    });
    setIsSubmitting(false);
  };
  
  const watchedPreferredDate = form.watch('preferredDate');


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl font-headline text-primary">Book a Service</CardTitle>
        <CardDescription className="text-md text-muted-foreground mt-1">
          Fill out the form below to schedule a service with our expert team.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-8 md:px-8">
        {formError && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Booking Error</h4>
              <p>{formError}</p>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit} // Use the new client-side handleSubmit
          className="space-y-6"
          id="service-booking-form"
          // ref={formRef} // formRef can be kept if needed for other direct DOM manipulations
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">Full Name</Label>
              <Input id="name" {...form.register('name')} placeholder="e.g., John Doe" className={form.formState.errors.name ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.name?.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email Address</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="you@example.com" className={form.formState.errors.email ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.email?.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="mb-1.5 block">Phone Number</Label>
            <Input id="phone" type="tel" {...form.register('phone')} placeholder="e.g., +91 98765 43210" className={form.formState.errors.phone ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
            {form.formState.errors.phone && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.phone?.message}</p>}
          </div>

          <div>
            <Label htmlFor="serviceType" className="mb-1.5 block">Service Type</Label>
            <Select
              onValueChange={(value) => form.setValue('serviceType', value, { shouldValidate: true })}
              defaultValue={form.getValues('serviceType')}
              name="serviceType" 
            >
              <SelectTrigger className={cn(form.formState.errors.serviceType ? 'border-destructive focus-visible:ring-destructive/50' : '')}>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.serviceType && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.serviceType?.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="preferredDateTrigger" className="mb-1.5 block">Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="preferredDateTrigger"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11',
                      !watchedPreferredDate && 'text-muted-foreground',
                      (form.formState.errors.preferredDate) && 'border-destructive focus-visible:ring-destructive/50'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedPreferredDate ? format(watchedPreferredDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedPreferredDate}
                    onSelect={(date) => {
                        form.setValue('preferredDate', date as Date, {shouldValidate: true});
                      }
                    }
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                  />
                </PopoverContent>
              </Popover>
              {/* Hidden input for preferredDate for FormData if not using RHF data directly for submission */}
              {/* <input
                type="hidden"
                {...form.register('preferredDate')} // RHF will handle the Date object
                value={watchedPreferredDate instanceof Date ? watchedPreferredDate.toISOString() : ''}
              /> */}
              {form.formState.errors.preferredDate && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.preferredDate?.message}</p>}
            </div>

            <div>
              <Label htmlFor="preferredTime" className="mb-1.5 block">Preferred Time</Label>
              <Input id="preferredTime" type="time" {...form.register('preferredTime')} className={cn('h-11', form.formState.errors.preferredTime ? 'border-destructive focus-visible:ring-destructive/50' : '')}/>
              {form.formState.errors.preferredTime && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.preferredTime?.message}</p>}
            </div>
          </div>
          
          <div className="pt-2">
            <SubmitButton pending={isSubmitting} />
          </div>
        </form>
      </CardContent>
      <AlertDialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              To book a service, please log in or create an account. This helps us keep track of your service requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => { router.push('/signup'); setIsLoginModalOpen(false); }}>Sign Up</Button>
            <AlertDialogAction asChild>
              <Button onClick={() => { router.push('/login'); setIsLoginModalOpen(false); }}>Login</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
