
'use client';

import { useState } from 'react';
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Send, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveContactMessage } from '@/app/services/actions'; // To be created
import { WHATSAPP_PHONE_NUMBER } from '@/lib/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { toast } = useToast();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (!authUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send a message.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as ContactFormData;

    try {
      const result = await saveContactMessage(data);

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Your message has been submitted successfully.",
        });

        // Send WhatsApp notification
        let whatsappMessage = "New Contact Form Submission:\n\n";
        whatsappMessage += `Name: ${data.name}\n`;
        whatsappMessage += `Email: ${data.email}\n`;
        whatsappMessage += `Subject: ${data.subject || 'N/A'}\n`;
        whatsappMessage += `Message: ${data.message}\n\n`;
        whatsappMessage += `Submitted by: ${authUser.email}`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank'); // Opens in new tab

        (event.target as HTMLFormElement).reset();
      } else {
        setSubmitError(result.error || "Failed to send message. Please try again.");
        toast({
          title: "Submission Error",
          description: result.error || "Could not send your message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again later.");
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Whether you have questions about our products, services, or just want to say hello, feel free to reach out.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-10 md:gap-12 items-start">
          <Card className="lg:col-span-2 shadow-lg border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Contact Information</CardTitle>
              <CardDescription>Find us at our office or connect with us through phone or email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="flex items-start">
                <MapPin size={20} className="mr-3 mt-1 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5">Our Office Address</h3>
                  <p className="text-muted-foreground">1-22 Kapu Street Keelagaram (V), Naryanavanam (M) Tirupati, Andhra Pradesh, 517581</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone size={20} className="mr-3 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5">Phone Number</h3>
                  <a href="tel:+919989263971" className="text-muted-foreground hover:text-primary">+91 9989263971</a>
                </div>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="mr-3 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5">Email Address</h3>
                  <a href="mailto:ozonxt@gmail.com" className="text-muted-foreground hover:text-primary">ozonxt@gmail.com</a>
                </div>
              </div>
               <div className="flex items-start pt-2">
                  <Clock size={20} className="mr-3 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 shadow-lg border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Send Us a Message</CardTitle>
              <CardDescription>Have a question or need assistance? Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              {submitError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-0.5">Submission Error</h4>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="mb-1.5 block">Full Name</Label>
                    <Input id="name" name="name" placeholder="Your Full Name" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="your.email@example.com" required disabled={isSubmitting} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject" className="mb-1.5 block">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Enquiry about..." disabled={isSubmitting} />
                </div>
                <div>
                  <Label htmlFor="message" className="mb-1.5 block">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message here..." rows={5} required disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting || !authUser}>
                  {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Send size={18} className="mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
                {!authUser && <p className="text-sm text-muted-foreground mt-2">Please log in to send a message.</p>}
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 md:mt-24 rounded-xl overflow-hidden shadow-xl h-80 md:h-[500px] border border-border">
          <img 
            src="https://placehold.co/1200x500.png" 
            alt="Map showing Ozonxt location" 
            data-ai-hint="city map office" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>
  );
}
