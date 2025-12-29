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
            Восстановление пароля
          </h2>
          <p class="text-lg text-gray-700 dark:text-gray-200 font-semibold">
            Введите ваш email
          </p>
        </div>

        <form
          v-if="!codeSent"
          class="space-y-7"
          @submit.prevent="handleForgotPassword"
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
            class="w-full py-5 px-6 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">📨 Отправить код</span>
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
              Отправка...
            </span>
          </button>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-700 font-bold text-lg"
            >
              ← Вернуться к входу
            </router-link>
          </div>
        </form>

        <!-- Показываем после успешной отправки кода -->
        <div
          v-else
          class="text-center"
        >
          <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl">
            <p class="text-lg text-green-700 dark:text-green-300 font-bold mb-2">
              ✅ Код отправлен!
            </p>
            <p class="text-base text-gray-700 dark:text-gray-300">
              Проверьте ваш email: <strong>{{ email }}</strong>
            </p>
          </div>
          
          <router-link
            :to="{ name: 'reset-password', query: { email } }"
            class="inline-block w-full py-5 px-6 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🔑 Ввести код и новый пароль
          </router-link>

          <div class="mt-4">
            <button
              class="text-blue-600 hover:text-blue-700 font-bold text-lg"
              @click="codeSent = false; success = ''; error = ''"
            >
              ← Отправить код повторно
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const codeSent = ref(false)

const handleForgotPassword = async () => {
  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    const response = await authStore.forgotPassword(email.value)
    
    success.value = response.message
    codeSent.value = true
  } catch (err) {
    console.error('❌ Forgot password error:', err)
    // Используем понятное сообщение из interceptor
    error.value = err.userMessage || err.response?.data?.message || err.response?.data?.error || err.message || 'Ошибка при отправке кода'
  } finally {
    isLoading.value = false
  }
}
</script>
