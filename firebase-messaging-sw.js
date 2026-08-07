importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyALlSyj16Fv3FuRi5OJaIreh1BFGtLrX28",
  authDomain: "spesialforyou-7a3d0.firebaseapp.com",
  projectId: "spesialforyou-7a3d0",
  storageBucket: "spesialforyou-7a3d0.firebasestorage.app",
  messagingSenderId: "266013219393",
  appId: "1:266013219393:web:0466fb066830e1cdf504c0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title || "Pesan Darurat 💖";
    const notificationOptions = {
        body: payload.notification.body || "Ada pesan baru!",
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
