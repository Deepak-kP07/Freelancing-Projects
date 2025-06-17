
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Droplets, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/60 dark:bg-muted/30 py-10 mt-16 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-primary mb-3">
              <Droplets size={28} />
              <h3 className="text-xl font-headline font-semibold text-foreground">Ozonxt</h3>
            </Link>
            <p className="text-sm text-muted-foreground">Your Partner in Pure Water Solutions. Innovating for a healthier tomorrow.</p>
          </div>
          
          <div>
            <h4 className="text-md font-headline font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-headline font-semibold text-foreground mb-4">Contact Info</h4>
            <address className="space-y-2 text-sm not-italic text-muted-foreground">
              <p className="flex items-start"><MapPin size={16} className="mr-2 mt-1 shrink-0 text-primary capitalize" />  1-22 Kapu Street Keelagaram (V), Naryanavanam (M) Tirupati, Andhra Pradesh, 517581</p>
              <p className="flex items-center"><Phone size={16} className="mr-2 shrink-0 text-primary" /><a href="tel:+919989263971" className="hover:text-primary transition-colors">+91 9989263971</a></p>
              <p className="flex items-center"><Mail size={16} className="mr-2 shrink-0 text-primary" /><a href="mailto:tumbikarthik2797@gmail.com" className="hover:text-primary transition-colors">ozonxt@gmail.com</a></p>
            </address>
          </div>
          
          <div>
            <h4 className="text-md font-headline font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/Ozonxt-Ro-Systems/61575201711465/#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={22} /></a>
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={22} /></a> */}
              <a href="https://www.instagram.com/ozonxt/?igsh=NzQxMm50eTZ1ZjBi#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={22} /></a>
              {/* <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={22} /></a> */}
            </div>
             <div className="mt-6">
                <Link href="/developer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Code size={16}/> Developer Info
                </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ozonxt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
