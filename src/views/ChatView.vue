<template>
  <div class="h-screen flex flex-col chat-container">
    <!-- Animated background -->
    <div class="chat-bg-pattern"></div>
    <!-- Header -->
    <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b dark:border-gray-700 px-4 py-3 flex-shrink-0 shadow-lg relative z-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link
            to="/chats"
            class="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </router-link>
          
          <!-- Partner info - кликабельный переход на профиль -->
          <router-link
            v-if="chatPartner"
            :to="`/user/${chatPartner.id}`"
            class="flex items-center gap-3 group"
          >
            <div class="relative">
              <div 
                v-if="chatPartner.avatar_url"
                class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition"
              >
                <img
                  :src="getAvatarUrl(chatPartner.avatar_url)"
                  class="w-full h-full object-cover"
                >
              </div>
              <div 
                v-else
                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-blue-400 transition"
              >
                {{ getInitials(chatPartner.full_name) }}
              </div>
              <span 
                v-if="chatPartner.is_available_to_help"
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
              />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {{ chatPartner.full_name }}
                </p>
                <PremiumBadge :status="chatPartner.premium_status" size="xs" />
              </div>
              <p
                v-if="isTyping"
                class="text-xs text-blue-500 animate-pulse"
              >
                печатает...
              </p>
              <p
                v-else-if="chatPartner.is_available_to_help"
                class="text-xs text-green-500"
              >
                готов помочь
              </p>
              <p
                v-else
                class="text-xs text-gray-500"
              >
                {{ formatLastSeen(chatPartner.last_login) }}
              </p>
            </div>
          </router-link>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            v-if="chatPartner && !chatPartner.isFriend && !friendRequestSent"
            :disabled="isSendingFriendRequest"
            class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition disabled:opacity-50"
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
            v-else-if="chatPartner?.isFriend"
            class="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold"
          >
            ✓ Друг
          </span>
          
          <button
            class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            @click="showMenu = !showMenu"
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Dropdown menu -->
      <div 
        v-if="showMenu"
        class="absolute right-4 top-16 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 py-2 z-50 min-w-[180px]"
      >
        <button 
          v-if="chatPartner"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          @click="viewProfile(chatPartner.id); showMenu = false"
        >
          👤 Профиль
        </button>
        <button 
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          @click="clearChat(); showMenu = false"
        >
          🗑️ Очистить чат
        </button>
        <button 
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          @click="muteNotifications(); showMenu = false"
        >
          🔕 Выключить звук
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3 messages-area relative z-10"
      @scroll="handleScroll"
    >
      <!-- Loading older messages -->
      <div
        v-if="isLoadingMore"
        class="text-center py-2"
      >
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-sm text-gray-500">
          <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
      
      <!-- Skeleton при загрузке -->
      <template v-if="isLoading">
        <div
          v-for="i in 8"
          :key="'s'+i"
          class="flex"
          :class="i % 2 ? 'justify-start' : 'justify-end'"
        >
          <div
            :class="['max-w-xs px-4 py-3 rounded-2xl skeleton', i % 2 ? 'bg-white dark:bg-gray-800' : 'bg-blue-500']"
            style="width: 60%"
          />
        </div>
      </template>

      <!-- Messages -->
      <template v-else>
        <template
          v-for="(message, index) in messages"
          :key="message.id"
        >
          <!-- Date separator -->
          <div 
            v-if="shouldShowDateSeparator(message, messages[index - 1])"
            class="flex items-center justify-center my-4"
          >
            <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              {{ formatDateSeparator(message.createdAt) }}
            </span>
          </div>
          
          <div
            :class="[
              'flex',
              message.is_mine ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- Avatar for other user -->
            <div 
              v-if="!message.is_mine && shouldShowAvatar(message, messages[index + 1])"
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end"
            >
              {{ getInitials(chatPartner?.full_name) }}
            </div>
            <div
              v-else-if="!message.is_mine"
              class="w-8 mr-2"
            />
            
            <div class="max-w-[80%] sm:max-w-[70%]">
              <div
                :class="[
                  'px-4 py-2.5 rounded-2xl message-bubble break-words relative group',
                  message.is_mine
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
                <p v-if="message.content" class="text-sm sm:text-base whitespace-pre-wrap">
                  {{ message.content }}
                </p>
                
                <!-- Quick reactions on hover -->
                <div 
                  :class="[
                    'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1',
                    message.is_mine ? '-left-20' : '-right-20'
                  ]"
                >
                  <button 
                    class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center hover:scale-110 transition text-sm"
                    @click="reactToMessage(message, '👍')"
                  >
                    👍
                  </button>
                  <button 
                    class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center hover:scale-110 transition text-sm"
                    @click="reactToMessage(message, '❤️')"
                  >
                    ❤️
                  </button>
                </div>
                
                <!-- Reactions display -->
                <div 
                  v-if="message.reactions && message.reactions.length"
                  class="flex gap-1 mt-1"
                >
                  <span 
                    v-for="reaction in message.reactions" 
                    :key="reaction.emoji"
                    class="px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs"
                  >
                    {{ reaction.emoji }} {{ reaction.count }}
                  </span>
                </div>
              </div>
              
              <!-- Time and read status -->
              <div 
                :class="[
                  'flex items-center gap-1.5 mt-1 text-xs',
                  message.is_mine ? 'justify-end' : 'justify-start'
                ]"
              >
                <span class="text-gray-400">{{ formatTime(message.createdAt) }}</span>
                <!-- Read receipts -->
                <span
                  v-if="message.is_mine"
                  :class="message.is_read ? 'text-blue-500' : 'text-gray-400'"
                >
                  {{ message.is_read ? '✓✓' : '✓' }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
      
      <!-- Scroll to bottom button -->
      <button
        v-if="showScrollButton"
        class="fixed bottom-24 right-6 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition z-10"
        @click="scrollToBottom"
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>

    <!-- Input area -->
    <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t dark:border-gray-700 p-3 flex-shrink-0 relative z-20">
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
      
      <div class="flex items-end gap-2">
        <!-- Attach button -->
        <button 
          class="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0"
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
        
        <!-- Input -->
        <div class="flex-1 relative">
          <textarea
            ref="inputRef"
            v-model="newMessage"
            placeholder="Сообщение..."
            rows="1"
            class="w-full px-4 py-2.5 bg-gray-100/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-sm sm:text-base transition-all"
            style="overflow-y: auto;"
            @keydown.enter.exact.prevent="sendMessage"
            @input="handleTyping"
          />
        </div>
        
        <!-- Emoji picker -->
        <div class="relative">
          <button 
            type="button"
            class="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0"
            @click="showEmojiPicker = !showEmojiPicker"
          >
            <span class="text-xl">😊</span>
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
        
        <!-- Send button -->
        <button
          :disabled="(!newMessage.trim() && !selectedImage) || isSending || isUploadingImage"
          :class="[
            'p-2.5 rounded-full transition flex-shrink-0',
            (newMessage.trim() || selectedImage)
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          ]"
          @click="sendMessage"
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
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
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { io } from 'socket.io-client'
import PremiumBadge from '@/components/PremiumBadge.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const messages = ref([])
const newMessage = ref('')
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isSending = ref(false)
const chatId = ref(null)
const chatContainer = ref(null)
const inputRef = ref(null)
const chatPartner = ref(null)
const isSendingFriendRequest = ref(false)
const friendRequestSent = ref(false)
const isTyping = ref(false)
const showMenu = ref(false)
const showScrollButton = ref(false)
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

