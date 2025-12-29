<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              class="text-gray-800 font-medium hover:text-gray-800 font-medium"
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
              👥 Полное Управление Пользователями
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              @click="openEmailModal"
            >
              📧 Рассылка
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              @click="loadUsers"
            >
              🔄 Обновить
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Статистика -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-blue-800">Всего</h3>
          <p class="text-2xl font-bold text-blue-900">{{ users.length }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-green-800">Активных</h3>
          <p class="text-2xl font-bold text-green-900">{{ activeUsers }}</p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-red-800">Заблокировано</h3>
          <p class="text-2xl font-bold text-red-900">{{ blockedUsers }}</p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-yellow-800">🥇 Золотых</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ goldUsers }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-gray-600">🥈 Серебряных</h3>
          <p class="text-2xl font-bold text-gray-500">{{ silverUsers }}</p>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <h3 class="text-xs font-medium text-orange-800">🥉 Бронзовых</h3>
          <p class="text-2xl font-bold text-orange-600">{{ bronzeUsers }}</p>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по имени, email, телефону..."
            class="px-3 py-2 border border-gray-300 rounded-md"
            @input="filterUsers"
          >
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-md"
            @change="filterUsers"
          >
            <option value="">Все статусы активности</option>
            <option value="active">✅ Активные</option>
            <option value="inactive">❌ Заблокированные</option>
          </select>
          <select
            v-model="filterPremium"
            class="px-3 py-2 border border-gray-300 rounded-md"
            @change="filterUsers"
          >
            <option value="">Все премиум статусы</option>
            <option value="gold">🥇 Золотой</option>
            <option value="silver">🥈 Серебряный</option>
            <option value="bronze">🥉 Бронзовый</option>
            <option value="none">Без статуса</option>
          </select>
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-md"
            @change="filterUsers"
          >
            <option value="created_at">По дате регистрации</option>
            <option value="full_name">По имени</option>
            <option value="email">По email</option>
            <option value="rating">По рейтингу</option>
          </select>
          <button
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            @click="resetFilters"
          >
            🔄 Сбросить
          </button>
        </div>
      </div>

      <!-- Таблица пользователей -->
      <div class="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Пользователь</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Контакты</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Рейтинг</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Премиум</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Верификация</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              :class="getUserRowClass(user)"
            >
              <!-- Пользователь -->
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.avatar_url"
                      :src="getAvatarUrl(user.avatar_url)"
                      class="h-10 w-10 rounded-full object-cover"
                      alt=""
                    >
                    <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {{ (user.full_name || user.name || '?')[0]?.toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <span :class="getPremiumNameClass(user.premium_status)">
                        {{ getPremiumIcon(user.premium_status) }} {{ user.full_name || user.name || '-' }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      ID: {{ user.id?.substring(0, 8) }}...
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <!-- Контакты -->
              <td class="px-4 py-4 text-sm">
                <div class="text-gray-900">{{ user.email || '-' }}</div>
                <div class="text-gray-500 text-xs">{{ user.phone || '-' }}</div>
              </td>
              <!-- Рейтинг -->
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-medium">{{ user.rating ? Number(user.rating).toFixed(1) : '0.0' }}</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ user.total_helps_given || 0 }} помощей
                </div>
              </td>
              <!-- Премиум статус -->
              <td class="px-4 py-4 whitespace-nowrap">
                <select
                  :value="user.premium_status || ''"
                  class="text-sm border rounded px-2 py-1 w-full"
                  :class="getPremiumSelectClass(user.premium_status)"
                  @change="setPremiumStatus(user, $event.target.value)"
                >
                  <option value="">Нет статуса</option>
                  <option value="bronze">🥉 Бронзовый</option>
                  <option value="silver">🥈 Серебряный</option>
                  <option value="gold">🥇 Золотой</option>
                </select>
              </td>
              <!-- Статус активности -->
              <td class="px-4 py-4 whitespace-nowrap">
                <button
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    user.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                      : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                  ]"
                  :title="user.is_active ? 'Клик для блокировки' : 'Клик для активации'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.is_active ? '✅ Активен' : '🚫 Заблокирован' }}
                </button>
              </td>
              <!-- Верификация -->
              <td class="px-4 py-4 whitespace-nowrap">
                <button
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    user.is_verified 
                      ? 'bg-blue-100 text-blue-800 hover:bg-gray-100 hover:text-gray-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-800'
                  ]"
                  :title="user.is_verified ? 'Клик для снятия верификации' : 'Клик для верификации'"
                  @click="toggleVerification(user)"
                >
                  {{ user.is_verified ? '✓ Верифицирован' : '○ Не верифицирован' }}
                </button>
              </td>
              <!-- Действия -->
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-1">
                  <button
                    class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                    title="Просмотреть детали"
                    @click="viewUserDetails(user)"
                  >
                    👁️
                  </button>
                  <button
                    class="text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
                    title="Редактировать профиль"
                    @click="editUser(user)"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="user.email"
                    class="text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50"
                    title="Отправить email"
                    @click="openEmailModalForUser(user)"
                  >
                    📧
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                    title="Удалить пользователя"
                    @click="confirmDeleteUser(user)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="filteredUsers.length === 0"
          class="text-center py-12 text-gray-700"
        >
          Пользователи не найдены
        </div>
      </div>

      <!-- Пагинация -->
      <div
        v-if="pagination && pagination.pages > 1"
        class="mt-6 flex justify-center items-center space-x-2"
      >
        <button 
          :disabled="pagination.page <= 1" 
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(pagination.page - 1)"
        >
          ← Назад
        </button>
        <span class="text-sm text-gray-800 font-medium">
          Страница {{ pagination.page }} из {{ pagination.pages }} (всего: {{ pagination.total }})
        </span>
        <button 
          :disabled="pagination.page >= pagination.pages" 
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(pagination.page + 1)"
        >
          Вперёд →
        </button>
      </div>
    </div>

    <!-- Модальное окно деталей пользователя -->
    <div
      v-if="showUserModal && selectedUser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showUserModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span :class="getPremiumNameClass(selectedUser.premium_status)">
            {{ getPremiumIcon(selectedUser.premium_status) }} {{ selectedUser.full_name || selectedUser.name || 'Пользователь' }}
          </span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Основная информация -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 border-b pb-2">📋 Основная информация</h3>
            <div class="text-sm"><strong>ID:</strong> {{ selectedUser.id }}</div>
            <div class="text-sm"><strong>Email:</strong> {{ selectedUser.email || '-' }}</div>
            <div class="text-sm"><strong>Телефон:</strong> {{ selectedUser.phone || '-' }}</div>
            <div class="text-sm"><strong>Регистрация:</strong> {{ selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('ru-RU') : '-' }}</div>
            <div class="text-sm" v-if="selectedUser.last_login">
              <strong>Последний вход:</strong> {{ new Date(selectedUser.last_login).toLocaleString('ru-RU') }}
            </div>
          </div>
          
          <!-- Статусы -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 border-b pb-2">🏅 Статусы</h3>
            <div class="text-sm flex items-center gap-2">
              <strong>Активность:</strong>
              <span :class="selectedUser.is_active ? 'text-green-600' : 'text-red-600'">
                {{ selectedUser.is_active ? '✅ Активен' : '🚫 Заблокирован' }}
              </span>
            </div>
            <div class="text-sm flex items-center gap-2">
              <strong>Верификация:</strong>
              <span :class="selectedUser.is_verified ? 'text-blue-600' : 'text-gray-500'">
                {{ selectedUser.is_verified ? '✓ Верифицирован' : '○ Не верифицирован' }}
              </span>
            </div>
            <div class="text-sm flex items-center gap-2">
              <strong>Email:</strong>
              <span :class="selectedUser.email_verified ? 'text-green-600' : 'text-gray-500'">
                {{ selectedUser.email_verified ? '✉️ Подтверждён' : '○ Не подтверждён' }}
              </span>
            </div>
            <div class="text-sm flex items-center gap-2">
              <strong>Премиум:</strong>
              <span :class="getPremiumNameClass(selectedUser.premium_status)">
                {{ getPremiumLabel(selectedUser.premium_status) }}
              </span>
            </div>
          </div>
          
          <!-- Статистика -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 border-b pb-2">📊 Статистика</h3>
            <div class="text-sm flex items-center gap-2">
              <strong>Рейтинг:</strong>
              <span class="text-yellow-500">⭐</span>
              <span>{{ selectedUser.rating ? Number(selectedUser.rating).toFixed(1) : '0.0' }}</span>
            </div>
            <div class="text-sm"><strong>Всего помощей:</strong> {{ selectedUser.total_helps_given || 0 }}</div>
            <div class="text-sm"><strong>Получено помощей:</strong> {{ selectedUser.total_helps_received || 0 }}</div>
          </div>
          
          <!-- Автомобиль -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 border-b pb-2">🚗 Автомобиль</h3>
            <div class="text-sm"><strong>Марка:</strong> {{ selectedUser.car_brand || '-' }}</div>
            <div class="text-sm"><strong>Модель:</strong> {{ selectedUser.car_model || '-' }}</div>
            <div class="text-sm"><strong>Номер:</strong> {{ selectedUser.car_number || '-' }}</div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="showUserModal = false"
          >
            Закрыть
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            @click="editUser(selectedUser); showUserModal = false"
          >
            ✏️ Редактировать
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования пользователя -->
    <div
      v-if="showEditModal && selectedUser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showEditModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-4">
          ✏️ Редактировать профиль пользователя
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Основные данные -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-900 border-b pb-2">📋 Основные данные</h3>
            <div>
              <label class="block text-sm font-medium mb-1">Имя</label>
              <input
                v-model="editForm.full_name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Телефон</label>
              <input
                v-model="editForm.phone"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
          </div>
          
          <!-- Статусы и настройки -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-900 border-b pb-2">🏅 Статусы</h3>
            <div>
              <label class="block text-sm font-medium mb-1">Премиум статус</label>
              <select
                v-model="editForm.premium_status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                :class="getPremiumSelectClass(editForm.premium_status)"
              >
                <option value="">Нет статуса</option>
                <option value="bronze">🥉 Бронзовый</option>
                <option value="silver">🥈 Серебряный</option>
                <option value="gold">🥇 Золотой</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Рейтинг</label>
              <input
                v-model="editForm.rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Количество помощей</label>
              <input
                v-model="editForm.total_helps_given"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center space-x-2">
                <input
                  v-model="editForm.is_active"
                  type="checkbox"
                  class="rounded"
                >
                <span class="text-sm">✅ Активен</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  v-model="editForm.is_verified"
                  type="checkbox"
                  class="rounded"
                >
                <span class="text-sm">✓ Верифицирован</span>
              </label>
            </div>
          </div>
          
          <!-- Автомобиль -->
          <div class="space-y-4 md:col-span-2">
            <h3 class="font-medium text-gray-900 border-b pb-2">🚗 Автомобиль</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Марка</label>
                <input
                  v-model="editForm.car_brand"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Модель</label>
                <input
                  v-model="editForm.car_model"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Номер</label>
                <input
                  v-model="editForm.car_number"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="showEditModal = false"
          >
            Отмена
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            @click="saveUser"
          >
            💾 Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно отправки email -->
    <div
      v-if="showEmailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showEmailModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-4">
          📧 Отправка Email
        </h2>
        
        <!-- Выбор получателей -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Получатели</label>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input
                v-model="emailForm.recipients"
                type="radio"
                value="all"
                name="recipients"
              >
              <span>👥 Всем пользователям ({{ users.filter(u => u.email && u.is_active).length }} чел.)</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="emailForm.recipients"
                type="radio"
                value="filtered"
                name="recipients"
              >
              <span>🔍 Отфильтрованным ({{ filteredUsers.filter(u => u.email).length }} чел.)</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="emailForm.recipients"
                type="radio"
                value="single"
                name="recipients"
                :disabled="!emailForm.singleUser"
              >
              <span>
                👤 Одному пользователю
                <span v-if="emailForm.singleUser" class="text-blue-600 font-medium">
                  ({{ emailForm.singleUser.full_name || emailForm.singleUser.email }})
                </span>
              </span>
            </label>
          </div>
        </div>
        
        <!-- Тема -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Тема письма</label>
          <input
            v-model="emailForm.subject"
            type="text"
            placeholder="Важное уведомление от Help-Car.Online"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
        </div>
        
        <!-- Текст сообщения -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Текст сообщения</label>
          <textarea
            v-model="emailForm.message"
            rows="6"
            placeholder="Введите текст сообщения..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <!-- Шаблоны -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Быстрые шаблоны</label>
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              @click="applyTemplate('welcome')"
            >
              👋 Приветствие
            </button>
            <button
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              @click="applyTemplate('update')"
            >
              📢 Обновление
            </button>
            <button
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              @click="applyTemplate('promo')"
            >
              🎁 Акция
            </button>
            <button
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              @click="applyTemplate('reminder')"
            >
              ⏰ Напоминание
            </button>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="showEmailModal = false"
          >
            Отмена
          </button>
          <button
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            :disabled="!emailForm.subject || !emailForm.message || isSendingEmail"
            @click="sendEmail"
          >
            {{ isSendingEmail ? 'Отправка...' : '📤 Отправить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logger } from '@/utils/logger'

const router = useRouter()
const users = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterPremium = ref('')
const sortBy = ref('created_at')
const pagination = ref(null)
const currentPage = ref(1)
const pageSize = ref(50)

const getToken = () => localStorage.getItem('adminToken')

const goToHome = () => router.push('/')
const goToDashboard = () => router.push('/admin/dashboard')

// Функция для получения полного URL аватара
const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}

// Вспомогательные функции для премиум статусов
const getPremiumIcon = (status) => {
  switch (status) {
    case 'gold': return '🥇'
    case 'silver': return '🥈'
    case 'bronze': return '🥉'
    default: return ''
  }
}

const getPremiumLabel = (status) => {
  switch (status) {
    case 'gold': return '🥇 Золотой'
    case 'silver': return '🥈 Серебряный'
    case 'bronze': return '🥉 Бронзовый'
    default: return 'Нет статуса'
  }
}

const getPremiumNameClass = (status) => {
  switch (status) {
    case 'gold': return 'text-yellow-600 font-bold'
    case 'silver': return 'text-gray-500 font-semibold'
    case 'bronze': return 'text-orange-600 font-semibold'
    default: return ''
  }
}

const getPremiumSelectClass = (status) => {
  switch (status) {
    case 'gold': return 'bg-yellow-50 border-yellow-300 text-yellow-800'
    case 'silver': return 'bg-gray-100 border-gray-300 text-gray-600'
    case 'bronze': return 'bg-orange-50 border-orange-300 text-orange-800'
    default: return 'bg-white border-gray-300'
  }
}

const getUserRowClass = (user) => {
  if (!user.is_active) return 'bg-red-50'
  switch (user.premium_status) {
    case 'gold': return 'bg-yellow-50'
    case 'silver': return 'bg-gray-50'
    case 'bronze': return 'bg-orange-50'
    default: return ''
  }
}

const filteredUsers = computed(() => {
  let result = [...users.value]

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      (user.full_name || user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.phone || '').includes(query) ||
      (user.id || '').toLowerCase().includes(query)
    )
  }

  // Фильтр по статусу активности
  if (filterStatus.value === 'active') {
    result = result.filter(user => user.is_active)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(user => !user.is_active)
  }

  // Фильтр по премиум статусу
  if (filterPremium.value === 'gold') {
    result = result.filter(user => user.premium_status === 'gold')
  } else if (filterPremium.value === 'silver') {
    result = result.filter(user => user.premium_status === 'silver')
  } else if (filterPremium.value === 'bronze') {
    result = result.filter(user => user.premium_status === 'bronze')
  } else if (filterPremium.value === 'none') {
    result = result.filter(user => !user.premium_status)
  }

  // Сортировка
  result.sort((a, b) => {
    if (sortBy.value === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy.value === 'rating') {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0)
    } else {
      return (a[sortBy.value] || '').localeCompare(b[sortBy.value] || '')
    }
  })

  return result
})

