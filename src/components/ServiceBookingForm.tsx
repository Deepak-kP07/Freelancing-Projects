
'use client';

import { useEffect, useState } from 'react'; // Added useState
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
} from "@/components/ui/alert-dialog"; // Added AlertDialog imports
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { bookServiceAction, type BookingFormState } from '@/app/services/actions';
import { SERVICE_TYPES } from '@/lib/constants';
import { useSelector } from 'react-redux'; // Added useSelector
import type { RootState } from '@/store'; // Added RootState
import { useRouter } from 'next/navigation'; // Added useRouter

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format." }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  preferredDate: z.date({ required_error: "Please pick a date." }),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time.' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Booking...' : 'Book Service'}
    </Button>
  );
}

export default function ServiceBookingForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState<BookingFormState | undefined, FormData>(bookServiceAction, undefined);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      preferredDate: undefined,
      preferredTime: '',
    },
  });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        form.reset();
      }
    }
    if (state?.errors) {
        (Object.keys(state.errors) as Array<keyof BookingFormData>).forEach((key) => {
            const errorMessages = state.errors?.[key];
            if (errorMessages && errorMessages.length > 0) {
                 form.setError(key, { type: 'server', message: errorMessages.join(', ') });
            }
        });
    }
  }, [state, toast, form]);

  const watchedPreferredDate = form.watch('preferredDate');

  // Auto-fill name and email if user is logged in
  useEffect(() => {
    if (authUser) {
      if (authUser.displayName) {
        form.setValue('name', authUser.displayName, { shouldValidate: true });
      }
      if (authUser.email) {
        form.setValue('email', authUser.email, { shouldValidate: true });
      }
    } else {
      // Optionally clear if user logs out while form is open, or handle as needed
      // form.setValue('name', '', { shouldValidate: false });
      // form.setValue('email', '', { shouldValidate: false });
    }
  }, [authUser, form]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Book a Service</CardTitle>
        <CardDescription>Fill out the form below to schedule a service with our expert team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register('name')} className={form.formState.errors.name || state?.errors?.name ? 'border-destructive' : ''}/>
            {(form.formState.errors.name || state?.errors?.name) && <p className="text-sm text-destructive mt-1">{form.formState.errors.name?.message || state?.errors?.name?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...form.register('email')} className={form.formState.errors.email || state?.errors?.email ? 'border-destructive' : ''}/>
             {(form.formState.errors.email || state?.errors?.email) && <p className="text-sm text-destructive mt-1">{form.formState.errors.email?.message || state?.errors?.email?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...form.register('phone')} className={form.formState.errors.phone || state?.errors?.phone ? 'border-destructive' : ''}/>
            {(form.formState.errors.phone || state?.errors?.phone) && <p className="text-sm text-destructive mt-1">{form.formState.errors.phone?.message || state?.errors?.phone?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              onValueChange={(value) => form.setValue('serviceType', value, { shouldValidate: true })}
              defaultValue={form.getValues('serviceType')}
              name="serviceType"
            >
              <SelectTrigger className={cn(form.formState.errors.serviceType || state?.errors?.serviceType ? 'border-destructive' : '')}>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(form.formState.errors.serviceType || state?.errors?.serviceType) && <p className="text-sm text-destructive mt-1">{form.formState.errors.serviceType?.message || state?.errors?.serviceType?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="preferredDate">Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !watchedPreferredDate && 'text-muted-foreground',
                    (form.formState.errors.preferredDate || state?.errors?.preferredDate) && 'border-destructive'
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
                  onSelect={(date) => form.setValue('preferredDate', date || new Date(), {shouldValidate: true})}
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
            {(form.formState.errors.preferredDate || state?.errors?.preferredDate) && <p className="text-sm text-destructive mt-1">{form.formState.errors.preferredDate?.message || state?.errors?.preferredDate?.[0]}</p>}
          </div>

          <div>
            <Label htmlFor="preferredTime">Preferred Time</Label>
            <Input id="preferredTime" type="time" {...form.register('preferredTime')} className={form.formState.errors.preferredTime || state?.errors?.preferredTime ? 'border-destructive' : ''}/>
            {(form.formState.errors.preferredTime || state?.errors?.preferredTime) && <p className="text-sm text-destructive mt-1">{form.formState.errors.preferredTime?.message || state?.errors?.preferredTime?.[0]}</p>}
          </div>

          {authUser ? (
            <SubmitButton />
          ) : (
            <Button type="button" onClick={() => setIsLoginModalOpen(true)} className="w-full">
              Book Service
            </Button>
          )}
        </form>
      </CardContent>
      <AlertDialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please log in or create an account to book a service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
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
