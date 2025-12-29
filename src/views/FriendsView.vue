<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 pb-24">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
      <div class="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          ← 
        </button>
        <h1 class="text-xl font-black text-gray-900 dark:text-white">👥 Друзья</h1>
        <button @click="showAddFriendModal = true" class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          +
        </button>
      </div>
    </div>

    <div class="max-w-lg mx-auto px-4 py-4">
      <!-- Статистика -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow">
          <div class="text-2xl font-bold text-blue-600">{{ friends.length }}</div>
          <div class="text-xs text-gray-500">Друзей</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow">
          <div class="text-2xl font-bold text-green-600">{{ onlineFriends.length }}</div>
          <div class="text-xs text-gray-500">Онлайн</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20" @click="showPendingModal = true">
          <div class="text-2xl font-bold text-orange-600">{{ pendingRequests.length }}</div>
          <div class="text-xs text-gray-500">Заявок</div>
        </div>
      </div>

      <!-- Поиск -->
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Поиск среди друзей..."
          class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
      </div>

      <!-- Группы -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          v-for="group in groups"
          :key="group.id"
          @click="selectedGroup = group.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition',
            selectedGroup === group.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ group.icon }} {{ group.name }} 
          <span v-if="getGroupCount(group.id) > 0" class="ml-1 opacity-75">({{ getGroupCount(group.id) }})</span>
        </button>
      </div>

      <!-- Список друзей -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-3 text-gray-500">Загрузка...</p>
      </div>

      <div v-else-if="filteredFriends.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
        <div class="text-5xl mb-4">👥</div>
        <p class="text-gray-500">{{ searchQuery ? 'Ничего не найдено' : 'Нет друзей в этой группе' }}</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="friendItem in filteredFriends"
          :key="friendItem.friendship_id"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition"
        >
          <div class="flex items-center gap-4">
            <!-- Аватар -->
            <div class="relative cursor-pointer" @click="goToProfile(friendItem.friend?.id)">
              <img 
                v-if="friendItem.friend?.avatar_url" 
                :src="getAvatarUrl(friendItem.friend.avatar_url)" 
                :alt="friendItem.friend.full_name"
                class="w-14 h-14 rounded-full object-cover"
              >
              <div v-else class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {{ getInitials(friendItem.friend?.full_name) }}
              </div>
              <span 
                v-if="friendItem.friend?.is_online"
                class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
              />
            </div>

            <!-- Инфо -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 dark:text-white truncate">{{ friendItem.friend?.full_name }}</span>
                <span v-if="friendItem.group_name" class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ friendItem.group_name }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span>⭐ {{ parseFloat(friendItem.friend?.rating || 5).toFixed(1) }}</span>
                <span v-if="friendItem.friend?.is_online" class="text-green-600">🟢 Онлайн</span>
                <span v-else class="text-gray-400">⚪ Офлайн</span>
              </div>
            </div>
          </div>

          <!-- Действия -->
          <div class="flex gap-2 mt-4">
            <button 
              @click="openChat(friendItem.friend)"
              class="flex-1 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
            >
              💬 Написать
            </button>
            <button 
              @click="quickCall(friendItem.friend)"
              class="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition"
            >
              🆘 Быстрый вызов
            </button>
            <button 
              @click="showFriendMenu(friendItem)"
              class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              ⋮
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления друга -->
    <div v-if="showAddFriendModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddFriendModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">➕ Добавить друга</h3>
          <button @click="showAddFriendModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div class="p-4">
          <input
            v-model="searchUserQuery"
            type="text"
            placeholder="Поиск по имени или телефону..."
            class="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            @input="searchUsers"
          >
          <div v-if="isSearching" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <div v-else class="mt-4 space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <img v-if="user.avatar_url" :src="getAvatarUrl(user.avatar_url)" class="w-10 h-10 rounded-full object-cover">
                <div v-else class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{{ getInitials(user.full_name) }}</div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ user.full_name }}</div>
                  <div class="text-xs text-gray-500">⭐ {{ parseFloat(user.rating || 5).toFixed(1) }}</div>
                </div>
              </div>
              <button
                v-if="user.friendship_status === 'accepted'"
                class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm"
                disabled
              >
                ✓ Друзья
              </button>
              <button
                v-else-if="user.friendship_status === 'pending'"
                class="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm"
                disabled
              >
                Отправлено
              </button>
              <button
                v-else
                @click="sendFriendRequest(user.id)"
                class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно заявок -->
    <div v-if="showPendingModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showPendingModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">📨 Заявки в друзья</h3>
          <button @click="showPendingModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div class="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div v-if="pendingRequests.length === 0" class="text-center py-8 text-gray-500">
            Нет новых заявок
          </div>
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <img v-if="request.sender?.avatar_url" :src="getAvatarUrl(request.sender.avatar_url)" class="w-10 h-10 rounded-full object-cover">
              <div v-else class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{{ getInitials(request.sender?.full_name) }}</div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">{{ request.sender?.full_name }}</div>
                <div v-if="request.message" class="text-xs text-gray-500 italic">«{{ request.message }}»</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="acceptRequest(request.id)" class="px-3 py-2 bg-green-500 text-white rounded-lg">✓</button>
              <button @click="rejectRequest(request.id)" class="px-3 py-2 bg-red-500 text-white rounded-lg">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Контекстное меню друга -->
    <div v-if="selectedFriend" class="fixed inset-0 bg-black/50 flex items-end justify-center z-50" @click.self="selectedFriend = null">
      <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-lg p-4 pb-8">
        <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        <div class="flex items-center gap-4 mb-4 pb-4 border-b dark:border-gray-700">
          <img v-if="selectedFriend.friend?.avatar_url" :src="getAvatarUrl(selectedFriend.friend.avatar_url)" class="w-16 h-16 rounded-full object-cover">
          <div v-else class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">{{ getInitials(selectedFriend.friend?.full_name) }}</div>
          <div>
            <div class="font-bold text-lg text-gray-900 dark:text-white">{{ selectedFriend.friend?.full_name }}</div>
            <div class="text-sm text-gray-500">Друзья с {{ formatDate(selectedFriend.accepted_at) }}</div>
          </div>
        </div>
        <div class="space-y-2">
          <button @click="goToProfile(selectedFriend.friend?.id); selectedFriend = null" class="w-full py-3 text-left px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
            👤 Открыть профиль
          </button>
          <button @click="setGroupModal = true" class="w-full py-3 text-left px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
            📁 Изменить группу: <span class="text-gray-500">{{ selectedFriend.group_name || 'Не указана' }}</span>
          </button>
          <button @click="viewStats(selectedFriend)" class="w-full py-3 text-left px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
            📊 Статистика дружбы
          </button>
          <button @click="removeFriend(selectedFriend)" class="w-full py-3 text-left px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
            🗑️ Удалить из друзей
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно группы -->
    <div v-if="setGroupModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="setGroupModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">📁 Выберите группу</h3>
        <div class="space-y-2">
          <button
            v-for="group in groupOptions"
            :key="group"
            @click="setFriendGroup(group)"
            :class="[
              'w-full py-3 px-4 text-left rounded-xl transition',
              selectedFriend?.group_name === group 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            {{ group || '✕ Без группы' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Статистика дружбы -->
    <div v-if="showStatsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showStatsModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Статистика дружбы</h3>
        <div v-if="statsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <div v-else-if="friendStats" class="space-y-4">
          <div class="text-center text-sm text-gray-500 mb-4">
            Друзья с {{ formatDate(friendStats.friendship_since) }}
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ friendStats.mutual_helps?.i_helped_friend || 0 }}</div>
              <div class="text-xs text-gray-500">Я помог</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ friendStats.mutual_helps?.friend_helped_me || 0 }}</div>
              <div class="text-xs text-gray-500">Мне помогли</div>
            </div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ friendStats.mutual_helps?.total || 0 }}</div>
            <div class="text-xs text-gray-500">Всего взаимопомощей</div>
          </div>
        </div>
        <button @click="showStatsModal = false" class="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
