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
              🔄 Массовые Операции
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span
              v-if="selectedItems.length"
              class="text-sm text-gray-800 font-medium"
            >
              Выбрано: {{ selectedItems.length }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Выбор типа -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex gap-4">
          <button 
            :class="entityType === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'"
            class="px-4 py-2 rounded"
            @click="entityType = 'users'"
          >
            👥 Пользователи
          </button>
          <button 
            :class="entityType === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-200'"
            class="px-4 py-2 rounded"
            @click="entityType = 'requests'"
          >
            🚗 Заявки
          </button>
        </div>
      </div>

      <!-- Действия -->
      <div
        v-if="selectedItems.length"
        class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6"
      >
        <h3 class="font-bold mb-3">
          Массовые действия с выбранными ({{ selectedItems.length }} шт.):
        </h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="entityType === 'users'"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="bulkBlockUsers"
          >
            🚫 Заблокировать всех
          </button>
          <button
            v-if="entityType === 'users'"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            @click="bulkActivateUsers"
          >
            ✅ Активировать всех
          </button>
          <button
            class="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            @click="bulkDelete"
          >
            🗑️ Удалить всех
          </button>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="bulkExportCSV"
          >
            📥 Экспорт в CSV
          </button>
          <button
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="selectedItems = []"
          >
            ❌ Отменить выбор
          </button>
        </div>
      </div>

      <!-- Таблица пользователей -->
      <div
        v-if="entityType === 'users'"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <div class="p-4 border-b flex items-center gap-4">
          <input 
            type="checkbox"
            :checked="selectedItems.length === items.length && items.length > 0"
            class="rounded"
            @change="toggleSelectAll"
          >
          <span class="text-sm font-medium">Выбрать все</span>
          <button
            class="ml-auto bg-blue-600 text-white px-4 py-2 rounded text-sm"
            @click="loadItems"
          >
            🔄 Обновить
          </button>
        </div>
        
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                ✓
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Имя
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Статус
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="item in items"
              :key="item.id"
              :class="selectedItems.includes(item.id) ? 'bg-blue-50' : ''"
            >
              <td class="px-6 py-4">
                <input 
                  v-model="selectedItems"
                  type="checkbox"
                  :value="item.id"
                  class="rounded"
                >
              </td>
              <td class="px-6 py-4 text-sm">
                {{ item.full_name }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ item.email }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="item.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ item.is_active ? '✅ Активен' : '🚫 Заблокирован' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Таблица заявок -->
      <div
        v-if="entityType === 'requests'"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <div class="p-4 border-b flex items-center gap-4">
          <input 
            type="checkbox"
            :checked="selectedItems.length === items.length && items.length > 0"
            class="rounded"
            @change="toggleSelectAll"
          >
          <span class="text-sm font-medium">Выбрать все</span>
          <button
            class="ml-auto bg-blue-600 text-white px-4 py-2 rounded text-sm"
            @click="loadItems"
          >
            🔄 Обновить
          </button>
        </div>
        
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                ✓
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Описание
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Тип
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Статус
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="item in items"
              :key="item.id"
              :class="selectedItems.includes(item.id) ? 'bg-blue-50' : ''"
            >
              <td class="px-6 py-4">
                <input 
                  v-model="selectedItems"
                  type="checkbox"
                  :value="item.id"
                  class="rounded"
                >
              </td>
              <td class="px-6 py-4 text-sm">
                {{ item.description?.substring(0, 50) }}...
              </td>
              <td class="px-6 py-4 text-sm">
                {{ getProblemTypeName(item.problem_type) }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ getStatusName(item.status) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const entityType = ref('users')
const items = ref([])
const selectedItems = ref([])

// Перевод типов проблем
const getProblemTypeName = (type) => {
  const names = {
    battery: 'Севшая батарея',
    fuel: 'Нет топлива',
    towing: 'Буксировка',
    tire: 'Прокол колеса',
    sober_driver: 'Трезвый водитель',
    road_conflict: 'Конфликт на дороге',
    other: 'Другое'
  }
  return names[type] || type || 'Неизвестно'
}

// Перевод статусов
const getStatusName = (status) => {
  const names = {
    active: 'Активный',
    pending_acceptance: 'Ожидает принятия',
    accepted: 'Принят',
    in_progress: 'В процессе',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return names[status] || status || 'Неизвестно'
}

const getToken = () => localStorage.getItem('adminToken')

const loadItems = async () => {
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const endpoint = entityType.value === 'users' ? '/api/v1/admin/users' : '/api/v1/admin/requests'
    const response = await fetch(endpoint + '?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load')
    
    const data = await response.json()
    items.value = data.users || data.requests || []
    selectedItems.value = []
  } catch (error) {
    alert('Ошибка загрузки: ' + error.message)
  }
}

const toggleSelectAll = () => {
  if (selectedItems.value.length === items.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = items.value.map(i => i.id)
  }
}

const bulkBlockUsers = async () => {
  if (!confirm(`Заблокировать ${selectedItems.value.length} пользователей?`)) return
  
  try {
    const token = getToken()
    const response = await fetch('/api/v1/admin/users/bulk/block', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: selectedItems.value })
    })
    
    if (!response.ok) throw new Error('Failed')
    
    alert('✅ Пользователи заблокированы!')
    await loadItems()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const bulkActivateUsers = async () => {
  if (!confirm(`Активировать ${selectedItems.value.length} пользователей?`)) return
  
  try {
    const token = getToken()
    const response = await fetch('/api/v1/admin/users/bulk/activate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: selectedItems.value })
    })
    
    if (!response.ok) throw new Error('Failed')
    
    alert('✅ Пользователи активированы!')
    await loadItems()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const bulkDelete = async () => {
  if (!confirm(`⚠️ УДАЛИТЬ ${selectedItems.value.length} записей? Это необратимо!`)) return
  
  try {
    const token = getToken()
    const endpoint = entityType.value === 'users' ? '/api/v1/admin/users/bulk/delete' : '/api/v1/admin/requests/bulk/delete'
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: selectedItems.value })
    })
    
    if (!response.ok) throw new Error('Failed')
    
    alert('✅ Удалено!')
    await loadItems()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const bulkExportCSV = () => {
  const selected = items.value.filter(i => selectedItems.value.includes(i.id))
  
  let csv = ''
  if (entityType.value === 'users') {
    csv = 'ID,Имя,Email,Телефон,Статус\n'
    selected.forEach(u => {
      csv += `"${u.id}","${u.full_name}","${u.email}","${u.phone}","${u.is_active ? 'Активен' : 'Заблокирован'}"\n`
    })
  } else {
    csv = 'ID,Описание,Тип,Статус,Сумма\n'
    selected.forEach(r => {
      csv += `"${r.id}","${r.description}","${getProblemTypeName(r.problem_type)}","${getStatusName(r.status)}","${r.amount}"\n`
    })
  }
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `export_${entityType.value}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  alert('✅ CSV файл загружен!')
}

watch(entityType, () => {
  selectedItems.value = []
  loadItems()
})

onMounted(() => {
  loadItems()
})
</script>
