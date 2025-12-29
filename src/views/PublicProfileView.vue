<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <NavigationHeader v-if="currentUser" />
    
    <!-- Simple header for guests -->
    <header
      v-else
      class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg py-4 px-6"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <router-link
          to="/"
          class="flex items-center space-x-2 hover:opacity-80 transition text-white"
        >
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg
              class="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <span class="text-xl font-black">Help Car</span>
        </router-link>
        <router-link
          to="/login"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition"
        >
          Войти
        </router-link>
      </div>
    </header>
    
    <div class="max-w-2xl mx-auto py-8 px-4">
      <!-- Loading -->
      <div
        v-if="isLoading"
        class="text-center py-20"
      >
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-semibold">
          Загрузка профиля...
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="text-center py-20"
      >
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">😔</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Пользователь не найден
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ error }}
        </p>
        <router-link 
          to="/map" 
          class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        >
          ← На карту
        </router-link>
      </div>

      <!-- Profile -->
      <div
        v-else-if="user"
        class="space-y-6"
      >
        <!-- Back button -->
        <button 
          class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition" 
          @click="$router.back()"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="font-semibold">Назад</span>
        </button>

        <!-- Profile Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div class="flex flex-col items-center text-center">
            <!-- Avatar -->
            <div class="relative">
              <div 
                v-if="user.avatar_url"
                class="w-28 h-28 rounded-full overflow-hidden shadow-lg mb-4"
              >
                <img 
                  :src="getAvatarUrl(user.avatar_url)" 
                  :alt="user.full_name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div 
                v-else
                class="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4"
              >
                {{ getInitials(user.full_name) }}
              </div>
              <!-- Online indicator -->
              <div 
                v-if="user.is_online" 
                class="absolute bottom-4 right-0 w-5 h-5 bg-green-500 border-3 border-white rounded-full"
                title="Онлайн"
              />
              <!-- Helper badge -->
              <div 
                v-if="user.is_available_to_help" 
                class="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                title="Готов помочь"
              >
                <span class="text-lg">🚗</span>
              </div>
            </div>

            <!-- Name & Online status -->
            <h1 class="text-2xl font-black text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              {{ user.full_name }}
              <span
                v-if="user.is_verified"
                class="text-blue-500"
                title="Подтверждён"
              >✅</span>
              <span
                v-if="user.is_online"
                class="text-sm font-normal text-green-500"
              >● онлайн</span>
              <span
                v-else-if="user.last_seen"
                class="text-sm font-normal text-gray-400"
              >{{ getLastSeen(user.last_seen) }}</span>
            </h1>
            
            <!-- Helper status badge -->
            <div
              v-if="user.is_available_to_help"
              class="mb-4"
            >
              <span class="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                🟢 Готов помочь в радиусе {{ user.help_radius_km || 10 }} км
              </span>
            </div>
            
            <!-- Rating -->
            <div
              v-if="user.rating"
              class="flex items-center gap-1 mb-4"
            >
              <span class="text-yellow-500 text-xl">⭐</span>
              <span class="text-lg font-bold text-gray-700 dark:text-gray-200">{{ parseFloat(user.rating || 5).toFixed(1) }}</span>
              <span class="text-sm text-gray-400">из 5</span>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 w-full max-w-md mb-6">
              <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-blue-600">
                  {{ stats.requests || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  Заявок
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-green-600">
                  {{ stats.helps || 0 }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  Помог
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-purple-600">
                  {{ formatResponseTime(stats.avgResponseTime) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  Время ответа
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Car Info -->
        <div
          v-if="user.car"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
        >
          <h2 class="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🚗 Автомобиль
          </h2>
          <div class="flex items-center gap-4">
            <div
              v-if="user.car.photo_url"
              class="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
            >
              <img
                :src="getAvatarUrl(user.car.photo_url)"
                alt="Авто"
                class="w-full h-full object-cover"
              >
            </div>
            <div
              v-else
              class="w-24 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <span class="text-3xl">🚗</span>
            </div>
            <div class="flex-1">
              <div class="font-bold text-gray-900 dark:text-white">
                {{ user.car.brand }} {{ user.car.model }}
                <span
                  v-if="user.car.year"
                  class="text-gray-500 dark:text-gray-400 font-normal"
                >({{ user.car.year }})</span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <span v-if="user.car.color">🎨 {{ user.car.color }}</span>
              </div>
              <div
                v-if="user.car.type"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                {{ getCarTypeLabel(user.car.type) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Skills -->
        <div
          v-if="user.skills && hasAnySkill"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
        >
          <h2 class="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🛠️ Навыки и оборудование
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-if="user.skills.has_jumper_cables"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">⚡</span>
              <span class="text-xs font-medium">Провода</span>
            </div>
            <div
              v-if="user.skills.has_tow_rope"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">🧵</span>
              <span class="text-xs font-medium">Трос</span>
            </div>
            <div
              v-if="user.skills.has_fuel_canister"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">⛽</span>
              <span class="text-xs font-medium">Канистра</span>
            </div>
            <div
              v-if="user.skills.has_compressor"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">💨</span>
              <span class="text-xs font-medium">Компрессор</span>
            </div>
            <div
              v-if="user.skills.can_change_tire"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">🛞</span>
              <span class="text-xs font-medium">Замена колеса</span>
            </div>
            <div
              v-if="user.skills.has_tools"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">🧰</span>
              <span class="text-xs font-medium">Инструменты</span>
            </div>
            <div
              v-if="user.skills.is_mechanic"
              class="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            >
              <span class="text-lg">👨‍🔧</span>
              <span class="text-xs font-medium">Автослесарь</span>
            </div>
          </div>
        </div>
        
        <!-- Stats detailed -->
        <div
          v-if="user.total_helps_given || user.total_earned"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
        >
          <h2 class="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📈 Статистика
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl text-center">
              <div class="text-2xl font-black text-green-600">
                {{ user.total_helps_given || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                🤝 Помощей оказано
              </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl text-center">
              <div class="text-2xl font-black text-purple-600">
                {{ formatMoney(user.total_earned || 0) }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                💰 Заработано
              </div>
            </div>
          </div>
        </div>

        <!-- Отзывы -->
        <div 
          v-if="reviews.length > 0"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
        >
          <h2 class="text-xl font-black text-gray-900 dark:text-white mb-4">
            ⭐ Отзывы ({{ reviews.length }})
          </h2>
          <div class="space-y-4">
            <div
              v-for="review in reviews.slice(0, showAllReviews ? reviews.length : 3)"
              :key="review.id"
              class="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl"
            >
              <div class="flex items-start gap-3">
                <img 
                  v-if="review.rater?.avatar_url"
                  :src="getAvatarUrl(review.rater.avatar_url)"
                  class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  alt=""
                >
                <div 
                  v-else
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                >
                  {{ getInitials(review.rater?.full_name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <router-link
                      :to="`/user/${review.rater?.id}`"
                      class="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition truncate"
                    >
                      {{ review.rater?.full_name || 'Пользователь' }}
                    </router-link>
                    <div class="flex items-center gap-1 text-yellow-500">
                      <span v-for="s in review.rating" :key="s">⭐</span>
                      <span v-for="s in (5 - review.rating)" :key="'e'+s" class="text-gray-300">☆</span>
                    </div>
                  </div>
                  <p 
                    v-if="review.comment"
                    class="text-gray-600 dark:text-gray-300 text-sm mb-1"
                  >
                    {{ review.comment }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ formatReviewDate(review.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            v-if="reviews.length > 3"
            class="mt-4 w-full py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? 'Скрыть' : `Показать все (${reviews.length})` }}
          </button>
        </div>

        <!-- Member since -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <p class="text-gray-400 dark:text-gray-500 text-sm text-center">
            На сервисе с {{ formatDate(user.created_at) }}
          </p>
        </div>
        
        <!-- Action buttons -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <div
            v-if="currentUser && !isOwnProfile"
            class="space-y-3"
          >
            <button
              :disabled="isStartingChat"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition shadow-lg disabled:opacity-50"
              @click="startDirectChat"
            >
              {{ isStartingChat ? 'Загрузка...' : '💬 Написать сообщение' }}
            </button>
            <button
              :disabled="isTogglingFavorite"
              :class="[
                'w-full px-6 py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50',
                isFavorite 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              @click="toggleFavorite"
            >
              {{ isTogglingFavorite ? 'Загрузка...' : (isFavorite ? '⭐ В избранном' : '☆ Добавить в избранное') }}
            </button>
            <button
              :disabled="isAddingFriend"
              class="w-full px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition shadow-lg disabled:opacity-50"
              @click="addToFriends"
            >
              {{ isAddingFriend ? 'Загрузка...' : (isFriend ? '✅ В друзьях' : '👥 Добавить в друзья') }}
            </button>
          </div>

          <!-- Login prompt -->
          <div
            v-else-if="!currentUser"
            class="space-y-3"
          >
            <router-link
              to="/login"
              class="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-center text-lg hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
            >
              🔐 Войдите, чтобы написать
            </router-link>
          </div>
          
          <!-- Own profile -->
          <div
            v-else
            class="text-center"
          >
            <router-link
              to="/profile"
              class="inline-block px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              ✏️ Редактировать профиль
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = ref(null)
const stats = ref({ requests: 0, helps: 0 })
const reviews = ref([])
const showAllReviews = ref(false)
const isLoading = ref(true)
const isStartingChat = ref(false)
const isTogglingFavorite = ref(false)
const isAddingFriend = ref(false)
const isFavorite = ref(false)
const isFriend = ref(false)
const error = ref(null)

const currentUser = computed(() => authStore.user)
const isOwnProfile = computed(() => currentUser.value?.id === user.value?.id)

const hasAnySkill = computed(() => {
  if (!user.value?.skills) return false
  return Object.values(user.value.skills).some(v => v === true)
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  // Убираем /api/v1 из baseUrl для статических файлов
  const staticBaseUrl = baseUrl.replace('/api/v1', '')
  return `${staticBaseUrl}${url}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'недавно'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const formatResponseTime = (minutes) => {
  if (!minutes && minutes !== 0) return '-'
  if (minutes < 1) return '<1 мин'
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ч`
  const days = Math.round(hours / 24)
  return `${days} дн`
}

const formatMoney = (amount) => {
  if (!amount) return '0 ₽'
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽'
}

const getLastSeen = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'был(а) только что'
  if (diffMins < 60) return `был(а) ${diffMins} мин назад`
  if (diffHours < 24) return `был(а) ${diffHours} ч назад`
  if (diffDays < 7) return `был(а) ${diffDays} дн назад`
  
  return 'был(а) давно'
}

const getCarTypeLabel = (type) => {
  const types = {
    sedan: 'Седан',
    hatchback: 'Хэтчбек',
    suv: 'Внедорожник',
    crossover: 'Кроссовер',
    wagon: 'Универсал',
    minivan: 'Минивэн',
    pickup: 'Пикап',
    coupe: 'Купе',
    truck: 'Грузовик'
  }
  return types[type] || type
}

const formatReviewDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffDays === 0) return 'сегодня'
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дней назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const loadProfile = async () => {
  const userId = route.params.id
  
  try {
    isLoading.value = true
    error.value = null
    
    const response = await apiService.client.get(`/users/${userId}/public`)
    user.value = response.user
    stats.value = response.stats || { requests: 0, helps: 0 }
    
    // Статус друга приходит напрямую из API
    if (response.is_friend !== undefined) {
      isFriend.value = response.is_friend
    }
    
    // Загружаем отзывы
    try {
      const ratingsResponse = await apiService.getUserRatings(userId)
      reviews.value = ratingsResponse.data?.data || []
    } catch (e) {
      console.error('Failed to load reviews:', e)
      reviews.value = []
    }
    
    // Check if favorite
    if (currentUser.value) {
      try {
        const favResponse = await apiService.client.get(`/users/${userId}/is-favorite`)
        isFavorite.value = favResponse.isFavorite
      } catch (e) {
        console.error('Failed to check favorite status:', e)
      }
    }
  } catch (err) {
    console.error('Failed to load public profile:', err)
    error.value = err.response?.data?.message || 'Не удалось загрузить профиль'
  } finally {
    isLoading.value = false
  }
}

const startDirectChat = async () => {
  if (!user.value?.id) return
  
  try {
    isStartingChat.value = true
    const response = await apiService.client.post(`/users/${user.value.id}/chat`)
    
    if (response.chatId) {
      // Navigate to chat
      router.push(`/direct-chat/${response.chatId}`)
    }
  } catch (err) {
    console.error('Failed to start chat:', err)
    alert(err.response?.data?.message || 'Не удалось начать чат')
  } finally {
    isStartingChat.value = false
  }
}

const toggleFavorite = async () => {
  if (!user.value?.id) return
  
  try {
    isTogglingFavorite.value = true
    
    if (isFavorite.value) {
      await apiService.client.delete(`/users/${user.value.id}/favorite`)
      isFavorite.value = false
    } else {
      await apiService.client.post(`/users/${user.value.id}/favorite`)
      isFavorite.value = true
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
    alert(err.response?.data?.message || 'Не удалось изменить избранное')
  } finally {
    isTogglingFavorite.value = false
  }
}

const addToFriends = async () => {
  if (!user.value?.id || isFriend.value) return
  
  try {
    isAddingFriend.value = true
    await apiService.client.post('/friends/request', { friend_id: user.value.id })
    isFriend.value = true
  } catch (err) {
    console.error('Failed to add friend:', err)
    // May already be friends or request sent
    if (err.response?.status === 409) {
      isFriend.value = true
    } else {
      alert(err.response?.data?.message || 'Не удалось добавить в друзья')
    }
  } finally {
    isAddingFriend.value = false
  }
}

onMounted(async () => {
  // Убедимся что auth state загружен
  if (!authStore.user && localStorage.getItem('token')) {
    await authStore.checkAuth()
  }
  loadProfile()
})
</script>
