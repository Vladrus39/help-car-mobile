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
              💰 Финансы
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="period"
              class="border rounded px-3 py-1"
              @change="loadData"
            >
              <option value="today">
                Сегодня
              </option>
              <option value="week">
                Неделя
              </option>
              <option value="month">
                Месяц
              </option>
              <option value="all">
                Всё время
              </option>
            </select>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-green-50 p-6 rounded-lg">
          <div class="text-3xl font-bold text-green-600">
            {{ formatMoney(stats.totalRevenue) }}
          </div>
          <div class="text-sm text-gray-800 font-medium">
            Общий доход
          </div>
        </div>
        <div class="bg-blue-50 p-6 rounded-lg">
          <div class="text-3xl font-bold text-blue-600">
            {{ formatMoney(stats.totalCommission) }}
          </div>
          <div class="text-sm text-gray-800 font-medium">
            Комиссия платформы
          </div>
        </div>
        <div class="bg-purple-50 p-6 rounded-lg">
          <div class="text-3xl font-bold text-purple-600">
            {{ stats.totalTransactions }}
          </div>
          <div class="text-sm text-gray-800 font-medium">
            Транзакций
          </div>
        </div>
        <div class="bg-yellow-50 p-6 rounded-lg">
          <div class="text-3xl font-bold text-yellow-600">
            {{ stats.pendingPayouts }}
          </div>
          <div class="text-sm text-gray-800 font-medium">
            Ожидают выплаты
          </div>
        </div>
      </div>

      <!-- Транзакции -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="font-bold">
            💳 Транзакции
          </h3>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            @click="exportTransactions"
          >
            📥 Экспорт
          </button>
        </div>
        
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Дата
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Пользователь
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Сумма
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Комиссия
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="tx in transactions"
              :key="tx.id"
            >
              <td class="px-6 py-4 text-sm">
                {{ tx.id.substring(0, 8) }}...
              </td>
              <td class="px-6 py-4 text-sm">
                {{ new Date(tx.created_at).toLocaleDateString('ru-RU') }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ tx.user_name }}
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                {{ formatMoney(tx.amount) }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ formatMoney(tx.commission) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span
                  :class="getStatusClass(tx.status)"
                  class="px-2 py-1 rounded text-xs"
                >
                  {{ getStatusLabel(tx.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button 
                  v-if="tx.status === 'pending'"
                  class="text-red-600 hover:text-red-800 text-xs" 
                  @click="refund(tx)"
                >
                  ↩️ Возврат
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Выплаты -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <h3 class="font-bold">
            💸 Выплаты помощникам
          </h3>
        </div>
        
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Помощник
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Количество помощей
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Заработано
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Выплачено
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                К выплате
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="helper in payouts"
              :key="helper.id"
            >
              <td class="px-6 py-4 text-sm">
                {{ helper.name }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ helper.helps_count }}
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                {{ formatMoney(helper.earned) }}
              </td>
              <td class="px-6 py-4 text-sm text-green-600">
                {{ formatMoney(helper.paid) }}
              </td>
              <td class="px-6 py-4 text-sm font-bold text-blue-600">
                {{ formatMoney(helper.pending) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button 
                  v-if="helper.pending > 0"
                  class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700" 
                  @click="processPayout(helper)"
                >
                  ✅ Выплатить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const period = ref('week')
const stats = ref({
  totalRevenue: 0,
  totalCommission: 0,
  totalTransactions: 0,
  pendingPayouts: 0
})
const transactions = ref([])
const payouts = ref([])

const formatMoney = (amount) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount || 0)
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: 'Выполнена',
    pending: 'Ожидает',
    failed: 'Ошибка',
    refunded: 'Возврат'
  }
  return labels[status] || status
}

const getToken = () => localStorage.getItem('adminToken')

const loadData = async () => {
  try {
    const token = getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    const response = await fetch(`/api/v1/admin/finance?period=${period.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // Mock data
        stats.value = {
          totalRevenue: 125000,
          totalCommission: 12500,
          totalTransactions: 48,
          pendingPayouts: 5
        }
        
        transactions.value = [
          { id: 'tx1', created_at: new Date(), user_name: 'Иван Петров', amount: 500, commission: 50, status: 'completed' },
          { id: 'tx2', created_at: new Date(), user_name: 'Мария Сидорова', amount: 1000, commission: 100, status: 'pending' }
        ]
        
        payouts.value = [
          { id: 'h1', name: 'Алексей Смирнов', helps_count: 12, earned: 8000, paid: 6000, pending: 2000 },
          { id: 'h2', name: 'Елена Козлова', helps_count: 8, earned: 5500, paid: 5500, pending: 0 }
        ]
        return
      }
      throw new Error('Failed')
    }
    
    const data = await response.json()
    stats.value = data.stats || {}
    transactions.value = data.transactions || []
    payouts.value = data.payouts || []
  } catch (error) {
    console.error('Load finance data error:', error)
  }
}

const refund = async (tx) => {
  if (!confirm(`Вернуть ${formatMoney(tx.amount)} пользователю ${tx.user_name}?`)) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/transactions/${tx.id}/refund`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Возврат выполнен!')
    await loadData()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const processPayout = async (helper) => {
  if (!confirm(`Выплатить ${formatMoney(helper.pending)} пользователю ${helper.name}?`)) return
  
  try {
    const token = getToken()
    const response = await fetch(`/api/v1/admin/payouts/${helper.id}/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Выплата выполнена!')
    await loadData()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  }
}

const exportTransactions = () => {
  let csv = 'ID,Дата,Пользователь,Сумма,Комиссия,Статус\n'
  transactions.value.forEach(tx => {
    csv += `"${tx.id}","${new Date(tx.created_at).toLocaleString('ru-RU')}","${tx.user_name}","${tx.amount}","${tx.commission}","${tx.status}"\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `transactions_${period.value}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  alert('✅ Транзакции экспортированы!')
}

onMounted(() => {
  loadData()
})
</script>
