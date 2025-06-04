// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // Uncomment if you use Firestore

// Construct Firebase configuration object from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Optional: Add debug logs here if you still face issues after restarting
// console.log('[NEW firebase.ts] Loaded API Key:', firebaseConfig.apiKey);

// Check if the essential API key is configured through environment variables
if (!firebaseConfig.apiKey) {
  console.error('[DEBUG] Firebase config from env:', firebaseConfig); // Log the whole config
  throw new Error(
    "Firebase API Key is not configured OR IS UNDEFINED. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env.local file (in the project root directory) " +
    "AND that you have RESTARTED your Next.js development server."
  );
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing app if already initialized
}

const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you use Firestore
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider /*, db */ };