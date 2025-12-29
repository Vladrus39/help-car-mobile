<template>
  <div class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
    <!-- Контейнер карты OpenStreetMap -->
    <div
      id="osm-map"
      class="w-full h-full"
    />
    
    <!-- Контролы управления картой (видны всегда, и на мобильных тоже) -->
    <div
      class="absolute top-4 right-4 space-y-3 flex flex-col pointer-events-none"
      style="z-index: 9999 !important;"
    >
      <!-- Кнопка локации -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center pointer-events-auto"
        aria-label="Определить моё местоположение"
        title="Определить моё местоположение"
        @click="getUserLocation"
      >
        <svg
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <!-- Кнопка приближения -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center pointer-events-auto"
        aria-label="Приблизить"
        title="Приблизить"
        @click="zoomIn"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <!-- Кнопка отдаления -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center pointer-events-auto"
        aria-label="Отдалить"
        title="Отдалить"
        @click="zoomOut"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 12H4"
          />
        </svg>
      </button>
    </div>

    <!-- Статус -->
    <div
      class="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center space-x-2 pointer-events-none"
      style="z-index: 500;"
    >
      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span class="text-sm font-bold text-gray-900">OpenStreetMap</span>
    </div>

    <!-- Статус геолокации (скрыт, так как есть кнопка справа) -->

    <!-- Панель активного маршрута -->
    <div
      v-if="activeRoute"
      class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center gap-4 pointer-events-none"
      style="z-index: 500;"
    >
      <div class="text-center">
        <div class="text-xs text-gray-500 font-semibold">
          РАССТОЯНИЕ
        </div>
        <div class="text-xl font-black text-green-600">
          {{ activeRoute.distance }} км
        </div>
      </div>
      <div class="text-center">
        <div class="text-xs text-gray-500 font-semibold">
          В ПУТИ
        </div>
        <div class="text-xl font-black text-blue-600">
          ~{{ activeRoute.duration }} мин
        </div>
      </div>
      <button 
        class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition focus:outline-none focus:ring-4 focus:ring-gray-300 pointer-events-auto"
        aria-label="Сбросить маршрут"
        title="Сбросить маршрут"
        @click="resetRoute"
      >
        Сбросить
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  requests: {
    type: Array,
    default: () => []
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  showHelpers: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ready', 'request-clicked', 'helper-clicked', 'share-request'])

const authStore = useAuthStore()

// Функция для получения полного URL изображений
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const staticBaseUrl = baseUrl.replace('/api/v1', '')
  return `${staticBaseUrl}${url}`
}

let map = null
const markers = []
const helperMarkers = [] // Separate array for helper markers
let userMarker = null
let routeLine = null
let activeRoute = null
let markerCluster = null
let helperUpdateInterval = null // For periodic helper location updates
let userLocationInterval = null // For tracking own location when available

// Статус геолокации
const locationStatus = ref(null)
const locationStatusClass = ref('bg-gray-400')
const locationStatusTextClass = ref('text-gray-700')

onMounted(() => {
  initMap()
  // Ждем полной инициализации карты перед получением геолокации
  // initMap создаст карту и вызовет whenReady, который вызовет getUserLocation
  // Поэтому здесь не нужно вызывать getUserLocation напрямую
  
  // Автоматически запускаем трекинг локации если пользователь в статусе "готов помогать"
  if (authStore.user?.is_available_to_help) {
    console.log('🚗 Автозапуск трекинга локации - пользователь готов помогать')
    startOwnLocationTracking()
  }
  
  // Делегирование событий для кнопки "Поделиться" в popup
  document.addEventListener('click', (e) => {
    const shareBtn = e.target.closest('.share-request-btn')
    if (shareBtn) {
      e.stopPropagation()
      e.preventDefault()
      const requestId = shareBtn.dataset.requestId
      if (requestId) {
        console.log('📤 Share button clicked:', requestId)
        console.log('🔍 Checking window.__handleShareRequest:', typeof window.__handleShareRequest)
        // Эмитим через Vue
        emit('share-request', requestId)
        // Прямой вызов глобальной функции если она есть
        if (typeof window.__handleShareRequest === 'function') {
          console.log('✅ Calling window.__handleShareRequest')
          window.__handleShareRequest(requestId)
        } else {
          console.log('⚠️ Function not found, using event fallback')
          // Fallback через событие
          window.dispatchEvent(new CustomEvent('roadhelp-share-request', { detail: { requestId } }))
        }
      }
    }
  })
})

onUnmounted(() => {
  // Clear helper update interval
  if (helperUpdateInterval) {
    clearInterval(helperUpdateInterval)
    helperUpdateInterval = null
  }
  if (userLocationInterval) {
    clearInterval(userLocationInterval)
    userLocationInterval = null
  }
  if (map) {
    map.remove()
  }
})

// Отслеживание изменений в requests для автоматического обновления маркеров
watch(() => props.requests, (newRequests, oldRequests) => {
  const newLength = newRequests?.length || 0
  const oldLength = oldRequests?.length || 0
  
  console.log(`👀 Watch: изменения в requests - было ${oldLength}, стало ${newLength}`, {
    mapReady: !!map,
    requests: newRequests
  })
  
  // Обновляем маркеры если:
  // 1. Количество изменилось
  // 2. Это первая загрузка (oldRequests === undefined)
  // 3. Заявки появились (было 0, стало больше 0)
  // 4. Всегда обновляем если есть новые заявки
  if (newLength > 0 && (newLength !== oldLength || oldRequests === undefined || oldLength === 0)) {
    console.log(`🔄 Обновление маркеров на карте: было ${oldLength}, стало ${newLength}`)
    console.log('📋 Заявки для отображения:', newRequests)
    
    // Если карта еще не готова, ждем
    if (!map) {
      console.log('⚠️ Карта еще не готова, ждем инициализации...')
      // Попробуем еще раз через небольшую задержку
      const checkMap = setInterval(() => {
        if (map && map._panes && map._panes.markerPane) {
          clearInterval(checkMap)
          console.log('✅ Карта готова, добавляю маркеры')
          addRequestMarkers()
        }
      }, 100)
      // Останавливаем проверку через 5 секунд
      setTimeout(() => clearInterval(checkMap), 5000)
      return
    }
    
    // Добавляем небольшую задержку для гарантии готовности карты
    setTimeout(() => {
      addRequestMarkers()
    }, 50)
  }
}, { deep: true, immediate: true }) // Включаем immediate для первой загрузки

