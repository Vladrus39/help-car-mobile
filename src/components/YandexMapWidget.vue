<template>
  <div class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
    <!-- Контейнер карты -->
    <div
      id="yandex-map"
      class="w-full h-full"
    />
    
    <!-- Overlay с элементами управления -->
    <div class="absolute top-4 right-4 space-y-3 z-10">
      <!-- Кнопка центрирования -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center group"
        @click="centerMap"
      >
        <svg
          class="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform"
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

      <!-- Кнопка зума + -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center"
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

      <!-- Кнопка зума - -->
      <button
        class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center"
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

    <!-- Статус онлайн -->
    <div class="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center space-x-2">
      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span class="text-sm font-bold text-gray-900">{{ onlineCount }} пользователей онлайн</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const onlineCount = ref(247)
let map = null
let initAttempts = 0
const MAX_INIT_ATTEMPTS = 20 // 10 секунд (20 * 500ms)

onMounted(() => {
  initMap()
})

async function initMap() {
  const mapContainer = document.getElementById('yandex-map')
  if (!mapContainer) {
    console.error('Контейнер карты не найден')
    return
  }

  // Ждём загрузки Yandex Maps API
  if (!window.ymaps3) {
    initAttempts++
    
    if (initAttempts >= MAX_INIT_ATTEMPTS) {
      console.error('❌ Yandex Maps API не загрузился после 10 секунд')
      showMapError()
      return
    }
    
    console.log(`⏳ Ожидание загрузки Yandex Maps API... (попытка ${initAttempts}/${MAX_INIT_ATTEMPTS})`)
    showMapPlaceholder()
    setTimeout(initMap, 500)
    return
  }

  try {
    console.log('Инициализация YandexMapWidget...')
    await window.ymaps3.ready

    const ymaps = window.ymaps3

    // Создание карты
    map = new ymaps.YMap(mapContainer, {
      location: {
        center: [37.617644, 55.755819], // Москва
        zoom: 12
      }
    })

    // Добавляем слои
    map.addChild(new ymaps.YMapDefaultSchemeLayer())
    map.addChild(new ymaps.YMapDefaultFeaturesLayer())

    console.log('✅ YandexMapWidget инициализирован')
  } catch (error) {
    console.error('❌ Ошибка инициализации карты:', error)
    console.error('Stack:', error.stack)
    showMapPlaceholder()
  }
}

function showMapPlaceholder() {
  const mapElement = document.getElementById('yandex-map')
  if (mapElement) {
    mapElement.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin text-6xl mb-4">🗺️</div>
          <p class="text-2xl font-bold text-gray-700">Загрузка карты...</p>
          <p class="text-gray-500 mt-2">Попытка ${initAttempts} из ${MAX_INIT_ATTEMPTS}</p>
        </div>
      </div>
    `
  }
}

function showMapError() {
  const mapElement = document.getElementById('yandex-map')
  if (mapElement) {
    mapElement.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center p-8">
        <div class="text-center max-w-2xl">
          <div class="text-8xl mb-6">⚠️</div>
          <h3 class="text-3xl font-black text-gray-900 mb-4">
            Карта не загрузилась
          </h3>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left">
            <h4 class="font-black text-xl mb-3 text-red-600">🔴 Причины:</h4>
            <ul class="space-y-2 text-sm text-gray-700">
              <li><strong>AdBlock</strong> блокирует Yandex API</li>
              <li><strong>Антивирус</strong> блокирует внешние скрипты</li>
              <li><strong>API ключ</strong> недействителен или истек</li>
              <li><strong>Нет интернета</strong> или медленное соединение</li>
            </ul>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left">
            <h4 class="font-black text-xl mb-3 text-green-600">✅ Решения:</h4>
            <ol class="space-y-3 text-sm text-gray-700">
              <li class="flex items-start">
                <span class="font-bold mr-2">1.</span>
                <span><strong class="text-blue-600">Отключите AdBlock</strong> на этой странице и обновите (F5)</span>
              </li>
              <li class="flex items-start">
                <span class="font-bold mr-2">2.</span>
                <span>Попробуйте <strong class="text-purple-600">режим инкогнито</strong> (Ctrl+Shift+N)</span>
              </li>
              <li class="flex items-start">
                <span class="font-bold mr-2">3.</span>
                <span>Получите бесплатный API ключ на 
                  <a href="https://developer.tech.yandex.ru/" target="_blank" class="text-blue-600 hover:underline font-bold">
                    developer.tech.yandex.ru
                  </a>
                </span>
              </li>
            </ol>
          </div>
          <button 
            onclick="window.location.reload()"
            class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black text-lg hover:from-blue-600 hover:to-purple-600 transition shadow-xl"
          >
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    `
  }
}

