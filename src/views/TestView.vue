<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-white">
    <div class="text-center p-12">
      <h1 class="text-8xl font-black mb-8">
        ✅ РАБОТАЕТ!
      </h1>
      <p class="text-4xl font-bold mb-8">
        Новый дизайн загружен успешно
      </p>
      <router-link
        to="/"
        class="inline-block px-12 py-6 bg-white text-blue-600 text-2xl font-black rounded-2xl hover:scale-110 transition-all"
      >
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>

<script setup>
console.log('✅ TestView загружен - новый дизайн работает!')
</script>

