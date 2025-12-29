/**
 * Альтернатива Sentry для frontend
 * Отправляет ошибки в backend для сохранения в базу данных
 */

class ErrorLogger {
  constructor() {
    this.apiBase = '/api/v1'
  }

  /**
   * Отправка ошибки на сервер
   */
  async logError(error, context = {}) {
    try {
      const errorData = {
        level: 'error',
        message: error.message || String(error),
        stack: error.stack || null,
        source: context.source || 'frontend',
        category: context.category || 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        extra_data: {
          ...context,
          timestamp: new Date().toISOString()
        }
      }

      // Получаем ID пользователя из localStorage
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.id) {
          errorData.user_id = user.id
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }

      // Отправляем на сервер (не ждем ответа, чтобы не блокировать)
      fetch(`${this.apiBase}/admin/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Игнорируем ошибки отправки
      })

      // Также логируем в консоль
      console.error('Error logged:', error, context)
    } catch (e) {
      // Если не удалось отправить, просто логируем в консоль
      console.error('Failed to log error:', error, e)
    }
  }

  /**
   * Отправка сообщения на сервер
   */
  async logMessage(message, level = 'info', context = {}) {
    try {
      const errorData = {
        level,
        message: String(message),
        source: context.source || 'frontend',
        category: context.category || 'info',
        url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        extra_data: {
          ...context,
          timestamp: new Date().toISOString()
        }
      }

      // Отправляем на сервер
      fetch(`${this.apiBase}/admin/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Игнорируем ошибки отправки
      })

      // Также логируем в консоль
      if (level === 'error') {
        console.error(message, context)
      } else if (level === 'warning') {
        console.warn(message, context)
      } else {
        console.log(message, context)
      }
    } catch (e) {
      console.error('Failed to log message:', message, e)
    }
  }
}

export default new ErrorLogger()
























