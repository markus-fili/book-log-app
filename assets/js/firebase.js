import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyBVFjRHq8pXSmDTy2vrqzemipHHP_p0dT0",
  authDomain: "book-log-app-3ac73.firebaseapp.com",
  projectId: "book-log-app-3ac73",
  storageBucket: "book-log-app-3ac73.firebasestorage.app",
  messagingSenderId: "146482671526",
  appId: "1:146482671526:web:ba7681e854baa693a9a967",
  measurementId: "G-QVSN8FBFGW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();