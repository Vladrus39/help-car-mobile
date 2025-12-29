<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              📊 Логи Ошибок
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
              @click="goToHome"
            >
              🏠 На главную
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              @click="goToDashboard"
            >
              ← Дашборд
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Статистика -->
      <div
        v-if="stats"
        class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
      >
        <div class="bg-red-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-red-800">
            Всего ошибок
          </h3>
          <p class="text-2xl font-bold text-red-900">
            {{ stats.total || 0 }}
          </p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-yellow-800">
            Не исправлено
          </h3>
          <p class="text-2xl font-bold text-yellow-900">
            {{ stats.unresolved || 0 }}
          </p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-blue-800">
            За 24 часа
          </h3>
          <p class="text-2xl font-bold text-blue-900">
            {{ stats.recent || 0 }}
          </p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-green-800">
            Исправлено
          </h3>
          <p class="text-2xl font-bold text-green-900">
            {{ (stats.total || 0) - (stats.unresolved || 0) }}
          </p>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            v-model="filters.level"
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">
              Все уровни
            </option>
            <option value="error">
              Error
            </option>
            <option value="warning">
              Warning
            </option>
            <option value="info">
              Info
            </option>
            <option value="debug">
              Debug
            </option>
          </select>
          <select
            v-model="filters.source"
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">
              Все источники
            </option>
            <option value="frontend">
              Frontend
            </option>
            <option value="backend">
              Backend
            </option>
            <option value="api">
              API
            </option>
          </select>
          <select
            v-model="filters.resolved"
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">
              Все
            </option>
            <option value="false">
              Не исправлено
            </option>
            <option value="true">
              Исправлено
            </option>
          </select>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="loadErrors"
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      <!-- Список ошибок -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Уровень
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Сообщение
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Источник
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Повторений
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Последнее
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="error in errors"
              :key="error.id"
              :class="error.resolved ? 'bg-gray-50' : ''"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    error.level === 'error' ? 'bg-red-100 text-red-800' : '',
                    error.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : '',
                    error.level === 'info' ? 'bg-blue-100 text-blue-800' : '',
                    error.level === 'debug' ? 'bg-gray-100 text-gray-800' : ''
                  ]"
                >
                  {{ error.level }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ error.message.substring(0, 100) }}
                </div>
                <div
                  v-if="error.category"
                  class="text-xs text-gray-500"
                >
                  {{ error.category }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ error.source || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ error.occurrence_count }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(error.last_occurred).toLocaleString('ru-RU') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  v-if="!error.resolved"
                  class="text-green-600 hover:text-green-800"
                  @click="resolveError(error.id)"
                >
                  ✅ Исправить
                </button>
                <span
                  v-else
                  class="text-gray-400"
                >Исправлено</span>
                <button
                  class="text-blue-600 hover:text-blue-800 ml-2"
                  @click="showDetails(error)"
                >
                  👁️ Детали
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модальное окно с деталями -->
      <div
        v-if="selectedError"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="selectedError = null"
      >
        <div
          class="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto"
          @click.stop
        >
          <h3 class="text-lg font-bold mb-4">
            Детали ошибки
          </h3>
          <pre class="text-xs bg-gray-100 p-4 rounded overflow-x-auto">{{ JSON.stringify(selectedError, null, 2) }}</pre>
          <button
            class="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="selectedError = null"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const errors = ref([])
const stats = ref(null)
const selectedError = ref(null)
const filters = ref({
  level: '',
  source: '',
  resolved: ''
})

const getToken = () => localStorage.getItem('adminToken')

const loadErrors = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const params = new URLSearchParams()
    if (filters.value.level) params.append('level', filters.value.level)
    if (filters.value.source) params.append('source', filters.value.source)
    if (filters.value.resolved) params.append('resolved', filters.value.resolved)

    const response = await fetch(`/api/v1/admin/errors?${params.toString()}`, {
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
      errors.value = data.errors || []
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки ошибок')
    }
  } catch (error) {
    console.error('Load errors error:', error)
    alert('Ошибка загрузки ошибок: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const loadStats = async () => {
  try {
    const token = getToken()
    if (!token) {
      return // Не показываем ошибку, если просто нет токена
    }

    const response = await fetch('/api/v1/admin/errors/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return // Не показываем ошибку для 401
      }
      return // Не показываем ошибку для статистики
    }
    
    const data = await response.json()
    if (data.success) {
      stats.value = data.stats
    }
  } catch (error) {
    console.error('Load stats error:', error)
    // Не показываем ошибку для статистики
  }
}

const resolveError = async (errorId) => {
  if (!confirm('Отметить ошибку как исправленную?')) return
  
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch(`/api/v1/admin/errors/${errorId}/resolve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note: 'Исправлено через админ-панель' })
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
      await loadErrors()
      await loadStats()
      alert('✅ Ошибка отмечена как исправленная')
    } else {
      throw new Error(data.error || data.message || 'Ошибка при отметке')
    }
  } catch (error) {
    console.error('Resolve error error:', error)
    alert('❌ Ошибка при отметке ошибки: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const showDetails = (error) => {
  selectedError.value = error
}

const goToHome = () => {
  router.push('/')
}

const goToDashboard = () => {
  router.push('/admin/dashboard')
}

onMounted(() => {
  loadErrors()
  loadStats()
})
</script>



