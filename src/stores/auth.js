import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function register(credentials, retries = 2) {
    isLoading.value = true
    error.value = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Registration retry attempt ${attempt}/${retries}`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        }

        const resp = await apiService.register(credentials)
        console.log('🔍 Auth store register response:', resp)
        
        // Проверяем структуру ответа
        if (!resp || !resp.success) {
          throw new Error(resp?.error || 'Неверный формат ответа от сервера')
        }

        const accessToken = resp?.data?.accessToken
        const userData = resp?.data?.user
        const refreshToken = resp?.data?.refreshToken

        console.log('🔍 Extracted accessToken:', accessToken ? 'present' : 'missing')
        console.log('🔍 Extracted userData:', userData ? 'present' : 'missing')
        console.log('🔍 Extracted refreshToken:', refreshToken ? 'present' : 'missing')

        if (!accessToken) {
          throw new Error('Токен не получен от сервера при регистрации')
        }

        if (!userData || !userData.id) {
          throw new Error('Данные пользователя не получены от сервера')
        }

        // Сохраняем все данные атомарно
        token.value = accessToken
        user.value = userData
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        // Устанавливаем токен в API service
        apiService.setToken(accessToken)
        
        // Подключаем WebSocket
        try {
          wsService.connect(accessToken)
        } catch (wsError) {
          console.warn('⚠️ WebSocket connection failed, continuing:', wsError)
        }
        
        console.log('✅ Registration successful, token and user saved')
        
        // Запрашиваем разрешение на уведомления при регистрации
        setTimeout(async () => {
          try {
            // При регистрации всегда запрашиваем (новый пользователь)
            if ('Notification' in window && Notification.permission !== 'granted') {
              console.log('🔔 Notification permission:', Notification.permission, '- requesting...')
              const permission = await Notification.requestPermission()
              console.log('🔔 Permission result:', permission)
            }
            
            // Регистрируем FCM токен
            const { initializePushNotifications } = await import('@/firebase')
            const success = await initializePushNotifications()
            console.log('🔔 FCM registration after register:', success ? '✅ success' : '❌ failed')
            
            // Сохраняем флаг успешной регистрации
            if (success) {
              localStorage.setItem('fcm_registered', 'true')
            }
          } catch (fcmErr) {
            console.warn('⚠️ FCM registration error:', fcmErr)
          }
        }, 1000)
        
        return resp

      } catch (err) {
        console.error(`❌ Registration error (attempt ${attempt + 1}/${retries + 1}):`, err)
        
        // Если это последняя попытка или не сетьевая ошибка - выбрасываем ошибку
        if (attempt === retries || (err.response && err.response.status < 500)) {
          // Используем userMessage из API (уже на русском), либо ответ сервера, либо fallback
          error.value = err.userMessage || err.response?.data?.error || err.response?.data?.message || 'Ошибка регистрации'
          throw err
        }
        
        // Для сетевых ошибок продолжаем retry
        if (!err.response) {
          continue
        }
        
        // Для серверных ошибок (5xx) продолжаем retry
        if (err.response.status >= 500) {
          continue
        }
        
        // Для клиентских ошибок (4xx) не retry
        error.value = err.userMessage || err.response?.data?.error || err.response?.data?.message || 'Ошибка регистрации'
        throw err
      }
    }
    
    // Не должно дойти до сюда, но на всякий случай
    isLoading.value = false
    throw new Error('Не удалось зарегистрироваться после всех попыток')
  }

  async function login(credentials, retries = 2) {
    isLoading.value = true
    error.value = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Login retry attempt ${attempt}/${retries}`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        }

        const resp = await apiService.login(credentials)
        console.log('🔍 Auth store login response:', resp)
        
        // Проверяем структуру ответа
        if (!resp || !resp.success) {
          throw new Error(resp?.error || 'Неверный формат ответа от сервера')
        }

        const accessToken = resp?.data?.accessToken
        const userData = resp?.data?.user
        const refreshToken = resp?.data?.refreshToken

        console.log('🔍 Extracted accessToken:', accessToken ? 'present' : 'missing')
        console.log('🔍 Extracted userData:', userData ? 'present' : 'missing')
        console.log('🔍 Extracted refreshToken:', refreshToken ? 'present' : 'missing')

        if (!accessToken) {
          throw new Error('Токен не получен от сервера')
        }

        if (!userData || !userData.id) {
          throw new Error('Данные пользователя не получены от сервера')
        }

        // Сохраняем все данные атомарно
        token.value = accessToken
        user.value = userData
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        // Устанавливаем токен в API service
        apiService.setToken(accessToken)
        
        // Подключаем WebSocket
        try {
          wsService.connect(accessToken)
        } catch (wsError) {
          console.warn('⚠️ WebSocket connection failed, continuing:', wsError)
        }
        
        console.log('✅ Login successful, token saved')
        
        // Запрашиваем разрешение на уведомления при входе (если FCM токен не зарегистрирован)
        setTimeout(async () => {
          try {
            const fcmRegistered = localStorage.getItem('fcm_registered')
            
            // Если FCM уже зарегистрирован - пропускаем
            if (fcmRegistered === 'true' && 'Notification' in window && Notification.permission === 'granted') {
              console.log('🔔 FCM already registered, skipping')
              return
            }
            
            // Запрашиваем разрешение если не granted
            if ('Notification' in window && Notification.permission !== 'granted') {
              console.log('🔔 Notification permission:', Notification.permission, '- requesting...')
              const permission = await Notification.requestPermission()
              console.log('🔔 Permission result:', permission)
            }
            
            // Регистрируем FCM токен
            const { initializePushNotifications } = await import('@/firebase')
            const success = await initializePushNotifications()
            console.log('🔔 FCM registration after login:', success ? '✅ success' : '❌ failed')
            
            // Сохраняем флаг успешной регистрации
            if (success) {
              localStorage.setItem('fcm_registered', 'true')
            }
          } catch (fcmErr) {
            console.warn('⚠️ FCM registration error:', fcmErr)
          }
        }, 1000)
        
        return resp

      } catch (err) {
        console.error(`❌ Login error (attempt ${attempt + 1}/${retries + 1}):`, err)
        
        // Если это последняя попытка или не сетьевая ошибка - выбрасываем ошибку
        if (attempt === retries || (err.response && err.response.status < 500)) {
          // Используем userMessage из API (уже на русском), либо ответ сервера, либо fallback
          error.value = err.userMessage || err.response?.data?.error || err.response?.data?.message || 'Ошибка входа'
          throw err
        }
        
        // Для сетевых ошибок продолжаем retry
        if (!err.response) {
          continue
        }
        
        // Для серверных ошибок (5xx) продолжаем retry
        if (err.response.status >= 500) {
          continue
        }
        
        // Для клиентских ошибок (4xx) не retry
        error.value = err.userMessage || err.response?.data?.error || err.response?.data?.message || 'Ошибка входа'
        throw err
      }
    }
    
    // Не должно дойти до сюда, но на всякий случай
    isLoading.value = false
    throw new Error('Не удалось войти после всех попыток')
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('fcm_registered')
    wsService.disconnect()
  }

  async function checkAuth() {
    if (!token.value) {
      // Проверяем refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const resp = await apiService.refreshToken(refreshToken)
          if (resp?.success && resp?.data?.accessToken) {
            token.value = resp.data.accessToken
            user.value = resp.data.user || user.value
            localStorage.setItem('token', resp.data.accessToken)
            if (resp.data.refreshToken) {
              localStorage.setItem('refreshToken', resp.data.refreshToken)
            }
            apiService.setToken(resp.data.accessToken)
            return
          }
        } catch (refreshErr) {
          console.warn('⚠️ Refresh token failed, logging out:', refreshErr)
          await logout()
          return
        }
      }
      return
    }

    try {
      apiService.setToken(token.value)
      const resp = await apiService.getMe()
      
      console.log('🔍 checkAuth response:', resp)
      
      // Проверяем структуру ответа
      if (resp && resp.success && resp.data) {
        // Формат: { success: true, data: { user: {...} } }
        user.value = resp.data.user || resp.data
        console.log('✅ User loaded from checkAuth:', user.value?.id, user.value?.full_name)
      } else if (resp && resp.id) {
        // Прямой объект пользователя
        user.value = resp
        console.log('✅ User loaded (direct format):', user.value?.id)
      } else {
        console.error('❌ Invalid user data format:', resp)
        throw new Error('Invalid user data format')
      }
      
      // Обновляем localStorage
      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
        console.log('✅ User saved to localStorage')
      }
      
      // Подключаем WebSocket
      try {
        wsService.connect(token.value)
      } catch (wsError) {
        console.warn('⚠️ WebSocket connection failed:', wsError)
      }
    } catch (err) {
      console.error('❌ checkAuth error:', err)
      console.error('Error details:', err.response?.data || err.message)
      
      // Если это 401, пытаемся обновить токен через refresh
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            console.log('🔄 Attempting token refresh...')
            const resp = await apiService.refreshToken(refreshToken)
            console.log('🔄 Refresh response:', resp)
            
            // Проверяем разные форматы ответа
            const accessToken = resp?.data?.accessToken || resp?.accessToken
            const newRefreshToken = resp?.data?.refreshToken || resp?.refreshToken
            
            if (accessToken) {
              token.value = accessToken
              apiService.setToken(accessToken)
              localStorage.setItem('token', accessToken)
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken)
              }
              console.log('✅ Token refreshed, retrying getMe...')
              
              // Повторная попытка getMe с новым токеном
              try {
                const retryResp = await apiService.getMe()
                console.log('🔄 Retry getMe response:', retryResp)
                
                // Обрабатываем разные форматы ответа
                if (retryResp) {
                  if (retryResp.success && retryResp.data) {
                    user.value = retryResp.data.user || retryResp.data
                  } else if (retryResp.id) {
                    // Прямой объект пользователя
                    user.value = retryResp
                  }
                  
                  if (user.value) {
                    localStorage.setItem('user', JSON.stringify(user.value))
                    console.log('✅ User loaded after token refresh')
                  }
                  
                  // Подключаем WebSocket
                  try {
                    wsService.connect(token.value)
                  } catch (wsError) {
                    console.warn('⚠️ WebSocket connection failed:', wsError)
                  }
                  return // Успешно восстановили сессию
                }
              } catch (retryErr) {
                console.error('❌ Retry getMe after refresh failed:', retryErr)
                // Если retry тоже не удался, продолжаем к logout
              }
            } else {
              console.warn('⚠️ No accessToken in refresh response')
            }
          } catch (refreshErr) {
            console.warn('⚠️ Refresh token failed:', refreshErr)
            console.warn('Refresh error details:', refreshErr.response?.data || refreshErr.message)
          }
        } else {
          console.warn('⚠️ No refresh token available')
        }
      }
      
      // Только если refresh не помог или это не 401 - выходим
      console.error('❌ checkAuth failed, logging out')
      await logout()
    }
  }

  // Обновление профиля
  async function updateProfile(data) {
    try {
      const response = await apiService.updateProfile(data)
      user.value = { ...user.value, ...response.data }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка обновления профиля'
      throw err
    }
  }

  async function forgotPassword(email) {
    try {
      const response = await apiService.forgotPassword(email)
      return response
    } catch (err) {
      console.error('❌ Forgot password error:', err)
      throw err
    }
  }

  async function resetPassword(code, newPassword, email) {
    try {
      const response = await apiService.resetPassword(code, newPassword, email)
      return response
    } catch (err) {
      console.error('❌ Reset password error:', err)
      throw err
    }
  }

  // Принудительное обновление данных пользователя с сервера
  async function refreshUser() {
    if (!token.value) return null
    
    try {
      apiService.setToken(token.value)
      const resp = await apiService.getMe()
      
      if (resp && resp.success && resp.data) {
        user.value = resp.data.user || resp.data
      } else if (resp && resp.id) {
        user.value = resp
      }
      
      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
        console.log('✅ User data refreshed, rating:', user.value.rating)
      }
      
      return user.value
    } catch (err) {
      console.error('❌ refreshUser error:', err)
      return null
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    checkAuth,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshUser
  }
})