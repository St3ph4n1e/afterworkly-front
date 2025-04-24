import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";  // <-- Type-only import
import { getMessaging, type Messaging } from "firebase/messaging";  // <-- Combined type import
import { getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const messaging: Messaging = getMessaging(app);

export const getMessagingToken = async (): Promise<string | void> => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    }
    console.warn('No registration token available. Request permission to generate one.');
  } catch (err) {
    console.error('Token retrieval error:', err);
    throw err;
  }
};

export { messaging, onMessage };
