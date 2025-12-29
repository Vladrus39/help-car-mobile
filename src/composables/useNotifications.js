import { ref } from 'vue'

// Глобальное состояние для уведомлений
const notifications = ref([])
const activeNotification = ref(null)

export function useNotifications() {
  /**
   * Добавить уведомление о новом запросе
   */
  function addNotification(request) {
    // Проверяем, не показываем ли уже это уведомление
    if (activeNotification.value?.id === request.id) {
      return
    }

    // Если есть активное уведомление, добавляем в очередь
    if (activeNotification.value) {
      notifications.value.push(request)
      return
    }

    // Показываем уведомление
    activeNotification.value = request
  }

  /**
   * Удалить текущее уведомление и показать следующее
   */
  function removeNotification() {
    activeNotification.value = null

    // Показываем следующее из очереди
    if (notifications.value.length > 0) {
      activeNotification.value = notifications.value.shift()
    }
  }

  /**
   * Очистить все уведомления
   */
  function clearNotifications() {
    notifications.value = []
    activeNotification.value = null
  }

  /**
   * Проверить, есть ли активное уведомление
   */
  function hasActiveNotification() {
    return activeNotification.value !== null
  }

  return {
    activeNotification,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    hasActiveNotification
  }
}

