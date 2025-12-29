<template>
  <div class="h-screen flex flex-col relative overflow-hidden">
    <!-- Фоновый градиент -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />
    
    <NavigationHeader />

    <!-- Map Container -->
    <div class="flex-1 relative bg-gray-100 dark:bg-slate-900">
      <!-- OPENSTREETMAP (работает всегда!) -->
      <OpenStreetMapWidget
        ref="mapWidgetRef"
        :requests="requests"
        :is-authenticated="!!currentUser"
        @request-clicked="handleRequestClick"
      />
      
      <!-- Сообщение для неавторизованных пользователей -->
      <div 
        v-if="!currentUser"
        class="absolute top-4 left-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-[1100] border-2 border-white/50 dark:border-slate-600/50"
      >
        <div class="text-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            🗺 Карта Help Car
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Просматривайте активные запросы о помощи на карте.<br>
            <strong>Для создания заявки необходимо войти в систему</strong>
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
      
      <!-- Floating Create Request Button (только для авторизованных)
           На мобильных — внизу справа, на больших экранах — под кнопками управления картой -->
      <router-link
        v-if="currentUser"
        to="/create-request"
        class="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 group z-[1200] pointer-events-auto"
      >
        <div class="relative">
          <div class="absolute inset-0 bg-red-500 rounded-2xl sm:rounded-3xl blur-2xl opacity-75 animate-pulse" />
          <div class="relative px-4 py-3 sm:px-10 sm:py-6 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-2xl sm:rounded-3xl shadow-2xl hover:from-red-600 hover:to-red-800 transition-all transform group-hover:scale-110 flex items-center space-x-2 sm:space-x-4">
            <svg
              class="w-6 h-6 sm:w-10 sm:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <div class="hidden sm:block">
              <div class="text-xl sm:text-3xl font-black tracking-wide">
                НУЖНА ПОМОЩЬ!
              </div>
              <div class="text-xs sm:text-sm font-semibold opacity-90">
                Создать запрос
              </div>
            </div>
            <div class="sm:hidden text-sm font-bold">
              SOS
            </div>
          </div>
        </div>
      </router-link>


      <!-- Панель запросов (только для авторизованных) -->
      <div
        v-if="currentUser && isPanelVisible"
        class="absolute top-2 left-2 sm:top-6 sm:left-6 w-[calc(100%-1rem)] sm:w-80 h-[30vh] sm:h-[60vh] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[1100] border-2 border-white/50 dark:border-slate-600/50 mobile-requests-panel pointer-events-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div class="flex-1">
            <h2 class="text-xl font-black mb-1">🎯 Активные запросы</h2>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <p class="text-blue-100 font-bold text-sm">{{ filteredRequests.length }} рядом с вами</p>
            </div>
          </div>
          <button
            @click="isPanelVisible = false"
            class="px-3 py-3 text-white hover:bg-white/20 rounded-xl transition"
            title="Скрыть панель"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Список запросов -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Skeleton при загрузке -->
          <div v-if="isLoadingRequests" class="space-y-3">
            <div v-for="i in 3" :key="i" class="p-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 animate-pulse">
              <div class="flex items-start space-x-3">
                <div class="w-12 h-12 bg-gray-200 dark:bg-slate-600 rounded-xl" />
                <div class="flex-1">
                  <div class="h-5 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2" />
                  <div class="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div class="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>

          <!-- Список запросов -->
          <div
            v-for="request in filteredRequests"
            v-else
            :key="request.id"
            class="group p-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-700 dark:to-slate-800"
            @click="focusOnRequest(request)"
          >
            <div class="flex items-start space-x-3">
              <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', getIconGradient(request.problem_type)]">
                <span class="text-2xl">{{ getIcon(request.problem_type) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="text-base font-black text-gray-900 dark:text-white truncate">
                    {{ getProblemTypeName(request.problem_type) }}
                  </h3>
                  <div class="px-2 py-1 bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-sm ml-2 flex-shrink-0">
                    <span class="text-white font-bold text-sm">{{ request.amount }} ₽</span>
                  </div>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mb-2">{{ request.description }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {{ request.distance || 'Рядом' }}</span>
                  <span>🕒 {{ formatDate(request.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoadingRequests && filteredRequests.length === 0" class="text-center py-12">
            <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-gray-500 text-base font-semibold">Нет запросов поблизости</p>
          </div>
        </div>
      </div>

      <!-- Кнопки управления картой / панелью (выше слоя карты) -->
      <div class="absolute bottom-24 left-4 space-y-3 z-[1200] pointer-events-auto">
        <!-- Кнопка показа панели (когда панель скрыта) -->
        <button
          v-if="currentUser && !isPanelVisible"
          class="bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 transition-all hover:scale-105"
          title="Показать панель"
          @click="isPanelVisible = true"
        >
          <svg
            class="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span class="text-white font-bold hidden sm:block">📋 Запросы</span>
        </button>
      </div>
    </div>

    <!-- Всплывающие уведомления о новых запросах рядом -->
    <RequestNotification 
      v-if="activeNotification"
      :request="activeNotification"
      @accept="handleAcceptNotification"
      @reject="handleRejectNotification"
      @timeout="handleTimeoutNotification"
    />
    <!-- Share Modal -->
    <div v-if="showShareModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">👥 Поделиться с другом</h3>
        
        <div v-if="shareLoading" class="text-center py-4">
          <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-gray-500">Загрузка...</p>
        </div>
        
        <div v-else-if="shareFriends.length === 0" class="text-center py-4 text-gray-500">
          У вас пока нет друзей 😢
        </div>
        
        <div v-else class="space-y-2 max-h-60 overflow-y-auto">
          <button
            v-for="friend in shareFriends"
            :key="friend.id"
            @click="doShare(friend)"
            class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {{ friend.full_name?.[0] || '?' }}
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{ friend.full_name }}</span>
          </button>
        </div>
        
        <button @click="showShareModal = false" class="mt-4 w-full py-2 bg-gray-200 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
          Отмена
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavigationHeader from '@/components/NavigationHeader.vue'
import RequestNotification from '@/components/RequestNotification.vue'
import OpenStreetMapWidget from '@/components/OpenStreetMapWidget.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useGeolocation } from '@/composables/useGeolocation'
import { useRequestHelpers } from '@/composables/useRequestHelpers'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'

const { getProblemTypeName, formatDate } = useRequestHelpers()

const _router = useRouter()
const _authStore = useAuthStore()
const currentUser = ref(null)
const isPanelVisible = ref(true)

// Уведомления и геолокация
const { activeNotification, addNotification, removeNotification } = useNotifications()
const { latitude, longitude, calculateDistance } = useGeolocation()

// Реальные запросы из API
const requests = ref([])
const isLoadingRequests = ref(false)

// Ref для карты
const mapWidgetRef = ref(null)

// Фильтруем запросы для отображения в списке:
// - Только активные заявки (исключаем completed, cancelled)
// - Исключаем запросы текущего пользователя (чтобы не показывать свои запросы в общем списке)
// На карте отображаются ВСЕ запросы (включая свои), чтобы пользователь видел где находится его запрос
const filteredRequests = computed(() => {
  if (!currentUser.value) {
    // Если пользователь не авторизован, показываем все активные запросы
    return requests.value.filter(request => {
      const status = request.status?.toLowerCase()
      return status === 'active' || status === 'accepted' || status === 'in_progress' || status === 'pending_acceptance'
    })
  }
  
  return requests.value.filter(request => {
    const status = request.status?.toLowerCase()
    const isActive = status === 'active' || status === 'accepted' || status === 'in_progress' || status === 'pending_acceptance'
    
    // Исключаем запросы текущего пользователя из общего списка
    const isMyRequest = currentUser.value.id === request.user_id
    
    return isActive && !isMyRequest
  })
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  
  if (token) {
    // Пользователь авторизован
    apiService.setToken(token)
    
    // Используем authStore вместо прямого чтения из localStorage
    if (_authStore.user) {
      currentUser.value = _authStore.user
    } else {
      // Если в store нет, проверяем localStorage и обновляем store
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          currentUser.value = user
          _authStore.user = user
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }
    
    // Загружаем запросы
    await loadRequests()
    
    // Подключаем WebSocket уведомления
    setupWebSocketNotifications()
  } else {
    // Пользователь не авторизован - показываем карту с заявками для просмотра
    console.log('Пользователь не авторизован - показываем карту в режиме просмотра')
    // Загружаем заявки даже для неавторизованных пользователей
    await loadRequests()
  }
})

// Следим за изменениями пользователя в authStore
watch(() => _authStore.user, (newUser) => {
  if (newUser) {
    currentUser.value = newUser
  }
}, { immediate: true })

// Загрузка запросов с API
async function loadRequests() {
  try {
    isLoadingRequests.value = true
    console.log('📥 Загрузка заявок с API...')
    const response = await apiService.getHelpRequests({ status: 'active' })
    console.log('📦 Полный ответ API:', response)
    
    // API может возвращать данные в разных форматах
    const allRequests = response.data?.data || response.data || []
    console.log(`📋 Получено заявок с API: ${allRequests.length}`)
    console.log('📋 Первая заявка (пример):', allRequests[0])
    
    // Фильтруем только активные заявки (исключаем completed, cancelled)
    // НЕ исключаем запросы текущего пользователя здесь, так как они могут понадобиться для отображения на карте
    // Исключение происходит в computed filteredRequests
    requests.value = allRequests.filter(request => {
      const status = request.status?.toLowerCase()
      const isActive = status === 'active' || status === 'accepted' || status === 'in_progress' || status === 'pending_acceptance'
      
      // Проверяем наличие координат
      if (!request.latitude && !request.lat) {
        console.warn('⚠️ Заявка без координат пропущена:', request.id, request)
        return false
      }
      
      return isActive
    })
    
    console.log(`✅ Активных заявок с координатами: ${requests.value.length}`)
    
    // Нормализуем координаты для всех заявок
    // DECIMAL из базы данных может приходить как строка, преобразуем в число
    requests.value.forEach(request => {
      // Преобразуем координаты в числа если они строки
      if (request.latitude && typeof request.latitude === 'string') {
        request.latitude = parseFloat(request.latitude)
      }
      if (request.longitude && typeof request.longitude === 'string') {
        request.longitude = parseFloat(request.longitude)
      }
      
      // Нормализуем поля lat/lon для совместимости
      if (!request.lat && request.latitude !== undefined) request.lat = request.latitude
      if (!request.lon && request.longitude !== undefined) request.lon = request.longitude
      if (!request.type && request.problem_type) request.type = request.problem_type
      
      // Нормализуем изображения (может быть images или Images)
      if (!request.images && request.Images) {
        request.images = request.Images
      }
      if (!Array.isArray(request.images)) {
        request.images = []
      }
      
      // Логируем изображения для отладки
      if (request.images && request.images.length > 0) {
        console.log(`🖼️ Заявка ${request.id} имеет ${request.images.length} изображений:`, request.images)
      }
      
      console.log(`📍 Заявка ${request.id}:`, {
        latitude: request.latitude,
        longitude: request.longitude,
        lat: request.lat,
        lon: request.lon,
        status: request.status,
        problem_type: request.problem_type
      })
    })
    
    console.log(`🗺️ Всего заявок передано в компонент карты: ${requests.value.length}`)
    
    // Добавляем вычисленное расстояние если есть геолокация
    if (latitude.value && longitude.value) {
      requests.value.forEach(request => {
        const distance = calculateDistance(
          latitude.value,
          longitude.value,
          request.latitude || request.lat,
          request.longitude || request.lon
        )
        request.distance = `${distance.toFixed(1)} км от вас`
        request.distanceKm = distance
      })
      
      // Сортируем по расстоянию
      requests.value.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999))
    }
    
    console.log(`🗺️ Заявки готовы для отображения на карте: ${requests.value.length}`)
  } catch (error) {
    console.error('❌ Ошибка загрузки заявок:', error)
    // Показываем пользователю сообщение об ошибке только если он авторизован
    if (currentUser.value) {
      console.error('Не удалось загрузить заявки. Попробуйте обновить страницу.')
    }
  } finally {
    isLoadingRequests.value = false
  }
}

function focusOnRequest(request) {
  console.log('🎯 Фокусируемся на заявке:', {
    id: request.id,
    request: request,
    latitude: request.latitude,
    lat: request.lat,
    longitude: request.longitude,
    lon: request.lon
  })
  
  // Нормализуем координаты - проверяем все возможные варианты
  let lat = request.latitude ?? request.lat
  let lon = request.longitude ?? request.lon
  
  // Если координаты - строки (DECIMAL из базы), преобразуем в числа
  if (typeof lat === 'string') lat = parseFloat(lat)
  if (typeof lon === 'string') lon = parseFloat(lon)
  
  console.log(`📍 Нормализованные координаты: lat=${lat}, lon=${lon}`)
  
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    console.error('❌ Нет валидных координат для заявки:', {
      id: request.id,
      latitude: request.latitude,
      lat: request.lat,
      longitude: request.longitude,
      lon: request.lon,
      parsed: { lat, lon }
    })
    // Переходим на страницу отклика напрямую
    handleRequestClick(request.id)
    return
  }

  // Используем OpenStreetMap карту для приближения
  if (mapWidgetRef.value && mapWidgetRef.value.focusOnRequest) {
    try {
      // Передаем заявку с нормализованными координатами
      const requestWithCoords = {
        ...request,
        latitude: lat,
        longitude: lon,
        lat: lat,
        lon: lon
      }
      console.log('📤 Передаю заявку в focusOnRequest:', requestWithCoords)
      mapWidgetRef.value.focusOnRequest(requestWithCoords)
      console.log('✅ Карта приближена к заявке через OpenStreetMap')
    } catch (e) {
      console.error('❌ Ошибка приближения карты OpenStreetMap:', e)
    }
  } else {
    console.warn('⚠️ Карта OpenStreetMap не готова или метод focusOnRequest недоступен')
  }

    
  // На мобильных - сразу переходим на страницу отклика
  if (window.innerWidth < 640) {
    setTimeout(() => {
      handleRequestClick(request.id)
    }, 1000) // Даем время карте приблизиться
  }
}

// Функции getIcon и getIconGradient используются в шаблоне для отображения списка заявок
function getIcon(type) {
  const icons = {
    battery: '🔋',
    fuel: '⛽',
    tire: '🛞',
    towing: '🚗',
    sober_driver: '🚕',
    road_conflict: '🚨'
  }
  return icons[type] || '❓'
}

function getIconGradient(type) {
  const gradients = {
    battery: 'bg-gradient-to-br from-orange-400 to-red-600',
    fuel: 'bg-gradient-to-br from-green-400 to-green-600',
    tire: 'bg-gradient-to-br from-purple-400 to-purple-600',
    towing: 'bg-gradient-to-br from-blue-400 to-blue-600',
    sober_driver: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    road_conflict: 'bg-gradient-to-br from-red-500 to-red-700'
  }
  return gradients[type] || 'bg-gradient-to-br from-gray-400 to-gray-600'
}

function centerOnUser() {
  // Используем метод из OpenStreetMapWidget
  if (mapWidgetRef.value && mapWidgetRef.value.getUserLocation) {
    mapWidgetRef.value.getUserLocation()
  }
}

// async function handleLogout() {
//   localStorage.removeItem('token')
//   localStorage.removeItem('user')
//   localStorage.removeItem('rememberMe')
//   localStorage.removeItem('savedUser')
//   
//   window.location.href = '/'
// }

// ============ ОБРАБОТКА УВЕДОМЛЕНИЙ ============

// Обработка принятия уведомления
async function handleAcceptNotification(request) {
  try {
    // Проверяем геолокацию
    let userLat = latitude.value
    let userLon = longitude.value
    
    if (!userLat || !userLon) {
      alert('Включите геолокацию для отклика')
      return
    }

    // Вычисляем расстояние и ETA
    const distance = calculateDistance(
      userLat,
      userLon,
      request.latitude,
      request.longitude
    )
    const etaMinutes = Math.ceil((distance / 40) * 60)

    // Создаем отклик
    await apiService.createResponse(request.id, {
      message: 'Я рядом, могу помочь!',
      latitude: userLat,
      longitude: userLon,
      eta_minutes: etaMinutes
    })

    removeNotification()
    alert('✅ Ваш отклик отправлен! Ожидайте ответа от автора запроса.')
  } catch (error) {
    console.error('Error accepting notification:', error)
    alert('❌ Ошибка отправки отклика')
  }
}

// Обработка отклонения уведомления
function handleRejectNotification(request) {
  removeNotification()
  console.log('Request rejected:', request.id)
}

// Обработка таймаута уведомления
function handleTimeoutNotification(request) {
  removeNotification()
  console.log('Notification timeout:', request.id)
}

// Обработчик клика на заявку с карты
function handleRequestClick(requestId) {
  console.log('Заявка кликнута:', requestId)
  
      
      
  console.log('Чат открыт для заявки:', requestId)
}

// Подключение WebSocket уведомлений
function setupWebSocketNotifications() {
  // Подключаемся к WebSocket
  const token = localStorage.getItem('token')
  if (token && !wsService.isConnected.value) {
    wsService.connect(token)
  }

  // Слушаем новые запросы
  wsService.on('helpRequest:created', (data) => {
    const newRequest = data.helpRequest
    
    // Проверяем что заявка активная
    const status = newRequest.status?.toLowerCase()
    if (status !== 'active' && status !== 'accepted' && status !== 'in_progress' && status !== 'pending_acceptance') {
      console.log('Пропущена неактивная заявка:', newRequest.id, status)
      return
    }
    
    // Добавляем новый запрос в список
    requests.value.unshift(newRequest)
    
    // Если есть геолокация - вычисляем расстояние
    if (latitude.value && longitude.value) {
      const distance = calculateDistance(
        latitude.value,
        longitude.value,
        newRequest.latitude,
        newRequest.longitude
      )
      newRequest.distance = `${distance.toFixed(1)} км от вас`
      newRequest.distanceKm = distance
      
      // Показываем уведомление если запрос близко (в радиусе 5 км)
      if (distance <= 5) {
        addNotification(newRequest)
      }
      
      // Пересортировываем по расстоянию
      requests.value.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999))
    }
    
    console.log('Новый активный запрос получен через WebSocket:', newRequest)
  })

  // Слушаем принятые запросы
  wsService.on('helpRequest:accepted', (data) => {
    const index = requests.value.findIndex(r => r.id === data.helpRequestId)
    if (index !== -1) {
      requests.value[index].status = 'accepted'
      requests.value[index].helper_id = data.helperId
      console.log('Заявка принята:', data.helpRequestId)
    }
  })

  // Слушаем завершённые запросы
  wsService.on('helpRequest:completed', (data) => {
    const index = requests.value.findIndex(r => r.id === data.helpRequestId)
    if (index !== -1) {
      // Удаляем из списка активных
      requests.value.splice(index, 1)
      console.log('Заявка завершена и удалена из списка:', data.helpRequestId)
    }
  })

  // Слушаем отменённые запросы
  wsService.on('helpRequest:cancelled', (data) => {
    const index = requests.value.findIndex(r => r.id === data.helpRequestId)
    if (index !== -1) {
      // Удаляем из списка активных
      requests.value.splice(index, 1)
      console.log('Заявка отменена и удалена из списка:', data.helpRequestId)
    }
  })
}

