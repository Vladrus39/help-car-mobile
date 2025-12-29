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
              🔔 Push-Уведомления
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-6 px-4">
      <!-- Создание уведомления -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="font-bold mb-4">
          ✉️ Отправить уведомление
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Получатели</label>
            <select
              v-model="notification.target"
              class="w-full px-3 py-2 border rounded"
            >
              <option value="all">
                Все пользователи
              </option>
              <option value="active">
                Только активные
              </option>
              <option value="helpers">
                Помощники
              </option>
              <option value="users_with_requests">
                С активными заявками
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Заголовок</label>
            <input
              v-model="notification.title"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Важное сообщение"
            >
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Сообщение</label>
            <textarea
              v-model="notification.body"
              class="w-full px-3 py-2 border rounded"
              rows="4"
              placeholder="Текст уведомления..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Ссылка (опционально)</label>
            <input
              v-model="notification.url"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="/map"
            >
          </div>

          <div class="flex gap-2">
            <button
              :disabled="sending"
              class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              @click="sendNotification"
            >
              {{ sending ? '📤 Отправка...' : '📤 Отправить' }}
            </button>
            <button
              class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              @click="resetForm"
            >
              🔄 Сбросить
            </button>
          </div>
        </div>
      </div>

      <!-- Шаблоны -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="font-bold mb-4">
          📋 Быстрые шаблоны
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="p-3 border rounded text-left hover:bg-gray-50"
            @click="useTemplate('welcome')"
          >
            <div class="font-medium">
              Приветствие
            </div>
            <div class="text-xs text-gray-700">
              Добро пожаловать в RoadHelp!
            </div>
          </button>
          <button
            class="p-3 border rounded text-left hover:bg-gray-50"
            @click="useTemplate('maintenance')"
          >
            <div class="font-medium">
              Техобслуживание
            </div>
            <div class="text-xs text-gray-700">
              Плановые работы
            </div>
          </button>
          <button
            class="p-3 border rounded text-left hover:bg-gray-50"
            @click="useTemplate('update')"
          >
            <div class="font-medium">
              Обновление
            </div>
            <div class="text-xs text-gray-700">
              Новые функции
            </div>
          </button>
          <button
            class="p-3 border rounded text-left hover:bg-gray-50"
            @click="useTemplate('promo')"
          >
            <div class="font-medium">
              Акция
            </div>
            <div class="text-xs text-gray-700">
              Специальное предложение
            </div>
          </button>
        </div>
      </div>

      <!-- История -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="font-bold mb-4">
          📜 История отправок
        </h3>
        <div class="space-y-3">
          <div
            v-for="item in history"
            :key="item.id"
            class="flex items-center justify-between border-b pb-3"
          >
            <div class="flex-1">
              <div class="font-medium">
                {{ item.title }}
              </div>
              <div class="text-sm text-gray-700">
                {{ item.body }}
              </div>
              <div class="text-xs text-gray-700 mt-1">
                {{ new Date(item.sent_at).toLocaleString('ru-RU') }} • {{ item.recipients }} получателей
              </div>
            </div>
            <div class="text-sm text-green-600">
              ✅ Отправлено
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const _router = useRouter() // Зарезервировано для будущего использования
const sending = ref(false)
const notification = ref({
  target: 'all',
  title: '',
  body: '',
  url: ''
})
const history = ref([])

const templates = {
  welcome: { title: 'Добро пожаловать!', body: 'Спасибо за регистрацию в RoadHelp. Мы всегда рядом!' },
  maintenance: { title: 'Техобслуживание', body: 'Сегодня с 00:00 до 02:00 будут проводиться технические работы.' },
  update: { title: 'Новые функции!', body: 'Мы добавили новые возможности для вашего удобства.' },
  promo: { title: 'Специальное предложение', body: 'Только сегодня скидка 20% на все услуги!' }
}

const sendNotification = async () => {
  if (!notification.value.title || !notification.value.body) {
    alert('Заполните заголовок и сообщение!')
    return
  }

  sending.value = true
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch('/api/v1/admin/notifications/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notification.value)
    })
    
    if (!response.ok && response.status !== 404) throw new Error('Failed')
    
    alert('✅ Уведомление отправлено!')
    history.value.unshift({
      id: Date.now(),
      ...notification.value,
      sent_at: new Date(),
      recipients: 150
    })
    resetForm()
  } catch (error) {
    alert('Ошибка: ' + error.message)
  } finally {
    sending.value = false
  }
}

const useTemplate = (key) => {
  const tpl = templates[key]
  notification.value.title = tpl.title
  notification.value.body = tpl.body
}

const resetForm = () => {
  notification.value = { target: 'all', title: '', body: '', url: '' }
}

onMounted(() => {
  // Load history
})
</script>
