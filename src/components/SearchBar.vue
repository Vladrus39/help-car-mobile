<template>
  <div class="relative">
    <!-- Поле поиска -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Поиск по адресу, описанию, городу..."
        class="w-full px-5 py-4 pl-12 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg"
        @input="handleSearch"
        @focus="showResults = true"
      >
      
      <!-- Иконка поиска -->
      <svg
        class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      
      <!-- Кнопка очистки -->
      <button
        v-if="searchQuery"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        @click="clearSearch"
      >
        <svg
          class="w-5 h-5 text-gray-400"
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

    <!-- Результаты поиска -->
    <transition name="dropdown">
      <div
        v-if="showResults && (searchResults.length > 0 || searchQuery)"
        class="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-gray-100 max-h-96 overflow-y-auto z-50"
      >
        <div
          v-if="isSearching"
          class="p-6 text-center"
        >
          <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p class="mt-2 text-gray-600">
            Поиск...
          </p>
        </div>

        <div
          v-else-if="searchResults.length === 0 && searchQuery"
          class="p-6 text-center"
        >
          <p class="text-gray-500">
            Ничего не найдено
          </p>
          <p class="text-sm text-gray-400 mt-1">
            Попробуйте другой запрос
          </p>
        </div>

        <div
          v-else
          class="divide-y divide-gray-100"
        >
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="w-full text-left p-4 hover:bg-blue-50 transition-colors"
            @click="selectResult(result)"
          >
            <div class="flex items-start gap-3">
              <!-- Иконка типа -->
              <div class="text-2xl flex-shrink-0">
                {{ getIcon(result.problem_type) }}
              </div>
              
              <!-- Информация -->
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 truncate">
                  {{ result.description }}
                </h4>
                <p class="text-sm text-gray-600 truncate">
                  📍 {{ result.address }}
                </p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-sm font-bold text-green-600">💰 {{ result.amount }} ₽</span>
                  <span
                    v-if="result.distance"
                    class="text-xs text-gray-500"
                  >{{ result.distance }} км</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PROBLEM_ICONS } from '@/constants'

const props = defineProps({
  requests: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'search'])

const searchQuery = ref('')
const showResults = ref(false)
const isSearching = ref(false)
const searchResults = ref([])
let searchTimeout = null

// Поиск с debounce
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  
  searchTimeout = setTimeout(() => {
    performSearch()
    isSearching.value = false
  }, 300)
}

// Выполнение поиска
function performSearch() {
  const query = searchQuery.value.toLowerCase()
  
  searchResults.value = props.requests.filter(request => {
    return (
      request.description?.toLowerCase().includes(query) ||
      request.address?.toLowerCase().includes(query) ||
      request.problem_type?.toLowerCase().includes(query)
    )
  }).slice(0, 10) // Максимум 10 результатов
  
  emit('search', searchResults.value)
}

// Выбор результата
function selectResult(result) {
  emit('select', result)
  showResults.value = false
  searchQuery.value = ''
}

// Очистка поиска
function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

// Закрытие при клике вне
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showResults.value = false
  }
}

// Получить иконку типа
function getIcon(type) {
  return PROBLEM_ICONS[type] || '🔧'
}

// Наблюдение за изменением списка запросов
watch(() => props.requests, () => {
  if (searchQuery.value) {
    performSearch()
  }
}, { deep: true })

// Добавляем обработчик клика
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

