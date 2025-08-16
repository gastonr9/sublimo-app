import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE-fiH92z9Q2WLqrdqE8ekqJIY4tWOw5M",
  authDomain: "sublimo-app.firebaseapp.com",
  projectId: "sublimo-app",
  storageBucket: "sublimo-app.firebasestorage.app",
  messagingSenderId: "651555255409",
  appId: "1:651555255409:web:584478811c18350e6297d0",
  measurementId: "G-2F92Y3Z1WK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);