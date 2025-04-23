importScripts('https://www.gstatic.com/firebasejs/9.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.5.0/firebase-messaging-compat.js');

// Ce fichier sera transformé par Vite pour injecter les valeurs d'env
// car le .env n'est pas accessible par import.meta.env dès le début donc on génère un fichier avec les creds à l'intérieur
firebase.initializeApp({
  apiKey: "AIzaSyAYWxs8waY_2msONdiduegfbf39WwcIGBM",
  authDomain: "afterwork-ly.firebaseapp.com",
  projectId: "afterwork-ly",
  storageBucket: "afterwork-ly.firebasestorage.app",
  messagingSenderId: "635998887229",
  appId: "1:635998887229:web:65666dc19cf76d360d7954",
  measurementId: "G-CFZ04PB57P"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Message en arrière-plan :', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
