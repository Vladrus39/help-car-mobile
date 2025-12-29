<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-blue-600 hover:text-blue-800 font-medium"
              @click="goToHome"
            >
              🏠 На главную
            </button>
            <h1 class="text-xl font-bold text-gray-900">
              🔧 Админ-панель
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-800 font-medium">{{ admin?.full_name }}</span>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              @click="logout"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-green-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-green-800 mb-2">
            ✅ Система
          </h3>
          <p class="text-3xl font-bold text-green-900">
            Работает
          </p>
        </div>
        <div class="bg-blue-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-blue-800 mb-2">
            👥 Пользователи
          </h3>
          <p class="text-3xl font-bold text-blue-900">
            {{ statistics?.totalUsers || 0 }}
          </p>
        </div>
        <div class="bg-purple-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-purple-800 mb-2">
            📋 Заявки
          </h3>
          <p class="text-3xl font-bold text-purple-900">
            {{ statistics?.activeRequests || 0 }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            🔍 Диагностика
          </h3>
          <button
            :disabled="loading"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="runDiagnostic"
          >
            Запустить
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            📋 Логи
          </h3>
          <button
            class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-2"
            @click="viewLogs"
          >
            Просмотреть
          </button>
          <button
            class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="viewErrors"
          >
            📊 Ошибки проекта
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            👥 Пользователи
          </h3>
          <button
            class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            @click="viewUsers"
          >
            Управление
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow border-2 border-orange-400">
          <h3 class="font-bold text-gray-900 mb-4">
            🚗 Заявки
          </h3>
          <p class="text-sm text-gray-700 mb-4">
            Просмотр, редактирование, удаление заявок
          </p>
          <button
            class="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 font-bold"
            @click="viewRequests"
          >
            🛠️ Управление заявками
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow border-2 border-blue-400">
          <h3 class="font-bold text-gray-900 mb-4">
            📊 Аналитика
          </h3>
          <p class="text-sm text-gray-700 mb-4">
            Графики, статистика, топ помощников
          </p>
          <button
            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
            @click="viewAnalytics"
          >
            📈 Открыть
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow border-2 border-yellow-400">
          <h3 class="font-bold text-gray-900 mb-4">
            🔧 Супер-Админ Панель
          </h3>
          <p class="text-sm text-gray-700 mb-4">
            Полное управление проектом: файлы, код, система, БД
          </p>
          <button
            class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-bold"
            @click="viewSuperAdmin"
          >
            🚀 Открыть Супер-Админ
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            💾 Бэкапы
          </h3>
          <div class="space-y-2">
            <button
              :disabled="loading"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              @click="createBackup"
            >
              📦 Создать бэкап
            </button>
            <button
              class="w-full bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
              @click="viewBackups"
            >
              📋 Список бэкапов
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow border-2 border-green-500">
          <h3 class="font-bold text-gray-900 mb-4">
            💻 Терминал
          </h3>
          <p class="text-sm text-gray-700 mb-4">
            Выполнение команд на сервере
          </p>
          <button
            class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold"
            @click="openTerminal"
          >
            🚀 Открыть Терминал
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            ⚙️ Настройки
          </h3>
          <button
            class="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="openSettings"
          >
            🛠️ Настройки системы
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            🔄 Массовые операции
          </h3>
          <button
            class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            @click="openBulk"
          >
            📦 Массовые действия
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            💬 Модерация
          </h3>
          <button
            class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            @click="openChatMod"
          >
            🛡️ Модерация чатов
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            💰 Финансы
          </h3>
          <button
            class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            @click="openFinance"
          >
            💳 Транзакции
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            🔔 Уведомления
          </h3>
          <button
            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="openNotifications"
          >
            📤 Push-уведомления
          </button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">
            👑 Роли
          </h3>
          <button
            class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="openRoles"
          >
            🔐 Роли и права
          </button>
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
const statistics = ref({})

const diagnosticResults = ref(null)

const runDiagnostic = async () => {
  loading.value = true
  diagnosticResults.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }
    
    // Вызываем эндпоинт полной диагностики
    const response = await fetch('/api/v1/diagnostics/full', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        alert('⚠️ Эндпоинт диагностики не найден. Проверьте конфигурацию backend.')
        return
      }
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${errorText ? ': ' + errorText : ''}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      diagnosticResults.value = data.data
      
      // Обновляем статистику из dashboard
      const dashboardResponse = await fetch('/api/v1/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        if (dashboardData.success) {
          statistics.value = dashboardData.dashboard || dashboardData.statistics || {}
        }
      }
      
      logger.info('Диагностика выполнена успешно', { checks: data.data.checks?.length || 0 })
      
      // Показываем результаты в модальном окне
      showDiagnosticResults(data.data)
    } else {
      throw new Error(data.message || data.error || 'Ошибка диагностики')
    }
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Неизвестная ошибка'
    logger.error('Admin diagnostic error:', { error, message: errorMessage })
    alert('❌ Ошибка выполнения диагностики: ' + errorMessage)
  } finally {
    loading.value = false
  }
}

