import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smartattend.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smartattend-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smartattend-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if credentials are real production keys vs default placeholder
export const isLiveFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key' &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('DummyKey')
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
  if (isLiveFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('[SMARTATTEND] Firebase initialized successfully in LIVE mode');
  } else {
    console.log('[SMARTATTEND] Operating in Reactive Local/Demo Mode. Connect live Firebase via .env');
  }
} catch (error) {
  console.warn('[SMARTATTEND] Firebase init fallback to local engine:', error);
}

export { app, auth, db, storage };
