/**
 * RoadHelp Frontend Application
 * By VladRus39
 * Description: P2P платформа для автомобилистов Help-Car
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { logger } from './utils/logger'
import errorLogger from './services/errorLogger'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Глобальный обработчик ошибок Vue
app.config.errorHandler = (err, instance, info) => {
  const errorMessage = err?.message || err?.toString() || 'Unknown Vue error'
  const errorStack = err?.stack || ''
  logger.error('Vue error:', { 
    message: errorMessage, 
    stack: errorStack, 
    error: err,
    info: info 
  })
  
  // Отправляем в админ-панель (базу данных)
  errorLogger.logError(err instanceof Error ? err : new Error(errorMessage), {
    source: 'frontend',
    category: 'VueError',
    component: instance?.$options?.name || 'Unknown',
    info: info
  })
  
  console.error('Vue Runtime Error:', errorMessage, info)
}

// Глобальный обработчик предупреждений Vue
app.config.warnHandler = (msg, instance, trace) => {
  logger.warn('Vue warning:', msg, 'Trace:', trace)
}

// Регистрация Service Worker с автоматическим обновлением
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Сначала проверяем доступность service-worker.js
    fetch('/service-worker.js', { 
      method: 'HEAD',
      cache: 'no-store'
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Service Worker недоступен: ${response.status} ${response.statusText}`)
      }
      // Регистрируем Service Worker
      return navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none', // Не кешировать сам Service Worker
        scope: '/' // Явно указываем scope
      })
    }).then((registration) => {
      console.log('✅ Service Worker registered:', registration.scope)
      
      // Проверяем обновления каждые 60 секунд
      const updateInterval = setInterval(() => {
        registration.update().catch((updateError) => {
          console.warn('⚠️ Ошибка при обновлении Service Worker:', updateError)
          // Если обновление не удалось, не паникуем - просто логируем
          // Это может быть из-за временных проблем с сетью
        })
      }, 60000)
      
      // Обработка обновления Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          // Обработка ошибок установки нового Service Worker
          newWorker.addEventListener('error', (error) => {
            console.error('❌ Ошибка установки нового Service Worker:', error)
          })
          
          newWorker.addEventListener('statechange', () => {
            console.log(`🔄 Service Worker state changed: ${newWorker.state}`)
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новый Service Worker установлен, перезагружаем страницу
              console.log('🔄 Новый Service Worker установлен, перезагрузка...')
              clearInterval(updateInterval) // Останавливаем интервал перед перезагрузкой
              window.location.reload()
            } else if (newWorker.state === 'activated') {
              console.log('✅ Новый Service Worker активирован')
            } else if (newWorker.state === 'redundant') {
              console.warn('⚠️ Service Worker стал избыточным (redundant)')
              // Это может произойти если новый SW не смог установиться
            }
          })
        }
      })
      
      // Обработка сообщений от Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('🔄 Service Worker обновлен до версии:', event.data.version)
          // Перезагружаем страницу для применения обновлений
          window.location.reload()
        }
        if (event.data && (event.data.type === 'MODULE_404' || event.data.type === 'MODULE_ERROR')) {
          console.error('❌ Ошибка загрузки модуля:', event.data.url)
          logger.warn('⚠️ Модуль не найден, очищаем кеш и перезагружаем...')
          // Очищаем все кеши
          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  console.log('🗑️ Удаляем кеш:', cacheName)
                  return caches.delete(cacheName)
                })
              )
            }).then(() => {
              // Отключаем Service Worker временно
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
              }
              // Перезагружаем страницу
              setTimeout(() => {
                window.location.reload(true)
              }, 500)
            }).catch((err) => {
              console.warn('⚠️ Ошибка при очистке кеша:', err)
              // Перезагружаем страницу даже при ошибке
              setTimeout(() => {
                window.location.reload(true)
              }, 500)
            })
          } else {
            window.location.reload(true)
          }
        }
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          console.log('✅ Кеш очищен')
        }
      })
    }).catch((err) => {
      console.error('❌ Service Worker registration failed:', err)
      
      // Если это ошибка загрузки скрипта, пробуем очистить старые регистрации
      if (err.message && err.message.includes('Failed to update')) {
        console.log('🔄 Пытаемся очистить старые регистрации Service Worker...')
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          return Promise.all(
            registrations.map((reg) => {
              console.log('🗑️ Удаляем старую регистрацию:', reg.scope)
              return reg.unregister()
            })
          )
        }).then(() => {
          console.log('✅ Старые регистрации удалены, перезагружаем страницу...')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }).catch((unregisterError) => {
          console.error('❌ Ошибка при удалении регистраций:', unregisterError)
        })
      }
    })
  })
  
  // Обработка контроллера Service Worker
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      console.log('🔄 Service Worker контроллер изменился, перезагрузка...')
      window.location.reload()
    }
  })
}

// Обработка ошибок загрузки динамических модулей
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Failed to fetch dynamically imported module')) {
      logger.warn('⚠️ Ошибка загрузки модуля, перезагружаем страницу...')
      // Очищаем все кеши и перезагружаем
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('🗑️ Удаляем кеш:', cacheName)
              return caches.delete(cacheName)
            })
          )
        }).then(() => {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
          }
          setTimeout(() => {
            window.location.reload(true)
          }, 500)
        }).catch((err) => {
          console.warn('⚠️ Ошибка при очистке кеша (error handler):', err)
          // Перезагружаем страницу даже при ошибке
          setTimeout(() => {
            window.location.reload(true)
          }, 500)
        })
      } else {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
        }
        setTimeout(() => {
          window.location.reload(true)
        }, 1000)
      }
    }
  })
  
  // Обработка unhandledrejection для динамических импортов
  window.addEventListener('unhandledrejection', (event) => {
    // Обрабатываем ошибки динамических импортов
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch dynamically imported module')) {
      logger.warn('⚠️ Ошибка загрузки модуля (promise rejection), перезагружаем страницу...')
      event.preventDefault()
      // Очищаем все кеши и перезагружаем
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('🗑️ Удаляем кеш:', cacheName)
              return caches.delete(cacheName)
            })
          )
        }).then(() => {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
          }
          setTimeout(() => {
            window.location.reload(true)
          }, 500)
        }).catch((err) => {
          console.warn('⚠️ Ошибка при очистке кеша (unhandledrejection):', err)
          // Перезагружаем страницу даже при ошибке
          setTimeout(() => {
            window.location.reload(true)
          }, 500)
        })
      } else {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
        }
        setTimeout(() => {
          window.location.reload(true)
        }, 1000)
      }
      return
    }
    
    // Обрабатываем все остальные необработанные отклонения промисов
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason || 'Unhandled promise rejection'))
    
    // Логируем ошибку
    logger.error('Unhandled promise rejection:', error)
    
    // Предотвращаем вывод ошибки в консоль браузера
    event.preventDefault()
  })
}

app.mount('#app')
