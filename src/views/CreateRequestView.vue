<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
    <NavigationHeader />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4 overflow-x-auto">
            <router-link
              to="/"
              class="text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
            >
              🏠 Главная
            </router-link>
            <span class="text-gray-400">/</span>
            <router-link
              to="/map"
              class="text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
            >
              🗺 Карта
            </router-link>
            <span class="text-gray-400">/</span>
            <span class="text-gray-600 dark:text-gray-300 font-semibold whitespace-nowrap">Создать запрос</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
            🆘 Создать запрос о помощи
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-semibold">
            Опишите проблему и укажите вознаграждение
          </p>
        </div>

        <!-- Form -->
        <form
          class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6"
          @submit.prevent="handleSubmit"
        >
          <!-- Problem Type -->
          <div>
            <label class="block text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">Тип проблемы</label>
            <div class="grid grid-cols-2 gap-2 sm:gap-4">
              <button
                v-for="type in problemTypes"
                :key="type.value"
                type="button"
                :class="[
                  'p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 transition transform hover:scale-105 bg-white dark:bg-slate-700',
                  form.problemType === type.value
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500',
                  type.value === 'road_conflict' && 'border-red-300'
                ]"
                @click="form.problemType = type.value"
              >
                <div class="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                  {{ type.icon }}
                </div>
                <div class="text-xs sm:text-sm md:text-base font-black text-gray-900 dark:text-white">
                  {{ type.label }}
                </div>
              </button>
            </div>
          </div>
          
          <!-- Emergency Call Button -->
          <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-red-700">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-white font-black text-lg sm:text-xl mb-1">
                  🚨 Экстренная ситуация?
                </div>
                <div class="text-red-100 text-xs sm:text-sm font-semibold">
                  Позвоните в службу спасения немедленно
                </div>
              </div>
              <a
                href="tel:112"
                class="ml-2 sm:ml-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-red-600 rounded-lg sm:rounded-xl font-black text-lg sm:text-xl md:text-2xl hover:bg-red-50 transition shadow-lg transform hover:scale-105"
              >
                📞 112
              </a>
            </div>
            <div class="mt-4 pt-4 border-t border-red-400 flex gap-3 text-xs text-red-100 font-semibold">
              <a
                href="tel:102"
                class="hover:text-white transition"
              >👮 Полиция: 102</a>
              <span>•</span>
              <a
                href="tel:103"
                class="hover:text-white transition"
              >🚑 Скорая: 103</a>
              <span>•</span>
              <a
                href="tel:104"
                class="hover:text-white transition"
              >🔥 Пожарная: 104</a>
            </div>
          </div>

          <!-- Quick Templates -->
          <div>
            <label class="block text-lg font-black text-gray-900 mb-3">📝 Быстрые шаблоны</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                type="button"
                class="px-3 py-2 bg-gray-100 hover:bg-blue-100 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-700 transition"
                @click="applyTemplate(template)"
              >
                {{ template.icon }} {{ template.label }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-lg font-black text-gray-900 mb-3">Описание проблемы</label>
            <textarea
              v-model="form.description"
              required
              rows="4"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Опишите подробно что случилось..."
            />
          </div>

          <!-- Images -->
          <div>
            <label class="block text-lg font-black text-gray-900 mb-3">
              📷 Фотографии (до 5 шт)
            </label>
            
            <div
              v-if="selectedImages.length > 0"
              class="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <div
                v-for="(image, index) in selectedImages"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image.preview"
                  :alt="`Image ${index + 1}`"
                  class="w-full h-32 object-cover rounded-xl"
                >
                <button
                  type="button"
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-bold"
                  @click="removeImage(index)"
                >
                  ×
                </button>
              </div>
              
              <button
                v-if="selectedImages.length < 5"
                type="button"
                class="h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 transition"
                @click="$refs.fileInput.click()"
              >
                <svg
                  class="w-10 h-10 text-gray-400 mb-2"
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
                <span class="text-sm text-gray-600 font-semibold">Добавить</span>
              </button>
            </div>

            <button
              v-else
              type="button"
              class="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 transition flex flex-col items-center justify-center"
              @click="$refs.fileInput.click()"
            >
              <svg
                class="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-lg font-bold text-gray-700">Нажмите для загрузки фото</span>
              <span class="text-sm text-gray-500 mt-1">Максимум 5 изображений, до 10MB каждое</span>
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleFileSelect"
            >
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-lg font-black text-gray-900 mb-3">💰 Вознаграждение (₽)</label>
            
            <!-- Быстрый выбор популярных сумм -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <button
                v-for="preset in [300, 500, 1000, 2000]"
                :key="preset"
                type="button"
                :class="[
                  'px-4 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105',
                  form.amount === preset
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
                @click="form.amount = preset"
              >
                {{ preset }}₽
              </button>
            </div>

            <!-- Поле для ручного ввода -->
            <div class="relative">
              <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-black text-gray-400">
                ₽
              </div>
              <input
                v-model.number="form.amount"
                type="number"
                required
                min="100"
                max="100000"
                step="50"
                class="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-2xl sm:text-3xl font-black text-center"
                placeholder="500"
              >
            </div>
            
            <p class="text-sm text-gray-600 mt-3 font-semibold text-center">
              💡 Минимум 100₽, максимум 100 000₽ • Шаг 50₽
            </p>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-lg font-black text-gray-900 mb-3">📍 Местоположение</label>
            <div :class="['p-6 rounded-2xl border-2 transition', geolocationClass]">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    class="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-base font-bold text-gray-900 mb-1">
                    {{ geolocationStatus }}
                  </p>
                  <p
                    v-if="currentCoords"
                    class="text-sm text-gray-600"
                  >
                    Координаты: {{ currentCoords.lat.toFixed(6) }}, {{ currentCoords.lon.toFixed(6) }}
                    <br>Точность: {{ Math.round(currentCoords.accuracy) }} метров
                  </p>
                  <button
                    v-else
                    type="button"
                    class="text-sm text-blue-600 hover:text-blue-700 font-bold"
                    @click="getLocation"
                  >
                    Определить заново
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <p class="text-red-700 font-bold">
              {{ error }}
            </p>
          </div>

          <!-- Submit -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <router-link
              to="/map"
              class="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 text-center rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-gray-50 transition"
            >
              Отмена
            </router-link>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:from-red-600 hover:to-red-800 transition shadow-xl disabled:opacity-50"
            >
              {{ isSubmitting ? '⏳ Создание...' : '🆘 Создать запрос' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'

const router = useRouter()

const geolocationStatus = ref('📍 Нажмите для определения')
const geolocationClass = ref('bg-gray-100 text-gray-700')
const currentCoords = ref(null)

// Допустимые типы должны соответствовать backend ENUM: ('towing','fuel','battery','tire','other','road_conflict','sober_driver')
const problemTypes = [
  { value: 'battery', icon: '🔋', label: 'Севшая батарея' },
  { value: 'fuel', icon: '⛽', label: 'Закончилось топливо' },
  { value: 'tire', icon: '🛞', label: 'Прокол колеса' },
  { value: 'towing', icon: '🚗', label: 'Нужна буксировка' },
  { value: 'sober_driver', icon: '🚕', label: 'Трезвый водитель' },
  { value: 'road_conflict', icon: '🚨', label: 'Конфликт на дороге' },
  { value: 'other', icon: '🔧', label: 'Другое' }
]

const quickTemplates = [
  { 
    id: 1, 
    icon: '🔋', 
    label: 'Прикурить', 
    type: 'battery',
    description: 'Нужно прикурить автомобиль. Аккумулятор разрядился, машина не заводится. Нужны провода для прикуривания.',
    amount: 500
  },
  { 
    id: 2, 
    icon: '⛽', 
    label: 'Привезти бензин', 
    type: 'fuel',
    description: 'Закончился бензин, нужно привезти 5-10 литров топлива. АИ-92/95.',
    amount: 1000
  },
  { 
    id: 3, 
    icon: '🛞', 
    label: 'Замена колеса', 
    type: 'tire',
    description: 'Проколол колесо, нужна помощь с заменой на запаску. Есть домкрат и баллонник.',
    amount: 800
  },
  { 
    id: 4, 
    icon: '🚗', 
    label: 'Отбуксировать', 
    type: 'towing',
    description: 'Машина сломалась, нужна буксировка до ближайшего сервиса. Есть трос.',
    amount: 2000
  },
  { 
    id: 5, 
    icon: '🚕', 
    label: 'Трезвый водитель', 
    type: 'sober_driver',
    description: 'Нужен трезвый водитель, чтобы отвезти меня и машину домой.',
    amount: 1500
  },
  { 
    id: 6, 
    icon: '❄️', 
    label: 'Отогреть замок', 
    type: 'other',
    description: 'Замёрз замок двери, нужна помощь с отогревом. Есть фен или размораживатель?',
    amount: 500
  },
  { 
    id: 7, 
    icon: '🔑', 
    label: 'Захлопнул ключи', 
    type: 'other',
    description: 'Захлопнул ключи в машине, нужна помощь с открытием.',
    amount: 1000
  }
]

const form = ref({
  problemType: 'battery',
  description: '',
  amount: 500,
})

const selectedImages = ref([])
const fileInput = ref(null)
const isSubmitting = ref(false)
const error = ref(null)

// Проверка авторизации и автоматическое получение геолокации при загрузке
onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  
  // Автоматически получаем геолокацию при загрузке
  getLocation()
})

function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  
  if (selectedImages.value.length + files.length > 5) {
    error.value = 'Максимум 5 изображений'
    setTimeout(() => error.value = null, 3000)
    return
  }
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      error.value = `${file.name} не является изображением`
      setTimeout(() => error.value = null, 3000)
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      error.value = `${file.name} слишком большой (макс. 10MB)`
      setTimeout(() => error.value = null, 3000)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
  
  event.target.value = ''
}