// Отслеживание изменения статуса "готов помогать" - автоматически запускаем/останавливаем трекинг
watch(() => authStore.user?.is_available_to_help, (isAvailable, wasAvailable) => {
  console.log('👀 Watch: is_available_to_help изменился:', wasAvailable, '->', isAvailable)
  
  if (isAvailable && !wasAvailable) {
    // Включили статус - начинаем трекинг
    console.log('🚗 Пользователь включил "готов помогать" - запуск трекинга локации')
    startOwnLocationTracking()
  } else if (!isAvailable && wasAvailable) {
    // Выключили статус - останавливаем трекинг
    console.log('🛑 Пользователь выключил "готов помогать" - остановка трекинга')
    if (userLocationInterval) {
      clearInterval(userLocationInterval)
      userLocationInterval = null
    }
  }
})

function initMap() {
  console.log('✅ Инициализация OpenStreetMap...')
  
  // Восстанавливаем состояние карты (центр/масштаб)
  let initialCenter = [55.755819, 37.617644]
  let initialZoom = 12
  try {
    const saved = localStorage.getItem('osm_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.center) && typeof parsed.zoom === 'number') {
        initialCenter = parsed.center
        initialZoom = parsed.zoom
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  // Проверяем, что контейнер существует
  const mapContainer = document.getElementById('osm-map')
  if (!mapContainer) {
    console.error('❌ Контейнер карты #osm-map не найден в DOM')
    return
  }
  
  // Создание карты
  map = L.map('osm-map', {
    center: initialCenter, // Москва по умолчанию
    zoom: initialZoom,
    zoomControl: false // Убираем стандартные контролы зума (используем свои)
  })

  // Добавляем тайлы OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Стандартная кнопка локации Leaflet уже есть встроенная, не добавляем дублирующую

  // Сохраняем состояние при перемещении/масштабировании
  const saveState = () => {
    const c = map.getCenter()
    const state = { center: [c.lat, c.lng], zoom: map.getZoom() }
    localStorage.setItem('osm_state', JSON.stringify(state))
  }
  map.on('moveend', saveState)
  map.on('zoomend', saveState)

  // Ждем, пока карта полностью загрузится перед добавлением маркеров
  map.whenReady(() => {
    // Дополнительная проверка, что все панели созданы
    if (!map._panes || !map._panes.markerPane) {
      console.warn('⚠️ Панели карты еще не готовы, ждем...')
      setTimeout(() => {
        if (map && map._panes && map._panes.markerPane) {
          addRequestMarkers()
          getUserLocation()
          console.log('✅ OpenStreetMap готова!')
          emit('ready')
        }
      }, 100)
      return
    }
    
    // Добавляем маркеры запросов
    addRequestMarkers()
    
    // Получаем геолокацию пользователя только после полной готовности карты
    getUserLocation()
    
    // Загружаем помощников на карту
    if (props.showHelpers) {
      setTimeout(() => {
        loadAvailableHelpers()
        setupHelperTracking()
      }, 1000) // Delay to allow user location to be determined first
    }
    
    console.log('✅ OpenStreetMap готова!')
    emit('ready')
  })
}

function addRequestMarkers() {
  // Проверяем, что карта инициализирована
  if (!map) {
    console.warn('⚠️ Карта не инициализирована, невозможно добавить маркеры')
    return
  }
  
  // Проверяем, что карта полностью готова и панель маркеров имеет DOM-элемент
  // Упрощаем проверку: если карта создана и есть контейнер, можно добавлять маркеры
  if (!map._container || !map._panes || !map._panes.markerPane) {
    console.warn('⚠️ Карта еще не полностью готова, ждем...')
    // Если карта еще не готова, ждем через whenReady
    if (map.whenReady) {
      map.whenReady(() => {
        setTimeout(() => {
          if (map && map._panes && map._panes.markerPane) {
            addRequestMarkers()
          }
        }, 50)
      })
    } else {
      // Если whenReady недоступен, пробуем через setTimeout
      setTimeout(() => {
        if (map && map._panes && map._panes.markerPane) {
          addRequestMarkers()
        }
      }, 100)
    }
    return
  }
  
  // Очищаем старые маркеры
  markers.forEach(marker => {
    try {
      marker.remove()
    } catch (e) {
      console.warn('Ошибка при удалении маркера:', e)
    }
  })
  markers.length = 0

  // Сбрасываем кластер
  if (markerCluster) {
    try { markerCluster.clearLayers() } catch (e) { console.warn('Clear layers:', e) }
    try { map.removeLayer(markerCluster) } catch (e) { console.warn('Remove cluster:', e) }
    markerCluster = null
  }

  // Используем реальные запросы из props
  const requestsToShow = props.requests && props.requests.length > 0 ? props.requests : []
  
  console.log(`🗺️ OpenStreetMap: получено заявок для отображения: ${requestsToShow.length}`)
  
  // Если нет реальных запросов, не показываем моковые данные
  if (requestsToShow.length === 0) {
    console.log('📋 Нет заявок для отображения на карте')
    return
  }
  
  // Моковые данные только для разработки (закомментировано)
  /*
  const requestsToShow = props.requests && props.requests.length > 0 ? props.requests : [
    { 
      id: '1', 
      lat: 55.751244, 
      lon: 37.618423, 
      type: 'battery', 
      title: '🔋 Севшая батарея',
      description: 'Сел аккумулятор, нужна прикурка или замена. Нахожусь на парковке у метро.',
      amount: 500,
      distance: '1.2 км'
    },
    { 
      id: '2', 
      lat: 55.753220, 
      lon: 37.622560, 
      type: 'fuel', 
      title: '⛽ Закончилось топливо',
      description: 'Закончился бензин, нужно 5 литров АИ-95. Стою на обочине.',
      amount: 300,
      distance: '2.5 км'
    },
    { 
      id: '3', 
      lat: 55.749244, 
      lon: 37.615423, 
      type: 'tire', 
      title: '🛞 Прокол колеса',
      description: 'Пробил колесо, нужна помощь с заменой или эвакуатор.',
      amount: 400,
      distance: '800 м'
    },
    { 
      id: '4', 
      lat: 55.757892, 
      lon: 37.612456, 
      type: 'towing', 
      title: '🚗 Нужен эвакуатор',
      description: 'Машина сломалась, не заводится. Нужна эвакуация до сервиса.',
      amount: 1500,
      distance: '3.8 км'
    }
  ]
  */

  const typeIcons = {
    battery: '🔋',
    fuel: '⛽',
    tire: '🛞',
    towing: '🚗',
    sober_driver: '🚕',
    road_conflict: '🚨',
    other: '🔧'
  }

  requestsToShow.forEach((request, index) => {
    console.log(`🔍 Обработка заявки ${index + 1}/${requestsToShow.length}:`, {
      id: request.id,
      lat: request.lat,
      latitude: request.latitude,
      lon: request.lon,
      longitude: request.longitude,
      status: request.status
    })
    
    // Validate that request has valid lat/lon coordinates
    // Проверяем все возможные варианты: lat/lon, latitude/longitude, координаты могут быть строками
    // Важно: latitude - это широта (lat), longitude - это долгота (lon)
    // DECIMAL из базы данных может приходить как строка, поэтому используем parseFloat
    // ВАЖНО: coordinates[0] = latitude (широта), coordinates[1] = longitude (долгота)
    const latRaw = request.lat ?? request.latitude ?? (request.coordinates && Array.isArray(request.coordinates) ? request.coordinates[0] : null)
    const lonRaw = request.lon ?? request.longitude ?? (request.coordinates && Array.isArray(request.coordinates) ? request.coordinates[1] : null)
    
    const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : (typeof latRaw === 'number' ? latRaw : NaN)
    const lon = typeof lonRaw === 'string' ? parseFloat(lonRaw) : (typeof lonRaw === 'number' ? lonRaw : NaN)
    
    // Нормализуем тип проблемы
    const problemType = request.type || request.problem_type || 'other'
    
    console.log(`📍 Заявка ${request.id}: raw lat=${latRaw}, raw lon=${lonRaw}, parsed lat=${lat}, parsed lon=${lon}`)
    
    // Строгая валидация: координаты должны быть числами в допустимом диапазоне
    if (typeof lat !== 'number' || typeof lon !== 'number' || 
        isNaN(lat) || isNaN(lon) ||
        lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.warn('⚠️ Пропускаю заявку с невалидными координатами:', {
        id: request.id,
        latRaw,
        lonRaw,
        lat,
        lon,
        request: request
      })
      return
    }
    
    // Пульсирующий маркер
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-badge">
          ${typeIcons[problemType] || '🔧'} ${request.amount || 0}₽
        </div>
      `,
      iconSize: [100, 44],
      iconAnchor: [50, 44],
      popupAnchor: [0, -48]  // Popup выше маркера (высота иконки + отступ)
    })

    // Получаем название типа проблемы
    const getProblemTypeName = (type) => {
      const names = {
        battery: 'Аккумулятор',
        fuel: 'Топливо',
        tire: 'Колесо',
        towing: 'Буксировка',
        sober_driver: 'Трезвый водитель',
        road_conflict: 'Дорожный конфликт',
        other: 'Помощь'
      }
      return names[type] || 'Помощь'
    }
    
    const problemTypeName = getProblemTypeName(problemType)
    const requestTitle = request.title || request.problem_type_name || (typeIcons[problemType] + ' ' + problemTypeName)
    const requestDescription = request.description || 'Описание запроса'
    const requestAmount = request.amount || 0
    const requestDistance = request.distance || '—'
    
    // Форматируем дату заявки
    const createdDate = request.created_at || request.createdAt
    let formattedDate = ''
    if (createdDate) {
      try {
        const date = new Date(createdDate)
        if (!isNaN(date.getTime())) {
          const now = new Date()
          const diffMs = now - date
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMs / 3600000)
          
          if (diffMins < 1) {
            formattedDate = 'Только что'
          } else if (diffMins < 60) {
            formattedDate = `${diffMins} мин. назад`
          } else if (diffHours < 24) {
            formattedDate = `${diffHours} ч. назад`
          } else {
            formattedDate = date.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          }
        }
      } catch (e) {
        console.warn('Ошибка форматирования даты:', e)
      }
    }
    
    // Получаем изображения заявки
    const requestImages = request.images || request.Images || []
    const hasImages = Array.isArray(requestImages) && requestImages.length > 0
    
    console.log(`✅ Создаю маркер для заявки ${request.id} на координатах [${lat}, ${lon}]`, {
      imagesCount: requestImages.length,
      hasImages
    })
    
    // Формируем HTML для изображений (не используется в компактном popup, но может понадобиться)
    let _imagesHTML = ''
    if (hasImages) {
      _imagesHTML = `
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; color: #6b7280; font-weight: 600; margin-bottom: 8px;">ФОТОГРАФИИ</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;">
            ${requestImages.map(img => {
              const imageUrl = img.url || img.thumbnail_url || ''
              const fullImageUrl = img.url || imageUrl
              // Используем функцию getImageUrl для формирования полного URL
              const finalUrl = getImageUrl(imageUrl)
              const fullUrl = getImageUrl(fullImageUrl)
              return `
                <a href="${fullUrl}" target="_blank" style="display: block; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f3f4f6;">
                  <img 
                    src="${finalUrl}" 
                    alt="Фото заявки"
                    style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:12px;\\'>Нет фото</div>'"
                  />
                </a>
              `
            }).join('')}
          </div>
        </div>
      `
    }
    
    const marker = L.marker([lat, lon], { 
      icon,
      requestId: request.id // Сохраняем ID для поиска маркера
    })
      .bindPopup(`
        <div style="font-family: system-ui; padding: 8px; min-width: 200px; max-width: min(85vw, 280px);">
          <div style="font-size: 24px; margin-bottom: 6px; text-align: center;">${typeIcons[problemType] || '🔧'}</div>
          <h3 style="font-weight: 800; font-size: 14px; color: #1f2937; margin-bottom: 3px; line-height: 1.2; text-align: center;">
            ${requestTitle}
          </h3>
          ${formattedDate ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 6px; text-align: center;">🕒 ${formattedDate}</div>` : ''}
          <p style="font-size: 12px; color: #4b5563; margin-bottom: 8px; line-height: 1.4; background: #f9fafb; padding: 6px; border-radius: 6px; max-height: 60px; overflow: hidden;">
            ${requestDescription}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 8px; padding: 6px; background: #f0fdf4; border-radius: 6px;">
            <div style="text-align: center;">
              <div style="font-size: 9px; color: #6b7280; font-weight: 600;">НАГРАДА</div>
              <div style="font-weight: 900; font-size: 16px; color: #16a34a;">${requestAmount}₽</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: #6b7280; font-weight: 600;">РАССТ.</div>
              <div style="font-weight: 900; font-size: 16px; color: #3b82f6;">${requestDistance}</div>
            </div>
          </div>
          
          <div style="display: grid; gap: 4px;">
            ${props.isAuthenticated ? `
            <button 
              onclick="window.location.href='/responses/${request.id}'"
              style="width: 100%; padding: 8px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer;"
            >
              👋 Откликнуться
            </button>
            ` : `
            <a 
              href="/login?redirect=/responses/${request.id}"
              style="width: 100%; padding: 8px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; text-decoration: none; display: block; text-align: center;"
            >
              🔐 Войти
            </a>
            `}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <a 
                href="https://yandex.ru/maps/?text=${lat},${lon}"
                target="_blank"
                style="padding: 6px; background: #ffc700; color: #000; border-radius: 6px; font-weight: bold; font-size: 11px; text-decoration: none; text-align: center;"
              >
                🗺️ Карта
              </a>
              <button 
                class="share-request-btn"
                data-request-id="${request.id}"
                style="padding: 6px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer;"
              >
                📤 Отправить
              </button>
            </div>
          </div>
        </div>
      `, {
        maxWidth: 280,
        className: 'custom-popup animated-popup',
        autoPan: true,
        autoPanPadding: [60, 60],
        closeButton: true,
        offset: [0, -10]
      })
      .on('click', () => {
        // Эмитим событие клика на заявку
        emit('request-clicked', request.id)
      })
      // Обработчик кнопки "Поделиться" работает через делегирование в onMounted

    markers.push(marker)
    console.log(`✅ Маркер ${index + 1} добавлен в массив для заявки ${request.id}`)
  })
  
  console.log(`📊 Всего создано маркеров: ${markers.length}`)
  
  // Добавляем маркеры на карту
  if (markers.length > 0) {
    console.log(`🗺️ Начинаю добавление ${markers.length} маркеров на карту...`)
    console.log('🗺️ Состояние карты:', {
      loaded: map._loaded,
      container: !!map._container,
      panes: !!map._panes,
      markerPane: !!map._panes?.markerPane
    })
    
    // Упрощенная логика: добавляем маркеры напрямую на карту
    // Кластеризацию можно включить позже, если нужно
    let addedCount = 0
    let errorCount = 0
    
    markers.forEach((m, idx) => {
      try {
        // Добавляем маркер напрямую на карту
        m.addTo(map)
        addedCount++
        console.log(`✅ Маркер ${idx + 1}/${markers.length} добавлен на карту:`, {
          id: m.options?.id || 'unknown',
          latlng: m.getLatLng()
        })
      } catch (e) {
        errorCount++
        console.error(`❌ Ошибка при добавлении маркера ${idx + 1}:`, e)
        console.error('Детали маркера:', {
          marker: m,
          latlng: m.getLatLng(),
          icon: m.options?.icon
        })
      }
    })
    
    console.log(`📊 Результат добавления маркеров: добавлено ${addedCount}, ошибок ${errorCount}`)
    
    // Проверяем, что маркеры действительно на карте
    const layersOnMap = map._layers ? Object.keys(map._layers).length : 0
    console.log(`🗺️ Всего слоев на карте: ${layersOnMap}`)
    
    // Кластеризацию отключаем - маркеры должны быть видны на всех масштабах
    // Маркеры уже добавлены напрямую на карту выше (строки 664-682)
    console.log(`✅ Все ${addedCount} маркеров добавлены напрямую на карту (без кластеризации)`)
    console.log(`🗺️ Маркеры будут видны на всех масштабах карты`)
  } else {
    console.warn('⚠️ Нет маркеров для добавления на карту')
  }
  
  // Добавляем CSS анимацию для маркеров
  if (!document.getElementById('marker-pulse-animation')) {
    const style = document.createElement('style')
    style.id = 'marker-pulse-animation'
    style.innerHTML = `
      @keyframes pulse-marker {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.6);
        }
      }
      .marker-badge{
        position: relative;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: #fff;
        padding: 10px 14px;
        border-radius: 24px;
        font-size: 18px;
        font-weight: 900;
        text-align: center;
        white-space: nowrap;
        animation: pulse-marker 2s ease-in-out infinite, marker-fade-in .35s ease-out;
        z-index: 1000 !important;
        pointer-events: auto !important;
      }
      
      .custom-marker {
        z-index: 1000 !important;
        pointer-events: auto !important;
      }
      
      .leaflet-marker-icon {
        z-index: 1000 !important;
        pointer-events: auto !important;
      }
      @keyframes marker-fade-in { from { opacity: 0; } to { opacity: 1; } }
      /* Анимация для Leaflet popup - только opacity, без transform (конфликтует с Leaflet) */
      .leaflet-popup.animated-popup {
        animation: popup-fade-in .2s ease-out forwards;
      }
      .leaflet-popup.animated-popup .leaflet-popup-content-wrapper {
        animation: popup-scale-in .2s ease-out forwards;
      }
      @keyframes popup-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popup-scale-in {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      /* Фикс позиционирования popup */
      .leaflet-popup {
        position: absolute !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      }
      .leaflet-popup-tip {
        display: none; /* Скрываем стрелку для чистого вида */
      }
    `
    document.head.appendChild(style)
  }
}

// Проверка разрешений геолокации
async function checkGeolocationPermission() {
  if (!navigator.permissions) {
    return null // API не поддерживается
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch (e) {
    console.warn('Ошибка проверки разрешений:', e)
    return null
  }
}

// Получение местоположения пользователя
async function getUserLocation() {
  // Проверяем поддержку геолокации
  if (!navigator.geolocation) {
    locationStatus.value = '❌ Геолокация не поддерживается'
    locationStatusClass.value = 'bg-red-500'
    locationStatusTextClass.value = 'text-red-700'
    console.warn('Геолокация не поддерживается')
    return
  }

  // Проверяем разрешения
  const permission = await checkGeolocationPermission()
  if (permission === 'denied') {
    locationStatus.value = '❌ Доступ к геолокации запрещён'
    locationStatusClass.value = 'bg-red-500'
    locationStatusTextClass.value = 'text-red-700'
    console.warn('Доступ к геолокации запрещён')
    return
  }

  // Показываем статус загрузки
  locationStatus.value = '⏳ Определяю местоположение...'
  locationStatusClass.value = 'bg-blue-500 animate-pulse'
  locationStatusTextClass.value = 'text-blue-700'

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      
      console.log('✅ Местоположение получено:', lat, lon)
      console.log('📍 Точность:', position.coords.accuracy, 'метров')
      
      // Валидация координат пользователя перед созданием маркера
      const userLat = parseFloat(lat)
      const userLon = parseFloat(lon)
      
      if (typeof userLat !== 'number' || typeof userLon !== 'number' ||
          isNaN(userLat) || isNaN(userLon) ||
          userLat < -90 || userLat > 90 || userLon < -180 || userLon > 180) {
        console.error('❌ Невалидные координаты пользователя:', { lat, lon, parsed: { userLat, userLon } })
        locationStatus.value = '❌ Неверные координаты'
        locationStatusClass.value = 'bg-red-500'
        locationStatusTextClass.value = 'text-red-700'
        return
      }
      
      // Успешно получили координаты
      locationStatus.value = '✅ Местоположение определено'
      locationStatusClass.value = 'bg-green-500'
      locationStatusTextClass.value = 'text-green-700'
      
      // Скрываем статус через 3 секунды
      setTimeout(() => {
        if (locationStatus.value === '✅ Местоположение определено') {
          locationStatus.value = null
        }
      }, 3000)
      
      // Добавляем маркер пользователя и центрируем карту
      if (map && map._loaded && map._container) {
        // Удаляем старый маркер пользователя если есть
        if (userMarker) {
          try {
            map.removeLayer(userMarker)
          } catch (e) {
            console.warn('Ошибка при удалении старого маркера пользователя:', e)
          }
        }
        
        // Создаем иконку для маркера пользователя
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
              border: 4px solid white;
              animation: pulse-user 2s ease-in-out infinite;
            ">
              <span style="font-size: 20px;">📍</span>
            </div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 60px;
              height: 60px;
              border: 2px solid #3b82f6;
              border-radius: 50%;
              opacity: 0.3;
              animation: pulse-ring 2s ease-in-out infinite;
            "></div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
        
        // Создаем маркер пользователя
        userMarker = L.marker([userLat, userLon], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>👤 Вы здесь</b>')
        
        // Центрируем карту на пользователе
        map.setView([userLat, userLon], 13)
        console.log('✅ Карта центрирована на местоположении пользователя, маркер добавлен')
      }
    },
    (error) => {
      const errorMessages = {
        1: '❌ Доступ запрещён. Разрешите геолокацию в настройках браузера.',
        2: '❌ Местоположение недоступно. Проверьте GPS или Wi-Fi.',
        3: '⏱️ Таймаут запроса. Попробуйте еще раз.'
      }
      
      const errorMessage = errorMessages[error.code] || `❌ Ошибка: ${error.message}`
      locationStatus.value = errorMessage
      locationStatusClass.value = error.code === 3 ? 'bg-yellow-500' : 'bg-red-500'
      locationStatusTextClass.value = error.code === 3 ? 'text-yellow-700' : 'text-red-700'
      
      console.error('❌ Ошибка геолокации:', {
        код: error.code,
        сообщение: error.message,
        полноеСообщение: errorMessage
      })
      
      // Показываем инструкции для пользователя
      if (error.code === 1) {
        console.log('💡 Инструкция: Разрешите доступ к геолокации в настройках браузера')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  )
}

// Функция addUserMarker удалена - маркер пользователя не нужен

// Построение маршрута через OSRM API
async function buildRoute(from, to) {
  if (!map) return
  
  // Валидация координат маршрута
  const fromLat = parseFloat(from?.[0])
  const fromLon = parseFloat(from?.[1])
  const toLat = parseFloat(to?.[0])
  const toLon = parseFloat(to?.[1])
  
  if (isNaN(fromLat) || isNaN(fromLon) || isNaN(toLat) || isNaN(toLon) ||
      fromLat < -90 || fromLat > 90 || fromLon < -180 || fromLon > 180 ||
      toLat < -90 || toLat > 90 || toLon < -180 || toLon > 180) {
    console.error('❌ Невалидные координаты маршрута:', { from, to, parsed: { fromLat, fromLon, toLat, toLon } })
    return
  }
  
  try {
    console.log(`🗺️ Строю маршрут от [${fromLat}, ${fromLon}] к [${toLat}, ${toLon}]`)
    
    // Используем OSRM API (бесплатный)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`
    )
    
    if (!response.ok) {
      throw new Error('Ошибка OSRM API')
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
      
      // Удаляем старый маршрут
      if (routeLine) {
        routeLine.remove()
      }
      
      // Рисуем новый маршрут
      routeLine = L.polyline(coordinates, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(map)
      
      // Центрируем карту на маршрут (с проверкой готовности)
      if (map._container && map._container._leaflet_id && map._panes && map._panes.mapPane) {
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] })
      }
      
      const distanceKm = (route.distance / 1000).toFixed(1)
      const durationMin = Math.ceil(route.duration / 60)
      
      console.log(`✅ Маршрут построен: ${distanceKm} км, ~${durationMin} мин`)
      activeRoute = { distance: distanceKm, duration: durationMin }
      
      // Показываем popup с информацией (только если координаты валидны)
      if (typeof toLat === 'number' && typeof toLon === 'number' && 
          !isNaN(toLat) && !isNaN(toLon) &&
          toLat >= -90 && toLat <= 90 && toLon >= -180 && toLon <= 180) {
        L.popup()
          .setLatLng([toLat, toLon])
          .setContent(`
            <div style="font-family: system-ui; text-align: center;">
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">🚗 Маршрут</div>
              <div style="color: #16a34a; font-weight: bold;">${distanceKm} км</div>
              <div style="color: #6b7280;">~${durationMin} минут</div>
            </div>
          `)
          .openOn(map)
      }
      
      return { distance: distanceKm, duration: durationMin }
    }
  } catch (error) {
    console.error('❌ Ошибка построения маршрута:', error)
    return null
  }
}

