<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
    <!-- Фон дневной дороги (SVG) -->
    <div class="absolute inset-0">
      <img
        src="/assets/road-landscape.svg"
        alt=""
        class="w-full h-full object-cover opacity-35"
      >
    </div>
    
    <!-- Overlay градиент -->
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/75 via-blue-900/65 to-cyan-900/75" />
    
    <!-- Эффекты света -->
    <div
      class="absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 0.5s;"
    />
    <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" />

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
        <div class="text-center mb-10">
          <div class="flex items-center justify-center space-x-3 mb-6">
            <!-- Легковой автомобиль -->
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                class="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <h1 class="text-4xl font-black text-gray-900">
              Help-Car
            </h1>
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-3">
            Создать аккаунт
          </h2>
          <p class="text-lg text-gray-700 font-semibold">
            Присоединяйтесь к сообществу
          </p>
        </div>

        <form
          class="space-y-6"
          @submit.prevent="handleRegister"
        >
          <div>
            <label class="block text-base font-black text-gray-900 mb-3">👤 Полное имя</label>
            <input
              v-model="form.full_name"
              type="text"
              autocomplete="name"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Иван Иванов"
            >
          </div>


          <div>
            <label class="block text-base font-black text-gray-900 mb-3">📱 Телефон <span class="text-red-500">*</span></label>
            <input
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="8XXXXXXXXXX или +7XXXXXXXXXX"
            >
            <p class="text-sm text-gray-500 mt-2">
              Номер телефона используется для входа и оплаты по СБП. Форматы: 8XXXXXXXXXX, +7XXXXXXXXXX, 7XXXXXXXXXX
            </p>
          </div>
          
          <div>
            <label class="block text-base font-black text-gray-900 mb-3">📧 Email <span class="text-red-500">*</span></label>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="your@email.com"
            >
            <p class="text-sm text-gray-500 mt-2">
              Email обязателен для восстановления пароля и уведомлений
            </p>
          </div>

          <div>
            <label class="block text-base font-black text-gray-900 mb-3">🔒 Пароль</label>
            <input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Минимум 6 символов"
            >
          </div>

          <div
            v-if="error"
            class="p-5 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <p class="text-base text-red-700 font-bold">
              ⚠️ {{ error }}
            </p>
          </div>

          <div
            v-if="success"
            class="p-5 bg-green-50 border-2 border-green-200 rounded-xl"
          >
            <p class="text-base text-green-700 font-bold">
              ✅ {{ success }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-6 px-6 text-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">🎉 Зарегистрироваться</span>
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
              Регистрация...
            </span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-700 font-semibold text-lg">
            Уже есть аккаунт?
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-700 font-black"
            >
              Войти
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { requestNotificationPermission } from '@/services/webPush'

const router = useRouter()
const rememberMe = ref(true)
console.log('RegisterView mounted, router:', router)

const form = ref({
  full_name: '',
  email: '',
  phone: '',
  password: ''
})

const isLoading = ref(false)
const error = ref(null)
const success = ref(null)

async function handleRegister() {
  isLoading.value = true
  error.value = null
  success.value = null

  try {
    // Валидация на клиенте
    if (!form.value.full_name || !form.value.full_name.trim()) {
      error.value = 'Укажите ваше имя'
      isLoading.value = false
      return
    }

    if (!form.value.phone || !form.value.phone.trim()) {
      error.value = 'Укажите номер телефона'
      isLoading.value = false
      return
    }

    if (!form.value.email || !form.value.email.trim()) {
      error.value = 'Укажите email'
      isLoading.value = false
      return
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      error.value = 'Некорректный формат email'
      isLoading.value = false
      return
    }
    
    // Нормализация и валидация телефона
    let normalizedPhone = form.value.phone.replace(/[\s\-()]/g, '')
    
    // Нормализация российских номеров:
    // 8XXXXXXXXXX -> +7XXXXXXXXXX
    // 7XXXXXXXXXX -> +7XXXXXXXXXX
    if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
      normalizedPhone = '+7' + normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith('7') && normalizedPhone.length === 11 && !normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone
    } else if (!normalizedPhone.startsWith('+') && /^[0-9]{10}$/.test(normalizedPhone)) {
      // Если номер без + и 10 цифр, добавляем +7 для российских номеров
      normalizedPhone = '+7' + normalizedPhone
    }
    
    // Валидация формата телефона
    const phoneRegex = /^\+?[0-9]{10,15}$/
    if (!phoneRegex.test(normalizedPhone)) {
      error.value = 'Некорректный формат телефона. Используйте: 8XXXXXXXXXX, +7XXXXXXXXXX или 7XXXXXXXXXX'
      isLoading.value = false
      return
    }

    if (!form.value.password || form.value.password.length < 6) {
      error.value = 'Пароль должен быть не менее 6 символов'
      isLoading.value = false
      return
    }

    console.log('Отправка регистрации:', { ...form.value, password: '***' })
    
    // Используем реальный auth store
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    
    console.log('📝 Начало регистрации...')
    const result = await authStore.register({
      ...form.value,
      phone: normalizedPhone // Используем нормализованный телефон
    })
    
    console.log('📝 Результат регистрации:', result)
    console.log('📝 authStore.user:', authStore.user)
    console.log('📝 authStore.token:', authStore.token)
    
    // Проверяем что регистрация прошла успешно
    if (!authStore.user || !authStore.token) {
      console.error('❌ Регистрация завершена, но данные не сохранены')
      throw new Error('Регистрация завершена, но данные не сохранены. Попробуйте войти.')
    }
    
    // Сохраняем флаг "Запомнить меня"
    localStorage.setItem('rememberMe', String(rememberMe.value))
    
    // Запрашиваем разрешение на push-уведомления
    try {
      const pushEnabled = await requestNotificationPermission()
      console.log('🔔 Push notifications:', pushEnabled ? 'enabled' : 'disabled')
    } catch (pushError) {
      console.warn('⚠️ Push notifications not available:', pushError)
    }
    
    console.log('✅ Регистрация успешна, переход на карту...')
    success.value = '✅ Аккаунт создан! Переход на карту...'
    
    // Небольшая задержка для отображения сообщения
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Переход на карту (а не на главную)
    router.push('/map')
    
  } catch (err) {
    console.error('Ошибка регистрации:', err)
    try {
      const authStore = await import('@/stores/auth').then(m => m.useAuthStore()).catch((importErr) => {
        console.warn('⚠️ Failed to import auth store:', importErr)
        return null
      })
      if (authStore) {
        error.value = authStore.error || err.response?.data?.error || err.message || 'Ошибка регистрации. Попробуйте снова.'
      } else {
        error.value = err.response?.data?.error || err.message || 'Ошибка регистрации. Попробуйте снова.'
      }
    } catch (importError) {
      console.warn('⚠️ Failed to import auth store:', importError)
      error.value = err.response?.data?.error || err.message || 'Ошибка регистрации. Попробуйте снова.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
