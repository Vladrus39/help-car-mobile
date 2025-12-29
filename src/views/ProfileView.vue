<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
    <NavigationHeader />
    
    <div
      v-if="authStore.user"
      class="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4"
    >
      <!-- Breadcrumb -->
      <div class="mb-4 sm:mb-6">
        <div class="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
          <router-link
            to="/"
            class="text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
          >
            🏠 Главная
          </router-link>
          <span class="text-gray-400">/</span>
          <span class="text-gray-600 font-semibold whitespace-nowrap">Личный кабинет</span>
        </div>
      </div>

      <!-- User Profile Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 transition-colors duration-200">
        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
          <div class="relative">
            <div 
              v-if="!avatarPreview && !authStore.user?.avatar_url"
              class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg flex-shrink-0"
            >
              {{ getInitials(authStore.user?.full_name) }}
            </div>
            <img 
              v-else
              :src="avatarPreview || getAvatarUrl(authStore.user?.avatar_url)" 
              alt="Avatar" 
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg flex-shrink-0"
            >
            <!-- Индикатор "Готов помогать" на аватаре -->
            <div 
              v-if="isAvailableToHelp"
              class="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
              title="Готов помогать"
            />
            <label 
              class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-50 transition"
              title="Изменить аватар"
            >
              <svg
                class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input 
                type="file" 
                class="hidden" 
                accept="image/*" 
                @change="handleAvatarUpload"
              >
            </label>
          </div>
          <div class="text-center sm:text-left flex-1">
            <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 class="text-xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {{ authStore.user?.full_name }}
              </h1>
              <!-- Бейджи верификации -->
              <span
                v-if="authStore.user?.is_verified"
                class="text-green-500 text-lg"
                title="Верифицирован"
              >✓</span>
              <span
                v-if="authStore.user?.is_top_helper"
                class="text-yellow-500 text-lg"
                title="Топ-помощник"
              >⭐</span>
            </div>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
              {{ authStore.user?.email }}
              <span
                v-if="authStore.user?.email_verified"
                class="text-green-500 ml-1"
                title="Email подтвержден"
              >✓</span>
            </p>
            <!-- Кнопка подтверждения email -->
            <div v-if="authStore.user && !authStore.user.email_verified" class="mb-2">
              <button
                :disabled="isResendingVerification"
                class="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
                @click="resendVerificationEmail"
              >
                <span v-if="isResendingVerification">Отправка...</span>
                <span v-else-if="verificationSent">✅ Ссылка отправлена!</span>
                <span v-else>📧 Подтвердить email</span>
              </button>
            </div>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              📱 {{ authStore.user?.phone }}
              <span
                v-if="authStore.user?.phone_verified"
                class="text-green-500 ml-1"
                title="Телефон подтвержден"
              >✓</span>
            </p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div class="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
            <div class="text-2xl sm:text-3xl font-black text-yellow-600">
              {{ parseFloat(authStore.user?.rating || 0).toFixed(1) }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
              ⭐ Рейтинг
            </div>
          </div>
          <div class="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
            <div class="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">
              {{ stats.completedRequests }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
              ✅ Выполнено
            </div>
          </div>
          <div class="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
            <div class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {{ stats.totalRequests }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
              📋 Всего
            </div>
          </div>
        </div>

        <!-- Готов помогать Toggle -->
        <div
          class="p-4 rounded-xl mb-4"
          :class="isAvailableToHelp ? 'bg-gradient-to-r from-green-100 to-green-50' : 'bg-gray-100'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-2xl">
                {{ isAvailableToHelp ? '🟢' : '⚪' }}
              </div>
              <div>
                <div class="font-bold text-gray-900">
                  {{ isAvailableToHelp ? 'Готов помогать!' : 'Не в сети' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ isAvailableToHelp ? 'Вас видят нуждающиеся в помощи' : 'Включите, чтобы получать заявки' }}
                </div>
              </div>
            </div>
            <button
              :disabled="isSavingAvailability"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              :class="isAvailableToHelp ? 'bg-green-500' : 'bg-gray-300'"
              @click="toggleAvailability"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                :class="isAvailableToHelp ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          <!-- Радиус помощи -->
          <div
            v-if="isAvailableToHelp"
            class="mt-3 pt-3 border-t border-green-200"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 flex-shrink-0">Радиус помощи:</span>
                <span class="text-sm font-bold text-green-600">{{ helpRadius }} км</span>
              </div>
              <!-- Контейнер ползунка с правильными отступами -->
              <div class="relative px-2">
                <input 
                  v-model="helpRadius" 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 slider-thumb"
                  @change="saveHelpRadius"
                >
              </div>
              <!-- Шкала для наглядности -->
              <div class="flex justify-between text-[10px] text-gray-400 px-2">
                <span>5</span>
                <span>100</span>
                <span>250</span>
                <span>500 км</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <router-link
          to="/my-requests"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            🆘
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Мои заявки
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ stats.myRequests }}
          </div>
        </router-link>
        
        <router-link
          to="/my-helps"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            🤝
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Мои помощи
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ stats.myHelps }}
          </div>
        </router-link>
        
        <router-link
          to="/my-responses"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105 relative"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            📤
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Мои отклики
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Статусы
          </div>
        </router-link>
        
        <router-link
          to="/my-chats"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            💬
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Мои чаты
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ stats.chats }}
          </div>
        </router-link>
        
        <router-link
          to="/city-chats"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            🏙
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Чаты городов
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Общение
          </div>
        </router-link>
        
        <router-link
          to="/messages"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl transition transform hover:scale-105"
        >
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">
            ✉️
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Личные сообщения
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Диалоги
          </div>
        </router-link>
      </div>

      <!-- 🚗 Карточка автомобиля -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            🚗 Мой автомобиль
          </h2>
          <button
            class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            @click="showCarModal = true"
          >
            {{ hasCarInfo ? 'Редактировать' : 'Добавить' }}
          </button>
        </div>
        
        <div
          v-if="hasCarInfo"
          class="flex items-center gap-4"
        >
          <div
            v-if="authStore.user?.car_photo_url"
            class="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
          >
            <img
              :src="getAvatarUrl(authStore.user.car_photo_url)"
              alt="Авто"
              class="w-full h-full object-cover"
            >
          </div>
          <div
            v-else
            class="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <span class="text-3xl">🚗</span>
          </div>
          <div class="flex-1">
            <div class="font-bold text-gray-900 dark:text-white">
              {{ authStore.user?.car_brand }} {{ authStore.user?.car_model }}
              <span
                v-if="authStore.user?.car_year"
                class="text-gray-500 font-normal"
              >({{ authStore.user.car_year }})</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <span v-if="authStore.user?.car_color">🎨 {{ authStore.user.car_color }}</span>
              <span
                v-if="authStore.user?.car_number"
                class="ml-2"
              >📋 {{ authStore.user.car_number }}</span>
            </div>
            <div
              v-if="authStore.user?.car_type"
              class="text-xs text-gray-500 mt-1"
            >
              {{ getCarTypeLabel(authStore.user.car_type) }}
            </div>
          </div>
        </div>
        
        <div
          v-else
          class="text-center py-6"
        >
          <div class="text-4xl mb-2">
            🚗
          </div>
          <p class="text-gray-500 text-sm">
            Добавьте информацию о вашем авто
          </p>
          <p class="text-gray-400 text-xs">
            Это поможет другим узнать вас
          </p>
        </div>
      </div>

      <!-- 🛠️ Навыки и оборудование -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            🛠️ Навыки и оборудование
          </h2>
          <button
            class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            @click="showSkillsModal = true"
          >
            Редактировать
          </button>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.has_jumper_cables ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">⚡</span>
            <span class="text-xs font-medium">Провода</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.has_tow_rope ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">🧵</span>
            <span class="text-xs font-medium">Трос</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.has_fuel_canister ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">⛽</span>
            <span class="text-xs font-medium">Канистра</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.has_compressor ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">💨</span>
            <span class="text-xs font-medium">Компрессор</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.can_change_tire ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">🛞</span>
            <span class="text-xs font-medium">Замена колеса</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.has_tools ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">🧰</span>
            <span class="text-xs font-medium">Инструменты</span>
          </div>
          <div
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="authStore.user?.is_mechanic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'"
          >
            <span class="text-lg">👨‍🔧</span>
            <span class="text-xs font-medium">Автослесарь</span>
          </div>
        </div>
      </div>

      <!-- 💰 Финансовая статистика -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          💰 Финансы
        </h2>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
            <div class="text-xl font-black text-green-600">
              {{ formatMoney(authStore.user?.total_earned || 0) }}
            </div>
            <div class="text-xs text-gray-600">
              🟢 Заработано
            </div>
          </div>
          <div class="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl text-center">
            <div class="text-xl font-black text-red-600">
              {{ formatMoney(authStore.user?.total_spent || 0) }}
            </div>
            <div class="text-xs text-gray-600">
              🔴 Потрачено
            </div>
          </div>
          <div class="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
            <div class="text-xl font-black text-purple-600">
              {{ authStore.user?.total_helps_given || 0 }}
            </div>
            <div class="text-xs text-gray-600">
              🤝 Помощей
            </div>
          </div>
          <div class="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
            <div class="text-xl font-black text-blue-600">
              {{ formatResponseTime(authStore.user?.average_response_time) }}
            </div>
            <div class="text-xs text-gray-600">
              ⏱️ Ср. отклик
            </div>
          </div>
        </div>
      </div>

      <!-- 🔔 Настройки уведомлений -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🔔 Уведомления
        </h2>
        
        <div class="space-y-2">
          <!-- Новые заявки рядом -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-xl">🆘</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Новые заявки рядом
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Уведомления о заявках в вашем районе
                </div>
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                notifySettings.newRequests ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleNotifySetting('newRequests')"
            >
              <span 
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="notifySettings.newRequests ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Сообщения -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-xl">💬</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Сообщения
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Уведомления о новых сообщениях
                </div>
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                notifySettings.messages ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleNotifySetting('messages')"
            >
              <span 
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="notifySettings.messages ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Email-дайджест -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-xl">📧</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Email-дайджест
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Еженедельная сводка на email
                </div>
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                notifySettings.emailDigest ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleNotifySetting('emailDigest')"
            >
              <span 
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="notifySettings.emailDigest ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Звук -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-xl">🔊</span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Звук
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Звуковые уведомления
                </div>
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                notifySettings.sound ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleNotifySetting('sound')"
            >
              <span 
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="notifySettings.sound ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 👥 Друзья -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <router-link 
            to="/friends" 
            class="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 hover:text-blue-600 transition cursor-pointer"
          >
            👥 Друзья
            <span
              v-if="friendCount.friends > 0"
              class="text-sm font-normal text-gray-500"
            >({{ friendCount.friends }})</span>
            <span class="text-blue-500 text-sm">→</span>
          </router-link>
          <div class="flex items-center gap-2">
            <button
              class="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="friendCount.pending_requests > 0 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'"
              @click="showFriendRequestsModal = true"
            >
              📨 {{ friendCount.pending_requests || 0 }} заявки
            </button>
            <button
              class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              @click="showAddFriendModal = true"
            >
              + Добавить
            </button>
          </div>
        </div>
        
        <!-- Загрузка -->
        <div
          v-if="isLoadingFriends"
          class="text-center py-6"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p class="mt-2 text-sm text-gray-500">
            Загрузка...
          </p>
        </div>
        
        <!-- Пустой список -->
        <div
          v-else-if="friends.length === 0"
          class="text-center py-6"
        >
          <div class="text-4xl mb-3">
            👥
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Пока нет друзей
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Добавьте друзей, чтобы быстрее находить помощь
          </p>
        </div>
        
        <!-- Список друзей -->
        <div
          v-else
          class="space-y-2"
        >
          <div
            v-for="friendItem in friends.slice(0, showAllFriends ? friends.length : 5)"
            :key="friendItem.friendship_id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
            @click="goToProfile(friendItem.friend?.id)"
          >
            <div class="flex items-center gap-3">
              <div class="relative">
                <img 
                  v-if="friendItem.friend?.avatar_url" 
                  :src="getAvatarUrl(friendItem.friend.avatar_url)" 
                  :alt="friendItem.friend.full_name"
                  class="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-400 transition"
                >
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:ring-2 group-hover:ring-blue-400 transition"
                >
                  {{ getInitials(friendItem.friend?.full_name) }}
                </div>
                <span 
                  v-if="friendItem.friend?.is_available_to_help"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
                  title="Готов помочь"
                />
                <span 
                  v-else-if="friendItem.friend?.is_online"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"
                  title="В сети"
                />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition">
                  {{ friendItem.friend?.full_name || 'Пользователь' }}
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span v-if="friendItem.friend?.rating">⭐ {{ parseFloat(friendItem.friend.rating || 5).toFixed(1) }}</span>
                  <span
                    v-if="friendItem.friend?.is_available_to_help"
                    class="text-green-600"
                  >🟢 Готов помочь</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                title="Написать"
                @click.stop="openDirectChat(friendItem.friend)"
              >
                💬
              </button>
              <button
                class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                title="Удалить из друзей"
                @click.stop="confirmRemoveFriend(friendItem)"
              >
                ✖️
              </button>
            </div>
          </div>
          
          <!-- Показать всех -->
          <button
            v-if="friends.length > 5 && !showAllFriends"
            class="w-full py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition"
            @click="showAllFriends = true"
          >
            Показать всех ({{ friends.length }})
          </button>
        </div>
      </div>

      <!-- Мои отзывы -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          ⭐ Мои отзывы
          <span v-if="myReviews.length > 0" class="text-sm font-normal text-gray-500">
            ({{ myReviews.length }})
          </span>
        </h2>
        
        <!-- Загрузка -->
        <div v-if="isLoadingReviews" class="text-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto" />
          <p class="mt-3 text-sm text-gray-500">Загрузка отзывов...</p>
        </div>
        
        <!-- Нет отзывов -->
        <div v-else-if="myReviews.length === 0" class="text-center py-8">
          <div class="text-4xl sm:text-5xl mb-3">💭</div>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Пока нет отзывов
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Отзывы появятся после завершения заказов
          </p>
        </div>
        
        <!-- Список отзывов -->
        <div v-else class="space-y-3">
          <div
            v-for="review in myReviews.slice(0, showAllReviews ? myReviews.length : 3)"
            :key="review.id"
            class="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl"
          >
            <div class="flex items-start gap-3">
              <!-- Аватар -->
              <div class="flex-shrink-0">
                <img
                  v-if="review.rater?.avatar_url"
                  :src="getAvatarUrl(review.rater.avatar_url)"
                  :alt="review.rater?.full_name"
                  class="w-10 h-10 rounded-full object-cover"
                >
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold"
                >
                  {{ review.rater?.full_name?.charAt(0) || '👤' }}
                </div>
              </div>
              
              <!-- Содержимое -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {{ review.rater?.full_name || 'Пользователь' }}
                  </p>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="text-yellow-500">⭐</span>
                    <span class="font-bold text-gray-900 dark:text-white">{{ review.rating }}</span>
                  </div>
                </div>
                <p v-if="review.comment" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {{ review.comment }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {{ formatReviewDate(review.created_at) }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Показать все -->
          <button
            v-if="myReviews.length > 3 && !showAllReviews"
            class="w-full py-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg text-sm font-medium transition"
            @click="showAllReviews = true"
          >
            Показать все ({{ myReviews.length }})
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          📊 История активности
        </h2>
        
        <div
          v-if="isLoadingActivity"
          class="text-center py-8"
        >
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p class="mt-3 text-sm text-gray-500">
            Загрузка...
          </p>
        </div>
        
        <div
          v-else-if="recentActivity.length === 0"
          class="text-center py-8"
        >
          <div class="text-4xl sm:text-5xl mb-3">
            📭
          </div>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Пока нет активности
          </p>
        </div>
        
        <div
          v-else
          class="space-y-3"
        >
          <router-link
            v-for="activity in recentActivity"
            :key="activity.id"
            :to="`/responses/${activity.id}`"
            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
          >
            <div class="text-2xl flex-shrink-0">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ getActivityTitle(activity) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ activity.description }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ formatDate(activity.created_at) }}
              </p>
            </div>
            <span
              :class="getStatusBadgeClass(activity.status)"
              class="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
            >
              {{ getStatusLabel(activity.status) }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 transition-colors duration-200">
        <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          ⚙️ Настройки аккаунта
        </h2>
        
        <div class="space-y-3">
          <!-- Переключатель темы -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ isDark ? '🌙' : '☀️' }}</span>
              <div>
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  Тема оформления
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ isDark ? 'Темная тема' : 'Светлая тема' }}
                </div>
              </div>
            </div>
            <button 
              :class="[
                'relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                isDark ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleDarkMode"
            >
              <span 
                :class="[
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                  isDark ? 'translate-x-6' : 'translate-x-0.5'
                ]"
              />
            </button>
          </div>
          
          <button
            class="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-between"
            @click="editProfile"
          >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">✏️ Редактировать профиль</span>
            <svg
              class="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          <button
            class="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-between"
            @click="changePassword"
          >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">🔒 Сменить пароль</span>
            <svg
              class="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          <button
            class="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-between"
            @click="logout"
          >
            <span class="text-sm font-semibold text-red-600 dark:text-red-400">🚪 Выйти из аккаунта</span>
            <svg
              class="w-5 h-5 text-red-400 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-else
      class="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4 flex items-center justify-center min-h-[60vh]"
    >
      <div class="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full transition-colors duration-200">
        <div class="text-5xl mb-4">
          ⚠️
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ошибка загрузки профиля
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Не удалось загрузить данные вашего профиля. Пожалуйста, попробуйте войти снова.
        </p>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition w-full"
          @click="handleRetryOrLogin"
        >
          Войти заново
        </button>
      </div>
    </div>

    <!-- Модальное окно редактирования профиля -->
    <div
      v-if="showEditProfileModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showEditProfileModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white">
            ✏️ Редактировать профиль
          </h2>
          <button
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            @click="showEditProfileModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Полное имя
            </label>
            <input
              v-model="editForm.full_name"
              type="text"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Введите ваше имя"
            >
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Телефон
            </label>
            <input
              v-model="editForm.phone"
              type="tel"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="+7 (999) 123-45-67"
            >
          </div>

          <div class="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
              :disabled="isSaving"
              @click="showEditProfileModal = false"
            >
              Отмена
            </button>
            <button
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
              :disabled="isSaving"
              @click="saveProfile"
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно смены пароля -->
    <div
      v-if="showChangePasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showChangePasswordModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white">
            🔒 Сменить пароль
          </h2>
          <button
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            @click="showChangePasswordModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Текущий пароль
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Введите текущий пароль"
            >
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Новый пароль
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              autocomplete="new-password"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Минимум 6 символов"
            >
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Подтвердите новый пароль
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Повторите новый пароль"
            >
          </div>

          <div class="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
              :disabled="isSaving"
              @click="showChangePasswordModal = false"
            >
              Отмена
            </button>
            <button
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
              :disabled="isSaving"
              @click="savePassword"
            >
              {{ isSaving ? 'Сохранение...' : 'Изменить пароль' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования авто -->
    <div
      v-if="showCarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showCarModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white">
            🚗 Мой автомобиль
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showCarModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Загрузка фото авто -->
          <div class="text-center">
            <div 
              v-if="carPhotoPreview || authStore.user?.car_photo_url"
              class="relative inline-block mb-3"
            >
              <img 
                :src="carPhotoPreview || getAvatarUrl(authStore.user?.car_photo_url)" 
                alt="Car photo" 
                class="w-full h-48 rounded-xl object-cover shadow-lg"
              >
              <label 
                class="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition"
                title="Изменить фото"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input 
                  type="file" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handleCarPhotoUpload"
                >
              </label>
            </div>
            <div
              v-else
              class="mb-3"
            >
              <label class="flex flex-col items-center gap-2 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <svg
                  class="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Добавить фото автомобиля</span>
                <input 
                  type="file" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handleCarPhotoUpload"
                >
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Марка</label>
              <input
                v-model="carForm.car_brand"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Toyota"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Модель</label>
              <input
                v-model="carForm.car_model"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Camry"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Год</label>
              <input
                v-model.number="carForm.car_year"
                type="number"
                min="1990"
                max="2025"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="2020"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Цвет</label>
              <input
                v-model="carForm.car_color"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Белый"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Госномер</label>
            <input
              v-model="carForm.car_number"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="А123АА777"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Тип ТС</label>
            <select
              v-model="carForm.car_type"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="sedan">
                🚗 Седан
              </option>
              <option value="suv">
                🚙 Внедорожник/Кроссовер
              </option>
              <option value="truck">
                🚚 Грузовик
              </option>
              <option value="van">
                🚐 Минивэн
              </option>
              <option value="motorcycle">
                🏍️ Мотоцикл
              </option>
              <option value="other">
                🚌 Другое
              </option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              :disabled="isSaving"
              @click="showCarModal = false"
            >
              Отмена
            </button>
            <button
              class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
              :disabled="isSaving"
              @click="saveCar"
            >
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования навыков -->
    <div
      v-if="showSkillsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showSkillsModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white">
            🛠️ Навыки и оборудование
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showSkillsModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Провода для прикуривания -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">⚡</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Провода для прикуривания
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу зарядить аккумулятор
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.has_jumper_cables ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('has_jumper_cables')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.has_jumper_cables ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Буксировочный трос -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">🧵</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Буксировочный трос
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу отбуксировать
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.has_tow_rope ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('has_tow_rope')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.has_tow_rope ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Канистра для топлива -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">⛽</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Канистра для топлива
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу подвезти бензин
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.has_fuel_canister ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('has_fuel_canister')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.has_fuel_canister ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Компрессор/насос -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">💨</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Компрессор/насос
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу подкачать колесо
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.has_compressor ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('has_compressor')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.has_compressor ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Замена колеса -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">🛞</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Замена колеса
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу заменить колесо
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.can_change_tire ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('can_change_tire')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.can_change_tire ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Инструменты -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">🧰</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Инструменты
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Есть набор инструментов
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.has_tools ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('has_tools')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.has_tools ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
          
          <!-- Опыт автослесаря -->
          <div class="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
            <span class="text-xl sm:text-2xl flex-shrink-0">👨‍🔧</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                Опыт автослесаря
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                Могу диагностировать/чинить
              </div>
            </div>
            <button 
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-2',
                skillsForm.is_mechanic ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
              type="button"
              @click="toggleSkill('is_mechanic')"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="skillsForm.is_mechanic ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            :disabled="isSaving"
            @click="showSkillsModal = false"
          >
            Отмена
          </button>
          <button
            class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            :disabled="isSaving"
            @click="saveSkills"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно заявок в друзья -->
    <div
      v-if="showFriendRequestsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showFriendRequestsModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            📨 Заявки в друзья
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showFriendRequestsModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          v-if="pendingRequests.length === 0"
          class="text-center py-6 sm:py-8"
        >
          <div class="text-3xl sm:text-4xl mb-2 sm:mb-3">
            📩
          </div>
          <p class="text-gray-500 text-sm sm:text-base">
            Нет новых заявок
          </p>
        </div>

        <div
          v-else
          class="space-y-2 sm:space-y-3"
        >
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl gap-2"
          >
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <img 
                v-if="request.sender?.avatar_url" 
                :src="getAvatarUrl(request.sender.avatar_url)" 
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
              >
              <div
                v-else
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base"
              >
                {{ getInitials(request.sender?.full_name) }}
              </div>
              <div class="min-w-0">
                <div class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {{ request.sender?.full_name || 'Пользователь' }}
                </div>
                <div class="text-xs text-gray-500">
                  ⭐ {{ parseFloat(request.sender?.rating || 0).toFixed(1) }} • {{ request.sender?.total_helps_given || 0 }} помощей
                </div>
                <div
                  v-if="request.message"
                  class="text-xs text-gray-400 mt-1 italic"
                >
                  «{{ request.message }}»
                </div>
              </div>
            </div>
            <div class="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition"
                @click="acceptFriendRequest(request.id)"
              >
                ✅
              </button>
              <button
                class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition"
                @click="rejectFriendRequest(request.id)"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления друга -->
    <div
      v-if="showAddFriendModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="showAddFriendModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transition-colors duration-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            👥 Добавить друга
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showAddFriendModal = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Поиск -->
        <div class="mb-3 sm:mb-4">
          <input
            v-model="friendSearchQuery"
            type="text"
            placeholder="🔍 Поиск по имени или телефону..."
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearchFriends"
          >
        </div>

        <!-- Результаты поиска -->
        <div
          v-if="isSearchingFriends"
          class="text-center py-4 sm:py-6"
        >
          <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto" />
        </div>

        <div
          v-else-if="friendSearchResults.length === 0 && friendSearchQuery.length >= 2"
          class="text-center py-4 sm:py-6"
        >
          <p class="text-gray-500 text-sm sm:text-base">
            Никого не найдено
          </p>
        </div>

        <div
          v-else-if="friendSearchQuery.length < 2"
          class="text-center py-4 sm:py-6"
        >
          <p class="text-gray-400 text-xs sm:text-sm">
            Введите минимум 2 символа для поиска
          </p>
        </div>

        <div
          v-else
          class="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto"
        >
          <div
            v-for="user in friendSearchResults"
            :key="user.id"
            class="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl gap-2"
          >
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <div class="relative flex-shrink-0">
                <img 
                  v-if="user.avatar_url" 
                  :src="getAvatarUrl(user.avatar_url)" 
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                >
                <div
                  v-else
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base"
                >
                  {{ getInitials(user.full_name) }}
                </div>
                <span 
                  v-if="user.is_available_to_help"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ user.full_name }}
                </div>
                <div class="text-xs text-gray-500">
                  ⭐ {{ parseFloat(user.rating || 0).toFixed(1) }} • {{ user.total_helps_given || 0 }} помощей
                </div>
              </div>
            </div>
            <button
              v-if="!user.friendship_status"
              class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              @click="sendFriendRequest(user.id)"
            >
              + Добавить
            </button>
            <span
              v-else-if="user.friendship_status === 'pending' && user.is_request_sender"
              class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold"
            >
              Отправлено
            </span>
            <span
              v-else-if="user.friendship_status === 'pending' && !user.is_request_sender"
              class="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold"
            >
              Ожидает ответа
            </span>
            <span
              v-else-if="user.friendship_status === 'accepted'"
              class="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold"
            >
              ✅ Друзья
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { apiService } from '@/services/api'
import NavigationHeader from '@/components/NavigationHeader.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggleDarkMode } = useDarkMode()

