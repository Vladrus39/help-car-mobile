<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50 dark:bg-slate-800 transition-colors duration-200"
  >
    <router-view v-slot="{ Component }">
      <transition
        name="fade"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Toast notifications -->
    <Toast />
    
    <!-- SOS Button -->
    <SOSButton />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import { useAuthStore } from '@/stores/auth'
import { useInvitationsStore } from '@/stores/invitations'
import Toast from '@/components/Toast.vue'
import SOSButton from '@/components/SOSButton.vue'
import soundService from '@/services/soundService'
import { wsService } from '@/services/websocket'
import { showNotification } from '@/services/webPush'
import { initializePushNotifications } from '@/firebase'

const router = useRouter()
const authStore = useAuthStore()
const invitationsStore = useInvitationsStore()

// Инициализируем темную тему
useDarkMode()

// Глобальная функция для share - определяется сразу при загрузке App.vue
window.__shareRequestHandlers = []
console.log('✅ App.vue: __shareRequestHandlers initialized')
window.__handleShareRequest = (requestId) => {
  console.log('📨 Global share handler called:', requestId)
  console.log('📋 Handlers count:', window.__shareRequestHandlers.length)
  
  // Сначала пробуем прямую функцию MapView
  if (typeof window.__mapViewShareHandler === 'function') {
    console.log('✅ Using direct MapView handler')
    window.__mapViewShareHandler(requestId)
    return
  }
  
  // Затем пробуем массив обработчиков
  if (window.__shareRequestHandlers.length > 0) {
    window.__shareRequestHandlers.forEach(handler => {
      try {
        handler(requestId)
      } catch (err) {
        console.error('Handler error:', err)
      }
    })
  } else {
    console.warn('⚠️ No handlers registered! MapView may not be mounted.')
  }
}

// Обработчики для звуковых уведомлений
// Уведомления о новых заявках ТОЛЬКО когда "Готов помогать" включен
const handleNewRequest = (data) => {
  // Проверяем статус "Готов помогать"
  const isAvailable = authStore.user?.is_available_to_help
  console.log('🔔 New request notification:', data, '| is_available_to_help:', isAvailable)
  
  if (!isAvailable) {
    console.log('⏸️ Уведомление пропущено - режим "Готов помогать" выключен')
    return
  }
  
  soundService.playNotification()
  showNotification('🆘 Новая заявка рядом!', {
    body: data.description || 'Кто-то просит помощь',
    url: '/map'
  })
}

const handleNewMessage = (data) => {
  console.log('💬 New message:', data)
  soundService.playMessage()
}

const handleNewResponse = (data) => {
  console.log('👋 New response:', data)
  soundService.playNotification()
  showNotification('👋 Новый отклик!', {
    body: data.helperName || 'Кто-то готов помочь',
    url: '/my-requests'
  })
}

const handleResponseAccepted = (data) => {
  console.log('✅ Response accepted:', data)
  soundService.playSuccess()
  showNotification('✅ Ваш отклик принят!', {
    body: 'Вы можете начать чат',
    url: '/my-responses'
  })
}

const handleFriendOnline = (data) => {
  console.log('👥 Friend online:', data)
  soundService.play('message')
}

const handleFriendRequest = (data) => {
  // Уведомления о друзьях тоже только когда "Готов помогать"
  const isAvailable = authStore.user?.is_available_to_help
  console.log('🔔 Friend request nearby:', data, '| is_available_to_help:', isAvailable)
  
  if (!isAvailable) {
    console.log('⏸️ Уведомление пропущено - режим "Готов помогать" выключен')
    return
  }
  
  soundService.playNotification()
  showNotification(`👥 Ваш друг создал заявку!`, {
    body: data.message || 'Друг просит помощь рядом',
    url: '/map'
  })
}

// Обработчик приглашения помочь вместе
const handleRequestShared = (data) => {
  console.log('📨 Request shared:', data)
  
  // Сохраняем приглашение в store
  invitationsStore.addInvitation(data)
  
  // Звук и уведомление
  soundService.playNotification()
  showNotification(`👥 ${data.sender?.name || 'Друг'} приглашает помочь!`, {
    body: data.message || `Заявка: ${data.description || 'Нужна помощь'}`,
    url: '/messages' // Перенаправляем в раздел сообщений/приглашений
  })
}

// Обработчик заявки в друзья
const handleFriendRequestReceived = (data) => {
  console.log('👥 Friend request received:', data)
  soundService.playNotification()
  showNotification(`👥 Заявка в друзья`, {
    body: `${data.sender?.full_name || 'Пользователь'} хочет добавить вас в друзья`,
    url: '/profile' // Переходим в профиль для принятия
  })
}

onMounted(() => {
  // Автоматический вход если есть сохранённый токен
  const token = localStorage.getItem('token')
  const rememberMe = localStorage.getItem('rememberMe')
  
  if (token) {
    console.log('✅ Найден сохранённый пользователь')
    
    // Инициализируем Push-уведомления (ВСЕГДА когда есть токен)
    initializePushNotifications().then(success => {
      console.log('🔔 Push notifications:', success ? 'enabled' : 'not available')
    }).catch(err => {
      console.warn('Push init error:', err)
    })
    
    // Если на странице входа/регистрации и запомнили - переход на карту
    if (rememberMe === 'true') {
      const currentPath = window.location.pathname
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
        router.push('/map')
      }
    }
  }
  
  // Подписываемся на WebSocket события для звуковых уведомлений
  wsService.on('helpRequest:new', handleNewRequest)
  wsService.on('helpRequest:created', handleNewRequest)
  wsService.on('chat:message', handleNewMessage)
  wsService.on('message:new', handleNewMessage)
  wsService.on('response:new', handleNewResponse)
  wsService.on('response:created', handleNewResponse)
  wsService.on('response_accepted', handleResponseAccepted)
  wsService.on('friend_online', handleFriendOnline)
  wsService.on('friend_request_nearby', handleFriendRequest)
  wsService.on('friend_request_received', handleFriendRequestReceived)
  wsService.on('request:shared', handleRequestShared)
  
  console.log('🔊 Sound notifications enabled')
})

onUnmounted(() => {
  // Отписываемся от событий
  wsService.off('helpRequest:new', handleNewRequest)
  wsService.off('helpRequest:created', handleNewRequest)
  wsService.off('chat:message', handleNewMessage)
  wsService.off('message:new', handleNewMessage)
  wsService.off('response:new', handleNewResponse)
  wsService.off('response:created', handleNewResponse)
  wsService.off('response_accepted', handleResponseAccepted)
  wsService.off('friend_online', handleFriendOnline)
  wsService.off('friend_request_nearby', handleFriendRequest)
  wsService.off('friend_request_received', handleFriendRequestReceived)
  wsService.off('request:shared', handleRequestShared)
})


</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
