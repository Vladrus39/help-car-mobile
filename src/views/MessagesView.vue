<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <NavigationHeader />
    
    <div class="max-w-2xl mx-auto py-8 px-4">
      <h1 class="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <span class="text-3xl">✉️</span>
        Сообщения
      </h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md">
        <button
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2',
            activeTab === 'chats'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
          @click="activeTab = 'chats'"
        >
          💬 Чаты
          <span
            v-if="totalUnread > 0"
            class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
          >
            {{ totalUnread > 9 ? '9+' : totalUnread }}
          </span>
        </button>
        <button
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2',
            activeTab === 'invitations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
          @click="activeTab = 'invitations'"
        >
          👥 Приглашения
          <span
            v-if="invitationsStore.pendingCount > 0"
            class="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full"
          >
            {{ invitationsStore.pendingCount }}
          </span>
        </button>
      </div>

      <!-- CHATS TAB -->
      <div v-if="activeTab === 'chats'">
        <!-- Loading -->
        <div
          v-if="isLoading"
          class="space-y-4"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div class="flex-1">
                <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="chats.length === 0"
          class="text-center py-16"
        >
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">💬</span>
          </div>
          <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            Нет сообщений
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Начните общение, нажав на имя пользователя
          </p>
          <router-link 
            to="/map" 
            class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            🗺 На карту
          </router-link>
        </div>

        <!-- Chats list -->
        <div
          v-else
          class="space-y-3"
        >
          <router-link
            v-for="chat in chats"
            :key="chat.id"
            :to="`/direct-chat/${chat.id}`"
            class="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition"
          >
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div 
                v-if="chat.otherUser?.avatar_url"
                class="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
              >
                <img
                  :src="getAvatarUrl(chat.otherUser.avatar_url)"
                  :alt="chat.otherUser.full_name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div 
                v-else
                class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              >
                {{ getInitials(chat.otherUser?.full_name) }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2 min-w-0">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate">
                      {{ chat.otherUser?.full_name || 'Пользователь' }}
                    </h3>
                    <PremiumBadge :status="chat.otherUser?.premium_status" size="xs" />
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ formatTime(chat.last_message_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ chat.lastMessage?.content || 'Начните общение...' }}
                </p>
              </div>

              <!-- Unread badge -->
              <div 
                v-if="chat.unread_count > 0"
                class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              >
                {{ chat.unread_count > 9 ? '9+' : chat.unread_count }}
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- INVITATIONS TAB -->
      <div v-if="activeTab === 'invitations'">
        <!-- Empty state -->
        <div
          v-if="invitationsStore.invitations.length === 0"
          class="text-center py-16"
        >
          <div class="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">👥</span>
          </div>
          <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            Нет приглашений
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            Когда друзья пригласят вас помочь, приглашения появятся здесь
          </p>
        </div>

        <!-- Invitations list -->
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="inv in invitationsStore.invitations"
            :key="inv.id"
            :class="[
              'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md transition',
              inv.status === 'pending' ? 'ring-2 ring-purple-400' : 'opacity-75'
            ]"
          >
            <div class="flex items-start gap-4">
              <!-- Sender avatar -->
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {{ getInitials(inv.sender?.name) }}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-bold text-gray-900 dark:text-white">
                    {{ inv.sender?.name || 'Друг' }}
                  </h3>
                  <span class="text-xs text-gray-400">
                    {{ formatTime(inv.timestamp) }}
                  </span>
                </div>
                
                <p class="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {{ inv.message || 'Приглашает помочь вместе!' }}
                </p>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Заявка:
                  </p>
                  <p class="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {{ getProblemLabel(inv.problemType) }}
                  </p>
                  <p
                    v-if="inv.description"
                    class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
                  >
                    {{ inv.description }}
                  </p>
                </div>

                <!-- Status badge -->
                <div
                  v-if="inv.status !== 'pending'"
                  class="mb-3"
                >
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-bold',
                      inv.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ inv.status === 'accepted' ? '✓ Принято' : '✗ Отклонено' }}
                  </span>
                </div>

                <!-- Actions -->
                <div
                  v-if="inv.status === 'pending'"
                  class="flex gap-2"
                >
                  <button
                    class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                    @click="handleAccept(inv)"
                  >
                    ✓ Принять
                  </button>
                  <button
                    class="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-bold transition flex items-center justify-center gap-2"
                    @click="handleDecline(inv)"
                  >
                    ✗ Отклонить
                  </button>
                </div>

                <!-- Link to request after accepted -->
                <router-link
                  v-if="inv.status === 'accepted'"
                  :to="`/request/${inv.helpRequestId}`"
                  class="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-center"
                >
                  🔗 Перейти к заявке
                </router-link>
              </div>

              <!-- Remove button for processed -->
              <button
                v-if="inv.status !== 'pending'"
                class="p-2 text-gray-400 hover:text-red-500 transition"
                title="Удалить"
                @click="invitationsStore.removeInvitation(inv.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Clear all button -->
        <div
          v-if="invitationsStore.invitations.length > 0"
          class="mt-6 text-center"
        >
          <button
            class="text-sm text-gray-500 hover:text-red-500 transition"
            @click="clearAllInvitations"
          >
            🗑 Очистить все приглашения
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationHeader from '@/components/NavigationHeader.vue'
import PremiumBadge from '@/components/PremiumBadge.vue'
import { apiService } from '@/services/api'
import { useInvitationsStore } from '@/stores/invitations'

const router = useRouter()
const invitationsStore = useInvitationsStore()

const chats = ref([])
const isLoading = ref(true)
const activeTab = ref('chats')

// Общее кол-во непрочитанных
const totalUnread = computed(() => 
  chats.value.reduce((sum, chat) => sum + (chat.unread_count || 0), 0)
)

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatTime = (dateStr) => {
  if (!dateStr && typeof dateStr !== 'number') return ''
  const date = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'сейчас'
  if (diffMins < 60) return `${diffMins} мин`
  if (diffHours < 24) return `${diffHours} ч`
  if (diffDays < 7) return `${diffDays} дн`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// Лейблы типов проблем
const problemLabels = {
  flat_tire: '🚨 Пробито колесо',
  battery: '🔋 Сел аккумулятор',
  fuel: '⛽ Кончилось топливо',
  tow: '🚗 Нужна буксировка',
  engine: '🔧 Проблема с двигателем',
  keys: '🔑 Заблокированы ключи',
  accident: '🚨 ДТП',
  other: '❓ Другое'
}

const getProblemLabel = (type) => problemLabels[type] || type || 'Помощь'

// Принять приглашение - перейти к заявке
const handleAccept = async (invitation) => {
  invitationsStore.acceptInvitation(invitation.id)
  // Переходим на страницу заявки
  router.push(`/request/${invitation.helpRequestId}`)
}

// Отклонить приглашение
const handleDecline = (invitation) => {
  invitationsStore.declineInvitation(invitation.id)
}

// Очистить все
const clearAllInvitations = () => {
  if (confirm('Удалить все приглашения?')) {
    invitationsStore.clearAll()
  }
}

const loadChats = async () => {
  try {
    isLoading.value = true
    const response = await apiService.client.get('/chats/direct')
    chats.value = response?.data || response || []
  } catch (err) {
    console.error('Failed to load direct chats:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadChats()
  // При наличии ожидающих приглашений - показываем эту вкладку
  if (invitationsStore.pendingCount > 0) {
    activeTab.value = 'invitations'
  }
})

function getAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}
</script>