const stats = ref({
  totalRequests: 0,
  myRequests: 0,
  myHelps: 0,
  completedRequests: 0,
  chats: 0
})

const recentActivity = ref([])
const isLoadingActivity = ref(true)
const avatarPreview = ref(null)
const avatarFile = ref(null)
const carPhotoPreview = ref(null)
const carPhotoFile = ref(null)

// Модальные окна и формы
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)
const editForm = ref({
  full_name: '',
  phone: ''
})
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isSaving = ref(false)

// Новые состояния - инициализируем из localStorage для мгновенного отображения
const _savedUser = (() => {
  try {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch (e) { return null }
})()
const isAvailableToHelp = ref(_savedUser?.is_available_to_help === true)
const isSavingAvailability = ref(false)
const helpRadius = ref(_savedUser?.help_radius_km || 10)

// Email verification
const isResendingVerification = ref(false)
const verificationSent = ref(false)

// Модальные окна
const showCarModal = ref(false)
const showSkillsModal = ref(false)

// Формы
const carForm = ref({
  car_brand: '',
  car_model: '',
  car_year: null,
  car_color: '',
  car_number: '',
  car_type: 'sedan'
})

const skillsForm = ref({
  has_jumper_cables: _savedUser?.has_jumper_cables === true,
  has_tow_rope: _savedUser?.has_tow_rope === true,
  has_fuel_canister: _savedUser?.has_fuel_canister === true,
  has_compressor: _savedUser?.has_compressor === true,
  can_change_tire: _savedUser?.can_change_tire === true,
  has_tools: _savedUser?.has_tools === true,
  is_mechanic: _savedUser?.is_mechanic === true
})

const notifySettings = ref({
  newRequests: _savedUser?.notify_new_requests !== false,
  messages: _savedUser?.notify_messages !== false,
  emailDigest: _savedUser?.notify_email_digest === true,
  sound: _savedUser?.notify_sound !== false
})

// ========== Друзья ==========
const friends = ref([])
const pendingRequests = ref([])
const friendCount = ref({ friends: 0, pending_requests: 0 })
const isLoadingFriends = ref(false)
const showAllFriends = ref(false)
const showFriendRequestsModal = ref(false)
const showAddFriendModal = ref(false)
const friendSearchQuery = ref('')
const friendSearchResults = ref([])
const isSearchingFriends = ref(false)
let searchTimeout = null

// ========== Отзывы ==========
const myReviews = ref([])
const showAllReviews = ref(false)
const isLoadingReviews = ref(false)

// Вычисляемые значения
const hasCarInfo = computed(() => {
  return authStore.user?.car_brand || authStore.user?.car_model
})

// Отслеживаем изменения данных пользователя для автоматической перезагрузки настроек
watch(() => authStore.user, (newUser, _oldUser) => {
  if (newUser && newUser.id) {
    console.log('ProfileView: User data changed, reloading settings')
    // Всегда переинициализируем настройки при изменении пользователя
    initUserSettings()
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  try {
    console.log('ProfileView: onMounted started')
    
    // Сначала загружаем пользователя из localStorage для мгновенного отображения
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        authStore.user = userData
        console.log('ProfileView: User loaded from localStorage', userData?.id)
      } catch (e) {
        console.warn('ProfileView: Failed to parse saved user', e)
      }
    }
    
    const token = localStorage.getItem('token')
    console.log('ProfileView: token exists?', !!token)
    
    // Если нет токена и нет пользователя - редирект на логин
    if (!token && !authStore.user) {
      console.log('ProfileView: No token and no user, redirecting to login')
      router.push('/login')
      return
    }

    // Проверяем авторизацию при загрузке страницы (не блокируем рендеринг)
    if (token) {
      console.log('ProfileView: Checking auth...')
      try {
        await authStore.checkAuth()
        console.log('ProfileView: Auth check successful', authStore.user?.id)
      } catch (error) {
        console.error('ProfileView: Auth check failed', error)
        // Только при 401 и отсутствии пользователя - редирект
        if (error.response?.status === 401 && !authStore.user) {
          console.log('ProfileView: 401 and no user, redirecting to login')
          await authStore.logout()
          router.push('/login')
          return
        }
        // Иначе используем кэшированные данные
        console.log('ProfileView: Using cached user data due to API error')
      }
    }
    
    // Загружаем данные (не блокируем рендеринг при ошибках)
    if (authStore.user) {
      // Обновляем данные пользователя с сервера (включая рейтинг)
      console.log('ProfileView: Refreshing user data from server...')
      authStore.refreshUser().catch(err => {
        console.warn('ProfileView: Failed to refresh user data', err)
      })
      
      console.log('ProfileView: Loading stats...')
      loadStats().catch(err => {
        console.error('ProfileView: Failed to load stats', err)
        // Не редиректим, просто показываем страницу с нулевыми значениями
      })
      
      console.log('ProfileView: Loading activity...')
      loadRecentActivity().catch(err => {
        console.error('ProfileView: Failed to load activity', err)
        // Не редиректим, просто показываем пустую активность
      })
      
      // Загружаем настройки пользователя
      initUserSettings()
      
      // Загружаем друзей
      loadFriends().catch(err => {
        console.error('ProfileView: Failed to load friends', err)
      })
      
      // Загружаем отзывы
      loadReviews().catch(err => {
        console.error('ProfileView: Failed to load reviews', err)
      })
      
      // Проверяем query параметр для автоматического открытия модалки добавления друга
      if (route.query.addFriend === 'true') {
        showAddFriendModal.value = true
        // Очищаем query параметр из URL
        router.replace({ path: '/profile', query: {} })
      }
    }
    
    console.log('ProfileView: onMounted completed')
  } catch (error) {
    console.error('ProfileView: Critical error in onMounted', error)
    // При критической ошибке только если нет пользователя - редирект на логин
    if (!authStore.user && error.response?.status === 401) {
      router.push('/login')
    }
  }
})

