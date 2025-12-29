<template>
  <teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300',
          'flex items-center gap-4 min-w-[320px] max-w-md',
          getToastClass(toast.type)
        ]"
        @click="removeToast(toast.id)"
      >
        <!-- Иконка -->
        <div class="flex-shrink-0 text-3xl">
          {{ getIcon(toast.type) }}
        </div>
        
        <!-- Контент -->
        <div class="flex-1">
          <h4
            v-if="toast.title"
            class="font-black text-lg mb-1"
          >
            {{ toast.title }}
          </h4>
          <p class="text-sm leading-relaxed">
            {{ toast.message }}
          </p>
        </div>
        
        <!-- Кнопка закрытия -->
        <button 
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition"
          @click.stop="removeToast(toast.id)"
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
        
        <!-- Прогресс-бар -->
        <div 
          v-if="toast.duration"
          class="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-2xl transition-all ease-linear"
          :style="{ width: `${getProgress(toast)}%`, transitionDuration: `${toast.duration}ms` }"
        />
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function getToastClass(type) {
  const classes = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    default: 'bg-white text-gray-900 border-2 border-gray-200'
  }
  return classes[type] || classes.default
}

function getIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    default: '💬'
  }
  return icons[type] || icons.default
}

function getProgress(toast) {
  if (!toast.createdAt || !toast.duration) return 100
  const elapsed = Date.now() - toast.createdAt
  return Math.max(0, 100 - (elapsed / toast.duration * 100))
}
</script>

<style scoped>
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}
</style>

