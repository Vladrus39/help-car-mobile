<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <NavigationHeader />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-4 sm:mb-8">
          <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-2 sm:mb-4 overflow-x-auto">
            <router-link
              to="/"
              class="text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
            >
              🏠 Главная
            </router-link>
            <span class="text-gray-400">/</span>
            <router-link
              to="/my-requests"
              class="text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
            >
              📋 Мои запросы
            </router-link>
            <span class="text-gray-400">/</span>
            <span class="text-gray-600 font-semibold whitespace-nowrap">Отклики</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2">
            <span v-if="isRequestOwner">Отклики на ваш запрос</span>
            <span v-else-if="helpRequest">Откликнуться на заявку</span>
            <span v-else>Заявка</span>
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">
            <span v-if="isRequestOwner">Выберите того, кто поможет вам</span>
            <span v-else-if="helpRequest">Оставьте сообщение автору заявки</span>
            <span v-else>Загрузка...</span>
          </p>
        </div>

        <!-- Загрузка -->
        <div
          v-if="isLoading"
          class="text-center py-20"
        >
          <div class="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p class="mt-4 text-xl text-gray-600 font-semibold">
            Загрузка...
          </p>
        </div>

        <!-- Ошибка -->
        <div
          v-else-if="error"
          class="p-8 bg-red-50 border-2 border-red-200 rounded-2xl"
        >
          <p class="text-red-700 text-lg font-bold">
            {{ error }}
          </p>
        </div>

        <!-- Форма отклика для неавтора -->
        <div
          v-else-if="!isRequestOwner && helpRequest"
          class="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8"
        >
          <!-- Информация о заявке -->
          <div class="mb-4 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-blue-200">
            <h2 class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-3 sm:mb-4">
              {{ helpRequest.description || 'Заявка на помощь' }}
            </h2>
            
            <!-- Фотографии заявки -->
            <div
              v-if="helpRequest.images && helpRequest.images.length > 0"
              class="mb-4 overflow-x-auto"
            >
              <div class="flex gap-2">
                <img
                  v-for="(image, idx) in helpRequest.images"
                  :key="idx"
                  :src="getImageUrl(image.url || image.thumbnail_url || image)"
                  :alt="`Фото ${idx + 1}`"
                  class="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition"
                  @click="openImageFullscreen(getImageUrl(image.url || image))"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
              <div>
                <span class="font-bold text-gray-600">Тип:</span>
                <span class="ml-2 text-gray-900">{{ getProblemIcon(helpRequest.problem_type) }} {{ getProblemTypeName(helpRequest.problem_type) }}</span>
              </div>
              <div>
                <span class="font-bold text-gray-600">Сумма:</span>
                <span class="ml-2 text-green-600 font-black">{{ helpRequest.amount || 0 }} ₽</span>
              </div>
              <div
                v-if="helpRequest.address"
                class="sm:col-span-2"
              >
                <span class="font-bold text-gray-600">Адрес:</span>
                <span class="ml-2 text-gray-900">{{ helpRequest.address }}</span>
              </div>
              <div>
                <span class="font-bold text-gray-600">Статус:</span>
                <span class="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  {{ helpRequest.status === 'active' ? 'Активна' : helpRequest.status }}
                </span>
              </div>
            </div>
            
            <!-- Навигация к месту заявки -->
            <div
              v-if="helpRequest.latitude && helpRequest.longitude && helpRequest.address"
              class="flex flex-col sm:flex-row gap-2"
            >
              <a
                :href="`https://yandex.ru/maps/?rtext=~${helpRequest.latitude},${helpRequest.longitude}`"
                target="_blank"
                class="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-xl font-bold text-center hover:bg-yellow-600 transition flex items-center justify-center gap-2"
              >
                <span>🗺️</span>
                <span>Яндекс.Навигатор</span>
              </a>
              <a
                :href="`https://www.google.com/maps/dir/?api=1&destination=${helpRequest.latitude},${helpRequest.longitude}`"
                target="_blank"
                class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          <!-- Форма отклика -->
          <form @submit.prevent="submitResponse">
            <div class="mb-4 sm:mb-6">
              <label class="block text-base sm:text-lg font-black text-gray-900 mb-2 sm:mb-3">
                💬 Ваше сообщение автору заявки
              </label>
              <textarea
                v-model="responseMessage"
                required
                rows="4"
                placeholder="Например: Я рядом, могу помочь через 10 минут..."
                class="w-full px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base md:text-lg rounded-xl border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
            </div>

            <div
              v-if="!currentUser"
              class="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
            >
              <p class="text-yellow-800 font-bold mb-1 sm:mb-2 text-sm sm:text-base">
                🔒 Требуется авторизация
              </p>
              <p class="text-xs sm:text-sm text-yellow-700 mb-2 sm:mb-3">
                Для отправки отклика необходимо войти в систему
              </p>
              <router-link
                to="/login"
                class="inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition text-sm sm:text-base"
              >
                Войти
              </router-link>
            </div>

            <button
              v-else
              type="submit"
              :disabled="isSubmittingResponse || !responseMessage.trim()"
              class="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmittingResponse">⏳ Отправка...</span>
              <span v-else>✅ Откликнуться</span>
            </button>
          </form>
        </div>

        <!-- Список откликов (только для автора) -->
        <div v-else-if="isRequestOwner">
          <div
            v-if="responses.length === 0"
            class="text-center py-20"
          >
            <div class="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                class="w-16 h-16 text-gray-400"
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
            </div>
            <p class="text-gray-500 text-xl font-semibold">
              Пока никто не откликнулся
            </p>
            <p class="text-gray-400 mt-2">
              Ожидайте откликов от помощников рядом с вами
            </p>
          </div>

          <div
            v-else
            class="space-y-3 sm:space-y-6"
          >
            <div
              v-for="response in responses"
              :key="response.id"
              :class="[
                'p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl transition-all transform hover:scale-[1.01] sm:hover:scale-102',
                getResponseClass(response.status)
              ]"
            >
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div class="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <!-- Аватар -->
                  <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span class="text-xl sm:text-2xl md:text-4xl text-white font-black">
                      {{ getInitials(response.helper.full_name) }}
                    </span>
                  </div>

                  <!-- Информация о помощнике -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <router-link 
                        :to="`/user/${response.helper.id}`"
                        class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 truncate hover:text-blue-600 transition"
                      >
                        {{ response.helper.full_name }}
                      </router-link>
                      <!-- Статус -->
                      <div :class="['px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-lg flex-shrink-0', getStatusBadgeClass(response.status)]">
                        {{ getStatusText(response.status) }}
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <p class="text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
                        📞 {{ response.helper.phone }}
                      </p>
                      <span
                        v-if="response.distance_km"
                        class="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs sm:text-sm"
                      >
                        📍 {{ response.distance_km }} км
                      </span>
                      <span
                        v-if="response.eta_minutes"
                        class="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs sm:text-sm"
                      >
                        ⏱️ ~{{ response.eta_minutes }} мин
                      </span>
                    </div>
                    <p
                      v-if="response.message"
                      class="text-sm sm:text-base text-gray-700 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl break-words"
                    >
                      💬 {{ response.message }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Кнопки действий (только для владельца запроса) -->
              <div
                v-if="response.status === 'pending' && isRequestOwner"
                class="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 border-t-2 border-gray-200 pt-4 sm:pt-6"
              >
                <button
                  :disabled="isProcessing"
                  class="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50"
                  @click="rejectResponse(response.id)"
                >
                  ❌ Отклонить
                </button>
                <button
                  :disabled="isProcessing"
                  class="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg hover:from-green-600 hover:to-green-800 active:from-green-700 active:to-green-900 transition shadow-xl disabled:opacity-50"
                  @click="acceptResponse(response.id)"
                >
                  ✅ Принять помощь
                </button>
              </div>

              <!-- Чат -->
              <div
                v-if="response.status === 'accepted'"
                class="mt-4 sm:mt-6 border-t-2 border-green-200 pt-4 sm:pt-6"
              >
                <button
                  class="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800 transition shadow-xl"
                  @click="openChat(response)"
                >
                  💬 Открыть чат с помощником
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно чата -->
    <div
      v-if="showChatModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showChatModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <!-- Header чата -->
        <div class="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-black">
                {{ selectedResponse?.helper.full_name }}
              </h3>
              <p class="text-blue-100 font-semibold">
                <span v-if="helperDistance">📍 {{ helperDistance }} км • ⏱️ {{ helperEta }} мин</span>
                <span v-else>💬 Чат с помощником</span>
              </p>
            </div>
            <button
              class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              @click="showChatModal = false"
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

        <!-- Сообщения -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          <div
            v-if="messages.length === 0"
            class="text-center py-12"
          >
            <p class="text-gray-400 font-semibold">
              Начните общение
            </p>
          </div>
          
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-xs px-4 py-3 rounded-2xl',
                message.sender_id === currentUser?.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white text-gray-900 shadow-md'
              ]"
            >
              <p class="text-base">
                {{ message.content }}
              </p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.sender_id === currentUser?.id ? 'text-blue-100' : 'text-gray-400'
                ]"
              >
                {{ formatTime(message.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Проверка авторизации для отправки сообщений -->
        <div
          v-if="!currentUser"
          class="p-4 border-t-2 border-gray-200 bg-yellow-50 rounded-b-3xl"
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

        <!-- Ввод сообщения (только для авторизованных) -->
        <div
          v-if="currentUser"
          class="p-4 border-t-2 border-gray-200 bg-white rounded-b-3xl"
        >
          <form
            class="flex gap-3"
            @submit.prevent="sendMessage"
          >
            <input
              v-model="newMessage"
              type="text"
              placeholder="Напишите сообщение..."
              class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
            <button
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { useRequestHelpers } from '@/composables/useRequestHelpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getProblemTypeName, getProblemIcon } = useRequestHelpers()

const isLoading = ref(true)
const isProcessing = ref(false)
const error = ref(null)
const responses = ref([])
const showChatModal = ref(false)
const selectedResponse = ref(null)
const messages = ref([])
const newMessage = ref('')
const chatContainer = ref(null)
const helperDistance = ref(null)
const helperEta = ref(null)
const helpRequest = ref(null)
const responseMessage = ref('')
const isSubmittingResponse = ref(false)

// Используем computed для получения текущего пользователя из authStore
const currentUser = computed(() => authStore.user)

// Вычисляем, является ли пользователь владельцем заявки
const isRequestOwner = computed(() => {
  if (!currentUser.value || !helpRequest.value) return false
  return currentUser.value.id === helpRequest.value.user_id
})

let locationUpdateInterval = null

onMounted(async () => {
  console.log('📄 ResponsesView mounted')
  
  // Ждём, пока authStore загрузит пользователя
  if (!authStore.user) {
    try {
      await authStore.checkAuth()
      console.log('✅ User loaded from checkAuth:', authStore.user?.id)
    } catch (err) {
      console.error('Error checking auth:', err)
    }
  }
  
  // Небольшая задержка для обновления computed свойств
  await new Promise(resolve => setTimeout(resolve, 300))
  
  console.log('👤 Current user before loadRequestInfo:', currentUser.value?.id)
  
  await loadRequestInfo()
  
  // Подключаемся к WebSocket для получения обновлений
  setupWebSocket()
})

// Очистка интервалов при размонтировании
onBeforeUnmount(() => {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval)
    locationUpdateInterval = null
  }
})

onUnmounted(() => {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval)
  }
})

