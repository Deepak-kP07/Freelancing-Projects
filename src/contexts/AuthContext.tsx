
import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setAuthLoading, setAuthError, type SerializableUser } from '@/store/authSlice';
import type { AppDispatch } from '@/store';

interface AuthContextType {
  // User state is now primarily in Redux
  signInWithGoogle: () => Promise<User | null>;
  signInUserWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpUserWithEmail: (email: string, pass: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Firebase User to SerializableUser
const toSerializableUser = (firebaseUser: User): SerializableUser => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
};


export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(setUser(toSerializableUser(currentUser)));
      } else {
        dispatch(clearUser());
      }
      // setAuthLoading(false) is handled by setUser and clearUser reducers
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleAuthError = (error: unknown) => {
    const authError = error as AuthError;
    console.error("Firebase Auth Error Code:", authError.code, "Message:", authError.message, "Full Error:", authError);
    
    let friendlyMessage = 'An unknown authentication error occurred. Please try again.';
    switch (authError.code) {
      case 'auth/email-already-in-use':
        friendlyMessage = 'This email address is already registered. Please try logging in or use a different email.';
        break;
      case 'auth/invalid-email':
        friendlyMessage = 'The email address is not valid. Please check and try again.';
        break;
      case 'auth/weak-password':
        friendlyMessage = 'The password is too weak. It must be at least 6 characters long.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        friendlyMessage = 'Invalid email or password. Please check your credentials.';
        break;
      case 'auth/requires-recent-login':
        friendlyMessage = 'This operation is sensitive and requires recent authentication. Please log in again before retrying.';
        break;
      case 'auth/popup-closed-by-user':
        friendlyMessage = 'Google Sign-In popup was closed before completion. Please try again.';
        // For this specific case, we might not want to show a persistent error if the user intentionally closed it.
        // dispatch(setAuthLoading(false)); // Ensure loading is false
        // return null; 
        // For now, we'll dispatch the error like others.
        break;
      case 'auth/cancelled-popup-request':
      case 'auth/popup-blocked':
        friendlyMessage = 'Google Sign-In popup was blocked or cancelled. Please ensure popups are enabled for this site and try again.';
        break;
    }
    dispatch(setAuthError(friendlyMessage)); // This will also set loading to false in the slice
    return null;
  }

  const signInWithGoogle = async (): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); // Clear previous errors
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will dispatch setUser and setAuthLoading(false) via setUser
      return result.user;
    } catch (error) {
      return handleAuthError(error); // This will set loading to false via setAuthError
    }
  };

  const signInUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); // Clear previous errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will dispatch setUser and setAuthLoading(false) via setUser
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error); // This will set loading to false via setAuthError
    }
  };

  const signUpUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); // Clear previous errors
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will dispatch setUser and setAuthLoading(false) via setUser
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error); // This will set loading to false via setAuthError
    }
  };

  const signOutUser = async () => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); // Clear previous errors
    try {
      await signOut(auth);
      // onAuthStateChanged will dispatch clearUser and setAuthLoading(false) via clearUser
    } catch (error) {
      handleAuthError(error); // This will set loading to false via setAuthError
    }
  };

  return (
    <AuthContext.Provider value={{ signInWithGoogle, signInUserWithEmail, signUpUserWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
