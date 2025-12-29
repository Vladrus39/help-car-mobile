<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <NavigationHeader />
    
    <div class="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      <!-- Header with search -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            💬 Мои чаты
          </h1>
          <div class="flex items-center gap-2">
            <!-- Total unread badge -->
            <span 
              v-if="totalUnread > 0"
              class="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse"
            >
              {{ totalUnread > 99 ? '99+' : totalUnread }}
            </span>
          </div>
        </div>
        
        <!-- Search bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Поиск по чатам..."
            class="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <button 
            v-if="searchQuery"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <router-link
          to="/global-chat"
          class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              🌍
            </div>
            <div>
              <h3 class="font-bold">Общий чат</h3>
              <p class="text-white/70 text-sm">Все пользователи</p>
            </div>
          </div>
        </router-link>
        <router-link
          to="/city-chats"
          class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              🏙️
            </div>
            <div>
              <h3 class="font-bold">Города</h3>
              <p class="text-white/70 text-sm">Чаты по городам</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all',
            activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span 
            v-if="tab.count > 0"
            :class="[
              'px-2 py-0.5 text-xs rounded-full font-bold',
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading Skeleton -->
      <div
        v-if="isLoading"
        class="space-y-3"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredChats.length === 0"
        class="text-center py-16"
      >
        <div class="text-8xl mb-6 animate-bounce">
          {{ searchQuery ? '🔍' : activeTab === 'requests' ? '🆘' : activeTab === 'direct' ? '👥' : '🏙️' }}
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ searchQuery ? 'Ничего не найдено' : 'Пока нет чатов' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {{ getEmptyMessage() }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link
            v-if="!searchQuery && activeTab === 'requests'"
            to="/create-request"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-600/30"
          >
            🆘 Создать заявку
          </router-link>
          <router-link
            v-if="!searchQuery && activeTab === 'city'"
            to="/city-chats"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition shadow-lg shadow-purple-600/30"
          >
            🏙️ Городские чаты
          </router-link>
          <router-link
            v-if="!searchQuery && activeTab === 'direct'"
            to="/profile?addFriend=true"
            class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg shadow-green-600/30"
          >
            👥 Найти друзей
          </router-link>
        </div>
      </div>

      <!-- Chats List - Сетка 2-3 столбца -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <TransitionGroup name="chat-list">
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
            :class="[
              'bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group',
              chat.unread_count > 0 ? 'ring-2 ring-blue-500/50' : ''
            ]"
            @click="openChat(chat)"
          >
            <div class="p-4 flex items-center gap-4">
              <!-- Avatar with online indicator -->
              <div class="relative flex-shrink-0">
                <div 
                  v-if="chat.otherUser?.avatar_url"
                  class="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 transition"
                >
                  <img
                    :src="getAvatarUrl(chat.otherUser.avatar_url)"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div 
                  v-else
                  :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white',
                    getAvatarGradient(chat.otherUser?.full_name)
                  ]"
                >
                  {{ getInitial(chat.otherUser?.full_name) }}
                </div>
                <!-- Online indicator -->
                <span 
                  v-if="chat.otherUser?.is_available_to_help"
                  class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
                  title="Готов помочь"
                />
              </div>

              <!-- Chat Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-gray-900 dark:text-white truncate">
                    {{ chat.otherUser?.full_name || 'Пользователь' }}
                  </span>
                  <PremiumBadge :status="chat.otherUser?.premium_status" size="xs" />
                  <span
                    v-if="chat.otherUser?.rating"
                    class="text-yellow-500 text-sm"
                  >
                    ⭐ {{ parseFloat(chat.otherUser.rating || 5).toFixed(1) }}
                  </span>
                  <!-- Verified badge -->
                  <span 
                    v-if="chat.otherUser?.is_verified" 
                    class="text-blue-500"
                    title="Проверенный"
                  >✓</span>
                </div>
                
                <!-- Problem type tag -->
                <div
                  v-if="chat.helpRequest"
                  class="mb-1"
                >
                  <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', getProblemTypeColor(chat.helpRequest.problem_type)]">
                    {{ getProblemTypeLabel(chat.helpRequest.problem_type) }}
                  </span>
                  <span 
                    v-if="chat.helpRequest.status" 
                    :class="['ml-2 text-xs', getStatusColor(chat.helpRequest.status)]"
                  >
                    {{ getStatusLabel(chat.helpRequest.status) }}
                  </span>
                </div>

                <!-- Last message preview -->
                <div class="flex items-center gap-2">
                  <p 
                    v-if="chat.lastMessage"
                    :class="[
                      'text-sm truncate flex-1',
                      chat.unread_count > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    <span
                      v-if="chat.lastMessage.sender?.id === currentUserId"
                      class="text-gray-400"
                    >Вы: </span>
                    {{ chat.lastMessage.content }}
                  </p>
                  <p
                    v-else
                    class="text-sm text-gray-400 italic truncate"
                  >
                    Начните общение...
                  </p>
                  
                  <!-- Typing indicator -->
                  <span
                    v-if="chat.isTyping"
                    class="flex items-center gap-1 text-blue-500 text-sm"
                  >
                    <span class="flex gap-0.5">
                      <span
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                        style="animation-delay: 0ms"
                      />
                      <span
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                        style="animation-delay: 150ms"
                      />
                      <span
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                        style="animation-delay: 300ms"
                      />
                    </span>
                    печатает
                  </span>
                </div>
              </div>

              <!-- Right side: time + unread -->
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <span class="text-xs text-gray-400">
                  {{ formatDate(chat.lastMessage?.createdAt || chat.last_message_at || chat.created_at) }}
                </span>
                
                <!-- Unread badge -->
                <span 
                  v-if="chat.unread_count > 0"
                  class="min-w-[24px] h-6 px-2 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {{ chat.unread_count > 99 ? '99+' : chat.unread_count }}
                </span>
                
                <!-- Pinned icon -->
                <span
                  v-if="chat.isPinned"
                  class="text-yellow-500"
                >📌</span>
              </div>
            </div>

            <!-- Quick actions on hover (desktop) -->
            <div class="hidden sm:flex items-center gap-2 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                @click.stop="pinChat(chat)"
              >
                {{ chat.isPinned ? '📌 Открепить' : '📌 Закрепить' }}
              </button>
              <button 
                class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                @click.stop="muteChat(chat)"
              >
                {{ chat.isMuted ? '🔔 Включить' : '🔕 Выключить' }}
              </button>
              <button 
                v-if="chat.otherUser"
                class="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                @click.stop="viewProfile(chat.otherUser.id)"
              >
                👤 Профиль
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Floating action button for mobile -->
      <router-link
        to="/city-chats"
        class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform sm:hidden"
      >
        🏙️
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import NavigationHeader from '@/components/NavigationHeader.vue'
import PremiumBadge from '@/components/PremiumBadge.vue'
import { io } from 'socket.io-client'

