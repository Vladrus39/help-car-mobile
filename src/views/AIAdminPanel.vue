<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button @click="goToHome" class="text-gray-600 hover:text-gray-800 font-medium">
              🏠 На главную
            </button>
            <button @click="goToDashboard" class="text-blue-600 hover:text-blue-800 font-medium">
              ← Дашборд
            </button>
            <h1 class="text-xl font-bold text-gray-900">🤖 AI Админ Панель</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ admin?.full_name || admin?.username }}</span>
            <button @click="logout" class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">🤖 AI Админ Панель</h2>
        <p class="text-gray-600 mb-6">Управление базовым AI функционалом</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">⚡ Управление</h3>
            <div class="space-y-2">
              <button @click="getConfig" :disabled="loading" class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                ⚙️ Конфигурация
              </button>
              <button @click="testAI" :disabled="loading" class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                🧪 Тест AI
              </button>
            </div>
          </div>

          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">📊 Информация</h3>
            <div v-if="config" class="space-y-2 text-sm">
              <div v-for="(value, key) in config" :key="key" class="flex justify-between">
                <span class="font-medium">{{ key }}:</span>
                <span>{{ value }}</span>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">
              Нажмите "Конфигурация" для получения информации
            </div>
          </div>
        </div>

        <div v-if="message" :class="['mt-4 p-4 rounded', message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ message.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logger } from '@/utils/logger'

const router = useRouter()
const loading = ref(false)
const admin = ref(null)
const config = ref(null)
const message = ref(null)

const getToken = () => localStorage.getItem('adminToken')

const goToHome = () => router.push('/')
const goToDashboard = () => router.push('/admin/dashboard')

const getConfig = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/ai-admin/config', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await response.json()
    if (data.success) {
      config.value = data.config || {}
    } else {
      throw new Error(data.error || 'Ошибка получения конфигурации')
    }
  } catch (error) {
    logger.error('Get config error:', error)
    message.value = { type: 'error', text: '❌ Ошибка: ' + error.message }
  } finally {
    loading.value = false
  }
}

const testAI = async () => {
  loading.value = true
  message.value = null
  try {
    const response = await fetch('/api/v1/ai-admin/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Тестовое сообщение' })
    })
    const data = await response.json()
    if (data.success) {
      message.value = { type: 'success', text: '✅ AI работает корректно' }
    } else {
      throw new Error(data.error || 'Ошибка теста')
    }
  } catch (error) {
    logger.error('Test AI error:', error)
    message.value = { type: 'error', text: '❌ Ошибка: ' + error.message }
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin')
  router.push('/admin/login')
}

onMounted(() => {
  const adminData = localStorage.getItem('admin')
  if (adminData) {
    try {
      admin.value = JSON.parse(adminData)
    } catch (error) {
      logger.error('Mount error:', error)
      router.push('/admin/login')
    }
  } else {
    router.push('/admin/login')
  }
})
</script>
