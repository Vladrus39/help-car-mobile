<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <NavigationHeader />
    
    <div class="max-w-3xl mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            🔔 Уведомления
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            {{ unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитаны' }}
          </p>
        </div>
        <button 
          v-if="unreadCount > 0"
          @click="markAllRead"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
        >
          Прочитать все
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Пустой список -->
      <div v-else-if="notifications.length === 0" class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Нет уведомлений</h3>
        <p class="text-gray-500 dark:text-gray-400">Все уведомления появятся здесь</p>
      </div>

      <!-- Список уведомлений -->
      <div v-else class="space-y-3">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900': !notification.is_read }"
        >
          <div class="flex items-start gap-4">
            <!-- Иконка -->
            <div 
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              :class="getTypeStyles(notification.type).bg"
            >
              <img 
                v-if="notification.sender?.avatar_url" 
                :src="getAvatarUrl(notification.sender.avatar_url)" 
                class="w-12 h-12 rounded-full object-cover"
                @error="handleAvatarError"
              >
              <span v-else class="text-2xl">{{ getTypeStyles(notification.type).icon }}</span>
            </div>
            
            <!-- Контент -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ notification.title }}
                </p>
                <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {{ formatTime(getNotificationDate(notification)) }}
                </span>
              </div>
              <p v-if="notification.body" class="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {{ notification.body }}
              </p>
              
              <!-- Действие -->
              <div class="flex items-center gap-2 mt-2">
                <span 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="getTypeStyles(notification.type).badge"
                >
                  {{ getTypeLabel(notification.type) }}
                </span>
                <span v-if="!notification.is_read" class="w-2 h-2 bg-blue-500 rounded-full"></span>
                
                <!-- Кнопка Перезвонить для пропущенных звонков -->
                <button
                  v-if="isMissedCall(notification)"
                  @click.stop="callBack(notification)"
                  class="ml-auto flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Перезвонить
                </button>
              </div>
            </div>

            <!-- Удалить -->
            <button 
              @click.stop="deleteNotification(notification.id)"
              class="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
              title="Удалить"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Загрузить ещё -->
        <div v-if="hasMore" class="text-center py-4">
          <button 
            @click="loadMore"
            :disabled="loadingMore"
            class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            {{ loadingMore ? 'Загрузка...' : 'Загрузить ещё' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { getAvatarUrl } from '@/utils/imageUrl'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const loadingMore = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const hasMore = ref(false)
const offset = ref(0)
const limit = 20

// Стили по типу
const getTypeStyles = (type) => {
  const styles = {
    new_message: { icon: '💬', bg: 'bg-blue-100 dark:bg-blue-900/50', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    friend_request: { icon: '👋', bg: 'bg-purple-100 dark:bg-purple-900/50', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    friend_accepted: { icon: '🤝', bg: 'bg-green-100 dark:bg-green-900/50', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    help_request_new: { icon: '🆘', bg: 'bg-red-100 dark:bg-red-900/50', badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
    help_request_response: { icon: '✋', bg: 'bg-yellow-100 dark:bg-yellow-900/50', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
    help_request_accepted: { icon: '✅', bg: 'bg-green-100 dark:bg-green-900/50', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    help_request_completed: { icon: '🎉', bg: 'bg-green-100 dark:bg-green-900/50', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    rating_received: { icon: '⭐', bg: 'bg-yellow-100 dark:bg-yellow-900/50', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
    system: { icon: '🔔', bg: 'bg-gray-100 dark:bg-gray-700', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    friend_online: { icon: '🟢', bg: 'bg-green-100 dark:bg-green-900/50', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    payment: { icon: '💰', bg: 'bg-emerald-100 dark:bg-emerald-900/50', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
    call_incoming: { icon: '📞', bg: 'bg-green-100 dark:bg-green-900/50', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    call_missed: { icon: '📵', bg: 'bg-red-100 dark:bg-red-900/50', badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
    call_video: { icon: '📹', bg: 'bg-blue-100 dark:bg-blue-900/50', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  }
  return styles[type] || { icon: '🔔', bg: 'bg-gray-100 dark:bg-gray-700', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
}

const getTypeLabel = (type) => {
  const labels = {
    new_message: 'Сообщение',
    friend_request: 'Заявка в друзья',
    friend_accepted: 'Друг добавлен',
    help_request_new: 'Новая заявка',
    help_request_response: 'Отклик',
    help_request_accepted: 'Отклик принят',
    help_request_completed: 'Завершено',
    rating_received: 'Оценка',
    system: 'Система',
    friend_online: 'Друг онлайн',
    payment: 'Оплата',
    call_incoming: 'Входящий звонок',
    call_missed: 'Пропущенный',
    call_video: 'Видеозвонок',
  }
  return labels[type] || 'Уведомление'
}

// Проверка пропущенного звонка
const isMissedCall = (notification) => {
  return notification.type === 'call_missed' || 
         (notification.type === 'call_video' && notification.data?.missed) ||
         (notification.type === 'call_incoming' && notification.data?.missed)
}

// Перезвонить
const callBack = async (notification) => {
  const data = notification.data || {}
  const callerId = data.caller_id || data.user_id || notification.sender?.id
  
  if (!callerId) {
    console.error('No caller ID found in notification')
    return
  }
  
  // Переходим в чат и сразу инициируем звонок
  const isVideo = notification.type === 'call_video' || data.call_type === 'video'
  router.push({
    path: `/direct-chat/${callerId}`,
    query: { action: 'call', video: isVideo ? '1' : '0' }
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: days > 365 ? 'numeric' : undefined })
}

// Получить дату из уведомления (поддержка created_at и createdAt)
const getNotificationDate = (notification) => {
  return notification.created_at || notification.createdAt || null
}

const loadNotifications = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const response = await apiService.getNotifications({ limit, offset: 0 })
    notifications.value = response.data || []
    unreadCount.value = response.unread_count || 0
    hasMore.value = (response.data?.length || 0) >= limit
    offset.value = notifications.value.length
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  loadingMore.value = true
  try {
    const response = await apiService.getNotifications({ limit, offset: offset.value })
    const newItems = response.data || []
    notifications.value.push(...newItems)
    hasMore.value = newItems.length >= limit
    offset.value += newItems.length
  } catch (error) {
    console.error('Failed to load more:', error)
  } finally {
    loadingMore.value = false
  }
}

const handleNotificationClick = async (notification) => {
  // Помечаем как прочитанное
  if (!notification.is_read) {
    try {
      await apiService.markNotificationRead(notification.id)
      notification.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }
  
  // Навигация
  const data = notification.data || {}
  
  switch (notification.type) {
    case 'new_message':
      // chat_id из backend = ID direct-чата. Роут /chat/:requestId предназначен для чатов заявок
      if (data.chat_id) router.push(`/direct-chat/${data.chat_id}`)
      break
    case 'friend_request':
    case 'friend_accepted':
      router.push('/friends')
      break
    case 'help_request_new':
    case 'help_request_response':
    case 'help_request_accepted':
    case 'help_request_completed':
      if (data.request_id) router.push(`/responses/${data.request_id}`)
      else router.push('/my-requests')
      break
    case 'rating_received':
      router.push('/profile')
      break
    case 'call_incoming':
    case 'call_missed':
    case 'call_video':
      // В data обычно есть caller_id (userId), но роут /direct-chat ожидает chatId.
      // Поэтому безопасно уводим в профиль звонившего.
      if (data.caller_id) router.push(`/user/${data.caller_id}`)
      break
  }
}

const markAllRead = async () => {
  try {
    await apiService.markAllNotificationsRead()
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

const deleteNotification = async (id) => {
  try {
    await apiService.deleteNotification(id)
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      if (!notifications.value[index].is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}


function handleAvatarError(event) {
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%236366f1" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">?</text></svg>'
}

onMounted(() => {
  loadNotifications()
})
</script>
