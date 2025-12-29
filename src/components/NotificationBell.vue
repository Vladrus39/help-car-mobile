<template>
  <div class="relative" ref="bellRef">
    <!-- Кнопка колокольчика -->
    <button
      @click="toggleDropdown"
      class="relative w-8 h-8 md:w-9 md:h-9 p-1.5 md:p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all flex items-center justify-center shadow-lg ring-2 ring-orange-300"
      :title="unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Уведомления'"
    >
      <!-- Иконка колокольчика -->
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
      </svg>
      
      <!-- Бейдж с количеством непрочитанных -->
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
    
    <!-- Выпадающий список уведомлений -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div 
        v-if="isOpen"
        class="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 left-2 sm:left-auto mt-0 sm:mt-2 sm:w-96 max-h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999]"
      >
        <!-- Заголовок -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🔔 Уведомления
            <span v-if="unreadCount > 0" class="text-sm text-gray-500 dark:text-gray-400">({{ unreadCount }})</span>
          </h3>
          <button 
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Прочитать все
          </button>
        </div>
        
        <!-- Список уведомлений -->
        <div class="overflow-y-auto max-h-[calc(70vh-60px)]">
          <!-- Загрузка -->
          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Загрузка...</p>
          </div>
          
          <!-- Пустой список -->
          <div v-else-if="notifications.length === 0" class="p-8 text-center">
            <div class="text-4xl mb-2">✨</div>
            <p class="text-gray-500 dark:text-gray-400">Нет новых уведомлений</p>
          </div>
          
          <!-- Уведомления -->
          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.is_read }"
            >
              <div class="flex items-start gap-3">
                <!-- Иконка/Аватар -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="getTypeStyles(notification.type).bg">
                  <img 
                    v-if="notification.sender?.avatar_url" 
                    :src="getAvatarUrl(notification.sender.avatar_url)" 
                    class="w-10 h-10 rounded-full object-cover"
                    @error="handleAvatarError"
                  >
                  <span v-else class="text-lg">{{ getTypeStyles(notification.type).icon }}</span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {{ notification.title }}
                  </p>
                  <p v-if="notification.body" class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {{ notification.body }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{ formatTime(getDate(notification)) }}
                  </p>
                </div>
                
                <!-- Индикатор непрочитанного -->
                <div v-if="!notification.is_read" class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Показать все -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-2">
          <router-link 
            to="/notifications"
            @click="isOpen = false"
            class="block w-full py-2 text-center text-sm text-blue-500 hover:text-blue-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            Показать все уведомления
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'
import soundService from '@/services/soundService'
import { getAvatarUrl } from '@/utils/imageUrl'

const router = useRouter()
const authStore = useAuthStore()

const bellRef = ref(null)
const isOpen = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