// Функция centerMap больше не используется, так как есть стандартная кнопка локации

// Приблизить к конкретному запросу
function focusOnRequest(request) {
  if (!map) {
    console.warn('⚠️ Карта не инициализирована')
    return
  }
  
  console.log('🎯 focusOnRequest вызван с заявкой:', {
    id: request.id,
    request: request,
    lat: request.lat,
    latitude: request.latitude,
    lon: request.lon,
    longitude: request.longitude
  })
  
  // Валидация координат - проверяем все возможные варианты
  // Важно: latitude - это широта (lat), longitude - это долгота (lon)
  let latRaw = request.lat || request.latitude
  let lonRaw = request.lon || request.longitude
  
  // Если координаты - строки (DECIMAL из базы), преобразуем в числа
  const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : (typeof latRaw === 'number' ? latRaw : NaN)
  const lon = typeof lonRaw === 'string' ? parseFloat(lonRaw) : (typeof lonRaw === 'number' ? lonRaw : NaN)
  
  console.log(`📍 Координаты заявки: raw lat=${latRaw}, raw lon=${lonRaw}, parsed lat=${lat}, parsed lon=${lon}`)
  
  if (typeof lat !== 'number' || typeof lon !== 'number' ||
      isNaN(lat) || isNaN(lon) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    console.error('⚠️ Невалидные координаты для focusOnRequest:', {
      request: request,
      latRaw,
      lonRaw,
      lat,
      lon
    })
    return
  }
  
  console.log(`🎯 Приближаемся к запросу ${request.id || request.title || 'unknown'}: [${lat}, ${lon}]`)
  
  // Плавное приближение к запросу (с проверкой готовности)
  if (map._container && map._container._leaflet_id && map._panes && map._panes.mapPane) {
    console.log(`✅ Выполняю flyTo([${lat}, ${lon}], 17)`)
    map.flyTo([lat, lon], 17, {
      animate: true,
      duration: 1.5, // 1.5 секунды анимация
      easeLinearity: 0.25
    })
  } else {
    console.warn('⚠️ Карта не готова для flyTo')
  }
  
  // Находим маркер и открываем popup
  setTimeout(() => {
    console.log('🔍 Поиск маркера для координат:', [lat, lon])
    console.log('📋 Всего маркеров в массиве:', markers.length)
    
    // Метод 1: Поиск по ID (более надёжный)
    let marker = markers.find(m => {
      const markerId = m.options?.requestId || m.options?.id
      return markerId === request.id
    })
    
    // Метод 2: Поиск по координатам (фолбэк)
    if (!marker) {
      marker = markers.find(m => {
        const pos = m.getLatLng()
        const distance = Math.sqrt(Math.pow(pos.lat - lat, 2) + Math.pow(pos.lng - lon, 2))
        return distance < 0.001
      })
    }
    
    if (marker) {
      console.log('✅ Маркер найден!', {
        position: marker.getLatLng(),
        id: marker.options?.requestId || marker.options?.id
      })
      // Открываем popup и проверяем его позиционирование
      marker.openPopup()
      console.log('✅ Popup открыт для маркера')
      
      // Проверяем, что popup действительно открылся на правильных координатах
      setTimeout(() => {
        const popup = marker.getPopup()
        if (popup && popup.isOpen()) {
          const popupLatLng = popup.getLatLng()
          const markerLatLng = marker.getLatLng()
          console.log('🔍 Проверка позиции popup:', {
            popupCoords: popupLatLng,
            markerCoords: markerLatLng,
            match: popupLatLng.lat === markerLatLng.lat && popupLatLng.lng === markerLatLng.lng
          })
        }
      }, 100)
    } else {
      console.warn('⚠️ Маркер не найден для координат:', [lat, lon])
      console.log('📋 Доступные маркеры:', markers.map(m => {
        const pos = m.getLatLng()
        const markerId = m.options?.requestId || m.options?.id
        return {
          id: markerId,
          coords: [pos.lat, pos.lng],
          distance: Math.sqrt(Math.pow(pos.lat - lat, 2) + Math.pow(pos.lng - lon, 2))
        }
      }))
    }
  }, 1600) // После завершения анимации
}

