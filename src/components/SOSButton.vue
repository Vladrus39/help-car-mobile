<template>
  <div>
    <!-- Плавающая SOS кнопка -->
    <button
      v-if="authStore.isLoggedIn"
      class="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:from-red-600 hover:to-red-800 transition-all transform hover:scale-110 animate-pulse-slow"
      title="Экстренный вызов помощи"
      @click="showSOSModal = true"
    >
      <div class="text-center">
        <div class="text-2xl sm:text-3xl font-black">
          SOS
        </div>
      </div>
      <!-- Пульсирующий эффект -->
      <span class="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
    </button>

    <!-- SOS модальное окно -->
    <div
      v-if="showSOSModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="showSOSModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform animate-slide-up">
        <!-- Заголовок -->
        <div class="text-center mb-6">
          <div class="text-6xl mb-3">
            🆘
          </div>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white">
            Экстренная помощь
          </h2>
          <p class="text-gray-500 text-sm mt-2">
            Выберите тип проблемы для быстрого вызова
          </p>
        </div>

        <!-- Быстрые кнопки -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('battery')"
          >
            <div class="text-3xl mb-1">
              🔋
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Сел аккумулятор
            </div>
          </button>

          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('fuel')"
          >
            <div class="text-3xl mb-1">
              ⛽
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Закончился бензин
            </div>
          </button>

          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('tire')"
          >
            <div class="text-3xl mb-1">
              🛞
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Пробито колесо
            </div>
          </button>

          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('towing')"
          >
            <div class="text-3xl mb-1">
              🚗
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Нужна буксировка
            </div>
          </button>

          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('road_conflict')"
          >
            <div class="text-3xl mb-1">
              🚨
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Конфликт на дороге
            </div>
          </button>

          <button
            :disabled="isCreating"
            class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition transform hover:scale-105"
            @click="quickRequest('other')"
          >
            <div class="text-3xl mb-1">
              🔧
            </div>
            <div class="font-bold text-gray-800 text-sm">
              Другая проблема
            </div>
          </button>
        </div>

        <!-- Статус создания -->
        <div
          v-if="isCreating"
          class="text-center py-4"
        >
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
          <p class="mt-2 text-gray-600">
            Определяем местоположение...
          </p>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            @click="showSOSModal = false"
          >
            Отмена
          </button>
          <router-link
            to="/create-request"
            class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center"
            @click="showSOSModal = false"
          >
            Подробная заявка
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const showSOSModal = ref(false)
const isCreating = ref(false)

const quickRequest = async (problemType) => {
  try {
    isCreating.value = true
    
    // Получаем геолокацию
    let latitude = 55.7558
    let longitude = 37.6173
    let address = 'Москва'
    
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        })
        latitude = position.coords.latitude
        longitude = position.coords.longitude
        
        // Получаем адрес
        try {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`
          )
          const geoData = await geoResponse.json()
          if (geoData.display_name) {
            address = geoData.display_name.split(',').slice(0, 3).join(',')
          }
        } catch (e) {
          console.warn('Не удалось получить адрес')
        }
      } catch (geoError) {
        console.warn('Геолокация недоступна:', geoError)
        alert('Не удалось определить местоположение. Пожалуйста, создайте заявку вручную.')
        router.push('/create-request')
        return
      }
    }
    
    // Создаем заявку
    const problemLabels = {
      battery: 'Срочно! Сел аккумулятор',
      fuel: 'Срочно! Закончилось топливо',
      tire: 'Срочно! Пробито колесо',
      towing: 'Срочно! Нужна буксировка',
      road_conflict: 'Срочно! Конфликт на дороге',
      other: 'Срочно! Нужна помощь'
    }
    
    const response = await apiService.createHelpRequest({
      problem_type: problemType,
      description: problemLabels[problemType] + ' (создано через SOS)',
      address: address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      is_urgent: true
    })
    
    if (response.success) {
      showSOSModal.value = false
      alert('✅ Заявка создана! Ожидайте откликов.')
      router.push('/my-requests')
    } else {
      throw new Error(response.message || 'Ошибка создания заявки')
    }
  } catch (error) {
    console.error('Ошибка создания SOS-заявки:', error)
    alert('Не удалось создать заявку: ' + (error.message || 'Неизвестная ошибка'))
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
