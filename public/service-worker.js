// Service Worker для PWA Help-Car
// ВАЖНО: при каждом деплое увеличивайте версию, чтобы форсировать обновление
const CACHE_NAME = 'helpcar-v1.0.62';
const urlsToCache = [
  '/',
  '/index.html'
  // НЕ кэшируем manifest.json и иконки - они должны всегда загружаться из сети
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v1.0.61...');
  
  // Принудительно активируем новый Service Worker немедленно
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache).catch((err) => {
          // Если не удалось закешировать некоторые файлы - не критично
          console.warn('[SW] Некоторые файлы не удалось закешировать:', err);
          return Promise.resolve();
        });
      })
      .then(() => {
        // Немедленно активируем новый SW
        return self.skipWaiting();
      })
      .catch((err) => {
        // Если установка не удалась - логируем, но не блокируем активацию
        console.error('[SW] Ошибка установки:', err);
        // Все равно активируем Service Worker
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v1.0.61...');
  
  event.waitUntil(
    Promise.all([
      // Удаляем все старые кеши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName).catch((err) => {
                console.warn('[SW] Не удалось удалить кеш:', cacheName, err);
                return Promise.resolve();
              });
            }
            return Promise.resolve();
          })
        );
      }).catch((err) => {
        console.warn('[SW] Ошибка при очистке кешей:', err);
        return Promise.resolve();
      }),
      // Немедленно берем контроль над всеми клиентами
      self.clients.claim().catch((err) => {
        console.warn('[SW] Ошибка при clients.claim():', err);
        return Promise.resolve();
      }),
      // Отправляем сообщение всем клиентам для обновления
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          try {
            client.postMessage({ type: 'SW_UPDATED', version: '1.0.61' });
          } catch (err) {
            console.warn('[SW] Не удалось отправить сообщение клиенту:', err);
          }
        });
      }).catch((err) => {
        console.warn('[SW] Ошибка при отправке сообщений клиентам:', err);
        return Promise.resolve();
      })
    ]).catch((err) => {
      // Даже если что-то пошло не так - активируем Service Worker
      console.error('[SW] Ошибка активации:', err);
      return Promise.resolve();
    })
  );
});

// Обработка сообщений от клиентов
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
      }).then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' })
          })
        })
      })
    )
  }
})

// Обработка запросов
// Стратегия: для navigation запросов возвращаем index.html, остальное пропускаем напрямую
self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);

  // Пропускаем запросы к API и WebSocket - они должны идти напрямую
  if (reqUrl.pathname.startsWith('/api/') || reqUrl.pathname.startsWith('/socket.io')) {
    return; // Не перехватываем эти запросы
  }

  // Пропускаем запросы к внешним ресурсам
  if (reqUrl.origin !== location.origin) {
    return; // Не перехватываем внешние запросы
  }

  // Проверяем, является ли это navigation запросом (переход на страницу)
  const isNavigationRequest = event.request.mode === 'navigate';

  // Для navigation запросов сразу возвращаем index.html (для SPA роутинга)
  if (isNavigationRequest) {
    event.respondWith(
      fetch('/index.html')
        .catch(() => {
          // Если не можем загрузить из сети - пробуем кеш
          return caches.match('/index.html').then((cached) => {
            if (cached) {
              console.log('[SW] Используем закешированный index.html для навигации');
              return cached;
            }
            // Если и в кеше нет - возвращаем ошибку
            return new Response('Offline - приложение недоступно', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/html' })
            });
          });
        })
    );
    return;
  }

  // Для остальных запросов - пытаемся загрузить из сети, потом кеш
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Успешный ответ - возвращаем как есть
        return response;
      })
      .catch((error) => {
        // Ошибка сети - пробуем кеш (без лишних логов)
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Если кеша нет - бросаем ошибку дальше
          throw error;
        });
      })
  );
});

// Push уведомления
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Новое уведомление от Help-Car',
    icon: '/icons/icon-144x144.png',
    badge: '/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Открыть'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Help-Car', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded');