// Приблизить к маркеру по ID заявки (вызывается из MapView)
function focusOnMarker(requestId) {
  console.log('🎯 focusOnMarker вызван для заявки:', requestId)
  
  // Находим заявку в props.requests
  const request = props.requests.find(r => r.id === requestId)
  
  if (!request) {
    console.warn('⚠️ Заявка не найдена:', requestId)
    return
  }
  
  // Вызываем существующую функцию focusOnRequest
  focusOnRequest(request)
}

// Приблизить к маршруту (показать весь маршрут)
function focusOnRoute() {
  if (!map || !routeLine || !map._container || !map._container._leaflet_id || !map._panes || !map._panes.mapPane) return
  
  map.fitBounds(routeLine.getBounds(), {
    padding: [50, 50],
    animate: true,
    duration: 1
  })
}

function resetRoute() {
  if (routeLine) {
    try { routeLine.remove() } catch (e) { console.warn('Remove route:', e) }
    routeLine = null
  }
  activeRoute = null
}

// Приблизить к двум точкам (заявитель и помощник)
function focusOnBothPoints(point1, point2) {
  if (!map || !map._container || !map._container._leaflet_id || !map._panes || !map._panes.mapPane) return
  
  const bounds = L.latLngBounds([
    [point1.lat, point1.lon],
    [point2.lat, point2.lon]
  ])
  
  map.fitBounds(bounds, {
    padding: [100, 100],
    animate: true,
    duration: 1.5
  })
}

