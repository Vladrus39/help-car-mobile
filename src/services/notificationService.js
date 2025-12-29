import { ref, reactive } from 'vue'
import { wsService } from './websocket'
import { apiService } from './api'

class NotificationService {
  constructor() {
    this.notifications = ref([])
    this.currentNotification = ref(null)
    this.isEnabled = ref(false)
    this.location = reactive({
      latitude: null,
      longitude: null,
      accuracy: null
    })
  }

  // Включить уведомления
  async enable() {
    try {
      // Запрашиваем разрешение на геолокацию
      if (navigator.geolocation) {
        const position = await this.getCurrentPosition()
        this.location.latitude = position.coords.latitude
        this.location.longitude = position.coords.longitude
        this.location.accuracy = position.coords.accuracy

        // Отправляем местоположение на сервер
        await apiService.updateLocation(
          this.location.latitude, 
          this.location.longitude
        )

        this.isEnabled.value = true
        this.setupWebSocketListeners()
        console.log('✅ Notifications enabled')
      } else {
        throw new Error('Geolocation not supported')
      }
    } catch (error) {
      console.error('❌ Error enabling notifications:', error)
      throw error
    }
  }

  // Отключить уведомления
  disable() {
    this.isEnabled.value = false
    this.notifications.value = []
    this.currentNotification.value = null
    console.log('🔕 Notifications disabled')
  }

  // Получить текущее местоположение
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 минут
        }
      )
    })
  }

  // Настроить слушатели WebSocket
  setupWebSocketListeners() {
    // Слушаем новые заявки
    wsService.on('helpRequest:new', (notification) => {
      console.log('🔔 New request notification:', notification)
      this.addNotification(notification)
    })

    // Слушаем обновления заявок
    wsService.on('helpRequest:updated', (data) => {
      console.log('📝 Request updated:', data)
      this.updateNotification(data)
    })

    // Слушаем завершение заявок
    wsService.on('helpRequest:completed', (data) => {
      console.log('✅ Request completed:', data)
      this.removeNotification(data.helpRequestId)
    })
  }

  // Добавить уведомление
  addNotification(notification) {
    // Проверяем, не дублируется ли уведомление
    const exists = this.notifications.value.find(n => n.helpRequestId === notification.helpRequestId)
    if (exists) return

    this.notifications.value.push({
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      status: 'new'
    })

    // Показываем первое уведомление
    if (!this.currentNotification.value) {
      this.showNextNotification()
    }
  }

  // Обновить уведомление
  updateNotification(data) {
    const index = this.notifications.value.findIndex(n => n.helpRequestId === data.helpRequestId)
    if (index !== -1) {
      this.notifications.value[index] = {
        ...this.notifications.value[index],
        ...data,
        timestamp: new Date()
      }
    }
  }

  // Удалить уведомление
  removeNotification(helpRequestId) {
    this.notifications.value = this.notifications.value.filter(n => n.helpRequestId !== helpRequestId)
    
    // Если текущее уведомление удалено, показываем следующее
    if (this.currentNotification.value?.helpRequestId === helpRequestId) {
      this.currentNotification.value = null
      this.showNextNotification()
    }
  }

  // Показать следующее уведомление
  showNextNotification() {
    if (this.notifications.value.length > 0) {
      this.currentNotification.value = this.notifications.value[0]
    }
  }

  // Принять заявку
  async acceptRequest(notification) {
    try {
      await apiService.acceptHelpRequest(notification.helpRequestId)
      this.removeNotification(notification.helpRequestId)
      console.log('✅ Request accepted:', notification.helpRequestId)
    } catch (error) {
      console.error('❌ Error accepting request:', error)
      throw error
    }
  }

  // Отклонить заявку
  declineRequest(notification) {
    this.removeNotification(notification.helpRequestId)
    console.log('❌ Request declined:', notification.helpRequestId)
  }

  // Закрыть текущее уведомление
  closeCurrentNotification() {
    this.currentNotification.value = null
    this.showNextNotification()
  }

  // Обновить местоположение
  async updateLocation() {
    if (!this.isEnabled.value) return

    try {
      const position = await this.getCurrentPosition()
      this.location.latitude = position.coords.latitude
      this.location.longitude = position.coords.longitude
      this.location.accuracy = position.coords.accuracy

      await apiService.updateLocation(
        this.location.latitude, 
        this.location.longitude
      )

      console.log('📍 Location updated')
    } catch (error) {
      console.error('❌ Error updating location:', error)
      // Не бросаем ошибку - обновление локации не критично
    }
  }

  // Получить статистику
  getStats() {
    return {
      total: this.notifications.value.length,
      new: this.notifications.value.filter(n => n.status === 'new').length,
      isEnabled: this.isEnabled.value,
      hasLocation: !!(this.location.latitude && this.location.longitude)
    }
  }
}

export const notificationService = new NotificationService()