// Стили по типу уведомления
const getTypeStyles = (type) => {
  const styles = {
    new_message: { icon: '💬', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    friend_request: { icon: '👋', bg: 'bg-purple-100 dark:bg-purple-900/50' },
    friend_accepted: { icon: '🤝', bg: 'bg-green-100 dark:bg-green-900/50' },
    help_request_new: { icon: '🆘', bg: 'bg-red-100 dark:bg-red-900/50' },
    help_request_response: { icon: '✋', bg: 'bg-yellow-100 dark:bg-yellow-900/50' },
    help_request_accepted: { icon: '✅', bg: 'bg-green-100 dark:bg-green-900/50' },
    help_request_completed: { icon: '🎉', bg: 'bg-green-100 dark:bg-green-900/50' },
    rating_received: { icon: '⭐', bg: 'bg-yellow-100 dark:bg-yellow-900/50' },
    system: { icon: '🔔', bg: 'bg-gray-100 dark:bg-gray-700' },
    friend_online: { icon: '🟢', bg: 'bg-green-100 dark:bg-green-900/50' },
    payment: { icon: '💰', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
    // Звонки
    call_incoming: { icon: '📞', bg: 'bg-green-100 dark:bg-green-900/50' },
    call_missed: { icon: '📵', bg: 'bg-red-100 dark:bg-red-900/50' },
    call_video: { icon: '📹', bg: 'bg-blue-100 dark:bg-blue-900/50' },
  }
  return styles[type] || { icon: '🔔', bg: 'bg-gray-100 dark:bg-gray-700' }
}

// Форматирование времени
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
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// Получить дату из уведомления (поддержка created_at и createdAt)
const getDate = (notification) => {
  return notification.created_at || notification.createdAt || null
}

// Загрузить уведомления (только непрочитанные для dropdown)
const loadNotifications = async () => {
  if (!authStore.isLoggedIn) return
  
  loading.value = true
  try {
    const response = await apiService.getNotifications({ limit: 20, unread_only: true })
    notifications.value = response.data || []
    unreadCount.value = response.unread_count || 0
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

// Открыть/закрыть dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && notifications.value.length === 0) {
    loadNotifications()
  }
}

// Обработка клика на уведомление
const handleNotificationClick = async (notification) => {
  // Помечаем как прочитанное и удаляем из списка
  if (!notification.is_read) {
    try {
      await apiService.markNotificationRead(notification.id)
      // Удаляем из списка dropdown
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  } else {
    // Если уже прочитано - просто удаляем из dropdown
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
  }
  
  // Навигация в зависимости от типа
  const data = notification.data || {}
  isOpen.value = false
  
  switch (notification.type) {
    case 'new_message':
      // chat_id из backend = ID direct-чата. Роут /chat/:requestId предназначен для чатов заявок
      if (data.chat_id) router.push(`/direct-chat/${data.chat_id}`)
      else if (data.help_request_id) router.push(`/chat/${data.help_request_id}`)
      break
    case 'friend_request':
    case 'friend_accepted':
      router.push('/friends')
      break
    case 'help_request_accepted':
      // Отклик принят - сразу в чат!
      if (data.help_request_id) router.push(`/chat/${data.help_request_id}`)
      else if (data.request_id) router.push(`/chat/${data.request_id}`)
      else router.push('/my-responses')
      break
    case 'help_request_new':
    case 'help_request_response':
      if (data.request_id) router.push(`/responses/${data.request_id}`)
      else router.push('/my-requests')
      break
    case 'help_request_completed':
      // Заявка завершена - можно оценить
      if (data.help_request_id) router.push(`/chat/${data.help_request_id}`)
      else if (data.request_id) router.push(`/responses/${data.request_id}`)
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
    default:
      // Для остальных просто закрываем
      break
  }
}

// Прочитать все и очистить список
const markAllRead = async () => {
  try {
    await apiService.markAllNotificationsRead()
    notifications.value = [] // Очищаем список в dropdown
    unreadCount.value = 0
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

// Клик вне dropdown
const handleClickOutside = (event) => {
  if (bellRef.value && !bellRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// WebSocket - новое уведомление
const handleNewNotification = (data) => {
  if (data.notification) {
    notifications.value.unshift(data.notification)
    unreadCount.value++
    
    // Воспроизвести звук если включено
    soundService.playNotification()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Загружаем количество непрочитанных при монтировании
  if (authStore.isLoggedIn) {
    loadNotifications()
  }

  // Если auth восстанавливается асинхронно (checkAuth), подхватываем позже
  watch(
    () => authStore.isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        loadNotifications()
      } else {
        notifications.value = []
        unreadCount.value = 0
      }
    },
    { immediate: false }
  )
  
  // Подписываемся на real-time уведомления
  wsService.on('notification:new', handleNewNotification)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  wsService.off('notification:new', handleNewNotification)
})

// Обработка аватаров

function handleAvatarError(event) {
  // Показываем дефолтный аватар вместо скрытия
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%236366f1" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">?</text></svg>'
}

// Экспорт для родителя
defineExpose({ loadNotifications, unreadCount })
</script>
