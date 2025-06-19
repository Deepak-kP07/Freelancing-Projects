
'use client';

import { useEffect, useState, useRef, startTransition } // Added startTransition
  from 'react';
import { useActionState } from 'react';
// Removed useFormStatus as it's not appropriate for this button's pending state
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
import { bookServiceAction, type BookingFormState } from '@/app/services/actions';
import { SERVICE_TYPES } from '@/lib/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(100, { message: 'Name must be 100 characters or less.' }),
  email: z.string().email({ message: 'Invalid email address.' }).max(100, { message: 'Email must be 100 characters or less.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).max(15, { message: 'Phone number must be 15 digits or less.' }).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format." }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  preferredDate: z.date({ required_error: "Please pick a date." }),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time.' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Modified SubmitButton to accept 'pending' prop
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
  // Renamed isPending to isActionPending for clarity
  const [state, formAction, isActionPending] = useActionState<BookingFormState | undefined, FormData>(bookServiceAction, undefined);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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
    if (state?.message) {
      toast({
        title: state.success ? 'Booking Successful!' : 'Booking Failed',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
        duration: state.success ? 5000 : 7000,
      });
      if (state.success) {
        form.reset({
          name: authUser?.displayName || '',
          email: authUser?.email || '',
          phone: '', serviceType: '', preferredDate: undefined, preferredTime: ''
        });
      }
    }
    if (state?.errors) {
        (Object.keys(state.errors) as Array<keyof BookingFormData | '_form'>).forEach((key) => {
            const errorMessages = state.errors?.[key as keyof BookingFormData];
             if (key === '_form' && state.errors?._form) {
                // Form-wide errors are handled by the main toast
            } else if (errorMessages && errorMessages.length > 0 && key !== '_form') {
                 form.setError(key as keyof BookingFormData, { type: 'server', message: errorMessages.join(', ') });
            }
        });
    }
  }, [state, toast, form, authUser]);

  const watchedPreferredDate = form.watch('preferredDate');

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

  const onValidSubmit = (data: BookingFormData) => {
    if (!authUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (formRef.current) {
      const formDataInstance = new FormData(formRef.current);
      // formDataInstance will pick up values from named form elements.
      // Hidden input for 'preferredDate' and 'name' attribute on 'Select' ensure these are included.
      // Inputs registered with form.register() are also included.
      
      // Wrap the call to formAction in startTransition
      startTransition(() => {
        formAction(formDataInstance);
      });
    } else {
      console.error("ServiceBookingForm: formRef.current is null. Cannot create FormData.");
      toast({
        title: "Form Submission Error",
        description: "An unexpected error occurred while submitting the form. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl font-headline text-primary">Book a Service</CardTitle>
        <CardDescription className="text-md text-muted-foreground mt-1">
          Fill out the form below to schedule a service with our expert team.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-8 md:px-8">
        {state?.errors?._form && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Booking Error</h4>
              {state.errors._form.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          </div>
        )}
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onValidSubmit)}
          className="space-y-6"
          id="service-booking-form"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">Full Name</Label>
              <Input id="name" {...form.register('name')} placeholder="e.g., John Doe" className={form.formState.errors.name || state?.errors?.name ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
              {(form.formState.errors.name || state?.errors?.name) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.name?.message || state?.errors?.name?.[0]}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email Address</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="you@example.com" className={form.formState.errors.email || state?.errors?.email ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
              {(form.formState.errors.email || state?.errors?.email) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.email?.message || state?.errors?.email?.[0]}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="mb-1.5 block">Phone Number</Label>
            <Input id="phone" type="tel" {...form.register('phone')} placeholder="e.g., +91 98765 43210" className={form.formState.errors.phone || state?.errors?.phone ? 'border-destructive focus-visible:ring-destructive/50' : ''}/>
            {(form.formState.errors.phone || state?.errors?.phone) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.phone?.message || state?.errors?.phone?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="serviceType" className="mb-1.5 block">Service Type</Label>
            <Select
              onValueChange={(value) => form.setValue('serviceType', value, { shouldValidate: true })}
              defaultValue={form.getValues('serviceType')}
              name="serviceType" 
            >
              <SelectTrigger className={cn(form.formState.errors.serviceType || state?.errors?.serviceType ? 'border-destructive focus-visible:ring-destructive/50' : '')}>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(form.formState.errors.serviceType || state?.errors?.serviceType) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.serviceType?.message || state?.errors?.serviceType?.[0]}</p>}
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
                      (form.formState.errors.preferredDate || state?.errors?.preferredDate) && 'border-destructive focus-visible:ring-destructive/50'
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
              <input
                type="hidden"
                name="preferredDate"
                value={watchedPreferredDate instanceof Date ? watchedPreferredDate.toISOString() : ''}
              />
              {(form.formState.errors.preferredDate || state?.errors?.preferredDate) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.preferredDate?.message || state?.errors?.preferredDate?.[0]}</p>}
            </div>

            <div>
              <Label htmlFor="preferredTime" className="mb-1.5 block">Preferred Time</Label>
              <Input id="preferredTime" type="time" {...form.register('preferredTime')} className={cn('h-11', form.formState.errors.preferredTime || state?.errors?.preferredTime ? 'border-destructive focus-visible:ring-destructive/50' : '')}/>
              {(form.formState.errors.preferredTime || state?.errors?.preferredTime) && <p className="text-sm text-destructive mt-1.5">{form.formState.errors.preferredTime?.message || state?.errors?.preferredTime?.[0]}</p>}
            </div>
          </div>
          
          <div className="pt-2">
            <SubmitButton pending={isActionPending} /> {/* Pass isActionPending here */}
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
