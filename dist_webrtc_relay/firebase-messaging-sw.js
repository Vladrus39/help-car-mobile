/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

/* eslint-env serviceworker */
/* eslint-disable no-undef */

// Firebase SDK for service workers
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGONxwdm9u9lcWDdLg_6xR52Z5TtVh0K0",
  authDomain: "roadhelp-14383.firebaseapp.com",
  projectId: "roadhelp-14383",
  storageBucket: "roadhelp-14383.firebasestorage.app",
  messagingSenderId: "986564669652",
  appId: "1:986564669652:web:de12ea4073d02c47c4cb41"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

console.log('[FCM SW] Firebase Messaging Service Worker initialized');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'RoadHelp';
  const notificationOptions = {
    body: payload.notification?.body || 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.type || 'notification',
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Determine URL based on notification data
  const data = event.notification.data || {};
  let url = '/';

  if (data.type === 'new_request' && data.request_id) {
    url = `/requests/${data.request_id}`;
  } else if (data.type === 'new_response' && data.request_id) {
    url = `/my-requests/${data.request_id}`;
  } else if (data.type === 'new_message' && data.chat_id) {
    url = `/chat/${data.chat_id}`;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle push events (fallback for non-FCM pushes)
self.addEventListener('push', (event) => {
  console.log('[FCM SW] Push event received');
  
  // Let Firebase handle it if it's an FCM message
  if (event.data) {
    try {
      const data = event.data.json();
      if (data.notification) {
        // Already handled by onBackgroundMessage
        return;
      }
    } catch (e) {
      // Not JSON, show generic notification
    }
  }
});

console.log('[FCM SW] Service Worker loaded and ready');