async function loadRequestInfo() {
  try {
    isLoading.value = true
    error.value = null
    const requestId = route.params.id || route.params.requestId
    
    console.log('🔍 Загрузка информации о заявке:', requestId)
    console.log('👤 Текущий пользователь:', currentUser.value?.id, currentUser.value?.full_name)
    
    // КРИТИЧЕСКАЯ ПРОВЕРКА: если пользователь не авторизован, не пытаемся загружать отклики
    if (!currentUser.value) {
      console.log('⚠️ Пользователь не авторизован, загружаем только информацию о заявке')
      try {
        const requestResult = await apiService.getHelpRequest(requestId)
        if (requestResult.success && requestResult.data) {
          helpRequest.value = requestResult.data
          responses.value = []
          isLoading.value = false
          return
        }
      } catch (e) {
        console.error('Error loading request for unauthorized user:', e)
        error.value = 'Не удалось загрузить информацию о заявке'
        isLoading.value = false
        return
      }
    }
    
    // Загружаем информацию о заявке
    const requestResult = await apiService.getHelpRequest(requestId)
    if (requestResult.success && requestResult.data) {
      helpRequest.value = requestResult.data
      
      // Ждём обновления computed свойств (увеличиваем задержку)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('📋 Заявка загружена:', {
        requestId: helpRequest.value.id,
        ownerId: helpRequest.value.user_id,
        currentUserId: currentUser.value?.id,
        isOwner: isRequestOwner.value
      })
      
      // КРИТИЧЕСКАЯ ПРОВЕРКА: загружаем отклики ТОЛЬКО если пользователь является владельцем
      const userId = currentUser.value?.id
      const ownerId = helpRequest.value?.user_id
      const isOwner = userId && ownerId && userId === ownerId
      
      // Дополнительная проверка через computed
      const isOwnerComputed = isRequestOwner.value
      
      console.log('🔐 Проверка владельца:', { 
        userId, 
        ownerId, 
        isOwner,
        isOwnerComputed,
        bothMatch: isOwner && isOwnerComputed
      })
      
      // ЗАГРУЖАЕМ ОТКЛИКИ ТОЛЬКО ЕСЛИ ОБЕ ПРОВЕРКИ ПРОЙДЕНЫ
      if (isOwner && isOwnerComputed) {
        console.log('✅ Пользователь является владельцем, загружаем отклики', { userId, ownerId })
        await loadResponses()
      } else {
        console.log('⚠️ Пользователь НЕ является владельцем, НЕ загружаем отклики', { 
          userId, 
          ownerId, 
          isOwner,
          isOwnerComputed
        })
        // Если не автор, просто показываем форму отклика
        responses.value = [] // Явно очищаем отклики
        isLoading.value = false
      }
    } else {
      error.value = 'Заявка не найдена'
      isLoading.value = false
    }
  } catch (err) {
    console.error('❌ Критическая ошибка при загрузке заявки:', err)
    console.error('❌ Детали ошибки:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      requestId: route.params.id || route.params.requestId
    })
    
    // ВСЕГДА устанавливаем isLoading в false, чтобы не было темного экрана
    isLoading.value = false
    
    // Если 403 или 404 - пытаемся загрузить заявку напрямую (может быть публичный доступ)
    if (err.response?.status === 403 || err.response?.status === 404) {
      try {
        const requestId = route.params.id || route.params.requestId
        console.log('🔄 Попытка загрузить заявку напрямую после 403/404:', requestId)
        const requestResult = await apiService.getHelpRequest(requestId)
        if (requestResult.success && requestResult.data) {
          helpRequest.value = requestResult.data
          console.log('✅ Заявка загружена после ошибки:', {
            requestId: helpRequest.value.id,
            ownerId: helpRequest.value.user_id,
            currentUserId: currentUser.value?.id,
            isOwner: isRequestOwner.value
          })
          
          // Ждём обновления computed свойств (увеличиваем задержку)
          await nextTick()
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // КРИТИЧЕСКАЯ ПРОВЕРКА: НЕ загружаем отклики для не-владельцев
          const userId = currentUser.value?.id
          const ownerId = helpRequest.value?.user_id
          const isOwner = userId && ownerId && userId === ownerId
          const isOwnerComputed = isRequestOwner.value
          
          console.log('🔐 Проверка владельца после ошибки:', { 
            userId, 
            ownerId, 
            isOwner,
            isOwnerComputed
          })
          
          if (isOwner && isOwnerComputed) {
            console.log('✅ Пользователь является владельцем, загружаем отклики', { userId, ownerId })
            await loadResponses()
          } else {
            console.log('⚠️ Пользователь НЕ является владельцем, НЕ загружаем отклики')
            responses.value = []
            isLoading.value = false
          }
        } else {
          error.value = 'Не удалось загрузить информацию о заявке'
          isLoading.value = false
        }
      } catch (e) {
        console.error('❌ Ошибка при прямой загрузке заявки:', e)
        error.value = err.response?.data?.error || err.message || 'Не удалось загрузить информацию о заявке'
        isLoading.value = false
      }
    } else {
      error.value = err.response?.data?.error || err.message || 'Ошибка загрузки информации о заявке'
      isLoading.value = false
    }
  }
}

