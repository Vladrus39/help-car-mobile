<template>
  <div class="min-h-screen bg-gray-50">
    <NavigationHeader />
    
    <div class="max-w-6xl mx-auto py-8 px-4">
      <!-- Хлебные крошки и навигация -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm">
          <router-link
            to="/"
            class="text-blue-600 hover:text-blue-800 font-semibold"
          >
            🏠 Главная
          </router-link>
          <span class="text-gray-400">/</span>
          <span class="font-semibold text-gray-600">
            Профиль
          </span>
        </div>
        <router-link 
          to="/city-chats"
          class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
        >
          💬 Чаты городов
        </router-link>
      </div>

      <!-- Профиль header -->
      <div class="rounded-2xl shadow-xl p-8 mb-8 bg-white">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-6">
            <!-- Аватар -->
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <span class="text-4xl text-white font-black">
                {{ getInitials(authStore.user?.full_name) }}
              </span>
            </div>
            
            <!-- Информация -->
            <div>
              <h1 class="text-3xl font-black mb-2 text-gray-900">
                {{ authStore.user?.full_name }}
              </h1>
              <p class="text-lg text-gray-600">
                {{ authStore.user?.email }}
              </p>
              <p class="text-sm text-gray-500">
                📞 {{ authStore.user?.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-6 rounded-xl bg-blue-50">
            <div class="text-4xl font-black text-blue-600 mb-1">
              {{ authStore.user?.rating || '0.00' }}
            </div>
            <div class="text-sm font-semibold text-gray-600">
              ⭐ Рейтинг
            </div>
          </div>

          <div class="text-center p-6 rounded-xl bg-green-50">
            <div class="text-4xl font-black text-green-600 mb-1">
              {{ authStore.user?.completed_requests || 0 }}
            </div>
            <div class="text-sm font-semibold text-gray-600">
              🤝 Помощей
            </div>
          </div>

          <div class="text-center p-6 rounded-xl bg-purple-50">
            <div class="text-4xl font-black text-purple-600 mb-1">
              {{ authStore.user?.total_ratings || 0 }}
            </div>
            <div class="text-sm font-semibold text-gray-600">
              💬 Отзывов
            </div>
          </div>

          <div class="text-center p-6 rounded-xl bg-orange-50">
            <div class="text-4xl font-black text-orange-600 mb-1">
              {{ calculateStreak() }}
            </div>
            <div class="text-sm font-semibold text-gray-600">
              🔥 Дней подряд
            </div>
          </div>
        </div>
      </div>

      <!-- График рейтинга -->
      <div class="rounded-2xl shadow-xl p-8 mb-8 bg-white">
        <h3 class="text-2xl font-black mb-6 text-gray-900">
          📈 Рейтинг по времени
        </h3>
        <div class="h-64 flex items-end justify-between gap-2">
          <div
            v-for="(rating, index) in ratingHistory"
            :key="index"
            :style="{ height: `${(rating / 5) * 100}%` }"
            class="flex-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
            :title="`${rating} звезд`"
          />
        </div>
        <div class="flex justify-between mt-4 text-sm text-gray-500">
          <span>30 дней назад</span>
          <span>Сегодня</span>
        </div>
      </div>

      <!-- Достижения -->
      <div class="rounded-2xl shadow-xl p-8 mb-8 bg-white">
        <h3 class="text-2xl font-black mb-6 text-gray-900">
          🏆 Достижения
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl text-center bg-gray-50">
            <div class="text-4xl mb-2">
              🌟
            </div>
            <p class="font-bold text-sm text-gray-900">
              Новичок
            </p>
            <p class="text-xs text-gray-500">
              1 помощь
            </p>
          </div>

          <div
            class="p-4 rounded-xl text-center"
            :class="authStore.user?.completed_requests >= 5 ? 'bg-yellow-50' : 'bg-gray-100 opacity-50'"
          >
            <div class="text-4xl mb-2">
              ⭐
            </div>
            <p class="font-bold text-sm text-gray-900">
              Помощник
            </p>
            <p class="text-xs text-gray-500">
              5 помощей
            </p>
          </div>

          <div
            class="p-4 rounded-xl text-center"
            :class="authStore.user?.completed_requests >= 10 ? 'bg-orange-50' : 'bg-gray-100 opacity-50'"
          >
            <div class="text-4xl mb-2">
              🔥
            </div>
            <p class="font-bold text-sm text-gray-900">
              Профи
            </p>
            <p class="text-xs text-gray-500">
              10 помощей
            </p>
          </div>

          <div
            class="p-4 rounded-xl text-center"
            :class="authStore.user?.rating >= 4.8 ? 'bg-purple-50' : 'bg-gray-100 opacity-50'"
          >
            <div class="text-4xl mb-2">
              👑
            </div>
            <p class="font-bold text-sm text-gray-900">
              Эксперт
            </p>
            <p class="text-xs text-gray-500">
              Рейтинг 4.8+
            </p>
          </div>
        </div>
      </div>

      <!-- Мобильные приложения -->
      <div class="rounded-2xl shadow-xl p-8 bg-white">
        <h3 class="text-2xl font-black mb-6 text-center text-gray-900">
          📱 Установите мобильное приложение
        </h3>
        <p class="text-center mb-8 text-gray-600">
          Используйте RoadHelp в любое время и в любом месте
        </p>
        <MobileAppsDownload :compact="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavigationHeader from '@/components/NavigationHeader.vue'
import MobileAppsDownload from '@/components/MobileAppsDownload.vue'

const authStore = useAuthStore()

// История рейтингов (в будущем: получать с сервера через API)
const ratingHistory = ref([
  4.0, 4.1, 4.2, 4.3, 4.2, 4.4, 4.5, 4.4, 4.6, 4.7,
  4.6, 4.7, 4.8, 4.7, 4.8, 4.9, 4.8, 4.9, 5.0, 4.9,
  4.8, 4.9, 4.8, 4.9, 5.0, 4.9, 4.8, 4.9, 4.8, 4.8
])

function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function calculateStreak() {
  // Подсчет серии дней активности (в будущем: получать с сервера)
  // Пока возвращаем mock значение
  return 7
}
</script>