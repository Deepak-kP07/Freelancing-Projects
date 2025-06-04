
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // Uncomment if you use Firestore

const PLACEHOLDER_API_KEY = "YOUR_API_KEY";

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || PLACEHOLDER_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Check if the placeholder API key is being used
if (firebaseConfig.apiKey === PLACEHOLDER_API_KEY) {
  throw new Error(
    "Firebase API Key is not configured. " +
    "Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file. " +
    "You can find this key in your Firebase project settings."
  );
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you use Firestore
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider /*, db */ };
