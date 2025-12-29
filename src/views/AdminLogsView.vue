<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-gray-600 hover:text-gray-800 font-medium"
              @click="goToHome"
            >
              🏠 На главную
            </button>
            <button
              class="text-blue-600 hover:text-blue-800 font-medium"
              @click="goToDashboard"
            >
              ← Дашборд
            </button>
            <h1 class="text-xl font-bold text-gray-900">
              📋 Логи Системы
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold">
            📋 Логи
          </h2>
          <div class="flex space-x-2">
            <select
              v-model="selectedCategory"
              class="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">
                Все категории
              </option>
              <option value="app">
                Приложение
              </option>
              <option value="error">
                Ошибки
              </option>
              <option value="access">
                Доступ
              </option>
              <option value="admin">
                Админ
              </option>
            </select>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="loadLogs"
            >
              🔄 Обновить
            </button>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              @click="cleanupLogs"
            >
              🗑️ Очистить
            </button>
          </div>
        </div>

        <div class="border border-gray-300 rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm max-h-96 overflow-y-auto">
          <div
            v-if="logs.length === 0"
            class="text-gray-500 text-center py-12"
          >
            Логи не найдены
          </div>
          <div v-else>
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="mb-1"
            >
              {{ log }}
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
import { logger } from '@/utils/logger'

const router = useRouter()
const logs = ref([])
const selectedCategory = ref('all')

const getToken = () => localStorage.getItem('adminToken')

const goToHome = () => router.push('/')
const goToDashboard = () => router.push('/admin/dashboard')

const loadLogs = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const category = selectedCategory.value === 'all' ? 'app' : selectedCategory.value
    const response = await fetch(`/api/v1/admin/logs/${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      logs.value = data.logs || []
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки логов')
    }
  } catch (error) {
    logger.error('Load logs error:', error)
    alert('Ошибка загрузки логов: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const cleanupLogs = async () => {
  if (!confirm('Очистить все логи? Это действие нельзя отменить.')) return
  
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/logs/cleanup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      alert('✅ Логи очищены')
      await loadLogs()
    } else {
      throw new Error(data.error || data.message || 'Ошибка очистки')
    }
  } catch (error) {
    logger.error('Cleanup logs error:', error)
    alert('Ошибка очистки логов: ' + (error.message || 'Неизвестная ошибка'))
  }
}

onMounted(() => {
  loadLogs()
})
</script>



