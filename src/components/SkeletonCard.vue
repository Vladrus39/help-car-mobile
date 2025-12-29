<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
    <!-- Header -->
    <div class="flex items-start justify-between mb-5">
      <div class="flex-1">
        <div class="h-7 bg-gray-200 rounded w-3/4 mb-3" />
        <div class="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div class="h-8 w-24 bg-gray-200 rounded-xl" />
    </div>

    <!-- Content -->
    <div class="space-y-2 mb-5">
      <div class="h-4 bg-gray-200 rounded w-full" />
      <div class="h-4 bg-gray-200 rounded w-5/6" />
      <div class="h-4 bg-gray-200 rounded w-4/6" />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="h-8 bg-gray-200 rounded w-32" />
      <div class="h-10 bg-gray-200 rounded-lg w-28" />
    </div>
  </div>
</template>

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