async function loadResponses() {
  // КРИТИЧЕСКАЯ ПРОВЕРКА ПЕРЕД ВСЕМ: если функция вызвана, но проверки не прошли - НЕ ДЕЛАЕМ ЗАПРОС
  const requestId = route.params.id || route.params.requestId
  
  console.log('🔍 loadResponses вызван для requestId:', requestId)
  console.log('🔍 Текущее состояние:', {
    currentUser: currentUser.value?.id,
    helpRequest: helpRequest.value?.id,
    helpRequestOwner: helpRequest.value?.user_id,
    isRequestOwner: isRequestOwner.value
  })
  
  // ВСЕГДА устанавливаем isLoading в false перед началом, чтобы не было темного экрана
  isLoading.value = false
  
  // Ждём обновления computed свойств
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 150))
  
  // ПЯТИКРАТНАЯ ПРОВЕРКА: проверяем, что пользователь является владельцем перед загрузкой откликов
  // 1. Проверка computed свойства
  if (!isRequestOwner.value) {
    console.log('⚠️ ПРЕДОТВРАЩЕНО (computed): Пользователь не является владельцем')
    responses.value = []
    isLoading.value = false
    return
  }
  
  // 2. Проверка наличия пользователя и заявки
  if (!currentUser.value || !helpRequest.value) {
    console.log('⚠️ ПРЕДОТВРАЩЕНО (нет данных): Нет пользователя или заявки')
    responses.value = []
    isLoading.value = false
    return
  }
  
  // 3. Прямая проверка ID
  if (currentUser.value.id !== helpRequest.value.user_id) {
    console.log('⚠️ ПРЕДОТВРАЩЕНО (ID mismatch):', {
      currentUserId: currentUser.value.id,
      ownerId: helpRequest.value.user_id
    })
    responses.value = []
    isLoading.value = false
    return
  }
  
  // 4. Дополнительная проверка через computed
  if (!isRequestOwner.value) {
    console.log('⚠️ ПРЕДОТВРАЩЕНО (computed check failed): isRequestOwner = false')
    responses.value = []
    isLoading.value = false
    return
  }
  
  // 5. ФИНАЛЬНАЯ ПРОВЕРКА перед API запросом
  const finalUserId = currentUser.value?.id
  const finalOwnerId = helpRequest.value?.user_id
  if (finalUserId !== finalOwnerId) {
    console.log('⚠️ ПРЕДОТВРАЩЕНО (финальная проверка перед API):', { finalUserId, finalOwnerId })
    responses.value = []
    isLoading.value = false
    return
  }
  
  // ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ - можно делать запрос
  try {
    console.log('✅ Загрузка откликов для владельца заявки:', {
      requestId,
      userId: currentUser.value.id,
      ownerId: helpRequest.value.user_id
    })
    
    const result = await apiService.getResponsesForRequest(requestId, true) // skipAuthCheck = true, так как мы уже проверили
    responses.value = result.responses || []
    isLoading.value = false
    console.log('✅ Отклики загружены:', responses.value.length)
  } catch (err) {
    console.error('❌ Error loading responses:', err)
    responses.value = []
    isLoading.value = false
    
    // Если 403 - значит пользователь не автор, это нормально - просто не показываем ошибку
    if (err.response?.status === 403) {
      console.log('⚠️ 403 при загрузке откликов - пользователь не владелец (это нормально, игнорируем)')
      // НЕ показываем ошибку пользователю, так как это ожидаемое поведение
      // НЕ делаем редирект - просто показываем форму отклика
    } else {
      // Для других ошибок показываем сообщение только если пользователь владелец
      const userId = currentUser.value?.id
      const ownerId = helpRequest.value?.user_id
      if (userId === ownerId) {
        error.value = err.message || 'Ошибка загрузки откликов'
      }
    }
  }
}

