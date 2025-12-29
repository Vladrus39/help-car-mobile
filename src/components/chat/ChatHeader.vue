<template>
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Back button -->
        <router-link
          :to="backUrl"
          class="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </router-link>
        
        <!-- Chat/User info -->
        <component 
          :is="user ? 'router-link' : 'div'"
          :to="user ? `/user/${user.id}` : undefined"
          class="flex items-center gap-3 group cursor-pointer"
        >
          <!-- Avatar -->
          <div class="relative">
            <div 
              v-if="avatar"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition"
            >
              <img :src="avatar" class="w-full h-full object-cover">
            </div>
            <div 
              v-else
              :class="[
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white font-bold',
                icon ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-2xl' : getAvatarGradient(title)
              ]"
            >
              {{ icon || getInitials(title) }}
            </div>
            <!-- Online indicator -->
            <span 
              v-if="isOnline"
              class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
            />
          </div>
          
          <!-- Name and status -->
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-bold text-gray-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 transition">
                {{ title }}
              </h2>
              <PremiumBadge v-if="user?.premium_status" :status="user.premium_status" size="xs" />
              <span 
                v-if="user?.rating"
                class="text-yellow-500 text-xs"
              >
                ⭐ {{ parseFloat(user.rating).toFixed(1) }}
              </span>
            </div>
            <p :class="[
              'text-xs',
              statusColor
            ]">
              {{ statusText }}
            </p>
          </div>
        </component>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-1 sm:gap-2">
        <!-- Participants count -->
        <div 
          v-if="participantsCount"
          class="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full"
        >
          <span>👥</span>
          <span>{{ participantsCount }}</span>
        </div>

        <!-- Online count -->
        <div 
          v-if="onlineCount"
          class="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full"
        >
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{{ onlineCount }}</span>
        </div>

        <!-- Quick actions -->
        <slot name="actions" />

        <!-- Menu button -->
        <div class="relative">
          <button
            class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            @click="showMenu = !showMenu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
          
          <!-- Dropdown menu -->
          <Transition name="scale">
            <div 
              v-if="showMenu"
              class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 py-2 z-50 min-w-[180px]"
            >
              <slot name="menu">
                <button 
                  v-if="user"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  @click="$emit('viewProfile'); showMenu = false"
                >
                  👤 Профиль
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  @click="$emit('search'); showMenu = false"
                >
                  🔍 Поиск
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  @click="$emit('mute'); showMenu = false"
                >
                  🔕 {{ isMuted ? 'Включить звук' : 'Выключить звук' }}
                </button>
                <hr class="my-1 border-gray-200 dark:border-gray-700">
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  @click="$emit('leave'); showMenu = false"
                >
                  🚪 Покинуть чат
                </button>
              </slot>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PremiumBadge from '@/components/PremiumBadge.vue'

const props = defineProps({
  title: { type: String, default: 'Чат' },
  avatar: { type: String, default: '' },
  icon: { type: String, default: '' },
  user: { type: Object, default: null },
  backUrl: { type: String, default: '/chats' },
  isOnline: { type: Boolean, default: false },
  isTyping: { type: Boolean, default: false },
  typingUsers: { type: Array, default: () => [] },
  lastSeen: { type: String, default: '' },
  participantsCount: { type: Number, default: 0 },
  onlineCount: { type: Number, default: 0 },
  isMuted: { type: Boolean, default: false }
})

defineEmits(['viewProfile', 'search', 'mute', 'leave'])

const showMenu = ref(false)

const statusText = computed(() => {
  if (props.isTyping) {
    if (props.typingUsers?.length > 0) {
      const names = props.typingUsers.slice(0, 2).join(', ')
      return props.typingUsers.length > 2 
        ? `${names} и ещё ${props.typingUsers.length - 2} печатают...`
        : `${names} печатает...`
    }
    return 'печатает...'
  }
  if (props.isOnline) return 'онлайн'
  if (props.participantsCount) return `${props.participantsCount} участников`
  if (props.lastSeen) return formatLastSeen(props.lastSeen)
  return ''
})

const statusColor = computed(() => {
  if (props.isTyping) return 'text-blue-500 animate-pulse'
  if (props.isOnline) return 'text-green-500'
  return 'text-gray-500 dark:text-gray-400'
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarGradient(name) {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600'
  ]
  const index = (name?.charCodeAt(0) || 0) % gradients.length
  return gradients[index]
}

function formatLastSeen(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'был только что'
  if (diffMins < 60) return `был ${diffMins} мин назад`
  if (diffHours < 24) return `был ${diffHours} ч назад`
  if (diffDays === 1) return 'был вчера'
  
  return `был ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
}

function handleOutsideClick(e) {
  if (!e.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
