<template>
  <div class="min-h-screen chat-container flex flex-col">
    <!-- Animated background -->
    <div class="chat-bg-pattern"></div>
    <NavigationHeader />
    
    <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      <!-- Chat Header -->
      <div
        v-if="otherUser"
        class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-lg p-4 flex items-center gap-4 border-b dark:border-gray-700 relative z-20"
      >
        <button 
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" 
          @click="$router.back()"
        >
          <svg
            class="w-6 h-6 text-gray-600 dark:text-gray-400"
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
        </button>
        
        <router-link
          :to="`/user/${otherUser.id}`"
          class="flex items-center gap-3 flex-1 group"
        >
          <div class="relative">
            <div 
              v-if="otherUser.avatar_url"
              class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition"
            >
              <img
                :src="getAvatarUrl(otherUser.avatar_url)"
                :alt="otherUser.full_name"
                class="w-full h-full object-cover"
              >
            </div>
            <div 
              v-else
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold ring-2 ring-transparent group-hover:ring-blue-400 transition"
            >
              {{ getInitials(otherUser.full_name) }}
            </div>
            <!-- Online indicator -->
            <span 
              v-if="otherUser.is_available_to_help" 
              class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
            />
          </div>
          
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {{ otherUser.full_name }}
              </h2>
              <PremiumBadge :status="otherUser.premium_status" size="sm" />
            </div>
            <p
              v-if="isTyping"
              class="text-sm text-blue-500 animate-pulse"
            >
              печатает...
            </p>
            <p
              v-else-if="otherUser.is_available_to_help"
              class="text-sm text-green-500"
            >
              готов помочь
            </p>
            <p
              v-else
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              Личные сообщения
            </p>
          </div>
        </router-link>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button 
            v-if="otherUser && !otherUser.isFriend && !friendRequestSent"
            :disabled="isSendingFriendRequest"
            class="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            @click="sendFriendRequest"
          >
            {{ isSendingFriendRequest ? '...' : '👥 В друзья' }}
          </button>
          <span 
            v-else-if="friendRequestSent" 
            class="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-semibold"
          >
            ✓ Заявка
          </span>
          <span 
            v-else-if="otherUser?.isFriend" 
            class="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold"
          >
            ✓ Друг
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p class="mt-4 text-gray-500 dark:text-gray-400">
            Загрузка...
          </p>
        </div>
      </div>

      <!-- Messages -->
      <div 
        v-else
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-3 messages-area relative"
      >
        <div
          v-if="messages.length === 0"
          class="flex items-center justify-center h-full py-12"
        >
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <span class="text-4xl animate-bounce">💬</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Начните общение!
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Напишите первое сообщение
            </p>
          </div>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            isMyMessage(message) ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[75%] px-4 py-3 rounded-2xl break-words message-bubble',
              isMyMessage(message)
                ? 'message-mine'
                : 'message-other'
            ]"
          >
            <!-- Image -->
            <div v-if="message.image_url" class="mb-2">
              <img 
                :src="getImageUrl(message.thumbnail_url || message.image_url)" 
                :alt="message.content || 'Изображение'" 
                class="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition"
                style="max-height: 300px; object-fit: contain; min-width: 100px; min-height: 100px; background: #f3f4f6;"
                loading="lazy"
                @click="openImageFullscreen(message.image_url)"
                @error="handleImageError"
                @load="(e) => console.log('Картинка загружена:', e.target.src)"
              >
            </div>
            <p v-if="message.content" class="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
              {{ message.content }}
            </p>
            <p
              :class="[
                'text-xs mt-1.5',
                isMyMessage(message) ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
              ]"
            >
              {{ formatTime(message.created_at) }}
            </p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div
          v-if="isTyping"
          class="flex justify-start"
        >
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

      <!-- Input -->
      <div class="p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t dark:border-gray-700 relative z-20">
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
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
          
          <div class="flex-1 relative">
            <textarea
              ref="inputRef"
              v-model="newMessage"
              placeholder="Напишите сообщение..."
              rows="1"
              class="w-full px-4 py-3 bg-gray-100/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-sm sm:text-base transition-all"
              :disabled="isSending"
              style="overflow-y: auto;"
              @keydown.enter.exact.prevent="sendMessage"
              @input="handleTyping"
            />
          </div>
          
          <!-- Emoji picker button -->
          <div class="relative">
            <button
              type="button"
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xl"
              @click="showEmojiPicker = !showEmojiPicker"
            >
              😊
            </button>
            <!-- Emoji panel -->
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
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
              (newMessage.trim() || selectedImage)
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-600/30 hover:scale-105' 
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
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import NavigationHeader from '@/components/NavigationHeader.vue'
import PremiumBadge from '@/components/PremiumBadge.vue'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const chatId = ref(route.params.chatId)
const otherUser = ref(null)
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(true)
const isSending = ref(false)
const isTyping = ref(false)
const isSendingFriendRequest = ref(false)
const friendRequestSent = ref(false)
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

