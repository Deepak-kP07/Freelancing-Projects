
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
import { auth, googleProvider, db } from '@/lib/firebase'; // Import db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser, setAuthLoading, setAuthError, type SerializableUser } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

interface AuthContextType {
  signInWithGoogle: () => Promise<User | null>;
  signInUserWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpUserWithEmail: (email: string, pass: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toSerializableUser = (firebaseUser: User): SerializableUser => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
};

// Function to save/update user profile in Firestore
const updateUserProfileInFirestore = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(), // Track last login
  };
  try {
    // Using setDoc with merge: true acts as an upsert
    await setDoc(userRef, userData, { merge: true }); 
    console.log('User profile synced to Firestore:', user.uid);
  } catch (error) {
    console.error('Error syncing user profile to Firestore:', error);
  }
};


export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.auth.user); // Get user from Redux

  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(setUser(toSerializableUser(currentUser)));
        updateUserProfileInFirestore(currentUser); // Sync profile on auth state change
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleAuthError = (error: unknown) => {
    const authError = error as AuthError;
    // This line is crucial for debugging. Check your browser's developer console for this output.
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
      case 'auth/invalid-credential': 
        friendlyMessage = 'Invalid email or password. Please check your credentials.';
        break;
      case 'auth/requires-recent-login':
        friendlyMessage = 'This operation is sensitive and requires recent authentication. Please log in again before retrying.';
        break;
      case 'auth/popup-closed-by-user':
        friendlyMessage = 'Google Sign-In popup was closed before completion. Please try again.';
        break;
      case 'auth/cancelled-popup-request':
      case 'auth/popup-blocked':
        friendlyMessage = 'Google Sign-In popup was blocked or cancelled. Please ensure popups are enabled for this site and try again.';
        break;
      case 'auth/unauthorized-domain':
        friendlyMessage = 'This domain is not authorized for Firebase operations. Please check your Firebase project settings.';
        break;
      case 'auth/invalid-api-key':
        friendlyMessage = 'Invalid Firebase API key. Please check your Firebase project configuration.';
        break;
      case 'auth/project-not-found':
        friendlyMessage = 'Firebase project not found. Please verify your project configuration.';
        break;
      case 'auth/app-deleted':
        friendlyMessage = 'The Firebase app associated with this project has been deleted.';
        break;
      case 'auth/configuration-not-found':
         friendlyMessage = 'Firebase configuration not found or is incomplete. Please check your setup.';
         break;
      default:
        // Log unhandled codes specifically for easier debugging if new ones appear
        console.warn("Unhandled Firebase Auth Error Code in switch:", authError.code, "Raw error:", error);
        friendlyMessage = 'An unknown authentication error occurred. Please try again.';
        break;
    }
    dispatch(setAuthError(friendlyMessage)); 
    return null;
  }

  const signInWithGoogle = async (): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); 
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged handles setUser and updateUserProfileInFirestore
      return result.user;
    } catch (error) {
      return handleAuthError(error); 
    }
  };

  const signInUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged handles setUser and updateUserProfileInFirestore
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error); 
    }
  };

  const signUpUserWithEmail = async (email: string, pass: string): Promise<User | null> => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged handles setUser and updateUserProfileInFirestore
      return userCredential.user;
    } catch (error) {
      return handleAuthError(error); 
    }
  };

  const signOutUser = async () => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null)); 
    try {
      await signOut(auth);
      // onAuthStateChanged handles clearUser
    } catch (error) {
      handleAuthError(error); 
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

