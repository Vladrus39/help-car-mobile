<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
    <NavigationHeader />
    
    <div class="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-4 sm:py-6">
      <!-- Header -->
      <div class="mb-4 sm:mb-6">
        <div class="flex items-center gap-2 text-xs sm:text-sm mb-2">
          <router-link
            to="/"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
          >
            🏠 Главная
          </router-link>
          <span class="text-gray-400">/</span>
          <span class="text-gray-600 dark:text-gray-300 font-semibold">Общий чат</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              🌍 Общий чат
            </h1>
            <p
              v-if="globalChat"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              👥 {{ globalChat.participants_count || 0 }} участников • 
              💬 {{ globalChat.messages_count || 0 }} сообщений
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="onlineCount > 0"
              class="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full"
            >
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {{ onlineCount }} онлайн
            </span>
            <router-link 
              to="/city-chats" 
              class="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              🏙️ Городские
            </router-link>
          </div>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-0">
        <!-- Messages -->
        <div 
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          @scroll="handleScroll"
        >
          <!-- Loading -->
          <div
            v-if="isLoading"
            class="space-y-4"
          >
            <div
              v-for="i in 8"
              :key="'s'+i"
              class="flex gap-3 animate-pulse"
            >
              <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="messages.length === 0"
            class="flex items-center justify-center h-full py-12"
          >
            <div class="text-center">
              <div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <span class="text-5xl animate-bounce">💬</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Пока пусто
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Будьте первым, кто напишет!
              </p>
            </div>
          </div>

          <!-- Messages list -->
          <template v-else>
            <TransitionGroup name="message">
              <div
                v-for="(message, index) in messages"
                :key="message.id"
                :class="[
                  'flex gap-3 group',
                  isMyMessage(message) ? 'flex-row-reverse' : ''
                ]"
              >
                <!-- Avatar -->
                <router-link 
                  v-if="!isMyMessage(message)"
                  :to="`/user/${message.sender?.id}`" 
                  class="flex-shrink-0 group/avatar"
                >
                  <div 
                    v-if="message.sender?.avatar_url"
                    class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-blue-400 transition"
                  >
                    <img
                      :src="getAvatarUrl(message.sender.avatar_url)"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div 
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover/avatar:ring-blue-400 transition"
                  >
                    {{ getInitials(message.sender?.full_name) }}
                  </div>
                </router-link>

                <!-- Message bubble -->
                <div 
                  :class="[
                    'max-w-[75%] sm:max-w-[65%]',
                    isMyMessage(message) ? 'items-end' : 'items-start'
                  ]"
                >
                  <!-- Name and time -->
                  <div 
                    v-if="!isMyMessage(message) && shouldShowName(message, messages[index - 1])"
                    class="flex items-center gap-2 mb-1 ml-1"
                  >
                    <router-link 
                      :to="`/user/${message.sender?.id}`"
                      class="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {{ message.sender?.full_name || 'Пользователь' }}
                    </router-link>
                    <PremiumBadge :status="message.sender?.premium_status" size="xs" />
                    <span
                      v-if="message.sender?.rating"
                      class="text-xs text-yellow-500"
                    >
                      ⭐ {{ parseFloat(message.sender.rating || 5).toFixed(1) }}
                    </span>
                  </div>

                  <div
                    :class="[
                      'px-4 py-3 rounded-2xl break-words transition-all shadow-sm',
                      isMyMessage(message)
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 rounded-bl-md'
                    ]"
                  >
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
                    <p v-if="message.content" class="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                      {{ message.content }}
                    </p>
                  </div>

                  <!-- Time -->
                  <div 
                    :class="[
                      'flex items-center gap-1.5 mt-1 text-xs',
                      isMyMessage(message) ? 'justify-end mr-1' : 'ml-1'
                    ]"
                  >
                    <span class="text-gray-400">{{ formatTime(message.created_at) }}</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </template>

          <!-- Typing indicator -->
          <div
            v-if="someoneTyping"
            class="flex gap-3"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
              <span class="text-lg">👤</span>
            </div>
            <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div class="flex gap-1">
                <span
                  class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                />
                <span
                  class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                />
                <span
                  class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll to bottom button -->
        <button
          v-if="showScrollButton"
          class="absolute bottom-24 right-8 w-12 h-12 bg-white dark:bg-gray-700 shadow-xl rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
          @click="scrollToBottom"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        <!-- Auth required message -->
        <div
          v-if="!currentUser"
          class="p-4 sm:p-6 border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
        >
          <div class="text-center">
            <h3 class="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              🔒 Требуется авторизация
            </h3>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Для отправки сообщений необходимо войти в систему
            </p>
            <div class="flex justify-center gap-3">
              <router-link
                to="/login"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
              >
                Войти
              </router-link>
              <router-link
                to="/register"
                class="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-600/30"
              >
                Регистрация
              </router-link>
            </div>
          </div>
        </div>

        <!-- Input area -->
        <div
          v-if="currentUser"
          class="p-4 sm:p-6 border-t-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
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
            class="flex gap-3 items-end"
            @submit.prevent="sendMessage"
          >
            <!-- Attach button -->
            <button 
              type="button"
              class="hidden sm:flex w-11 h-11 flex-shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              :disabled="isUploadingImage"
              @click="triggerImageSelect"
            >
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <!-- Input -->
            <div class="flex-1 relative">
              <textarea
                ref="inputRef"
                v-model="newMessage"
                placeholder="Напишите сообщение..."
                rows="1"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none max-h-32 text-sm sm:text-base"
                style="overflow-y: auto;"
                @keydown.enter.exact.prevent="sendMessage"
                @input="handleTyping"
              />
            </div>

            <!-- Emoji picker -->
            <div class="relative">
              <button
                type="button"
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xl"
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

            <!-- Send button -->
            <button
              type="submit"
              :disabled="(!newMessage.trim() && !selectedImage) || isSending || isUploadingImage"
              :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
                (newMessage.trim() || selectedImage)
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-600/30 hover:scale-105' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              ]"
            >
              <svg
                v-if="!isSending"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <div
                v-else
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            </button>
          </form>
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { io } from 'socket.io-client'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import PremiumBadge from '@/components/PremiumBadge.vue'

