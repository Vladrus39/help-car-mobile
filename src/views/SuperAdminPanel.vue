<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              🔧 Супер-Админ Панель
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ admin?.full_name || admin?.username }}</span>
            <button
              class="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
              @click="goToHome"
            >
              🏠 На главную
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              @click="goToDashboard"
            >
              ← Дашборд
            </button>
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
      <!-- Вкладки -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'files'"
          >
            📁 Управление Файлами
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'system'"
          >
            ⚙️ Управление Системой
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'database'"
          >
            🗄️ База Данных
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'users'"
          >
            👥 Пользователи
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'monitoring'"
          >
            📊 Мониторинг
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'terminal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'terminal'"
          >
            💻 Терминал
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'visual-editor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'visual-editor'"
          >
            🎨 Визуальный Редактор
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'system-control'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'system-control'"
          >
            🔧 Системный Контроль
          </button>
          <button
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'visual-interface-editor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = 'visual-interface-editor'"
          >
            🎨 Визуальный Редактор Интерфейса
          </button>
        </nav>
      </div>

      <!-- Управление Файлами -->
      <div
        v-if="activeTab === 'files'"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold">
            📁 Управление Файлами
          </h2>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="refreshFileList"
          >
            🔄 Обновить
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Навигация по файлам -->
          <div class="lg:col-span-1">
            <div class="mb-4">
              <input
                v-model="filePath"
                type="text"
                placeholder="Путь к файлу (например: /home/vmroadhelp/backend/src/server.js)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <div class="mt-2 flex space-x-2">
                <button
                  class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  @click="loadFile"
                >
                  📖 Загрузить
                </button>
                <button
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  @click="listDirectory"
                >
                  📂 Список
                </button>
              </div>
            </div>

            <div class="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
              <div
                v-if="fileList.length === 0"
                class="text-gray-500 text-sm"
              >
                Выберите директорию
              </div>
              <div v-else>
                <div
                  v-for="item in fileList"
                  :key="item.path"
                  :class="[
                    'p-2 cursor-pointer rounded hover:bg-gray-100',
                    selectedFile?.path === item.path ? 'bg-blue-100' : ''
                  ]"
                  @click="selectFile(item)"
                >
                  <span v-if="item.type === 'directory'">📁</span>
                  <span v-else>📄</span>
                  <span class="ml-2 text-sm">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Редактор файла -->
          <div class="lg:col-span-2">
            <div
              v-if="!currentFileContent"
              class="text-gray-500 text-center py-12"
            >
              Выберите файл для редактирования
            </div>
            <div v-else>
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="font-medium">
                    {{ selectedFile?.name || 'Файл' }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ selectedFile?.path }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    :disabled="saving"
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    @click="saveFile"
                  >
                    {{ saving ? '💾 Сохранение...' : '💾 Сохранить' }}
                  </button>
                  <button
                    class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    @click="reloadFile"
                  >
                    🔄 Перезагрузить
                  </button>
                </div>
              </div>

              <div class="relative">
                <textarea
                  v-model="currentFileContent"
                  class="w-full h-96 font-mono text-sm border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-green-400"
                  placeholder="Содержимое файла..."
                  style="tab-size: 2;"
                  spellcheck="false"
                />
                <div class="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {{ getFileExtension(selectedFile?.name) }}
                </div>
              </div>

              <div
                v-if="saveMessage"
                :class="['mt-2 p-2 rounded', saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']"
              >
                {{ saveMessage.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление Системой -->
      <div
        v-if="activeTab === 'system'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          ⚙️ Управление Системой
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Docker -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🐳 Docker
            </h3>
            <div class="space-y-2">
              <button
                class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="loadDockerContainers"
              >
                Статус контейнеров
              </button>
              <button
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                @click="restartBackendService"
              >
                Перезапустить Backend
              </button>
              <button
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                @click="restartFrontendService"
              >
                Перезапустить Frontend
              </button>
              <button
                class="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                @click="getBackendLogs"
              >
                Логи Backend
              </button>
            </div>
          </div>

          <!-- Системные сервисы -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🔧 Системные Сервисы
            </h3>
            <div class="space-y-2">
              <button
                class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="getNginxStatus"
              >
                Статус Nginx
              </button>
              <button
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                @click="restartNginxService"
              >
                Перезапустить Nginx
              </button>
              <button
                class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="getPostgresStatus"
              >
                Статус PostgreSQL
              </button>
              <button
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                @click="restartPostgresService"
              >
                Перезапустить PostgreSQL
              </button>
            </div>
          </div>

          <!-- Произвольная команда -->
          <div class="border border-gray-300 rounded-lg p-4 md:col-span-2">
            <h3 class="font-bold mb-4">
              💻 Произвольная команда
            </h3>
            <div class="flex space-x-2">
              <input
                v-model="customCommand"
                type="text"
                placeholder="Введите команду (например: ls -la /home/vmroadhelp)"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="executeSystemCommand(customCommand)"
              >
              <button
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                @click="executeSystemCommand(customCommand)"
              >
                Выполнить
              </button>
            </div>
          </div>
        </div>

        <!-- Результат выполнения команды -->
        <div
          v-if="commandResult"
          class="mt-6 border border-gray-300 rounded-lg p-4 bg-gray-50"
        >
          <h3 class="font-bold mb-2">
            Результат:
          </h3>
          <pre class="text-sm overflow-x-auto whitespace-pre-wrap">{{ commandResult }}</pre>
        </div>
      </div>

      <!-- База Данных -->
      <div
        v-if="activeTab === 'database'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          🗄️ Управление Базой Данных
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              📊 Статистика
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="getDatabaseStats"
            >
              Получить статистику
            </button>
            <div
              v-if="dbStats"
              class="mt-4 space-y-2"
            >
              <div
                v-for="(value, key) in dbStats"
                :key="key"
                class="flex justify-between"
              >
                <span class="font-medium">{{ key }}:</span>
                <span>{{ value }}</span>
              </div>
            </div>
          </div>
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🔍 SQL Запрос
            </h3>
            <textarea
              v-model="sqlQuery"
              class="w-full h-32 font-mono text-sm border border-gray-300 rounded-md p-2 mb-2"
              placeholder="SELECT * FROM users LIMIT 10;"
            />
            <button
              class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              @click="executeSQL"
            >
              Выполнить SQL
            </button>
            <div
              v-if="sqlResult"
              class="mt-4"
            >
              <pre class="text-sm overflow-x-auto whitespace-pre-wrap">{{ sqlResult }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Пользователи -->
      <div
        v-if="activeTab === 'users'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          👥 Управление Пользователями
        </h2>
        <div class="mb-4">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="loadUsers"
          >
            Загрузить пользователей
          </button>
        </div>
        <div
          v-if="users.length > 0"
          class="overflow-x-auto"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Имя
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Телефон
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  🏅 Статус
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="user in users"
                :key="user.id"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ user.id?.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getPremiumNameClass(user.premium_status)">
                    {{ getPremiumIcon(user.premium_status) }} {{ user.full_name || user.name }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ user.phone }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    :value="user.premium_status || ''"
                    class="border rounded px-2 py-1 text-sm"
                    :class="getPremiumSelectClass(user.premium_status)"
                    @change="setPremiumStatus(user.id, $event.target.value)"
                  >
                    <option value="">Нет статуса</option>
                    <option value="bronze">🥉 Бронзовый</option>
                    <option value="silver">🥈 Серебряный</option>
                    <option value="gold">🥇 Золотой</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="editUser(user)"
                  >
                    ✏️
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800 ml-2"
                    @click="deleteUser(user.id)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Мониторинг -->
      <div
        v-if="activeTab === 'monitoring'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          📊 Мониторинг Системы
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-2">
              💾 Память
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="getSystemInfo('memory')"
            >
              Проверить
            </button>
            <pre
              v-if="systemInfo.memory"
              class="mt-2 text-xs"
            >{{ systemInfo.memory }}</pre>
          </div>
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-2">
              💿 Диск
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="getSystemInfo('disk')"
            >
              Проверить
            </button>
            <pre
              v-if="systemInfo.disk"
              class="mt-2 text-xs"
            >{{ systemInfo.disk }}</pre>
          </div>
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-2">
              ⚡ CPU
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="getSystemInfo('cpu')"
            >
              Проверить
            </button>
            <pre
              v-if="systemInfo.cpu"
              class="mt-2 text-xs"
            >{{ systemInfo.cpu }}</pre>
          </div>
        </div>
      </div>

      <!-- Терминал -->
      <div
        v-if="activeTab === 'terminal'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          💻 Терминал (PowerShell-like)
        </h2>
        <div
          ref="terminalOutput"
          class="border border-gray-300 rounded-lg bg-black text-green-400 font-mono text-sm p-4 h-96 overflow-y-auto"
        >
          <div
            v-for="(line, index) in terminalLines"
            :key="index"
            :class="line.type === 'error' ? 'text-red-400' : line.type === 'stderr' ? 'text-yellow-400' : 'text-green-400'"
          >
            {{ line.data }}
          </div>
          <div
            v-if="terminalPrompt"
            class="flex items-center mt-2"
          >
            <span class="text-green-400">{{ terminalPrompt }}</span>
            <input
              v-model="terminalInput"
              class="flex-1 bg-transparent text-green-400 outline-none ml-2"
              placeholder="Введите команду..."
              @keyup.enter="executeTerminalCommand"
            >
          </div>
        </div>
        <div class="mt-4 flex space-x-2">
          <button
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="clearTerminal"
          >
            🗑️ Очистить
          </button>
          <button
            :disabled="terminalConnected"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            @click="connectTerminal"
          >
            {{ terminalConnected ? '✅ Подключено' : '🔌 Подключить' }}
          </button>
        </div>
      </div>

      <!-- Визуальный Редактор Интерфейса -->
      <div
        v-if="activeTab === 'visual-editor'"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">
            🎨 Визуальный Редактор Сайта
          </h2>
          <div class="flex gap-2">
            <select
              v-model="previewPage"
              class="px-4 py-2 border border-gray-300 rounded"
            >
              <option value="/">
                🏠 Главная
              </option>
              <option value="/map">
                🗺️ Карта
              </option>
              <option value="/profile">
                👤 Профиль
              </option>
              <option value="/admin/dashboard">
                ⚙️ Админ панель
              </option>
            </select>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="refreshPreview"
            >
              🔄 Обновить
            </button>
            <button
              :class="[
                'px-4 py-2 rounded transition-colors',
                inspectMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
              @click="toggleInspectMode"
            >
              {{ inspectMode ? '🎯 Инспектор ON' : '🎯 Инспектор OFF' }}
            </button>
            <button
              :class="[
                'px-4 py-2 rounded transition-colors',
                editMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
              @click="toggleEditMode"
            >
              {{ editMode ? '✏️ Редактор ON' : '✏️ Редактор OFF' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Левая панель: Живой предпросмотр сайта -->
          <div class="lg:col-span-2">
            <div
              class="border border-gray-300 rounded-lg overflow-hidden"
              style="height: 800px;"
            >
              <div class="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500" />
                    <div class="w-3 h-3 rounded-full bg-yellow-500" />
                    <div class="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span class="text-sm text-gray-600 ml-4">{{ siteUrl }}{{ previewPage }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    :class="['text-xs px-3 py-1.5 rounded font-medium', viewportSize === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
                    @click="setViewportSize('mobile')"
                  >
                    📱 375px
                  </button>
                  <button
                    :class="['text-xs px-3 py-1.5 rounded font-medium', viewportSize === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
                    @click="setViewportSize('tablet')"
                  >
                    📱 768px
                  </button>
                  <button
                    :class="['text-xs px-3 py-1.5 rounded font-medium', viewportSize === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
                    @click="setViewportSize('desktop')"
                  >
                    🖥️ 100%
                  </button>
                  <button
                    v-if="viewportSize === 'mobile'"
                    :class="['text-xs px-3 py-1.5 rounded font-medium ml-2', isZoomed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700']"
                    @click="toggleZoom"
                  >
                    {{ isZoomed ? '🔍 150%' : '🔎 100%' }}
                  </button>
                </div>
              </div>
              <div
                class="relative bg-white flex justify-center"
                style="height: calc(100% - 50px);"
              >
                <div
                  :style="{
                    width: viewportSize === 'mobile' ? '375px' : viewportSize === 'tablet' ? '768px' : '100%',
                    height: '100%',
                    position: 'relative',
                    boxShadow: viewportSize !== 'desktop' ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
                  }"
                >
                  <iframe
                    ref="previewIframe"
                    :src="siteUrl + previewPage"
                    :style="{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      transform: isZoomed && viewportSize === 'mobile' ? 'scale(1.5)' : 'scale(1)',
                      transformOrigin: 'top center',
                      transition: 'transform 0.3s ease'
                    }"
                    @load="onIframeLoad"
                  />
                </div>
                <div
                  v-if="inspectMode || editMode"
                  class="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded shadow-lg pointer-events-none z-50"
                >
                  <div v-if="editMode">
                    <div>✏️ Режим редактирования:</div>
                    <div class="text-xs mt-1">
                      • Клик - выбрать элемент
                    </div>
                    <div class="text-xs">
                      • <kbd class="bg-white text-green-600 px-1 rounded">Ctrl</kbd> + клик - свободное перемещение
                    </div>
                    <div class="text-xs">
                      • Тяните за углы - изменение размера
                    </div>
                  </div>
                  <div v-else-if="inspectMode">
                    🎯 Кликните на элемент для редактирования
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Правая панель: Редактор свойств -->
          <div class="lg:col-span-1">
            <div
              class="border border-gray-300 rounded-lg p-4 sticky top-4"
              style="max-height: 800px; overflow-y: auto;"
            >
              <!-- Панель инструментов для добавления элементов -->
              <div
                v-if="editMode"
                class="mb-4 p-4 bg-purple-50 border border-purple-200 rounded"
              >
                <h3 class="font-bold mb-3 text-purple-900">
                  ➕ Добавить элемент
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('button')"
                  >
                    🔘 Кнопка
                  </button>
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('text')"
                  >
                    📝 Текст
                  </button>
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('heading')"
                  >
                    📰 Заголовок
                  </button>
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('image')"
                  >
                    🖼️ Картинка
                  </button>
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('div')"
                  >
                    📦 Блок
                  </button>
                  <button
                    class="bg-white border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                    @click="addElement('input')"
                  >
                    ⌨️ Поле ввода
                  </button>
                </div>
              </div>

              <h3 class="font-bold mb-4">
                ✏️ Редактор элементов
              </h3>
              
              <div
                v-if="!selectedElement"
                class="text-gray-500 text-center py-12"
              >
                <p class="mb-2">
                  Включите инспектор и
                </p>
                <p>кликните на элемент на сайте</p>
              </div>
              
              <div
                v-else
                class="space-y-4"
              >
                <!-- Информация об элементе -->
                <div class="bg-blue-50 border border-blue-200 rounded p-3">
                  <div class="text-xs font-mono text-gray-600 mb-1">
                    {{ selectedElement.tagName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ selectedElement.selector }}
                  </div>
                </div>

                <!-- Вкладки редактора -->
                <div class="flex border-b border-gray-300">
                  <button
                    :class="['px-4 py-2 text-sm font-medium', editorTab === 'content' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500']"
                    @click="editorTab = 'content'"
                  >
                    📝 Контент
                  </button>
                  <button
                    :class="['px-4 py-2 text-sm font-medium', editorTab === 'styles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500']"
                    @click="editorTab = 'styles'"
                  >
                    🎨 Стили
                  </button>
                  <button
                    :class="['px-4 py-2 text-sm font-medium', editorTab === 'size' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500']"
                    @click="editorTab = 'size'"
                  >
                    📐 Размеры
                  </button>
                </div>

                <!-- Контент -->
                <div
                  v-if="editorTab === 'content'"
                  class="space-y-3"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Текст</label>
                    <textarea
                      v-model="selectedElement.textContent"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      @input="updateElementContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">HTML</label>
                    <textarea
                      v-model="selectedElement.innerHTML"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                      rows="6"
                      @input="updateElementHTML"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Классы CSS</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span
                        v-for="className in selectedElement.classes"
                        :key="className"
                        class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        {{ className }}
                        <button
                          class="text-blue-600 hover:text-blue-800"
                          @click="removeClass(className)"
                        >×</button>
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <input
                        v-model="newClassName"
                        type="text"
                        placeholder="Новый класс"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        @keyup.enter="addClass"
                      >
                      <button
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        @click="addClass"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Стили -->
                <div
                  v-if="editorTab === 'styles'"
                  class="space-y-3"
                >
                  <div
                    v-for="(value, property) in selectedElement.styles"
                    :key="property"
                  >
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ property }}</label>
                    <input
                      v-model="selectedElement.styles[property]"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      @input="updateElementStyle(property)"
                    >
                  </div>
                  <button
                    class="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm"
                    @click="addNewStyle"
                  >
                    + Добавить стиль
                  </button>
                </div>

                <!-- Размеры -->
                <div
                  v-if="editorTab === 'size'"
                  class="space-y-3"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ширина (width)</label>
                    <div class="flex gap-2">
                      <input
                        v-model="elementWidth"
                        type="text"
                        placeholder="auto, 100px, 50%"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        @input="updateElementWidth"
                      >
                      <button
                        class="px-3 py-2 bg-gray-200 rounded text-sm"
                        @click="elementWidth = 'auto'; updateElementWidth()"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Высота (height)</label>
                    <div class="flex gap-2">
                      <input
                        v-model="elementHeight"
                        type="text"
                        placeholder="auto, 100px, 50%"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        @input="updateElementHeight"
                      >
                      <button
                        class="px-3 py-2 bg-gray-200 rounded text-sm"
                        @click="elementHeight = 'auto'; updateElementHeight()"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Отступы внутри (padding)</label>
                    <input
                      v-model="elementPadding"
                      type="text"
                      placeholder="10px, 10px 20px"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      @input="updateElementPadding"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Отступы снаружи (margin)</label>
                    <input
                      v-model="elementMargin"
                      type="text"
                      placeholder="10px, 10px 20px"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      @input="updateElementMargin"
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      id="enable-resize"
                      v-model="enableResize"
                      type="checkbox"
                      class="w-4 h-4"
                      @change="toggleResize"
                    >
                    <label
                      for="enable-resize"
                      class="text-sm text-gray-700"
                    >🔄 Изменение размера мышью</label>
                  </div>
                </div>

                <!-- Действия -->
                <div class="border-t border-gray-300 pt-4 space-y-2">
                  <button
                    class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    @click="deleteElement"
                  >
                    🗑️ Удалить элемент
                  </button>
                  <button
                    class="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    @click="duplicateElement"
                  >
                    📋 Дублировать
                  </button>
                  <button
                    :disabled="savingChanges"
                    class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    @click="saveChangesToFile"
                  >
                    {{ savingChanges ? '💾 Сохранение...' : '💾 Сохранить в файл' }}
                  </button>
                  <button
                    :disabled="isDeploying"
                    class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    @click="buildAndDeploy"
                  >
                    {{ isDeploying ? '🚀 Деплой...' : '🚀 Собрать и задеплоить' }}
                  </button>
                  <button
                    class="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    @click="resetElement"
                  >
                    ↺ Сбросить изменения
                  </button>
                </div>

                <!-- Сообщения -->
                <div
                  v-if="editorMessage"
                  :class="[
                    'p-3 rounded text-sm',
                    editorMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ editorMessage.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            @click="clearCache"
          >
            🗑️ Очистить кэш браузера
          </button>
          <button
            class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            @click="exportChanges"
          >
            📦 Экспортировать изменения
          </button>
          <button
            class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            @click="undoChanges"
          >
            ↶ Отменить последнее действие
          </button>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            @click="refreshComponents"
          >
            🔄 Обновить компоненты
          </button>
        </div>
      </div>

      <!-- Системный Контроль -->
      <div
        v-if="activeTab === 'system-control'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          🔧 Системный Контроль
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Процессы -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              ⚙️ Процессы
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadProcesses"
            >
              📊 Загрузить процессы
            </button>
            <div
              v-if="processes"
              class="mt-4 max-h-64 overflow-y-auto"
            >
              <pre class="text-xs bg-gray-100 p-2 rounded">{{ processes }}</pre>
            </div>
          </div>

          <!-- Docker контейнеры -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🐳 Docker
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadDockerContainers"
            >
              📦 Загрузить контейнеры
            </button>
            <div
              v-if="dockerContainers.length > 0"
              class="mt-4 space-y-2 max-h-64 overflow-y-auto"
            >
              <div
                v-for="container in dockerContainers"
                :key="container.id"
                class="p-2 bg-gray-50 rounded text-sm"
              >
                <div class="font-medium">
                  {{ container.name }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ container.status }}
                </div>
                <button
                  class="mt-1 text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                  @click="restartContainer(container.id)"
                >
                  🔄 Перезапустить
                </button>
              </div>
            </div>
          </div>

          <!-- Логи в реальном времени -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              📋 Логи
            </h3>
            <select
              v-model="selectedLogService"
              class="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="backend">
                Backend
              </option>
              <option value="nginx">
                Nginx
              </option>
              <option value="all">
                Все
              </option>
            </select>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadRealtimeLogs"
            >
              📜 Загрузить логи
            </button>
            <div
              v-if="realtimeLogs"
              class="mt-4 max-h-64 overflow-y-auto"
            >
              <pre class="text-xs bg-gray-900 text-green-400 p-2 rounded font-mono">{{ realtimeLogs }}</pre>
            </div>
          </div>

          <!-- Git статус -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              📦 Git
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadGitStatus"
            >
              🔍 Статус репозитория
            </button>
            <div
              v-if="gitStatus"
              class="mt-4 space-y-2"
            >
              <div class="text-sm">
                <span class="font-medium">Ветка:</span> {{ gitStatus.branch }}
              </div>
              <div class="text-sm">
                <span class="font-medium">Последний коммит:</span> {{ gitStatus.lastCommit }}
              </div>
              <div
                v-if="gitStatus.status"
                class="text-xs bg-yellow-50 p-2 rounded"
              >
                <span class="font-medium">Изменения:</span>
                <pre class="mt-1">{{ gitStatus.status }}</pre>
              </div>
            </div>
          </div>

          <!-- Переменные окружения -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🌍 Переменные окружения
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadEnvironmentVariables"
            >
              🔍 Загрузить переменные
            </button>
            <div
              v-if="environmentVariables"
              class="mt-4 max-h-64 overflow-y-auto"
            >
              <div
                v-for="(value, key) in environmentVariables"
                :key="key"
                class="text-xs mb-1"
              >
                <span class="font-medium">{{ key }}:</span> {{ value }}
              </div>
            </div>
          </div>

          <!-- Активные подключения -->
          <div class="border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              🔌 Подключения
            </h3>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
              @click="loadActiveConnections"
            >
              📊 Активные подключения
            </button>
            <div
              v-if="activeConnections"
              class="mt-4"
            >
              <div class="text-sm mb-2">
                <span class="font-medium">Всего:</span> {{ activeConnections.count }}
              </div>
              <div class="max-h-48 overflow-y-auto">
                <pre class="text-xs bg-gray-100 p-2 rounded">{{ activeConnections.connections.join('\n') }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Браузер файлов -->
        <div class="mt-6 border border-gray-300 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg">
              📁 Браузер файлов на сервере
            </h3>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              @click="refreshFileBrowser"
            >
              🔄 Обновить
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Левая панель: Навигация -->
            <div class="lg:col-span-1">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Текущая директория:</label>
                <div class="flex space-x-2">
                  <input
                    v-model="fileBrowserPath"
                    type="text"
                    placeholder="/home/vmroadhelp"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    @keyup.enter="loadFileBrowser"
                  >
                  <button
                    class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                    @click="loadFileBrowser"
                  >
                    📂 Открыть
                  </button>
                </div>
                <div class="mt-2 flex space-x-2">
                  <button
                    class="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
                    @click="goToParentDirectory"
                  >
                    ⬆️ Наверх
                  </button>
                  <button
                    class="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    @click="showCreateDirectoryModal = true"
                  >
                    ➕ Создать папку
                  </button>
                </div>
              </div>

              <div class="border border-gray-300 rounded-md p-3 max-h-96 overflow-y-auto bg-gray-50">
                <div
                  v-if="fileBrowserItems.length === 0"
                  class="text-gray-500 text-sm text-center py-8"
                >
                  Загрузка...
                </div>
                <div
                  v-else
                  class="space-y-1"
                >
                  <div
                    v-for="item in fileBrowserItems"
                    :key="item.path"
                    :class="[
                      'p-2 cursor-pointer rounded text-sm flex items-center justify-between hover:bg-blue-50',
                      selectedFileBrowserItem?.path === item.path ? 'bg-blue-100 border border-blue-300' : ''
                    ]"
                    @click="selectFileBrowserItem(item)"
                    @dblclick="openFileBrowserItem(item)"
                  >
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                      <span class="text-lg">{{ item.type === 'directory' ? '📁' : '📄' }}</span>
                      <span class="truncate">{{ item.name }}</span>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <button
                        class="text-red-600 hover:text-red-800 text-xs px-1"
                        title="Удалить"
                        @click.stop="deleteFileBrowserItem(item)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Центральная панель: Редактор/Просмотр -->
            <div class="lg:col-span-2">
              <div
                v-if="!selectedFileBrowserItem"
                class="text-gray-500 text-center py-12 border border-gray-300 rounded-md bg-gray-50"
              >
                Выберите файл для просмотра или редактирования
              </div>
              <div
                v-else-if="selectedFileBrowserItem.type === 'directory'"
                class="text-gray-500 text-center py-12 border border-gray-300 rounded-md bg-gray-50"
              >
                Директория: {{ selectedFileBrowserItem.name }}<br>
                <button
                  class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  @click="openFileBrowserItem(selectedFileBrowserItem)"
                >
                  Открыть директорию
                </button>
              </div>
              <div v-else>
                <div class="mb-4 flex items-center justify-between">
                  <div>
                    <h4 class="font-medium">
                      {{ selectedFileBrowserItem.name }}
                    </h4>
                    <p class="text-xs text-gray-500">
                      {{ selectedFileBrowserItem.path }}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      :disabled="savingFileBrowser"
                      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                      @click="saveFileBrowserFile"
                    >
                      {{ savingFileBrowser ? '💾 Сохранение...' : '💾 Сохранить' }}
                    </button>
                    <button
                      class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                      @click="reloadFileBrowserFile"
                    >
                      🔄 Перезагрузить
                    </button>
                  </div>
                </div>

                <textarea
                  v-model="fileBrowserContent"
                  class="w-full h-96 font-mono text-sm border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-green-400"
                  placeholder="Содержимое файла..."
                  style="tab-size: 2;"
                  spellcheck="false"
                />

                <div
                  v-if="fileBrowserSaveMessage"
                  :class="['mt-2 p-2 rounded text-sm', fileBrowserSaveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']"
                >
                  {{ fileBrowserSaveMessage.text }}
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              @click="showCreateFileModal = true"
            >
              ➕ Создать файл
            </button>
            <button
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
              @click="showUploadFileModal = true"
            >
              📤 Загрузить файл
            </button>
            <input
              ref="fileUploadInput"
              type="file"
              class="hidden"
              @change="handleFileUpload"
            >
          </div>
        </div>

        <!-- Модальное окно создания директории -->
        <div
          v-if="showCreateDirectoryModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click="showCreateDirectoryModal = false"
        >
          <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            @click.stop
          >
            <h3 class="text-xl font-bold mb-4">
              ➕ Создать директорию
            </h3>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Имя директории:</label>
              <input
                v-model="newDirectoryName"
                type="text"
                placeholder="Новая папка"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                @keyup.enter="createDirectory"
              >
              <p class="text-xs text-gray-500 mt-1">
                Путь: {{ fileBrowserPath }}/{{ newDirectoryName }}
              </p>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                @click="showCreateDirectoryModal = false"
              >
                Отмена
              </button>
              <button
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                @click="createDirectory"
              >
                Создать
              </button>
            </div>
          </div>
        </div>

        <!-- Модальное окно создания файла -->
        <div
          v-if="showCreateFileModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click="showCreateFileModal = false"
        >
          <div
            class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <h3 class="text-xl font-bold mb-4">
              ➕ Создать файл
            </h3>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Имя файла:</label>
              <input
                v-model="newFileName"
                type="text"
                placeholder="example.txt"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
              <p class="text-xs text-gray-500 mt-1">
                Путь: {{ fileBrowserPath }}/{{ newFileName }}
              </p>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Содержимое (опционально):</label>
              <textarea
                v-model="newFileContent"
                class="w-full h-64 font-mono text-sm border border-gray-300 rounded-md p-4"
                placeholder="Содержимое файла..."
              />
            </div>
            <div class="flex justify-end space-x-2">
              <button
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                @click="showCreateFileModal = false"
              >
                Отмена
              </button>
              <button
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                @click="createFile"
              >
                Создать
              </button>
            </div>
          </div>
        </div>

        <!-- Модальное окно загрузки файла -->
        <div
          v-if="showUploadFileModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click="showUploadFileModal = false"
        >
          <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            @click.stop
          >
            <h3 class="text-xl font-bold mb-4">
              📤 Загрузить файл
            </h3>
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Выберите файл для загрузки на сервер:
              </p>
              <p class="text-xs text-gray-500 mb-4">
                Путь: {{ fileBrowserPath }}/
              </p>
              <button
                class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                @click="fileUploadInput?.click()"
              >
                Выбрать файл
              </button>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                @click="showUploadFileModal = false"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Визуальный Редактор Интерфейса -->
      <div
        v-if="activeTab === 'visual-interface-editor'"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-xl font-bold mb-4">
          🎨 Визуальный Редактор Интерфейса
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Левая панель: Компоненты -->
          <div class="lg:col-span-1 border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              📦 Компоненты
            </h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="component in availableComponents"
                :key="component.name"
                :class="[
                  'p-3 border rounded cursor-pointer hover:bg-blue-50',
                  selectedComponentForEdit?.name === component.name ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                ]"
                @click="selectComponentForEdit(component)"
              >
                <div class="font-medium">
                  {{ component.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ component.path }}
                </div>
              </div>
            </div>
            <button
              class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="loadAvailableComponents"
            >
              🔄 Обновить список
            </button>
          </div>

          <!-- Центральная панель: Редактор -->
          <div class="lg:col-span-1 border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              ✏️ Редактор
            </h3>
            <div
              v-if="selectedComponentForEdit"
              class="space-y-4"
            >
              <div>
                <div class="font-medium mb-2">
                  {{ selectedComponentForEdit.name }}
                </div>
                <div class="text-xs text-gray-500 mb-4">
                  {{ selectedComponentForEdit.path }}
                </div>
              </div>
              
              <div class="relative">
                <textarea
                  v-model="componentEditContent"
                  class="w-full h-96 font-mono text-sm border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-green-400"
                  placeholder="Содержимое компонента..."
                  style="tab-size: 2;"
                  spellcheck="false"
                  @input="updateLivePreview"
                />
                <div class="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  Vue Component
                </div>
              </div>

              <div class="flex space-x-2">
                <button
                  :disabled="savingComponentEdit"
                  class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  @click="saveComponentEdit"
                >
                  {{ savingComponentEdit ? '💾 Сохранение...' : '💾 Сохранить' }}
                </button>
                <button
                  class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  @click="reloadComponentEdit"
                >
                  🔄 Перезагрузить
                </button>
                <button
                  class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  @click="resetComponentEdit"
                >
                  ↺ Сбросить
                </button>
              </div>

              <div
                v-if="componentEditMessage"
                :class="['p-2 rounded', componentEditMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']"
              >
                {{ componentEditMessage.text }}
              </div>
            </div>
            <div
              v-else
              class="text-gray-500 text-center py-12"
            >
              Выберите компонент для редактирования
            </div>
          </div>

          <!-- Правая панель: Live Preview -->
          <div class="lg:col-span-1 border border-gray-300 rounded-lg p-4">
            <h3 class="font-bold mb-4">
              👁️ Live Preview
            </h3>
            <div class="mb-4 flex items-center justify-between">
              <label class="flex items-center space-x-2">
                <input
                  v-model="autoPreview"
                  type="checkbox"
                  class="rounded"
                >
                <span class="text-sm">Авто-обновление</span>
              </label>
              <button
                class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                @click="refreshPreview"
              >
                🔄 Обновить
              </button>
            </div>
            <div class="border border-gray-200 rounded p-4 bg-gray-50 min-h-96 max-h-96 overflow-auto">
              <div
                v-if="livePreviewContent"
                v-html="livePreviewContent"
              />
              <div
                v-else
                class="text-gray-500 text-center py-12"
              >
                Предпросмотр появится здесь
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительные инструменты -->
        <div class="mt-6 border-t border-gray-300 pt-6">
          <h3 class="font-bold mb-4">
            🛠️ Инструменты
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              @click="exportComponent"
            >
              📥 Экспорт
            </button>
            <button
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              @click="importComponent"
            >
              📤 Импорт
            </button>
            <button
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              @click="validateComponent"
            >
              ✅ Валидация
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="formatComponent"
            >
              🎨 Форматировать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { logger } from '@/utils/logger'
