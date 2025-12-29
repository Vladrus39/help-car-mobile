<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <NavigationHeader />
    
    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Приветствие -->
      <div class="mb-8">
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <!-- Декоративные элементы -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div class="relative z-10">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 class="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
                  <span class="text-4xl">🚗</span>
                  Добро пожаловать!
                </h1>
                <p class="text-blue-100 text-lg">
                  Платформа взаимопомощи водителей на дорогах России
                </p>
              </div>
              <router-link 
                to="/create-request"
                class="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-lg hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
              >
                <span class="text-xl">🆘</span> Нужна помощь
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div @click="showAllHelpersModal = true" class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🟢</span>
            </div>
            <span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold">Онлайн</span>
          </div>
          <div class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.helpersOnline }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Готовы помочь
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span class="text-2xl">👥</span>
            </div>
          </div>
          <div class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.totalUsers }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Пользователей
          </div>
        </div>
        
        <router-link to="/my-requests" class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🆘</span>
            </div>
            <span
              v-if="stats.activeRequests > 0"
              class="relative flex h-3 w-3"
            >
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
            </span>
          </div>
          <div class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.activeRequests }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Активных заявок
          </div>
        </router-link>
        
        <router-link to="/my-responses" class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-2">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span class="text-2xl">✅</span>
            </div>
          </div>
          <div class="text-3xl font-black text-gray-900 dark:text-white">
            {{ stats.completedHelps }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Помощей оказано
          </div>
        </router-link>
      </div>

      <!-- Основной контент -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Помощники онлайн -->
        <div id="online-helpers" class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Помощники онлайн
            </h2>
            <router-link 
              to="/map"
              class="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition"
            >
              🗺 На карте
            </router-link>
            <button 
              @click="showAllHelpersModal = true"
              class="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition"
            >
              👥 Все онлайн
            </button>
          </div>

          <!-- Загрузка -->
          <div
            v-if="isLoading"
            class="space-y-4"
          >
            <div
              v-for="i in 6"
              :key="i"
              class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl animate-pulse"
            >
              <div class="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div class="flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2" />
                <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div
            v-else-if="onlineHelpers.length === 0"
            class="text-center py-12"
          >
            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-4xl">😴</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
              Пока нет помощников онлайн
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Станьте первым!
            </p>
          </div>

          <!-- Список помощников -->
          <div
            v-else
            class="space-y-4"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="helper in displayedHelpers"
                :key="helper.id"
                class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                @click="openHelperProfile(helper)"
              >
              <!-- Аватар -->
              <div class="relative">
                <div 
                  v-if="helper.avatar_url"
                  class="w-14 h-14 rounded-full overflow-hidden"
                >
                  <img
                    :src="getAvatarUrl(helper.avatar_url)"
                    :alt="helper.full_name"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div 
                  v-else
                  class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
                >
                  {{ getInitials(helper.full_name) }}
                </div>
                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              </div>

              <!-- Инфо -->
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 dark:text-white truncate">
                  {{ helper.full_name }}
                </h3>
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>⭐ {{ parseFloat(helper.rating || 5).toFixed(1) }}</span>
                  <span v-if="helper.helps_count">• {{ helper.helps_count }} помощей</span>
                </div>
                <div
                  v-if="helper.skills?.length"
                  class="flex flex-wrap gap-1 mt-1"
                >
                  <span 
                    v-for="skill in helper.skills.slice(0, 3)"
                    :key="skill"
                    class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium"
                  >
                    {{ getSkillLabel(skill) }}
                  </span>
                </div>
              </div>

              <!-- Действия -->
              <div class="flex flex-col gap-1">
                <button 
                  class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                  @click.stop="askForHelp(helper)"
                >
                  🆘 Помощь
                </button>
                <button 
                  class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                  @click.stop="messageHelper(helper)"
                >
                  ✉️ Написать
                </button>
              </div>
            </div>
          </div>
            
            <!-- Показать больше -->
            <div v-if="onlineHelpers.length > 15" class="text-center mt-4">
              <button 
                @click="showAllHelpersModal = true"
                class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Показать всех ({{ onlineHelpers.length }} помощников)
              </button>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="space-y-6">
          <!-- Быстрые действия -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-black text-gray-900 dark:text-white mb-4">
              ⚡ Быстрые действия
            </h2>
            <div class="space-y-3">
              <router-link 
                to="/create-request"
                class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <span class="text-2xl">🆘</span>
                <div>
                  <div class="font-bold text-red-700 dark:text-red-400">
                    Нужна помощь!
                  </div>
                  <div class="text-sm text-red-600 dark:text-red-500">
                    Создать заявку
                  </div>
                </div>
              </router-link>

              <router-link 
                to="/map"
                class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
              >
                <span class="text-2xl">🗺️</span>
                <div>
                  <div class="font-bold text-blue-700 dark:text-blue-400">
                    Карта
                  </div>
                  <div class="text-sm text-blue-600 dark:text-blue-500">
                    Найти на карте
                  </div>
                </div>
              </router-link>

              <router-link 
                to="/my-requests"
                class="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
              >
                <span class="text-2xl">📋</span>
                <div>
                  <div class="font-bold text-purple-700 dark:text-purple-400">
                    Мои заявки
                  </div>
                  <div class="text-sm text-purple-600 dark:text-purple-500">
                    Управление
                  </div>
                </div>
              </router-link>

              <router-link 
                to="/my-responses"
                class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition"
              >
                <span class="text-2xl">✋</span>
                <div>
                  <div class="font-bold text-green-700 dark:text-green-400">
                    Мои отклики
                  </div>
                  <div class="text-sm text-green-600 dark:text-green-500">
                    Кому помогаю
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Последние заявки -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-black text-gray-900 dark:text-white mb-4">
              🆕 Последние заявки
            </h2>
            <div
              v-if="recentRequests.length === 0"
              class="text-center py-6"
            >
              <p class="text-gray-400">
                Нет активных заявок
              </p>
            </div>
            <div
              v-else
              class="space-y-3"
            >
              <router-link 
                v-for="req in recentRequests"
                :key="req.id"
                :to="`/request/${req.id}`"
                class="block p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ getProblemLabel(req.problem_type) }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatTime(req.created_at) }}
                  </span>
                </div>
                <p
                  v-if="req.description"
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1"
                >
                  {{ req.description }}
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Новости и объявления -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Новости -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h2 class="text-xl font-black text-white flex items-center gap-2">
              <span>📢</span> Новости и объявления
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <!-- Новость 1 -->
            <div class="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-md transition">
              <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                🎉
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">НОВОЕ</span>
                  <span class="text-xs text-gray-400">22 декабря 2025</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  Запущена новая версия платформы!
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Добавлены новые функции: друзья, группы, улучшенная карта
                </p>
              </div>
            </div>
            
            <!-- Новость 2 -->
            <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition">
              <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                🎄
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">АКЦИЯ</span>
                  <span class="text-xs text-gray-400">20 декабря 2025</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  Новогодняя акция для помощников
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Станьте помощником до 31 декабря и получите бонус!
                </p>
              </div>
            </div>
            
            <!-- Новость 3 -->
            <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition">
              <div class="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                📱
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded">ОБНОВЛЕНИЕ</span>
                  <span class="text-xs text-gray-400">15 декабря 2025</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  PWA приложение доступно!
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Установите приложение на телефон для быстрого доступа
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Рекламные баннеры / Полезная информация -->
        <div class="space-y-6">
          <!-- Баннер 1 -->
          <div class="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div class="absolute -right-6 -bottom-6 text-8xl opacity-20">
              🚗
            </div>
            <div class="relative z-10">
              <div class="text-sm font-bold opacity-80 mb-1">
                РЕКЛАМА
              </div>
              <h3 class="text-xl font-black mb-2">
                Autoservice PRO
              </h3>
              <p class="text-sm opacity-90 mb-3">
                Профессиональный ремонт авто со скидкой 10%
              </p>
              <button class="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-50 transition">
                Подробнее
              </button>
            </div>
          </div>
          
          <!-- Советы -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 class="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="text-xl">💡</span> Полезные советы
            </h3>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span class="text-green-500">✓</span>
                Всегда возите с собой запаску и домкрат
              </li>
              <li class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span class="text-green-500">✓</span>
                Проверяйте уровень топлива перед дальней поездкой
              </li>
              <li class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span class="text-green-500">✓</span>
                Зимой держите провода для прикуривания
              </li>
            </ul>
          </div>
          
          <!-- Баннер 2 -->
          <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div class="absolute -right-4 -bottom-4 text-7xl opacity-20">
              ⛽
            </div>
            <div class="relative z-10">
              <div class="text-sm font-bold opacity-80 mb-1">
                ПАРТНЁР
              </div>
              <h3 class="text-xl font-black mb-2">
                FuelCard Plus
              </h3>
              <p class="text-sm opacity-90 mb-3">
                Карта с кэшбэком 5% на всех АЗС
              </p>
              <button class="px-4 py-2 bg-white text-purple-600 rounded-lg font-bold text-sm hover:bg-purple-50 transition">
                Оформить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Полезные ссылки -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-black text-gray-900 dark:text-white mb-4">
          🔗 Быстрые ссылки
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <router-link 
            to="/city-chats"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-center"
          >
            <span class="text-3xl">💬</span>
            <span class="font-bold text-gray-900 dark:text-white text-sm">Чаты городов</span>
          </router-link>
          <router-link 
            to="/global-chat"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-center"
          >
            <span class="text-3xl">🌐</span>
            <span class="font-bold text-gray-900 dark:text-white text-sm">Общий чат</span>
          </router-link>
          <router-link 
            to="/profile"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition text-center"
          >
            <span class="text-3xl">👤</span>
            <span class="font-bold text-gray-900 dark:text-white text-sm">Мой профиль</span>
          </router-link>
          <router-link 
            to="/favorites"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition text-center"
          >
            <span class="text-3xl">⭐</span>
            <span class="font-bold text-gray-900 dark:text-white text-sm">Избранное</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно профиля -->
    <div 
      v-if="selectedHelper"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="selectedHelper = null"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-black text-gray-900 dark:text-white">
            Профиль помощника
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="selectedHelper = null"
          >
            ✕
          </button>
        </div>

        <div class="text-center mb-6">
          <div 
            v-if="selectedHelper.avatar_url"
            class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3"
          >
            <img
              :src="getAvatarUrl(selectedHelper.avatar_url)"
              class="w-full h-full object-cover"
            >
          </div>
          <div 
            v-else
            class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3"
          >
            {{ getInitials(selectedHelper.full_name) }}
          </div>
          <h4 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ selectedHelper.full_name }}
          </h4>
          <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
            <span>⭐ {{ parseFloat(selectedHelper.rating || 5).toFixed(1) }}</span>
            <span v-if="selectedHelper.helps_count">• {{ selectedHelper.helps_count }} помощей</span>
          </div>
        </div>

        <div
          v-if="selectedHelper.car_brand"
          class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Автомобиль
          </div>
          <div class="font-bold text-gray-900 dark:text-white">
            {{ selectedHelper.car_brand }} {{ selectedHelper.car_model }}
          </div>
        </div>

        <div
          v-if="selectedHelper.skills?.length"
          class="mb-4"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Навыки
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="skill in selectedHelper.skills"
              :key="skill"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
            >
              {{ getSkillLabel(skill) }}
            </span>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button 
            class="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
            @click="askForHelp(selectedHelper); selectedHelper = null"
          >
            🆘 Попросить помощь
          </button>
          <button 
            class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            @click="messageHelper(selectedHelper); selectedHelper = null"
          >
            ✉️ Написать
          </button>
        </div>

        <router-link 
          :to="`/user/${selectedHelper.id}`"
          class="block w-full py-3 mt-3 text-center text-blue-600 dark:text-blue-400 font-bold hover:underline"
        >
          Открыть полный профиль →
        </router-link>
      </div>
    </div>

    <!-- Модальное окно всех помощников -->
    <div 
      v-if="showAllHelpersModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAllHelpersModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white">
              🟢 Помощники онлайн
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Всего: {{ onlineHelpers.length }} помощников
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl"
            @click="showAllHelpersModal = false"
          >
            ✕
          </button>
        </div>

        <!-- Список всех помощников -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="helper in onlineHelpers"
            :key="helper.id"
            class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
            @click="openHelperProfile(helper)"
          >
            <!-- Аватар -->
            <div class="relative">
              <div 
                v-if="helper.avatar_url"
                class="w-14 h-14 rounded-full overflow-hidden"
              >
                <img
                  :src="getAvatarUrl(helper.avatar_url)"
                  :alt="helper.full_name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div 
                v-else
                class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
              >
                {{ getInitials(helper.full_name) }}
              </div>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>

            <!-- Инфо -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 dark:text-white truncate">
                {{ helper.full_name }}
              </h3>
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>⭐ {{ parseFloat(helper.rating || 5).toFixed(1) }}</span>
                <span v-if="helper.helps_count">• {{ helper.helps_count }} помощей</span>
              </div>
            </div>

            <!-- Действия -->
            <div class="flex flex-col gap-1">
              <button 
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                @click.stop="askForHelp(helper); showAllHelpersModal = false"
              >
                🆘 Помощь
              </button>
              <button 
                class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                @click.stop="messageHelper(helper); showAllHelpersModal = false"
              >
                ✉️ Написать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { apiService } from '@/services/api'

