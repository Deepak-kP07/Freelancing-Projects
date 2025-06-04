'use client';

import { AuthContextProvider } from '@/contexts/AuthContext';
import type React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