function centerMap() {
  if (!map) return
  map.setLocation({
    center: [37.617644, 55.755819],
    zoom: 12,
    duration: 1000
  })
}

function zoomIn() {
  if (!map) return
  const currentZoom = map.zoom || 12
  map.setLocation({
    zoom: currentZoom + 1,
    duration: 300
  })
}

function zoomOut() {
  if (!map) return
  const currentZoom = map.zoom || 12
  map.setLocation({
    zoom: currentZoom - 1,
    duration: 300
  })
}

let userPosition = ref(null)
let routeLayer = null

// Центрирование на пользователе
async function centerOnUser() {
  if (!map) return
  
  // Получаем текущую геолокацию
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })
      
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      userPosition.value = [lon, lat] // Yandex использует [lon, lat]
      
      console.log('✅ Геолокация получена:', { lat, lon, accuracy: position.coords.accuracy })
      
      map.setLocation({
        center: [lon, lat],
        zoom: 15,
        duration: 500
      })
      
      // Добавляем маркер пользователя
      addUserMarker([lon, lat])
      
    } catch (error) {
      console.error('❌ Ошибка геолокации:', error.message)
      // Fallback на Москву
      map.setLocation({
        center: [37.617644, 55.755819],
        zoom: 15,
        duration: 500
      })
    }
  } else {
    console.warn('Геолокация не поддерживается')
    map.setLocation({
      center: [37.617644, 55.755819],
      zoom: 15,
      duration: 500
    })
  }
}

// Добавить маркер пользователя
function addUserMarker(coordinates) {
  if (!map || !window.ymaps3) return
  
  try {
    const ymaps = window.ymaps3
    const marker = new ymaps.YMapMarker(
      {
        coordinates,
        draggable: false
      },
      document.createElement('div')
    )
    marker.element.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-center: center;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        border: 4px solid white;
      ">
        <span style="font-size: 20px;">📍</span>
      </div>
    `
    map.addChild(marker)
  } catch (error) {
    console.error('Ошибка добавления маркера:', error)
  }
}

// Показать/скрыть пробки
const showTraffic = ref(false)
function toggleTraffic() {
  showTraffic.value = !showTraffic.value
  console.log('Traffic toggled:', showTraffic.value)
  // Показ пробок в Yandex Maps 3.0
  // В версии 3.0 используется YMapLayer с type: 'traffic'
  // Функциональность будет реализована при обновлении до Yandex Maps 3.0
}

// Построение маршрута от помощника к заявителю через OSRM (fallback)
async function buildRoute(from, to) {
  if (!map) return
  
  try {
    console.log(`🗺️ Строю маршрут от [${from[0]}, ${from[1]}] к [${to[0]}, ${to[1]}]`)
    
    // Используем OSRM API как fallback (бесплатный и надежный)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    )
    
    if (!response.ok) {
      throw new Error('Ошибка OSRM API')
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const coordinates = route.geometry.coordinates
      
      // В Yandex Maps 3.0 рисуем линию через YMapFeature
      if (window.ymaps3) {
        const ymaps = window.ymaps3
        
        // Удаляем старый маршрут
        if (routeLayer) {
          map.removeChild(routeLayer)
        }
        
        // Создаем polyline
        routeLayer = new ymaps.YMapFeature({
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          },
          style: {
            stroke: [{ color: '#22c55e', width: 5, opacity: 0.8 }]
          }
        })
        
        map.addChild(routeLayer)
        
        // Центрируем карту на маршрут
        map.setLocation({
          bounds: getBounds(coordinates),
          duration: 500
        })
      }
      
      const distanceKm = (route.distance / 1000).toFixed(1)
      const durationMin = Math.ceil(route.duration / 60)
      
      console.log(`✅ Маршрут построен: ${distanceKm} км, ~${durationMin} мин`)
      
      return { distance: distanceKm, duration: durationMin }
    }
  } catch (error) {
    console.error('❌ Ошибка построения маршрута:', error)
    return null
  }
}

// Вычисление bounds для массива координат
function getBounds(coordinates) {
  if (!coordinates || coordinates.length === 0) return null
  
  let minLon = coordinates[0][0]
  let maxLon = coordinates[0][0]
  let minLat = coordinates[0][1]
  let maxLat = coordinates[0][1]
  
  coordinates.forEach(([lon, lat]) => {
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })
  
  return [[minLon, minLat], [maxLon, maxLat]]
}

// Публичные методы
defineExpose({
  zoomIn,
  zoomOut,
  centerOnUser,
  centerMap,
  buildRoute,
  toggleTraffic
})
</script>

