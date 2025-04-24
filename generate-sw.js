import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'node:fs'
import path from 'node:path'
import 'dotenv/config';

// Permet de simuler __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const swContent = `
importScripts('https://www.gstatic.com/firebasejs/9.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.5.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${process.env.FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_BUCKET}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGE_SENDER}",
  appId: "${process.env.FIREBASE_APP_ID}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

fs.writeFileSync(path.join(__dirname, 'public/firebase-messaging-sw.js'), swContent);
console.log('✅ Service worker généré avec succès.');