function zoomIn() {
  if (!map || !map._container || !map._container._leaflet_id || !map._panes || !map._panes.mapPane) return
  map.zoomIn()
}

function zoomOut() {
  if (!map || !map._container || !map._container._leaflet_id || !map._panes || !map._panes.mapPane) return
  map.zoomOut()
}

// Построить маршрут от текущей позиции к запросу
async function navigateToRequest(requestLat, requestLon) {
  if (!navigator.geolocation) {
    alert('❌ Геолокация не поддерживается')
    return
  }
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    })
    
    const from = [position.coords.latitude, position.coords.longitude]
    const to = [requestLat, requestLon]
    
    // Строим маршрут на карте
    await buildRoute(from, to)
    
    // Показываем модальное окно с выбором навигатора
    showNavigationModal(from, to)
    
  } catch (error) {
    alert('❌ Не удалось получить ваше местоположение. Разрешите геолокацию!')
  }
}

// Показать модальное окно с выбором навигатора
function showNavigationModal(from, to) {
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    z-index: 10001;
    min-width: 350px;
  `
  
  modal.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 40px; margin-bottom: 12px;">🗺️</div>
      <h3 style="font-size: 22px; font-weight: 900; margin-bottom: 16px;">Выберите навигатор</h3>
      <div style="display: grid; gap: 10px;">
        <a 
          href="https://yandex.ru/maps/?rtext=${from[0]},${from[1]}~${to[0]},${to[1]}&rtt=auto"
          target="_blank"
          style="padding: 14px; background: linear-gradient(135deg, #ffdb4d, #ffc700); color: #000; border-radius: 12px; font-weight: bold; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;"
        >
          🟡 Яндекс.Навигатор
        </a>
        <a 
          href="https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=driving"
          target="_blank"
          style="padding: 14px; background: linear-gradient(135deg, #4285f4, #1a73e8); color: white; border-radius: 12px; font-weight: bold; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;"
        >
          🗺️ Google Maps
        </a>
        <button onclick="this.closest('[style*=fixed]').remove()" style="padding: 10px; background: #f3f4f6; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; color: #6b7280;">
          Закрыть
        </button>
      </div>
    </div>
  `
  
  const backdrop = document.createElement('div')
  backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000;'
  backdrop.onclick = () => {
    backdrop.remove()
    modal.remove()
  }
  
  document.body.appendChild(backdrop)
  document.body.appendChild(modal)
}

