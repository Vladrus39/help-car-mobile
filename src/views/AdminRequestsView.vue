<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-blue-600 hover:text-blue-800 font-medium"
              @click="goToDashboard"
            >
              ← Дашборд
            </button>
            <h1 class="text-xl font-bold text-gray-900">
              🚗 Управление Заявками
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              @click="loadRequests"
            >
              🔄 Обновить
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-blue-800">
            Всего заявок
          </h3>
          <p class="text-2xl font-bold text-blue-900">
            {{ requests.length }}
          </p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-green-800">
            Активных
          </h3>
          <p class="text-2xl font-bold text-green-900">
            {{ activeRequests }}
          </p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-yellow-800">
            В процессе
          </h3>
          <p class="text-2xl font-bold text-yellow-900">
            {{ inProgressRequests }}
          </p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-purple-800">
            Завершённых
          </h3>
          <p class="text-2xl font-bold text-purple-900">
            {{ completedRequests }}
          </p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-red-800">
            Отменённых
          </h3>
          <p class="text-2xl font-bold text-red-900">
            {{ cancelledRequests }}
          </p>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по описанию, адресу..."
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">
              Все статусы
            </option>
            <option value="active">
              Активные
            </option>
            <option value="in_progress">
              В процессе
            </option>
            <option value="completed">
              Завершённые
            </option>
            <option value="cancelled">
              Отменённые
            </option>
          </select>
          <select
            v-model="filterType"
            class="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">
              Все типы
            </option>
            <option value="battery">
              Разрядился аккумулятор
            </option>
            <option value="fuel">
              Закончился бензин
            </option>
            <option value="tire">
              Прокол колеса
            </option>
            <option value="towing">
              Эвакуация
            </option>
            <option value="other">
              Другое
            </option>
          </select>
          <button
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="resetFilters"
          >
            🔄 Сбросить
          </button>
        </div>
      </div>

      <!-- Таблица заявок -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Тип
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Описание
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Адрес
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Сумма
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Дата
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ request.id.substring(0, 8) }}...
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ getProblemTypeLabel(request.problem_type) }}
              </td>
              <td class="px-6 py-4 text-sm max-w-xs truncate">
                {{ request.description }}
              </td>
              <td class="px-6 py-4 text-sm max-w-xs truncate">
                {{ request.address }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {{ request.amount }} ₽
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="getStatusClass(request.status)"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ new Date(request.created_at).toLocaleDateString('ru-RU') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    title="Просмотр"
                    @click="viewRequestDetails(request)"
                  >
                    👁️
                  </button>
                  <button
                    class="text-green-600 hover:text-green-800"
                    title="Редактировать"
                    @click="editRequest(request)"
                  >
                    ✏️
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800"
                    title="Удалить"
                    @click="deleteRequest(request)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="filteredRequests.length === 0"
          class="text-center py-12 text-gray-700"
        >
          Заявки не найдены
        </div>
      </div>
    </div>

    <!-- Модальное окно деталей заявки -->
    <div
      v-if="showDetailsModal && selectedRequest"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showDetailsModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-4">
          📋 Детали заявки
        </h2>
        <div class="space-y-3">
          <div><strong>ID:</strong> {{ selectedRequest.id }}</div>
          <div><strong>Тип проблемы:</strong> {{ getProblemTypeLabel(selectedRequest.problem_type) }}</div>
          <div><strong>Описание:</strong> {{ selectedRequest.description }}</div>
          <div><strong>Адрес:</strong> {{ selectedRequest.address }}</div>
          <div><strong>Координаты:</strong> {{ selectedRequest.latitude }}, {{ selectedRequest.longitude }}</div>
          <div><strong>Сумма:</strong> {{ selectedRequest.amount }} ₽</div>
          <div>
            <strong>Статус:</strong> <span
              :class="getStatusClass(selectedRequest.status)"
              class="px-2 py-1 rounded text-xs"
            >{{ getStatusLabel(selectedRequest.status) }}</span>
          </div>
          <div><strong>Создана:</strong> {{ new Date(selectedRequest.created_at).toLocaleString('ru-RU') }}</div>
          <div v-if="selectedRequest.User">
            <strong>Пользователь:</strong> {{ selectedRequest.User.full_name }} ({{ selectedRequest.User.email }})
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="showDetailsModal = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const requests = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const selectedRequest = ref(null)
const showDetailsModal = ref(false)

const goToDashboard = () => router.push('/admin/dashboard')
const getToken = () => localStorage.getItem('adminToken')

const filteredRequests = computed(() => {
  let result = [...requests.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.description.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  
  if (filterType.value) {
    result = result.filter(r => r.problem_type === filterType.value)
  }
  
  return result
})

const activeRequests = computed(() => requests.value.filter(r => r.status === 'active').length)
const inProgressRequests = computed(() => requests.value.filter(r => r.status === 'in_progress').length)
const completedRequests = computed(() => requests.value.filter(r => r.status === 'completed').length)
const cancelledRequests = computed(() => requests.value.filter(r => r.status === 'cancelled').length)

const getProblemTypeLabel = (type) => {
  const labels = {
    battery: '🔋 Аккумулятор',
    fuel: '⛽ Бензин',
    tire: '🔧 Колесо',
    towing: '🚛 Эвакуация',
    other: '❓ Другое'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Активна',
    in_progress: 'В процессе',
    completed: 'Завершена',
    cancelled: 'Отменена'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const loadRequests = async () => {
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      requests.value = data.requests || []
    }
  } catch (error) {
    console.error('Load requests error:', error)
    alert('Ошибка загрузки заявок')
  }
}

const viewRequestDetails = (request) => {
  selectedRequest.value = request
  showDetailsModal.value = true
}

const editRequest = (request) => {
  router.push(`/admin/requests/${request.id}/edit`)
}

const deleteRequest = async (request) => {
  if (!confirm(`Удалить заявку "${request.description.substring(0, 50)}..."?`)) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/requests/${request.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Ошибка удаления')
    
    const data = await response.json()
    if (data.success) {
      alert('✅ Заявка удалена')
      await loadRequests()
    }
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterType.value = ''
}

onMounted(() => {
  loadRequests()
})
</script>