// Статистика
const activeUsers = computed(() => users.value.filter(u => u.is_active).length)
const blockedUsers = computed(() => users.value.filter(u => !u.is_active).length)
const goldUsers = computed(() => users.value.filter(u => u.premium_status === 'gold').length)
const silverUsers = computed(() => users.value.filter(u => u.premium_status === 'silver').length)
const bronzeUsers = computed(() => users.value.filter(u => u.premium_status === 'bronze').length)

const loadUsers = async (page = 1) => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const search = searchQuery.value || ''
    const url = `/api/v1/admin/users?page=${page}&limit=${pageSize.value}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    
    const response = await fetch(url, {
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
      users.value = data.users || []
      pagination.value = data.pagination || null
      currentPage.value = page
    } else {
      throw new Error(data.error || data.message || 'Ошибка загрузки пользователей')
    }
  } catch (error) {
    logger.error('Load users error:', error)
    alert('Ошибка загрузки пользователей: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const changePage = (page) => {
  if (page >= 1 && (!pagination.value || page <= pagination.value.pages)) {
    loadUsers(page)
  }
}

const filterUsers = () => {
  if (searchQuery.value) {
    loadUsers(1)
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterPremium.value = ''
  sortBy.value = 'created_at'
  loadUsers(1)
}

const selectedUser = ref(null)
const showUserModal = ref(false)
const showEditModal = ref(false)
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const emailForm = ref({
  recipients: 'all',
  singleUser: null,
  subject: '',
  message: ''
})
const editForm = ref({
  full_name: '',
  email: '',
  phone: '',
  is_active: true,
  is_verified: false,
  premium_status: '',
  rating: 0,
  total_helps_given: 0,
  car_brand: '',
  car_model: '',
  car_number: ''
})

const viewUserDetails = (user) => {
  selectedUser.value = user
  showUserModal.value = true
}

const editUser = (user) => {
  selectedUser.value = user
  editForm.value = {
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    is_active: user.is_active !== undefined ? user.is_active : true,
    is_verified: user.is_verified || false,
    premium_status: user.premium_status || '',
    rating: user.rating || 0,
    total_helps_given: user.total_helps_given || 0,
    car_brand: user.car_brand || '',
    car_model: user.car_model || '',
    car_number: user.car_number || ''
  }
  showEditModal.value = true
}

const saveUser = async () => {
  if (!selectedUser.value) return
  
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    // Обновляем основные данные
    const response = await fetch(`/api/v1/admin/users/${selectedUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: editForm.value.full_name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        is_active: editForm.value.is_active,
        is_verified: editForm.value.is_verified,
        rating: editForm.value.rating,
        total_helps_given: editForm.value.total_helps_given,
        car_brand: editForm.value.car_brand,
        car_model: editForm.value.car_model,
        car_number: editForm.value.car_number
      })
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
    
    // Обновляем премиум статус отдельно
    if (editForm.value.premium_status !== (selectedUser.value.premium_status || '')) {
      await setPremiumStatus(selectedUser.value, editForm.value.premium_status)
    }
    
    alert('✅ Пользователь успешно обновлён')
    showEditModal.value = false
    await loadUsers(currentPage.value)
  } catch (error) {
    logger.error('Update user error:', error)
    alert('Ошибка обновления пользователя: ' + (error.message || 'Неизвестная ошибка'))
  }
}

