import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyDqf6IcUdAohNWqxPUA3c5TvR6zQcpT7hY",
  authDomain: "medzyme-5b724.firebaseapp.com",
  projectId: "medzyme-5b724",
  storageBucket: "medzyme-5b724.firebasestorage.app",
  messagingSenderId: "92932255456",
  appId: "1:92932255456:web:6b62b560eb50a92774ea85",
  measurementId: "G-V9ZBFV78KQ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // Add this export