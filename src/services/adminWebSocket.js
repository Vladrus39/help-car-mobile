import { io } from 'socket.io-client'

class AdminWebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(adminToken) {
    if (this.socket?.connected) {
      return
    }

    const url = window.location.protocol === 'https:'
      ? `wss://${window.location.host}`
      : `ws://${window.location.host}`

    // Подключаемся к admin namespace
    this.socket = io(`${url}/admin`, {
      auth: { token: adminToken },
      query: { token: adminToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ Admin WebSocket connected')
      this.isConnected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Admin WebSocket disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Admin WebSocket connect error:', error)
      this.isConnected = false
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Admin socket not connected')
    }
  }

  // Терминал
  sendTerminalCommand(command) {
    this.emit('terminal:command', { command })
  }

  onTerminalOutput(callback) {
    this.on('terminal:output', callback)
  }

  onTerminalError(callback) {
    this.on('terminal:error', callback)
  }

  onTerminalClose(callback) {
    this.on('terminal:close', callback)
  }
}

export const adminWsService = new AdminWebSocketService()






















