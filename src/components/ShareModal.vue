<template>
  <div 
    v-if="visible" 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
        <h3 class="text-xl font-black flex items-center gap-2">
          📤 Поделиться заявкой
        </h3>
        <p class="text-green-100 text-sm mt-1">Выберите друга для отправки</p>
      </div>
      
      <!-- Content -->
      <div class="p-4 max-h-[50vh] overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="py-10 text-center">
          <div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-500">Загрузка друзей...</p>
        </div>
        
        <!-- No friends -->
        <div v-else-if="friends.length === 0" class="py-10 text-center">
          <div class="text-5xl mb-4">👥</div>
          <p class="text-gray-500 font-medium">У вас пока нет друзей</p>
          <router-link to="/friends" class="text-green-600 font-bold mt-2 inline-block hover:underline">
            Найти друзей →
          </router-link>
        </div>
        
        <!-- Friends list -->
        <div v-else class="space-y-2">
          <button
            v-for="friend in friends"
            :key="friend.id"
            @click="selectFriend(friend)"
            :disabled="sending"
            class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-slate-700 transition group disabled:opacity-50"
          >
            <div class="relative">
              <img 
                v-if="friend.avatar_url" 
                :src="getAvatarUrl(friend.avatar_url)" 
                class="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                @error="handleAvatarError"
              />
              <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                {{ friend.full_name?.charAt(0) || '?' }}
              </div>
              <div v-if="friend.is_online" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div class="flex-1 text-left">
              <div class="font-bold text-gray-900 dark:text-white">{{ friend.full_name }}</div>
              <div class="text-sm text-gray-500">{{ friend.phone || 'Друг' }}</div>
            </div>
            <div class="text-green-500 group-hover:translate-x-1 transition-transform">
              📤
            </div>
          </button>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-slate-700">
        <button
          @click="$emit('close')"
          class="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiService } from '@/services/api'

const props = defineProps({
  visible: Boolean,
  requestId: [String, Number]
})

const emit = defineEmits(['close', 'shared'])

const friends = ref([])
const loading = ref(false)
const sending = ref(false)

watch(() => props.visible, async (isVisible) => {
  if (isVisible && props.requestId) {
    await loadFriends()
  }
})

async function loadFriends() {
  try {
    loading.value = true
    const result = await apiService.getFriends()
    const friendsData = result?.data || result || []
    friends.value = friendsData.map(f => f.friend).filter(Boolean)
    console.log('✅ Loaded friends:', friends.value.length)
  } catch (error) {
    console.error('❌ Error loading friends:', error)
    friends.value = []
  } finally {
    loading.value = false
  }
}

async function selectFriend(friend) {
  if (!props.requestId || sending.value) return
  
  try {
    sending.value = true
    
    await apiService.client.post(`/help-requests/${props.requestId}/share`, {
      friendIds: [friend.id],
      message: 'Смотри эту заявку!'
    })
    
    alert(`✅ Заявка отправлена ${friend.full_name}!`)
    emit('shared', friend)
    emit('close')
  } catch (error) {
    console.error('❌ Error sharing:', error)
    alert('❌ Ошибка при отправке')
  } finally {
    sending.value = false
  }
}

function getAvatarUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

function handleAvatarError(e) {
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk0YTNiOCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='
}
</script>