// ========== HELPER CARS FUNCTIONALITY ==========

// Load available helpers from API
async function loadAvailableHelpers() {
  if (!props.showHelpers) {
    console.log('🚧 showHelpers is false, skipping helper load')
    return
  }
  
  console.log('🚗 Starting to load available helpers...')
  
  try {
    // Get user's current location for distance calculation
    let latitude = null
    let longitude = null
    
    if (userMarker) {
      const pos = userMarker.getLatLng()
      latitude = pos.lat
      longitude = pos.lng
      console.log('📍 User location:', latitude, longitude)
    } else {
      console.log('📍 No user marker, loading all helpers')
    }
    
    const params = { radius: 500 } // Max radius
    if (latitude && longitude) {
      params.latitude = latitude
      params.longitude = longitude
    }
    
    console.log('📡 Requesting helpers with params:', params)
    const response = await apiService.client.get('/users/available-helpers', { params })
    console.log('📥 API response:', response)
    
    if (response.success && response.helpers) {
      console.log(`🚗 Loaded ${response.helpers.length} available helpers`)
      addHelperMarkers(response.helpers)
    } else {
      console.warn('⚠️ API returned no helpers or success=false')
    }
  } catch (error) {
    console.error('❌ Error loading helpers:', error)
  }
}

// Add helper car markers to the map
function addHelperMarkers(helpers) {
  if (!map) return
  
  // Remove existing helper markers
  helperMarkers.forEach(marker => {
    try {
      marker.remove()
    } catch (e) {
      console.warn('Error removing helper marker:', e)
    }
  })
  helperMarkers.length = 0
  
  if (!helpers || helpers.length === 0) {
    console.log('📋 No helpers to display on map')
    return
  }
  
  helpers.forEach(helper => {
    const lat = parseFloat(helper.last_location_lat)
    const lon = parseFloat(helper.last_location_lon)
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.warn('⚠️ Invalid coordinates for helper:', helper.id)
      return
    }
    
    // Determine car emoji and color based on car_type
    // If car_type not set - pink marker for "not filled"
    const carTypeConfig = {
      sedan: { emoji: '🚗', color: '#3b82f6', gradient: '#2563eb' },     // blue
      suv: { emoji: '🚙', color: '#10b981', gradient: '#059669' },       // green
      truck: { emoji: '🚚', color: '#f59e0b', gradient: '#d97706' },     // orange
      van: { emoji: '🚐', color: '#8b5cf6', gradient: '#7c3aed' },       // purple
      motorcycle: { emoji: '🏍️', color: '#ef4444', gradient: '#dc2626' }, // red
      other: { emoji: '🚌', color: '#6b7280', gradient: '#4b5563' }      // gray
    }
    
    const hasCarType = helper.car_type && carTypeConfig[helper.car_type]
    const config = hasCarType 
      ? carTypeConfig[helper.car_type] 
      : { emoji: '🚗', color: '#ec4899', gradient: '#db2777' } // pink for not filled
    
    const carEmoji = config.emoji
    const carColor = config.color
    
    // Премиум статус - рамка и свечение
    const premiumStyles = {
      gold: {
        border: '3px solid #fbbf24',
        shadow: '0 0 20px rgba(251, 191, 36, 0.8)',
        badge: '🥇',
        badgeBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        animation: 'gold-glow 1.5s ease-in-out infinite'
      },
      silver: {
        border: '3px solid #9ca3af',
        shadow: '0 0 15px rgba(156, 163, 175, 0.6)',
        badge: '🥈',
        badgeBg: 'linear-gradient(135deg, #9ca3af, #6b7280)',
        animation: 'none'
      },
      bronze: {
        border: '3px solid #f97316',
        shadow: '0 0 15px rgba(249, 115, 22, 0.6)',
        badge: '🥉',
        badgeBg: 'linear-gradient(135deg, #f97316, #ea580c)',
        animation: 'none'
      }
    }
    
    const premiumStyle = helper.premium_status ? premiumStyles[helper.premium_status] : null
    
    // Get helper skills summary
    const skills = []
    if (helper.has_jumper_cables) skills.push('⚡')
    if (helper.has_tow_rope) skills.push('🧵')
    if (helper.has_fuel_canister) skills.push('⛽')
    if (helper.has_compressor) skills.push('💨')
    if (helper.can_change_tire) skills.push('🛞')
    if (helper.has_tools) skills.push('🧰')
    if (helper.is_mechanic) skills.push('👨‍🔧')
    
    const skillsText = skills.length > 0 ? skills.join('') : '🚗'
    console.log('Helper skills:', skillsText) // Debug log
    
    // Create car marker icon - BIG EMOJI style
    const premiumBorderStyle = premiumStyle ? `border: ${premiumStyle.border}; box-shadow: ${premiumStyle.shadow}; animation: ${premiumStyle.animation};` : ''
    const premiumBadgeHtml = premiumStyle ? `<div style="position: absolute; top: -5px; right: -5px; font-size: 20px;">${premiumStyle.badge}</div>` : ''
    
    const helperIcon = L.divIcon({
      className: 'helper-car-marker',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          position: relative;
        ">
          ${premiumBadgeHtml}
          <div style="
            font-size: 48px;
            line-height: 1;
            animation: helper-bounce 2s ease-in-out infinite;
            ${premiumStyle ? 'background: rgba(255,255,255,0.9); border-radius: 50%; padding: 5px;' + premiumBorderStyle : ''}
          ">${carEmoji}</div>
          <div style="
            background: ${premiumStyle ? premiumStyle.badgeBg : `linear-gradient(135deg, ${carColor}, ${config.gradient})`};
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-top: -8px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          ">
            ${helper.rating ? '⭐' + parseFloat(helper.rating).toFixed(1) : 'Готов'}
          </div>
        </div>
      `,
      iconSize: [60, 70],
      iconAnchor: [30, 70],
      popupAnchor: [0, -70]
    })
    
    // Build popup content
    const premiumBadgePopup = premiumStyle 
      ? `<span style="display: inline-flex; align-items: center; gap: 4px; background: ${premiumStyle.badgeBg}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${premiumStyle.badge} ${helper.premium_status === 'gold' ? 'Золотой' : helper.premium_status === 'silver' ? 'Серебряный' : 'Бронзовый'}</span>` 
      : ''
    
    const carInfo = helper.car_brand 
      ? `<div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">🚗 ${helper.car_brand} ${helper.car_model || ''} ${helper.car_color ? '(' + helper.car_color + ')' : ''}</div>`
      : ''
    
    const distanceInfo = helper.distance_km !== undefined
      ? `<div style="font-size: 14px; color: #3b82f6; font-weight: bold; margin-bottom: 8px;">📍 ${helper.distance_km} км от вас</div>`
      : ''
    
    const helperMarker = L.marker([lat, lon], {
      icon: helperIcon,
      helperId: helper.id
    })
      .bindPopup(`
        <div style="font-family: system-ui; padding: 14px; min-width: 280px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            ${helper.avatar_url 
              ? `<img src="${getImageUrl(helper.avatar_url)}" alt="" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`
              : `<div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, ${carColor}, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">${(helper.full_name || '?')[0]}</div>`
            }
            <div>
              <h3 style="font-weight: 900; font-size: 18px; color: #1f2937; margin: 0;">
                ${helper.full_name || 'Помощник'} ${premiumBadgePopup}
              </h3>
              ${helper.rating ? `<div style="color: #f59e0b;">⭐ ${parseFloat(helper.rating).toFixed(1)}</div>` : ''}
            </div>
          </div>
          ${distanceInfo}
          ${carInfo}
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${skills.map(s => `<span style="background: #f3f4f6; padding: 4px 8px; border-radius: 8px; font-size: 16px;">${s}</span>`).join('')}
          </div>
          <div style="text-align: center; color: #16a34a; font-weight: 600; margin-bottom: 12px;">
            🟢 Готов помочь в радиусе ${helper.help_radius_km || 10} км
          </div>
          <div style="display: grid; gap: 8px;">
            <a 
              href="/user/${helper.id}"
              style="
                display: block;
                padding: 12px 16px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 12px;
                font-weight: bold;
                text-align: center;
                text-decoration: none;
              "
            >
              👤 Открыть профиль
            </a>
            ${props.isAuthenticated ? `
            <a 
              href="/messages"
              style="
                display: block;
                padding: 12px 16px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-radius: 12px;
                font-weight: bold;
                text-align: center;
                text-decoration: none;
              "
            >
              💬 Написать
            </a>
            ` : `
            <a 
              href="/login?redirect=/user/${helper.id}"
              style="
                display: block;
                padding: 12px 16px;
                background: #f3f4f6;
                color: #374151;
                border-radius: 12px;
                font-weight: bold;
                text-align: center;
                text-decoration: none;
              "
            >
              🔐 Войдите, чтобы написать
            </a>
            `}
          </div>
        </div>
      `, {
        maxWidth: 350,
        className: 'helper-popup animated-popup'
      })
      .on('click', () => {
        emit('helper-clicked', helper.id)
      })
    
    helperMarker.addTo(map)
    helperMarkers.push(helperMarker)
  })
  
  console.log(`✅ Added ${helperMarkers.length} helper markers to map`)
  
  // Add CSS animation for helper markers if not exists
  if (!document.getElementById('helper-pulse-animation')) {
    const style = document.createElement('style')
    style.id = 'helper-pulse-animation'
    style.innerHTML = `
      @keyframes helper-pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }
      }
      @keyframes helper-bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
      @keyframes gold-glow {
        0%, 100% {
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
        }
        50% {
          box-shadow: 0 0 25px rgba(251, 191, 36, 1);
        }
      }
      .helper-car-marker {
        z-index: 900 !important;
        pointer-events: auto !important;
      }
    `
    document.head.appendChild(style)
  }
}

// Update helper location in real-time via WebSocket
function setupHelperTracking() {
  // Listen for helper location updates
  wsService.on('helper:location_update', (data) => {
    console.log('📍 Helper location update:', data)
    
    // Find and update the helper marker
    const marker = helperMarkers.find(m => m.options?.helperId === data.helperId)
    if (marker) {
      const newLatLng = L.latLng(data.latitude, data.longitude)
      marker.setLatLng(newLatLng)
      console.log(`✅ Updated position for helper ${data.helperId}`)
    }
  })
  
  // Start periodic refresh of helpers (every 30 seconds)
  helperUpdateInterval = setInterval(() => {
    loadAvailableHelpers()
  }, 30000)
}

// Start tracking own location when "Ready to help" is enabled
function startOwnLocationTracking() {
  if (!navigator.geolocation) return
  
  // Update location every 10 seconds
  userLocationInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          await apiService.client.put('/users/update-location', { latitude, longitude })
          console.log('📍 Own location updated:', latitude, longitude)
          
          // Update user marker on map
          if (userMarker) {
            userMarker.setLatLng([latitude, longitude])
          }
          
          // Also emit via WebSocket for real-time tracking
          wsService.updateLocation(latitude, longitude)
        } catch (error) {
          console.error('❌ Failed to update location:', error)
        }
      },
      (error) => {
        console.warn('⚠️ Location tracking error:', error)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, 10000)
}

defineExpose({
  zoomIn,
  zoomOut,
  buildRoute,
  getUserLocation,
  navigateToRequest,
  focusOnRequest,
  focusOnMarker,
  focusOnRoute,
  focusOnBothPoints,
  resetRoute,
  loadAvailableHelpers,
  startOwnLocationTracking
})
</script>

<style>
/* Импорт стилей Leaflet */
@import 'leaflet/dist/leaflet.css';

/* Уменьшаем размер атрибуции и делаем почти невидимой */
.leaflet-control-attribution {
  font-size: 6px !important;
  opacity: 0.1 !important;
  background: transparent !important;
  pointer-events: none !important;
}

/* Анимация пульса для маркера пользователя */
@keyframes pulse-user {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.user-location-marker {
  background: transparent !important;
  border: none !important;
}
</style>

