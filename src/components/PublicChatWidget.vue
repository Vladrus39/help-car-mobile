<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    :class="[fullHeight ? 'h-full' : 'max-h-[600px]']"
  >
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-black">
            💬 Публичный чат
          </h3>
          <p class="text-blue-100 font-semibold">
            {{ messagesCount }} сообщений
          </p>
        </div>
        <button
          v-if="onClose"
          class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          @click="onClose"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-slate-900"
    >
      <div
        v-if="isLoading"
        class="text-center py-12"
      >
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p class="mt-4 text-gray-600 dark:text-gray-300 font-semibold">
          Загрузка...
        </p>
      </div>

      <!-- Ошибка доступа -->
      <div
        v-else-if="error"
        class="text-center py-12"
      >
        <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-red-500 dark:text-red-400 font-semibold mb-2">
          Нет доступа к чату
        </p>
        <p class="text-gray-400 text-sm">
          {{ error }}
        </p>
        <p class="text-gray-400 text-sm mt-2">
          Чат доступен только участникам заявки
        </p>
      </div>

      <div
        v-else-if="messages.length === 0"
        class="text-center py-12"
      >
        <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-10 h-10 text-gray-400"
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
        <p class="text-gray-400 dark:text-gray-500 font-semibold">
          Пока нет сообщений
        </p>
        <p class="text-gray-400 text-sm mt-1">
          Начните обсуждение!
        </p>
      </div>

      <div
        v-for="message in messages"
        v-else
        :key="message.id"
        class="flex gap-3"
      >
        <!-- Avatar -->
        <router-link
          :to="`/user/${message.sender?.id}`"
          class="flex-shrink-0"
        >
          <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-black hover:ring-2 hover:ring-blue-300 transition">
            {{ getInitials(message.sender?.full_name || 'User') }}
          </div>
        </router-link>

        <!-- Message Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 mb-1">
            <router-link 
              :to="`/user/${message.sender?.id}`"
              class="font-black text-gray-900 dark:text-white hover:text-blue-600 transition cursor-pointer"
            >
              {{ message.sender?.full_name || 'Пользователь' }}
            </router-link>
            <PremiumBadge :status="message.sender?.premium_status" size="xs" />
            <span class="text-xs text-gray-400">{{ formatTime(message.created_at) }}</span>
          </div>
          
          <div class="bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm">
            <p class="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {{ message.content }}
            </p>
            
            <!-- Image -->
            <div
              v-if="message.image_url"
              class="mt-3"
            >
              <div
                class="relative group cursor-pointer inline-block"
                @click="openImageViewer({ url: message.image_url, thumbnail_url: message.thumbnail_url })"
              >
                <img
                  :src="getImageUrl(message.thumbnail_url || message.image_url)"
                  alt="Изображение"
                  class="max-w-full max-h-48 object-cover rounded-xl"
                  @error="handleImageError"
                >
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800">
      <!-- Image Preview -->
      <div
        v-if="selectedImages.length > 0"
        class="mb-3 flex gap-2 flex-wrap"
      >
        <div
          v-for="(image, index) in selectedImages"
          :key="index"
          class="relative w-20 h-20 rounded-lg overflow-hidden group"
        >
          <img
            :src="image.preview"
            :alt="`Preview ${index + 1}`"
            class="w-full h-full object-cover"
          >
          <button
            class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            @click="removeImage(index)"
          >
            ×
          </button>
        </div>
        <button
          v-if="selectedImages.length < 5"
          class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition"
          @click="$refs.fileInput.click()"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- Проверка авторизации для отправки сообщений -->
      <div
        v-if="!isAuthenticated"
        class="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-4"
      >
        <div class="text-center">
          <h3 class="text-lg font-bold text-yellow-800 mb-2">
            🔒 Требуется авторизация
          </h3>
          <p class="text-sm text-yellow-700 mb-3">
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

      <form
        v-if="isAuthenticated"
        class="flex gap-3"
        @submit.prevent="sendMessage"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileSelect"
        >
        
        <button
          v-if="selectedImages.length === 0"
          type="button"
          class="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
          title="Прикрепить изображения"
          @click="$refs.fileInput.click()"
        >
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        <input
          v-model="newMessage"
          type="text"
          placeholder="Напишите сообщение..."
          class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          :disabled="isSending"
        >
        
        <!-- Emoji picker -->
        <div class="relative">
          <button
            type="button"
            class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl flex items-center justify-center transition text-xl"
            @click="showEmojiPicker = !showEmojiPicker"
          >
            😊
          </button>
          <div 
            v-if="showEmojiPicker" 
            class="absolute bottom-14 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-600 p-3 z-50 w-72"
          >
            <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                type="button"
                class="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          :disabled="(!newMessage.trim() && selectedImages.length === 0) || isSending"
          class="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSending ? '⏳' : '📤' }}
        </button>
      </form>
    </div>

    <!-- Image Viewer Modal -->
    <div
      v-if="viewerImage"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      @click="viewerImage = null"
    >
      <img
        :src="getImageUrl(viewerImage.url)"
        :alt="viewerImage.filename"
        class="max-w-full max-h-full object-contain"
        @click.stop
      >
      <button
        class="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
        @click="viewerImage = null"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'