const currentUser = computed(() => authStore.user)

// Правильное сравнение ID (строки vs числа)
const isMyMessage = (message) => {
  const myId = String(currentUser.value?.id || '')
  const senderId = String(message.sender_id || message.sender?.id || '')
  return myId && senderId && myId === senderId
}

// Auto-resize textarea
watch(newMessage, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 128) + 'px'
    }
  })
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  // Use getImageUrl logic for relative URLs
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleTyping = () => {
  if (socket && chatId.value) {
    socket.emit('chat:typing', { chatId: chatId.value })
  }
}

const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
  inputRef.value?.focus()
}

const sendFriendRequest = async () => {
  if (!otherUser.value?.id) return
  
  try {
    isSendingFriendRequest.value = true
    const response = await apiService.sendFriendRequest(otherUser.value.id)
    if (response.success) {
      friendRequestSent.value = true
      if (response.message?.includes('теперь друзья')) {
        otherUser.value.isFriend = true
        friendRequestSent.value = false
      }
    }
  } catch (error) {
    console.error('Failed to send friend request:', error)
    alert(error.response?.data?.message || 'Не удалось отправить заявку')
  } finally {
    isSendingFriendRequest.value = false
  }
}

const checkFriendshipStatus = async (userId) => {
  try {
    const response = await apiService.getFriends()
    // API возвращает { success, count, data: [...] }
    const friends = response?.data || response || []
    const isFriend = friends.some(f => f.friend?.id === userId)
    if (otherUser.value) {
      otherUser.value.isFriend = isFriend
    }
  } catch (error) {
    console.error('Failed to check friendship:', error)
  }
}

const loadChat = async () => {
  try {
    isLoading.value = true
    
    const response = await apiService.client.get(`/chats/${chatId.value}/direct`)
    console.log('Direct chat loaded:', response)
    
    if (response.success) {
      otherUser.value = response.otherUser
      // Messages come as array directly or in response.messages
      messages.value = Array.isArray(response.messages) ? response.messages : []
      
      // DEBUG: проверка картинок в сообщениях
      const messagesWithImages = messages.value.filter(m => m.image_url)
      console.log('Сообщения с картинками:', messagesWithImages.length)
      messagesWithImages.forEach(m => {
        console.log('  - image_url:', m.image_url, '| thumbnail_url:', m.thumbnail_url)
      })
      
      scrollToBottom()
      
      // Проверяем статус дружбы
      if (otherUser.value?.id) {
        await checkFriendshipStatus(otherUser.value.id)
      }
    } else {
      console.error('Failed to load chat - no success:', response)
    }
  } catch (err) {
    console.error('Failed to load chat:', err)
    // Redirect to my-chats if chat not found
    if (err.response?.status === 404) {
      router.push('/my-chats')
    }
  } finally {
    isLoading.value = false
  }
}

// Image handling functions
const triggerImageSelect = () => {
  imageInputRef.value?.click()
}

const handleImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Поддерживаются только изображения: JPEG, PNG, WebP, GIF')
    return
  }
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('Максимальный размер изображения: 10 МБ')
    return
  }
  
  selectedImage.value = file
  selectedImagePreview.value = URL.createObjectURL(file)
}

