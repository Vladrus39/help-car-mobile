<template>
  <div class="min-h-screen bg-gray-900 text-green-400">
    <nav class="bg-gray-800 shadow-lg border-b border-green-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-green-400 hover:text-green-300 font-medium"
              @click="goToDashboard"
            >
              ← Назад в Дашборд
            </button>
            <h1 class="text-xl font-bold text-green-400">
              💻 Админ Терминал
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              @click="clearTerminal"
            >
              🗑️ Очистить
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Быстрые команды -->
      <div class="bg-gray-800 rounded-lg p-4 mb-4 border border-green-500">
        <h3 class="text-sm font-bold mb-3 text-green-300">
          ⚡ Быстрые команды:
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('docker ps')"
          >
            📦 Docker PS
          </button>
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('docker logs roadhelp-backend --tail 50')"
          >
            📋 Backend Logs
          </button>
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('docker stats --no-stream')"
          >
            📊 Docker Stats
          </button>
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('free -h')"
          >
            💾 Memory Info
          </button>
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('df -h')"
          >
            💿 Disk Space
          </button>
          <button
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xs text-white"
            @click="executeQuickCommand('docker restart roadhelp-backend')"
          >
            🔄 Restart Backend
          </button>
          <button
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xs text-white"
            @click="executeQuickCommand('docker restart roadhelp-nginx')"
          >
            🔄 Restart Nginx
          </button>
          <button
            class="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs"
            @click="executeQuickCommand('pm2 list')"
          >
            📋 PM2 List
          </button>
        </div>
      </div>

      <!-- Терминал -->
      <div class="bg-black rounded-lg shadow-2xl border-2 border-green-500 overflow-hidden">
        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-green-500">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500" />
            <div class="w-3 h-3 rounded-full bg-yellow-500" />
            <div class="w-3 h-3 rounded-full bg-green-500" />
            <span class="ml-4 text-sm text-gray-400">admin@help-car.online</span>
          </div>
          <div class="text-xs text-gray-500">
            {{ new Date().toLocaleString('ru-RU') }}
          </div>
        </div>
        
        <div 
          ref="terminalOutput" 
          class="p-4 h-96 overflow-y-auto font-mono text-sm"
          style="background: #0d1117;"
        >
          <div
            v-for="(line, index) in output"
            :key="index"
          >
            <div
              v-if="line.type === 'command'"
              class="text-green-400 mb-1"
            >
              <span class="text-blue-400">admin@server</span>
              <span class="text-gray-500">:</span>
              <span class="text-purple-400">~</span>
              <span class="text-gray-500">$</span>
              {{ line.text }}
            </div>
            <div
              v-else-if="line.type === 'output'"
              class="text-gray-300 whitespace-pre-wrap mb-1"
            >
              {{ line.text }}
            </div>
            <div
              v-else-if="line.type === 'error'"
              class="text-red-400 whitespace-pre-wrap mb-1"
            >
              {{ line.text }}
            </div>
            <div
              v-else-if="line.type === 'success'"
              class="text-green-400 whitespace-pre-wrap mb-1"
            >
              ✅ {{ line.text }}
            </div>
          </div>
          
          <div class="flex items-center mt-2">
            <span class="text-blue-400">admin@server</span>
            <span class="text-gray-500">:</span>
            <span class="text-purple-400">~</span>
            <span class="text-gray-500">$</span>
            <input
              ref="commandInput"
              v-model="currentCommand"
              class="ml-2 flex-1 bg-transparent outline-none text-green-400"
              placeholder="Введите команду..."
              autofocus
              @keydown.enter="executeCommand"
              @keydown.up="historyUp"
              @keydown.down="historyDown"
              @keydown.tab.prevent="autoComplete"
            >
          </div>
        </div>
      </div>

      <!-- Помощь -->
      <div class="mt-4 bg-gray-800 rounded-lg p-4 border border-green-500">
        <h3 class="text-sm font-bold mb-2 text-green-300">
          💡 Доступные команды:
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div><span class="text-yellow-400">help</span> - Показать справку</div>
          <div><span class="text-yellow-400">clear</span> - Очистить терминал</div>
          <div><span class="text-yellow-400">docker ps</span> - Список контейнеров</div>
          <div><span class="text-yellow-400">docker logs [container]</span> - Логи контейнера</div>
          <div><span class="text-yellow-400">docker restart [container]</span> - Перезапуск</div>
          <div><span class="text-yellow-400">status</span> - Статус системы</div>
          <div><span class="text-yellow-400">users</span> - Список пользователей</div>
          <div><span class="text-yellow-400">requests</span> - Список заявок</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const terminalOutput = ref(null)
const commandInput = ref(null)
const currentCommand = ref('')
const output = ref([])
const commandHistory = ref([])
const historyIndex = ref(-1)

// Перевод типов проблем
const getProblemTypeName = (type) => {
  const names = {
    battery: 'Батарея',
    fuel: 'Топливо',
    towing: 'Буксировка',
    tire: 'Колесо',
    sober_driver: 'Трезвый водитель',
    road_conflict: 'Конфликт',
    other: 'Другое'
  }
  return names[type] || type
}

