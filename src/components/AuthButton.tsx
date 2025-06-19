
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User as UserIcon, ShoppingCart, LayoutDashboard, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/constants';

interface AuthButtonProps {
  onLinkClick?: () => void; // For mobile menu to close
}

export default function AuthButton({ onLinkClick }: AuthButtonProps) {
  const { signOutUser } = useAuth();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const isAdmin = authUser?.email ? ADMIN_EMAIL.includes(authUser.email) : false;

  const handleSignOut = () => {
    signOutUser();
    if (onLinkClick) {
      onLinkClick();
    }
  };
  
  const handleMenuItemClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };


  if (authLoading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (authUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={authUser.photoURL || undefined} alt={authUser.displayName || 'User'} />
              <AvatarFallback>
                {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : <UserIcon size={18} />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1 py-1">
              <p className="text-sm font-medium leading-none">{authUser.displayName || 'User Profile'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {authUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/dashboard/user" passHref>
              <DropdownMenuItem onClick={handleMenuItemClick}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                <span>My Dashboard</span>
              </DropdownMenuItem>
            </Link>
             {isAdmin && (
              <Link href="/dashboard/admin" passHref>
                <DropdownMenuItem onClick={handleMenuItemClick} className="text-accent hover:!text-accent/80 focus:!bg-accent/10 focus:!text-accent">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              </Link>
            )}
            <Link href="/services" passHref>
              <DropdownMenuItem onClick={handleMenuItemClick}>
                <Wrench className="mr-2 h-4 w-4 text-primary" />
                <span>Book New Service</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/cart" passHref>
              <DropdownMenuItem onClick={handleMenuItemClick}>
                <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                <span>View Cart</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:!text-destructive focus:!bg-destructive/10 focus:!text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href="/login" passHref>
      <Button variant="outline" size="sm" onClick={handleMenuItemClick}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    </Link>
  );
}
