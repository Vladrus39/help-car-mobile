<template>
  <div 
    :class="[
      'flex gap-3 group relative',
      isMine ? 'flex-row-reverse' : ''
    ]"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Avatar (only for others) -->
    <router-link 
      v-if="!isMine && showAvatar"
      :to="`/user/${message.sender?.id}`" 
      class="flex-shrink-0"
    >
      <div class="relative">
        <div 
          v-if="message.sender?.avatar_url"
          class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition"
        >
          <img :src="getAvatarUrl(message.sender.avatar_url)" class="w-full h-full object-cover">
        </div>
        <div 
          v-else
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
            getAvatarGradient(message.sender?.full_name)
          ]"
        >
          {{ getInitials(message.sender?.full_name) }}
        </div>
        <!-- Online indicator -->
        <span 
          v-if="message.sender?.is_online"
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
        />
      </div>
    </router-link>
    <div v-else-if="!isMine" class="w-10" />

    <!-- Message bubble -->
    <div :class="['max-w-[75%] sm:max-w-[65%]', isMine ? 'items-end' : 'items-start']">
      <!-- Reply to -->
      <div 
        v-if="message.reply_to"
        :class="[
          'mb-1 px-3 py-2 rounded-lg text-xs border-l-4 cursor-pointer hover:opacity-80 transition',
          isMine 
            ? 'bg-blue-400/20 border-blue-300 text-white/80' 
            : 'bg-gray-100 dark:bg-gray-700 border-blue-500 text-gray-600 dark:text-gray-300'
        ]"
        @click="$emit('scrollToMessage', message.reply_to.id)"
      >
        <div class="font-bold text-xs opacity-70">
          {{ message.reply_to.sender?.full_name || 'Сообщение' }}
        </div>
        <div class="truncate">{{ message.reply_to.content || '📷 Изображение' }}</div>
      </div>

      <!-- Sender name -->
      <div 
        v-if="!isMine && showName"
        class="flex items-center gap-2 mb-1 ml-1"
      >
        <router-link 
          :to="`/user/${message.sender?.id}`"
          class="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
        >
          {{ message.sender?.full_name || 'Пользователь' }}
        </router-link>
        <PremiumBadge :status="message.sender?.premium_status" size="xs" />
      </div>

      <!-- Message content -->
      <div
        :class="[
          'relative px-4 py-3 rounded-2xl break-words transition-all shadow-sm',
          isMine
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 rounded-bl-md',
          message.is_sending ? 'opacity-70' : '',
          message.is_failed ? 'ring-2 ring-red-500' : ''
        ]"
        @contextmenu.prevent="showContextMenu"
        @click="handleClick"
      >
        <!-- Image -->
        <div v-if="message.image_url" class="mb-2 -mx-2 -mt-1">
          <img 
            :src="getImageUrl(message.thumbnail_url || message.image_url)" 
            :alt="message.content || 'Изображение'" 
            class="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition"
            style="max-height: 280px; object-fit: cover;"
            @click.stop="$emit('openImage', message.image_url)"
            @error="handleImageError"
          >
        </div>

        <!-- Text content -->
        <p v-if="message.content" class="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
          {{ message.content }}
        </p>

        <!-- Reactions -->
        <div 
          v-if="hasReactions"
          :class="[
            'flex flex-wrap gap-1 mt-2 -mb-1',
            isMine ? 'justify-end' : 'justify-start'
          ]"
        >
          <button
            v-for="(count, emoji) in message.reactions"
            :key="emoji"
            :class="[
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all',
              hasMyReaction(emoji)
                ? 'bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-400'
                : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
            ]"
            @click.stop="toggleReaction(emoji)"
          >
            <span>{{ emoji }}</span>
            <span class="font-bold text-gray-600 dark:text-gray-300">{{ count }}</span>
          </button>
        </div>

        <!-- Sending indicator -->
        <div v-if="message.is_sending" class="absolute -bottom-1 -right-1">
          <div class="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      <!-- Time and status -->
      <div 
        :class="[
          'flex items-center gap-1.5 mt-1 text-xs',
          isMine ? 'justify-end mr-1' : 'ml-1'
        ]"
      >
        <span class="text-gray-400">{{ formatTime(message.created_at || message.createdAt) }}</span>
        
        <!-- Read status for own messages -->
        <template v-if="isMine">
          <svg v-if="message.is_read" class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
          </svg>
          <svg v-else-if="message.is_delivered" class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z"/>
          </svg>
          <svg v-else class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </template>
      </div>
    </div>

    <!-- Quick reaction button (on hover) -->
    <div 
      :class="[
        'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity z-10',
        isMine ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
      ]"
    >
      <button
        class="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform"
        @click.stop="showReactionPicker = !showReactionPicker"
      >
        😊
      </button>
    </div>

    <!-- Reaction picker -->
    <Transition name="scale">
      <div 
        v-if="showReactionPicker"
        :class="[
          'absolute top-0 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 flex gap-1',
          isMine ? 'right-full mr-2' : 'left-full ml-2'
        ]"
      >
        <button
          v-for="emoji in reactionEmojis"
          :key="emoji"
          class="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          @click="addReaction(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </Transition>

    <!-- Context menu -->
    <Transition name="scale">
      <div 
        v-if="showMenu"
        :class="[
          'absolute top-full mt-1 z-30 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 py-2 min-w-[160px]',
          isMine ? 'right-0' : 'left-0'
        ]"
      >
        <button 
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          @click="handleReply"
        >
          ↩️ Ответить
        </button>
        <button 
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          @click="handleCopy"
        >
          📋 Копировать
        </button>
        <button 
          v-if="isMine"
          class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          @click="handleDelete"
        >
          🗑️ Удалить
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PremiumBadge from '@/components/PremiumBadge.vue'

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: String, default: '' },
  showAvatar: { type: Boolean, default: true },
  showName: { type: Boolean, default: true }
})

