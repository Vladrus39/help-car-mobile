import axios from 'axios'
import axiosRetry from 'axios-retry'

// Prefer explicit VITE_API_BASE_URL, otherwise use same-origin relative API path
// Ensure HTTPS is used in production
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isLocal 
    ? `${window.location.origin}/api/v1`
    : `https://${window.location.hostname}/api/v1`)

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
        
        // Обработка 401 Unauthorized
        // НЕ удаляем токен и НЕ перенаправляем сразу - даем возможность checkAuth обновить токен через refresh
        // Перенаправление будет выполнено в checkAuth, если refresh не помог
        if (error.response?.status === 401) {
          // Только для запросов, которые не связаны с аутентификацией, можно сразу очистить
          // Но для /auth/me и /auth/refresh даем возможность обработать в checkAuth
          const isAuthEndpoint = error.config?.url?.includes('/auth/me') || 
                                 error.config?.url?.includes('/auth/refresh')
          
          if (!isAuthEndpoint) {
            // Для других эндпоинтов можно очистить токен, но не перенаправлять
            // Перенаправление будет выполнено в checkAuth при следующей попытке
            console.warn('⚠️ 401 Unauthorized for non-auth endpoint, token may be invalid')
          }
        }
        
        // Обработка 500 Internal Server Error
        if (error.response?.status >= 500) {
          console.error('Server error:', error.response?.data)
          // Здесь можно добавить toast уведомление
        }
        
        // Обработка сетевых ошибок
        if (!error.response) {
          console.error('Network error - возможно сервер недоступен')
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

  async refreshToken(refreshToken) {
    try {
      const response = await this.client.post('/auth/refresh', { refreshToken })
      return response
    } catch (error) {
      console.error('Refresh token error:', error)
      throw error
    }
  }

  async updateProfile(data) {
    return this.client.patch('/auth/profile', data)
  }

  async changePassword(currentPassword, newPassword) {
    return this.client.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
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
}

export const apiService = new ApiService()