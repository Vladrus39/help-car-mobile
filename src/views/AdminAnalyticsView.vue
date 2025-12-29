<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-blue-600 hover:text-blue-800 font-medium"
              @click="$router.push('/admin/dashboard')"
            >
              ← Назад
            </button>
            <h1 class="text-xl font-bold text-gray-900">
              📊 Аналитика
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="period"
              class="border rounded px-3 py-1"
              @change="fetchStats"
            >
              <option value="7">
                7 дней
              </option>
              <option value="30">
                30 дней
              </option>
              <option value="90">
                90 дней
              </option>
            </select>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow p-6">
            <div class="text-3xl font-black text-blue-600">
              {{ stats.totalUsers || 0 }}
            </div>
            <div class="text-sm text-gray-700 font-medium">
              Всего пользователей
            </div>
            <div :class="['text-xs mt-1', stats.newUsersChange >= 0 ? 'text-green-500' : 'text-red-500']">
              {{ stats.newUsersChange >= 0 ? '+' : '' }}{{ stats.newUsersChange || 0 }} за период
            </div>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <div class="text-3xl font-black text-green-600">
              {{ stats.totalRequests || 0 }}
            </div>
            <div class="text-sm text-gray-700 font-medium">
              Всего заявок
            </div>
            <div class="text-xs mt-1 text-gray-400">
              {{ stats.completedRequests || 0 }} выполнено
            </div>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <div class="text-3xl font-black text-purple-600">
              {{ stats.activeUsers || 0 }}
            </div>
            <div class="text-sm text-gray-700 font-medium">
              Активных за период
            </div>
            <div class="text-xs mt-1 text-gray-400">
              {{ Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0 }}% от всех
            </div>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <div class="text-3xl font-black text-orange-600">
              {{ stats.avgResponseMinutes || 0 }}
            </div>
            <div class="text-sm text-gray-700 font-medium">
              Ср. время отклика (мин)
            </div>
          </div>
        </div>

        <!-- Requests by Day Chart -->
        <div class="bg-white rounded-xl shadow p-6">
          <h3 class="font-bold text-lg mb-4">
            📈 Заявки по дням
          </h3>
          <div class="relative h-64">
            <div class="absolute inset-0 flex items-end justify-between gap-1">
              <div 
                v-for="(day, i) in stats.requestsByDay" 
                :key="i"
                class="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition relative group"
                :style="{ height: getBarHeight(day.count, maxRequestsPerDay) + '%' }"
              >
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {{ day.date }}: {{ day.count }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-700">
            <span>{{ stats.requestsByDay?.[0]?.date }}</span>
            <span>{{ stats.requestsByDay?.[stats.requestsByDay?.length - 1]?.date }}</span>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Request Status Pie -->
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-bold text-lg mb-4">
              📊 Статусы заявок
            </h3>
            <div class="space-y-3">
              <div
                v-for="status in stats.statusDistribution"
                :key="status.status"
                class="flex items-center gap-3"
              >
                <div class="w-24 text-sm text-gray-800 font-medium">
                  {{ getStatusName(status.status) }}
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    :class="getStatusColor(status.status)"
                    class="h-full rounded-full transition-all duration-500"
                    :style="{ width: ((status.count / stats.totalRequests) * 100) + '%' }"
                  />
                </div>
                <div class="w-12 text-right text-sm font-bold">
                  {{ status.count }}
                </div>
              </div>
            </div>
          </div>

          <!-- Top Helpers -->
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-bold text-lg mb-4">
              🏆 Топ помощников
            </h3>
            <div class="space-y-3">
              <div 
                v-for="(helper, i) in stats.topHelpers" 
                :key="helper.id"
                class="flex items-center gap-3"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  :class="i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-700'"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-1 truncate text-sm">
                  {{ helper.full_name }}
                </div>
                <div class="text-sm font-bold text-green-600">
                  {{ helper.helps_count }} помощей
                </div>
              </div>
              <div
                v-if="!stats.topHelpers?.length"
                class="text-gray-400 text-center py-4"
              >
                Нет данных
              </div>
            </div>
          </div>
        </div>

        <!-- User Registrations Chart -->
        <div class="bg-white rounded-xl shadow p-6">
          <h3 class="font-bold text-lg mb-4">
            👥 Регистрации по дням
          </h3>
          <div class="relative h-48">
            <div class="absolute inset-0 flex items-end justify-between gap-1">
              <div 
                v-for="(day, i) in stats.registrationsByDay" 
                :key="i"
                class="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition relative group"
                :style="{ height: getBarHeight(day.count, maxRegistrationsPerDay) + '%' }"
              >
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {{ day.date }}: {{ day.count }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-700">
            <span>{{ stats.registrationsByDay?.[0]?.date }}</span>
            <span>{{ stats.registrationsByDay?.[stats.registrationsByDay?.length - 1]?.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const period = ref(30)
const stats = ref({
  totalUsers: 0,
  totalRequests: 0,
  completedRequests: 0,
  activeUsers: 0,
  newUsersChange: 0,
  avgResponseMinutes: 0,
  requestsByDay: [],
  registrationsByDay: [],
  statusDistribution: [],
  topHelpers: []
})

const maxRequestsPerDay = computed(() => {
  if (!stats.value.requestsByDay?.length) return 1
  return Math.max(...stats.value.requestsByDay.map(d => d.count), 1)
})

const maxRegistrationsPerDay = computed(() => {
  if (!stats.value.registrationsByDay?.length) return 1
  return Math.max(...stats.value.registrationsByDay.map(d => d.count), 1)
})

const getBarHeight = (value, max) => {
  if (!max || !value) return 5
  return Math.max((value / max) * 100, 5)
}

const getStatusName = (status) => {
  const names = {
    'pending': 'Ожидает',
    'in_progress': 'В работе',
    'completed': 'Выполнен',
    'cancelled': 'Отменён'
  }
  return names[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-500',
    'in_progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'cancelled': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const fetchStats = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const response = await fetch(`/api/v1/admin/analytics?days=${period.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        stats.value = data.analytics
      }
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
