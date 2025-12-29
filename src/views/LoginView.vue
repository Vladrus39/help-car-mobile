<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
    <!-- Фон ночной дороги (SVG) -->
    <div class="absolute inset-0">
      <img
        src="/assets/night-road.svg"
        alt=""
        class="w-full h-full object-cover opacity-40"
      >
    </div>
    
    <!-- Overlay градиент -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/80" />
    
    <!-- Эффект света -->
    <div class="absolute top-0 left-1/3 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
        <div class="text-center mb-10">
          <div class="flex items-center justify-center space-x-3 mb-6">
            <!-- Легковой автомобиль -->
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                class="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white">
              Help-Car
            </h1>
          </div>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-3">
            Вход в аккаунт
          </h2>
          <p class="text-lg text-gray-700 dark:text-gray-200 font-semibold">
            Добро пожаловать обратно!
          </p>
        </div>

        <form
          class="space-y-7"
          @submit.prevent="handleLogin"
        >
          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">📧 Email или 📱 Телефон</label>
            <input
              v-model="form.emailOrPhone"
              type="text"
              autocomplete="username"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="your@email.com или +79001234567"
            >
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-semibold">
              Можно ввести email или номер телефона
            </p>
          </div>

          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">🔒 Пароль</label>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
            >
          </div>

          <div class="text-center">
            <router-link
              to="/forgot-password"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-base"
            >
              🔑 Забыли пароль?
            </router-link>
          </div>

          <div
            v-if="error"
            class="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <p class="text-base text-red-700 font-bold">
              ⚠️ {{ error }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-5 px-6 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">🚀 Войти</span>
            <span
              v-else
              class="flex items-center justify-center"
            >
              <svg
                class="animate-spin h-6 w-6 mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Вход...
            </span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-700 dark:text-gray-200 font-semibold">
            Нет аккаунта?
            <router-link
              to="/register"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black"
            >
              Зарегистрироваться
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { requestNotificationPermission } from '@/services/webPush'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const rememberMe = ref(false)
console.log('LoginView mounted, router:', router)

const form = ref({
  emailOrPhone: '',
  password: ''
})

const isLoading = ref(false)
const error = ref(null)

// Проверяем сохранённого пользователя при загрузке
const checkSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('savedUser')
    if (!savedUser) return
    const userData = JSON.parse(savedUser)
    if (userData && typeof userData === 'object') {
      form.value.emailOrPhone = userData.emailOrPhone || ''
    }
  } catch (e) {
    // Повреждённые данные — очищаем и продолжаем без краша UI
    localStorage.removeItem('savedUser')
  }
}

// Вызываем при загрузке компонента
checkSavedUser()

async function handleLogin() {
  isLoading.value = true
  error.value = null

  try {
    // Определяем тип ввода (email или телефон)
    const input = form.value.emailOrPhone.trim()
    const isEmail = input.includes('@')
    const isPhone = /^\+?\d{10,12}$/.test(input.replace(/[\s\-()]/g, ''))
    
    if (!isEmail && !isPhone) {
      throw new Error('Введите корректный email или номер телефона')
    }
    
    console.log('Вход:', isEmail ? 'по email' : 'по телефону', input)
    
    // ИСПРАВЛЕНИЕ: отправляем только нужное поле
    const credentials = {
      password: form.value.password
    }
    
    if (isEmail) {
      credentials.email = input
    } else if (isPhone) {
      credentials.phone = input
    }
    
    console.log('🚀 Starting login process with:', { ...credentials, password: '***' })
    const data = await auth.login(credentials)
    console.log('✅ Login successful:', data)
    
    // Сохраняем флаг "Запомнить меня"
    localStorage.setItem('rememberMe', String(rememberMe.value))
    localStorage.setItem('savedUser', JSON.stringify({ emailOrPhone: input }))
    console.log('💾 User preferences saved')
    
    // Запрашиваем разрешение на push-уведомления
    try {
      const pushEnabled = await requestNotificationPermission()
      console.log('🔔 Push notifications:', pushEnabled ? 'enabled' : 'disabled')
    } catch (pushError) {
      console.warn('⚠️ Push notifications not available:', pushError)
    }
    
    // Переход на главную страницу
    console.log('🔄 Redirecting to /...')
    // Проверяем, есть ли редирект после входа
    const redirect = route.query.redirect
    if (redirect) {
      router.push(redirect)
    } else {
      router.push('/map')
    }
    console.log('✅ Redirect completed')
    
  } catch (err) {
    console.error('❌ Login error:', err)
    // Используем userMessage из API (понятное сообщение на русском)
    error.value = err.userMessage || err.response?.data?.error || err.response?.data?.message || auth.error || 'Ошибка входа'
  } finally {
    isLoading.value = false
  }
}
</script>
