
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Send } from "lucide-react";

export default function ContactPage() {
  // Basic form submission handler (can be expanded with a server action)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add form submission logic here (e.g., send to an API endpoint or server action)
    alert("Form submitted! (This is a placeholder)");
  };

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-10 text-center">
          Get In Touch With Ozonxt
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Contact Information</CardTitle>
              <CardDescription>We're here to help and answer any question you might have.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <MapPin size={20} className="mr-3 mt-1 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Our Office Address</h3>
                  <p className="text-muted-foreground">123 Aqua Street, Pureville, CleanState 560001, India</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone size={20} className="mr-3 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone Number</h3>
                  <a href="tel:+911234567890" className="text-muted-foreground hover:text-primary">+91 123 456 7890</a>
                </div>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="mr-3 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Email Address</h3>
                  <a href="mailto:info@ozonxt.com" className="text-muted-foreground hover:text-primary">info@ozonxt.com</a>
                </div>
              </div>
               <div className="pt-4">
                  <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form and we'll get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Your Full Name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Enquiry about..." />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message here..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">
                  <Send size={18} className="mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 rounded-lg overflow-hidden shadow-xl h-80 md:h-96">
          {/* Placeholder for an interactive map or a static map image */}
          <img 
            src="https://placehold.co/1200x400.png" 
            alt="Map showing Ozonxt location" 
            data-ai-hint="office map" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>
  );
}
