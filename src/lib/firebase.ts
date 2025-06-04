
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // Uncomment if you use Firestore

const PLACEHOLDER_API_KEY = "YOUR_API_KEY"; // This is a constant for comparison

// Log all relevant environment variables to help debug what the application sees
console.log('[DEBUG] Firebase Environment Variables Check:');
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log('[DEBUG] NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

// Your web app's Firebase configuration
// IMPORTANT: These should be loaded from your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || PLACEHOLDER_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Check if the API key resolved to the placeholder, meaning it was not found or incorrect in env
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey === PLACEHOLDER_API_KEY) {
  throw new Error(
    "Firebase API Key is not configured correctly. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file (in the project root directory). " +
    "The value received from the environment was: '" + process.env.NEXT_PUBLIC_FIREBASE_API_KEY + "'. " +
    "You MUST restart your development server after creating or modifying the .env.local file. " +
    "You can find the correct API key in your Firebase project settings."
  );
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you use Firestore
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider /*, db */ };
