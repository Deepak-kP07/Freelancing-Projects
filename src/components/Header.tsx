
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthButton from './AuthButton';
import CartIcon from './CartIcon';
import ThemeToggleButton from './ThemeToggleButton';
import NavLink from './NavLink';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ADMIN_EMAIL } from '@/lib/constants';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;
  const pathname = usePathname();
  const router = useRouter();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleBack = () => {
    router.back();
  };

  const isHomePage = pathname === '/';

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
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between h-20">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="md:hidden mr-1">
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Image src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750161199/ozonxt-logo_y2gz8v.png" alt="Ozonxt Logo" width={150} height={60} className='object-contain' data-ai-hint="water logo" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-4 lg:gap-x-5">
          {commonNavLinks}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <CartIcon />
          <div className="hidden md:block">
            <AuthButton />
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6 flex flex-col bg-background">
                <SheetHeader className="pb-4 mb-4 border-b border-border">
                  <SheetTitle>
                    <Link href="/" className="flex items-center gap-2 text-primary" onClick={closeMobileMenu}>
                       <Image src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750161199/ozonxt-logo_y2gz8v.png" alt="Ozonxt Logo" width={120} height={48} className='object-contain' data-ai-hint="water logo" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-y-3 flex-grow">
                  {commonNavLinks}
                </nav>
                
                <div className="mt-auto pt-4 border-t border-border">
                  <AuthButton onLinkClick={closeMobileMenu} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
