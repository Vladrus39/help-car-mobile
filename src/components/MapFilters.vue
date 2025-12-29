<template>
  <div class="bg-white rounded-2xl shadow-xl p-6 space-y-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-black text-gray-900">
        🔍 Фильтры
      </h3>
      <button 
        class="text-sm text-blue-600 hover:text-blue-700 font-bold" 
        @click="resetFilters"
      >
        Сбросить
      </button>
    </div>

    <!-- Тип проблемы -->
    <div>
      <label class="block text-sm font-bold text-gray-700 mb-2">Тип проблемы</label>
      <select 
        v-model="localFilters.problemType"
        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <option value="">
          Все типы
        </option>
        <option value="battery">
          🔋 Севшая батарея
        </option>
        <option value="fuel">
          ⛽ Закончилось топливо
        </option>
        <option value="tire">
          🛞 Прокол колеса
        </option>
        <option value="towing">
          🚗 Буксировка
        </option>
        <option value="road_conflict">
          🚨 Конфликт на дороге
        </option>
        <option value="other">
          🔧 Другое
        </option>
      </select>
    </div>

    <!-- Радиус поиска -->
    <div>
      <label class="block text-sm font-bold text-gray-700 mb-2">
        Радиус поиска: <span class="text-blue-600">{{ localFilters.radius }} км</span>
      </label>
      <div class="px-2">
        <input 
          v-model.number="localFilters.radius"
          type="range" 
          min="1" 
          max="500" 
          step="5"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
        >
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1 px-2">
        <span>1 км</span>
        <span>100 км</span>
        <span>250 км</span>
        <span>500 км</span>
      </div>
    </div>

    <!-- Цена -->
    <div>
      <label class="block text-sm font-bold text-gray-700 mb-2">Цена</label>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <input 
            v-model.number="localFilters.minAmount"
            type="number" 
            placeholder="От" 
            min="0"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <input 
            v-model.number="localFilters.maxAmount"
            type="number" 
            placeholder="До" 
            max="100000"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Сортировка -->
    <div>
      <label class="block text-sm font-bold text-gray-700 mb-2">Сортировка</label>
      <select 
        v-model="localFilters.sortBy"
        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <option value="distance">
          📍 По расстоянию
        </option>
        <option value="amount_desc">
          💰 Сначала дорогие
        </option>
        <option value="amount_asc">
          💰 Сначала дешевые
        </option>
        <option value="created_desc">
          🕐 Сначала новые
        </option>
        <option value="created_asc">
          🕐 Сначала старые
        </option>
      </select>
    </div>

    <!-- Показывать только с откликами -->
    <div class="flex items-center gap-3">
      <input 
        id="with-responses"
        v-model="localFilters.withResponses" 
        type="checkbox"
        class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      >
      <label
        for="with-responses"
        class="text-sm font-bold text-gray-700 cursor-pointer"
      >
        Только с откликами
      </label>
    </div>

    <!-- Кнопка применить -->
    <button 
      class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-xl"
      @click="applyFilters"
    >
      Применить фильтры
    </button>

    <!-- Счетчик результатов -->
    <div class="text-center text-sm text-gray-500 font-semibold">
      Найдено: {{ resultsCount }} запросов
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  resultsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update', 'apply'])

const localFilters = ref({
  problemType: props.filters.problemType || '',
  radius: props.filters.radius || 10,
  minAmount: props.filters.minAmount || null,
  maxAmount: props.filters.maxAmount || null,
  sortBy: props.filters.sortBy || 'distance',
  withResponses: props.filters.withResponses || false
})

// Автоматическое применение при изменении
watch(localFilters, (newFilters) => {
  emit('update', newFilters)
}, { deep: true })

function applyFilters() {
  emit('apply', localFilters.value)
}

function resetFilters() {
  localFilters.value = {
    problemType: '',
    radius: 10,
    minAmount: null,
    maxAmount: null,
    sortBy: 'distance',
    withResponses: false
  }
  applyFilters()
}
</script>

<style scoped>
/* Стили для ползунка range - корректное отображение на мобильных */
.slider-blue {
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
}

/* Webkit (Chrome, Safari, Edge) */
.slider-blue::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -6px;
}

.slider-blue::-webkit-slider-thumb:hover {
  background: #1d4ed8;
  transform: scale(1.1);
}

.slider-blue::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

/* Firefox */
.slider-blue::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-blue::-moz-range-thumb:hover {
  background: #1d4ed8;
}

/* Firefox track */
.slider-blue::-moz-range-track {
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
}

/* Focus styles */
.slider-blue:focus {
  outline: none;
}

.slider-blue:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}
</style>