async function loadStats() {
  try {
    console.log('loadStats: Starting...')
    
    // Проверяем авторизацию перед загрузкой
    if (!authStore.user) {
      console.warn('loadStats: No user, skipping')
      return
    }
    
    console.log('loadStats: Fetching my requests...')
    const myRequestsRes = await apiService.getMyRequests()
    console.log('loadStats: My requests response:', myRequestsRes)
    
    console.log('loadStats: Fetching all requests...')
    const allRequestsRes = await apiService.getHelpRequests()
    console.log('loadStats: All requests count:', allRequestsRes.data?.length)
    
    console.log('loadStats: Fetching chats...')
    const chatsRes = await apiService.getMyChats()
    console.log('loadStats: Chats response:', chatsRes)
    
    const myReqs = myRequestsRes.data || []
    const allReqs = allRequestsRes.data || []
    const chatsData = chatsRes.data || []
    
    console.log('loadStats: Current user ID:', authStore.user?.id)
    
    // Находим заявки где я - помощник
    const myHelpsData = allReqs.filter(r => r.helper_id === authStore.user?.id)
    console.log('loadStats: My helps count:', myHelpsData.length)
    
    stats.value.myRequests = myReqs.length
    stats.value.myHelps = myHelpsData.length
    stats.value.totalRequests = myReqs.length + myHelpsData.length
    stats.value.completedRequests = [...myReqs, ...myHelpsData].filter(r => r.status === 'completed').length
    stats.value.chats = chatsData.length
    
    console.log('loadStats: Final stats:', stats.value)
  } catch (error) {
    console.error('loadStats: Error occurred', error)
    console.error('loadStats: Error details:', error.message, error.response?.status)
    
    // Если 401 - редирект на логин
    if (error.response?.status === 401) {
      console.log('loadStats: 401 error, redirecting to login')
      await authStore.logout()
      router.push('/login')
      return
    }
    
    // Для других ошибок - устанавливаем нули, но не редиректим
    stats.value.myRequests = 0
    stats.value.myHelps = 0
    stats.value.totalRequests = 0
    stats.value.completedRequests = 0
    stats.value.chats = 0
  }
}

