
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Loader2, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatchError, setPasswordsMatchError] = useState<string | null>(null);

  const { signUpUserWithEmail } = useAuth();
  const authState = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordsMatchError(null); 
    if (password !== confirmPassword) {
      setPasswordsMatchError("Passwords do not match.");
      return;
    }
    const user = await signUpUserWithEmail(email, password);
    if (user) {
      router.push('/'); // Redirect to home on successful signup
    }
  };
  
  if (authState.user) {
    // Optional: redirect if already logged in
    // router.push('/');
    // return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
              <Image src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750161199/ozonxt-logo_y2gz8v.png" alt="Ozonxt Logo" height={80} data-ai-hint="water logo" />
          </div>
          <CardTitle className="text-2xl font-headline">Create an Ozonxt Account</CardTitle>
          <CardDescription>Get started with pure water solutions today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authState.loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={authState.loading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={authState.loading}
              />
            </div>
            {passwordsMatchError && (
              <p className="text-sm text-destructive">{passwordsMatchError}</p>
            )}
            {authState.error && (
              <p className="text-sm text-destructive">{authState.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={authState.loading}>
              {authState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
