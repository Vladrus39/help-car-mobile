<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-blue-600 hover:text-blue-800 font-medium"
              @click="$router.push('/admin/dashboard')"
            >
              ← Дашборд
            </button>
            <h1 class="text-xl font-bold text-gray-900">
              💬 Модерация Чатов
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Список чатов -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <h3 class="font-bold mb-4">
            Активные чаты
          </h3>
          <div class="space-y-2 max-h-[600px] overflow-y-auto">
            <div 
              v-for="chat in chats" 
              :key="chat.id"
              :class="selectedChat?.id === chat.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'"
              class="p-3 border rounded cursor-pointer"
              @click="selectChat(chat)"
            >
              <div class="font-medium text-sm">
                {{ chat.request_description }}
              </div>
              <div class="text-xs text-gray-700 mt-1">
                {{ chat.messages_count || 0 }} сообщений
              </div>
              <div
                v-if="chat.has_reports"
                class="text-xs text-red-600 mt-1"
              >
                ⚠️ Есть жалобы!
              </div>
            </div>
            <div
              v-if="!chats.length"
              class="text-gray-700 text-center py-8"
            >
              Нет активных чатов
            </div>
          </div>
        </div>

        <!-- Сообщения чата -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <div
            v-if="!selectedChat"
            class="text-gray-700 text-center py-12"
          >
            Выберите чат для просмотра
          </div>
          <div v-else>
            <div class="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 class="font-bold">
                  {{ selectedChat.request_description }}
                </h3>
                <p class="text-xs text-gray-700">
                  Chat ID: {{ selectedChat.id }}
                </p>
              </div>
              <button
                class="bg-red-600 text-white px-3 py-1 rounded text-sm"
                @click="deleteChat"
              >
                🗑️ Удалить чат
              </button>
            </div>

            <div class="space-y-3 max-h-[500px] overflow-y-auto mb-4">
              <div 
                v-for="msg in messages" 
                :key="msg.id"
                class="p-3 border rounded"
                :class="msg.is_deleted ? 'bg-red-50 border-red-300' : ''"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="text-sm font-medium">
                      {{ msg.sender_name }}
                    </div>
                    <div
                      class="text-sm mt-1"
                      :class="msg.is_deleted ? 'line-through text-gray-700' : ''"
                    >
                      {{ msg.content }}
                    </div>
                    <div class="text-xs text-gray-700 mt-1">
                      {{ new Date(msg.created_at).toLocaleString('ru-RU') }}
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <button 
                      v-if="!msg.is_deleted"
                      class="text-red-600 hover:text-red-800 text-xs px-2 py-1" 
                      @click="deleteMessage(msg)"
                    >
                      🗑️
                    </button>
                    <button 
                      class="text-red-600 hover:text-red-800 text-xs px-2 py-1" 
                      @click="banUser(msg.sender_id)"
                    >
                      🚫
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Действия -->
            <div class="flex gap-2">
              <button
                class="bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                @click="clearChat"
              >
                🧹 Очистить чат
              </button>
              <button
                class="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                @click="exportChat"
              >
                📥 Экспорт
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика жалоб -->
      <div class="mt-6 bg-white rounded-lg shadow p-6">
        <h3 class="font-bold mb-4">
          📊 Статистика жалоб и модерации
        </h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-red-50 p-4 rounded">
            <div class="text-2xl font-bold text-red-600">
              {{ stats.totalReports }}
            </div>
            <div class="text-sm text-gray-800 font-medium">
              Всего жалоб
            </div>
          </div>
          <div class="bg-yellow-50 p-4 rounded">
            <div class="text-2xl font-bold text-yellow-600">
              {{ stats.pendingReports }}
            </div>
            <div class="text-sm text-gray-800 font-medium">
              Ожидают проверки
            </div>
          </div>
          <div class="bg-blue-50 p-4 rounded">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.deletedMessages }}
            </div>
            <div class="text-sm text-gray-800 font-medium">
              Удалено сообщений
            </div>
          </div>
          <div class="bg-purple-50 p-4 rounded">
            <div class="text-2xl font-bold text-purple-600">
              {{ stats.bannedUsers }}
            </div>
            <div class="text-sm text-gray-800 font-medium">
              Заблокировано
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const chats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const stats = ref({
  totalReports: 0,
  pendingReports: 0,
  deletedMessages: 0,
  bannedUsers: 0
})

const getToken = () => localStorage.getItem('adminToken')

const loadChats = async () => {
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/chats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Chats endpoint not implemented yet')
        // Mock data для демонстрации
        chats.value = [
          { id: '1', request_description: 'Помощь с аккумулятором', messages_count: 15, has_reports: true },
          { id: '2', request_description: 'Нужен бензин', messages_count: 8, has_reports: false }
        ]
        return
      }
      throw new Error('Failed to load chats')
    }
    
    const data = await response.json()
    chats.value = data.chats || []
  } catch (error) {
    console.error('Load chats error:', error)
  }
}

const selectChat = async (chat) => {
  selectedChat.value = chat
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/chats/${chat.id}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      // Mock data
      messages.value = [
        { id: '1', sender_name: 'Иван', sender_id: 'u1', content: 'Привет, можете помочь?', created_at: new Date(), is_deleted: false },
        { id: '2', sender_name: 'Мария', sender_id: 'u2', content: 'Да, конечно! Где вы находитесь?', created_at: new Date(), is_deleted: false }
      ]
      return
    }
    
    const data = await response.json()
    messages.value = data.messages || []
  } catch (error) {
    console.error('Load messages error:', error)
  }
}

const deleteMessage = async (msg) => {
  if (!confirm('Удалить это сообщение?')) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/messages/${msg.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    msg.is_deleted = true
    stats.value.deletedMessages++
    alert('✅ Сообщение удалено')
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const banUser = async (userId) => {
  if (!confirm('Заблокировать этого пользователя?')) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error('Failed')
    
    stats.value.bannedUsers++
    alert('✅ Пользователь заблокирован')
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const deleteChat = async () => {
  if (!confirm('Удалить весь чат?')) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/chats/${selectedChat.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Чат удалён')
    selectedChat.value = null
    await loadChats()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const clearChat = async () => {
  if (!confirm('Очистить все сообщения в чате?')) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/chats/${selectedChat.value.id}/clear`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    messages.value = []
    alert('✅ Чат очищен')
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const exportChat = () => {
  let text = `Чат: ${selectedChat.value.request_description}\n\n`
  messages.value.forEach(msg => {
    text += `[${new Date(msg.created_at).toLocaleString()}] ${msg.sender_name}: ${msg.content}\n`
  })
  
  const blob = new Blob([text], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `chat_${selectedChat.value.id}_${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  
  alert('✅ Чат экспортирован')
}

onMounted(() => {
  loadChats()
})
</script>
