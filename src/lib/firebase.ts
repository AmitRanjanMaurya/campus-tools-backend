// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMU3qExXbUbGl3E8Yus7CpbrUfWw4TC0M",
  authDomain: "school-tools-65224.firebaseapp.com",
  projectId: "school-tools-65224",
  storageBucket: "school-tools-65224.firebasestorage.app",
  messagingSenderId: "538849023268",
  appId: "1:538849023268:web:e3cdd03ad74b2715ca8fb1",
  measurementId: "G-82RSYFLRTL"
};

// Initialize Firebase
let app;
let auth: any = null;
let db: any = null;
let analytics: any = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  // Initialize Analytics (only in browser environment)
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.log('🔥 Firebase Authentication needs to be enabled in your Firebase Console');
  console.log('📝 Go to: https://console.firebase.google.com/project/school-tools-65224/authentication/providers');
}

export { auth, db, analytics };
export default app;