import PremiumBadge from '@/components/PremiumBadge.vue'

const props = defineProps({
  chatId: {
    type: [String, Number],
    required: true
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function,
    default: null
  }
})

const messages = ref([])
const newMessage = ref('')
const selectedImages = ref([])
const isLoading = ref(false)
const isSending = ref(false)
const messagesContainer = ref(null)
const fileInput = ref(null)
const viewerImage = ref(null)
const messagesCount = ref(0)
const chatData = ref(null)
const error = ref(null)
const showEmojiPicker = ref(false)

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
  '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '🤗', '🤔', '🤭', '🤫',
  '🤬', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '👍', '👎', '👌', '✌️', '🤞', '🤙', '👊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🔥', '⭐', '🎉',
  '🚗', '🚕', '🚙', '🚌', '🛠️', '🔧', '⛽', '📱', '💻', '🏠', '📍', '✅', '❌'
]

// Проверка авторизации
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const _currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
})

onMounted(async () => {
  await loadChat()
  setupWebSocket()
})

onUnmounted(() => {
  // Отписываемся от WebSocket событий
  if (chatData.value?.id) {
    wsService.leaveRoom?.(`chat_${chatData.value.id}`)
  }
})

watch(() => props.chatId, async (newId) => {
  if (newId) {
    await loadChat()
  }
})

// Загружаем чат по ID запроса
async function loadChat() {
  try {
    isLoading.value = true
    error.value = null
    messages.value = []
    
    // Получаем или создаём чат для запроса
    const chatResponse = await apiService.getChatByRequest(props.chatId)
    
    if (chatResponse.data) {
      chatData.value = chatResponse.data
      
      // Загружаем сообщения
      await loadMessages()
    }
  } catch (err) {
    console.error('Ошибка загрузки чата:', err)
    error.value = err.response?.data?.message || 'Не удалось загрузить чат'
  } finally {
    isLoading.value = false
  }
}

async function loadMessages() {
  if (!chatData.value?.id) return
  
  try {
    const response = await apiService.getChatMessages(chatData.value.id, { limit: 100 })
    
    if (response) {
      messages.value = Array.isArray(response) ? response : (response.messages || [])
      messagesCount.value = messages.value.length
    }
    
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err)
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && selectedImages.value.length === 0) || isSending.value) return
  if (!chatData.value?.id) {
    alert('Чат не инициализирован')
    return
  }
  
  try {
    isSending.value = true
    const content = newMessage.value.trim()
    
    let image_url = null
    let thumbnail_url = null
    
    // Upload image first if selected
    if (selectedImages.value.length > 0) {
      try {
        const uploadResponse = await apiService.uploadChatImage(selectedImages.value[0].file)
        if (uploadResponse.success) {
          image_url = uploadResponse.image_url
          thumbnail_url = uploadResponse.thumbnail_url
        }
      } catch (uploadErr) {
        console.error('Ошибка загрузки изображения:', uploadErr)
        alert('Не удалось загрузить изображение')
        return
      }
    }
    
    // Send message with content and/or image
    const response = await apiService.client.post(`/chats/${chatData.value.id}/messages`, {
      content: content || '',
      image_url,
      thumbnail_url
    })
    
    if (response?.success && response?.data) {
      messages.value.push(response.data)
      messagesCount.value++
    }
    
    newMessage.value = ''
    selectedImages.value = []
    
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка отправки сообщения:', err)
    alert('Не удалось отправить сообщение: ' + (err.response?.data?.message || err.message))
  } finally {
    isSending.value = false
  }
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  
  if (selectedImages.value.length + files.length > 5) {
    alert('Максимум 5 изображений')
    return
  }
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} не является изображением`)
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} слишком большой (макс. 10MB)`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
  
  // Сбрасываем input
  event.target.value = ''
}

function removeImage(index) {
  selectedImages.value.splice(index, 1)
}

function openImageViewer(image) {
  viewerImage.value = image
}

function insertEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

function setupWebSocket() {
  if (!chatData.value?.id) return
  
  // Подключаемся к комнате чата
  wsService.joinRoom?.(`chat_${chatData.value.id}`)
  
  // Слушаем новые сообщения
  wsService.on?.('chat:newMessage', handleNewMessage)
  
  console.log('✅ WebSocket подключён к чату:', chatData.value.id)
}

function handleNewMessage(data) {
  // Проверяем что сообщение для нашего чата
  if (data.chat_id === chatData.value?.id || data.chatId === chatData.value?.id) {
    // Проверяем что сообщение ещё не добавлено
    const exists = messages.value.some(m => m.id === data.id)
    if (!exists) {
      messages.value.push(data)
      messagesCount.value++
      nextTick(() => scrollToBottom())
    }
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return `${hours} ч назад`
  }
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getImageUrl(url) {
  if (!url) return ''
  // If already absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Add API base URL for relative paths
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return baseUrl.replace('/api/v1', '') + url
}

function handleImageError(event) {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  event.target.style.display = 'none'
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

