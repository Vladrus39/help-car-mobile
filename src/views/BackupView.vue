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
              💾 Управление Бэкапами
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">
            💾 Бэкапы Базы Данных
          </h2>
          <button
            :disabled="loading"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            @click="createBackup"
          >
            {{ loading ? '⏳ Создание...' : '📦 Создать бэкап' }}
          </button>
        </div>
        <button
          class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          @click="loadBackups"
        >
          🔄 Обновить список
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Имя файла
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Размер
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Создан
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="backup in backups"
              :key="backup.name || backup.file"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ backup.name || backup.file || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ backup.sizeMB || backup.size || '-' }} MB
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ backup.created ? new Date(backup.created).toLocaleString('ru-RU') : backup.timestamp ? new Date(backup.timestamp).toLocaleString('ru-RU') : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  class="text-green-600 hover:text-green-800 mr-4"
                  @click="restoreBackup(backup.path || backup.file)"
                >
                  🔄 Восстановить
                </button>
                <button
                  class="text-blue-600 hover:text-blue-800"
                  @click="downloadBackup(backup.path || backup.file || backup.name)"
                >
                  ⬇️ Скачать
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="backups.length === 0"
          class="text-center py-12 text-gray-500"
        >
          Нет бэкапов. Создайте первый бэкап.
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
const backups = ref([])

const getToken = () => localStorage.getItem('adminToken')

const goToHome = () => router.push('/')
const goToDashboard = () => router.push('/admin/dashboard')

const loadBackups = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/backup/list', {
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
      backups.value = data.backups || []
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки бэкапов')
    }
  } catch (error) {
    logger.error('Load backups error:', error)
    alert('Ошибка загрузки бэкапов: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const createBackup = async () => {
  loading.value = true
  try {
    const token = getToken()
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
      alert('✅ Бэкап успешно создан!')
      await loadBackups()
    } else {
      throw new Error(data.error || data.message || 'Ошибка создания бэкапа')
    }
  } catch (error) {
    logger.error('Create backup error:', error)
    alert('❌ Ошибка создания бэкапа: ' + (error.message || 'Неизвестная ошибка'))
  } finally {
    loading.value = false
  }
}

const restoreBackup = async (backupPath) => {
  if (!confirm('ВНИМАНИЕ! Восстановление бэкапа перезапишет текущую базу данных. Продолжить?')) {
    return
  }

  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/backup/restore', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ backupFile: backupPath })
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
      alert('✅ Бэкап успешно восстановлен!')
      await loadBackups()
    } else {
      throw new Error(data.error || data.message || 'Ошибка восстановления')
    }
  } catch (error) {
    logger.error('Restore backup error:', error)
    alert('❌ Ошибка восстановления бэкапа: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const downloadBackup = async (backupPath) => {
  try {
    const token = getToken()
    if (!token) {
      alert('Требуется авторизация')
      router.push('/admin/login')
      return
    }

    // Создаем URL для скачивания
    const fileName = backupPath.split('/').pop() || backupPath.split('\\').pop() || 'backup.sql'
    // Безопасное кодирование URI с проверкой на валидность
    let encodedPath = ''
    try {
      if (backupPath && typeof backupPath === 'string') {
        encodedPath = encodeURIComponent(backupPath)
      } else {
        console.error('Invalid backupPath:', backupPath)
        alert('Ошибка: неверный путь к файлу резервной копии')
        return
      }
    } catch (error) {
      console.error('URI encoding error:', error, 'backupPath:', backupPath)
      alert('Ошибка кодирования пути к файлу')
      return
    }
    const downloadUrl = `/api/v1/admin/backup/download?file=${encodedPath}`
    
    // Используем fetch для скачивания с токеном
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
    
    // Скачиваем файл
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    logger.info('Backup downloaded', { file: backupPath })
    alert('✅ Бэкап успешно скачан')
  } catch (error) {
    logger.error('Download backup error:', error)
    alert('Ошибка скачивания бэкапа: ' + (error.message || 'Неизвестная ошибка'))
  }
}

onMounted(() => {
  loadBackups()
})
</script>


