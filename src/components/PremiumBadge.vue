<template>
  <span 
    v-if="status" 
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
    :class="badgeClass"
    :title="title"
  >
    <span class="text-sm">{{ icon }}</span>
    <span v-if="showLabel">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: null,
    validator: (value) => [null, 'bronze', 'silver', 'gold'].includes(value)
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  }
})

const config = computed(() => {
  switch (props.status) {
    case 'gold':
      return {
        icon: '🥇',
        label: 'Золотой',
        title: 'Золотой статус - VIP помощник',
        bgClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        textClass: 'text-yellow-900',
        borderClass: 'ring-2 ring-yellow-300 ring-offset-1',
        glowClass: 'shadow-lg shadow-yellow-400/50'
      }
    case 'silver':
      return {
        icon: '🥈',
        label: 'Серебряный',
        title: 'Серебряный статус - Проверенный помощник',
        bgClass: 'bg-gradient-to-r from-gray-300 to-gray-400',
        textClass: 'text-gray-800',
        borderClass: 'ring-2 ring-gray-300 ring-offset-1',
        glowClass: 'shadow-md shadow-gray-400/40'
      }
    case 'bronze':
      return {
        icon: '🥉',
        label: 'Бронзовый',
        title: 'Бронзовый статус - Надёжный помощник',
        bgClass: 'bg-gradient-to-r from-orange-400 to-orange-500',
        textClass: 'text-orange-900',
        borderClass: 'ring-2 ring-orange-300 ring-offset-1',
        glowClass: 'shadow-md shadow-orange-400/40'
      }
    default:
      return null
  }
})

const icon = computed(() => config.value?.icon || '')
const label = computed(() => config.value?.label || '')
const title = computed(() => config.value?.title || '')

const badgeClass = computed(() => {
  if (!config.value) return ''
  
  const sizeClasses = {
    xs: 'text-xs px-1 py-0',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  
  return [
    config.value.bgClass,
    config.value.textClass,
    config.value.borderClass,
    config.value.glowClass,
    sizeClasses[props.size]
  ].join(' ')
})
</script>

<style scoped>
/* Анимация свечения для золотого статуса */
@keyframes gold-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
  50% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.8); }
}

[class*="from-yellow"] {
  animation: gold-glow 2s ease-in-out infinite;
}
</style>
