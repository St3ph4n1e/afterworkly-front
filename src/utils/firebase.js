import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


console.log("Firebase config verification:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// const app: FirebaseApp = initializeApp(firebaseConfig);
// const messaging: Messaging = getMessaging(app);
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// export const getMessagingToken = async (): Promise<string | void> => {
export const getMessagingToken = async ()=> {
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
    throw err; // Re-throw for error handling in components
  }
};

export { messaging , onMessage};