const router = useRouter()

const isLoading = ref(true)
const onlineHelpers = ref([])
const recentRequests = ref([])
const selectedHelper = ref(null)
const showAllHelpersModal = ref(false)

const stats = ref({
  helpersOnline: 0,
  totalUsers: 0,
  activeRequests: 0,
  completedHelps: 0
})

const displayedHelpers = computed(() => {
  return onlineHelpers.value.slice(0, 15)
})

const skillLabels = {
  tire_change: '🔧 Замена колеса',
  battery_jump: '🔋 Прикуривание',
  fuel_delivery: '⛽ Доставка топлива',
  towing: '🚗 Буксировка',
  minor_repair: '🛠 Мелкий ремонт',
  locksmith: '🔑 Вскрытие авто'
}

const problemLabels = {
  battery: '🔋 Сел аккумулятор',
  fuel: '⛽ Нет топлива',
  tire: '🛞 Прокол колеса',
  towing: '🚗 Буксировка',
  sober_driver: '🚕 Трезвый водитель',
  road_conflict: '🚨 Конфликт на дороге',
  other: '🔧 Другое'
}

const getSkillLabel = (skill) => skillLabels[skill] || skill
const getProblemLabel = (type) => problemLabels[type] || type

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  
  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин`
  if (diffHours < 24) return `${diffHours} ч`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const openHelperProfile = (helper) => {
  selectedHelper.value = helper
}

const askForHelp = (helper) => {
  router.push({ 
    path: '/create-request', 
    query: { helper_id: helper.id }
  })
}

const messageHelper = async (helper) => {
  try {
    // Создаём или получаем существующий чат
    const response = await apiService.client.post(`/users/${helper.id}/chat`)
    if (response.chatId) {
      router.push(`/direct-chat/${response.chatId}`)
    } else {
      console.error('No chatId in response:', response)
      router.push(`/user/${helper.id}`)
    }
  } catch (e) {
    console.error('Error creating chat:', e)
    router.push(`/user/${helper.id}`)
  }
}

const loadData = async () => {
  try {
    isLoading.value = true

    // Загрузка помощников онлайн
    try {
      console.log('📡 Loading online helpers...')
      const helpersRes = await apiService.client.get('/users/online-helpers', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      })
      console.log('📥 Online helpers response:', helpersRes)
      onlineHelpers.value = helpersRes?.data || helpersRes || []
      console.log('👥 Loaded helpers:', onlineHelpers.value.length)
      stats.value.helpersOnline = onlineHelpers.value.length
    } catch (e) {
      console.error('❌ Could not load online helpers:', e)
    }

    // Загрузка статистики
    try {
      const statsRes = await apiService.client.get('/stats/public')
      if (statsRes) {
        stats.value.totalUsers = statsRes.totalUsers || 0
        stats.value.activeRequests = statsRes.activeRequests || 0
        stats.value.completedHelps = statsRes.completedHelps || 0
      }
    } catch (e) {
      console.log('Could not load stats:', e.message)
    }

    // Загрузка последних заявок
    try {
      const reqRes = await apiService.client.get('/help-requests', { 
        params: { status: 'active', limit: 5 } 
      })
      recentRequests.value = reqRes?.data || reqRes || []
      stats.value.activeRequests = recentRequests.value.length
    } catch (e) {
      console.log('Could not load requests:', e.message)
    }

  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

function getAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + url
  }
  return window.location.origin + url
}
</script>