async function submitResponse() {
  if (!currentUser.value) {
    router.push('/login')
    return
  }
  
  if (!responseMessage.value.trim()) {
    alert('Пожалуйста, введите сообщение')
    return
  }
  
  try {
    isSubmittingResponse.value = true
    const requestId = route.params.id || route.params.requestId
    
    // Получаем текущее местоположение
    let userLat = null
    let userLon = null
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        userLat = position.coords.latitude
        userLon = position.coords.longitude
      } catch (e) {
        console.warn('Could not get location:', e)
      }
    }
    
    await apiService.createResponse(requestId, {
      message: responseMessage.value,
      latitude: userLat,
      longitude: userLon
    })
    
    alert('✅ Ваш отклик отправлен! Ожидайте ответа от автора запроса.')
    responseMessage.value = ''
    
    // Перенаправляем на карту
    router.push('/map')
  } catch (err) {
    console.error('Error submitting response:', err)
    alert('Ошибка: ' + (err.response?.data?.error || err.message || 'Не удалось отправить отклик'))
  } finally {
    isSubmittingResponse.value = false
  }
}

async function acceptResponse(responseId) {
  // КРИТИЧЕСКАЯ ПРОВЕРКА: только владелец может принимать отклики
  if (!isRequestOwner.value) {
    console.error('❌ ПРЕДОТВРАЩЕНО: Пользователь не является владельцем запроса')
    alert('❌ Вы не можете принимать отклики на чужой запрос')
    return
  }
  
  // Дополнительная проверка
  if (!currentUser.value || !helpRequest.value || currentUser.value.id !== helpRequest.value.user_id) {
    console.error('❌ ПРЕДОТВРАЩЕНО: Несоответствие владельца', {
      currentUserId: currentUser.value?.id,
      requestOwnerId: helpRequest.value?.user_id
    })
    alert('❌ Вы не можете принимать отклики на чужой запрос')
    return
  }
  
  if (!confirm('Принять помощь от этого пользователя?')) return
  
  try {
    isProcessing.value = true
    error.value = null
    
    console.log('✅ Принятие отклика (проверка пройдена):', {
      responseId,
      userId: currentUser.value.id,
      requestOwnerId: helpRequest.value.user_id,
      isOwner: isRequestOwner.value
    })
    
    const result = await apiService.acceptResponse(responseId)
    
    console.log('Результат принятия:', result)
    
    // Проверяем успешность ответа
    if (!result || (!result.success && !result.response)) {
      throw new Error(result?.error || 'Не удалось принять отклик')
    }
    
    // Обновляем статус локально
    const response = responses.value.find(r => r.id === responseId)
    if (response) {
      response.status = 'accepted'
      
      // Отклоняем остальные локально
      responses.value.forEach(r => {
        if (r.id !== responseId && r.status === 'pending') {
          r.status = 'rejected'
        }
      })
      
      // Обновляем данные заявки из ответа
      if (result.helpRequest) {
        helpRequest.value = { ...helpRequest.value, ...result.helpRequest }
      }
      
      // Показываем успешное уведомление
      alert('✅ Помощник принят! Теперь вы можете открыть чат с помощником и начать общение.')
      
      // Строим маршрут от помощника к заявителю
      if (response.helper_latitude && response.helper_longitude && result.helpRequest) {
        console.log('🗺️ Строим маршрут для помощника...')
        try {
          const routeData = await buildRouteForHelper(
            response.helper_latitude,
            response.helper_longitude,
            result.helpRequest.latitude,
            result.helpRequest.longitude
          )
          
          // Показываем навигационную ссылку
          if (routeData) {
            showNavigationOptions(
              response.helper_latitude,
              response.helper_longitude,
              result.helpRequest.latitude,
              result.helpRequest.longitude,
              routeData
            )
          }
        } catch (routeErr) {
          console.warn('Ошибка построения маршрута:', routeErr)
        }
      }
      
      // Открываем чат
      if (result.chat) {
        selectedResponse.value = { ...response, chat: result.chat }
        showChatModal.value = true
        startLocationTracking()
        loadChatMessages()
      }
      
      // Показываем успешное сообщение
      showSuccessNotification('✅ Помощник принят!')
      
      // Перезагружаем отклики для обновления статусов (только если мы владелец)
      // КРИТИЧЕСКАЯ ПРОВЕРКА перед вызовом loadResponses
      const userId = currentUser.value?.id
      const ownerId = helpRequest.value?.user_id
      if (userId && ownerId && userId === ownerId && isRequestOwner.value) {
        await loadResponses()
      } else {
        console.log('⚠️ ПРЕДОТВРАЩЕНО: Перезагрузка откликов после принятия - пользователь не владелец', { userId, ownerId })
      }
    }
  } catch (err) {
    console.error('Ошибка принятия отклика:', err)
    const errorMessage = err.response?.data?.error || err.message || 'Не удалось принять помощь'
    error.value = errorMessage
    alert(`Ошибка: ${errorMessage}`)
  } finally {
    isProcessing.value = false
  }
}