async function loadRecentActivity() {
  try {
    console.log('loadRecentActivity: Starting...')
    isLoadingActivity.value = true
    
    // Проверяем авторизацию перед загрузкой
    if (!authStore.user) {
      console.warn('loadRecentActivity: No user, skipping')
      return
    }
    
    const response = await apiService.getMyRequests()
    console.log('loadRecentActivity: Response:', response)
    
    if (response.success && response.data) {
      // Маппинг полей createdAt → created_at
      const activities = response.data.map(activity => {
        if (!activity.created_at && activity.createdAt) {
          activity.created_at = activity.createdAt
        }
        return activity
      })
      
      recentActivity.value = activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
      console.log('loadRecentActivity: Loaded', recentActivity.value.length, 'activities')
    } else {
      console.log('loadRecentActivity: No data or unsuccessful response')
    }
  } catch (error) {
    console.error('loadRecentActivity: Error occurred', error)
    console.error('loadRecentActivity: Error status:', error.response?.status)
    
    // Если 401 - редирект на логин
    if (error.response?.status === 401) {
      console.log('loadRecentActivity: 401 error, redirecting to login')
      await authStore.logout()
      router.push('/login')
      return
    }
    
    // Для других ошибок - просто оставляем пустым
    recentActivity.value = []
  } finally {
    isLoadingActivity.value = false
    console.log('loadRecentActivity: Completed')
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Функция для получения полного URL аватара
const getAvatarUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  // Убираем /api/v1 из baseUrl для статических файлов
  const staticBaseUrl = baseUrl.replace('/api/v1', '')
  return `${staticBaseUrl}${url}`
}

const getActivityIcon = (type) => {
  const icons = {
    help_request: '🆘',
    help_response: '🤝',
    rating: '⭐',
    payment: '💳'
  }
  return icons[type] || '📌'
}

const getActivityTitle = (activity) => {
  if (!activity.problem_type) return 'Заявка'
  
  const titles = {
    battery: '🔋 Севшая батарея',
    fuel: '⛽ Нет топлива',
    tire: '🛑 Прокол колеса',
    towing: '🚗 Буксировка',
    sober_driver: '🚕 Трезвый водитель',
    road_conflict: '🚨 Конфликт на дороге',
    other: '🔧 Другое'
  }
  
  return titles[activity.problem_type] || `Заявка #${activity.id?.slice(0, 8) || ''}`
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

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} дн назад`
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение')
    return
  }
  
  // Проверяем размер (макс. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Изображение слишком большое (макс. 5MB)')
    return
  }
  
  avatarFile.value = file
  
  // Создаем preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // Загружаем аватар
  uploadAvatar(file)
}

const uploadAvatar = async (file) => {
  try {
    const response = await apiService.uploadAvatar(file)
    if (response.success) {
      // Обновляем аватар в хранилище
      authStore.user.avatar_url = response.avatar_url
      // Очищаем preview
      avatarPreview.value = null
      alert('Аватар успешно обновлен!')
    }
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error)
    alert('Ошибка загрузки аватара')
  }
}

const handleCarPhotoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение')
    return
  }
  
  // Проверяем размер (макс. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Изображение слишком большое (макс. 5MB)')
    return
  }
  
  carPhotoFile.value = file
  
  // Создаем preview
  const reader = new FileReader()
  reader.onload = (e) => {
    carPhotoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // Загружаем фото
  uploadCarPhoto(file)
}

const uploadCarPhoto = async (file) => {
  try {
    const formData = new FormData()
    formData.append('carPhoto', file)
    
    const response = await apiService.uploadCarPhoto(formData)
    if (response.success) {
      // Обновляем фото авто в хранилище
      authStore.user.car_photo_url = response.car_photo_url
      localStorage.setItem('user', JSON.stringify(authStore.user))
      // Очищаем preview
      carPhotoPreview.value = null
      alert('Фото автомобиля успешно обновлено!')
    }
  } catch (error) {
    console.error('Ошибка загрузки фото авто:', error)
    alert('Ошибка загрузки фото авто')
  }
}

const editProfile = () => {
  try {
    // Заполняем форму текущими данными
    if (!authStore.user) {
      alert('Пользователь не авторизован')
      return
    }
    editForm.value = {
      full_name: authStore.user?.full_name || '',
      phone: authStore.user?.phone || ''
    }
    showEditProfileModal.value = true
  } catch (error) {
    console.error('Error in editProfile:', error)
    alert('Ошибка открытия формы редактирования: ' + (error?.message || 'Неизвестная ошибка'))
  }
}

const saveProfile = async () => {
  try {
    if (!editForm.value || !editForm.value.full_name || editForm.value.full_name.length < 2) {
      alert('Имя должно быть минимум 2 символа')
      return
    }

    isSaving.value = true
    const response = await apiService.updateProfile({
      full_name: editForm.value.full_name,
      phone: editForm.value.phone
    })

    if (response && response.success) {
      // Обновляем данные пользователя в store
      if (authStore.user) {
        authStore.user = { ...authStore.user, ...response.data }
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }
      showEditProfileModal.value = false
      alert('Профиль успешно обновлен!')
    } else {
      throw new Error(response?.message || 'Ошибка обновления профиля')
    }
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка обновления профиля'
    alert(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const changePassword = () => {
  try {
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showChangePasswordModal.value = true
  } catch (error) {
    console.error('Error in changePassword:', error)
    alert('Ошибка открытия формы смены пароля: ' + (error?.message || 'Неизвестная ошибка'))
  }
}

const savePassword = async () => {
  try {
    if (!passwordForm.value) {
      alert('Ошибка: форма не инициализирована')
      return
    }

    if (!passwordForm.value.currentPassword) {
      alert('Введите текущий пароль')
      return
    }

    if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
      alert('Новый пароль должен быть минимум 6 символов')
      return
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      alert('Новые пароли не совпадают')
      return
    }

    isSaving.value = true
    const response = await apiService.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    if (response && response.success) {
      showChangePasswordModal.value = false
      alert('Пароль успешно изменен!')
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      throw new Error(response?.message || 'Ошибка смены пароля')
    }
  } catch (error) {
    console.error('Ошибка смены пароля:', error)
    const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка смены пароля'
    alert(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const logout = async () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    await authStore.logout()
    router.push('/login')
  }
}

const handleRetryOrLogin = () => {
  // Clear any cached data and redirect to login
  authStore.logout()
  router.push('/login')
}

// ========== Новые функции ==========

const initUserSettings = () => {
  if (authStore.user) {
    console.log('🔧 initUserSettings called with user:', {
      is_available_to_help: authStore.user.is_available_to_help,
      notify_new_requests: authStore.user.notify_new_requests,
      notify_messages: authStore.user.notify_messages,
      notify_email_digest: authStore.user.notify_email_digest,
      notify_sound: authStore.user.notify_sound
    })
    
    // Статус помощника
    isAvailableToHelp.value = authStore.user.is_available_to_help === true
    helpRadius.value = authStore.user.help_radius_km || 10
    
    // Форма авто
    carForm.value = {
      car_brand: authStore.user.car_brand || '',
      car_model: authStore.user.car_model || '',
      car_year: authStore.user.car_year || null,
      car_color: authStore.user.car_color || '',
      car_number: authStore.user.car_number || '',
      car_type: authStore.user.car_type || 'sedan'
    }
    
    // Форма навыков
    skillsForm.value = {
      has_jumper_cables: authStore.user.has_jumper_cables === true,
      has_tow_rope: authStore.user.has_tow_rope === true,
      has_fuel_canister: authStore.user.has_fuel_canister === true,
      has_compressor: authStore.user.has_compressor === true,
      can_change_tire: authStore.user.can_change_tire === true,
      has_tools: authStore.user.has_tools === true,
      is_mechanic: authStore.user.is_mechanic === true
    }
    
    // Настройки уведомлений (явная проверка на true/false)
    notifySettings.value = {
      newRequests: authStore.user.notify_new_requests !== false,
      messages: authStore.user.notify_messages !== false,
      emailDigest: authStore.user.notify_email_digest === true,
      sound: authStore.user.notify_sound !== false
    }
    
    console.log('🔧 Settings initialized:', {
      isAvailableToHelp: isAvailableToHelp.value,
      notifySettings: notifySettings.value,
      skillsForm: skillsForm.value
    })
  }
}

const toggleAvailability = async () => {
  try {
    isSavingAvailability.value = true
    const newValue = !isAvailableToHelp.value
    
    console.log('🔄 Toggling availability to:', newValue)
    const response = await apiService.updateProfile({
      is_available_to_help: newValue
    })
    console.log('🔄 API response:', response)
    
    // Проверяем успешность
    if (response && (response.success || response.data)) {
      isAvailableToHelp.value = newValue
      authStore.user = { ...authStore.user, is_available_to_help: newValue }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      console.log('✅ Availability updated to:', newValue)
    } else {
      console.error('❌ Failed to update availability')
      alert('Не удалось изменить статус')
    }
  } catch (error) {
    console.error('Ошибка изменения статуса:', error)
    alert('Не удалось изменить статус')
  } finally {
    isSavingAvailability.value = false
  }
}

const saveHelpRadius = async () => {
  try {
    console.log('📍 Saving help radius:', helpRadius.value)
    const response = await apiService.updateProfile({
      help_radius_km: helpRadius.value
    })
    
    if (response && (response.success || response.data)) {
      authStore.user = { ...authStore.user, help_radius_km: helpRadius.value }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      console.log('✅ Help radius saved:', helpRadius.value)
    }
  } catch (error) {
    console.error('Ошибка сохранения радиуса:', error)
  }
}

// Отправка ссылки верификации email
const resendVerificationEmail = async () => {
  try {
    isResendingVerification.value = true
    verificationSent.value = false
    
    const response = await apiService.client.post('/auth/resend-verification', {
      email: authStore.user?.email
    })
    
    const message = response.message || response.data?.message || ''
    
    if (message.includes('уже подтверждён')) {
      // Email уже подтверждён - обновляем состояние
      authStore.user.email_verified = true
      localStorage.setItem('user', JSON.stringify(authStore.user))
      alert('✅ Ваш email уже подтверждён!')
      console.log('✅ Email already verified')
    } else if (response.success || response.data?.success) {
      verificationSent.value = true
      console.log('✅ Verification email sent')
      setTimeout(() => {
        verificationSent.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Ошибка отправки верификации:', error)
    alert('Не удалось отправить ссылку. Попробуйте позже.')
  } finally {
    isResendingVerification.value = false
  }
}

const saveCar = async () => {
  try {
    isSaving.value = true
    console.log('🚗 Saving car info:', carForm.value)
    const response = await apiService.updateProfile(carForm.value)
    
    if (response && (response.success || response.data)) {
      authStore.user = { ...authStore.user, ...carForm.value }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      showCarModal.value = false
      console.log('✅ Car info saved')
      alert('Информация об авто сохранена!')
    }
  } catch (error) {
    console.error('Ошибка сохранения авто:', error)
    alert('Не удалось сохранить информацию')
  } finally {
    isSaving.value = false
  }
}

const saveSkills = async () => {
  try {
    isSaving.value = true
    console.log('🛠️ Saving all skills:', skillsForm.value)
    const response = await apiService.updateProfile(skillsForm.value)
    
    if (response && (response.success || response.data)) {
      authStore.user = { ...authStore.user, ...skillsForm.value }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      showSkillsModal.value = false
      console.log('✅ Skills saved')
      alert('Навыки и оборудование сохранены!')
    }
  } catch (error) {
    console.error('Ошибка сохранения навыков:', error)
    alert('Не удалось сохранить навыки')
  } finally {
    isSaving.value = false
  }
}

// Автосохранение навыка при переключении
const toggleSkill = async (skillName) => {
  // Запоминаем предыдущее значение
  const previousValue = skillsForm.value[skillName]
  
  // Обновляем локальное состояние
  skillsForm.value[skillName] = !previousValue
  
  try {
    const payload = { [skillName]: skillsForm.value[skillName] }
    console.log('🛠️ Saving skill:', payload)
    const response = await apiService.updateProfile(payload)
    console.log('🛠️ API response:', response)
    
    if (response && (response.success || response.data)) {
      authStore.user = { ...authStore.user, ...payload }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      console.log('✅ Навык сохранен:', skillName, skillsForm.value[skillName])
    } else {
      console.error('❌ Failed to save skill')
      skillsForm.value[skillName] = previousValue
    }
  } catch (error) {
    console.error('Ошибка сохранения навыка:', error)
    // Откатываем изменения в случае ошибки
    skillsForm.value[skillName] = previousValue
  }
}

// Переключение настройки уведомлений
const toggleNotifySetting = async (setting) => {
  // Запоминаем предыдущее значение для отката
  const previousValue = notifySettings.value[setting]
  
  // Обновляем локальное состояние
  notifySettings.value[setting] = !previousValue
  
  // Сохраняем настройки
  try {
    const payload = {
      notify_new_requests: notifySettings.value.newRequests,
      notify_messages: notifySettings.value.messages,
      notify_email_digest: notifySettings.value.emailDigest,
      notify_sound: notifySettings.value.sound
    }
    
    console.log('🔔 Saving notification settings:', payload)
    const response = await apiService.updateProfile(payload)
    console.log('🔔 API response:', response)
    
    // Проверяем успешность (response может быть { success: true, data: {...} })
    if (response && (response.success || response.data)) {
      // Обновляем authStore с новыми данными
      authStore.user = { 
        ...authStore.user, 
        ...payload
      }
      
      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(authStore.user))
      
      console.log('✅ Настройки уведомлений сохранены:', payload)
    } else {
      console.error('❌ API returned unsuccessful response:', response)
      // Откатываем изменения
      notifySettings.value[setting] = previousValue
    }
  } catch (error) {
    console.error('❌ Ошибка сохранения настроек:', error)
    // Откатываем изменения в случае ошибки
    notifySettings.value[setting] = previousValue
  }
}

const _saveNotifySettings = async () => {
  try {
    const response = await apiService.updateProfile({
      notify_new_requests: notifySettings.value.newRequests,
      notify_messages: notifySettings.value.messages,
      notify_email_digest: notifySettings.value.emailDigest,
      notify_sound: notifySettings.value.sound
    })
    
    if (response.success) {
      authStore.user = { 
        ...authStore.user, 
        notify_new_requests: notifySettings.value.newRequests,
        notify_messages: notifySettings.value.messages,
        notify_email_digest: notifySettings.value.emailDigest,
        notify_sound: notifySettings.value.sound
      }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
  }
}

const getCarTypeLabel = (type) => {
  const labels = {
    sedan: '🚗 Седан',
    suv: '🚙 Внедорожник/Кроссовер',
    truck: '🚚 Грузовик',
    van: '🚐 Минивэн',
    motorcycle: '🏍️ Мотоцикл',
    other: '🚌 Другое'
  }
  return labels[type] || type
}

const formatMoney = (amount) => {
  const num = parseFloat(amount) || 0
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K ₽'
  }
  return num.toFixed(0) + ' ₽'
}

const formatResponseTime = (seconds) => {
  if (!seconds) return '-'
  if (seconds < 60) return seconds + ' с'
  if (seconds < 3600) return Math.round(seconds / 60) + ' мин'
  return Math.round(seconds / 3600) + ' ч'
}

// ========== Функции друзей ==========

const loadFriends = async () => {
  try {
    isLoadingFriends.value = true
    
    // Загружаем все данные параллельно
    const [friendsRes, countRes, pendingRes] = await Promise.all([
      apiService.getFriends(),
      apiService.getFriendCount(),
      apiService.getPendingFriendRequests()
    ])
    
    friends.value = friendsRes.data || []
    friendCount.value = countRes.data || { friends: 0, pending_requests: 0 }
    pendingRequests.value = pendingRes.data || []
    
    console.log('Friends loaded:', friends.value.length)
  } catch (error) {
    console.error('Ошибка загрузки друзей:', error)
  } finally {
    isLoadingFriends.value = false
  }
}

const debouncedSearchFriends = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchFriends()
  }, 300)
}

const searchFriends = async () => {
  if (friendSearchQuery.value.length < 2) {
    friendSearchResults.value = []
    return
  }
  
  try {
    isSearchingFriends.value = true
    const response = await apiService.searchUsersForFriends(friendSearchQuery.value)
    friendSearchResults.value = response.data || []
  } catch (error) {
    console.error('Ошибка поиска:', error)
    friendSearchResults.value = []
  } finally {
    isSearchingFriends.value = false
  }
}

const sendFriendRequest = async (userId) => {
  try {
    const response = await apiService.sendFriendRequest(userId)
    if (response.success) {
      // Обновляем статус в результатах поиска
      const userIdx = friendSearchResults.value.findIndex(u => u.id === userId)
      if (userIdx !== -1) {
        friendSearchResults.value[userIdx].friendship_status = 'pending'
        friendSearchResults.value[userIdx].is_request_sender = true
      }
      // Если автопринятие (встречная заявка)
      if (response.message?.includes('теперь друзья')) {
        await loadFriends()
      }
    }
  } catch (error) {
    console.error('Ошибка отправки заявки:', error)
    alert(error.response?.data?.message || 'Не удалось отправить заявку')
  }
}

const acceptFriendRequest = async (friendshipId) => {
  try {
    const response = await apiService.acceptFriendRequest(friendshipId)
    if (response.success) {
      await loadFriends()
      // Закрываем модальное окно если заявок больше нет
      if (pendingRequests.value.length === 0) {
        showFriendRequestsModal.value = false
      }
    }
  } catch (error) {
    console.error('Ошибка принятия заявки:', error)
    alert('Не удалось принять заявку')
  }
}

const rejectFriendRequest = async (friendshipId) => {
  try {
    const response = await apiService.rejectFriendRequest(friendshipId)
    if (response.success) {
      await loadFriends()
      if (pendingRequests.value.length === 0) {
        showFriendRequestsModal.value = false
      }
    }
  } catch (error) {
    console.error('Ошибка отклонения заявки:', error)
    alert('Не удалось отклонить заявку')
  }
}

const confirmRemoveFriend = async (friendItem) => {
  if (confirm(`Удалить ${friendItem.friend?.full_name || 'пользователя'} из друзей?`)) {
    try {
      const response = await apiService.removeFriend(friendItem.friendship_id)
      if (response.success) {
        await loadFriends()
      }
    } catch (error) {
      console.error('Ошибка удаления друга:', error)
      alert('Не удалось удалить из друзей')
    }
  }
}

const openDirectChat = async (friend) => {
  try {
    const response = await apiService.client.post(`/users/${friend.id}/chat`)
    if (response.chatId) {
      router.push(`/direct-chat/${response.chatId}`)
    }
  } catch (error) {
    console.error('Ошибка открытия чата:', error)
    alert('Не удалось открыть чат')
  }
}

// Переход на публичный профиль друга
const goToProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// ========== Функции отзывов ==========
const loadReviews = async () => {
  if (!authStore.user?.id) return
  
  try {
    isLoadingReviews.value = true
    const response = await apiService.getUserRatings(authStore.user.id)
    myReviews.value = response.data?.data || response.data || []
    console.log('Reviews loaded:', myReviews.value.length)
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error)
    myReviews.value = []
  } finally {
    isLoadingReviews.value = false
  }
}

const formatReviewDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
/* Стили для ползунка range - корректное отображение на мобильных */
.slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
}

/* Webkit (Chrome, Safari, Edge) */
.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #22c55e;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -6px;
}

.slider-thumb::-webkit-slider-thumb:hover {
  background: #16a34a;
  transform: scale(1.1);
}

.slider-thumb::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

/* Firefox */
.slider-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #22c55e;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-thumb::-moz-range-thumb:hover {
  background: #16a34a;
}

/* Firefox track */
.slider-thumb::-moz-range-track {
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
}

/* Focus styles */
.slider-thumb:focus {
  outline: none;
}

.slider-thumb:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}
</style>
