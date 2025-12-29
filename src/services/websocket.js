import { io } from 'socket.io-client'
import { ref } from 'vue'
import soundService from './soundService'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = ref(false)
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(token) {
    if (!token) {
      console.warn('⚠️ WebSocket: токен не предоставлен, пропускаю подключение')
      return
    }
    
    if (this.socket?.connected) {
      console.log('✅ WebSocket уже подключен')
      return
    }

    // Если есть старое соединение, отключаем его
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    // Асинхронное подключение, чтобы не блокировать вход
    setTimeout(() => {
      this._doConnect(token)
    }, 100)
  }

  _doConnect(token) {
    // Compute WS endpoint
    let url
    const envUrl = import.meta.env.VITE_WS_URL
    if (envUrl) {
      // Normalize env URL: under https force wss
      if (window.location.protocol === 'https:' && envUrl.startsWith('ws://')) {
        url = envUrl.replace(/^ws:\/\//, 'wss://')
      } else if (/^https?:\/\//i.test(envUrl)) {
        // Convert http(s) -> ws(s)
        url = envUrl.replace(/^http/i, window.location.protocol === 'https:' ? 'wss' : 'ws')
      } else if (/^wss?:\/\//i.test(envUrl)) {
        url = envUrl
      } else {
        // Host/path only; prefix with correct scheme
        url = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + envUrl
      }
    } else {
      // Use same host as the page, with correct protocol
      url = window.location.protocol === 'https:'
        ? `wss://${window.location.host}`
        : `ws://${window.location.host}`
    }

    // Используем polling как fallback, если websocket не работает
    console.log('🔌 Подключение к WebSocket:', {
      url,
      hasToken: !!token,
      tokenLength: token?.length,
      protocol: window.location.protocol
    })
    
    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'], // Polling как fallback
      upgrade: true,
      rememberUpgrade: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10, // Увеличиваем количество попыток
      timeout: 20000, // Увеличиваем таймаут подключения
      forceNew: false,
      autoConnect: true,
      // Дополнительные опции для стабильности
      withCredentials: true,
      extraHeaders: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected')
      this.isConnected.value = true
      this.reconnectAttempts = 0
      
      // Восстановление слушателей после переподключения
      this.listeners.forEach((callback, event) => {
        this.socket.on(event, callback)
      })
      
      // Настраиваем звуковые уведомления
      this.setupSoundNotifications()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      this.isConnected.value = false
      
      // Если сервер отключил - переподключиться
      if (reason === 'io server disconnect' && this.socket) {
        this.socket.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connect error:', error)
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
        url: url
      })
      this.isConnected.value = false
      
      this.reconnectAttempts++
      
      // Если websocket не работает, пробуем переключиться на polling
      if (this.reconnectAttempts === 3 && this.socket.io.opts.transports.includes('websocket')) {
        console.log('🔄 Переключаюсь на polling transport...')
        this.socket.io.opts.transports = ['polling', 'websocket']
        this.socket.disconnect()
        setTimeout(() => {
          this.socket.connect()
        }, 1000)
        return
      }
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
          if (this.socket && !this.socket.connected) {
            this.socket.connect()
          }
        }, 2000 * this.reconnectAttempts)
      } else {
        console.error('❌ Max reconnection attempts reached. WebSocket will not be available.')
        // Не блокируем работу приложения, просто логируем ошибку
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
    }
  }

  on(event, callback) {
    // Сохраняем listener в любом случае, чтобы восстановить после подключения
    this.listeners.set(event, callback)
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event)
      this.listeners.delete(event)
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected')
    }
  }

  // Helper methods
  sendMessage(chatId, content) {
    this.emit('chat:sendMessage', { chatId, content })
  }

  markMessagesRead(chatId) {
    this.emit('chat:markRead', { chatId })
  }

  sendTypingIndicator(chatId, recipientId) {
    this.emit('chat:typing', { chatId, recipientId })
  }

  updateLocation(latitude, longitude) {
    this.emit('location:update', { latitude, longitude })
  }

  // Настройка звуковых уведомлений для событий
  setupSoundNotifications() {
    if (!this.socket) return

    // Новая заявка поблизости
    this.socket.on('helpRequest:new', (data) => {
      console.log('🆕 Новая заявка:', data)
      soundService.playNotification()
    })

    // Новое сообщение в чате
    this.socket.on('chat:newMessage', (data) => {
      console.log('💬 Новое сообщение:', data)
      soundService.playMessage()
    })

    // Новый отклик на вашу заявку
    this.socket.on('response:new', (data) => {
      console.log('🔔 Новый отклик:', data)
      soundService.playNotification()
    })

    // Ваша заявка принята
    this.socket.on('response:accepted', (data) => {
      console.log('✅ Заявка принята:', data)
      soundService.playSuccess()
    })

    // Заявка завершена
    this.socket.on('helpRequest:completed', (data) => {
      console.log('✅ Заявка завершена:', data)
      soundService.playSuccess()
    })

    // Новая оценка
    this.socket.on('rating:new', (data) => {
      console.log('⭐ Новая оценка:', data)
      soundService.playSuccess()
    })

    // Отмена/отклонение
    this.socket.on('response:cancelled', (data) => {
      console.log('❌ Отклик отменен:', data)
      soundService.playError()
    })
  }
}

export const wsService = new WebSocketService()