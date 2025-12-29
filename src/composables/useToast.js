import { ref, readonly } from 'vue'

// Глобальное состояние toast уведомлений
const toasts = ref([])
let toastId = 0

/**
 * Composable для работы с toast уведомлениями
 * Используется глобально во всех компонентах
 */
export function useToast() {
  
  /**
   * Добавить toast уведомление
   * @param {Object} options
   * @param {'success' | 'error' | 'warning' | 'info'} options.type - тип уведомления
   * @param {string} options.title - заголовок (опционально)
   * @param {string} options.message - сообщение
   * @param {number} options.duration - длительность в мс (0 = бесконечно)
   */
  function addToast({ type = 'info', title = '', message, duration = 5000 }) {
    const id = ++toastId
    const toast = {
      id,
      type,
      title,
      message,
      duration,
      progress: 100,
      createdAt: Date.now()
    }
    
    toasts.value.push(toast)
    
    if (duration > 0) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const idx = toasts.value.findIndex(t => t.id === id)
        if (idx !== -1) {
          toasts.value[idx].progress = Math.max(0, 100 - (elapsed / duration) * 100)
        }
        
        if (elapsed >= duration) {
          clearInterval(interval)
          removeToast(id)
        }
      }, 50)
      
      toast.intervalId = interval
    }
    
    return id
  }
  
  /**
   * Удалить toast по id
   */
  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const toast = toasts.value[index]
      if (toast.intervalId) {
        clearInterval(toast.intervalId)
      }
      toasts.value.splice(index, 1)
    }
  }
  
  /**
   * Очистить все toast
   */
  function clearAll() {
    toasts.value.forEach(t => {
      if (t.intervalId) clearInterval(t.intervalId)
    })
    toasts.value = []
  }
  
  // Короткие методы
  const success = (message, title = '') => addToast({ type: 'success', title, message })
  const error = (message, title = '') => addToast({ type: 'error', title, message })
  const warning = (message, title = '') => addToast({ type: 'warning', title, message })
  const info = (message, title = '') => addToast({ type: 'info', title, message })
  
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
