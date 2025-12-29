import axios from 'axios'
import axiosRetry from 'axios-retry'

// Prefer explicit VITE_API_BASE_URL, otherwise use same-origin relative API path
// Use HTTPS in production for secure communication
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isLocal 
    ? `${window.location.origin}/api/v1`
    : `/api/v1`) // Use relative path to inherit protocol from page (http or https)

console.log('🔧 API Service initialized with BASE_URL:', BASE_URL)

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Подхватываем токен из localStorage при инициализации
    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (savedToken) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      }
    } catch (e) {
      // Ignore errors in localStorage access
      console.warn('Could not access localStorage:', e)
    }
    
    // Retry logic для надёжности
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry на network errors и 429 (Too Many Requests)
        return axiosRetry.isNetworkOrIdempotentRequestError(error) 
          || error.response?.status === 429
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(`🔄 Retry attempt ${retryCount} for ${requestConfig.url}`)
      }
    })

    this.client.interceptors.response.use(
      response => response.data,
      error => {
        console.error('API Error:', error)
        
        // Создаем понятное сообщение об ошибке
        let userMessage = 'Произошла ошибка'
        
        if (error.response) {
          const status = error.response.status
          const data = error.response.data
          
          // ПРИОРИТЕТ 1: Сообщение из ответа сервера (если есть)
          if (data?.message) {
            userMessage = data.message
          } else if (data?.error) {
            userMessage = data.error
          } else {
            // ПРИОРИТЕТ 2: Стандартные понятные сообщения по HTTP кодам
            switch (status) {
              case 400:
                userMessage = 'Некорректный запрос. Проверьте введенные данные'
                break
              case 401:
                userMessage = 'Неверные учетные данные. Проверьте email/телефон и пароль'
                break
              case 403:
                userMessage = 'Доступ запрещен. У вас нет прав для выполнения этого действия'
                break
              case 404:
                userMessage = 'Запрошенный ресурс не найден'
                break
              case 409:
                userMessage = 'Конфликт данных. Возможно, такая запись уже существует'
                break
              case 429:
                userMessage = 'Слишком много запросов. Пожалуйста, подождите немного'
                break
              case 500:
                userMessage = 'Внутренняя ошибка сервера. Попробуйте позже'
                break
              case 502:
                userMessage = 'Сервер временно недоступен. Попробуйте позже'
                break
              case 503:
                userMessage = 'Сервис временно недоступен. Ведутся технические работы'
                break
              default:
                userMessage = `Ошибка ${status}. Пожалуйста, попробуйте позже`
            }
          }
          
          // Добавляем понятное сообщение в объект ошибки
          error.userMessage = userMessage
        } else if (error.request) {
          // Запрос был отправлен, но ответа нет
          userMessage = 'Нет связи с сервером. Проверьте подключение к интернету'
          error.userMessage = userMessage
        } else {
          // Ошибка при создании запроса
          userMessage = 'Ошибка при отправке запроса'
          error.userMessage = userMessage
        }
        
        // Обработка 401 Unauthorized - разлогинить пользователя
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          // Перенаправить на страницу входа (кроме главной и публичных страниц)
          const publicPaths = ['/', '/login', '/register', '/map', '/forgot-password', '/reset-password', '/global-chat']
          const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/user/'))
          if (!isPublicPath) {
            window.location.href = '/login'
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  setToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  // Auth
  async register(data) {
    return this.client.post('/auth/register', data)
  }

  async login(data) {
    // Отправляем как x-www-form-urlencoded, чтобы обойти проблемы JSON-парсинга на backend
    const form = new URLSearchParams()
    if (data?.email) form.append('email', data.email)
    if (data?.phone) form.append('phone', data.phone)
    if (data?.login) {
      // На случай, если UI передаёт в одном поле
      if (data.login.includes('@')) form.append('email', data.login)
      else form.append('phone', data.login)
    }
    if (data?.password) form.append('password', data.password)

    return this.client.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }

  async getMe() {
    return this.client.get('/auth/me')
  }

  async updateProfile(data) {
    return this.client.patch('/auth/profile', data)
  }

  async forgotPassword(email) {
    return this.client.post('/auth/forgot-password', { email })
  }

  async resetPassword(code, newPassword, email) {
    return this.client.post('/auth/reset-password', { code, newPassword, email })
  }

  async refreshToken(refreshToken) {
    return this.client.post('/auth/refresh-token', { refreshToken })
  }

  // Admin Auth
  async adminLogin(data) {
    return this.client.post('/admin/login', data)
  }

  // Help Requests
  async createHelpRequest(data) {
    return this.client.post('/help-requests', data)
  }

  async getHelpRequests(params) {
    // Отключаем кэш браузера для получения свежих данных
    return this.client.get('/help-requests', { 
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
  }

  async getMyRequests() {
    return this.client.get('/help-requests/my')
  }

  async getHelpRequest(id) {
    return this.client.get(`/help-requests/${id}`)
  }

  async acceptHelpRequest(id) {
    return this.client.post(`/help-requests/${id}/accept`)
  }

  async completeHelpRequest(id) {
    return this.client.post(`/help-requests/${id}/complete`)
  }

  async cancelHelpRequest(id, reason) {
    return this.client.post(`/help-requests/${id}/cancel`, { reason })
  }

  // Chat
  async getMyChats() {
    return this.client.get('/chats/my')
  }

  async getChatByRequest(requestId) {
    return this.client.get(`/chats/help-request/${requestId}`)
  }

  async getChatMessages(chatId, params) {
    return this.client.get(`/chats/${chatId}/messages`, { params })
  }

  async sendChatMessage(chatId, content) {
    return this.client.post(`/chats/${chatId}/messages`, { content })
  }

  async getDirectChats() {
    return this.client.get('/chats/direct')
  }

  // Upload chat image (returns URL to use in message)
  async uploadChatImage(imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    return this.client.post('/upload/chat-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Ratings
  async createRating(requestId, data) {
    return this.client.post(`/ratings/help-request/${requestId}`, data)
  }

  async getUserRatings(userId) {
    return this.client.get(`/ratings/user/${userId}`)
  }

  // Notifications
  async updateLocation(latitude, longitude) {
    return this.client.put('/notifications/location', { latitude, longitude })
  }

  async getNearbyHelpers(requestId, radius = 10) {
    return this.client.get(`/notifications/help-request/${requestId}/nearby-helpers`, { 
      params: { radius } 
    })
  }

  // Payments
  async createPayment(requestId, amount, paymentMethod = 'card') {
    return this.client.post(`/payments/help-request/${requestId}`, { 
      amount, 
      payment_method: paymentMethod 
    })
  }

  async confirmPayment(paymentId) {
    return this.client.post(`/payments/${paymentId}/confirm`)
  }

  async getUserPayments(limit = 20, offset = 0) {
    return this.client.get('/payments', { 
      params: { limit, offset } 
    })
  }

  async getPaymentStats() {
    return this.client.get('/payments/stats')
  }

  async getPaymentById(paymentId) {
    return this.client.get(`/payments/${paymentId}`)
  }

  // SBP платежи с взаимным подтверждением
  async createSBPPayment(data) {
    return this.client.post('/payments/sbp/create', data)
  }

  async confirmPaymentAsPayer(paymentId, receiptUrl = null) {
    return this.client.post(`/payments/${paymentId}/confirm-payer`, { receipt_url: receiptUrl })
  }

  async confirmPaymentAsReceiver(paymentId) {
    return this.client.post(`/payments/${paymentId}/confirm-receiver`)
  }

  // P2P платежи (старый способ - совместимость)
  async createP2PPayment(data) {
    return this.createSBPPayment(data)
  }

  async confirmP2PPayment(paymentId, data) {
    return this.confirmPaymentAsPayer(paymentId, data?.receipt_url)
  }

  async getRatingStatus(requestId) {
    return this.client.get(`/ratings/help-request/${requestId}/status`)
  }

  // Responses
  async createResponse(requestId, data) {
    return this.client.post(`/requests/${requestId}/responses`, data)
  }

  async acceptResponse(responseId) {
    return this.client.post(`/responses/${responseId}/accept`)
  }

  async rejectResponse(responseId, reason) {
    return this.client.post(`/responses/${responseId}/reject`, { reason })
  }

  async getResponsesForRequest(requestId) {
    return this.client.get(`/requests/${requestId}/responses`)
  }

  // Получить все мои отклики (как помощника)
  async getMyResponses(status = null) {
    const params = status ? { status } : {}
    return this.client.get('/responses/my', { params })
  }

  async deleteHelpRequest(requestId) {
    return this.client.delete(`/help-requests/${requestId}`)
  }

  async uploadRequestImages(requestId, images) {
    const formData = new FormData()
    images.forEach((img) => {
      formData.append('images', img.file)
    })
    // Backend route is /upload/requests/:requestId/images
    return this.client.post(`/upload/requests/${requestId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async uploadAvatar(avatarFile) {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    // Backend route is /upload/avatar
    return this.client.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async uploadCarPhoto(formData) {
    // Backend route is /upload/car-photo
    return this.client.post('/upload/car-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // City Chats
  async joinCityChat(cityData) {
    return this.client.post('/city-chats/join', cityData)
  }

  async getMyCityChats() {
    return this.client.get('/city-chats/my-chats')
  }

  async getCityChatMessages(cityChatId, params) {
    return this.client.get(`/city-chats/${cityChatId}/messages`, { params })
  }

  async sendCityChatMessage(cityChatId, content) {
    return this.client.post(`/city-chats/${cityChatId}/messages`, { content })
  }

  async leaveCityChat(cityChatId) {
    return this.client.post(`/city-chats/${cityChatId}/leave`)
  }

  async getCities(params) {
    return this.client.get('/city-chats/cities', { params })
  }

  // ========== Global Chat API ==========
  
  // Присоединиться к глобальному чату
  async joinGlobalChat() {
    return this.client.post('/global-chats/join')
  }

  // Получить сообщения глобального чата
  async getGlobalChatMessages(globalChatId, params) {
    return this.client.get(`/global-chats/${globalChatId}/messages`, { params })
  }

  // Отправить сообщение в глобальный чат
  async sendGlobalChatMessage(globalChatId, content) {
    return this.client.post(`/global-chats/${globalChatId}/messages`, { content })
  }

  // Покинуть глобальный чат
  async leaveGlobalChat(globalChatId) {
    return this.client.delete(`/global-chats/${globalChatId}/leave`)
  }

  // ========== Friends API ==========
  
  // Получить список друзей
  async getFriends() {
    return this.client.get('/friends')
  }

  // Получить количество друзей и заявок
  async getFriendCount() {
    return this.client.get('/friends/count')
  }

  // Получить входящие заявки в друзья
  async getPendingFriendRequests() {
    return this.client.get('/friends/requests/pending')
  }

  // Получить исходящие заявки в друзья
  async getSentFriendRequests() {
    return this.client.get('/friends/requests/sent')
  }

  // Поиск пользователей для добавления в друзья
  async searchUsersForFriends(query) {
    return this.client.get('/friends/search', { params: { query } })
  }

  // Отправить заявку в друзья
  async sendFriendRequest(friendId, message = null) {
    return this.client.post('/friends/request', { friend_id: friendId, message })
  }

  // Принять заявку в друзья
  async acceptFriendRequest(friendshipId) {
    return this.client.post(`/friends/${friendshipId}/accept`)
  }

  // Отклонить заявку в друзья
  async rejectFriendRequest(friendshipId) {
    return this.client.post(`/friends/${friendshipId}/reject`)
  }

  // Удалить друга / Отменить заявку
  async removeFriend(friendshipId) {
    return this.client.delete(`/friends/${friendshipId}`)
  }
}

export const apiService = new ApiService()