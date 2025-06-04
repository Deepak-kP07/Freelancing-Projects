import Link from 'next/link';
import AuthButton from './AuthButton';
import CartIcon from './CartIcon';
import { Droplets } from 'lucide-react'; // Water-related icon

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Droplets size={32} />
          <h1 className="text-2xl font-headline font-semibold">Ozonxt Aqua Hub</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/services" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Services
          </Link>
          <div className="flex items-center gap-2">
            <CartIcon />
            <AuthButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
