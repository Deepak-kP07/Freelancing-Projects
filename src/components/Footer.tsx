
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Code } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-10 mt-16 relative overflow-hidden"> {/* Added relative and overflow-hidden for animation */}
      {/* Water Animation Container - Placed at the top of the footer */}
      <div className="water-animation-container">
        <div className="water-wave water-wave1"></div>
        <div className="water-wave water-wave2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10"> {/* Added relative z-10 to keep content above animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pt-8"> {/* Added pt-8 to push content below animation */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750161199/ozonxt-logo_y2gz8v.png" alt="Ozonxt Logo" width={130} height={52} className='object-contain' data-ai-hint="water logo"/>
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
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-headline font-semibold text-foreground mb-4">Contact Info</h4>
            <address className="space-y-3 text-sm not-italic text-muted-foreground">
              <p className="flex items-start"><MapPin size={16} className="mr-2 mt-1 shrink-0 text-primary" />  1-22 Kapu Street Keelagaram (V), Naryanavanam (M) Tirupati, Andhra Pradesh, 517581</p>
              <p className="flex items-center"><Phone size={16} className="mr-2 shrink-0 text-primary" /><a href="tel:+919989263971" className="hover:text-primary transition-colors">+91 9989263971</a></p>
              <p className="flex items-center"><Mail size={16} className="mr-2 shrink-0 text-primary" /><a href="mailto:ozonxt@gmail.com" className="hover:text-primary transition-colors">ozonxt@gmail.com</a></p>
            </address>
          </div>
          
          <div>
            <h4 className="text-md font-headline font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/people/Ozonxt-Ro-Systems/61575201711465/#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/ozonxt/?igsh=NzQxMm50eTZ1ZjBi#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
              {/* Add other social links if available */}
            </div>
             <div className="mt-6">
                <Link href="/developer" className="text-xs text-muted-foreground/70 hover:text-primary/80 transition-colors flex items-center gap-1.5">
                  <Code size={14}/> Developer Info
                </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 pb-8 text-center text-sm text-muted-foreground"> {/* Added pb-8 */}
          <p>&copy; {new Date().getFullYear()} Ozonxt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
