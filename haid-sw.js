importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRovHQnOoK1EiYI12l8W4sxzDfhGl9g04",
  authDomain: "kalender-haid-49ba8.firebaseapp.com",
  projectId: "kalender-haid-49ba8",
  storageBucket: "kalender-haid-49ba8.firebasestorage.app",
  messagingSenderId: "889794868334",
  appId: "1:889794868334:web:0275fda744ab1caf5ca27f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Siklus Simerah";
  const options = {
    body: payload.notification?.body || "Ada pemberitahuan baru.",
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png'
  };

  self.registration.showNotification(title, options);
});
  
