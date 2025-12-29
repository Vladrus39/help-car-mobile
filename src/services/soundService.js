// Сервис для воспроизведения звуковых уведомлений
class SoundService {
  constructor() {
    this.sounds = {
      notification: null,
      message: null,
      success: null,
      error: null
    }
    this.enabled = true
    this.volume = 0.7
    this.initSounds()
  }

  initSounds() {
    // Основной звук уведомления
    this.sounds.notification = new Audio('/notification.mp3')
    this.sounds.notification.volume = this.volume

    // Звук сообщения (более мягкий)
    this.sounds.message = new Audio('/notification.mp3')
    this.sounds.message.volume = this.volume * 0.6

    // Звук успеха
    this.sounds.success = new Audio('/notification.mp3')
    this.sounds.success.volume = this.volume * 0.8

    // Звук ошибки/предупреждения
    this.sounds.error = new Audio('/notification.mp3')
    this.sounds.error.volume = this.volume * 0.9
  }

  // Воспроизвести звук с проверкой настроек пользователя
  async play(type = 'notification') {
    try {
      // Проверяем настройки пользователя из localStorage
      const userSettings = JSON.parse(localStorage.getItem('user') || '{}')
      const soundEnabled = userSettings.notify_sound !== false
      
      if (!this.enabled || !soundEnabled) {
        console.log('🔇 Sound disabled by user settings')
        return
      }

      const sound = this.sounds[type] || this.sounds.notification
      
      // Останавливаем предыдущее воспроизведение
      sound.currentTime = 0
      
      // Воспроизводим
      await sound.play()
      console.log(`🔊 Playing ${type} sound`)
    } catch (error) {
      console.warn('Failed to play sound:', error.message)
    }
  }

  // Быстрые методы для разных типов
  playNotification() {
    return this.play('notification')
  }

  playMessage() {
    return this.play('message')
  }

  playSuccess() {
    return this.play('success')
  }

  playError() {
    return this.play('error')
  }

  // Включить/выключить звуки
  setEnabled(enabled) {
    this.enabled = enabled
    localStorage.setItem('soundEnabled', enabled)
  }

  // Установить громкость
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    Object.values(this.sounds).forEach(sound => {
      if (sound) sound.volume = this.volume
    })
    localStorage.setItem('soundVolume', this.volume)
  }

  // Проверка поддержки браузером
  isSupported() {
    return typeof Audio !== 'undefined'
  }
}

// Экспорт singleton
const soundService = new SoundService()
export default soundService
