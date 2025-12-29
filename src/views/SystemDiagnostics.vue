<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          🔧 Системная диагностика
        </h1>
        <p class="text-gray-600">
          Мониторинг состояния системы и просмотр логов
        </p>
      </div>

      <!-- Статус системы -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Краткий статус -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            📊 Статус системы
          </h3>
          <div
            v-if="systemStatus"
            class="space-y-3"
          >
            <div class="flex items-center">
              <span class="text-sm text-gray-600">Общее состояние:</span>
              <span
                :class="getStatusClass(systemStatus.status)"
                class="ml-2 px-2 py-1 rounded text-sm font-medium"
              >
                {{ getStatusText(systemStatus.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-600">
              {{ systemStatus.message }}
            </p>
            <div
              v-if="systemStatus.issues"
              class="text-sm"
            >
              <p class="text-red-600 font-medium">
                Проблемы:
              </p>
              <ul class="list-disc list-inside text-red-600">
                <li
                  v-for="issue in systemStatus.issues"
                  :key="issue"
                >
                  {{ issue }}
                </li>
              </ul>
            </div>
          </div>
          <div
            v-else
            class="text-gray-500"
          >
            Загрузка...
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Быстрые действия
          </h3>
          <div class="space-y-2">
            <button 
              :disabled="loading" 
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              @click="refreshStatus"
            >
              🔄 Обновить статус
            </button>
            <button 
              :disabled="loading" 
              class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              @click="runFullDiagnostic"
            >
              🔍 Полная диагностика
            </button>
            <button 
              :disabled="loading" 
              class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              @click="clearLogs"
            >
              🗑️ Очистить логи
            </button>
          </div>
        </div>

        <!-- Информация о системе -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            ℹ️ Информация
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Время работы:</span>
              <span class="font-medium">{{ uptime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Версия API:</span>
              <span class="font-medium">v1</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Последняя проверка:</span>
              <span class="font-medium">{{ lastCheck }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Детальная диагностика -->
      <div
        v-if="fullDiagnostic"
        class="bg-white rounded-lg shadow mb-8"
      >
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            🔍 Детальная диагностика
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Последняя проверка: {{ formatDate(fullDiagnostic.timestamp) }}
          </p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="check in fullDiagnostic.checks" 
              :key="check.name"
              class="border rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">
                  {{ check.name }}
                </h4>
                <span
                  :class="getStatusClass(check.status)"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ getStatusText(check.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-600">
                <pre class="whitespace-pre-wrap">{{ JSON.stringify(check.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Логи -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              📋 Логи системы
            </h3>
            <div class="flex items-center space-x-4">
              <select
                v-model="selectedLogCategory"
                class="border rounded px-3 py-1"
                @change="loadLogs"
              >
                <option value="system">
                  Система
                </option>
                <option value="errors">
                  Ошибки
                </option>
                <option value="requests">
                  Запросы
                </option>
                <option value="auth">
                  Авторизация
                </option>
                <option value="database">
                  База данных
                </option>
                <option value="websocket">
                  WebSocket
                </option>
              </select>
              <button 
                :disabled="loading" 
                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                @click="loadLogs"
              >
                🔄 Обновить
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="logs.length > 0"
            class="space-y-2 max-h-96 overflow-y-auto"
          >
            <div 
              v-for="(log, index) in logs" 
              :key="index"
              class="bg-gray-50 rounded p-3 text-sm font-mono"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="text-gray-600 text-xs mb-1">
                    {{ formatDate(log.timestamp) }} [{{ log.level }}] {{ log.category }}
                  </div>
                  <div class="text-gray-900">
                    {{ log.message }}
                  </div>
                  <div
                    v-if="log.data"
                    class="text-gray-500 mt-1"
                  >
                    <pre class="whitespace-pre-wrap">{{ JSON.stringify(log.data, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-gray-500 text-center py-8"
          >
            Нет логов для отображения
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'

// const toast = useToast()
const loading = ref(false)
const systemStatus = ref(null)
const fullDiagnostic = ref(null)
const logs = ref([])
const selectedLogCategory = ref('system')

const uptime = computed(() => {
  if (!fullDiagnostic.value) return 'Неизвестно'
  const timestamp = new Date(fullDiagnostic.value.timestamp)
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  return `${minutes} мин назад`
})

const lastCheck = computed(() => {
  if (!fullDiagnostic.value) return 'Никогда'
  return formatDate(fullDiagnostic.value.timestamp)
})

const getStatusClass = (status) => {
  switch (status) {
    case 'healthy':
    case 'passed':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'unhealthy':
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'healthy':
    case 'passed':
      return '✅ Работает'
    case 'warning':
      return '⚠️ Предупреждение'
    case 'unhealthy':
    case 'failed':
      return '❌ Ошибка'
    default:
      return '❓ Неизвестно'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const refreshStatus = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/diagnostics/status')
    const data = await response.json()
    if (data.success) {
      systemStatus.value = data.data
      toast.success('Статус обновлен')
    } else {
      toast.error('Ошибка получения статуса')
    }
  } catch (error) {
    toast.error('Ошибка подключения к API')
  } finally {
    loading.value = false
  }
}

const runFullDiagnostic = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/diagnostics/full')
    const data = await response.json()
    if (data.success) {
      fullDiagnostic.value = data.data
      systemStatus.value = {
        status: data.data.overall,
        message: data.data.overall === 'healthy' ? 'Все системы работают' : 'Обнаружены проблемы',
        issues: data.data.checks.filter(c => c.status === 'failed').map(c => c.name)
      }
      toast.success('Диагностика завершена')
    } else {
      toast.error('Ошибка выполнения диагностики')
    }
  } catch (error) {
    toast.error('Ошибка подключения к API')
  } finally {
    loading.value = false
  }
}

const loadLogs = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/v1/diagnostics/logs/${selectedLogCategory.value}?lines=100`)
    const data = await response.json()
    if (data.success) {
      logs.value = data.data.logs.map(log => {
        try {
          return JSON.parse(log)
        } catch {
          return { message: log, timestamp: new Date().toISOString(), level: 'INFO', category: 'UNKNOWN' }
        }
      })
    } else {
      toast.error('Ошибка загрузки логов')
    }
  } catch (error) {
    toast.error('Ошибка подключения к API')
  } finally {
    loading.value = false
  }
}

const clearLogs = async () => {
  if (!confirm('Вы уверены, что хотите очистить логи?')) return
  
  loading.value = true
  try {
    const response = await fetch('/api/v1/diagnostics/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysToKeep: 0 })
    })
    const data = await response.json()
    if (data.success) {
      toast.success('Логи очищены')
      loadLogs()
    } else {
      toast.error('Ошибка очистки логов')
    }
  } catch (error) {
    toast.error('Ошибка подключения к API')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshStatus()
  runFullDiagnostic()
  loadLogs()
})
</script>