import { adminWsService } from '@/services/adminWebSocket'

const router = useRouter()
const admin = ref(null)
const activeTab = ref('files')

// Управление файлами
const filePath = ref('')
const fileList = ref([])
const selectedFile = ref(null)
const currentFileContent = ref('')
const saving = ref(false)
const saveMessage = ref(null)

// Система
const customCommand = ref('')
const commandResult = ref('')

// База данных
const sqlQuery = ref('')
const sqlResult = ref('')
const dbStats = ref(null)

// Пользователи
const users = ref([])

// Мониторинг
const systemInfo = ref({ memory: null, disk: null, cpu: null })

// Терминал
const terminalLines = ref([])
const terminalInput = ref('')
const terminalPrompt = ref('$ ')
const terminalConnected = ref(false)
const terminalOutput = ref(null)

// Визуальный редактор
const vueComponents = ref([])
const selectedComponent = ref(null)
const componentContent = ref('')
const savingComponent = ref(false)
const componentSaveMessage = ref(null)
const showPreview = ref(false)
const previewContent = ref('')

// Новый визуальный редактор с живым превью
const siteUrl = ref(window.location.origin)
const previewPage = ref('/')
const previewIframe = ref(null)
const inspectMode = ref(false)
const selectedElement = ref(null)
const editorTab = ref('content')
const editorMessage = ref(null)
const viewportSize = ref('desktop')
const newClassName = ref('')
const editMode = ref(false)
const elementWidth = ref('')
const elementHeight = ref('')
const elementPadding = ref('')
const elementMargin = ref('')
const enableResize = ref(false)
const changeHistory = ref([])
const savingChanges = ref(false)
const isDeploying = ref(false)
const isZoomed = ref(false)

