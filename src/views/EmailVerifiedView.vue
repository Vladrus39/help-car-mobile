<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
      <!-- Успешное подтверждение -->
      <template v-if="status === 'success'">
        <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-5xl">✅</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Email подтверждён!
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Ваш email успешно подтверждён. Теперь вы можете пользоваться всеми функциями приложения.
        </p>
        <div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 mb-6">
          <p class="text-green-700 dark:text-green-300 text-sm">
            ✓ Создание заявок на помощь<br>
            ✓ Помощь другим водителям<br>
            ✓ Восстановление пароля через email
          </p>
        </div>
      </template>

      <!-- Уже подтверждён -->
      <template v-else-if="status === 'already'">
        <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-5xl">ℹ️</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Email уже подтверждён
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Ваш email был подтверждён ранее. Вы можете продолжить использование приложения.
        </p>
      </template>

      <!-- Ошибка -->
      <template v-else>
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-5xl">❌</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ошибка подтверждения
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ errorMessage || 'Не удалось подтвердить email. Возможно, ссылка устарела или уже использована.' }}
        </p>
        <div class="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 mb-6">
          <p class="text-yellow-700 dark:text-yellow-300 text-sm">
            💡 Попробуйте запросить новую ссылку для подтверждения в настройках профиля.
          </p>
        </div>
      </template>

      <!-- Кнопки -->
      <div class="space-y-3">
        <router-link
          to="/dashboard"
          class="block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition"
        >
          🏠 На главную
        </router-link>
        <router-link
          v-if="status !== 'success'"
          to="/profile"
          class="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          ⚙️ Настройки профиля
        </router-link>
      </div>

      <!-- Логотип -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p class="text-gray-400 text-sm">
          🚗 Help-Car.Online — Помощь на дороге
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const status = computed(() => route.query.status || 'error')
const errorMessage = computed(() => route.query.message ? decodeURIComponent(route.query.message) : null)
</script>
