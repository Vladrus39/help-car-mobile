<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        @input="handleInput"
        @focus="showSuggestions = true"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectSuggestion(selectedIndex)"
        @keydown.esc="showSuggestions = false"
      >
      <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg
          v-if="!isLoading"
          class="w-5 h-5"
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
        <svg
          v-else
          class="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <button
        v-if="searchQuery"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="clearSearch"
      >
        <svg
          class="w-5 h-5"
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

    <!-- Dropdown с подсказками -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition border-b border-gray-100 dark:border-gray-700 last:border-0"
        :class="{ 'bg-blue-50 dark:bg-gray-700': selectedIndex === index }"
        @click="selectSuggestion(index)"
        @mouseenter="selectedIndex = index"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
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
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ suggestion.display_name }}
            </div>
            <div
              v-if="suggestion.address"
              class="text-xs text-gray-500 dark:text-gray-400 mt-1"
            >
              {{ formatAddress(suggestion.address) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка определения текущего местоположения -->
    <button
      v-if="showCurrentLocationBtn"
      :disabled="isGettingLocation"
      class="mt-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
      :class="{ 'opacity-50 cursor-not-allowed': isGettingLocation }"
      @click="getCurrentLocation"
    >
      <svg
        v-if="!isGettingLocation"
        class="w-5 h-5"
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
      <svg
        v-else
        class="w-5 h-5 animate-spin"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ isGettingLocation ? 'Определяю...' : 'Моё текущее местоположение' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Введите адрес или город...'
  },
  showCurrentLocationBtn: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const searchQuery = ref(props.modelValue)
const suggestions = ref([])
const showSuggestions = ref(false)
const isLoading = ref(false)
const isGettingLocation = ref(false)
const selectedIndex = ref(0)
let searchTimeout = null

watch(() => props.modelValue, (newVal) => {
  searchQuery.value = newVal
})

const handleInput = () => {
  emit('update:modelValue', searchQuery.value)
  
  // Debounce search
  clearTimeout(searchTimeout)
  
  if (searchQuery.value.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchAddress()
  }, 500)
}

const searchAddress = async () => {
  if (!searchQuery.value || searchQuery.value.length < 3) return
  
  isLoading.value = true
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(searchQuery.value)}&` +
      `addressdetails=1&` +
      `limit=10&` +
      `accept-language=ru`
    )
    
    const data = await response.json()
    suggestions.value = data
    showSuggestions.value = data.length > 0
    selectedIndex.value = 0
  } catch (error) {
    console.error('Ошибка поиска адреса:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

const selectSuggestion = (index) => {
  if (index < 0 || index >= suggestions.value.length) return
  
  const suggestion = suggestions.value[index]
  searchQuery.value = suggestion.display_name
  
  emit('update:modelValue', suggestion.display_name)
  emit('select', {
    address: suggestion.display_name,
    latitude: parseFloat(suggestion.lat),
    longitude: parseFloat(suggestion.lon),
    addressDetails: suggestion.address
  })
  
  showSuggestions.value = false
  suggestions.value = []
}

const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    alert('Геолокация не поддерживается вашим браузером')
    return
  }
  
  isGettingLocation.value = true
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })
    
    const { latitude, longitude } = position.coords
    
    // Обратный геокодинг
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `addressdetails=1&` +
      `accept-language=ru`
    )
    
    const data = await response.json()
    
    if (data && data.display_name) {
      searchQuery.value = data.display_name
      
      emit('update:modelValue', data.display_name)
      emit('select', {
        address: data.display_name,
        latitude: latitude,
        longitude: longitude,
        addressDetails: data.address
      })
    }
  } catch (error) {
    console.error('Ошибка определения местоположения:', error)
    alert('Не удалось определить ваше местоположение. Проверьте разрешения браузера.')
  } finally {
    isGettingLocation.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
  emit('update:modelValue', '')
}

const navigateDown = () => {
  if (selectedIndex.value < suggestions.value.length - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const formatAddress = (address) => {
  const parts = []
  if (address.road) parts.push(address.road)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

// Закрыть при клике вне компонента
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showSuggestions.value = false
    }
  })
}
</script>