// Системный контроль
const processes = ref(null)
const dockerContainers = ref([])
const realtimeLogs = ref(null)
const selectedLogService = ref('backend')
const gitStatus = ref(null)
const environmentVariables = ref(null)
const activeConnections = ref(null)

// Визуальный редактор интерфейса
const availableComponents = ref([])
const selectedComponentForEdit = ref(null)
const componentEditContent = ref('')
const savingComponentEdit = ref(false)
const componentEditMessage = ref(null)
const livePreviewContent = ref('')
const autoPreview = ref(true)

// Браузер файлов в системном контроле
const fileBrowserPath = ref('/home/vmroadhelp')
const fileBrowserItems = ref([])
const selectedFileBrowserItem = ref(null)
const fileBrowserContent = ref('')
const savingFileBrowser = ref(false)
const fileBrowserSaveMessage = ref(null)
const showCreateDirectoryModal = ref(false)
const newDirectoryName = ref('')
const showCreateFileModal = ref(false)
const newFileName = ref('')
const newFileContent = ref('')
const showUploadFileModal = ref(false)
const fileUploadInput = ref(null)

const getToken = () => localStorage.getItem('adminToken')

// Безопасный парсинг JSON ответа (обрабатывает HTML ошибки от nginx)
const safeJsonParse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  
  // Если это HTML (502, 504 от nginx), возвращаем текст
  if (contentType.includes('text/html') || text.trim().startsWith('<html>')) {
    return { isHtml: true, text, error: text }
  }
  
  // Пытаемся распарсить как JSON
  try {
    return { isHtml: false, data: JSON.parse(text) }
  } catch (e) {
    // Если не JSON, возвращаем текст как ошибку
    return { isHtml: false, text, error: text || `HTTP ${response.status}` }
  }
}

// Универсальная функция для безопасного получения JSON из response
const getJsonData = async (response) => {
  if (!response.ok) {
    const parsed = await safeJsonParse(response)
    if (parsed.isHtml) {
      // Обрабатываем HTML ответы от nginx
      if (parsed.text.includes('502') || parsed.text.includes('Bad Gateway')) {
        throw new Error('Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".')
      } else if (parsed.text.includes('504') || parsed.text.includes('Gateway Time-out')) {
        throw new Error('Превышено время ожидания ответа от сервера. Попробуйте позже.')
      } else {
        // Извлекаем заголовок из HTML
        const titleMatch = parsed.text.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          throw new Error(titleMatch[1])
        } else {
          throw new Error('Ошибка сервера. Проверьте доступность backend.')
        }
      }
    }
    // Обрабатываем статус 502
    if (response.status === 502) {
      throw new Error('Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".')
    }
    throw new Error(parsed.error || parsed.data?.error || parsed.data?.message || `HTTP ${response.status}`)
  }
  
  const parsed = await safeJsonParse(response)
  if (parsed.isHtml) {
    // Обрабатываем HTML ответы от nginx (не должно быть, но на всякий случай)
    if (parsed.text.includes('502') || parsed.text.includes('Bad Gateway')) {
      throw new Error('Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".')
    } else if (parsed.text.includes('504') || parsed.text.includes('Gateway Time-out')) {
      throw new Error('Превышено время ожидания ответа от сервера. Попробуйте позже.')
    } else {
      const titleMatch = parsed.text.match(/<title>(.*?)<\/title>/i)
      if (titleMatch) {
        throw new Error(titleMatch[1])
      } else {
        throw new Error('Ошибка сервера. Проверьте доступность backend.')
      }
    }
  }
  return parsed.data
}

const getFileExtension = (filename) => {
  if (!filename) return ''
  const ext = filename.split('.').pop()?.toLowerCase()
  const extensions = {
    'js': 'JavaScript',
    'vue': 'Vue',
    'ts': 'TypeScript',
    'json': 'JSON',
    'css': 'CSS',
    'html': 'HTML',
    'md': 'Markdown',
    'py': 'Python',
    'sh': 'Shell',
    'sql': 'SQL'
  }
  return extensions[ext] || ext?.toUpperCase() || 'TEXT'
}

const loadFile = async () => {
  if (!filePath.value) {
    alert('Введите путь к файлу')
    return
  }
  try {
    const response = await fetch('/api/v1/super-admin/files/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: filePath.value })
    })
    const data = await getJsonData(response)
    if (data.success) {
      currentFileContent.value = data.content
      selectedFile.value = { path: filePath.value, name: filePath.value.split('/').pop() }
      saveMessage.value = null
      logger.info('File loaded', { path: filePath.value })
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки файла')
    }
  } catch (error) {
    logger.error('Load file error:', error)
    alert('Ошибка загрузки файла: ' + error.message)
  }
}

const listDirectory = async () => {
  const path = filePath.value || '/home/vmroadhelp'
  try {
    const response = await fetch('/api/v1/super-admin/files/list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path })
    })
    const data = await getJsonData(response)
    if (data.success) {
      fileList.value = data.items || []
      logger.info('Directory listed', { path })
    } else {
      throw new Error(data.error || data.message || 'Ошибка получения списка')
    }
  } catch (error) {
    logger.error('List directory error:', error)
    alert('Ошибка получения списка: ' + error.message)
  }
}

const selectFile = (item) => {
  if (item.type === 'directory') {
    filePath.value = item.path
    listDirectory()
  } else {
    filePath.value = item.path
    loadFile()
  }
}

const saveFile = async () => {
  if (!selectedFile.value || !currentFileContent.value) {
    alert('Нет файла для сохранения')
    return
  }
  saving.value = true
  saveMessage.value = null
  try {
    const response = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: selectedFile.value.path,
        content: currentFileContent.value
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      saveMessage.value = { type: 'success', text: '✅ Файл успешно сохранен' }
      logger.info('File saved', { path: selectedFile.value.path })
    } else {
      throw new Error(data.error || data.message || 'Ошибка сохранения файла')
    }
  } catch (error) {
    logger.error('Save file error:', error)
    saveMessage.value = { type: 'error', text: 'Ошибка сохранения: ' + error.message }
  } finally {
    saving.value = false
  }
}

