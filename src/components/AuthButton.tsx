
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Link from 'next/link';

export default function AuthButton() {
  const { signOutUser } = useAuth(); // Keep signOut method from context
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);

  if (authLoading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (authUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authUser.photoURL || undefined} alt={authUser.displayName || 'User'} />
              <AvatarFallback>
                {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{authUser.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {authUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOutUser}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href="/login" passHref>
      <Button variant="outline" size="sm">
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    </Link>
  );
}
