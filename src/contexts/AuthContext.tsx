
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
      dispatch(setAuthLoading(false));
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleAuthError = (error: unknown) => {
    const authError = error as AuthError;
    console.error("Firebase Auth Error: ", authError.message);
    dispatch(setAuthError(authError.message || 'An unknown authentication error occurred.'));
    return null;
  }

  const signInWithGoogle = async (): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will dispatch setUser
      dispatch(setAuthLoading(false)); // Explicitly set loading false
      return result.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signInUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will dispatch setUser
      dispatch(setAuthLoading(false));
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signUpUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will dispatch setUser
      dispatch(setAuthLoading(false));
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signOutUser = async () => {
    dispatch(setAuthLoading(true));
    try {
      await signOut(auth);
      // onAuthStateChanged will dispatch clearUser
    } catch (error) {
      handleAuthError(error); // Dispatch error, though onAuthStateChanged should still clear user
    } finally {
       // dispatch(setAuthLoading(false)); // onAuthStateChanged will handle this
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
