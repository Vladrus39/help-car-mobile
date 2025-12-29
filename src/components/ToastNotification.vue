<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'p-4 rounded-2xl shadow-2xl backdrop-blur-sm pointer-events-auto transition-all duration-300',
          getToastClass(toast.type)
        ]"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0">{{ getIcon(toast.type) }}</span>
          <div class="flex-1 min-w-0">
            <p
              v-if="toast.title"
              class="font-bold text-sm mb-1"
            >
              {{ toast.title }}
            </p>
            <p class="text-sm break-words">
              {{ toast.message }}
            </p>
          </div>
          <button
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition text-lg"
            @click="removeToast(toast.id)"
          >
            ✕
          </button>
        </div>
        <!-- Прогресс бар -->
        <div
          v-if="toast.duration"
          class="mt-2 h-1 bg-white/20 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-white/50 rounded-full transition-all duration-100"
            :style="{ width: `${toast.progress}%` }"
          />
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const toasts = ref([])
let toastId = 0

function addToast({ type = 'info', title = '', message, duration = 5000 }) {
  const id = ++toastId
  const toast = {
    id,
    type,
    title,
    message,
    duration,
    progress: 100
  }
  
  toasts.value.push(toast)
  
  if (duration > 0) {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      toast.progress = Math.max(0, 100 - (elapsed / duration) * 100)
      
      if (elapsed >= duration) {
        clearInterval(interval)
        removeToast(id)
      }
    }, 50)
    
    toast.intervalId = interval
  }
  
  return id
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    const toast = toasts.value[index]
    if (toast.intervalId) {
      clearInterval(toast.intervalId)
    }
    toasts.value.splice(index, 1)
  }
}

function getToastClass(type) {
  switch (type) {
    case 'success':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    case 'error':
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
    case 'warning':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
    case 'info':
    default:
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  }
}

function getIcon(type) {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'warning': return '⚠️'
    case 'info':
    default: return 'ℹ️'
  }
}

onUnmounted(() => {
  toasts.value.forEach(t => {
    if (t.intervalId) clearInterval(t.intervalId)
  })
})

// Экспортируем функции
defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
