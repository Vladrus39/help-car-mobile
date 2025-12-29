<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
      <!-- Заголовок -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg
            class="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Оцените помощь
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Как вам помог <span class="font-semibold">{{ helperName }}</span>?
        </p>
      </div>

      <!-- Рейтинг звёзд -->
      <div class="flex justify-center gap-2 mb-6">
        <button
          v-for="star in 5"
          :key="star"
          class="transform transition-all hover:scale-125 focus:outline-none"
          @click="rating = star"
          @mouseenter="hoverRating = star"
          @mouseleave="hoverRating = 0"
        >
          <svg
            class="w-12 h-12"
            :class="star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      <!-- Текстовый отзыв -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Комментарий (необязательно)
        </label>
        <textarea
          v-model="comment"
          rows="4"
          placeholder="Поделитесь впечатлениями о помощи..."
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
      </div>

      <!-- Быстрые теги (опционально) -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Отметки
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in quickTags"
            :key="tag"
            class="px-3 py-1.5 text-sm rounded-full border transition"
            :class="selectedTags.includes(tag) 
              ? 'bg-yellow-100 border-yellow-400 text-yellow-700' 
              : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex gap-3">
        <button
          class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition"
          @click="close"
        >
          Отмена
        </button>
        <button
          :disabled="rating === 0 || isSaving"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          @click="submitRating"
        >
          <svg
            v-if="isSaving"
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
          <span>{{ isSaving ? 'Отправка...' : 'Отправить оценку' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiService } from '@/services/api'
import soundService from '@/services/soundService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  helpRequestId: {
    type: String,
    required: true
  },
  helperId: {
    type: String,
    required: true
  },
  helperName: {
    type: String,
    default: 'Помощник'
  }
})

const emit = defineEmits(['close', 'rated'])

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const selectedTags = ref([])
const isSaving = ref(false)

const quickTags = [
  '👍 Быстро',
  '💬 Вежливо',
  '🔧 Профессионально',
  '💰 Доступно',
  '⭐ Рекомендую'
]

// Сброс формы при открытии
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    rating.value = 0
    hoverRating.value = 0
    comment.value = ''
    selectedTags.value = []
  }
})

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const submitRating = async () => {
  if (rating.value === 0) {
    alert('Пожалуйста, выберите оценку')
    return
  }

  isSaving.value = true
  
  try {
    // Правильный вызов API: createRating(requestId, data)
    const response = await apiService.createRating(props.helpRequestId, {
      rating: rating.value,
      comment: selectedTags.value.length > 0 
        ? (comment.value ? `${comment.value} | ${selectedTags.value.join(', ')}` : selectedTags.value.join(', '))
        : (comment.value || null)
    })

    // axios возвращает response.data
    if (response.data?.success) {
      soundService.playSuccess()
      emit('rated', {
        rating: rating.value,
        comment: comment.value,
        tags: selectedTags.value
      })
      close()
    } else {
      throw new Error(response.data?.message || 'Ошибка отправки оценки')
    }
  } catch (error) {
    console.error('Ошибка отправки рейтинга:', error)
    alert(error.response?.data?.message || error.message || 'Не удалось отправить оценку. Попробуйте позже.')
  } finally {
    isSaving.value = false
  }
}

const close = () => {
  emit('close')
}
</script>
