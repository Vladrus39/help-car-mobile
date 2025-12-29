<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
      :class="show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
      @click.stop
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xl sm:text-2xl">{{ getProblemIcon(notification.problemType) }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-bold">
                Новая заявка!
              </h3>
              <router-link 
                :to="`/user/${notification.user.id}`"
                class="text-xs sm:text-sm opacity-90 hover:opacity-100 hover:underline truncate block"
              >
                {{ notification.user.full_name }}
              </router-link>
            </div>
          </div>
          <button 
            class="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition flex-shrink-0"
            @click="decline"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3 sm:p-4">
        <!-- Problem Type & Amount -->
        <div class="flex items-center justify-between mb-2 sm:mb-3">
          <span class="text-base sm:text-lg font-semibold text-gray-800">
            {{ getProblemLabel(notification.problemType) }}
          </span>
          <span class="text-xl sm:text-2xl font-bold text-green-600">
            {{ notification.amount }}₽
          </span>
        </div>

        <!-- Description -->
        <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
          {{ notification.description }}
        </p>

        <!-- Location -->
        <div class="flex items-center text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
          <span class="mr-1 sm:mr-2">📍</span>
          <span class="truncate">{{ notification.address }}</span>
        </div>

        <!-- Created time -->
        <div class="flex items-center text-xs text-gray-400 mb-2 sm:mb-4">
          <span class="mr-1 sm:mr-2">🕒</span>
          <span>{{ formatDate(notification.created_at) }}</span>
        </div>

        <!-- Distance -->
        <div
          v-if="notification.distance"
          class="flex items-center text-xs sm:text-sm text-blue-600 mb-2 sm:mb-4"
        >
          <span class="mr-1 sm:mr-2">🚗</span>
          <span>{{ notification.distance }} км от вас</span>
        </div>

        <!-- User Rating -->
        <div class="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
          <span class="mr-1 sm:mr-2">⭐</span>
          <span>Рейтинг: {{ notification.user.rating }}/5</span>
        </div>

        <!-- Timer -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
          <div class="flex items-center justify-between">
            <span class="text-xs sm:text-sm text-red-600 font-medium">Время:</span>
            <span class="text-base sm:text-lg font-bold text-red-600">{{ timeLeft }}с</span>
          </div>
          <div class="w-full bg-red-200 rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
            <div 
              class="bg-red-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${(timeLeft / 30) * 100}%` }"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2 sm:space-x-3">
          <button 
            class="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-200 transition"
            @click="decline"
          >
            Отклонить
          </button>
          <button 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg"
            @click="accept"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiService } from '@/services/api'
import { useRequestHelpers } from '@/composables/useRequestHelpers'

const { formatDate } = useRequestHelpers()

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['accept', 'decline', 'close'])

const timeLeft = ref(30)
let timer = null

onMounted(() => {
  if (props.show) {
    startTimer()
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function startTimer() {
  timeLeft.value = 30
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      decline()
    }
  }, 1000)
}

function getProblemIcon(type) {
  const icons = {
    battery: '🔋',
    fuel: '⛽',
    tire: '🛞',
    towing: '🚗',
    other: '🔧'
  }
  return icons[type] || '🔧'
}

function getProblemLabel(type) {
  const labels = {
    battery: 'Севшая батарея',
    fuel: 'Закончилось топливо',
    tire: 'Прокол колеса',
    towing: 'Нужна буксировка',
    other: 'Другое'
  }
  return labels[type] || 'Другое'
}

async function accept() {
  try {
    await apiService.acceptHelpRequest(props.notification.helpRequestId)
    emit('accept', props.notification)
    emit('close')
  } catch (error) {
    console.error('Error accepting request:', error)
    alert('Ошибка при принятии заявки')
  }
}

function decline() {
  emit('decline', props.notification)
  emit('close')
}

function handleBackdropClick() {
  // Не закрываем при клике на backdrop для уведомлений
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>