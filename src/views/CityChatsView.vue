<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <NavigationHeader />
    
    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Хлебные крошки / навигация -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div class="flex items-center gap-2 text-xs sm:text-sm mb-1">
            <router-link
              to="/"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
            >
              🏠 Главная
            </router-link>
            <span class="text-gray-400 dark:text-gray-500">/</span>
            <span class="text-gray-600 dark:text-gray-300 font-semibold">Городские чаты</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            💬 Городские чаты
          </h1>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            to="/map"
            class="px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            🗺 На карту
          </router-link>
          <router-link
            to="/my-chats"
            class="px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            💬 Мои чаты
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Левая панель - Список городов и мои чаты (скрывается на мобильных при выбранном чате) -->
        <div :class="['lg:col-span-1 space-y-6', selectedChat && isMobile ? 'hidden' : 'block']">
          <!-- Мои чаты -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-200">
            <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4">
              Мои чаты
            </h3>
            
            <div
              v-if="myChats.length === 0"
              class="text-center py-8"
            >
              <p class="text-gray-400 dark:text-gray-500 mb-3">
                Вы еще не в чатах
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Выберите город ниже
              </p>
            </div>

            <div
              v-else
              class="space-y-2"
            >
              <button
                v-for="chat in myChats"
                :key="chat.id"
                :class="[
                  'w-full text-left p-4 rounded-xl transition-all',
                  selectedChat?.id === chat.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                ]"
                @click="selectChatMobile(chat)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-bold">
                      {{ chat.city_name }}
                    </h4>
                    <p
                      :class="selectedChat?.id === chat.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'"
                      class="text-sm"
                    >
                      👥 {{ chat.participants_count }} участников
                    </p>
                  </div>
                  <div class="text-2xl">
                    🏙️
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Поиск городов -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-200">
            <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4">
              Присоединиться
            </h3>
            
            <!-- Сообщение о необходимости авторизации -->
            <div
              v-if="!currentUser"
              class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl"
            >
              <p class="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                🔒 Для присоединения к чатам необходимо войти в систему
              </p>
            </div>
            
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Поиск города..."
              class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 transition-colors"
            >

            <div class="space-y-2 max-h-96 overflow-y-auto">
              <!-- Skeleton список городов, когда идёт реальный запрос -->
              <template v-if="loadingCities">
                <div
                  v-for="i in 8"
                  :key="'s'+i"
                  class="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
                >
                  <div class="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded skeleton mb-2" />
                  <div class="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded skeleton" />
                </div>
              </template>

              <template v-else>
                <button
                  v-for="city in filteredCities"
                  :key="city.id"
                  :disabled="isJoining || !currentUser"
                  class="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all group disabled:opacity-50"
                  @click="joinChat(city)"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {{ city.name }}
                      </h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ city.region }}
                      </p>
                    </div>
                    <div class="text-xl">
                      🏙️
                    </div>
                  </div>
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Правая панель - Активный чат -->
        <div :class="['lg:col-span-2', selectedChat && isMobile ? 'col-span-1' : '']">
          <div
            v-if="!selectedChat"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center h-[600px] flex items-center justify-center transition-colors duration-200"
          >
            <div>
              <div class="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  class="w-16 h-16 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-2">
                Выберите чат
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Присоединитесь к чату своего города или выберите из списка
              </p>
            </div>
          </div>

          <div
            v-else
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col transition-colors duration-200"
          >
            <!-- Header чата -->
            <div class="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <!-- Кнопка назад для мобильных -->
              <button
                v-if="isMobile"
                class="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm font-semibold"
                @click="goBackToList"
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
                К списку чатов
              </button>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-black">
                    {{ selectedChat.city_name }}
                  </h3>
                  <p class="text-blue-100 font-semibold">
                    👥 {{ selectedChat.participants_count }} участников • 
                    💬 {{ selectedChat.messages_count }} сообщений
                  </p>
                </div>
                <button
                  class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-bold"
                  @click="leaveChat"
                >
                  Покинуть
                </button>
              </div>
            </div>

            <!-- Сообщения -->
            <div
              ref="messagesContainer"
              class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
            >
              <div
                v-if="loadingMessages"
                class="space-y-3"
              >
                <div
                  v-for="i in 10"
                  :key="'m'+i"
                  class="max-w-md px-4 py-3 rounded-2xl bg-white dark:bg-gray-700"
                >
                  <div class="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded skeleton mb-2" />
                  <div class="h-4 w-64 bg-gray-200 dark:bg-gray-600 rounded skeleton mb-2" />
                  <div class="h-4 w-52 bg-gray-200 dark:bg-gray-600 rounded skeleton" />
                </div>
              </div>

              <div
                v-else-if="messages.length === 0"
                class="text-center py-12"
              >
                <p class="text-gray-400 dark:text-gray-500 font-semibold">
                  Будьте первым, кто напишет!
                </p>
              </div>

              <div
                v-for="message in messages"
                v-else
                :key="message.id"
                :class="[
                  'flex',
                  isMyMessage(message) ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-md px-4 py-3 rounded-2xl',
                    isMyMessage(message)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                  ]"
                >
                  <router-link
                    v-if="!isMyMessage(message)"
                    :to="`/user/${message.sender.id}`"
                    :class="[
                      'text-xs font-bold mb-1 hover:underline block',
                      isMyMessage(message) ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                    ]"
                  >
                    {{ message.sender.full_name }} <PremiumBadge :status="message.sender.premium_status" size="xs" class="inline-block ml-1" /> • ⭐ {{ message.sender.rating || '0.00' }}
                  </router-link>
                  <!-- Image -->
                  <div v-if="message.image_url" class="mb-2">
                    <img 
                      :src="getImageUrl(message.thumbnail_url || message.image_url)" 
                      :alt="message.content || 'Изображение'" 
                      class="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition"
                      style="max-height: 300px; object-fit: contain;"
                      @click="openImageFullscreen(message.image_url)"
                      @error="handleImageError"
                    >
                  </div>
                  <p v-if="message.content" class="text-base">
                    {{ message.content }}
                  </p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      isMyMessage(message) ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                    ]"
                  >
                    {{ formatTime(message.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Индикатор печати -->
              <div
                v-if="someoneTyping"
                class="flex justify-start"
              >
                <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div class="flex space-x-2">
                    <div
                      class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                      style="animation-delay: 0s"
                    />
                    <div
                      class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                      style="animation-delay: 0.2s"
                    />
                    <div
                      class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                      style="animation-delay: 0.4s"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Проверка авторизации для отправки сообщений -->
            <div
              v-if="!currentUser"
              class="p-4 border-t-2 border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/30"
            >
              <div class="text-center">
                <h3 class="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔒 Требуется авторизация
                </h3>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Для отправки сообщений необходимо войти в систему
                </p>
                <div class="flex space-x-2">
                  <router-link
                    to="/login"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                  >
                    Войти
                  </router-link>
                  <router-link
                    to="/register"
                    class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition"
                  >
                    Регистрация
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Ввод сообщения (только для авторизованных) -->
            <div
              v-if="currentUser"
              class="p-4 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <!-- Image preview -->
              <div v-if="selectedImage" class="mb-3 relative inline-block">
                <img 
                  :src="selectedImagePreview" 
                  class="h-20 rounded-lg object-cover"
                >
                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition"
                  @click="removeSelectedImage"
                >
                  ✕
                </button>
                <div v-if="isUploadingImage" class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              
              <form
                class="flex gap-3"
                @submit.prevent="sendMessage"
              >
                <!-- Attach button -->
                <button 
                  type="button"
                  class="px-3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  :disabled="isUploadingImage"
                  @click="triggerImageSelect"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </button>
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  class="hidden"
                  @change="handleImageSelect"
                >
                
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Напишите сообщение..."
                  class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  @input="handleTyping"
                >
                
                <!-- Emoji picker -->
                <div class="relative">
                  <button
                    type="button"
                    class="px-3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xl"
                    @click="showEmojiPicker = !showEmojiPicker"
                  >
                    😊
                  </button>
                  <div 
                    v-if="showEmojiPicker" 
                    class="absolute bottom-12 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50 w-72"
                  >
                    <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                      <button
                        v-for="emoji in emojis"
                        :key="emoji"
                        type="button"
                        class="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                        @click="insertEmoji(emoji)"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  :disabled="(!newMessage.trim() && !selectedImage) || isSending || isUploadingImage"
                  class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSending ? '⏳' : '📤' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fullscreen image modal -->
    <div 
      v-if="fullscreenImage" 
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      @click="fullscreenImage = null"
    >
      <button
        class="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
        @click="fullscreenImage = null"
      >
        ✕
      </button>
      <img :src="getImageUrl(fullscreenImage)" class="max-w-full max-h-full object-contain" @click.stop>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import PremiumBadge from '@/components/PremiumBadge.vue'

const router = useRouter()

const currentUser = ref(null)
const myChats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const searchQuery = ref('')
const loadingMessages = ref(false)
const isSending = ref(false)
const isJoining = ref(false)
const someoneTyping = ref(false)
const messagesContainer = ref(null)
const imageInputRef = ref(null)
const selectedImage = ref(null)
const selectedImagePreview = ref(null)
const isUploadingImage = ref(false)
const fullscreenImage = ref(null)
const showEmojiPicker = ref(false)

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
  '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '🤗', '🤔', '🤭', '🤫',
  '🤬', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '👍', '👎', '👌', '✌️', '🤞', '🤙', '👊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🔥', '⭐', '🎉',
  '🚗', '🚕', '🚙', '🚌', '🛠️', '🔧', '⛽', '📱', '💻', '🏠', '📍', '✅', '❌'
]
let typingTimeout = null
const loadingCities = ref(false)
let socket = null

// Правильное сравнение ID (строки vs числа)
function isMyMessage(message) {
  const myId = String(currentUser.value?.id || '')
  const senderId = String(message.sender?.id || message.sender_id || '')
  return myId && senderId && myId === senderId
}

// Определяем мобильное устройство
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024 // lg breakpoint
})

