<template>
  <nav
    class="flex flex-wrap items-center gap-2"
    aria-label="Быстрая навигация"
  >
    <router-link
      to="/dashboard"
      class="qn-item"
    >
      🏠 Главная
    </router-link>
    <router-link
      to="/map"
      class="qn-item"
    >
      🗺 Карта
    </router-link>
    <router-link
      to="/create-request"
      class="qn-item"
    >
      🆘 Создать
    </router-link>
    
    <!-- Меню "Мои заявки" -->
    <div
      class="relative"
      @mouseenter="openRequests = true"
      @mouseleave="openRequests = false"
    >
      <button
        class="qn-item relative"
        aria-haspopup="menu"
        :aria-expanded="openRequests.toString()"
      >
        📤 Заявки ▾
        <span 
          v-if="pendingResponsesCount > 0" 
          class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
        >
          {{ pendingResponsesCount > 9 ? '9+' : pendingResponsesCount }}
        </span>
      </button>
      <div
        v-if="openRequests"
        class="qn-menu"
        role="menu"
      >
        <router-link
          to="/my-requests"
          class="qn-menu-item"
          role="menuitem"
        >
          📥 Мои заявки
        </router-link>
        <router-link
          to="/my-helps"
          class="qn-menu-item"
          role="menuitem"
        >
          🤝 Мои помощи
        </router-link>
        <router-link
          to="/my-responses"
          class="qn-menu-item relative"
          role="menuitem"
        >
          📤 Мои отклики
          <span 
            v-if="pendingResponsesCount > 0" 
            class="absolute top-2 right-2 w-5 h-5 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ pendingResponsesCount > 9 ? '9+' : pendingResponsesCount }}
          </span>
        </router-link>
      </div>
    </div>
    
    <!-- Меню "Чаты" -->
    <div
      class="relative"
      @mouseenter="open = true"
      @mouseleave="open = false"
    >
      <button
        class="qn-item relative"
        aria-haspopup="menu"
        :aria-expanded="open.toString()"
      >
        💬 Чаты ▾
        <span 
          v-if="unreadCount + invitationsStore.pendingCount > 0" 
          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {{ (unreadCount + invitationsStore.pendingCount) > 9 ? '9+' : unreadCount + invitationsStore.pendingCount }}
        </span>
      </button>
      <div
        v-if="open"
        class="qn-menu"
        role="menu"
      >
        <router-link
          to="/my-chats"
          class="qn-menu-item"
          role="menuitem"
        >
          💬 Чаты заявок
        </router-link>
        <router-link
          to="/messages"
          class="qn-menu-item relative"
          role="menuitem"
        >
          ✉️ Личные сообщения
          <span 
            v-if="invitationsStore.pendingCount > 0" 
            class="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ invitationsStore.pendingCount }}
          </span>
        </router-link>
        <router-link
          to="/global-chat"
          class="qn-menu-item"
          role="menuitem"
        >
          🌍 Общий чат
        </router-link>
        <router-link
          to="/city-chats"
          class="qn-menu-item"
          role="menuitem"
        >
          🏙 Чаты городов
        </router-link>
      </div>
    </div>
    <router-link
      to="/profile"
      class="qn-item"
    >
      👤 Личный кабинет
    </router-link>
    <router-link
      to="/favorites"
      class="qn-item"
    >
      ⭐ Избранные
    </router-link>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'
import { useInvitationsStore } from '@/stores/invitations'

const invitationsStore = useInvitationsStore()
const open = ref(false)
const openRequests = ref(false)
const pendingResponsesCount = ref(0)
const unreadCount = ref(0)

onMounted(async () => {
  try {
    // Загружаем количество ожидающих откликов
    const result = await apiService.getMyResponses('pending')
    pendingResponsesCount.value = result.data?.length || 0
  } catch (e) {
    console.log('Could not load pending responses count')
  }
})
</script>

<style scoped>
.qn-item{
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 800;
  color: #fff;
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(6px);
  transition: .2s;
}
.qn-item:hover{ background: rgba(255,255,255,.16); }
.qn-menu{
  position: absolute; top: 110%; left: 0;
  background: #fff; color: #111; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
  padding: 8px; min-width: 200px;
  z-index: 2100;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.qn-menu-item{
  display: block; padding: 10px 12px; border-radius: 10px;
  font-weight: 800; color: #111;
  transition: background-color 0.2s ease;
}
.qn-menu-item:hover{ background: #F3F4F6; }
</style>
