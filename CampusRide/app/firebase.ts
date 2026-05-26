import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASHFY7d7Pk28CuEOcfHwft1o5PUdZXjH4",
  authDomain: "campusride-ac8c2.firebaseapp.com",
  projectId: "campusride-ac8c2",
  storageBucket: "campusride-ac8c2.firebasestorage.app",
  messagingSenderId: "64533894922",
  appId: "1:64533894922:web:40417a0df507be45cc4cf3",
  measurementId: "G-4TDVWZJRDD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;