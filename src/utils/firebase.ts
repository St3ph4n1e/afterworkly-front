import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";  // <-- Type-only import
import { getMessaging, type Messaging } from "firebase/messaging";  // <-- Combined type import
import { getToken, onMessage } from "firebase/messaging";
import { updateFCMToken } from '@/axios/api.ts'
import { isUserAuthenticated } from '@/auth/authservice.ts'

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

    if (!currentToken) {
      console.warn('No registration token available.');
      return;
    }

    const savedToken = localStorage.getItem("fcmToken");

    if (currentToken !== savedToken) {
      console.log("New FCM Token detected:", currentToken);
      localStorage.setItem("fcmToken", currentToken);

      if (isUserAuthenticated()) {
        await updateFCMToken(currentToken);
      }
    } else {
      console.log("FCM Token unchanged, no need to send again.");
    }

    return currentToken;
  } catch (err) {
    console.error('Token retrieval error:', err);
    throw err;
  }
};

export { messaging, onMessage };