onMounted(async () => {
  if (route.params.chatId) {
    chatId.value = route.params.chatId
    await loadMessages()
    setupWebSocket()
  } else {
    const requestId = route.params.requestId || route.params.id
    if (requestId) {
      await loadChatByRequest(requestId)
      if (chatId.value) {
        await loadMessages()
        setupWebSocket()
      }
    }
  }
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

// Watch for route changes to reload chat when navigating between different chats
watch(() => route.params.requestId, async (newRequestId, oldRequestId) => {
  if (newRequestId && newRequestId !== oldRequestId) {
    // Reset state
    messages.value = []
    chatId.value = null
    chatPartner.value = null
    isLoading.value = true
    
    // Disconnect old socket
    if (socket) {
      socket.disconnect()
      socket = null
    }
    
    // Load new chat
    await loadChatByRequest(newRequestId)
    if (chatId.value) {
      await loadMessages()
      setupWebSocket()
    }
  }
})

async function loadChatByRequest(requestId) {
  try {
    const response = await apiService.getChatByRequest(requestId)
    console.log('loadChatByRequest response:', response)
    
    // Backend returns { success, data: chat } where chat contains helpRequest, messages, etc.
    const chat = response?.data || response
    
    if (chat?.id) {
      chatId.value = chat.id
      
      // Extract messages if available
      if (chat.messages && Array.isArray(chat.messages)) {
        messages.value = chat.messages.map(msg => ({
          ...msg,
          is_mine: String(msg.sender_id || '') === String(authStore.user?.id || ''),
          createdAt: msg.createdAt || msg.created_at
        }))
      }
      
      // Find chat partner
      if (chat.participants) {
        const partner = chat.participants.find(p => p.id !== authStore.user?.id)
        if (partner) {
          chatPartner.value = partner
          await checkFriendshipStatus(partner.id)
        }
      } else if (chat.helpRequest) {
        const request = chat.helpRequest
        if (request.user_id === authStore.user?.id && request.helper) {
          chatPartner.value = request.helper
          await checkFriendshipStatus(request.helper.id)
        } else if (request.user) {
          chatPartner.value = request.user
          await checkFriendshipStatus(request.user.id)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load chat:', error)
  }
}

async function checkFriendshipStatus(userId) {
  try {
    const response = await apiService.getFriends()
    // API возвращает { success, count, data: [...] }
    const friends = response?.data || response || []
    const isFriend = friends.some(f => f.friend?.id === userId)
    if (chatPartner.value) {
      chatPartner.value.isFriend = isFriend
    }
  } catch (error) {
    console.error('Failed to check friendship:', error)
  }
}

async function sendFriendRequest() {
  if (!chatPartner.value?.id) return
  
  try {
    isSendingFriendRequest.value = true
    const response = await apiService.sendFriendRequest(chatPartner.value.id)
    if (response.success) {
      friendRequestSent.value = true
      if (response.message?.includes('теперь друзья')) {
        chatPartner.value.isFriend = true
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

async function loadMessages() {
  if (!chatId.value) return
  
  try {
    isLoading.value = true
    const response = await apiService.getChatMessages(chatId.value, { limit: 100, offset: 0 })
    console.log('loadMessages response:', response)
    
    // Backend returns { success, count, data: [...messages], chatType, chat }
    let msgs = []
    if (Array.isArray(response?.data)) {
      msgs = response.data
    } else if (Array.isArray(response?.messages)) {
      msgs = response.messages
    } else if (response?.data?.messages && Array.isArray(response.data.messages)) {
      msgs = response.data.messages
    } else if (Array.isArray(response)) {
      msgs = response
    }
    
    messages.value = msgs.map(msg => ({
      ...msg,
      is_mine: String(msg.sender_id || '') === String(authStore.user?.id || ''),
      // Normalize timestamp field names
      createdAt: msg.createdAt || msg.created_at
    }))
    
    // Загружаем информацию о партнёре, если ещё не загружена
    if (!chatPartner.value && response?.chat) {
      const chat = response.chat
      if (chat.participants) {
        const partner = chat.participants.find(p => p.id !== authStore.user?.id)
        if (partner) {
          chatPartner.value = partner
          await checkFriendshipStatus(partner.id)
        }
      } else if (chat.helpRequest) {
        const request = chat.helpRequest
        if (request.user_id === authStore.user?.id && request.helper) {
          chatPartner.value = request.helper
          await checkFriendshipStatus(request.helper.id)
        } else if (request.user) {
          chatPartner.value = request.user
          await checkFriendshipStatus(request.user.id)
        }
      }
    }
    
    // DEBUG: проверка картинок в сообщениях
    const messagesWithImages = messages.value.filter(m => m.image_url)
    console.log('Сообщения с картинками:', messagesWithImages.length)
    messagesWithImages.forEach(m => {
      console.log('  - id:', m.id, '| image_url:', m.image_url, '| thumbnail_url:', m.thumbnail_url)
    })
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    isLoading.value = false
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

function removeSelectedImage(revokeUrl = true) {
  if (revokeUrl && selectedImagePreview.value) {
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
  if ((!newMessage.value.trim() && !selectedImage.value) || !chatId.value || isSending.value) return
  
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
    is_mine: true,
    createdAt: new Date().toISOString(),
    is_sending: true,
    image_url: imagePreview  // Используем сохранённый preview
  })
  
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
    
    const response = await apiService.client.post(`/chats/${chatId.value}/messages`, {
      content: content || '',
      image_url,
      thumbnail_url
    })
    
    if (response?.success && response?.data) {
      const msg = response.data
      console.log('Ответ сервера после отправки:', { id: msg.id, image_url: msg.image_url, thumbnail_url: msg.thumbnail_url })
      // Replace temp message
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) {
        messages.value[idx] = { 
          ...msg, 
          is_mine: true,
          createdAt: msg.createdAt || msg.created_at 
        }
      }
      // Теперь можно revoke blob URL
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    // Mark as failed
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

function handleTyping() {
  if (socket && chatId.value) {
    socket.emit('chat:typing', { chatId: chatId.value })
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
  
  socket.emit('chat:join', { chatId: chatId.value })
  
  socket.on('chat:newMessage', (data) => {
    if (data.chatId === chatId.value) {
      // Проверяем, что сообщение не дублируется
      const exists = messages.value.some(m => 
        m.id === data.id || 
        (m.id?.startsWith?.('temp-') && m.content === data.content && m.is_sending)
      )
      
      if (exists) {
        // Если это наше отправленное сообщение - обновляем tempId на реальный id
        const tempIdx = messages.value.findIndex(m => 
          m.id?.startsWith?.('temp-') && m.content === data.content
        )
        if (tempIdx !== -1) {
          messages.value[tempIdx] = {
            ...messages.value[tempIdx],
            id: data.id,
            is_sending: false
          }
        }
        return
      }
      
      // Добавляем только если не наше сообщение
      if (data.senderId !== authStore.user?.id) {
        messages.value.push({
          id: data.id,
          content: data.content,
          sender_id: data.senderId,
          is_mine: false,
          createdAt: data.createdAt || data.created_at || new Date().toISOString()
        })
        nextTick(() => scrollToBottom())
        isTyping.value = false
      }
    }
  })
  
  socket.on('chat:typing', (data) => {
    if (data.chatId === chatId.value && data.userId !== authStore.user?.id) {
      isTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { isTyping.value = false }, 3000)
    }
  })
  
  socket.on('chat:read', (data) => {
    if (data.chatId === chatId.value) {
      messages.value.forEach(m => {
        if (m.is_mine) m.is_read = true
      })
    }
  })
}

function handleScroll() {
  if (!chatContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  showScrollButton.value = scrollHeight - scrollTop - clientHeight > 200
  
  // Load more when scrolled to top
  if (scrollTop < 50 && !isLoadingMore.value && messages.value.length >= 100) {
    // loadMoreMessages()
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    showScrollButton.value = false
  }
}

function reactToMessage(message, emoji) {
  if (!message.reactions) message.reactions = []
  const existing = message.reactions.find(r => r.emoji === emoji)
  if (existing) {
    existing.count++
  } else {
    message.reactions.push({ emoji, count: 1 })
  }
}

function viewProfile(userId) {
  router.push(`/user/${userId}`)
}

function clearChat() {
  if (confirm('Очистить историю чата?')) {
    messages.value = []
  }
}

function muteNotifications() {
  alert('Уведомления выключены')
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatLastSeen(dateString) {
  if (!dateString) return 'был(а) давно'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 5) return 'онлайн'
  if (diffMins < 60) return `был(а) ${diffMins} мин назад`
  if (diffMins < 1440) return `был(а) ${Math.floor(diffMins / 60)} ч назад`
  return `был(а) ${Math.floor(diffMins / 1440)} дн назад`
}

function formatDateSeparator(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function shouldShowDateSeparator(current, previous) {
  if (!previous) return true
  const currentDate = new Date(current.createdAt).toDateString()
  const previousDate = new Date(previous.createdAt).toDateString()
  return currentDate !== previousDate
}

function shouldShowAvatar(current, next) {
  if (!next) return true
  return next.is_mine || next.sender_id !== current.sender_id
}

function getAvatarUrl(url) {
  return getImageUrl(url)
}

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

/* Skeleton Loading */
.skeleton {
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.4) 50%, transparent 100%);
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
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