const router = useRouter()
const authStore = useAuthStore()

const chats = ref([])
const directChats = ref([])
const cityChats = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeTab = ref('requests')
let socket = null

const currentUserId = computed(() => authStore.user?.id)

const tabs = computed(() => [
  { 
    id: 'requests', 
    label: 'Заявки', 
    icon: '🆘',
    count: chats.value.filter(c => c.unread_count > 0).length
  },
  { 
    id: 'direct', 
    label: 'Личные', 
    icon: '👥',
    count: directChats.value.filter(c => c.unread_count > 0).length
  },
  { 
    id: 'city', 
    label: 'Города', 
    icon: '🏙️',
    count: cityChats.value.filter(c => c.unread_count > 0).length
  }
])

const totalUnread = computed(() => {
  return chats.value.reduce((sum, c) => sum + (c.unread_count || 0), 0) +
         directChats.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
})

const filteredChats = computed(() => {
  let list = []
  
  if (activeTab.value === 'requests') {
    list = chats.value
  } else if (activeTab.value === 'direct') {
    list = directChats.value
  } else if (activeTab.value === 'city') {
    list = cityChats.value
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(chat => {
      const userName = chat.otherUser?.full_name?.toLowerCase() || ''
      const problem = chat.helpRequest?.problem_type?.toLowerCase() || ''
      const lastMsg = chat.lastMessage?.content?.toLowerCase() || ''
      return userName.includes(query) || problem.includes(query) || lastMsg.includes(query)
    })
  }
  
  // Sort: pinned first, then by date
  return [...list].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    const dateA = new Date(a.lastMessage?.createdAt || a.last_message_at || a.created_at)
    const dateB = new Date(b.lastMessage?.createdAt || b.last_message_at || b.created_at)
    return dateB - dateA
  })
})

const problemTypeLabels = {
  battery: '🔋 Батарея',
  fuel: '⛽ Топливо',
  tire: '🛞 Колесо',
  towing: '🚗 Буксир',
  sober_driver: '🚕 Трезвый',
  road_conflict: '🚨 Конфликт',
  other: '🔧 Другое'
}

const problemTypeColors = {
  battery: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  fuel: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  tire: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  towing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sober_driver: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  road_conflict: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  other: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
}

const avatarGradients = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-green-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-indigo-500 to-blue-600',
  'bg-gradient-to-br from-cyan-500 to-blue-600'
]

onMounted(async () => {
  await loadAllChats()
  setupWebSocket()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})