const emit = defineEmits(['reply', 'react', 'delete', 'openImage', 'scrollToMessage'])

const showReactionPicker = ref(false)
const showMenu = ref(false)
const swipeOffset = ref(0)
const touchStartX = ref(0)

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥']

const isMine = computed(() => props.message.sender?.id === props.currentUserId || props.message.sender_id === props.currentUserId)

const hasReactions = computed(() => {
  return props.message.reactions && Object.keys(props.message.reactions).length > 0
})

function hasMyReaction(emoji) {
  return props.message.my_reactions?.includes(emoji)
}

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

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'сейчас'
  if (diffMins < 60) return `${diffMins} мин`
  
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

function getAvatarUrl(url) {
  return getImageUrl(url)
}

function handleImageError(event) {
  event.target.style.display = 'none'
}

function showContextMenu() {
  showMenu.value = true
  showReactionPicker.value = false
}

function handleClick() {
  if (showMenu.value || showReactionPicker.value) {
    showMenu.value = false
    showReactionPicker.value = false
  }
}

function handleReply() {
  emit('reply', props.message)
  showMenu.value = false
}

function handleCopy() {
  if (props.message.content) {
    navigator.clipboard.writeText(props.message.content)
  }
  showMenu.value = false
}

function handleDelete() {
  emit('delete', props.message)
  showMenu.value = false
}

function addReaction(emoji) {
  emit('react', { messageId: props.message.id, emoji })
  showReactionPicker.value = false
}

function toggleReaction(emoji) {
  emit('react', { messageId: props.message.id, emoji, toggle: true })
}

// Swipe to reply (mobile)
function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchMove(e) {
  const diff = e.touches[0].clientX - touchStartX.value
  if (!isMine.value && diff > 0 && diff < 100) {
    swipeOffset.value = diff
  } else if (isMine.value && diff < 0 && diff > -100) {
    swipeOffset.value = diff
  }
}

function handleTouchEnd() {
  if (Math.abs(swipeOffset.value) > 60) {
    emit('reply', props.message)
  }
  swipeOffset.value = 0
}

// Close menus on outside click
function handleOutsideClick(e) {
  if (!e.target.closest('.group')) {
    showMenu.value = false
    showReactionPicker.value = false
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
  transform: scale(0.9);
}
</style>
