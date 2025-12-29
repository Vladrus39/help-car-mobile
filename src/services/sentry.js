import * as Sentry from '@sentry/vue'
import { browserTracingIntegration } from '@sentry/vue'

/**
 * Инициализация Sentry для error tracking
 */
export function initSentry(app, router) {
  // ВРЕМЕННО ОТКЛЮЧЕНО - rate limit 429 errors
  console.log('⚠️ Sentry отключен (временно)')
  return
  
  // Инициализируем Sentry только в production
  if (!import.meta.env.PROD) {
    console.log('⚠️ Sentry отключен в development режиме')
    return
  }
  
  Sentry.init({
    app,
    dsn: 'https://4d0271d96fcfc1d96cb60e81dfb68cd5@o4510443643863040.ingest.de.sentry.io/4510443706777680',
    sendDefaultPii: true,
    integrations: [
      browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        // Опции приватности (опционально)
        // maskAllText: true,  // Маскировать весь текст
        // blockAllMedia: true, // Блокировать все медиа
      }),
    ],
    tracesSampleRate: 0.1, // 10% of traces to avoid 429 rate limits
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 0.5, // 50% of error sessions
    environment: import.meta.env.VITE_ENV || 'production',
    release: `roadhelp@${import.meta.env.VITE_APP_VERSION || '2.0.0'}`,
    // Отключаем debug UI и тестовые кнопки
    debug: false,
    enabled: true,
    // Отключаем Spotlight и другие UI элементы
    _experiments: {
      enableSpotlight: false
    },
    // Отключаем автоматическое создание тестовых элементов
    autoSessionTracking: true,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    beforeSend(event) {
      // Добавляем информацию о пользователе, но не блокируем события
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.id) {
        event.user = {
          id: user.id,
          email: user.email,
          username: user.full_name
        }
      }
      return event
    },
  })
  
  // Исправляем обработчики тестовых кнопок Sentry, чтобы они работали правильно
  if (typeof window !== 'undefined') {
    const fixSentryTestButtons = () => {
      // Ищем тестовые кнопки Sentry
      const allElements = Array.from(document.querySelectorAll('button, a, div, span'))
      
      allElements.forEach(el => {
        const text = (el.textContent || el.innerText || '').trim()
        const isTestButton = /test.*sentry|sentry.*test|test.*error.*sentry|test.*error.*sent|sentry.*verification|verification.*sentry|test.*error.*from.*sentry/i.test(text)
        
        // Проверяем, что это визуальная кнопка
        const isVisualButton = el.style.position === 'fixed' || 
                               el.classList.toString().includes('fixed') ||
                               (el.style.bottom && el.style.right)
        
        if (isTestButton && isVisualButton && 
            (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'DIV' || el.tagName === 'SPAN')) {
          try {
            // Исправляем обработчик клика, чтобы он правильно отправлял тестовую ошибку
            const originalOnClick = el.onclick
            if (originalOnClick) {
              el.onclick = (event) => {
                try {
                  // Вызываем оригинальный обработчик в безопасном контексте
                  if (typeof originalOnClick === 'function') {
                    originalOnClick.call(el, event)
                  }
                } catch (error) {
                  // Если возникает ошибка, отправляем её правильно в Sentry
                  console.log('✅ Отправка тестовой ошибки Sentry для проверки интеграции')
                  Sentry.captureException(new Error('Test error from Sentry verification'), {
                    tags: {
                      test: true,
                      verification: true
                    },
                    level: 'info'
                  })
                }
              }
            } else {
              // Если нет обработчика, добавляем правильный
              el.onclick = (event) => {
                event.preventDefault()
                event.stopPropagation()
                console.log('✅ Отправка тестовой ошибки Sentry для проверки интеграции')
                Sentry.captureException(new Error('Test error from Sentry verification'), {
                  tags: {
                    test: true,
                    verification: true
                  },
                  level: 'info'
                })
              }
            }
            
            // Также исправляем addEventListener, если используется
            const originalAddEventListener = el.addEventListener
            el.addEventListener = function(type, listener, options) {
              if (type === 'click' && listener) {
                const wrappedListener = (event) => {
                  try {
                    if (typeof listener === 'function') {
                      listener.call(this, event)
                    }
                  } catch (error) {
                    console.log('✅ Отправка тестовой ошибки Sentry для проверки интеграции')
                    Sentry.captureException(new Error('Test error from Sentry verification'), {
                      tags: {
                        test: true,
                        verification: true
                      },
                      level: 'info'
                    })
                  }
                }
                return originalAddEventListener.call(this, type, wrappedListener, options)
              }
              return originalAddEventListener.call(this, type, listener, options)
            }
            
            console.log('✅ Исправлен обработчик тестовой кнопки Sentry')
          } catch (e) {
            console.warn('Не удалось исправить кнопку:', e)
          }
        }
      })
    }
    
    // Исправляем несколько раз с разными задержками
    setTimeout(fixSentryTestButtons, 500)
    setTimeout(fixSentryTestButtons, 1000)
    setTimeout(fixSentryTestButtons, 2000)
    setTimeout(fixSentryTestButtons, 3000)
    
    // Наблюдаем за изменениями DOM и исправляем новые кнопки
    const observer = new MutationObserver(() => {
      fixSentryTestButtons()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
  
  console.log('✅ Sentry initialized')
}

/**
 * Ручная отправка ошибки в Sentry
 */
export function captureError(error, context = {}) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    })
  } else {
    console.error('Error:', error, 'Context:', context)
    // В development режиме не отправляем в Sentry
  }
}

/**
 * Отправка кастомного события
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, {
      level,
      extra: context
    })
  } else {
    console.log(`[${level}]`, message, context)
  }
}

/**
 * Установка user context
 */
export function setUser(user) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.full_name
    })
  }
}

/**
 * Очистка user context
 */
export function clearUser() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null)
  }
}

export default {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  clearUser
}