// ===== SHARE FUNCTIONALITY =====
const showShareModal = ref(false)
const shareRequestId = ref(null)
const shareLoading = ref(false)
const shareFriends = ref([])

// Открыть модалку "Поделиться с другом"
async function handleShareRequest(requestId) {
  console.log('📤 handleShareRequest called:', requestId)
  shareRequestId.value = requestId
  showShareModal.value = true
  
  try {
    shareLoading.value = true
    const result = await apiService.getFriends()
    const friendsData = result?.data || result || []
    shareFriends.value = friendsData.map(f => f.friend).filter(Boolean)
    console.log('✅ Loaded friends:', shareFriends.value.length)
  } catch (error) {
    console.error('❌ Error loading friends:', error)
    shareFriends.value = []
  } finally {
    shareLoading.value = false
  }
}

// Отправить заявку другу
async function doShare(friend) {
  if (!shareRequestId.value) return
  
  try {
    await apiService.client.post(`/help-requests/${shareRequestId.value}/share`, {
      friendIds: [friend.id],
      message: 'Смотри эту заявку!'
    })
    
    showShareModal.value = false
    alert(`✅ Заявка отправлена ${friend.full_name}!`)
  } catch (error) {
    console.error('❌ Error sharing:', error)
    alert('❌ Ошибка при отправке')
  }
}

// РЕГИСТРАЦИЯ ГЛОБАЛЬНОГО ОБРАБОТЧИКА СРАЗУ ПРИ ЗАГРУЗКЕ МОДУЛЯ
console.log('📦 MapView module loaded - registering share handler')
window.__mapViewShareHandler = (requestId) => {
  console.log('📨 __mapViewShareHandler called:', requestId)
  handleShareRequest(requestId)
}
console.log('✅ window.__mapViewShareHandler registered')

if (window.__shareRequestHandlers) {
  window.__shareRequestHandlers.push(window.__mapViewShareHandler)
  console.log('✅ Handler added to array')
}
// ===== END SHARE FUNCTIONALITY =====
</script>