// Установка премиум статуса
const setPremiumStatus = async (user, status) => {
  try {
    const token = getToken()
    if (!token) return

    const premiumStatus = status === '' ? null : status
    const response = await fetch(`/api/v1/admin/users/${user.id}/premium`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        premium_status: premiumStatus,
        expires_at: null
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      user.premium_status = premiumStatus
      // Не показываем alert если это часть saveUser
      if (!showEditModal.value) {
        alert(`✅ Премиум статус изменён на: ${getPremiumLabel(premiumStatus)}`)
      }
    }
  } catch (error) {
    logger.error('Set premium status error:', error)
    alert('Ошибка изменения премиум статуса: ' + (error.message || 'Неизвестная ошибка'))
  }
}

// Переключение верификации
const toggleVerification = async (user) => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован.')
      return
    }

    const newStatus = !user.is_verified
    const response = await fetch(`/api/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_verified: newStatus })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success) {
      user.is_verified = newStatus
      alert(`✅ Верификация ${newStatus ? 'подтверждена' : 'снята'}`)
    }
  } catch (error) {
    logger.error('Toggle verification error:', error)
    alert('Ошибка изменения верификации: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const confirmDeleteUser = (user) => {
  if (!confirm(`⚠️ ВНИМАНИЕ! Вы уверены, что хотите удалить пользователя "${user.full_name || user.email}"?\n\nЭто действие необратимо!`)) return
  
  deleteUser(user)
}

const deleteUser = async (user) => {
  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch(`/api/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
    
    const data = await response.json()
    if (data.success) {
      alert('✅ Пользователь успешно удалён')
      await loadUsers(currentPage.value)
    } else {
      throw new Error(data.error || data.message || 'Ошибка удаления')
    }
  } catch (error) {
    logger.error('Delete user error:', error)
    alert('Ошибка удаления пользователя: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const toggleUserStatus = async (user) => {
  const action = user.is_active ? 'заблокировать' : 'активировать'
  if (!confirm(`Вы уверены, что хотите ${action} пользователя ${user.full_name || user.email}?`)) return

  try {
    const token = getToken()
    if (!token) {
      alert('Не авторизован. Пожалуйста, войдите снова.')
      router.push('/admin/login')
      return
    }

    const response = await fetch(`/api/v1/admin/users/${user.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
    
    const data = await response.json()
    if (data.success) {
      user.is_active = data.user.is_active
      alert(`✅ Пользователь успешно ${user.is_active ? 'активирован' : 'заблокирован'}`)
    } else {
      throw new Error(data.error || data.message || 'Ошибка изменения статуса')
    }
  } catch (error) {
    logger.error('Toggle user status error:', error)
    alert('Ошибка изменения статуса: ' + (error.message || 'Неизвестная ошибка'))
  }
}

onMounted(() => {
  loadUsers()
})

// ========== Email функции ==========
const openEmailModal = () => {
  emailForm.value = {
    recipients: 'all',
    singleUser: null,
    subject: '',
    message: ''
  }
  showEmailModal.value = true
}

const openEmailModalForUser = (user) => {
  emailForm.value = {
    recipients: 'single',
    singleUser: user,
    subject: '',
    message: ''
  }
  showEmailModal.value = true
}

const applyTemplate = (template) => {
  const templates = {
    welcome: {
      subject: '👋 Добро пожаловать в Help-Car.Online!',
      message: 'Приветствуем вас в сообществе взаимопомощи на дорогах!\n\nМы рады, что вы с нами. Теперь вы можете получить помощь на дороге или помочь другим водителям.\n\nС уважением,\nКоманда Help-Car.Online'
    },
    update: {
      subject: '📢 Обновление сервиса Help-Car.Online',
      message: 'Мы рады сообщить о важных обновлениях в нашем сервисе!\n\nЧто нового:\n- Улучшенный поиск помощников\n- Новые функции чата\n- Ускоренная работа приложения\n\nСпасибо, что вы с нами!'
    },
    promo: {
      subject: '🎁 Специальное предложение для вас!',
      message: 'Только сегодня специальное предложение!\n\nПолучите премиум статус со скидкой 50%!\n\nПреимущества премиум:\n- Приоритет в очереди\n- Расширенные возможности\n- Эксклюзивная поддержка\n\nУспейте воспользоваться!'
    },
    reminder: {
      subject: '⏰ Напоминание от Help-Car.Online',
      message: 'Мы заметили, что вы давно не заходили в приложение.\n\nМы скучаем! Заходите и помогите другим водителям или получите помощь сами.\n\nВаша команда Help-Car.Online'
    }
  }
  
  if (templates[template]) {
    emailForm.value.subject = templates[template].subject
    emailForm.value.message = templates[template].message
  }
}

const sendEmail = async () => {
  if (!emailForm.value.subject || !emailForm.value.message) {
    alert('Укажите тему и текст сообщения')
    return
  }
  
  try {
    isSendingEmail.value = true
    const token = getToken()
    if (!token) {
      alert('Не авторизован')
      return
    }
    
    let recipients = 'all'
    let userIds = []
    
    if (emailForm.value.recipients === 'single' && emailForm.value.singleUser) {
      recipients = 'single'
      userIds = [emailForm.value.singleUser.id]
    } else if (emailForm.value.recipients === 'filtered') {
      recipients = 'selected'
      userIds = filteredUsers.value.filter(u => u.email).map(u => u.id)
    }
    
    const response = await fetch('/api/v1/admin/users/email/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients,
        userIds,
        subject: emailForm.value.subject,
        message: emailForm.value.message
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      alert(`✅ ${data.message}`)
      showEmailModal.value = false
    } else {
      throw new Error(data.error || 'Ошибка отправки')
    }
  } catch (error) {
    logger.error('Send email error:', error)
    alert('Ошибка отправки: ' + (error.message || 'Неизвестная ошибка'))
  } finally {
    isSendingEmail.value = false
  }
}
</script>


