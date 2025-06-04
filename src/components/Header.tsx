'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthButton from './AuthButton';
import CartIcon from './CartIcon';
import ThemeToggleButton from './ThemeToggleButton';
import NavLink from './NavLink';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Droplets, Menu } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const commonNavLinks = (
    <>
      <NavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink href="/products" onClick={() => setIsMobileMenuOpen(false)}>
        Products
      </NavLink>
      <NavLink href="/services" onClick={() => setIsMobileMenuOpen(false)}>
        Services
      </NavLink>
      <NavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
        About
      </NavLink>
    </>
  );

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Droplets size={32} />
          <h1 className="text-2xl font-headline font-semibold">Ozonxt</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {commonNavLinks}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <CartIcon />
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6">
                <Link href="/" className="flex items-center gap-2 text-primary mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                  <Droplets size={28} />
                  <h1 className="text-xl font-headline font-semibold">Ozonxt</h1>
                </Link>
                <nav className="flex flex-col gap-4">
                  {commonNavLinks}
                </nav>
                <div className="mt-8 pt-6 border-t border-border">
                  <AuthButton />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