// Функция для возврата к списку чатов на мобильных
function goBackToList() {
  selectedChat.value = null
  messages.value = []
}

// Выбор чата с учетом мобильной версии
function selectChatMobile(chat) {
  selectChat(chat)
}

// Фильтрация городов
const cities = ref([])
const filteredCities = computed(() => {
  if (!searchQuery.value) return cities.value
  const q = searchQuery.value.toLowerCase()
  return cities.value.filter(c => c.name.toLowerCase().includes(q) || (c.region||'').toLowerCase().includes(q))
})

onMounted(async () => {
  // Загрузка текущего пользователя
  const userData = localStorage.getItem('user')
  if (userData) {
    currentUser.value = JSON.parse(userData)
  }

  // Реальный запрос городов
  await loadCities()

  await loadMyChats()

  const token = localStorage.getItem('token')
  if (token) {
    const wsUrl = window.location.protocol === 'https:'
      ? `wss://${window.location.host}`
      : `ws://${window.location.host}`
    socket = io(wsUrl.replace(/^ws/, 'http'), { auth: { token } })
    setupSocket()
  }
})

onUnmounted(() => {
  if (socket) {
    if (selectedChat.value?.id) {
      socket.emit('city_chat:leave', { cityChatId: selectedChat.value.id })
    }
    socket.disconnect()
    socket = null
  }
})

