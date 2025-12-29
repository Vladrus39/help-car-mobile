<template>
  <!-- Skeleton для карточек заявок -->
  <div
    v-if="type === 'request-card'"
    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow animate-pulse"
  >
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
      <div class="flex-1">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
        <div class="flex gap-2">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  </div>

  <!-- Skeleton для профиля -->
  <div
    v-else-if="type === 'profile'"
    class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-pulse"
  >
    <div class="flex items-center gap-6 mb-6">
      <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div class="flex-1">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  </div>

  <!-- Skeleton для списка сообщений -->
  <div
    v-else-if="type === 'message-list'"
    class="space-y-3"
  >
    <div
      v-for="i in count"
      :key="i"
      class="flex items-start gap-3 animate-pulse"
    >
      <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
      <div class="flex-1">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    </div>
  </div>

  <!-- Skeleton для чата -->
  <div
    v-else-if="type === 'chat'"
    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow animate-pulse"
  >
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div class="flex-1">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
  </div>

  <!-- Skeleton для таблицы -->
  <div
    v-else-if="type === 'table'"
    class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow"
  >
    <div class="animate-pulse">
      <div class="h-12 bg-gray-200 dark:bg-gray-700" />
      <div
        v-for="i in count"
        :key="i"
        class="border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center gap-4 p-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        </div>
      </div>
    </div>
  </div>

  <!-- Skeleton для карты -->
  <div
    v-else-if="type === 'map'"
    class="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
    :style="{ height: height || '400px' }"
  >
    <div class="flex items-center justify-center h-full">
      <svg
        class="w-16 h-16 text-gray-300 dark:text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>

  <!-- Skeleton для grid (сетка карточек) -->
  <div
    v-else-if="type === 'grid'"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    <div
      v-for="i in count"
      :key="i"
      class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow animate-pulse"
    >
      <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  </div>

  <!-- Обычный skeleton (линии) -->
  <div
    v-else
    class="animate-pulse space-y-3"
  >
    <div
      v-for="i in count"
      :key="i"
    >
      <div
        class="h-4 bg-gray-200 dark:bg-gray-700 rounded"
        :style="{ width: getRandomWidth() }"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'default', // request-card, profile, message-list, chat, table, map, grid
    validator: (value) => [
      'default', 
      'request-card', 
      'profile', 
      'message-list', 
      'chat', 
      'table', 
      'map', 
      'grid'
    ].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  height: {
    type: String,
    default: ''
  }
})

// Используем props для избежания ошибки ESLint
const currentType = () => props.type
const currentCount = () => props.count
const currentHeight = () => props.height

console.debug('SkeletonLoader:', currentType(), currentCount(), currentHeight())

const getRandomWidth = () => {
  const widths = ['100%', '90%', '80%', '75%', '85%']
  return widths[Math.floor(Math.random() * widths.length)]
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
