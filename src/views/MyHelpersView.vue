<template>
  <div class="min-h-screen bg-gray-50">
    <NavigationHeader />
    
    <div class="max-w-4xl mx-auto py-8 px-4">
      <h1 class="text-4xl font-black mb-10 text-gray-900">
        Мои помощи
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

      <div class="space-y-6">
        <div
          v-for="request in acceptedRequests"
          :key="request.id"
          class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all"
        >
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="text-2xl font-black text-gray-900">
                {{ getProblemTypeName(request.problem_type) }}
              </h3>
              <p class="text-base text-gray-600 mt-1 font-medium">
                {{ formatDate(request.created_at) }}
              </p>
            </div>
            <span
              :class="getStatusClass(request.status)"
              class="px-4 py-2 rounded-xl text-base font-black"
            >
              {{ getStatusName(request.status) }}
            </span>
          </div>

          <p class="text-lg text-gray-800 mb-5 leading-relaxed">
            {{ request.description }}
          </p>

          <!-- Информация о заявителе -->
          <div
            v-if="request.user"
            class="mb-4 p-4 bg-blue-50 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 font-semibold mb-1">
                  Заявитель:
                </p>
                <router-link 
                  :to="`/user/${request.user.id}`"
                  class="text-lg font-bold text-gray-900 hover:text-blue-600 transition block"
                >
                  {{ request.user.full_name }}
                </router-link>
                <p class="text-sm text-gray-600">
                  Рейтинг: ⭐ {{ request.user.rating || '0.00' }}
                </p>
              </div>
              <!-- Кнопка добавления в друзья -->
              <button
                v-if="!request.userIsFriend && !request.userFriendRequestSent"
                :disabled="request.sendingFriendRequest"
                class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                @click="sendFriendRequestToUser(request)"
              >
                {{ request.sendingFriendRequest ? '...' : '👥 В друзья' }}
              </button>
              <span
                v-else-if="request.userFriendRequestSent"
                class="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg font-semibold"
              >
                ✓ Заявка
              </span>
              <span
                v-else-if="request.userIsFriend"
                class="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-semibold"
              >
                ✓ Друг
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-green-600 font-black text-2xl">💰 {{ request.amount }} ₽</span>
            <div class="flex gap-2">
              <!-- Кнопка оценки заявителя -->
              <button
                v-if="request.status === 'completed' && !request.userHasRated"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                @click="openRatingModal(request)"
              >
                ⭐ Оценить заявителя
              </button>
              
              <!-- Информация о взаимной оценке -->
              <span
                v-if="request.mutualRatingsComplete"
                class="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold"
              >
                ✅ Оценки завершены
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="acceptedRequests.length === 0"
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p class="text-gray-500 mb-4">
            У вас пока нет принятых запросов на помощь
          </p>
          <router-link
            to="/map"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Найти запросы на карте
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
          Оцените заявителя
        </h3>
        <p class="text-gray-600 mb-6">
          {{ selectedRequest?.user?.full_name }}
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { useRequestHelpers } from '@/composables/useRequestHelpers'

const { getProblemTypeName, getStatusName, getStatusClass, formatDate } = useRequestHelpers()

const authStore = useAuthStore()
const allRequests = ref([])
const showRatingModal = ref(false)
const selectedRequest = ref(null)
const ratingValue = ref(0)
const ratingComment = ref('')
const isSubmittingRating = ref(false)

// Фильтруем только те запросы, где текущий пользователь является помощником
const acceptedRequests = computed(() => {
  return allRequests.value.filter(request => 
    request.helper_id === authStore.user?.id && 
    (request.status === 'accepted' || request.status === 'in_progress' || request.status === 'completed')
  )
})

onMounted(async () => {
  await loadRequests()
})

const error = ref(null)

async function loadRequests() {
  try {
    error.value = null
    
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
    
    // Загружаем все запросы и фильтруем те, где мы помощники
    const response = await apiService.getHelpRequests()
    // API возвращает { success, count, data: [...] }
    const requests = response?.data || response || []
    
    // Маппинг полей createdAt → created_at
    const mappedRequests = requests.map(request => ({
      ...request,
      created_at: request.createdAt || request.created_at,
      userIsFriend: request.user?.id ? friendIds.includes(request.user.id) : false,
      userFriendRequestSent: false,
      sendingFriendRequest: false
    }))
    
    allRequests.value = mappedRequests
    
    // Проверяем статус рейтинга для завершенных запросов
    for (const request of acceptedRequests.value) {
      if (request.status === 'completed' && request.user_id) {
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
    console.error('Error loading requests:', err)
    error.value = 'Ошибка загрузки запросов. Попробуйте обновить страницу.'
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

async function sendFriendRequestToUser(request) {
  if (!request.user?.id) return
  
  try {
    request.sendingFriendRequest = true
    const response = await apiService.sendFriendRequest(request.user.id)
    if (response.success) {
      request.userFriendRequestSent = true
      // Если сразу стали друзьями (встречная заявка)
      if (response.message?.includes('теперь друзья')) {
        request.userIsFriend = true
        request.userFriendRequestSent = false
      }
    }
  } catch (err) {
    console.error('Failed to send friend request:', err)
    alert(err.response?.data?.message || 'Не удалось отправить заявку')
  } finally {
    request.sendingFriendRequest = false
  }
}
</script>