const reloadFile = () => {
  if (selectedFile.value) {
    loadFile()
  }
}

const refreshFileList = () => {
  listDirectory()
}

const executeSystemCommand = async (command) => {
  if (!command) {
    alert('Введите команду')
    return
  }
  try {
    const token = getToken()
    if (!token) {
      commandResult.value = 'Ошибка: Токен не найден'
      return
    }

    // Добавляем таймаут для запроса (60 секунд для команд, которые могут выполняться долго)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    
    const response = await fetch('/api/v1/super-admin/system/execute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || data.error || '✅ Команда выполнена успешно'
      logger.info('System command executed', { command })
    } else {
      throw new Error(data.error || data.message || 'Ошибка выполнения команды')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        // Если пустой объект, но есть message, используем его
        if (error?.message) {
          errorMessage = error.message
        } else {
          errorMessage = 'Команда не выполнена'
        }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Извлекаем сообщение из строки, если оно содержит JSON
    if (errorMessage.includes('{"error":') || errorMessage.includes('{"message":')) {
      try {
        const jsonMatch = errorMessage.match(/\{.*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.message) {
            errorMessage = parsed.message
          } else if (parsed.error && typeof parsed.error === 'string') {
            errorMessage = parsed.error
          }
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    
    // Проверяем, является ли это ошибкой таймаута (504 Gateway Timeout или AbortError)
    if (errorMessage.includes('504') || 
        errorMessage.includes('Gateway Timeout') || 
        errorMessage.includes('Gateway Time-out') ||
        errorMessage.includes('AbortError') ||
        error?.name === 'AbortError') {
      errorMessage = 'Превышено время ожидания ответа от сервера (60 секунд). Команда может выполняться слишком долго или быть недоступна в контейнере.'
    }
    
    // Проверяем, является ли это ошибкой "команда не найдена"
    if (errorMessage.includes('not found') || errorMessage.includes('Command failed')) {
      // Определяем тип команды и показываем понятное сообщение
      if (errorMessage.includes('docker') && errorMessage.includes('not found')) {
        errorMessage = 'Команда docker недоступна внутри Docker контейнера. Используйте команды, доступные в Alpine Linux (например: ls, ps, cat, grep, find).'
      } else if (errorMessage.includes('systemctl') && errorMessage.includes('not found')) {
        errorMessage = 'Команда systemctl недоступна внутри Docker контейнера. Используйте команды, доступные в Alpine Linux.'
      } else if (errorMessage.includes('Command failed:')) {
        // Извлекаем команду из сообщения
        const commandMatch = errorMessage.match(/Command failed: (.+?)(?:\n|\r|$)/)
        if (commandMatch) {
          const failedCommand = commandMatch[1].trim()
          // Определяем тип команды
          if (failedCommand.startsWith('docker')) {
            errorMessage = 'Команда docker недоступна внутри Docker контейнера. Используйте команды, доступные в Alpine Linux.'
          } else if (failedCommand.startsWith('systemctl')) {
            errorMessage = 'Команда systemctl недоступна внутри Docker контейнера. Используйте команды, доступные в Alpine Linux.'
          } else {
            // Показываем упрощенное сообщение
            errorMessage = `Команда "${failedCommand}" недоступна или завершилась с ошибкой. Проверьте синтаксис и доступность команды в контейнере.`
          }
        } else {
          // Если не удалось извлечь команду, показываем общее сообщение
          errorMessage = 'Команда недоступна или завершилась с ошибкой. Используйте команды, доступные в Alpine Linux.'
        }
      }
    }
    
    // Проверяем, является ли это ошибкой таймаута (504 Gateway Timeout или AbortError)
    if (errorMessage.includes('504') || 
        errorMessage.includes('Gateway Timeout') || 
        errorMessage.includes('Gateway Time-out') ||
        errorMessage.includes('AbortError') ||
        error?.name === 'AbortError') {
      errorMessage = 'Превышено время ожидания ответа от сервера (60 секунд). Команда может выполняться слишком долго или быть недоступна в контейнере.'
    }
    
    // Обрабатываем HTML ответы (504 Gateway Timeout от nginx)
    if (errorMessage.includes('<html>') || errorMessage.includes('<title>')) {
      if (errorMessage.includes('504') || errorMessage.includes('Gateway Time-out')) {
        errorMessage = 'Превышено время ожидания ответа от сервера (60 секунд). Команда может выполняться слишком долго или быть недоступна в контейнере.'
      } else {
        // Извлекаем заголовок из HTML
        const titleMatch = errorMessage.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          errorMessage = titleMatch[1]
        } else {
          errorMessage = 'Ошибка сервера. Проверьте доступность команды.'
        }
      }
    }
    
    logger.error('Execute command error:', { error, message: errorMessage, command })
    commandResult.value = 'Ошибка: ' + errorMessage
  }
}

const getDatabaseStats = async () => {
  try {
    const token = getToken()
    if (!token) {
      logger.warn('No token available for getDatabaseStats')
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }
    
    const response = await fetch('/api/v1/super-admin/database/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
    }
    
    const data = await getJsonData(response)
    if (data.success) {
      dbStats.value = data.stats
      logger.info('Database stats loaded successfully')
    } else {
      throw new Error(data.error || data.message || 'Ошибка получения статистики')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Backend сервер недоступен. Возможно, backend контейнер не запущен или перезапускается.'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Обрабатываем HTML ответы (502 Bad Gateway, 504 Gateway Timeout от nginx)
    if (errorMessage.includes('<html>') || errorMessage.includes('<title>')) {
      if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
        errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
      } else if (errorMessage.includes('504') || errorMessage.includes('Gateway Time-out')) {
        errorMessage = 'Превышено время ожидания ответа от сервера. Попробуйте позже.'
      } else {
        // Извлекаем заголовок из HTML
        const titleMatch = errorMessage.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          errorMessage = titleMatch[1]
        } else {
          errorMessage = 'Ошибка сервера. Проверьте доступность backend.'
        }
      }
    }
    
    // Обрабатываем сообщения вида "HTTP 502"
    if (errorMessage.includes('HTTP 502') || errorMessage.includes('502')) {
      errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
    }
    
    logger.error('Get database stats error:', { error, message: errorMessage })
    alert('Ошибка получения статистики БД: ' + errorMessage)
  }
}

const executeSQL = async () => {
  if (!sqlQuery.value) {
    alert('Введите SQL запрос')
    return
  }
  try {
    const response = await fetch('/api/v1/super-admin/database/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sqlQuery.value })
    })
    if (!response.ok) {
      // Для 403 получаем детальное сообщение об ошибке
      if (response.status === 403) {
        const parsed = await safeJsonParse(response)
        const errorMessage = parsed.error || parsed.data?.error || parsed.data?.message || 'Доступ запрещен'
        throw new Error(errorMessage)
      }
      // Для 502 обрабатываем сразу
      if (response.status === 502) {
        throw new Error('Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".')
      }
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await getJsonData(response)
    if (data.success) {
      sqlResult.value = JSON.stringify(data.result, null, 2)
      logger.info('SQL query executed', { query: sqlQuery.value })
    } else {
      throw new Error(data.error || data.message || 'Ошибка выполнения SQL')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Доступ запрещен. Разрешены только SELECT, SHOW, DESCRIBE, EXPLAIN запросы.'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Если сообщение все еще содержит только "HTTP 403", заменяем на понятное
    if (errorMessage === 'HTTP 403' || errorMessage.includes('HTTP 403')) {
      errorMessage = 'Доступ запрещен. Разрешены только SELECT, SHOW, DESCRIBE, EXPLAIN запросы из соображений безопасности.'
    }
    
    // Обрабатываем сообщения вида "HTTP 502"
    if (errorMessage.includes('HTTP 502') || (errorMessage.includes('502') && !errorMessage.includes('Backend сервер недоступен'))) {
      errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
    }
    
    logger.error('Execute SQL error:', { error, message: errorMessage })
    sqlResult.value = 'Ошибка: ' + errorMessage
  }
}

const loadUsers = async () => {
  try {
    const token = getToken()
    if (!token) {
      logger.warn('No token available for loadUsers')
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }
    
    const response = await fetch('/api/v1/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        router.push('/admin/login')
        return
      }
    }
    
    const data = await getJsonData(response)
    if (data.success) {
      users.value = data.users || []
      logger.info('Users loaded successfully', { count: users.value.length })
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки пользователей')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Backend сервер недоступен. Возможно, backend контейнер не запущен или перезапускается.'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Обрабатываем HTML ответы (502 Bad Gateway, 504 Gateway Timeout от nginx)
    if (errorMessage.includes('<html>') || errorMessage.includes('<title>')) {
      if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
        errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
      } else if (errorMessage.includes('504') || errorMessage.includes('Gateway Time-out')) {
        errorMessage = 'Превышено время ожидания ответа от сервера. Попробуйте позже.'
      } else {
        // Извлекаем заголовок из HTML
        const titleMatch = errorMessage.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          errorMessage = titleMatch[1]
        } else {
          errorMessage = 'Ошибка сервера. Проверьте доступность backend.'
        }
      }
    }
    
    logger.error('Load users error:', { error, message: errorMessage })
    alert('Ошибка загрузки пользователей: ' + errorMessage)
  }
}

const editUser = (user) => {
  alert('Редактирование пользователя: ' + user.email)
  // TODO: Модальное окно редактирования
}

const deleteUser = async (userId) => {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
  try {
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      await loadUsers()
      logger.info('User deleted', { userId })
    } else {
      throw new Error(data.error || 'Ошибка удаления')
    }
  } catch (error) {
    logger.error('Delete user error:', error)
    alert('Ошибка: ' + error.message)
  }
}

// ========== Премиум статусы ==========
const getPremiumIcon = (status) => {
  switch (status) {
    case 'gold': return '🥇'
    case 'silver': return '🥈'
    case 'bronze': return '🥉'
    default: return ''
  }
}

const getPremiumNameClass = (status) => {
  switch (status) {
    case 'gold': return 'font-bold text-yellow-600'
    case 'silver': return 'font-semibold text-gray-500'
    case 'bronze': return 'font-medium text-orange-700'
    default: return ''
  }
}

const getPremiumSelectClass = (status) => {
  switch (status) {
    case 'gold': return 'bg-yellow-100 border-yellow-400 text-yellow-800'
    case 'silver': return 'bg-gray-100 border-gray-400 text-gray-700'
    case 'bronze': return 'bg-orange-100 border-orange-400 text-orange-800'
    default: return 'bg-white border-gray-300'
  }
}

const setPremiumStatus = async (userId, status) => {
  try {
    const premiumStatus = status === '' ? null : status
    const statusName = status === 'gold' ? 'Золотой' : 
                        status === 'silver' ? 'Серебряный' : 
                        status === 'bronze' ? 'Бронзовый' : 'Без статуса'
    
    const response = await fetch(`/api/v1/admin/users/${userId}/premium`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        premium_status: premiumStatus,
        expires_at: null // Бессрочно
      })
    })
    
    const data = await getJsonData(response)
    if (data.success) {
      // Обновляем локально без перезагрузки
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].premium_status = premiumStatus
      }
      logger.info('Premium status updated', { userId, status: premiumStatus })
      alert(`✅ Статус "${statusName}" установлен!`)
    } else {
      throw new Error(data.error || 'Ошибка обновления статуса')
    }
  } catch (error) {
    logger.error('Set premium status error:', error)
    alert('Ошибка: ' + error.message)
    // Откатываем изменения - перезагружаем список
    await loadUsers()
  }
}