const removeSelectedImage = (revokeUrl = true) => {
  if (revokeUrl && selectedImagePreview.value) {
    URL.revokeObjectURL(selectedImagePreview.value)
  }
  selectedImage.value = null
  selectedImagePreview.value = null
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

const openImageFullscreen = (url) => {
  fullscreenImage.value = url
}

const sendMessage = async () => {
  if ((!newMessage.value.trim() && !selectedImage.value) || isSending.value) return
  if (!chatId.value || chatId.value === 'undefined') return
  
  const content = newMessage.value.trim()
  const imageToSend = selectedImage.value
  const imagePreview = selectedImagePreview.value  // Сохраняем ДО очистки!
  
  newMessage.value = ''
  removeSelectedImage(false)  // Не revoke URL - он нужен для preview
  
  // Optimistic update
  const tempId = 'temp-' + Date.now()
  messages.value.push({
    id: tempId,
    content,
    sender_id: currentUser.value?.id,
    created_at: new Date().toISOString(),
    is_sending: true,
    image_url: imagePreview  // Используем сохранённый preview
  })
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
    
    const response = await apiService.client.post(`/chats/${chatId.value}/messages`, { 
      content: content || '',
      image_url,
      thumbnail_url
    })
    console.log('Message sent response:', response)
    console.log('Ответ сервера image_url:', response?.data?.image_url, '| thumbnail_url:', response?.data?.thumbnail_url)
    
    if (response.success && response.data) {
      // Заменяем временное сообщение на реальное (сообщение в response.data)
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) {
        messages.value[idx] = { ...response.data, is_sending: false }
      }
      // Теперь можно revoke blob URL
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    } else if (response.success) {
      // Если data нет, просто убираем статус отправки
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) {
        messages.value[idx].is_sending = false
      }
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    // Отмечаем ошибку
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) {
      messages.value[idx].is_failed = true
      messages.value[idx].is_sending = false
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  } finally {
    isSending.value = false
  }
}

const setupSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  const wsUrl = window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`
  
  socket = io(wsUrl.replace(/^ws/, 'http'), { auth: { token } })
  
  socket.on('connect', () => {
    socket.emit('chat:join', { chatId: chatId.value })
  })
  
  socket.on('chat:newMessage', (data) => {
    if (data.chatId === chatId.value && data.message) {
      // Не добавляем свои сообщения (они уже добавлены через optimistic update)
      if (data.message.sender_id === currentUser.value?.id) {
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
        scrollToBottom()
      }
      isTyping.value = false
    }
  })
  
  socket.on('chat:typing', (data) => {
    if (data.chatId === chatId.value && data.userId !== currentUser.value?.id) {
      isTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { isTyping.value = false }, 3000)
    }
  })
}

onMounted(() => {
  // Проверка валидности chatId
  if (!chatId.value || chatId.value === 'undefined' || chatId.value === 'null') {
    console.error('Invalid chatId, redirecting to chats')
    router.push('/my-chats')
    return
  }
  
  loadChat()
  setupSocket()
  inputRef.value?.focus()
})

onUnmounted(() => {
  if (socket) {
    socket.emit('chat:leave', { chatId: chatId.value })
    socket.disconnect()
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  // В production используем текущий origin
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  // Fallback - используем origin
  return window.location.origin + url
}

function handleImageError(event) {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  // Показываем placeholder вместо скрытия
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="%23e5e7eb" width="200" height="150"/><text x="100" y="75" text-anchor="middle" fill="%239ca3af" font-size="14">Ошибка загрузки</text></svg>'
  event.target.style.opacity = '0.7'
}
</script>

<style scoped>
/* ========== MODERN CHAT STYLES ========== */

/* Container */
.chat-container {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dark .chat-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

/* Animated Background Pattern */
.chat-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: float 20s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

/* Messages Area */
.messages-area {
  background: linear-gradient(180deg, 
    rgba(255,255,255,0.95) 0%, 
    rgba(248,250,252,0.98) 100%);
  backdrop-filter: blur(10px);
}

.dark .messages-area {
  background: linear-gradient(180deg, 
    rgba(17,24,39,0.95) 0%, 
    rgba(31,41,55,0.98) 100%);
}

/* Message Bubbles */
.message-bubble {
  animation: message-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-bubble:hover {
  transform: scale(1.01);
}

.message-mine {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-mine:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4),
              0 3px 6px rgba(0, 0, 0, 0.15);
}

.message-other {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0,0,0,0.05);
}

.dark .message-other {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
}

.message-other:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12),
              0 2px 4px rgba(0, 0, 0, 0.08);
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dark .messages-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