async function loadMyChats() {
  try {
    const response = await apiService.getMyCityChats()
    // Обрабатываем разные форматы ответа
    if (response.data && Array.isArray(response.data)) {
      myChats.value = response.data
    } else if (Array.isArray(response)) {
      myChats.value = response
    } else {
      myChats.value = []
    }
  } catch (error) {
    console.error('Error loading my chats:', error)
    console.error('Error details:', error.response?.data || error.message)
    myChats.value = []
  }
}

async function loadCities() {
  try {
    loadingCities.value = true
    const res = await apiService.getCities({ limit: 100 })
    // Обрабатываем разные форматы ответа
    if (res.data && Array.isArray(res.data)) {
      cities.value = res.data
    } else if (Array.isArray(res)) {
      cities.value = res
    } else {
      cities.value = []
    }
  } catch (e) {
    console.error('Error loading cities:', e)
    console.error('Error details:', e.response?.data || e.message)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

async function joinChat(city) {
  if (isJoining.value) return

  try {
    isJoining.value = true
    
    const response = await apiService.joinCityChat({
      cityId: city.id,
      cityName: city.name,
      region: city.region
    })

    const chat = response?.data || response
    
    // Добавляем в список если еще нет
    if (!myChats.value.find(c => c.id === chat.id)) {
      myChats.value.push(chat)
    }

    // Выбираем чат (автоматически присоединится к WebSocket комнате)
    selectChat(chat)
  } catch (error) {
    console.error('Error joining chat:', error)
    console.error('Error details:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      alert('Необходима авторизация. Пожалуйста, войдите заново.')
      router.push('/login')
    } else {
      alert('Ошибка присоединения к чату: ' + (error.response?.data?.error || error.message || 'Неизвестная ошибка'))
    }
  } finally {
    isJoining.value = false
  }
}

async function selectChat(chat) {
  selectedChat.value = chat
  messages.value = []
  await loadMessages()
  if (socket) socket.emit('city_chat:join', { cityChatId: chat.id })
}

async function loadMessages() {
  if (!selectedChat.value) return

  try {
    loadingMessages.value = true
    
    const response = await apiService.getCityChatMessages(selectedChat.value.id, {
      limit: 100,
      offset: 0
    })

    // Обрабатываем разные форматы ответа
    let msgs = []
    if (response && response.messages) {
      msgs = response.messages || []
    } else if (response.data && response.data.messages) {
      msgs = response.data.messages || []
    } else if (Array.isArray(response)) {
      msgs = response
    }
    
    // Нормализуем поле даты (сервер может присылать createdAt или created_at)
    messages.value = msgs.map(m => ({
      ...m,
      created_at: m.created_at || m.createdAt
    }))
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
    console.error('Error details:', error.response?.data || error.message)
    if (error.response?.status === 403) {
      alert('Вы не являетесь участником этого чата')
    } else if (error.response?.status === 404) {
      alert('Чат не найден')
    } else if (error.response?.status === 401) {
      alert('Необходима авторизация. Пожалуйста, войдите заново.')
      router.push('/login')
    }
    messages.value = []
  } finally {
    loadingMessages.value = false
  }
}

// Image handling functions
function triggerImageSelect() {
  imageInputRef.value?.click()
}

function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Поддерживаются только изображения: JPEG, PNG, WebP, GIF')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('Максимальный размер изображения: 10 МБ')
    return
  }
  
  selectedImage.value = file
  selectedImagePreview.value = URL.createObjectURL(file)
}

