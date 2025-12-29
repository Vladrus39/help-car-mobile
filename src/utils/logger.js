/**
 * Frontend Logger - простое логирование без Sentry
 */

import errorLogger from '@/services/errorLogger'

const isDevelopment = import.meta.env.DEV

class Logger {
  log(...args) {
    if (isDevelopment) {
      console.log(...args)
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(...args)
    }
  }

  warn(...args) {
    console.warn(...args)
  }

  error(...args) {
    console.error(...args)
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(...args)
    }
  }

  table(...args) {
    if (isDevelopment) {
      console.table(...args)
    }
  }

  group(label) {
    if (isDevelopment) {
      console.group(label)
    }
  }

  groupEnd() {
    if (isDevelopment) {
      console.groupEnd()
    }
  }
}

export const logger = new Logger()

// Глобальная обработка ошибок с отправкой в админ-панель
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Global error:', event.error)
    
    // Отправка в админ-панель (базу данных)
    if (event.error) {
      errorLogger.logError(event.error, {
        source: 'frontend',
        category: 'GlobalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    } else if (event.message) {
      errorLogger.logError(new Error(event.message), {
        source: 'frontend',
        category: 'GlobalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason)
    
    // Отправка в админ-панель (базу данных)
    if (event.reason instanceof Error) {
      errorLogger.logError(event.reason, {
        source: 'frontend',
        category: 'UnhandledRejection'
      })
    } else {
      errorLogger.logError(new Error(String(event.reason)), {
        source: 'frontend',
        category: 'UnhandledRejection',
        reason: event.reason
      })
    }
  })
}