// Построение маршрута для помощника
async function buildRouteForHelper(helperLat, helperLon, requestLat, requestLon) {
  try {
    console.log(`🗺️ Маршрут от [${helperLat}, ${helperLon}] к [${requestLat}, ${requestLon}]`)
    
    // Используем OSRM API для построения маршрута
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${helperLon},${helperLat};${requestLon},${requestLat}?overview=full&geometries=geojson&steps=true`
    )
    
    if (!response.ok) {
      throw new Error('Ошибка OSRM API')
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const distanceKm = (route.distance / 1000).toFixed(1)
      const durationMin = Math.ceil(route.duration / 60)
      
      console.log(`✅ Маршрут: ${distanceKm} км, ~${durationMin} минут`)
      
      // Сохраняем информацию о маршруте
      routeInfo.value = {
        distance: distanceKm,
        duration: durationMin,
        coordinates: route.geometry.coordinates
      }
      
      // Показываем уведомление с информацией о маршруте
      showSuccessNotification(`🗺️ Маршрут построен: ${distanceKm} км, ~${durationMin} минут`)
      
      return { distance: distanceKm, duration: durationMin }
    }
  } catch (error) {
    console.error('❌ Ошибка построения маршрута:', error)
  }
}

function showSuccessNotification(message) {
  // Простое уведомление (можно заменить на Toast)
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 5000)
}

const routeInfo = ref(null)

// Показать опции навигации
function showNavigationOptions(fromLat, fromLon, toLat, toLon, routeData) {
  // Создаём модальное окно с навигационными ссылками
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    min-width: 400px;
    max-width: 90vw;
  `
  
  modal.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
      <h3 style="font-size: 24px; font-weight: 900; color: #1f2937; margin-bottom: 8px;">
        Маршрут построен!
      </h3>
      <p style="color: #6b7280; margin-bottom: 24px; font-size: 16px;">
        📏 ${routeData.distance} км • ⏱️ ~${routeData.duration} минут
      </p>
      
      <div style="display: grid; gap: 12px;">
        <a 
          href="https://yandex.ru/maps/?rtext=${fromLat},${fromLon}~${toLat},${toLon}&rtt=auto"
          target="_blank"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #ffdb4d, #ffc700);
            color: #000;
            border-radius: 16px;
            font-weight: bold;
            font-size: 18px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(255, 199, 0, 0.3);
          "
        >
          <span style="font-size: 24px;">🟡</span>
          Яндекс.Навигатор
        </a>
        
        <a 
          href="https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${toLat},${toLon}&travelmode=driving"
          target="_blank"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #4285f4, #1a73e8);
            color: white;
            border-radius: 16px;
            font-weight: bold;
            font-size: 18px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          "
        >
          <span style="font-size: 24px;">🗺️</span>
          Google Maps
        </a>
        
        <a 
          href="https://2gis.ru/routeSearch/rsType/car/from/${fromLon},${fromLat}/to/${toLon},${toLat}"
          target="_blank"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #31c754, #27a844);
            color: white;
            border-radius: 16px;
            font-weight: bold;
            font-size: 18px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(49, 199, 84, 0.3);
          "
        >
          <span style="font-size: 24px;">🗺️</span>
          2ГИС Навигатор
        </a>
        
        <button 
          onclick="this.closest('div').parentElement.remove()"
          style="
            padding: 12px;
            background: #f3f4f6;
            color: #6b7280;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 8px;
          "
        >
          Закрыть
        </button>
      </div>
    </div>
  `
  
  // Backdrop
  const backdrop = document.createElement('div')
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
  `
  backdrop.onclick = () => {
    backdrop.remove()
    modal.remove()
  }
  
  document.body.appendChild(backdrop)
  document.body.appendChild(modal)
}

async function rejectResponse(responseId) {
  if (!confirm('Отклонить этого помощника?')) return
  
  try {
    isProcessing.value = true
    
    await apiService.rejectResponse(responseId, 'Выбран другой помощник')
    
    // Обновляем статус локально
    const response = responses.value.find(r => r.id === responseId)
    if (response) {
      response.status = 'rejected'
    }
  } catch (err) {
    alert('Ошибка: ' + (err.message || 'Не удалось отклонить помощь'))
  } finally {
    isProcessing.value = false
  }
}

function openChat(response) {
  selectedResponse.value = response
  showChatModal.value = true
  startLocationTracking()
  loadChatMessages()
}

async function loadChatMessages() {
  try {
    if (!selectedResponse.value?.chat?.id) {
      console.warn('Нет ID чата для загрузки сообщений')
      messages.value = []
      return
    }
    
    const result = await apiService.getChatMessages(selectedResponse.value.chat.id)
    
    if (result.success && result.messages) {
      messages.value = result.messages
    } else if (result.messages) {
      messages.value = result.messages
    } else {
      messages.value = []
    }
    
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err)
    messages.value = []
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  if (!selectedResponse.value?.chat?.id) {
    alert('Чат не найден')
    return
  }
  
  try {
    const result = await apiService.sendChatMessage(selectedResponse.value.chat.id, newMessage.value)
    
    if (result.success && result.message) {
      messages.value.push(result.message)
    } else if (result.message) {
      messages.value.push(result.message)
    } else {
      // Добавляем локально если API не вернул сообщение
      const message = {
        id: Date.now().toString(),
        sender_id: currentUser.value?.id,
        content: newMessage.value,
        created_at: new Date().toISOString()
      }
      messages.value.push(message)
    }
    
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка отправки сообщения:', err)
    alert('Не удалось отправить сообщение: ' + (err.message || 'Ошибка'))
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function startLocationTracking() {
  // Очищаем предыдущий интервал если есть
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval)
  }
  
  // Инициализируем значения
  helperDistance.value = selectedResponse.value.distance_km || 0
  helperEta.value = selectedResponse.value.eta_minutes || 0
  
  // Проверяем, является ли текущий пользователь помощником
  const isHelper = currentUser.value?.id === selectedResponse.value.helper_id
  
  if (!isHelper) {
    // Если мы не помощник, просто отслеживаем обновления через WebSocket
    console.log('Отслеживание местоположения помощника (не помощник)')
    return
  }
  
  // Если мы помощник, отправляем своё местоположение
  if (!navigator.geolocation) {
    console.warn('Геолокация не поддерживается')
    return
  }
  
  console.log('Начато отслеживание местоположения помощника')
  
  // Отправляем местоположение каждые 10 секунд
  locationUpdateInterval = setInterval(async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })
      
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      
      // Отправляем на сервер
      try {
        const result = await apiService.updateHelperLocation(
          selectedResponse.value.id,
          latitude,
          longitude
        )
        
        if (result.success) {
          helperDistance.value = parseFloat(result.distanceKm || helperDistance.value)
          helperEta.value = parseInt(result.etaMinutes || helperEta.value)
          console.log(`📍 Местоположение обновлено: ${helperDistance.value} км, ~${helperEta.value} мин`)
        }
      } catch (apiErr) {
        console.warn('Ошибка обновления местоположения на сервере:', apiErr)
      }
    } catch (geoErr) {
      console.warn('Ошибка получения геолокации:', geoErr)
    }
  }, 10000) // Обновление каждые 10 секунд
}

function setupWebSocket() {
  // В реальной версии подключение к WebSocket
  console.log('WebSocket setup for responses')
}

function getResponseClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-white border-2 border-blue-200'
    case 'accepted':
      return 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
    case 'rejected':
      return 'bg-gray-50 border-2 border-gray-200 opacity-75'
    default:
      return 'bg-white'
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'accepted':
      return 'bg-green-100 text-green-700'
    case 'rejected':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return '⏳ Ожидает'
    case 'accepted':
      return '✅ Принят'
    case 'rejected':
      return '❌ Отклонён'
    default:
      return status
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
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Функция для открытия изображения на весь экран
function openImageFullscreen(imageUrl) {
  window.open(imageUrl, '_blank')
}

// Функция для получения полного URL изображения
function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const staticBaseUrl = baseUrl.replace('/api/v1', '')
  return `${staticBaseUrl}${url}`
}
</script>

