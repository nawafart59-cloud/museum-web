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
  const notificationTitle = payload.notification.title || "Pesan dari Sayang 💖";
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 424C256 424 100 290 100 186C100 128 146 82 204 82C236 82 265 98 284 124C303 98 332 82 364 82C422 82 468 128 468 186C468 290 256 424 256 424Z" fill="%23ff4b72"/></svg>',
    badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 424C256 424 100 290 100 186C100 128 146 82 204 82C236 82 265 98 284 124C303 98 332 82 364 82C422 82 468 128 468 186C468 290 256 424 256 424Z" fill="%23ff4b72"/></svg>',
    data: {
      url: "https://sign-of-love.netlify.app/"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || "https://sign-of-love.netlify.app/";
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
