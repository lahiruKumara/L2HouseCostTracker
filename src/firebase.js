import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
// Paste your values from Firebase Console > Project settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDnYhHZQoxWR9seA-AQZl1rPniu0XU82-0",
  authDomain: "l2-house-cost-tracker.firebaseapp.com",
  projectId: "l2-house-cost-tracker",
  storageBucket: "l2-house-cost-tracker.firebasestorage.app",
  messagingSenderId: "293025986544",
  appId: "1:293025986544:web:0fd2e3975c2c94298b4f35",
  measurementId: "G-P61J26JHCV"
};

const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);