// Перевод статусов
const getStatusName = (status) => {
  const names = {
    active: 'Активный',
    pending_acceptance: 'Ожидает',
    accepted: 'Принят',
    in_progress: 'В процессе',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return names[status] || status
}

const goToDashboard = () => router.push('/admin/dashboard')

const clearTerminal = () => {
  output.value = []
  addOutput('success', 'Терминал очищен')
}

const addOutput = (type, text) => {
  output.value.push({ type, text })
  nextTick(() => {
    if (terminalOutput.value) {
      terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight
    }
  })
}

const executeQuickCommand = (command) => {
  currentCommand.value = command
  executeCommand()
}

const executeCommand = async () => {
  const cmd = currentCommand.value.trim()
  if (!cmd) return

  addOutput('command', cmd)
  commandHistory.value.unshift(cmd)
  historyIndex.value = -1
  currentCommand.value = ''

  // Обработка встроенных команд
  if (cmd === 'help') {
    addOutput('output', 'Доступные команды:\n  help - Справка\n  clear - Очистить\n  docker ps - Контейнеры\n  docker logs [name] - Логи\n  status - Статус системы\n  users - Пользователи\n  requests - Заявки')
    return
  }

  if (cmd === 'clear') {
    clearTerminal()
    return
  }

  if (cmd === 'status') {
    await checkSystemStatus()
    return
  }

  if (cmd === 'users') {
    await listUsers()
    return
  }

  if (cmd === 'requests') {
    await listRequests()
    return
  }

  // Выполнение команды на сервере
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      addOutput('error', 'Не авторизован')
      router.push('/admin/login')
      return
    }

    const response = await fetch('/api/v1/admin/terminal/execute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command: cmd })
    })

    if (!response.ok) {
      if (response.status === 401) {
        addOutput('error', 'Сессия истекла. Войдите снова.')
        router.push('/admin/login')
        return
      }
      if (response.status === 404) {
        addOutput('error', 'Терминал API недоступен. Команда будет выполнена локально.')
        executeLocalCommand(cmd)
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      addOutput('output', data.output || 'Команда выполнена успешно')
    } else {
      addOutput('error', data.error || 'Ошибка выполнения команды')
    }
  } catch (error) {
    addOutput('error', `Ошибка: ${error.message}`)
  }
}

const executeLocalCommand = (cmd) => {
  // Локальные команды-заглушки
  addOutput('output', `Выполнение локальной команды: ${cmd}\n(Для реального выполнения команд на сервере требуется API)`)
}

const checkSystemStatus = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch('/api/v1/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      const stats = data.dashboard || {}
      addOutput('output', `Статус системы:\n  Пользователей: ${stats.totalUsers || 0}\n  Заявок: ${stats.totalRequests || 0}\n  Активных заявок: ${stats.activeRequests || 0}`)
    } else {
      addOutput('error', 'Не удалось получить статус')
    }
  } catch (error) {
    addOutput('error', `Ошибка: ${error.message}`)
  }
}

const listUsers = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch('/api/v1/admin/users?limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      const users = data.users || data.data || []
      let output = `Пользователи (${users.length}):\n`
      users.forEach((u, i) => {
        output += `  ${i + 1}. ${u.full_name || u.name} (${u.email}) - ${u.is_active ? '✓' : '✗'}\n`
      })
      addOutput('output', output)
    } else {
      addOutput('error', 'Не удалось получить список пользователей')
    }
  } catch (error) {
    addOutput('error', `Ошибка: ${error.message}`)
  }
}

const listRequests = async () => {
  try {
    const response = await fetch('/api/v1/help-requests?limit=10')
    
    if (response.ok) {
      const data = await response.json()
      const requests = data.data || []
      let output = `Заявки (${requests.length}):\n`
      requests.forEach((r, i) => {
        output += `  ${i + 1}. ${getProblemTypeName(r.problem_type)} - ${r.description.substring(0, 40)}... (${getStatusName(r.status)})\n`
      })
      addOutput('output', output)
    } else {
      addOutput('error', 'Не удалось получить список заявок')
    }
  } catch (error) {
    addOutput('error', `Ошибка: ${error.message}`)
  }
}

const historyUp = () => {
  if (historyIndex.value < commandHistory.value.length - 1) {
    historyIndex.value++
    currentCommand.value = commandHistory.value[historyIndex.value]
  }
}

const historyDown = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentCommand.value = commandHistory.value[historyIndex.value]
  } else if (historyIndex.value === 0) {
    historyIndex.value = -1
    currentCommand.value = ''
  }
}

const autoComplete = () => {
  const commands = ['help', 'clear', 'docker ps', 'docker logs', 'status', 'users', 'requests']
  const matches = commands.filter(cmd => cmd.startsWith(currentCommand.value))
  if (matches.length === 1) {
    currentCommand.value = matches[0]
  }
}

onMounted(() => {
  addOutput('success', 'Админ Терминал Help-Car v1.0')
  addOutput('output', 'Введите "help" для справки')
  
  if (commandInput.value) {
    commandInput.value.focus()
  }
})
</script>