const router = useRouter()

const isLoading = ref(true)
const friends = ref([])
const pendingRequests = ref([])
const searchQuery = ref('')
const selectedGroup = ref('all')
const showAddFriendModal = ref(false)
const showPendingModal = ref(false)
const selectedFriend = ref(null)
const setGroupModal = ref(false)
const showStatsModal = ref(false)
const friendStats = ref(null)
const statsLoading = ref(false)

// Поиск пользователей
const searchUserQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const groups = [
  { id: 'all', name: 'Все', icon: '👥' },
  { id: 'Семья', name: 'Семья', icon: '👨‍👩‍👧‍👦' },
  { id: 'Коллеги', name: 'Коллеги', icon: '💼' },
  { id: 'Клуб', name: 'Клуб', icon: '🏎️' },
  { id: 'Друзья', name: 'Друзья', icon: '🤝' }
]

const groupOptions = ['', 'Семья', 'Коллеги', 'Клуб', 'Друзья']

const onlineFriends = computed(() => friends.value.filter(f => f.friend?.is_online))

const filteredFriends = computed(() => {
  let result = friends.value
  if (selectedGroup.value !== 'all') {
    result = result.filter(f => f.group_name === selectedGroup.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f => f.friend?.full_name?.toLowerCase().includes(q))
  }
  return result
})

