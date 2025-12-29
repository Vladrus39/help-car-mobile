<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
    <NavigationHeader />
    
    <div class="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      <!-- Breadcrumb -->
      <div class="mb-4 sm:mb-6">
        <div class="flex items-center gap-2 text-xs sm:text-sm">
          <router-link
            to="/"
            class="text-blue-600 hover:text-blue-800 font-semibold"
          >
            🏠 Главная
          </router-link>
          <span class="text-gray-400">/</span>
          <router-link
            to="/profile"
            class="text-blue-600 hover:text-blue-800 font-semibold"
          >
            👤 Профиль
          </router-link>
          <span class="text-gray-400">/</span>
          <span class="text-gray-600 dark:text-gray-300 font-semibold">Избранные</span>
        </div>
      </div>
      
      <h1 class="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 sm:mb-10 flex items-center gap-3">
        <span class="text-3xl">⭐</span>
        Избранные помощники
      </h1>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="favorites.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">
          ⭐
        </div>
        <h2 class="text-xl font-bold text-gray-700 mb-2">
          Нет избранных помощников
        </h2>
        <p class="text-gray-500 mb-6">
          Добавляйте помощников в избранное, чтобы быстро их находить
        </p>
        <router-link 
          to="/map" 
          class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
        >
          🗺️ Найти помощников на карте
        </router-link>
      </div>

      <!-- Favorites list -->
      <div
        v-else
        class="space-y-4"
      >
        <div 
          v-for="fav in favorites" 
          :key="fav.id"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex items-center gap-4 hover:shadow-xl transition"
        >
          <!-- Avatar -->
          <router-link
            :to="`/user/${fav.helper.id}`"
            class="flex-shrink-0"
          >
            <div class="relative">
              <img 
                v-if="fav.helper.avatar_url" 
                :src="getAvatarUrl(fav.helper.avatar_url)" 
                :alt="fav.helper.full_name"
                class="w-16 h-16 rounded-full object-cover"
              >
              <div 
                v-else 
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
              >
                {{ fav.helper.full_name.charAt(0) }}
              </div>
              <!-- Online indicator -->
              <div 
                v-if="fav.helper.is_online"
                class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
              />
            </div>
          </router-link>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <router-link
              :to="`/user/${fav.helper.id}`"
              class="block"
            >
              <h3 class="font-bold text-gray-800 dark:text-white truncate text-lg">
                {{ fav.helper.full_name }}
              </h3>
            </router-link>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span
                v-if="fav.helper.rating"
                class="flex items-center gap-1"
              >
                ⭐ {{ parseFloat(fav.helper.rating || 5).toFixed(1) }}
              </span>
              <span
                v-if="fav.helper.is_online"
                class="text-green-500"
              >● Онлайн</span>
              <span
                v-else
                class="text-gray-400"
              >○ Офлайн</span>
            </div>
            <p
              v-if="fav.note"
              class="text-sm text-gray-400 dark:text-gray-500 italic truncate mt-1"
            >
              📝 {{ fav.note }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0 flex gap-2">
            <button 
              class="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              :disabled="startingChat === fav.helper.id"
              title="Написать сообщение"
              @click="startChat(fav.helper.id)"
            >
              <span class="text-lg sm:text-xl">💬</span>
            </button>
            <button 
              class="p-2 sm:p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition"
              title="Удалить из избранного"
              @click="removeFavorite(fav.helper.id)"
            >
              <span class="text-lg sm:text-xl">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'

const router = useRouter()

const favorites = ref([])
const loading = ref(true)
const startingChat = ref(null)

const fetchFavorites = async () => {
  try {
    loading.value = true
    const response = await apiService.client.get('/users/favorites')
    favorites.value = response.favorites
  } catch (error) {
    console.error('Error fetching favorites:', error)
  } finally {
    loading.value = false
  }
}

const startChat = async (helperId) => {
  try {
    startingChat.value = helperId
    const response = await apiService.client.post(`/users/${helperId}/chat`)
    if (response.chatId) {
      router.push(`/direct-chat/${response.chatId}`)
    }
  } catch (error) {
    console.error('Error starting chat:', error)
    alert('Не удалось начать чат')
  } finally {
    startingChat.value = null
  }
}

const removeFavorite = async (helperId) => {
  if (!confirm('Удалить из избранного?')) return
  
  try {
    await apiService.client.delete(`/users/${helperId}/favorite`)
    favorites.value = favorites.value.filter(f => f.helper.id !== helperId)
  } catch (error) {
    console.error('Error removing favorite:', error)
    alert('Не удалось удалить из избранного')
  }
}

onMounted(() => {
  fetchFavorites()
})

function getAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}
</script>
