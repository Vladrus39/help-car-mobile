<template>
  <header class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg relative z-[2000]">
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.2) 40px, rgba(255,255,255,0.2) 50px);"
    />
    
    <div class="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between relative z-10">
      <router-link
        to="/map"
        class="flex items-center space-x-2 hover:opacity-80 transition"
      >
        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
          <svg
            class="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
          </svg>
        </div>
        <span class="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">Help Car</span>
      </router-link>

      <nav class="flex items-center space-x-1 sm:space-x-2">
        <!-- Переключатель темы -->
        <button
          class="flex px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm font-bold items-center gap-1"
          :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
          @click="toggleDarkMode"
        >
          <svg
            v-if="isDark"
            class="w-4 h-4 sm:w-5 sm:h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
          <svg
            v-else
            class="w-4 h-4 sm:w-5 sm:h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10 10 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="hidden lg:inline text-sm">{{ isDark ? 'Светлая' : 'Темная' }}</span>
        </button>
        
        <!-- Мобильная версия - ссылка на профиль -->
        <router-link 
          to="/profile" 
          class="md:hidden px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white bg-blue-500/80 hover:bg-blue-600 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm font-bold flex items-center gap-1"
          title="Личный кабинет"
        >
          <span class="text-sm">👤</span>
          <span class="hidden sm:inline text-sm">Профиль</span>
        </router-link>
        
        <div class="hidden md:block">
          <QuickNav />
        </div>
        
        <button 
          class="px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-sm sm:text-base text-white bg-red-500/80 hover:bg-red-600 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm font-bold flex items-center gap-1" 
          title="Выйти"
          @click="handleLogout"
        >
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span class="hidden lg:inline text-sm">Выйти</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import QuickNav from '@/components/QuickNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleDarkMode } = useDarkMode()

const handleLogout = async () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>