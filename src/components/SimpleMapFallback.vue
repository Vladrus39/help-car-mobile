<template>
  <div class="relative w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
    <!-- Fallback карта с mock данными -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-center p-8">
        <div class="text-8xl mb-6">
          🗺️
        </div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">
          Карта временно недоступна
        </h3>
        <p class="text-lg text-gray-600 mb-6 max-w-md">
          Для отображения Yandex карты нужен API ключ
        </p>
        
        <!-- Инструкция -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left max-w-xl">
          <h4 class="font-black text-xl mb-3">
            📋 Как исправить:
          </h4>
          <ol class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start">
              <span class="font-bold mr-2">1.</span>
              <span><strong>Отключите AdBlock</strong> на этой странице</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">2.</span>
              <span>Попробуйте <strong>режим инкогнито</strong> (Ctrl+Shift+N)</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">3.</span>
              <span>Получите <strong>бесплатный API ключ</strong> на 
                <a
                  href="https://developer.tech.yandex.ru/"
                  target="_blank"
                  class="text-blue-600 hover:underline font-bold"
                >
                  developer.tech.yandex.ru
                </a>
              </span>
            </li>
          </ol>
        </div>

        <!-- Mock запросы -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-xl">
          <h4 class="font-black text-xl mb-3">
            📍 Активные запросы рядом:
          </h4>
          <div class="space-y-3">
            <div 
              v-for="request in mockRequests" 
              :key="request.id"
              class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
            >
              <div class="flex items-center space-x-3">
                <div class="text-3xl">
                  {{ request.icon }}
                </div>
                <div class="text-left">
                  <div class="font-bold text-gray-900">
                    {{ request.title }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ request.distance }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-black text-2xl text-green-600">
                  {{ request.amount }}₽
                </div>
                <button class="mt-1 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition">
                  Откликнуться
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка перезагрузки -->
        <button 
          class="mt-6 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black text-lg hover:from-blue-600 hover:to-purple-600 transition shadow-xl"
          @click="reloadPage"
        >
          🔄 Попробовать снова
        </button>
      </div>
    </div>

    <!-- Контролы (заглушка) -->
    <div class="absolute top-4 right-4 flex flex-col space-y-2">
      <button
        disabled
        class="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center cursor-not-allowed opacity-50"
      >
        <span class="text-2xl">+</span>
      </button>
      <button
        disabled
        class="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center cursor-not-allowed opacity-50"
      >
        <span class="text-2xl">−</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mockRequests = ref([
  { id: '1', icon: '🔋', title: 'Севшая батарея', amount: 500, distance: '1.2 км от вас' },
  { id: '2', icon: '⛽', title: 'Закончилось топливо', amount: 300, distance: '2.5 км от вас' },
  { id: '3', icon: '🛞', title: 'Прокол колеса', amount: 400, distance: '800 м от вас' }
])

function reloadPage() {
  window.location.reload()
}
</script>

