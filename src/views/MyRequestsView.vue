<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <NavigationHeader />
    
    <div class="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <h1 class="text-2xl sm:text-4xl font-black mb-6 sm:mb-10 text-gray-900 dark:text-white">
        Мои запросы
      </h1>

      <!-- Ошибка -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
      >
        <p class="text-red-700 font-bold">
          {{ error }}
        </p>
      </div>

      <div class="space-y-4 sm:space-y-6">
        <div
          v-for="request in requests"
          :key="request.id"
          class="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 hover:shadow-2xl transition-all"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-3 sm:mb-5">
            <div>
              <h3 class="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                {{ getProblemTypeName(request.problem_type) }}
              </h3>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 font-medium">
                {{ formatDate(request.created_at) }}
              </p>
            </div>
            <span
              :class="getStatusClass(request.status)"
              class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-black self-start"
            >
              {{ getStatusName(request.status) }}
            </span>
          </div>

          <p class="text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-4 sm:mb-5 leading-relaxed">
            {{ request.description }}
          </p>

          <!-- Счётчик откликов для активных заявок -->
          <router-link
            v-if="request.status === 'active' && (request.responses_count > 0 || request.responsesCount > 0)"
            :to="`/responses/${request.id}`"
            class="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl flex items-center justify-between hover:from-yellow-100 hover:to-orange-100 transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">👋</span>
              <div>
                <p class="font-bold text-gray-900">
                  {{ request.responses_count || request.responsesCount }} {{ getResponsesWord(request.responses_count || request.responsesCount || 0) }}
                </p>
                <p class="text-sm text-gray-600">
                  Нажмите чтобы посмотреть
                </p>
              </div>
            </div>
            <span class="text-yellow-600 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
          </router-link>
          
          <!-- Кнопка просмотра откликов для активных заявок без откликов -->
          <router-link
            v-else-if="request.status === 'active'"
            :to="`/responses/${request.id}`"
            class="mb-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">⏳</span>
              <div>
                <p class="font-bold text-gray-700">
                  Пока нет откликов
                </p>
                <p class="text-sm text-gray-500">
                  Ожидайте откликов от помощников
                </p>
              </div>
            </div>
            <span class="text-gray-400 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
          </router-link>

          <!-- Информация о помощнике -->
          <div
            v-if="request.helper"
            class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Помощник:
                </p>
                <router-link 
                  :to="`/user/${request.helper.id}`"
                  class="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 transition block"
                >
                  {{ request.helper.full_name }}
                </router-link>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Рейтинг: ⭐ {{ request.helper.rating || '0.00' }}
                </p>
              </div>
              <!-- Кнопка добавления в друзья -->
              <button
                v-if="!request.helperIsFriend && !request.helperFriendRequestSent"
                :disabled="request.sendingFriendRequest"
                class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                @click="sendFriendRequestToHelper(request)"
              >
                {{ request.sendingFriendRequest ? '...' : '👥 В друзья' }}
              </button>
              <span
                v-else-if="request.helperFriendRequestSent"
                class="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg font-semibold"
              >
                ✓ Заявка
              </span>
              <span
                v-else-if="request.helperIsFriend"
                class="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-semibold"
              >
                ✓ Друг
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span class="text-green-600 dark:text-green-400 font-black text-xl sm:text-2xl">💰 {{ request.amount }} ₽</span>
            <div class="flex flex-wrap gap-2">
              <!-- Кнопка завершения запроса -->
              <button
                v-if="request.status === 'accepted' || request.status === 'in_progress'"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                @click="completeRequest(request.id)"
              >
                ✅ Завершить
              </button>
              
              <!-- Кнопка оценки -->
              <button
                v-if="request.status === 'completed' && !request.userHasRated"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                @click="openRatingModal(request)"
              >
                ⭐ Оценить
              </button>
              
              <!-- Симуляция оплаты по СБП -->
              <button
                v-if="request.status === 'completed'"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                @click="simulateP2PPayment(request)"
              >
                💳 Отметить оплату (СБП)
              </button>
              
              <!-- Отмена запроса -->
              <button
                v-if="request.status === 'active'"
                class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                @click="openCancelModal(request)"
              >
                ❌ Отменить
              </button>
              
              <!-- Поделиться с друзьями -->
              <button
                v-if="request.status === 'active' || request.status === 'accepted'"
                class="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                @click="openShareModal(request)"
              >
                👥 Поделиться
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="requests.length === 0"
          class="text-center py-12"
        >
          <svg
            class="w-20 h-20 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p class="text-gray-500 mb-4">
            У вас пока нет запросов
          </p>
          <router-link
            to="/create-request"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Создать запрос
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно оценки -->
    <div
      v-if="showRatingModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showRatingModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h3 class="text-2xl font-black text-gray-900 mb-4">
          Оцените помощника
        </h3>
        <p class="text-gray-600 mb-6">
          {{ selectedRequest?.helper?.full_name }}
        </p>
        
        <!-- Звезды рейтинга -->
        <div class="flex justify-center gap-2 mb-6">
          <button
            v-for="star in 5"
            :key="star"
            class="text-4xl transition-transform hover:scale-110"
            @click="ratingValue = star"
          >
            {{ star <= ratingValue ? '⭐' : '☆' }}
          </button>
        </div>
        
        <!-- Комментарий -->
        <textarea
          v-model="ratingComment"
          placeholder="Оставьте комментарий (необязательно)"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6 resize-none"
          rows="3"
        />
        
        <!-- Кнопки -->
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
            @click="showRatingModal = false"
          >
            Отмена
          </button>
          <button
            :disabled="ratingValue === 0 || isSubmittingRating"
            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            @click="submitRating"
          >
            {{ isSubmittingRating ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно отмены -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showCancelModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          ❌ Отмена заявки
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Укажите причину отмены (это поможет улучшить сервис):
        </p>
        
        <!-- Быстрые причины -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="reason in cancelReasons"
            :key="reason"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-all',
              cancelReason === reason 
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-2 border-red-500' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            @click="cancelReason = reason"
          >
            {{ reason }}
          </button>
        </div>
        
        <!-- Своя причина -->
        <textarea
          v-model="cancelReason"
          placeholder="Или введите свою причину..."
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 resize-none"
          rows="2"
        />
        
        <!-- Кнопки -->
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            @click="showCancelModal = false"
          >
            Назад
          </button>
          <button
            :disabled="!cancelReason.trim() || isCancelling"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            @click="confirmCancel"
          >
            {{ isCancelling ? 'Отмена...' : 'Подтвердить отмену' }}
          </button>
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
        <h3 class="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          👥 Поделиться с друзьями
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Выберите друзей, которым хотите отправить приглашение помочь:
        </p>
        
        <!-- Загрузка друзей -->
        <div
          v-if="isLoadingFriends"
          class="text-center py-4"
        >
          <span class="animate-spin inline-block text-2xl">⏳</span>
          <p class="text-gray-500 mt-2">
            Загрузка друзей...
          </p>
        </div>
        
        <!-- Нет друзей -->
        <div
          v-else-if="friendsList.length === 0"
          class="text-center py-4"
        >
          <span class="text-4xl mb-2 block">😞</span>
          <p class="text-gray-500">
            У вас пока нет друзей
          </p>
          <router-link 
            to="/profile?addFriend=true" 
            class="text-blue-600 hover:underline mt-2 inline-block"
          >
            Найти друзей →
          </router-link>
        </div>
        
        <!-- Список друзей -->
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
              class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            >
            <img
              v-if="friend.avatar_url"
              :src="getAvatarUrl(friend.avatar_url)"
              :alt="friend.full_name"
              class="w-10 h-10 rounded-full object-cover"
            >
            <div
              v-else
              class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg"
            >
              👤
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">{{ friend.full_name }}</p>
              <p
                v-if="friend.is_available_to_help"
                class="text-xs text-green-600"
              >✅ Готов помогать</p>
              <p
                v-else
                class="text-xs text-gray-500"
              >⚪ Не в сети</p>
            </div>
          </label>
        </div>
        
        <!-- Сообщение -->
        <textarea
          v-if="friendsList.length > 0"
          v-model="shareMessage"
          placeholder="Добавьте сообщение (необязательно)..."
          class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4 resize-none"
          rows="2"
        />
        
        <!-- Кнопки -->
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            @click="showShareModal = false"
          >
            Отмена
          </button>
          <button
            :disabled="selectedFriendIds.length === 0 || isSharing"
            class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { useRequestHelpers } from '@/composables/useRequestHelpers'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { getProblemTypeName, getStatusName, getStatusClass, formatDate } = useRequestHelpers()

// Склонение слова "отклик"
function getResponsesWord(count) {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 'откликов'
  if (n1 > 1 && n1 < 5) return 'отклика'
  if (n1 === 1) return 'отклик'
  return 'откликов'
}

const authStore = useAuthStore()

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

const requests = ref([])
const showRatingModal = ref(false)
const selectedRequest = ref(null)
const ratingValue = ref(0)
const ratingComment = ref('')
const isSubmittingRating = ref(false)
let socket = null

// Отмена заявки
const showCancelModal = ref(false)
const cancelReason = ref('')
const isCancelling = ref(false)
const requestToCancel = ref(null)
const cancelReasons = [
  'Проблема решена',
  'Нашёл помощь в другом месте',
  'Долго нет откликов',
  'Изменились планы',
  'Ошибка при создании'
]

// Поделиться с друзьями
const showShareModal = ref(false)
const requestToShare = ref(null)
const friendsList = ref([])
const selectedFriendIds = ref([])
const shareMessage = ref('')
const isLoadingFriends = ref(false)
const isSharing = ref(false)

onMounted(async () => {
  console.log('📄 MyRequestsView mounted')
  const token = localStorage.getItem('token')
  console.log('Token exists:', !!token)
  
  if (!token) {
    console.warn('⚠️ No token, redirecting to login')
    router.push('/login')
    return
  }
  
  await loadRequests()
  setupWebSocket()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
})

const error = ref(null)

async function loadRequests() {
  try {
    error.value = null
    console.log('🔄 Загружаем заявки пользователя...')
    const response = await apiService.getMyRequests()
    console.log('📦 Ответ от сервера:', response)
    // API возвращает { success, count, data: [...] }
    const requestsData = response?.data || response || []
    console.log('📊 Количество заявок:', requestsData.length)
    
    // Загружаем список друзей для проверки
    let friendIds = []
    try {
      const friendsRes = await apiService.getFriends()
      // API возвращает { success, count, data: [...] }
      const friendsData = friendsRes?.data || friendsRes || []
      friendIds = friendsData.map(f => f.friend?.id)
    } catch (e) {
      console.error('Error loading friends:', e)
    }
    
    // Маппинг полей createdAt → created_at
    const mappedRequests = (requestsData || []).map(request => {
      // Нормализуем поле даты - используем camelCase если есть, иначе snake_case
      const createdDate = request.createdAt || request.created_at
      if (!createdDate) {
        console.warn('⚠️ Заявка без даты:', request.id, 'поля:', Object.keys(request))
      }
      
      return {
        ...request,
        created_at: createdDate,
        helperIsFriend: request.helper?.id ? friendIds.includes(request.helper.id) : false,
        helperFriendRequestSent: false,
        sendingFriendRequest: false
      }
    })
    
    // Сортируем заявки по дате создания (новые сверху)
    requests.value = mappedRequests.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateB - dateA // DESC - новые первыми
    })
    console.log('✅ Заявки загружены и отсортированы:', requests.value.length)
    
    // Проверяем статус рейтинга для завершенных запросов
    for (const request of requests.value) {
      if (request.status === 'completed' && request.helper_id) {
        try {
          const ratingStatus = await apiService.getRatingStatus(request.id)
          request.userHasRated = ratingStatus.currentUserHasRated
          request.mutualRatingsComplete = ratingStatus.mutualRatingsComplete
        } catch (err) {
          console.error('Error loading rating status:', err)
        }
      }
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки запросов:', err)
    console.error('Детали ошибки:', err.response?.data || err.message)
    error.value = 'Ошибка загрузки запросов. Попробуйте обновить страницу.'
  }
}

async function completeRequest(id) {
  if (!confirm('Подтвердить завершение помощи?')) return

  try {
    await apiService.completeHelpRequest(id)
    alert('Запрос завершен! Пожалуйста, оцените помощника.')
    await loadRequests()
  } catch (error) {
    console.error('Error completing request:', error)
    alert('Ошибка при завершении запроса')
  }
}

async function _cancelRequest(id) {
  if (!confirm('Вы уверены, что хотите отменить запрос?')) return

  try {
    await apiService.cancelHelpRequest(id, 'Отменено пользователем')
    await loadRequests()
  } catch (error) {
    console.error('Error cancelling request:', error)
    alert('Ошибка при отмене запроса')
  }
}

// Открыть модальное окно отмены
function openCancelModal(request) {
  requestToCancel.value = request
  cancelReason.value = ''
  showCancelModal.value = true
}

// Подтвердить отмену
async function confirmCancel() {
  if (!requestToCancel.value || !cancelReason.value.trim()) return
  
  try {
    isCancelling.value = true
    await apiService.cancelHelpRequest(requestToCancel.value.id, cancelReason.value.trim())
    showCancelModal.value = false
    requestToCancel.value = null
    cancelReason.value = ''
    await loadRequests()
  } catch (error) {
    console.error('Error cancelling request:', error)
    alert('Ошибка при отмене запроса')
  } finally {
    isCancelling.value = false
  }
}

// Открыть модальное окно "Поделиться с друзьями"
async function openShareModal(request) {
  requestToShare.value = request
  selectedFriendIds.value = []
  shareMessage.value = ''
  showShareModal.value = true
  
  // Загружаем список друзей
  try {
    isLoadingFriends.value = true
    const response = await apiService.getFriends()
    // API возвращает { success, count, data: [...] }
    const friendsData = response?.data || response || []
    friendsList.value = friendsData.map(f => f.friend).filter(Boolean)
    console.log('👥 Загружено друзей:', friendsList.value.length)
  } catch (err) {
    console.error('Error loading friends:', err)
    friendsList.value = []
  } finally {
    isLoadingFriends.value = false
  }
}

// Отправить приглашение друзьям
async function shareWithFriends() {
  if (selectedFriendIds.value.length === 0 || !requestToShare.value) return
  
  try {
    isSharing.value = true
    
    const response = await apiService.client.post(`/help-requests/${requestToShare.value.id}/share`, {
      friendIds: selectedFriendIds.value,
      message: shareMessage.value || null
    })
    
    if (response.success) {
      alert(`✅ Приглашение отправлено ${response.notifiedCount} друзьям!`)
      showShareModal.value = false
      requestToShare.value = null
      selectedFriendIds.value = []
      shareMessage.value = ''
    }
  } catch (err) {
    console.error('Error sharing request:', err)
    alert(err.response?.data?.message || 'Ошибка при отправке приглашения')
  } finally {
    isSharing.value = false
  }
}

// Симуляция оплаты через P2P / СБП
async function simulateP2PPayment(request) {
  try {
    if (!authStore.user?.phone) {
      alert('У вас в профиле не указан телефон. Укажите телефон, чтобы отметить оплату.')
      return
    }
    if (!request.helper || !request.helper.phone) {
      alert('У помощника не указан телефон — невозможно создать P2P-платёж.')
      return
    }

    if (!confirm('Отметить оплату по СБП как выполненную?')) return

    // 1. Создаём платёж
    const createResp = await apiService.createP2PPayment({
      help_request_id: request.id,
      amount: request.amount,
      helper_phone: request.helper.phone
    })

    const paymentId = createResp?.id
    if (!paymentId) {
      console.error('P2P create response:', createResp)
      alert('Не удалось создать запись платежа')
      return
    }

    // 2. Подтверждаем платёж (симуляция успешной оплаты)
    await apiService.confirmP2PPayment(paymentId, {
      payer_phone: authStore.user.phone,
      receipt_url: 'P2P-симуляция'
    })

    alert('Оплата по СБП отмечена как выполненная')
  } catch (error) {
    console.error('P2P payment error:', error)
    alert('Ошибка при симуляции оплаты')
  }
}

function openRatingModal(request) {
  selectedRequest.value = request
  ratingValue.value = 0
  ratingComment.value = ''
  showRatingModal.value = true
}

async function submitRating() {
  if (ratingValue.value === 0) {
    alert('Пожалуйста, выберите оценку')
    return
  }

  try {
    isSubmittingRating.value = true
    
    await apiService.createRating(selectedRequest.value.id, {
      rating: ratingValue.value,
      comment: ratingComment.value || null
    })

    alert('Спасибо за оценку!')
    showRatingModal.value = false
    await loadRequests()
  } catch (error) {
    console.error('Error submitting rating:', error)
    alert('Ошибка при отправке оценки')
  } finally {
    isSubmittingRating.value = false
  }
}

// WebSocket для получения уведомлений о новых откликах
async function sendFriendRequestToHelper(request) {
  if (!request.helper?.id) return
  
  try {
    request.sendingFriendRequest = true
    const response = await apiService.sendFriendRequest(request.helper.id)
    if (response.success) {
      request.helperFriendRequestSent = true
      // Если сразу стали друзьями (встречная заявка)
      if (response.message?.includes('теперь друзья')) {
        request.helperIsFriend = true
        request.helperFriendRequestSent = false
      }
    }
  } catch (err) {
    console.error('Failed to send friend request:', err)
    alert(err.response?.data?.message || 'Не удалось отправить заявку')
  } finally {
    request.sendingFriendRequest = false
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
    console.log('✅ WebSocket подключен к MyRequestsView')
  })
  
  socket.on('disconnect', () => {
    console.log('❌ WebSocket отключен')
  })
  
  // Новый отклик на мою заявку
  socket.on('new_response', (data) => {
    console.log('🔔 Новый отклик:', data)
    
    // Находим заявку и обновляем счетчик откликов
    const request = requests.value.find(r => r.id === data.helpRequest.id)
    if (request) {
      request.responses_count = data.helpRequest.responses_count
      
      // Показываем уведомление
      alert(`🔔 Новый отклик на вашу заявку "${getProblemTypeName(request.problem_type)}" от ${data.response.helper?.full_name || 'помощника'}!`)
    }
    
    // Перезагружаем список заявок
    loadRequests()
  })
  
  // Мой отклик принят
  socket.on('response_accepted', (data) => {
    console.log('✅ Ваш отклик принят:', data)
    alert('✅ Отлично! Ваш отклик принят. Теперь вы можете общаться с автором заявки в чате.')
    loadRequests()
  })
  
  // Мой отклик отклонен
  socket.on('response_rejected', (data) => {
    console.log('❌ Ваш отклик отклонен:', data)
    loadRequests()
  })
}
</script>