const currentUser = ref(null)
const globalChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(true)
const isSending = ref(false)
const someoneTyping = ref(false)
const showScrollButton = ref(false)
const onlineCount = ref(0)
const messagesContainer = ref(null)
const inputRef = ref(null)
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
let socket = null
let typingTimeout = null

// Правильное сравнение ID (строки vs числа)
function isMyMessage(message) {
  const myId = String(currentUser.value?.id || '')
  const senderId = String(message.sender?.id || message.sender_id || '')
  return myId && senderId && myId === senderId
}

onMounted(async () => {
  // Загружаем пользователя
  const userData = localStorage.getItem('user')
  if (userData) {
    currentUser.value = JSON.parse(userData)
  }

  await joinChat()
  setupWebSocket()
  inputRef.value?.focus()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

// Auto-resize textarea
watch(newMessage, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 128) + 'px'
    }
  })
})

async function joinChat() {
  try {
    isLoading.value = true
    
    // Присоединяемся к глобальному чату
    const response = await apiService.joinGlobalChat()
    
    if (response?.success && response?.data) {
      globalChat.value = response.data
    } else if (response) {
      globalChat.value = response
    }

    if (globalChat.value?.id) {
      await loadMessages()
    }
  } catch (error) {
    console.error('Failed to join global chat:', error)
    // Показываем заглушку при ошибке
    globalChat.value = {
      id: 'demo',
      name: 'Общий чат',
      participants_count: 0,
      messages_count: 0
    }
  } finally {
    isLoading.value = false
  }
}

