
'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthButton from './AuthButton';
import CartIcon from './CartIcon';
import ThemeToggleButton from './ThemeToggleButton';
import NavLink from './NavLink';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Droplets, Menu, LayoutDashboard } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const commonNavLinks = (
    <>
      <NavLink href="/" onClick={closeMobileMenu}>
        Home
      </NavLink>
      <NavLink href="/products" onClick={closeMobileMenu}>
        Products
      </NavLink>
      <NavLink href="/services" onClick={closeMobileMenu}>
        Services
      </NavLink>
      <NavLink href="/about" onClick={closeMobileMenu}>
        About
      </NavLink>
      {authUser && (
         <NavLink href="/dashboard/user" onClick={closeMobileMenu} className="flex items-center gap-1">
            <LayoutDashboard size={16}/> Dashboard
        </NavLink>
      )}
      {isAdmin && (
        <NavLink href="/dashboard/admin" onClick={closeMobileMenu} className="text-accent hover:text-accent/80 flex items-center gap-1">
           <LayoutDashboard size={16}/> Admin
        </NavLink>
      )}
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
        <nav className="hidden md:flex items-center gap-x-3 lg:gap-x-4">
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
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6">
                <Link href="/" className="flex items-center gap-2 text-primary mb-8" onClick={closeMobileMenu}>
                  <Droplets size={28} />
                  <h1 className="text-xl font-headline font-semibold">Ozonxt</h1>
                </Link>
                <nav className="flex flex-col gap-4">
                  {commonNavLinks}
                </nav>
                <div className="mt-auto pt-6 border-t border-border">
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
