import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Copia este archivo como firebase.config.ts y usa la configuración de tu app web de Firebase.
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const db = getFirestore(initializeApp(firebaseConfig));