async function loadMessages() {
  if (!globalChat.value?.id) return

  try {
    const response = await apiService.getGlobalChatMessages(globalChat.value.id, { limit: 100, offset: 0 })
    
    let msgs = []
    if (response?.success && response?.data?.messages) {
      msgs = response.data.messages
    } else if (response?.messages) {
      msgs = response.messages
    } else if (Array.isArray(response)) {
      msgs = response
    }
    
    // Нормализуем поле даты
    messages.value = msgs.map(m => ({
      ...m,
      created_at: m.created_at || m.createdAt
    }))

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
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
  if ((!newMessage.value.trim() && !selectedImage.value) || !globalChat.value?.id || isSending.value) return

  const content = newMessage.value.trim()
  const imageToSend = selectedImage.value
  
  newMessage.value = ''
  removeSelectedImage()

  // Optimistic update
  const tempId = 'temp-' + Date.now()
  const tempMessage = {
    id: tempId,
    content,
    sender: currentUser.value,
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
    
    const response = await apiService.client.post(`/global-chats/${globalChat.value.id}/messages`, {
      content: content || '',
      image_url,
      thumbnail_url
    })
    
    // Заменяем временное сообщение на реальное
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) {
      const realMessage = response?.data || response
      messages.value[idx] = {
        ...realMessage,
        sender: currentUser.value
      }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    // Отмечаем ошибку
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) {
      messages.value[idx].is_failed = true
      messages.value[idx].is_sending = false
    }
  } finally {
    isSending.value = false
  }
}

function handleTyping() {
  if (socket && globalChat.value?.id) {
    socket.emit('global_chat:typing', { globalChatId: globalChat.value.id })
  }
}

function insertEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
  inputRef.value?.focus()
}

function setupWebSocket() {
  const token = localStorage.getItem('token')
  if (!token) return

  const wsUrl = window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`

  socket = io(wsUrl.replace(/^ws/, 'http'), { auth: { token } })

  socket.on('connect', () => {
    if (globalChat.value?.id) {
      socket.emit('global_chat:join', { globalChatId: globalChat.value.id })
    }
  })

  socket.on('global_chat:newMessage', (data) => {
    if (data?.message) {
      // Не добавляем свои сообщения (они уже добавлены через optimistic update)
      if (isMyMessage(data.message)) {
        // Обновляем временное сообщение на реальное, если есть
        const tempIdx = messages.value.findIndex(m => 
          m.id?.startsWith?.('temp-') && m.content === data.message.content
        )
        if (tempIdx !== -1) {
          messages.value[tempIdx] = { ...data.message, is_sending: false }
        }
        return
      }
      
      // Проверка на дубликаты для чужих сообщений
      const exists = messages.value.some(m => m.id === data.message.id)
      
      if (!exists) {
        messages.value.push(data.message)
        nextTick(() => scrollToBottom())
      }
    }
  })

  socket.on('global_chat:typing', (data) => {
    if (data.userId !== currentUser.value?.id) {
      someoneTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { someoneTyping.value = false }, 2000)
    }
  })

  socket.on('global_chat:onlineCount', (count) => {
    onlineCount.value = count
  })
}

function handleScroll() {
  if (!messagesContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  showScrollButton.value = scrollHeight - scrollTop - clientHeight > 200
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    showScrollButton.value = false
  }
}

function shouldShowName(current, previous) {
  if (!previous) return true
  return previous.sender?.id !== current.sender?.id
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'сейчас'
  if (diffMins < 60) return `${diffMins} мин назад`
  
  // Если сегодня - показываем время
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Иначе дата + время
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getAvatarUrl(url) {
  return getImageUrl(url)
}

function getImageUrl(url) {
  if (!url) return ''
  // If already absolute URL or blob, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  // Add API base URL for relative paths
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

function handleImageError(event) {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  event.target.style.display = 'none'
}
</script>

<style scoped>
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
