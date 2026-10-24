import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Web app's Firebase configuration loaded securely from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "craftora-prototype.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "craftora-prototype",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "craftora-prototype.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "528955265800",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:528955265800:web:b936dba76e1616cb53d2bd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6T37WL2NBC"
};

// Initialize Firebase app singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Analytics if supported in this environment
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics initialization failure in non-supported environments
    });
}
