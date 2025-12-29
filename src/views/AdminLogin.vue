<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Логотип и заголовок -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
          <span class="text-2xl">🔧</span>
        </div>
        <h2 class="text-3xl font-extrabold text-white">
          Админ-панель
        </h2>
        <p class="mt-2 text-sm text-blue-200">
          Войдите в систему администратора
        </p>
      </div>

      <!-- Форма входа -->
      <form
        class="mt-8 space-y-6"
        @submit.prevent="handleLogin"
      >
        <div class="space-y-4">
          <!-- Имя пользователя -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-white mb-2"
            >
              👤 Имя пользователя
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Введите имя пользователя"
            >
          </div>

          <!-- Пароль -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-white mb-2"
            >
              🔒 Пароль
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Введите пароль"
            >
          </div>
        </div>

        <!-- Сообщение об ошибке -->
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- Кнопка входа -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="loading"
              class="mr-2"
            >⏳</span>
            <span
              v-else
              class="mr-2"
            >🚀</span>
            {{ loading ? 'Вход...' : 'Войти в админ-панель' }}
          </button>
        </div>

        <!-- Ссылка на обычный вход -->
        <div class="text-center">
          <router-link 
            to="/login" 
            class="text-blue-200 hover:text-white text-sm"
          >
            ← Вернуться к обычному входу
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { logger } from '@/utils/logger'
import { apiService } from '@/services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    logger.info('Admin login attempt', { username: form.value.username })
    
    const data = await apiService.adminLogin({
      username: form.value.username,
      password: form.value.password
    })

    if (data.success) {
      // Сохраняем токен админа
      const token = data.token || data.data?.token
      const adminData = data.admin || data.data?.admin
      
      if (!token) {
        error.value = 'Токен не получен от сервера'
        logger.error('Admin login: token missing', { username: form.value.username, data })
        toast.error('Токен не получен от сервера')
        return
      }
      
      localStorage.setItem('adminToken', token)
      localStorage.setItem('admin', JSON.stringify(adminData))
      
      logger.info('Admin login successful', { username: form.value.username })
      
      // Перенаправляем в админ-панель
      router.push('/admin/dashboard')
    } else {
      error.value = data.error || data.message || 'Ошибка входа'
      logger.warn('Admin login failed', { username: form.value.username, error: data.error || data.message })
      toast.error(data.error || data.message || 'Ошибка входа')
    }
  } catch (err) {
    // Обработка ошибок от axios
    let errorMessage = 'Ошибка подключения к серверу'
    
    if (err.response) {
      // Сервер ответил с ошибкой
      const status = err.response.status
      const errorData = err.response.data || {}
      errorMessage = errorData.error || errorData.message || `HTTP ${status}`
      
      if (status === 401) {
        errorMessage = 'Неверное имя пользователя или пароль'
      } else if (status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.'
      }
    } else if (err.request) {
      // Запрос был отправлен, но ответа не получено
      errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.'
    } else if (err.message) {
      errorMessage = err.message
    }
    
    error.value = errorMessage
    logger.error('Admin login error:', { err, message: errorMessage, username: form.value.username })
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