function removeSelectedImage() {
  if (selectedImagePreview.value) {
    URL.revokeObjectURL(selectedImagePreview.value)
  }
  selectedImage.value = null
  selectedImagePreview.value = null
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

function openImageFullscreen(url) {
  fullscreenImage.value = url
}

async function sendMessage() {
  if ((!newMessage.value.trim() && !selectedImage.value) || !selectedChat.value || isSending.value) return

  const content = newMessage.value.trim()
  const imageToSend = selectedImage.value
  
  newMessage.value = ''
  removeSelectedImage()
  
  // Optimistic update с временным ID
  const tempId = 'temp-' + Date.now()
  const tempMessage = {
    id: tempId,
    content,
    sender: currentUser.value,
    city_chat_id: selectedChat.value.id,
    created_at: new Date().toISOString(),
    is_sending: true,
    image_url: imageToSend ? selectedImagePreview.value : null
  }
  messages.value.push(tempMessage)
  
  await nextTick()
  scrollToBottom()

  try {
    isSending.value = true
    
    let image_url = null
    let thumbnail_url = null
    
    // Upload image first if selected
    if (imageToSend) {
      isUploadingImage.value = true
      try {
        const uploadResponse = await apiService.uploadChatImage(imageToSend)
        if (uploadResponse.success) {
          image_url = uploadResponse.image_url
          thumbnail_url = uploadResponse.thumbnail_url
        }
      } finally {
        isUploadingImage.value = false
      }
    }

    const response = await apiService.client.post(`/city-chats/${selectedChat.value.id}/messages`, {
      content: content || '',
      image_url,
      thumbnail_url
    })

    // Заменяем временное сообщение на реальное
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) {
      const realMessage = response?.data || response
      messages.value[idx] = { ...realMessage, is_sending: false }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    // Помечаем как ошибку
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) {
      messages.value[idx].is_failed = true
      messages.value[idx].is_sending = false
    }
  } finally {
    isSending.value = false
  }
}

async function leaveChat() {
  if (!selectedChat.value) return
  if (!confirm(`Покинуть чат "${selectedChat.value.city_name}"?`)) return

  try {
    await apiService.leaveCityChat(selectedChat.value.id)
    
    // Удаляем из списка
    myChats.value = myChats.value.filter(c => c.id !== selectedChat.value.id)
    
    // Покидаем WebSocket комнату
    if (socket) {
      socket.emit('city_chat:leave', { cityChatId: selectedChat.value.id })
    }
    
    selectedChat.value = null
    messages.value = []
  } catch (error) {
    console.error('Error leaving chat:', error)
    alert('Ошибка выхода из чата')
  }
}

function handleTyping() {
  if (!selectedChat.value) return
  if (socket) socket.emit('city_chat:typing', { cityChatId: selectedChat.value.id })
}

function insertEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function setupSocket() {
  socket.on('connect', () => {
    if (selectedChat.value?.id) {
      socket.emit('city_chat:join', { cityChatId: selectedChat.value.id })
    }
  })
  socket.on('city_chat:newMessage', async (payload) => {
    if (payload?.message?.city_chat_id === selectedChat.value?.id) {
      // Не добавляем свои сообщения (они уже добавлены через optimistic update)
      if (isMyMessage(payload.message)) {
        // Обновляем временное сообщение на реальное, если есть
        const tempIdx = messages.value.findIndex(m => 
          m.id?.startsWith?.('temp-') && m.content === payload.message.content
        )
        if (tempIdx !== -1) {
          messages.value[tempIdx] = { ...payload.message, is_sending: false }
        }
        return
      }
      
      // Проверка на дубликаты для чужих сообщений
      const exists = messages.value.some(m => m.id === payload.message.id)
      
      if (!exists) {
        messages.value.push(payload.message)
        await nextTick()
        scrollToBottom()
      }
    }
  })
  socket.on('city_chat:userTyping', (data) => {
    if (data.cityChatId === selectedChat.value?.id && String(data.userId) !== String(currentUser.value?.id || '')) {
      someoneTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { someoneTyping.value = false }, 2000)
    }
  })
}

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return baseUrl.replace('/api/v1', '') + url
}

function handleImageError(event) {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  event.target.style.display = 'none'
}
</script>