const getGroupCount = (groupId) => {
  if (groupId === 'all') return friends.value.length
  return friends.value.filter(f => f.group_name === groupId).length
}

const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  // Убираем /api/v1 из baseUrl для статических файлов
  const staticBaseUrl = baseUrl.replace('/api/v1', '')
  return `${staticBaseUrl}${url}`
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const loadFriends = async () => {
  try {
    isLoading.value = true
    const response = await apiService.getFriends()
    friends.value = response?.data || []
  } catch (e) {
    console.error('Load friends error:', e)
  } finally {
    isLoading.value = false
  }
}

const loadPendingRequests = async () => {
  try {
    const response = await apiService.getPendingFriendRequests()
    pendingRequests.value = response?.data || []
  } catch (e) {
    console.error('Load pending error:', e)
  }
}

const searchUsers = async () => {
  if (searchUserQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    isSearching.value = true
    const response = await apiService.searchUsersForFriends(searchUserQuery.value)
    searchResults.value = response?.data || []
  } catch (e) {
    console.error('Search error:', e)
  } finally {
    isSearching.value = false
  }
}

const sendFriendRequest = async (userId) => {
  try {
    const response = await apiService.sendFriendRequest(userId)
    if (response.success) {
      const idx = searchResults.value.findIndex(u => u.id === userId)
      if (idx !== -1) searchResults.value[idx].friendship_status = 'pending'
      if (response.message?.includes('теперь друзья')) await loadFriends()
    }
  } catch (e) {
    alert(e.response?.data?.message || 'Ошибка')
  }
}

const acceptRequest = async (id) => {
  try {
    await apiService.acceptFriendRequest(id)
    await loadFriends()
    await loadPendingRequests()
  } catch (e) {
    alert('Ошибка')
  }
}

const rejectRequest = async (id) => {
  try {
    await apiService.rejectFriendRequest(id)
    await loadPendingRequests()
  } catch (e) {
    alert('Ошибка')
  }
}

const openChat = async (friend) => {
  router.push(`/direct-chat/${friend.id}`)
}

const quickCall = (friend) => {
  router.push({ path: '/create-request', query: { friendId: friend.id, quickCall: true } })
}

const goToProfile = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

const showFriendMenu = (friendItem) => {
  selectedFriend.value = friendItem
}

const setFriendGroup = async (group) => {
  try {
    await apiService.client.put(`/friends/${selectedFriend.value.friendship_id}/group`, { group_name: group || null })
    selectedFriend.value.group_name = group || null
    const idx = friends.value.findIndex(f => f.friendship_id === selectedFriend.value.friendship_id)
    if (idx !== -1) friends.value[idx].group_name = group || null
    setGroupModal.value = false
  } catch (e) {
    alert('Ошибка')
  }
}

const viewStats = async (friendItem) => {
  selectedFriend.value = null
  showStatsModal.value = true
  statsLoading.value = true
  try {
    const response = await apiService.client.get(`/friends/${friendItem.friend?.id}/stats`)
    friendStats.value = response?.data || response
  } catch (e) {
    console.error('Stats error:', e)
    friendStats.value = null
  } finally {
    statsLoading.value = false
  }
}

const removeFriend = async (friendItem) => {
  if (!confirm(`Удалить ${friendItem.friend?.full_name} из друзей?`)) return
  try {
    await apiService.removeFriend(friendItem.friendship_id)
    friends.value = friends.value.filter(f => f.friendship_id !== friendItem.friendship_id)
    selectedFriend.value = null
  } catch (e) {
    alert('Ошибка')
  }
}

onMounted(() => {
  loadFriends()
  loadPendingRequests()
})
</script>