async function loadAllChats() {
  try {
    isLoading.value = true
    
    // Load all chat types in parallel
    const [requestChatsRes, directChatsRes] = await Promise.all([
      apiService.getMyChats().catch((e) => { console.error('Failed to load request chats:', e); return { success: false } }),
      apiService.getDirectChats ? apiService.getDirectChats().catch((e) => { console.error('Failed to load direct chats:', e); return { success: false, data: [] } }) : Promise.resolve({ success: true, data: [] })
    ])
    
    console.log('Request chats response:', requestChatsRes)
    console.log('Direct chats response:', directChatsRes)
    
    // Extract request chats - response has { success, count, data }
    if (requestChatsRes?.success !== false) {
      chats.value = Array.isArray(requestChatsRes) ? requestChatsRes : (requestChatsRes?.data || [])
    }
    
    // Extract direct chats - response has { success, count, data }
    if (directChatsRes?.success !== false) {
      directChats.value = Array.isArray(directChatsRes) ? directChatsRes : (directChatsRes?.data || [])
    }
    
    console.log('Loaded request chats:', chats.value.length)
    console.log('Loaded direct chats:', directChats.value.length)
    
  } catch (error) {
    console.error('Failed to load chats:', error)
  } finally {
    isLoading.value = false
  }
}

function setupWebSocket() {
  const token = localStorage.getItem('token')
  if (!token) return
  
  const wsUrl = window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`
  
  socket = io(wsUrl.replace(/^ws/, 'http'), { auth: { token } })
  
  socket.on('chat:newMessage', (data) => {
    // Update unread count
    const chat = chats.value.find(c => c.id === data.chatId)
    if (chat && data.senderId !== currentUserId.value) {
      chat.unread_count = (chat.unread_count || 0) + 1
      chat.lastMessage = {
        content: data.content,
        createdAt: new Date().toISOString(),
        sender: { id: data.senderId }
      }
    }
  })
  
  socket.on('chat:typing', (data) => {
    const chat = chats.value.find(c => c.id === data.chatId)
    if (chat && data.userId !== currentUserId.value) {
      chat.isTyping = true
      setTimeout(() => { chat.isTyping = false }, 3000)
    }
  })
}

function openChat(chat) {
  if (activeTab.value === 'requests' && chat.helpRequest) {
    router.push(`/chat/${chat.helpRequest.id}`)
  } else if (activeTab.value === 'direct') {
    router.push(`/direct-chat/${chat.id}`)
  } else if (activeTab.value === 'city') {
    // City chats are handled within CityChatsView, navigate there
    router.push('/city-chats')
  }
}

function pinChat(chat) {
  const newPinStatus = !chat.isPinned
  apiService.post(`/chats/${chat.id}/pin`)
    .then(response => {
      if (response.success) {
        chat.isPinned = newPinStatus
      }
    })
    .catch(error => {
      console.error('Pin chat error:', error)
    })
}

function muteChat(chat) {
  const newMuteStatus = !chat.isMuted
  apiService.post(`/chats/${chat.id}/mute`)
    .then(response => {
      if (response.success) {
        chat.isMuted = newMuteStatus
      }
    })
    .catch(error => {
      console.error('Mute chat error:', error)
    })
}

function viewProfile(userId) {
  router.push(`/user/${userId}`)
}

function getInitial(name) {
  if (!name) return '👤'
  return name.charAt(0).toUpperCase()
}

function getAvatarGradient(name) {
  if (!name) return avatarGradients[0]
  const index = name.charCodeAt(0) % avatarGradients.length
  return avatarGradients[index]
}

function getProblemTypeLabel(type) {
  return problemTypeLabels[type] || type
}

function getProblemTypeColor(type) {
  return problemTypeColors[type] || problemTypeColors.other
}

function getStatusLabel(status) {
  const labels = {
    active: '🟢 Активна',
    accepted: '🤝 В работе',
    completed: '✅ Завершена',
    cancelled: '❌ Отменена'
  }
  return labels[status] || status
}

function getStatusColor(status) {
  const colors = {
    active: 'text-green-600',
    accepted: 'text-blue-600',
    completed: 'text-gray-500',
    cancelled: 'text-red-500'
  }
  return colors[status] || 'text-gray-500'
}

function getEmptyMessage() {
  if (searchQuery.value) {
    return 'Попробуйте изменить поисковый запрос'
  }
  if (activeTab.value === 'requests') {
    return 'Чаты появятся когда вы создадите заявку или откликнетесь на заявку другого пользователя'
  }
  if (activeTab.value === 'direct') {
    return 'Здесь будут личные чаты с друзьями. Добавьте друзей через профиль!'
  }
  if (activeTab.value === 'city') {
    return 'Присоединяйтесь к чатам вашего города и общайтесь с водителями!'
  }
  return 'Пока нет чатов'
}

function getAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'сейчас'
  if (diffMins < 60) return `${diffMins} мин`
  if (diffHours < 24) return `${diffHours} ч`
  if (diffDays < 7) return `${diffDays} дн`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.3s ease;
}

.chat-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.chat-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