function removeImage(index) {
  selectedImages.value.splice(index, 1)
}

function applyTemplate(template) {
  form.value.problemType = template.type
  form.value.description = template.description
  form.value.amount = template.amount
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

// Функция получения геолокации
async function getLocation() {
  if (!navigator.geolocation) {
    geolocationStatus.value = '❌ Геолокация не поддерживается вашим браузером'
    geolocationClass.value = 'bg-red-100 text-red-700 border-red-300'
    return
  }
  
  // Проверяем разрешения
  const permission = await checkGeolocationPermission()
  if (permission === 'denied') {
    geolocationStatus.value = '❌ Доступ к геолокации запрещён. Разрешите в настройках браузера.'
    geolocationClass.value = 'bg-red-100 text-red-700 border-red-300'
    console.warn('Доступ к геолокации запрещён')
    return
  }
  
  geolocationStatus.value = '⏳ Определяю местоположение...'
  geolocationClass.value = 'bg-blue-100 text-blue-700 border-blue-300'
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      })
    })
    
    // Валидация координат
    const lat = parseFloat(position.coords.latitude)
    const lon = parseFloat(position.coords.longitude)
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Получены неверные координаты')
    }
    
    currentCoords.value = {
      lat: lat,
      lon: lon,
      accuracy: position.coords.accuracy
    }
    
    geolocationStatus.value = '✅ Местоположение определено!'
    geolocationClass.value = 'bg-green-100 text-green-700 border-green-300'
    
    console.log('✅ Координаты получены:', currentCoords.value)
    
  } catch (err) {
    console.error('❌ Ошибка геолокации:', err)
    
    const errorMessages = {
      1: 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.',
      2: 'Местоположение недоступно. Проверьте GPS или Wi-Fi.',
      3: 'Таймаут запроса. Попробуйте еще раз.'
    }
    
    const errorMessage = errorMessages[err.code] || err.message || 'Ошибка получения местоположения'
    geolocationStatus.value = `❌ ${errorMessage}`
    geolocationClass.value = 'bg-red-100 text-red-700 border-red-300'
    
    // Показываем инструкции для пользователя
    if (err.code === 1) {
      console.log('💡 Инструкция: Разрешите доступ к геолокации в настройках браузера')
    }
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    error.value = null

    // Проверка авторизации
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Необходимо войти в систему для создания заявки')
    }

    // Простая валидация полей
    if (!form.value.description || form.value.description.trim().length < 10) {
      throw new Error('Описание должно содержать не менее 10 символов')
    }
    if (!form.value.amount || Number(form.value.amount) < 100) {
      throw new Error('Минимальная сумма — 100₽')
    }
    
    // Используем сохранённые координаты или получаем новые
    let coords = currentCoords.value
    
    if (!coords) {
      // Получаем геолокацию если ещё не получена
      if (!navigator.geolocation) {
        throw new Error('Геолокация не поддерживается вашим браузером')
      }
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })
      
      coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
    }
    
    // Авто-геокодирование адреса по координатам (OpenStreetMap Nominatim)
    let address = 'Определяется...'
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&zoom=18&addressdetails=1` , { headers: { 'User-Agent': 'RoadHelp/1.0 (help-car.online)' }})
      const data = await response.json()
      if (data?.display_name) {
        address = data.display_name
      }
    } catch (err) {
      console.warn('Геокодирование не удалось:', err)
    }
    
    // Тело запроса только JSON-поля, без изображений
    const data = {
      problem_type: form.value.problemType,
      description: form.value.description,
      amount: form.value.amount,
      latitude: coords.lat,
      longitude: coords.lon,
      location_accuracy: coords.accuracy,
      location_method: 'gps',
      address: address
    }
    
    console.log('Creating request:', data)
    
    // Создание запроса через API
    const result = await apiService.createHelpRequest(data)
    console.log('✅ Запрос создан, ID:', result?.id)
    
    // Загрузка изображений если есть
    // Загрузка изображений отдельным запросом, если есть
    if (selectedImages.value.length > 0 && result?.id) {
      console.log(`📎 Загрузка ${selectedImages.value.length} изображений для заявки ${result.id}...`)
      try {
        const uploadResult = await apiService.uploadRequestImages(result.id, selectedImages.value)
        console.log('✅ Изображения успешно загружены:', uploadResult)
      } catch (uploadError) {
        console.error('⚠️ Ошибка загрузки изображений:', uploadError)
        // Запрос уже создан, но изображения не загрузились
        const uploadErrorMsg = uploadError.response?.data?.error || uploadError.message || 'Неизвестная ошибка'
        alert(`⚠️ Запрос создан, но изображения не загрузились:\n${uploadErrorMsg}`)
        router.push('/map')
        return
      }
    }
    
    // Успешное создание
    console.log('✅ Запрос успешно создан!')
    alert('✅ Запрос успешно создан!')
    router.push('/map')
    
  } catch (err) {
    console.error('Error creating request:', err)
    
    // Обработка различных типов ошибок
    if (err.response?.status === 401) {
      error.value = 'Сессия истекла. Пожалуйста, войдите заново.'
      // Перенаправляем на страницу входа
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (err.response?.status === 400) {
      error.value = err.response?.data?.error || 'Некорректные данные запроса'
    } else if (err.response?.status >= 500) {
      error.value = 'Ошибка сервера. Попробуйте позже.'
    } else {
      error.value = err.response?.data?.message || err.message || 'Ошибка создания запроса'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>