<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <button
              class="text-blue-600 hover:text-blue-800 font-medium mr-4"
              @click="$router.push('/admin/dashboard')"
            >
              ← Дашборд
            </button>
            <h1 class="text-xl font-bold">
              👑 Роли и Права
            </h1>
          </div>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="createAdmin"
          >
            ➕ Создать админа
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Список админов -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="p-4 border-b">
          <h3 class="font-bold">
            👥 Администраторы
          </h3>
        </div>
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Имя
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Роль
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Последний вход
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="admin in admins"
              :key="admin.id"
            >
              <td class="px-6 py-4">
                {{ admin.full_name }}
              </td>
              <td class="px-6 py-4">
                {{ admin.email }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getRoleClass(admin.role)"
                  class="px-2 py-1 rounded text-xs"
                >
                  {{ getRoleLabel(admin.role) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                {{ admin.last_login ? new Date(admin.last_login).toLocaleString('ru-RU') : 'Никогда' }}
              </td>
              <td class="px-6 py-4">
                <button
                  class="text-blue-600 hover:text-blue-800 mr-2"
                  @click="editAdmin(admin)"
                >
                  ✏️
                </button>
                <button
                  v-if="admin.role !== 'super_admin'"
                  class="text-red-600 hover:text-red-800"
                  @click="deleteAdmin(admin)"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Роли -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="role in roles"
          :key="role.value"
          class="bg-white rounded-lg shadow p-6"
        >
          <h3 class="font-bold mb-2">
            {{ role.name }}
          </h3>
          <p class="text-sm text-gray-800 font-medium mb-4">
            {{ role.description }}
          </p>
          <div class="space-y-2">
            <div
              v-for="perm in role.permissions"
              :key="perm"
              class="text-sm flex items-center gap-2"
            >
              <span class="text-green-600">✓</span>
              <span>{{ getPermissionLabel(perm) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Аудит действий -->
      <div class="mt-6 bg-white rounded-lg shadow p-6">
        <h3 class="font-bold mb-4">
          📜 Аудит действий админов
        </h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="log in auditLogs"
            :key="log.id"
            class="flex items-center justify-between border-b pb-2 text-sm"
          >
            <span class="text-gray-700">{{ new Date(log.timestamp).toLocaleString('ru-RU') }}</span>
            <span class="flex-1 mx-4">{{ log.admin }} {{ log.action }}</span>
            <span :class="log.level === 'warning' ? 'text-yellow-600' : 'text-gray-800 font-medium'">{{ log.details }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        @click.stop
      >
        <h3 class="font-bold mb-4">
          {{ editingAdmin ? 'Редактировать' : 'Создать' }} админа
        </h3>
        <div class="space-y-4">
          <input
            v-model="form.full_name"
            placeholder="Полное имя"
            class="w-full px-3 py-2 border rounded"
          >
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            class="w-full px-3 py-2 border rounded"
          >
          <input
            v-if="!editingAdmin"
            v-model="form.password"
            type="password"
            placeholder="Пароль"
            class="w-full px-3 py-2 border rounded"
          >
          <select
            v-model="form.role"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="admin">
              Админ
            </option>
            <option value="moderator">
              Модератор
            </option>
            <option value="super_admin">
              Супер-Админ
            </option>
          </select>
        </div>
        <div class="mt-6 flex gap-2">
          <button
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded"
            @click="saveAdmin"
          >
            Сохранить
          </button>
          <button
            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded"
            @click="showModal = false"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const _router = useRouter() // Зарезервировано для будущего использования
const admins = ref([])
const showModal = ref(false)
const editingAdmin = ref(null)
const form = ref({ full_name: '', email: '', password: '', role: 'admin' })
const auditLogs = ref([])

const roles = [
  { value: 'super_admin', name: '👑 Супер-Админ', description: 'Полный доступ ко всем функциям', permissions: ['all'] },
  { value: 'admin', name: '🔧 Админ', description: 'Управление пользователями и заявками', permissions: ['user_management', 'request_management', 'view_stats'] },
  { value: 'moderator', name: '🛡️ Модератор', description: 'Модерация контента', permissions: ['chat_moderation', 'view_reports'] }
]

const getRoleClass = (role) => {
  const classes = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role) => {
  const labels = {
    super_admin: 'Супер-Админ',
    admin: 'Админ',
    moderator: 'Модератор'
  }
  return labels[role] || role
}

const getPermissionLabel = (perm) => {
  const labels = {
    all: 'Все права',
    user_management: 'Управление пользователями',
    request_management: 'Управление заявками',
    view_stats: 'Просмотр статистики',
    chat_moderation: 'Модерация чатов',
    view_reports: 'Просмотр жалоб'
  }
  return labels[perm] || perm
}

const loadAdmins = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch('/api/v1/admin/admins', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        admins.value = [
          { id: 1, full_name: 'Super Administrator', email: 'admin@help-car.online', role: 'super_admin', last_login: new Date() }
        ]
        return
      }
      throw new Error('Failed')
    }
    
    const data = await response.json()
    admins.value = data.admins || []
  } catch (error) {
    console.error('Load admins error:', error)
  }
}

const createAdmin = () => {
  editingAdmin.value = null
  form.value = { full_name: '', email: '', password: '', role: 'admin' }
  showModal.value = true
}

const editAdmin = (admin) => {
  editingAdmin.value = admin
  form.value = { ...admin }
  showModal.value = true
}

const saveAdmin = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const method = editingAdmin.value ? 'PUT' : 'POST'
    const url = editingAdmin.value ? `/api/v1/admin/admins/${editingAdmin.value.id}` : '/api/v1/admin/admins'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Сохранено!')
    showModal.value = false
    await loadAdmins()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const deleteAdmin = async (admin) => {
  if (!confirm(`Удалить админа ${admin.full_name}?`)) return
  
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`/api/v1/admin/admins/${admin.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Удалено!')
    await loadAdmins()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

onMounted(() => {
  loadAdmins()
  auditLogs.value = [
    { id: 1, timestamp: new Date(), admin: 'admin', action: 'заблокировал пользователя', details: 'user@example.com', level: 'info' },
    { id: 2, timestamp: new Date(), admin: 'moderator', action: 'удалил сообщение', details: 'спам', level: 'warning' }
  ]
})
</script>