const getSystemInfo = async (type) => {
  try {
    const response = await fetch(`/api/v1/super-admin/system/info/${type}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      systemInfo.value[type] = data.info
    } else {
      throw new Error(data.error || data.message || 'Ошибка получения информации')
    }
  } catch (error) {
    logger.error('Get system info error:', error)
    alert('Ошибка: ' + error.message)
  }
}

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin')
  router.push('/admin/login')
}

const goToHome = () => {
  router.push('/')
}

const goToDashboard = () => {
  router.push('/admin/dashboard')
}

// Терминал
const connectTerminal = () => {
  const token = getToken()
  if (!token) {
    alert('Токен не найден')
    return
  }

  adminWsService.connect(token)

  adminWsService.onTerminalOutput((data) => {
    terminalLines.value.push({ type: data.type, data: data.data })
    nextTick(() => {
      if (terminalOutput.value) {
        terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight
      }
    })
  })

  adminWsService.onTerminalError((data) => {
    terminalLines.value.push({ type: 'error', data: `❌ Ошибка: ${data.message}` })
    nextTick(() => {
      if (terminalOutput.value) {
        terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight
      }
    })
  })

  adminWsService.onTerminalClose((data) => {
    terminalLines.value.push({ type: 'info', data: `\n✅ Команда завершена с кодом: ${data.code}` })
    terminalPrompt.value = '$ '
    nextTick(() => {
      if (terminalOutput.value) {
        terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight
      }
    })
  })

  adminWsService.socket?.on('connect', () => {
    terminalConnected.value = true
    terminalLines.value.push({ type: 'info', data: '✅ Терминал подключен\n' })
  })

  adminWsService.socket?.on('disconnect', () => {
    terminalConnected.value = false
    terminalLines.value.push({ type: 'info', data: '❌ Терминал отключен\n' })
  })

  terminalConnected.value = adminWsService.isConnected
}

const executeTerminalCommand = () => {
  if (!terminalInput.value.trim()) return

  const command = terminalInput.value
  terminalLines.value.push({ type: 'input', data: `${terminalPrompt.value}${command}` })
  terminalInput.value = ''
  terminalPrompt.value = ''

  adminWsService.sendTerminalCommand(command)
}

const clearTerminal = () => {
  terminalLines.value = []
  terminalInput.value = ''
  terminalPrompt.value = '$ '
}

// Визуальный редактор
const refreshComponents = async () => {
  try {
    const token = getToken()
    if (!token) {
      logger.warn('No token available for refreshComponents')
      return
    }

    // Пробуем несколько возможных путей (приоритет - views, где основные компоненты)
    const possiblePaths = [
      '/home/vmroadhelp/frontend/src/views',
      '/home/vmroadhelp/frontend/src/components',
      '/home/vmroadhelp/roadhelp/frontend/src/views',
      '/app/frontend/src/views',
      '/home/vmroadhelp'
    ]

    let lastError = null
    let allComponents = []
    
    // Проверяем все пути и собираем компоненты из всех найденных директорий
    for (const path of possiblePaths) {
      try {
        // Добавляем таймаут для запроса (30 секунд)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const response = await fetch('/api/v1/super-admin/files/list', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const data = await getJsonData(response)
        if (data.success && data.items) {
          const components = (data.items || [])
            .filter(item => item.type === 'file' && item.name.endsWith('.vue'))
            .map(item => ({
              name: item.name,
              path: item.path
            }))
          allComponents.push(...components)
          logger.info('Found components in path', { count: components.length, path })
        }
      } catch (pathError) {
        lastError = pathError
        // Продолжаем пробовать следующий путь
        continue
      }
    }
    
    // Удаляем дубликаты по path
    const uniqueComponents = Array.from(
      new Map(allComponents.map(c => [c.path, c])).values()
    )
    
    if (uniqueComponents.length > 0) {
      vueComponents.value = uniqueComponents
      logger.info('Components refreshed successfully', { total: uniqueComponents.length })
      return
    }

    // Если ни один путь не сработал
    if (lastError) {
      throw lastError
    } else {
      throw new Error('Не удалось найти директорию с компонентами. Проверьте путь на сервере.')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Ошибка сервера'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Проверяем, является ли это ошибкой "директория не найдена"
    if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file or directory')) {
      errorMessage = 'Директория не найдена. Компоненты Vue могут находиться в другой директории.'
    }
    
    // Обрабатываем HTML ответы (502 Bad Gateway, 504 Gateway Timeout от nginx)
    if (errorMessage.includes('<html>') || errorMessage.includes('<title>')) {
      if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
        errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
      } else if (errorMessage.includes('504') || errorMessage.includes('Gateway Time-out')) {
        errorMessage = 'Превышено время ожидания ответа от сервера (30 секунд). Директория может содержать слишком много файлов. Попробуйте выбрать более конкретную директорию.'
      } else {
        // Извлекаем заголовок из HTML
        const titleMatch = errorMessage.match(/<title>(.*?)<\/title>/i)
        if (titleMatch) {
          errorMessage = titleMatch[1]
        } else {
          errorMessage = 'Ошибка сервера. Проверьте доступность backend.'
        }
      }
    }
    
    // Проверяем, является ли это ошибкой таймаута (504 Gateway Timeout или AbortError)
    if (errorMessage.includes('504') || 
        errorMessage.includes('Gateway Timeout') || 
        errorMessage.includes('Gateway Time-out') ||
        errorMessage.includes('AbortError') ||
        error?.name === 'AbortError') {
      errorMessage = 'Превышено время ожидания ответа от сервера (30 секунд). Директория может содержать слишком много файлов. Попробуйте выбрать более конкретную директорию.'
    }
    
    // Проверяем, является ли это ошибкой 502 Bad Gateway
    if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
      errorMessage = 'Backend сервер недоступен (502 Bad Gateway). Возможно, backend контейнер не запущен или перезапускается. Попробуйте перезапустить backend через раздел "Управление Системой".'
    }
    
    logger.error('Refresh components error:', { error, message: errorMessage })
    // Не показываем alert при монтировании, только логируем
    if (vueComponents.value.length === 0) {
      console.warn('Не удалось загрузить компоненты при инициализации:', errorMessage)
    } else {
      alert('Ошибка загрузки компонентов: ' + errorMessage)
    }
  }
}

const loadComponentForEdit = async (component) => {
  selectedComponent.value = component
  try {
    const response = await fetch('/api/v1/super-admin/files/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: component.path })
    })
    const data = await getJsonData(response)
    if (data.success) {
      componentContent.value = data.content
      componentSaveMessage.value = null
    }
  } catch (error) {
    logger.error('Load component error:', error)
    alert('Ошибка загрузки компонента: ' + error.message)
  }
}

const saveComponent = async () => {
  if (!selectedComponent.value) return

  savingComponent.value = true
  componentSaveMessage.value = null

  try {
    const response = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: selectedComponent.value.path,
        content: componentContent.value
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      componentSaveMessage.value = { type: 'success', text: '✅ Компонент успешно сохранен' }
    } else {
      throw new Error(data.error || data.message || 'Ошибка сохранения')
    }
  } catch (error) {
    logger.error('Save component error:', error)
    componentSaveMessage.value = { type: 'error', text: '❌ Ошибка: ' + error.message }
  } finally {
    savingComponent.value = false
  }
}

const updatePreview = () => {
  // Автоматическое обновление предпросмотра при изменении
  if (showPreview.value) {
    const templateMatch = componentContent.value.match(/<template>([\s\S]*?)<\/template>/)
    if (templateMatch) {
      previewContent.value = templateMatch[1]
    }
  }
}

const previewComponent = () => {
  // Простой предпросмотр - показываем только template часть
  const templateMatch = componentContent.value.match(/<template>([\s\S]*?)<\/template>/)
  if (templateMatch) {
    previewContent.value = templateMatch[1]
    showPreview.value = true
  } else {
    alert('Не найден блок <template> в компоненте')
  }
}

// Новые методы для визуального редактора с живым превью
const refreshPreview = () => {
  if (previewIframe.value) {
    previewIframe.value.src = previewIframe.value.src
  }
}

const toggleInspectMode = () => {
  inspectMode.value = !inspectMode.value
  if (inspectMode.value && previewIframe.value) {
    setupInspectMode()
  }
}

const setupInspectMode = () => {
  try {
    const iframeDoc = previewIframe.value?.contentDocument || previewIframe.value?.contentWindow?.document
    if (!iframeDoc) return

    // Добавляем стиль для подсветки элементов
    let style = iframeDoc.getElementById('visual-editor-highlight')
    if (!style) {
      style = iframeDoc.createElement('style')
      style.id = 'visual-editor-highlight'
      style.textContent = `
        .visual-editor-highlight {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        .visual-editor-selected {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px !important;
        }
      `
      iframeDoc.head.appendChild(style)
    }

    // Удаляем старые обработчики
    iframeDoc.body.removeEventListener('mouseover', handleMouseOver)
    iframeDoc.body.removeEventListener('mouseout', handleMouseOut)
    iframeDoc.body.removeEventListener('click', handleElementClick)

    if (inspectMode.value) {
      iframeDoc.body.addEventListener('mouseover', handleMouseOver)
      iframeDoc.body.addEventListener('mouseout', handleMouseOut)
      iframeDoc.body.addEventListener('click', handleElementClick)
    }
  } catch (error) {
    console.error('Error setting up inspect mode:', error)
  }
}

const handleMouseOver = (e) => {
  if (!inspectMode.value) return
  e.stopPropagation()
  e.target.classList.add('visual-editor-highlight')
}

const handleMouseOut = (e) => {
  if (!inspectMode.value) return
  e.stopPropagation()
  e.target.classList.remove('visual-editor-highlight')
}

const handleElementClick = (e) => {
  if (!inspectMode.value) return
  e.preventDefault()
  e.stopPropagation()
  
  const element = e.target
  
  // Удаляем предыдущее выделение
  const iframeDoc = previewIframe.value?.contentDocument
  if (iframeDoc) {
    iframeDoc.querySelectorAll('.visual-editor-selected').forEach(el => {
      el.classList.remove('visual-editor-selected')
    })
  }
  
  element.classList.add('visual-editor-selected')
  element.classList.remove('visual-editor-highlight')
  
  // Собираем информацию об элементе
  const computedStyle = window.getComputedStyle(element)
  const styles = {}
  const importantStyles = ['color', 'background-color', 'font-size', 'font-weight', 'padding', 'margin', 'border', 'width', 'height', 'display', 'flex-direction']
  
  importantStyles.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop)
    if (value) styles[prop] = value
  })
  
  selectedElement.value = {
    tagName: element.tagName.toLowerCase(),
    selector: getElementSelector(element),
    textContent: element.textContent || '',
    innerHTML: element.innerHTML || '',
    classes: Array.from(element.classList).filter(c => !c.startsWith('visual-editor')),
    styles: styles,
    element: element
  }
  
  editorTab.value = 'content'
  editorMessage.value = null
}

const getElementSelector = (element) => {
  if (element.id) return `#${element.id}`
  
  let selector = element.tagName.toLowerCase()
  if (element.className) {
    const classes = Array.from(element.classList)
      .filter(c => !c.startsWith('visual-editor'))
      .join('.')
    if (classes) selector += `.${classes}`
  }
  
  return selector
}

const updateElementContent = () => {
  if (selectedElement.value?.element) {
    selectedElement.value.element.textContent = selectedElement.value.textContent
  }
}

const updateElementHTML = () => {
  if (selectedElement.value?.element) {
    selectedElement.value.element.innerHTML = selectedElement.value.innerHTML
  }
}

const updateElementStyle = (property) => {
  if (selectedElement.value?.element) {
    selectedElement.value.element.style[property] = selectedElement.value.styles[property]
  }
}

const addNewStyle = () => {
  const property = prompt('Введите CSS свойство (background-color, font-size, и т.д.):')
  if (property && selectedElement.value) {
    selectedElement.value.styles[property] = ''
  }
}

const addClass = () => {
  if (newClassName.value && selectedElement.value) {
    selectedElement.value.classes.push(newClassName.value)
    if (selectedElement.value.element) {
      selectedElement.value.element.classList.add(newClassName.value)
    }
    newClassName.value = ''
  }
}

const removeClass = (className) => {
  if (selectedElement.value) {
    selectedElement.value.classes = selectedElement.value.classes.filter(c => c !== className)
    if (selectedElement.value.element) {
      selectedElement.value.element.classList.remove(className)
    }
  }
}

const saveChangesToFile = async () => {
  if (!selectedElement.value) {
    editorMessage.value = { type: 'error', text: '❌ Выберите элемент для сохранения' }
    return
  }
  
  // Получаем HTML страницы из iframe
  const iframeDoc = previewIframe.value?.contentDocument
  if (!iframeDoc) {
    editorMessage.value = { type: 'error', text: '❌ Не удалось получить содержимое страницы' }
    return
  }
  
  savingChanges.value = true
  editorMessage.value = null
  
  try {
    // Определяем какой Vue компонент редактируем по URL
    let componentPath = ''
    const currentPath = previewPage.value
    
    // Маппинг URL -> Vue компонент
    const pathMapping = {
      '/': '/home/vmroadhelp/frontend/src/views/HomeView.vue',
      '/map': '/home/vmroadhelp/frontend/src/views/MapView.vue',
      '/profile': '/home/vmroadhelp/frontend/src/views/ProfileView.vue',
      '/admin/dashboard': '/home/vmroadhelp/frontend/src/views/AdminDashboard.vue'
    }
    
    componentPath = pathMapping[currentPath]
    
    if (!componentPath) {
      editorMessage.value = { 
        type: 'error', 
        text: '❌ Не удалось определить компонент для страницы ' + currentPath
      }
      return
    }
    
    // Загружаем текущий контент файла
    const readResponse = await fetch('/api/v1/super-admin/files/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: componentPath })
    })
    
    const readData = await getJsonData(readResponse)
    if (!readData.success) {
      throw new Error(readData.error || 'Ошибка чтения файла')
    }
    
    let fileContent = readData.content
    
    // Извлекаем <template> секцию
    const templateMatch = fileContent.match(/<template>([\s\S]*?)<\/template>/)
    if (!templateMatch) {
      throw new Error('Не найден блок <template> в компоненте')
    }
    
    // Получаем обновлённый HTML из iframe (body или конкретный контейнер)
    const appElement = iframeDoc.querySelector('#app') || iframeDoc.body
    const updatedHTML = appElement.innerHTML
    
    // Заменяем содержимое <template>
    const newFileContent = fileContent.replace(
      /<template>[\s\S]*?<\/template>/,
      `<template>
  <div id="app">
${updatedHTML}
  </div>
</template>`
    )
    
    // Сохраняем файл
    const writeResponse = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: componentPath,
        content: newFileContent
      })
    })
    
    const writeData = await getJsonData(writeResponse)
    if (!writeData.success) {
      throw new Error(writeData.error || 'Ошибка сохранения')
    }
    
    editorMessage.value = {
      type: 'success',
      text: '✅ Изменения сохранены! Теперь нужно пересобрать frontend и задеплоить. Используйте кнопку "🚀 Собрать и задеплоить"'
    }
    
    logger.info('Visual changes saved to file', { 
      path: componentPath,
      selector: selectedElement.value.selector 
    })
  } catch (error) {
    logger.error('Save visual changes error:', error)
    editorMessage.value = {
      type: 'error',
      text: '❌ Ошибка сохранения: ' + error.message
    }
  } finally {
    savingChanges.value = false
  }
}

const resetElement = () => {
  if (selectedElement.value?.element) {
    selectedElement.value.element.classList.remove('visual-editor-selected')
  }
  selectedElement.value = null
  editorMessage.value = null
  refreshPreview()
}

const onIframeLoad = () => {
  if (inspectMode.value) {
    setTimeout(() => setupInspectMode(), 500)
  }
  if (editMode.value) {
    setTimeout(() => setupEditMode(), 500)
  }
}

