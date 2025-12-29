<template>
  <nav 
    class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom z-[1500] transition-all duration-200"
    role="navigation"
    aria-label="Мобильная навигация"
  >
    <div class="grid grid-cols-5 h-16">
      <!-- Главная -->
      <router-link 
        to="/dashboard" 
        class="flex flex-col items-center justify-center gap-0.5 transition-all"
        :class="isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center transition-all', isActive('/dashboard') ? 'bg-blue-100 dark:bg-blue-900/30' : '']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </div>
        <span class="text-[10px] font-semibold">Главная</span>
      </router-link>

      <!-- Карта -->
      <router-link 
        to="/map" 
        class="flex flex-col items-center justify-center gap-0.5 transition-all"
        :class="isActive('/map') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center transition-all', isActive('/map') ? 'bg-blue-100 dark:bg-blue-900/30' : '']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <span class="text-[10px] font-semibold">Карта</span>
      </router-link>

      <!-- SOS (центральная кнопка) -->
      <router-link 
        to="/create-request" 
        class="flex flex-col items-center justify-center -mt-5"
      >
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
          <div class="relative w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          </div>
        </div>
        <span class="text-[10px] font-bold text-gray-600 dark:text-gray-300 mt-1.5">Помощь</span>
      </router-link>

      <!-- Чаты -->
      <router-link 
        to="/my-chats" 
        class="flex flex-col items-center justify-center gap-0.5 transition-all relative"
        :class="isActive('/my-chats') || isActive('/messages') || isActive('/global-chat') || isActive('/city-chats') || isActive('/chat/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center transition-all relative', isActive('/my-chats') || isActive('/chat/') ? 'bg-blue-100 dark:bg-blue-900/30' : '']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span 
            v-if="totalUnread > 0" 
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            {{ totalUnread > 9 ? '9+' : totalUnread }}
          </span>
        </div>
        <span class="text-[10px] font-semibold">Чаты</span>
      </router-link>

      <!-- Профиль -->
      <router-link 
        to="/profile" 
        class="flex flex-col items-center justify-center gap-0.5 transition-all"
        :class="isActive('/profile') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center transition-all', isActive('/profile') ? 'bg-blue-100 dark:bg-blue-900/30' : '']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <span class="text-[10px] font-semibold">Профиль</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useInvitationsStore } from '@/stores/invitations'

const route = useRoute()
const invitationsStore = useInvitationsStore()

const isActive = (path) => {
  return route.path.startsWith(path)
}

// Общее количество непрочитанных (можно расширить)
const totalUnread = computed(() => {
  return invitationsStore.pendingCount || 0
})
</script>

<style scoped>
/* Safe area для iOS */
@supports(padding: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Активная ссылка */
.router-link-active {
  color: rgb(37 99 235);
}

:global(.dark) .router-link-active {
  color: rgb(96 165 250);
}
</style>