const showDiagnosticResults = (results) => {
  const checks = results.checks || []
  const passed = checks.filter(c => c.status === 'passed').length
  const failed = checks.filter(c => c.status === 'failed').length
  const warnings = checks.filter(c => c.status === 'warning').length
  
  let message = `🔍 Результаты диагностики:\n\n`
  message += `Общий статус: ${results.overall === 'healthy' ? '✅ Здоров' : results.overall === 'warning' ? '⚠️ Предупреждения' : '❌ Проблемы'}\n\n`
  message += `Проверок выполнено: ${checks.length}\n`
  message += `✅ Успешно: ${passed}\n`
  message += `⚠️ Предупреждения: ${warnings}\n`
  message += `❌ Ошибки: ${failed}\n\n`
  
  // Показываем детали каждой проверки
  message += `Детали проверок:\n`
  checks.forEach(check => {
    const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
    message += `${icon} ${check.name}: ${check.status}\n`
    if (check.details) {
      if (check.details.message) {
        message += `   ${check.details.message}\n`
      }
      if (check.details.error) {
        message += `   Ошибка: ${check.details.error}\n`
      }
      if (check.details.warning) {
        message += `   Предупреждение: ${check.details.warning}\n`
      }
    }
    message += `\n`
  })
  
  if (failed > 0) {
    message += `\n❌ Критические проблемы:\n`
    checks.filter(c => c.status === 'failed').forEach(check => {
      const errorMsg = check.details?.error || check.details?.message || 'Ошибка'
      message += `  • ${check.name}: ${errorMsg}\n`
    })
  }
  
  if (warnings > 0) {
    message += `\n⚠️ Предупреждения:\n`
    checks.filter(c => c.status === 'warning').forEach(check => {
      const warnMsg = check.details?.warning || check.details?.message || 'Предупреждение'
      message += `  • ${check.name}: ${warnMsg}\n`
    })
  }
  
  alert(message)
}

const goToHome = () => router.push('/')
const viewLogs = () => router.push('/admin/logs')
const viewUsers = () => router.push('/admin/users')
const viewRequests = () => router.push('/admin/requests')
const viewSuperAdmin = () => router.push('/admin/super')
const viewErrors = () => router.push('/admin/errors')
const viewBackups = () => router.push('/admin/backups')
const viewAnalytics = () => router.push('/admin/analytics')
const openTerminal = () => router.push('/admin/terminal')
const openSettings = () => router.push('/admin/settings')
const openBulk = () => router.push('/admin/bulk')
const openChatMod = () => router.push('/admin/chats-moderation')
const openFinance = () => router.push('/admin/finance')
const openNotifications = () => router.push('/admin/notifications')
const openRoles = () => router.push('/admin/roles')

const createBackup = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }
    const response = await fetch('/api/v1/admin/backup/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    if (!response.ok) {
      if (response.status === 404) {
        alert('⚠️ Эндпоинт /api/v1/admin/backup/create не найден. Проверьте конфигурацию backend.')
        return
      }
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${errorText ? ': ' + errorText : ''}`)
    }
    const data = await response.json()
    if (data.success) {
      alert('✅ Бэкап успешно создан!')
    } else {
      throw new Error(data.error || data.message || 'Ошибка создания бэкапа')
    }
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Неизвестная ошибка'
    logger.error('Create backup error:', { error, message: errorMessage })
    alert('❌ Ошибка создания бэкапа: ' + errorMessage)
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin')
  router.push('/admin/login')
}

onMounted(async () => {
  const adminData = localStorage.getItem('admin')
  if (adminData) {
    try {
      admin.value = JSON.parse(adminData)
      // Загружаем статистику при монтировании
      await loadDashboardData()
    } catch (error) {
      logger.error('Admin dashboard mount error:', error)
      router.push('/admin/login')
    }
  } else {
    router.push('/admin/login')
  }
})

const loadDashboardData = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      logger.warn('No admin token found')
      return
    }
    const response = await fetch('/api/v1/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) {
      if (response.status === 401) {
        // Токен недействителен, перенаправляем на логин
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
      if (response.status === 404) {
        logger.warn('Dashboard endpoint not found (404)')
        // Не выбрасываем ошибку, просто логируем
        return
      }
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${errorText ? ': ' + errorText : ''}`)
    }
    const data = await response.json()
    if (data.success) {
      statistics.value = data.dashboard || data.statistics || {}
      logger.info('Dashboard data loaded', statistics.value)
    } else {
      logger.warn('Dashboard data load failed:', data.message || data.error)
      // Не выбрасываем ошибку, просто логируем
    }
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Неизвестная ошибка'
    logger.error('Load dashboard data error:', errorMessage, error)
    // Не показываем ошибку пользователю, просто логируем
    // Устанавливаем пустые данные, чтобы UI не сломался
    statistics.value = {
      totalUsers: 0,
      totalRequests: 0,
      activeRequests: 0,
      recentUsers: 0,
      recentRequests: 0,
      systemStatus: 'unknown'
    }
  }
}
</script>
