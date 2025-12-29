<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NavigationHeader />
    
    <div class="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      <div class="flex items-center justify-between mb-6 sm:mb-10">
        <h1 class="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
          📤 Мои отклики
        </h1>
        
        <!-- Статистика -->
        <div
          v-if="stats"
          class="flex gap-2 sm:gap-4 text-sm sm:text-base"
        >
          <span class="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full font-bold">
            ⏳ {{ stats.pending }}
          </span>
          <span class="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-bold">
            ✅ {{ stats.accepted }}
          </span>
          <span class="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full font-bold">
            ❌ {{ stats.rejected }}
          </span>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all',
            currentFilter === filter.value 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
          @click="currentFilter = filter.value"
        >
          {{ filter.icon }} {{ filter.label }}
        </button>
      </div>

      <!-- Ошибка -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl"
      >
        <p class="text-red-700 dark:text-red-400 font-bold">
          {{ error }}
        </p>
      </div>

      <!-- Загрузка -->
      <div
        v-if="loading"
        class="space-y-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-pulse"
        >
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>

      <!-- Список откликов -->
      <div
        v-else
        class="space-y-4 sm:space-y-6"
      >
        <div
          v-for="response in filteredResponses"
          :key="response.id"
          :class="[
            'bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-8 transition-all hover:shadow-2xl',
            getStatusBorderClass(response.status)
          ]"
        >
          <!-- Заголовок с типом проблемы и статусом -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {{ getProblemTypeName(response.helpRequest?.problem_type) }}
              </h3>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {{ formatDate(response.created_at) }}
              </p>
            </div>
            <span
              :class="getStatusBadgeClass(response.status)"
              class="px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-sm sm:text-base font-black"
            >
              {{ getStatusText(response.status) }}
            </span>
          </div>

          <!-- Описание проблемы -->
          <p class="text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {{ response.helpRequest?.description }}
          </p>

          <!-- Информация о заявителе -->
          <div
            v-if="response.helpRequest?.user"
            class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
          >
            <div class="flex items-center gap-4">
              <div
                v-if="response.helpRequest.user.avatar_url"
                class="w-12 h-12 rounded-full overflow-hidden"
              >
                <img
                  :src="getAvatarUrl(response.helpRequest.user.avatar_url)"
                  class="w-full h-full object-cover"
                >
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg"
              >
                {{ getInitials(response.helpRequest.user.full_name) }}
              </div>
              <div>
                <router-link 
                  :to="`/user/${response.helpRequest.user.id}`"
                  class="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {{ response.helpRequest.user.full_name }}
                </router-link>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  ⭐ {{ Number(response.helpRequest.user.rating || 0).toFixed(1) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Ваше сообщение -->
          <div
            v-if="response.message"
            class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-500"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
              Ваше сообщение:
            </p>
            <p class="text-gray-800 dark:text-gray-200 italic">
              «{{ response.message }}»
            </p>
          </div>

          <!-- Детали отклика -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            <span
              v-if="response.distance_km"
              class="flex items-center gap-1"
            >
              📍 {{ response.distance_km }} км
            </span>
            <span
              v-if="response.eta_minutes"
              class="flex items-center gap-1"
            >
              ⏱️ {{ response.eta_minutes }} мин
            </span>
            <span class="font-bold text-green-600 dark:text-green-400 text-lg sm:text-xl">
              💰 {{ response.helpRequest?.amount }} ₽
            </span>
          </div>

          <!-- Действия в зависимости от статуса -->
          <div class="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <!-- Для принятых откликов - открыть чат -->
            <router-link
              v-if="response.status === 'accepted'"
              :to="`/chat/${response.help_request_id}`"
              class="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold text-center hover:from-green-600 hover:to-green-800 transition shadow-lg"
            >
              💬 Открыть чат
            </router-link>
            
            <!-- Поделиться с друзьями (для принятых откликов) -->
            <button
              v-if="response.status === 'accepted'"
              class="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-bold hover:bg-purple-200 dark:hover:bg-purple-800/50 transition"
              @click="openShareModal(response)"
            >
              👥 Поделиться
            </button>
            
            <!-- Для ожидающих откликов - информация и кнопка отмены -->
            <div
              v-if="response.status === 'pending'"
              class="flex-1 flex flex-col sm:flex-row gap-2"
            >
              <div class="flex-1 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl font-medium text-center">
                ⏳ Ожидает подтверждения от заявителя
                <span v-if="canWithdraw(response)" class="block text-xs mt-1">
                  (более 1 часа без ответа)
                </span>
              </div>
              <button
                v-if="canWithdraw(response)"
                :disabled="isWithdrawing"
                class="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-800/50 transition disabled:opacity-50"
                @click="withdrawResponse(response)"
              >
                {{ isWithdrawing ? 'Отмена...' : '❌ Отозвать' }}
              </button>
            </div>
            
            <!-- Для отклонённых -->
            <div
              v-if="response.status === 'rejected'"
              class="flex-1"
            >
              <div class="px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium text-center">
                ❌ {{ response.rejection_reason || 'Заявитель выбрал другого помощника' }}
              </div>
            </div>

            <!-- Кнопка просмотра заявки -->
            <router-link
              :to="`/responses/${response.help_request_id}`"
              class="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              👁️ Детали
            </router-link>
          </div>
        </div>

        <!-- Пустой список -->
        <div
          v-if="filteredResponses.length === 0 && !loading"
          class="text-center py-16"
        >
          <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <svg
              class="w-12 h-12 text-gray-400"
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
          <p class="text-xl text-gray-500 dark:text-gray-400 font-semibold mb-2">
            {{ currentFilter === 'all' ? 'У вас пока нет откликов' : 'Нет откликов с таким статусом' }}
          </p>
          <p class="text-gray-400 dark:text-gray-500 mb-6">
            Откликайтесь на заявки на карте, чтобы помогать людям
          </p>
          <router-link
            to="/map"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            🗺️ Открыть карту
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно "Поделиться с друзьями" -->
    <div
      v-if="showShareModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showShareModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4">
          👥 Пригласить друзей
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Выберите друзей для совместного выполнения заявки:
        </p>
        
        <div
          v-if="isLoadingFriends"
          class="text-center py-4"
        >
          <span class="animate-spin inline-block text-2xl">⏳</span>
        </div>
        
        <div
          v-else-if="friendsList.length === 0"
          class="text-center py-4"
        >
          <p class="text-gray-500">
            У вас пока нет друзей
          </p>
        </div>
        
        <div
          v-else
          class="space-y-2 max-h-60 overflow-y-auto mb-4"
        >
          <label
            v-for="friend in friendsList"
            :key="friend.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
            :class="selectedFriendIds.includes(friend.id) ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-500' : 'border-2 border-transparent'"
          >
            <input
              v-model="selectedFriendIds"
              type="checkbox"
              :value="friend.id"
              class="w-5 h-5 text-purple-600 rounded"
            >
            <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg">
              <img
                v-if="friend.avatar_url"
                :src="getAvatarUrl(friend.avatar_url)"
                class="w-full h-full rounded-full object-cover"
              >
              <span v-else>👤</span>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">{{ friend.full_name }}</p>
              <p
                v-if="friend.is_available_to_help"
                class="text-xs text-green-600"
              >✅ Готов помогать</p>
            </div>
          </label>
        </div>
        
        <textarea
          v-if="friendsList.length > 0"
          v-model="shareMessage"
          placeholder="Сообщение (необязательно)"
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg mb-4 resize-none"
          rows="2"
        />
        
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-bold"
            @click="showShareModal = false"
          >
            Отмена
          </button>
          <button
            :disabled="selectedFriendIds.length === 0 || isSharing"
            class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold disabled:opacity-50"
            @click="shareWithFriends"
          >
            {{ isSharing ? 'Отправка...' : `Отправить (${selectedFriendIds.length})` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { useRequestHelpers } from '@/composables/useRequestHelpers'
import { useToast } from '@/composables/useToast'
import { io } from 'socket.io-client'

const { getProblemTypeName, formatDate } = useRequestHelpers()
const toast = useToast()

// Функция для получения полного URL аватара
const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

const responses = ref([])
const stats = ref(null)
const loading = ref(true)
const error = ref(null)
const currentFilter = ref('all')
let socket = null

// Поделиться с друзьями
const showShareModal = ref(false)
const responseToShare = ref(null)
const friendsList = ref([])
const selectedFriendIds = ref([])
const shareMessage = ref('')
const isLoadingFriends = ref(false)
const isSharing = ref(false)
const isWithdrawing = ref(false)

// Проверка: можно ли отозвать отклик (больше 1 часа без ответа)
function canWithdraw(response) {
  if (response.status !== 'pending') return false
  const createdAt = new Date(response.created_at)
  const now = new Date()
  const hoursDiff = (now - createdAt) / (1000 * 60 * 60)
  return hoursDiff >= 1
}

// Отозвать свой отклик
async function withdrawResponse(response) {
  if (!confirm('Вы уверены, что хотите отозвать этот отклик?')) return
  
  try {
    isWithdrawing.value = true
    await apiService.client.delete(`/responses/${response.id}/withdraw`)
    
    // Удаляем из списка или меняем статус
    const idx = responses.value.findIndex(r => r.id === response.id)
    if (idx !== -1) {
      responses.value.splice(idx, 1)
    }
    
    // Обновляем статистику
    if (stats.value) {
      stats.value.pending = Math.max(0, stats.value.pending - 1)
      stats.value.total = Math.max(0, stats.value.total - 1)
    }
    
    toast.success('Отклик успешно отозван')
  } catch (err) {
    console.error('Ошибка отзыва отклика:', err)
    toast.error(err.response?.data?.error || 'Ошибка при отзыве отклика')
  } finally {
    isWithdrawing.value = false
  }
}

const filters = [
  { value: 'all', label: 'Все', icon: '📋' },
  { value: 'pending', label: 'Ожидают', icon: '⏳' },
  { value: 'accepted', label: 'Приняты', icon: '✅' },
  { value: 'rejected', label: 'Отклонены', icon: '❌' },
]

const filteredResponses = computed(() => {
  if (currentFilter.value === 'all') {
    return responses.value
  }
  return responses.value.filter(r => r.status === currentFilter.value)
})

onMounted(async () => {
  await loadResponses()
  setupWebSocket()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
})

async function loadResponses() {
  try {
    loading.value = true
    error.value = null
    
    const result = await apiService.getMyResponses()
    
    // API возвращает { success, data, stats }
    const responsesData = result?.data || result || []
    
    // Нормализуем даты - используем createdAt или created_at
    responses.value = responsesData.map(r => ({
      ...r,
      created_at: r.created_at || r.createdAt
    }))
    
    stats.value = result?.stats || { total: 0, pending: 0, accepted: 0, rejected: 0 }
    
    console.log('✅ Загружено откликов:', responses.value.length)
  } catch (err) {
    console.error('❌ Ошибка загрузки откликов:', err)
    error.value = 'Ошибка загрузки откликов. Попробуйте обновить страницу.'
  } finally {
    loading.value = false
  }
}

function setupWebSocket() {
  const token = localStorage.getItem('token')
  if (!token) return
  
  const wsUrl = window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`
  
  socket = io(wsUrl.replace(/^ws/, 'http'), { auth: { token } })
  
  socket.on('connect', () => {
    console.log('✅ WebSocket подключен к MyResponsesView')
  })
  
  // Мой отклик принят
  socket.on('response_accepted', (data) => {
    console.log('✅ Ваш отклик принят:', data)
    const response = responses.value.find(r => r.id === data.responseId)
    if (response) {
      response.status = 'accepted'
      if (stats.value) {
        stats.value.pending = Math.max(0, stats.value.pending - 1)
        stats.value.accepted++
      }
      
      // Показываем красивое уведомление
      toast.success('Ваш отклик принят! Откройте чат для связи.', '🎉 Поздравляем!')
    }
  })
  
  // Мой отклик отклонён
  socket.on('response_rejected', (data) => {
    console.log('❌ Ваш отклик отклонён:', data)
    const response = responses.value.find(r => r.id === data.responseId)
    if (response) {
      response.status = 'rejected'
      response.rejection_reason = data.reason
      if (stats.value) {
        stats.value.pending = Math.max(0, stats.value.pending - 1)
        stats.value.rejected++
      }
      
      // Показываем красивое уведомление
      toast.warning(data.reason || 'Заявитель выбрал другого помощника', 'Отклик отклонён')
    }
  })
}

function getStatusText(status) {
  switch (status) {
    case 'pending': return '⏳ Ожидает'
    case 'accepted': return '✅ Принят'
    case 'rejected': return '❌ Отклонён'
    default: return status
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    case 'accepted': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    case 'rejected': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}

function getStatusBorderClass(status) {
  switch (status) {
    case 'pending': return 'border-l-4 border-yellow-400'
    case 'accepted': return 'border-l-4 border-green-500'
    case 'rejected': return 'border-l-4 border-red-400 opacity-75'
    default: return ''
  }
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Открыть модальное окно "Поделиться"
async function openShareModal(response) {
  responseToShare.value = response
  selectedFriendIds.value = []
  shareMessage.value = ''
  showShareModal.value = true
  
  try {
    isLoadingFriends.value = true
    const result = await apiService.getFriends()
    // API возвращает { success, count, data: [...] }
    const friendsData = result?.data || result || []
    friendsList.value = friendsData.map(f => f.friend).filter(Boolean)
  } catch (err) {
    console.error('Error loading friends:', err)
    friendsList.value = []
  } finally {
    isLoadingFriends.value = false
  }
}

// Отправить приглашение друзьям
async function shareWithFriends() {
  if (selectedFriendIds.value.length === 0 || !responseToShare.value) return
  
  try {
    isSharing.value = true
    
    const response = await apiService.client.post(`/help-requests/${responseToShare.value.help_request_id}/share`, {
      friendIds: selectedFriendIds.value,
      message: shareMessage.value || null
    })
    
    if (response.success) {
      toast.success(`Приглашение отправлено ${response.notifiedCount} друзьям!`)
      showShareModal.value = false
    }
  } catch (err) {
    console.error('Error sharing:', err)
    toast.error(err.response?.data?.message || 'Ошибка при отправке')
  } finally {
    isSharing.value = false
  }
}
</script>
