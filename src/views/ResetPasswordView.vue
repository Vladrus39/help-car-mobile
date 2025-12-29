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
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                class="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white">
              Help-Car
            </h1>
          </div>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-3">
            Сброс пароля
          </h2>
          <p class="text-lg text-gray-700 dark:text-gray-200 font-semibold">
            Введите код из письма и новый пароль
          </p>
        </div>

        <form
          class="space-y-6"
          @submit.prevent="handleResetPassword"
        >
          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">📧 Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="your@email.com"
            >
          </div>

          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">🔢 Код из письма</label>
            <input
              v-model="code"
              type="text"
              required
              maxlength="6"
              class="w-full px-5 py-4 text-2xl text-center tracking-widest font-mono rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="000000"
            >
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-semibold">
              6-значный код из письма
            </p>
          </div>

          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">🔒 Новый пароль</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
            >
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-semibold">
              Минимум 6 символов
            </p>
          </div>

          <div>
            <label class="block text-base font-black text-gray-900 dark:text-white mb-3">🔒 Подтвердите пароль</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
            >
          </div>

          <div
            v-if="error"
            class="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <p class="text-base text-red-700 font-bold">
              ⚠️ {{ error }}
            </p>
          </div>

          <div
            v-if="success"
            class="p-4 bg-green-50 border-2 border-green-200 rounded-xl"
          >
            <p class="text-base text-green-700 font-bold">
              ✅ {{ success }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-5 px-6 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">🔑 Сохранить новый пароль</span>
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
              Сохранение...
            </span>
          </button>

          <div class="text-center space-y-3">
            <router-link
              to="/forgot-password"
              class="text-blue-600 hover:text-blue-700 font-semibold text-base block"
            >
              🔄 Отправить код повторно
            </router-link>
            <router-link
              to="/login"
              class="text-gray-600 hover:text-gray-700 font-semibold text-base block"
            >
              ← Вернуться ко входу
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  // Если email передан через query param (из ForgotPasswordView)
  if (route.query.email) {
    email.value = route.query.email
  }
})

const handleResetPassword = async () => {
  try {
    error.value = ''
    success.value = ''

    // Проверка совпадения паролей
    if (newPassword.value !== confirmPassword.value) {
      error.value = 'Пароли не совпадают'
      return
    }

    if (newPassword.value.length < 6) {
      error.value = 'Пароль должен быть минимум 6 символов'
      return
    }

    if (code.value.length !== 6) {
      error.value = 'Код должен быть 6 цифр'
      return
    }

    isLoading.value = true

    const response = await authStore.resetPassword(code.value, newPassword.value, email.value)
    
    success.value = response.message || 'Пароль успешно изменён!'
    
    // Через 2 секунды перенаправляем на страницу входа
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при сбросе пароля'
  } finally {
    isLoading.value = false
  }
}
</script>
