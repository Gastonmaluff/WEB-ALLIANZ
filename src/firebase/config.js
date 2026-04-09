import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCX8eHF1kWRXubvwDh9gQ5303Cd_6Ajvrk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "web-allianz.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "web-allianz",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "web-allianz.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "618610590568",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:618610590568:web:d41d8cf9679f05f67a0cdd",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
