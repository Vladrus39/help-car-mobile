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
              ⚙️ Настройки Системы
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              :disabled="saving"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              @click="saveAllSettings"
            >
              {{ saving ? '💾 Сохранение...' : '💾 Сохранить всё' }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Комиссия -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            💰 Комиссия платформы
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Комиссия (%)</label>
              <input 
                v-model.number="settings.commission" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                class="w-full px-3 py-2 border rounded-md"
              >
              <p class="text-xs text-gray-700 mt-1">
                Текущая: {{ settings.commission }}%
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Минимальная сумма заявки (₽)</label>
              <input 
                v-model.number="settings.minAmount" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Максимальная сумма заявки (₽)</label>
              <input 
                v-model.number="settings.maxAmount" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Лимиты -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            🔢 Лимиты
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Макс. заявок в день на пользователя</label>
              <input 
                v-model.number="settings.maxRequestsPerDay" 
                type="number" 
                min="1"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Макс. активных заявок одновременно</label>
              <input 
                v-model.number="settings.maxActiveRequests" 
                type="number" 
                min="1"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Время автоотмены заявки (часы)</label>
              <input 
                v-model.number="settings.autoCancelHours" 
                type="number" 
                min="1"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Категории проблем -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            🚗 Категории проблем
          </h3>
          <div class="space-y-3">
            <div
              v-for="(cat, idx) in settings.problemTypes"
              :key="idx"
              class="flex items-center gap-2"
            >
              <input 
                v-model="cat.enabled" 
                type="checkbox"
                class="rounded"
              >
              <input 
                v-model="cat.name" 
                type="text"
                class="flex-1 px-3 py-2 border rounded-md"
                :disabled="!cat.enabled"
              >
              <button
                class="text-red-600 hover:text-red-800"
                @click="removeCategory(idx)"
              >
                🗑️
              </button>
            </div>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="addCategory"
            >
              ➕ Добавить категорию
            </button>
          </div>
        </div>

        <!-- Уведомления -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            🔔 Уведомления
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Email уведомления</span>
              <input
                v-model="settings.emailNotifications"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Push уведомления</span>
              <input
                v-model="settings.pushNotifications"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">SMS уведомления</span>
              <input
                v-model="settings.smsNotifications"
                type="checkbox"
                class="rounded"
              >
            </div>
          </div>
        </div>

        <!-- Модерация -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            🛡️ Модерация
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Премодерация заявок</span>
              <input
                v-model="settings.premoderation"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Автобан за спам</span>
              <input
                v-model="settings.autoBanSpam"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Жалоб до блокировки</label>
              <input 
                v-model.number="settings.reportsToBlock" 
                type="number" 
                min="1"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Техническое -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">
            ⚙️ Техническое
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Режим обслуживания</span>
              <input
                v-model="settings.maintenanceMode"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Регистрация открыта</span>
              <input
                v-model="settings.registrationOpen"
                type="checkbox"
                class="rounded"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Версия API</label>
              <input 
                v-model="settings.apiVersion" 
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                readonly
              >
            </div>
          </div>
        </div>
      </div>

      <!-- История изменений -->
      <div class="mt-6 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold mb-4">
          📜 История изменений настроек
        </h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(change, idx) in changeHistory"
            :key="idx"
            class="flex items-start gap-3 text-sm border-b pb-2"
          >
            <span class="text-gray-700">{{ new Date(change.timestamp).toLocaleString('ru-RU') }}</span>
            <span class="flex-1">{{ change.admin }} изменил {{ change.setting }}: {{ change.oldValue }} → {{ change.newValue }}</span>
          </div>
          <div
            v-if="!changeHistory.length"
            class="text-gray-400 text-center py-4"
          >
            История пуста
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
const saving = ref(false)

const settings = ref({
  commission: 10,
  minAmount: 100,
  maxAmount: 50000,
  maxRequestsPerDay: 10,
  maxActiveRequests: 3,
  autoCancelHours: 24,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  premoderation: false,
  autoBanSpam: true,
  reportsToBlock: 5,
  maintenanceMode: false,
  registrationOpen: true,
  apiVersion: 'v1.0.0',
  problemTypes: [
    { enabled: true, name: '🔋 Разрядился аккумулятор', value: 'battery' },
    { enabled: true, name: '⛽ Закончился бензин', value: 'fuel' },
    { enabled: true, name: '🔧 Прокол колеса', value: 'tire' },
    { enabled: true, name: '🚛 Эвакуация', value: 'towing' },
    { enabled: true, name: '❓ Другое', value: 'other' }
  ]
})

const changeHistory = ref([])

const getToken = () => localStorage.getItem('adminToken')

const loadSettings = async () => {
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      if (response.status === 404) {
        console.log('Settings endpoint not found, using defaults')
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success && data.settings) {
      settings.value = { ...settings.value, ...data.settings }
    }
    if (data.history) {
      changeHistory.value = data.history
    }
  } catch (error) {
    console.error('Load settings error:', error)
  }
}

const saveAllSettings = async () => {
  saving.value = true
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings.value)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        alert('⚠️ API настроек ещё не реализован на backend. Настройки сохранены локально.')
        localStorage.setItem('adminSettings', JSON.stringify(settings.value))
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      alert('✅ Настройки успешно сохранены!')
      await loadSettings()
    }
  } catch (error) {
    console.error('Save settings error:', error)
    alert('Ошибка сохранения: ' + error.message)
  } finally {
    saving.value = false
  }
}

const addCategory = () => {
  settings.value.problemTypes.push({
    enabled: true,
    name: 'Новая категория',
    value: 'new_' + Date.now()
  })
}

const removeCategory = (idx) => {
  if (confirm('Удалить категорию?')) {
    settings.value.problemTypes.splice(idx, 1)
  }
}

onMounted(() => {
  loadSettings()
})
</script>