const setViewportSize = (size) => {
  viewportSize.value = size
  // Сбрасываем зум при смене размера
  if (size !== 'mobile') {
    isZoomed.value = false
  }
}

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
}

const clearCache = () => {
  if (confirm('Очистить кэш браузера и перезагрузить страницу?')) {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    window.location.reload(true)
  }
}

const exportChanges = () => {
  if (!selectedElement.value) {
    alert('Выберите элемент для экспорта')
    return
  }
  
  const changes = {
    selector: selectedElement.value.selector,
    styles: selectedElement.value.styles,
    classes: selectedElement.value.classes,
    innerHTML: selectedElement.value.innerHTML
  }
  
  const blob = new Blob([JSON.stringify(changes, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `visual-changes-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Новые методы для расширенного редактирования
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value && previewIframe.value) {
    setupEditMode()
  }
}

const setupEditMode = () => {
  try {
    const iframeDoc = previewIframe.value?.contentDocument || previewIframe.value?.contentWindow?.document
    if (!iframeDoc) return

    // Добавляем стиль для drag-and-drop и resize
    let style = iframeDoc.getElementById('visual-editor-dragdrop')
    if (!style) {
      style = iframeDoc.createElement('style')
      style.id = 'visual-editor-dragdrop'
      style.textContent = `
        body {
          position: relative !important;
        }
        
        .visual-editor-draggable {
          cursor: move !important;
          position: relative !important;
          min-height: 30px !important;
          min-width: 30px !important;
          outline: 1px dashed rgba(139, 92, 246, 0.3) !important;
          outline-offset: 2px !important;
        }
        .visual-editor-draggable:hover {
          outline: 2px dashed rgba(139, 92, 246, 0.6) !important;
          background: rgba(139, 92, 246, 0.05) !important;
          z-index: 10 !important;
        }
        .visual-editor-dragging {
          opacity: 0.6 !important;
          z-index: 9999 !important;
          cursor: grabbing !important;
        }
        .visual-editor-absolute {
          position: absolute !important;
        }
        .visual-editor-selected {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 3px !important;
          background: rgba(59, 130, 246, 0.1) !important;
          z-index: 100 !important;
        }
        /* Resize handles */
        .visual-editor-resize-handle {
          position: absolute !important;
          width: 10px !important;
          height: 10px !important;
          background: #3b82f6 !important;
          border: 2px solid white !important;
          z-index: 10001 !important;
          pointer-events: auto !important;
        }
        .visual-editor-resize-handle.nw { top: -5px !important; left: -5px !important; cursor: nw-resize !important; }
        .visual-editor-resize-handle.ne { top: -5px !important; right: -5px !important; cursor: ne-resize !important; }
        .visual-editor-resize-handle.sw { bottom: -5px !important; left: -5px !important; cursor: sw-resize !important; }
        .visual-editor-resize-handle.se { bottom: -5px !important; right: -5px !important; cursor: se-resize !important; }
        .visual-editor-resize-handle.n { top: -5px !important; left: 50% !important; margin-left: -5px !important; cursor: n-resize !important; }
        .visual-editor-resize-handle.s { bottom: -5px !important; left: 50% !important; margin-left: -5px !important; cursor: s-resize !important; }
        .visual-editor-resize-handle.w { top: 50% !important; left: -5px !important; margin-top: -5px !important; cursor: w-resize !important; }
        .visual-editor-resize-handle.e { top: 50% !important; right: -5px !important; margin-top: -5px !important; cursor: e-resize !important; }
        /* Для мобильных */
        @media (max-width: 768px) {
          .visual-editor-draggable {
            min-height: 44px !important;
            padding: 8px !important;
          }
          .visual-editor-resize-handle {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `
      iframeDoc.head.appendChild(style)
    }
    
    // Делаем элементы перетаскиваемыми
    const elements = iframeDoc.querySelectorAll('button, a, input, h1, h2, h3, p, div, img')
    elements.forEach((el) => {
      if (!el.getAttribute('draggable') && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
        el.setAttribute('draggable', 'true')
        el.classList.add('visual-editor-draggable')
        
        // Mouse events для свободного перемещения
        el.addEventListener('mousedown', handleMouseDown)
      }
    })
    
  } catch (error) {
    console.error('Error setting up edit mode:', error)
  }
}



// Свободное перемещение и resize
let draggedElement = null
let resizingElement = null
let resizeHandle = null
let dragStartX = 0
let dragStartY = 0
let elementStartX = 0
let elementStartY = 0
let elementStartWidth = 0
let elementStartHeight = 0
let isFreeDragging = false

const handleMouseDown = (e) => {
  // Проверяем, не кликнули ли на resize handle
  if (e.target.classList.contains('visual-editor-resize-handle')) {
    e.preventDefault()
    e.stopPropagation()
    startResize(e)
    return
  }
  
  // Проверяем Ctrl/Cmd - свободное перемещение
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    e.stopPropagation()
    startFreeDrag(e)
    return
  }
  
  // Выбор элемента (без preventDefault, чтобы не блокировать другие события)
  selectElement(e.target)
}

const startFreeDrag = (e) => {
  const iframeDoc = previewIframe.value?.contentDocument
  if (!iframeDoc) return
  
  draggedElement = e.target
  isFreeDragging = true
  
  // Сохраняем начальные позиции
  dragStartX = e.clientX
  dragStartY = e.clientY
  
  // Преобразуем в absolute, если ещё нет
  if (!draggedElement.classList.contains('visual-editor-absolute')) {
    const rect = draggedElement.getBoundingClientRect()
    const iframeRect = iframeDoc.documentElement.getBoundingClientRect()
    const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop
    const scrollLeft = iframeDoc.documentElement.scrollLeft || iframeDoc.body.scrollLeft
    
    // Сохраняем оригинальные стили
    draggedElement.setAttribute('data-original-position', window.getComputedStyle(draggedElement).position)
    draggedElement.setAttribute('data-original-display', window.getComputedStyle(draggedElement).display)
    
    draggedElement.classList.add('visual-editor-absolute')
    draggedElement.style.position = 'absolute'
    draggedElement.style.left = (rect.left - iframeRect.left + scrollLeft) + 'px'
    draggedElement.style.top = (rect.top - iframeRect.top + scrollTop) + 'px'
    draggedElement.style.width = rect.width + 'px'
    draggedElement.style.height = rect.height + 'px'
    draggedElement.style.margin = '0' // Убираем margin чтобы позиционирование было точным
    
    // Добавляем resize handles сразу
    addResizeHandles(draggedElement)
  }
  
  elementStartX = parseInt(draggedElement.style.left) || 0
  elementStartY = parseInt(draggedElement.style.top) || 0
  
  draggedElement.classList.add('visual-editor-dragging')
  
  // Добавляем глобальные обработчики
  iframeDoc.addEventListener('mousemove', handleFreeMove)
  iframeDoc.addEventListener('mouseup', endFreeDrag)
  
  // Также обновляем selectedElement
  selectElement(draggedElement)
}

const handleFreeMove = (e) => {
  if (!draggedElement || !isFreeDragging) return
  
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  draggedElement.style.left = (elementStartX + deltaX) + 'px'
  draggedElement.style.top = (elementStartY + deltaY) + 'px'
}

const endFreeDrag = (e) => {
  if (!draggedElement) return
  
  const iframeDoc = previewIframe.value?.contentDocument
  if (iframeDoc) {
    iframeDoc.removeEventListener('mousemove', handleFreeMove)
    iframeDoc.removeEventListener('mouseup', endFreeDrag)
  }
  
  draggedElement.classList.remove('visual-editor-dragging')
  
  if (isFreeDragging) {
    addToHistory('move', draggedElement)
    editorMessage.value = { type: 'success', text: '✅ Элемент перемещён' }
  }
  
  draggedElement = null
  isFreeDragging = false
}

const startResize = (e) => {
  resizingElement = e.target.parentElement
  resizeHandle = e.target.dataset.handle
  
  dragStartX = e.clientX
  dragStartY = e.clientY
  elementStartX = parseInt(resizingElement.style.left) || 0
  elementStartY = parseInt(resizingElement.style.top) || 0
  elementStartWidth = resizingElement.offsetWidth
  elementStartHeight = resizingElement.offsetHeight
  
  const iframeDoc = previewIframe.value?.contentDocument
  if (iframeDoc) {
    iframeDoc.addEventListener('mousemove', handleResize)
    iframeDoc.addEventListener('mouseup', endResize)
  }
}

const handleResize = (e) => {
  if (!resizingElement || !resizeHandle) return
  
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  switch (resizeHandle) {
    case 'se': // Правый нижний
      resizingElement.style.width = (elementStartWidth + deltaX) + 'px'
      resizingElement.style.height = (elementStartHeight + deltaY) + 'px'
      break
    case 'sw': // Левый нижний
      resizingElement.style.width = (elementStartWidth - deltaX) + 'px'
      resizingElement.style.height = (elementStartHeight + deltaY) + 'px'
      resizingElement.style.left = (elementStartX + deltaX) + 'px'
      break
    case 'ne': // Правый верхний
      resizingElement.style.width = (elementStartWidth + deltaX) + 'px'
      resizingElement.style.height = (elementStartHeight - deltaY) + 'px'
      resizingElement.style.top = (elementStartY + deltaY) + 'px'
      break
    case 'nw': // Левый верхний
      resizingElement.style.width = (elementStartWidth - deltaX) + 'px'
      resizingElement.style.height = (elementStartHeight - deltaY) + 'px'
      resizingElement.style.left = (elementStartX + deltaX) + 'px'
      resizingElement.style.top = (elementStartY + deltaY) + 'px'
      break
    case 'n': // Верх
      resizingElement.style.height = (elementStartHeight - deltaY) + 'px'
      resizingElement.style.top = (elementStartY + deltaY) + 'px'
      break
    case 's': // Низ
      resizingElement.style.height = (elementStartHeight + deltaY) + 'px'
      break
    case 'w': // Лево
      resizingElement.style.width = (elementStartWidth - deltaX) + 'px'
      resizingElement.style.left = (elementStartX + deltaX) + 'px'
      break
    case 'e': // Право
      resizingElement.style.width = (elementStartWidth + deltaX) + 'px'
      break
  }
  
  // Обновляем информацию о размерах
  if (selectedElement.value?.element === resizingElement) {
    selectedElement.value.styles.width = resizingElement.style.width
    selectedElement.value.styles.height = resizingElement.style.height
  }
}

const endResize = () => {
  if (!resizingElement) return
  
  const iframeDoc = previewIframe.value?.contentDocument
  if (iframeDoc) {
    iframeDoc.removeEventListener('mousemove', handleResize)
    iframeDoc.removeEventListener('mouseup', endResize)
  }
  
  addToHistory('resize', resizingElement)
  editorMessage.value = { type: 'success', text: '✅ Размер изменён' }
  
  resizingElement = null
  resizeHandle = null
}

const selectElement = (element) => {
  if (!element || element.tagName === 'HTML' || element.tagName === 'BODY') return
  
  const iframeDoc = previewIframe.value?.contentDocument
  if (!iframeDoc) return
  
  // Убираем старое выделение
  if (selectedElement.value?.element) {
    selectedElement.value.element.classList.remove('visual-editor-selected')
    removeResizeHandles()
  }
  
  // Добавляем новое
  element.classList.add('visual-editor-selected')
  
  selectedElement.value = {
    element,
    tagName: element.tagName.toLowerCase(),
    text: element.textContent || '',
    styles: {
      width: element.style.width || '',
      height: element.style.height || '',
      padding: element.style.padding || '',
      margin: element.style.margin || '',
      backgroundColor: element.style.backgroundColor || '',
      color: element.style.color || '',
      fontSize: element.style.fontSize || '',
    },
    attributes: {
      href: element.getAttribute('href') || '',
      src: element.getAttribute('src') || '',
      alt: element.getAttribute('alt') || '',
    }
  }
  
  // Добавляем resize handles, если элемент absolute
  if (element.classList.contains('visual-editor-absolute')) {
    addResizeHandles(element)
  }
}

const addResizeHandles = (element) => {
  const iframeDoc = previewIframe.value?.contentDocument
  if (!iframeDoc) return
  
  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']
  
  handles.forEach(position => {
    const handle = iframeDoc.createElement('div')
    handle.className = `visual-editor-resize-handle ${position}`
    handle.dataset.handle = position
    handle.addEventListener('mousedown', handleMouseDown)
    element.appendChild(handle)
  })
}

const removeResizeHandles = () => {
  if (!selectedElement.value?.element) return
  
  const handles = selectedElement.value.element.querySelectorAll('.visual-editor-resize-handle')
  handles.forEach(handle => handle.remove())
}

const addElement = (type) => {
  const iframeDoc = previewIframe.value?.contentDocument
  if (!iframeDoc) return
  
  let newElement
  
  switch(type) {
    case 'button':
      newElement = iframeDoc.createElement('button')
      newElement.textContent = 'Новая кнопка'
      newElement.className = 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
      break
    case 'text':
      newElement = iframeDoc.createElement('p')
      newElement.textContent = 'Новый текстовый блок'
      newElement.className = 'text-gray-700'
      break
    case 'heading':
      newElement = iframeDoc.createElement('h2')
      newElement.textContent = 'Новый заголовок'
      newElement.className = 'text-2xl font-bold'
      break
    case 'image':
      newElement = iframeDoc.createElement('img')
      newElement.src = 'https://via.placeholder.com/300x200'
      newElement.alt = 'Placeholder'
      newElement.className = 'w-64 h-auto'
      break
    case 'div':
      newElement = iframeDoc.createElement('div')
      newElement.textContent = 'Новый блок'
      newElement.className = 'p-4 border border-gray-300 rounded'
      break
    case 'input':
      newElement = iframeDoc.createElement('input')
      newElement.type = 'text'
      newElement.placeholder = 'Введите текст'
      newElement.className = 'px-3 py-2 border border-gray-300 rounded'
      break
  }
  
  if (newElement) {
    const iframeDoc = previewIframe.value?.contentDocument
    if (!iframeDoc) return
    
    // Добавляем в конец body
    iframeDoc.body.appendChild(newElement)
    
    // Делаем перетаскиваемым
    newElement.setAttribute('draggable', 'true')
    newElement.classList.add('visual-editor-draggable')
    newElement.addEventListener('mousedown', handleMouseDown)
    
    addToHistory('add', newElement)
    editorMessage.value = { type: 'success', text: `✅ Элемент "${type}" добавлен` }
  }
}

const deleteElement = () => {
  if (!selectedElement.value?.element) return
  
  if (confirm('Удалить этот элемент?')) {
    const element = selectedElement.value.element
    addToHistory('delete', element)
    element.remove()
    selectedElement.value = null
    editorMessage.value = { type: 'success', text: '✅ Элемент удалён' }
  }
}

const duplicateElement = () => {
  if (!selectedElement.value?.element) return
  
  const element = selectedElement.value.element
  const clone = element.cloneNode(true)
  
  // Вставляем клон сразу после оригинала
  element.parentNode.insertBefore(clone, element.nextSibling)
  
  // Делаем клон перетаскиваемым
  clone.setAttribute('draggable', 'true')
  clone.classList.add('visual-editor-draggable')
  clone.addEventListener('mousedown', handleMouseDown)
  
  addToHistory('duplicate', clone)
  editorMessage.value = { type: 'success', text: '✅ Элемент продублирован' }
}

const updateElementWidth = () => {
  if (selectedElement.value?.element && elementWidth.value) {
    selectedElement.value.element.style.width = elementWidth.value
    if (!selectedElement.value.styles) selectedElement.value.styles = {}
    selectedElement.value.styles.width = elementWidth.value
  }
}

const updateElementHeight = () => {
  if (selectedElement.value?.element && elementHeight.value) {
    selectedElement.value.element.style.height = elementHeight.value
    if (!selectedElement.value.styles) selectedElement.value.styles = {}
    selectedElement.value.styles.height = elementHeight.value
  }
}

const updateElementPadding = () => {
  if (selectedElement.value?.element && elementPadding.value) {
    selectedElement.value.element.style.padding = elementPadding.value
    if (!selectedElement.value.styles) selectedElement.value.styles = {}
    selectedElement.value.styles.padding = elementPadding.value
  }
}

const updateElementMargin = () => {
  if (selectedElement.value?.element && elementMargin.value) {
    selectedElement.value.element.style.margin = elementMargin.value
    if (!selectedElement.value.styles) selectedElement.value.styles = {}
    selectedElement.value.styles.margin = elementMargin.value
  }
}

const toggleResize = () => {
  if (!selectedElement.value?.element) return
  
  if (enableResize.value) {
    selectedElement.value.element.style.resize = 'both'
    selectedElement.value.element.style.overflow = 'auto'
  } else {
    selectedElement.value.element.style.resize = 'none'
  }
}

const addToHistory = (action, element) => {
  changeHistory.value.push({
    action,
    element: element.cloneNode(true),
    timestamp: Date.now()
  })
  // Ограничиваем историю 50 записями
  if (changeHistory.value.length > 50) {
    changeHistory.value.shift()
  }
}

const undoChanges = () => {
  if (changeHistory.value.length === 0) {
    alert('Нет действий для отмены')
    return
  }
  
  changeHistory.value.pop()
  editorMessage.value = { type: 'success', text: '✅ Действие отменено' }
  refreshPreview()
}

const buildAndDeploy = async () => {
  if (!confirm('🚀 Пересобрать frontend и задеплоить на сервер? Это может занять 1-2 минуты.')) {
    return
  }
  
  isDeploying.value = true
  editorMessage.value = { type: 'success', text: '🚀 Запуск сборки и деплоя на сервере... Пожалуйста, подождите.' }
  
  try {
    // Выполняем деплой на сервере через специальный endpoint
    const response = await fetch('/api/v1/super-admin/system/deploy-frontend', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await getJsonData(response)
    
    if (data.success) {
      editorMessage.value = {
        type: 'success',
        text: '✅ Деплой завершён! Обновите страницу (Ctrl+Shift+R) чтобы увидеть изменения.'
      }
      logger.info('Frontend rebuilt and deployed on server successfully')
      
      // Автоматически обновляем iframe через 3 секунды
      setTimeout(() => {
        refreshPreview()
      }, 3000)
    } else {
      throw new Error(data.error || data.output || 'Ошибка деплоя')
    }
  } catch (error) {
    logger.error('Build and deploy error:', error)
    editorMessage.value = {
      type: 'error',
      text: '❌ Ошибка деплоя: ' + error.message
    }
  } finally {
    isDeploying.value = false
  }
}

// Системный контроль
const loadProcesses = async () => {
  try {
    const response = await fetch('/api/v1/admin/system/processes', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      processes.value = data.processes
    }
  } catch (error) {
    logger.error('Load processes error:', error)
    alert('Ошибка загрузки процессов: ' + error.message)
  }
}

const loadDockerContainers = async () => {
  try {
    const response = await fetch('/api/v1/admin/system/docker/containers', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    const data = await getJsonData(response)
    if (data.success) {
      dockerContainers.value = data.containers || []
    } else {
      throw new Error(data.error || data.message || 'Не удалось загрузить контейнеры')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Docker недоступен в контейнере. Список контейнеров недоступен.'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Проверяем, является ли это ошибкой "docker не найден"
    if (errorMessage.includes('docker: not found') || errorMessage.includes('docker: command not found')) {
      errorMessage = 'Docker недоступен в Docker контейнере. Список контейнеров недоступен.'
    }
    
    logger.error('Load docker containers error:', { error, message: errorMessage })
    alert('Ошибка загрузки контейнеров: ' + errorMessage)
  }
}

const restartContainer = async (containerId) => {
  if (!confirm('Перезапустить контейнер?')) return
  try {
    const response = await fetch(`/api/v1/admin/system/docker/container/${containerId}/restart`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      alert('✅ Контейнер перезапущен')
      await loadDockerContainers()
    }
  } catch (error) {
    logger.error('Restart container error:', error)
    alert('Ошибка перезапуска контейнера: ' + error.message)
  }
}

const loadRealtimeLogs = async () => {
  try {
    const response = await fetch(`/api/v1/admin/system/logs/realtime?service=${selectedLogService.value}&lines=100`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    
    // Обрабатываем ответ (может быть 200 даже если success: false)
    const data = await getJsonData(response)
    
    if (data.success) {
      realtimeLogs.value = data.logs || data.data?.logs || ''
      logger.info('Realtime logs loaded', { service: selectedLogService.value })
    } else {
      // Backend вернул success: false, но это не критическая ошибка
      const errorMsg = data.error || data.message || 'Логи недоступны'
      const hint = data.hint || ''
      const logs = data.logs || ''
      
      // Показываем информацию пользователю, но не как критическую ошибку
      realtimeLogs.value = logs || `⚠️ ${errorMsg}${hint ? '\n\n💡 ' + hint : ''}`
      
      logger.warn('Realtime logs not available', { service: selectedLogService.value, error: errorMsg, hint })
      
      // Не показываем alert для некритических ошибок (файл просто не найден)
      if (!errorMsg.includes('не найдены') && !errorMsg.includes('недоступны')) {
        // Только для реальных ошибок показываем alert
        console.warn('Логи недоступны:', errorMsg)
      }
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Логи недоступны. Проверьте доступность сервиса.'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Показываем сообщение в области логов вместо alert
    realtimeLogs.value = `❌ Ошибка загрузки логов: ${errorMessage}\n\n💡 Используйте браузер файлов в разделе "Системный Контроль" для поиска файлов логов на сервере.`
    
    logger.error('Load realtime logs error:', { error, message: errorMessage })
    // Не показываем alert - информация уже в realtimeLogs.value
  }
}

const loadGitStatus = async () => {
  try {
    const response = await fetch('/api/v1/admin/system/git/status', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    const data = await getJsonData(response)
    if (data.success) {
      gitStatus.value = data
    } else {
      throw new Error(data.error || data.message || 'Не удалось загрузить статус Git')
    }
  } catch (error) {
    // Извлекаем понятное сообщение об ошибке
    let errorMessage = 'Неизвестная ошибка'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.error) {
      // Проверяем, не является ли error.error пустым объектом
      if (typeof error.error === 'object' && Object.keys(error.error).length === 0) {
        errorMessage = 'Git недоступен в контейнере или репозиторий не найден'
      } else if (typeof error.error === 'string') {
        errorMessage = error.error
      } else {
        errorMessage = JSON.stringify(error.error)
      }
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // Проверяем, является ли это ошибкой "git не найден"
    if (errorMessage.includes('git: not found') || errorMessage.includes('git: command not found')) {
      errorMessage = 'Git недоступен в Docker контейнере. Статус репозитория недоступен.'
    }
    
    logger.error('Load git status error:', { error, message: errorMessage })
    alert('Ошибка загрузки статуса Git: ' + errorMessage)
  }
}

const loadEnvironmentVariables = async () => {
  try {
    const response = await fetch('/api/v1/admin/system/env', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      environmentVariables.value = data.environment
    }
  } catch (error) {
    logger.error('Load environment variables error:', error)
    alert('Ошибка загрузки переменных окружения: ' + error.message)
  }
}

const loadActiveConnections = async () => {
  try {
    const response = await fetch('/api/v1/admin/system/active-connections', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      activeConnections.value = data
    }
  } catch (error) {
    logger.error('Load active connections error:', error)
    alert('Ошибка загрузки подключений: ' + error.message)
  }
}

// Управление Docker сервисами
const restartBackendService = async () => {
  if (!confirm('Перезапустить Backend сервис?')) return
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/docker/restart-service', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ service: 'backend' })
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || data.message || '✅ Backend перезапущен'
      alert('✅ Backend перезапущен')
    } else {
      throw new Error(data.error || data.hint || 'Ошибка перезапуска Backend')
    }
  } catch (error) {
    logger.error('Restart backend error:', error)
    alert('Ошибка перезапуска Backend: ' + (error.message || error.toString()))
  }
}

const restartFrontendService = async () => {
  if (!confirm('Перезапустить Frontend сервис?')) return
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/docker/restart-service', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ service: 'frontend' })
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || data.message || '✅ Frontend перезапущен'
      alert('✅ Frontend перезапущен')
    } else {
      throw new Error(data.error || data.hint || 'Ошибка перезапуска Frontend')
    }
  } catch (error) {
    logger.error('Restart frontend error:', error)
    alert('Ошибка перезапуска Frontend: ' + (error.message || error.toString()))
  }
}

const getBackendLogs = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/docker/logs?service=backend&lines=50', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.logs || 'Логи недоступны'
    } else {
      throw new Error(data.error || data.hint || 'Ошибка получения логов Backend')
    }
  } catch (error) {
    logger.error('Get backend logs error:', error)
    alert('Ошибка получения логов Backend: ' + (error.message || error.toString()))
  }
}

// Управление системными сервисами
const getNginxStatus = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    // Используем super-admin эндпоинт для выполнения команды на хосте
    const response = await fetch('/api/v1/super-admin/system/execute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        command: 'docker ps --filter "name=roadhelp-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || 'Статус Nginx недоступен'
    } else {
      // Если команда недоступна в контейнере, показываем подсказку
      const hint = data.warning || data.error || 'Ошибка получения статуса Nginx'
      commandResult.value = hint
      alert('⚠️ ' + hint + '\n\nДля проверки статуса frontend используйте команду на хосте:\ndocker-compose -f /home/vmroadhelp/docker-compose.production.yml ps frontend')
    }
  } catch (error) {
    logger.error('Get nginx status error:', error)
    const errorMsg = error.message || error.toString()
    alert('Ошибка получения статуса Nginx: ' + errorMsg + '\n\nДля проверки статуса frontend используйте команду на хосте:\ndocker-compose -f /home/vmroadhelp/docker-compose.production.yml ps frontend')
  }
}

const restartNginxService = async () => {
  if (!confirm('Перезапустить Nginx сервис?')) return
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/docker/restart-service', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ service: 'frontend' })
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || data.message || '✅ Nginx (frontend) перезапущен'
      alert('✅ Nginx (frontend) перезапущен')
    } else {
      throw new Error(data.error || data.hint || 'Ошибка перезапуска Nginx')
    }
  } catch (error) {
    logger.error('Restart nginx error:', error)
    alert('Ошибка перезапуска Nginx: ' + (error.message || error.toString()))
  }
}

const getPostgresStatus = async () => {
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/service/status?service=postgres', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.status || 'Статус PostgreSQL недоступен'
    } else {
      throw new Error(data.error || data.hint || 'Ошибка получения статуса PostgreSQL')
    }
  } catch (error) {
    logger.error('Get postgres status error:', error)
    alert('Ошибка получения статуса PostgreSQL: ' + (error.message || error.toString()))
  }
}

const restartPostgresService = async () => {
  if (!confirm('Перезапустить PostgreSQL сервис? Это может прервать активные подключения!')) return
  try {
    const token = getToken()
    if (!token) {
      alert('Ошибка: Токен не найден')
      return
    }
    const response = await fetch('/api/v1/admin/system/docker/restart-service', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ service: 'postgres' })
    })
    const data = await getJsonData(response)
    if (data.success) {
      commandResult.value = data.output || data.message || '✅ PostgreSQL перезапущен'
      alert('✅ PostgreSQL перезапущен')
    } else {
      throw new Error(data.error || data.hint || 'Ошибка перезапуска PostgreSQL')
    }
  } catch (error) {
    logger.error('Restart postgres error:', error)
    alert('Ошибка перезапуска PostgreSQL: ' + (error.message || error.toString()))
  }
}

// Визуальный редактор интерфейса
const loadAvailableComponents = async () => {
  try {
    // Пробуем несколько возможных путей
    const possiblePaths = [
      '/home/vmroadhelp/frontend/src/components',
      '/home/vmroadhelp/roadhelp/frontend/src/components',
      '/app/frontend/src/components',
      '/home/vmroadhelp'
    ]

    let lastError = null
    for (const path of possiblePaths) {
      try {
        const response = await fetch('/api/v1/super-admin/files/list', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path })
        })
        const data = await getJsonData(response)
        if (data.success && data.items) {
          availableComponents.value = (data.items || []).filter(item => 
            item.type === 'file' && item.name.endsWith('.vue')
          ).map(item => ({
            name: item.name,
            path: item.path
          }))
          logger.info('Available components loaded', { count: availableComponents.value.length, path })
          return // Успешно загрузили, выходим
        }
      } catch (pathError) {
        lastError = pathError
        // Продолжаем пробовать следующий путь
        continue
      }
    }

    // Если ни один путь не сработал
    if (lastError) {
      throw lastError
    } else {
      throw new Error('Не удалось найти директорию с компонентами. Используйте браузер файлов для навигации.')
    }
  } catch (error) {
    logger.error('Load available components error:', error)
    // Не показываем alert, просто логируем - пользователь может использовать браузер файлов
    console.warn('Не удалось загрузить компоненты автоматически. Используйте браузер файлов в разделе "Системный Контроль" для навигации.')
  }
}

const selectComponentForEdit = async (component) => {
  selectedComponentForEdit.value = component
  try {
    const response = await fetch('/api/v1/super-admin/files/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: component.path })
    })
    const data = await getJsonData(response)
    if (data.success) {
      componentEditContent.value = data.content
      if (autoPreview.value) {
        updateLivePreview()
      }
    }
  } catch (error) {
    logger.error('Load component error:', error)
    alert('Ошибка загрузки компонента: ' + error.message)
  }
}

const updateLivePreview = () => {
  if (!autoPreview.value || !componentEditContent.value) return
  
  try {
    // Извлекаем template часть для предпросмотра
    const templateMatch = componentEditContent.value.match(/<template>([\s\S]*?)<\/template>/)
    if (templateMatch) {
      livePreviewContent.value = templateMatch[1]
    } else {
      livePreviewContent.value = '<div class="text-gray-500">Не найден блок &lt;template&gt;</div>'
    }
  } catch (error) {
    livePreviewContent.value = '<div class="text-red-500">Ошибка парсинга: ' + error.message + '</div>'
  }
}

const saveComponentEdit = async () => {
  if (!selectedComponentForEdit.value || !componentEditContent.value) {
    alert('Нет компонента для сохранения')
    return
  }
  
  savingComponentEdit.value = true
  componentEditMessage.value = null
  
  try {
    const response = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: selectedComponentForEdit.value.path,
        content: componentEditContent.value
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      componentEditMessage.value = { type: 'success', text: '✅ Компонент успешно сохранен' }
      logger.info('Component saved', { path: selectedComponentForEdit.value.path })
    } else {
      throw new Error(data.error || data.message || 'Ошибка сохранения')
    }
  } catch (error) {
    logger.error('Save component error:', error)
    componentEditMessage.value = { type: 'error', text: 'Ошибка сохранения: ' + error.message }
  } finally {
    savingComponentEdit.value = false
  }
}

const reloadComponentEdit = () => {
  if (selectedComponentForEdit.value) {
    selectComponentForEdit(selectedComponentForEdit.value)
  }
}

const resetComponentEdit = () => {
  if (confirm('Сбросить все изменения?')) {
    reloadComponentEdit()
  }
}

const exportComponent = () => {
  if (!componentEditContent.value) {
    alert('Нет содержимого для экспорта')
    return
  }
  
  const blob = new Blob([componentEditContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = selectedComponentForEdit.value?.name || 'component.vue'
  a.click()
  URL.revokeObjectURL(url)
}

const importComponent = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.vue'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        componentEditContent.value = event.target.result
        if (autoPreview.value) {
          updateLivePreview()
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const validateComponent = () => {
  if (!componentEditContent.value) {
    alert('Нет содержимого для валидации')
    return
  }
  
  const errors = []
  
  // Проверка наличия template
  if (!componentEditContent.value.includes('<template>')) {
    errors.push('Отсутствует блок <template>')
  }
  
  // Проверка наличия script
  if (!componentEditContent.value.includes('<script')) {
    errors.push('Отсутствует блок <script>')
  }
  
  // Проверка закрывающих тегов
  if ((componentEditContent.value.match(/<template>/g) || []).length !== 
      (componentEditContent.value.match(/<\/template>/g) || []).length) {
    errors.push('Несоответствие открывающих и закрывающих тегов <template>')
  }
  
  if (errors.length > 0) {
    alert('Ошибки валидации:\n' + errors.join('\n'))
  } else {
    alert('✅ Компонент валиден!')
  }
}

const formatComponent = () => {
  if (!componentEditContent.value) {
    alert('Нет содержимого для форматирования')
    return
  }
  
  try {
    // Простое форматирование - добавление отступов
    let formatted = componentEditContent.value
    // Заменяем множественные пробелы на одинарные
    formatted = formatted.replace(/\s{2,}/g, ' ')
    // Добавляем переносы строк после закрывающих тегов
    formatted = formatted.replace(/>/g, '>\n')
    formatted = formatted.replace(/</g, '\n<')
    // Убираем лишние переносы
    formatted = formatted.replace(/\n{3,}/g, '\n\n')
    
    componentEditContent.value = formatted.trim()
    if (autoPreview.value) {
      updateLivePreview()
    }
    alert('✅ Компонент отформатирован')
  } catch (error) {
    alert('Ошибка форматирования: ' + error.message)
  }
}

// Функции браузера файлов в системном контроле
const loadFileBrowser = async () => {
  try {
    const response = await fetch('/api/v1/super-admin/files/list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: fileBrowserPath.value || '/home/vmroadhelp' })
    })
    const data = await getJsonData(response)
    if (data.success) {
      fileBrowserItems.value = data.items || []
      selectedFileBrowserItem.value = null
      fileBrowserContent.value = ''
    } else {
      throw new Error(data.error || 'Ошибка загрузки файлов')
    }
  } catch (error) {
    logger.error('Load file browser error:', error)
    alert('Ошибка загрузки файлов: ' + error.message)
  }
}

const refreshFileBrowser = () => {
  loadFileBrowser()
}

const selectFileBrowserItem = (item) => {
  selectedFileBrowserItem.value = item
  if (item.type === 'file') {
    loadFileBrowserFile(item)
  }
}

const openFileBrowserItem = (item) => {
  if (item.type === 'directory') {
    fileBrowserPath.value = item.path
    loadFileBrowser()
  }
}

const goToParentDirectory = () => {
  const pathParts = fileBrowserPath.value.split('/').filter(p => p)
  if (pathParts.length > 0) {
    pathParts.pop()
    fileBrowserPath.value = '/' + pathParts.join('/') || '/'
    loadFileBrowser()
  }
}

const loadFileBrowserFile = async (item) => {
  try {
    const response = await fetch('/api/v1/super-admin/files/read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: item.path })
    })
    const data = await getJsonData(response)
    if (data.success) {
      fileBrowserContent.value = data.content
      fileBrowserSaveMessage.value = null
    } else {
      throw new Error(data.error || 'Ошибка загрузки файла')
    }
  } catch (error) {
    logger.error('Load file browser file error:', error)
    alert('Ошибка загрузки файла: ' + error.message)
  }
}

const saveFileBrowserFile = async () => {
  if (!selectedFileBrowserItem.value || selectedFileBrowserItem.value.type !== 'file') {
    alert('Выберите файл для сохранения')
    return
  }
  
  savingFileBrowser.value = true
  fileBrowserSaveMessage.value = null
  
  try {
    const response = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: selectedFileBrowserItem.value.path,
        content: fileBrowserContent.value
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      fileBrowserSaveMessage.value = { type: 'success', text: '✅ Файл успешно сохранен' }
    } else {
      throw new Error(data.error || data.message || 'Ошибка сохранения')
    }
  } catch (error) {
    logger.error('Save file browser file error:', error)
    fileBrowserSaveMessage.value = { type: 'error', text: 'Ошибка сохранения: ' + error.message }
  } finally {
    savingFileBrowser.value = false
  }
}

const reloadFileBrowserFile = () => {
  if (selectedFileBrowserItem.value && selectedFileBrowserItem.value.type === 'file') {
    loadFileBrowserFile(selectedFileBrowserItem.value)
  }
}

const deleteFileBrowserItem = async (item) => {
  const itemType = item.type === 'directory' ? 'директорию' : 'файл'
  if (!confirm(`Вы уверены, что хотите удалить ${itemType} "${item.name}"?\n\nЭто действие необратимо!`)) {
    return
  }
  
  try {
    const response = await fetch('/api/v1/super-admin/files/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: item.path })
    })
    const data = await getJsonData(response)
    if (data.success) {
      alert(`✅ ${itemType === 'директорию' ? 'Директория' : 'Файл'} успешно удален`)
      await loadFileBrowser()
      if (selectedFileBrowserItem.value?.path === item.path) {
        selectedFileBrowserItem.value = null
        fileBrowserContent.value = ''
      }
    } else {
      throw new Error(data.error || data.message || 'Ошибка удаления')
    }
  } catch (error) {
    logger.error('Delete file browser item error:', error)
    alert('Ошибка удаления: ' + error.message)
  }
}

const createDirectory = async () => {
  if (!newDirectoryName.value.trim()) {
    alert('Введите имя директории')
    return
  }
  
  const newPath = fileBrowserPath.value.endsWith('/') 
    ? fileBrowserPath.value + newDirectoryName.value
    : fileBrowserPath.value + '/' + newDirectoryName.value
  
  try {
    const response = await fetch('/api/v1/super-admin/files/create-directory', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: newPath })
    })
    const data = await getJsonData(response)
    if (data.success) {
      alert('✅ Директория успешно создана')
      showCreateDirectoryModal.value = false
      newDirectoryName.value = ''
      await loadFileBrowser()
    } else {
      throw new Error(data.error || data.message || 'Ошибка создания директории')
    }
  } catch (error) {
    logger.error('Create directory error:', error)
    alert('Ошибка создания директории: ' + error.message)
  }
}

const createFile = async () => {
  if (!newFileName.value.trim()) {
    alert('Введите имя файла')
    return
  }
  
  const newPath = fileBrowserPath.value.endsWith('/') 
    ? fileBrowserPath.value + newFileName.value
    : fileBrowserPath.value + '/' + newFileName.value
  
  try {
    const response = await fetch('/api/v1/super-admin/files/write', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: newPath,
        content: newFileContent.value || ''
      })
    })
    const data = await getJsonData(response)
    if (data.success) {
      alert('✅ Файл успешно создан')
      showCreateFileModal.value = false
      newFileName.value = ''
      newFileContent.value = ''
      await loadFileBrowser()
    } else {
      throw new Error(data.error || data.message || 'Ошибка создания файла')
    }
  } catch (error) {
    logger.error('Create file error:', error)
    alert('Ошибка создания файла: ' + error.message)
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    showUploadFileModal.value = false
    return
  }
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target.result
      const fileName = file.name
      const uploadPath = fileBrowserPath.value.endsWith('/') 
        ? fileBrowserPath.value + fileName
        : fileBrowserPath.value + '/' + fileName
      
      const response = await fetch('/api/v1/super-admin/files/write', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: uploadPath,
          content: content
        })
      })
      const data = await getJsonData(response)
      if (data.success) {
        alert('✅ Файл успешно загружен')
        showUploadFileModal.value = false
        // Сбрасываем input
        if (fileUploadInput.value) {
          fileUploadInput.value.value = ''
        }
        await loadFileBrowser()
      } else {
        throw new Error(data.error || data.message || 'Ошибка загрузки файла')
      }
    } catch (error) {
      logger.error('Upload file error:', error)
      alert('Ошибка загрузки файла: ' + error.message)
    }
  }
  reader.onerror = () => {
    alert('Ошибка чтения файла')
    showUploadFileModal.value = false
  }
  reader.readAsText(file)
}

// Отслеживаем переключение вкладок
watch(activeTab, (newTab) => {
  if (newTab === 'visual-interface-editor') {
    loadAvailableComponents()
  }
  if (newTab === 'system-control') {
    loadFileBrowser()
  }
})

// Загружаем компоненты при монтировании
onMounted(() => {
  if (activeTab.value === 'visual-interface-editor') {
    loadAvailableComponents()
  }
  if (activeTab.value === 'system-control') {
    loadFileBrowser()
  }
})

onMounted(async () => {
  const adminData = localStorage.getItem('admin')
  if (adminData) {
    try {
      admin.value = JSON.parse(adminData)
      if (admin.value.role !== 'super_admin') {
        alert('Доступ запрещен. Требуются права super_admin')
        router.push('/admin/dashboard')
      } else {
        // Загружаем компоненты при монтировании (не ждем результата)
        refreshComponents().catch(err => {
          // Ошибка уже обработана в refreshComponents
          console.warn('Failed to refresh components on mount:', err)
        })
      }
    } catch (error) {
      logger.error('Admin panel mount error:', error)
      router.push('/admin/login')
    }
  } else {
    router.push('/admin/login')
  }
})

onUnmounted(() => {
  adminWsService.disconnect()
})
</script>



