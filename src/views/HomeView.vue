<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-800">
    <!-- Hero Section -->
    <div class="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
      <!-- Анимированный фон с частицами -->
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-[url('/assets/road-landscape.svg')] opacity-10 bg-cover bg-center" />
        <!-- Светящиеся круги -->
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;" />
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;" />
      </div>

      <!-- Анимация дороги -->
      <div
        class="absolute inset-0 opacity-20"
        style="
        background-image: 
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.2) 40px, rgba(255,255,255,0.2) 50px),
          repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(255,255,255,0.1) 100px, rgba(255,255,255,0.1) 110px);
        animation: road-scroll 60s linear infinite;
      "
      />

      <!-- Nav -->
      <nav class="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform flex-shrink-0">
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Help-Car</span>
          </div>
          
          <div class="flex items-center gap-2 sm:gap-4">
            <router-link
              to="/register"
              class="px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105 text-center whitespace-nowrap"
            >
              <span class="hidden sm:inline">🚀 Зарегистрироваться</span>
              <span class="sm:hidden">🚀 Регистрация</span>
            </router-link>
            <router-link
              to="/login"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg sm:rounded-xl transition-all font-bold text-xs sm:text-sm md:text-lg border border-white/20 hover:scale-105 text-center whitespace-nowrap"
            >
              Войти
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Hero Content -->
      <div class="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <!-- Badge -->
        <div class="flex justify-center mb-6 sm:mb-8">
          <div class="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-bold">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>📍 Более {{ stats.totalUsers }} пользователей онлайн</span>
          </div>
        </div>

        <!-- Main Title -->
        <div class="text-center max-w-6xl mx-auto">
          <h1 class="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight px-2">
            <span class="inline-block animate-fade-in">Сломался в пути?</span><br>
            <span class="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in" style="animation-delay: 0.2s;">
              Помощь уже рядом!
            </span>
          </h1>
          
          <p class="text-base sm:text-lg md:text-2xl lg:text-3xl mb-8 sm:mb-12 text-blue-100 font-semibold max-w-4xl mx-auto leading-relaxed animate-fade-in px-4" style="animation-delay: 0.4s;">
            🚗 Сел аккумулятор? Спустило колесо? Закончился бензин?<br>
            <span class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mt-2 sm:mt-4 inline-block">
              Найди помощника за 60 секунд!
            </span>
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-12 animate-fade-in px-4" style="animation-delay: 0.6s;">
            <router-link
              to="/register"
              class="group relative px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl font-black hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 sm:hover:scale-110 shadow-2xl hover:shadow-blue-500/50 overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity blur" />
              <span class="relative flex items-center justify-center gap-2 sm:gap-3">
                🚀 Начать сейчас
                <svg class="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </router-link>
            <a
              href="#live-map"
              class="px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 border-3 sm:border-4 border-white/50 backdrop-blur-md rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl font-black hover:bg-white/10 hover:border-white transition-all hover:scale-105 flex items-center justify-center gap-2 sm:gap-3"
            >
              🗺️ Смотреть карту
            </a>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto animate-fade-in px-2" style="animation-delay: 0.8s;">
            <div class="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {{ stats.totalHelpers }}+
              </div>
              <div class="text-xs sm:text-sm md:text-base font-bold text-blue-100">
                👨‍🔧 Помощников
              </div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {{ stats.completedRequests }}+
              </div>
              <div class="text-xs sm:text-sm md:text-base font-bold text-blue-100">
                ✅ Выполнено
              </div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                &lt;5 мин
              </div>
              <div class="text-xs sm:text-sm md:text-base font-bold text-blue-100">
                ⏱️ Отклик
              </div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                24/7
              </div>
              <div class="text-xs sm:text-sm md:text-base font-bold text-blue-100">
                🌐 Онлайн
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="hidden sm:block absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg class="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>

    <!-- ЖИВАЯ КАРТА НА ГЛАВНОЙ -->
    <div
      id="live-map"
      class="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900"
    >
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white">
            🗺️ Живая карта помощи
          </h2>
          <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 max-w-4xl mx-auto font-bold leading-relaxed px-2">
            Все запросы отображаются в реальном времени.<br>
            Когда кто-то просит помощь - карта автоматически приближается к нему!
          </p>
        </div>
        
        <!-- Живая карта с боковой панелью -->
        <div class="relative">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 animate-pulse" />
          <div class="relative h-[500px] md:h-[700px] bg-white rounded-3xl overflow-hidden shadow-2xl flex">
            <!-- Кнопка переключения панели (только на мобильных) -->
            <button
              class="absolute top-4 left-4 md:hidden bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white transition-all"
              :style="{ zIndex: Z_INDEX.TOGGLE_BUTTON }"
              aria-label="Переключить список заявок"
              @click="showSidebar = !showSidebar"
            >
              <svg
                v-if="!showSidebar"
                class="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-gray-700"
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
            
            <!-- Боковая панель со списком заявок -->
            <div
              :class="[
                'absolute md:relative inset-y-0 left-0',
                'w-full sm:w-96',
                'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm',
                'border-r-2 border-gray-200 dark:border-slate-600',
                'flex flex-col overflow-hidden',
                'transition-transform duration-300 ease-in-out',
                showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              ]"
              :style="{ zIndex: Z_INDEX.SIDEBAR }"
            >
              <div class="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  <h3 class="text-2xl font-black">
                    Активные запросы
                  </h3>
                </div>
                <p class="text-blue-100 font-semibold">
                  {{ filteredRequests.length }} рядом с вами
                </p>
                
                <!-- Фильтр по типу -->
                <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                    v-for="t in typeOptions"
                    :key="t.value"
                    :class="['px-3 py-2 rounded-lg text-sm font-bold transition', activeType === t.value ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30']"
                    :aria-pressed="activeType === t.value"
                    @click="activeType = t.value"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <!-- Skeleton список -->
                <template v-if="isLoadingList">
                  <div
                    v-for="i in 4"
                    :key="'s'+i"
                    class="p-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="w-14 h-14 rounded-xl bg-gray-200 skeleton" />
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-3/4 skeleton" />
                        <div class="h-3 bg-gray-200 rounded w-full skeleton" />
                        <div class="flex items-center justify-between mt-2">
                          <div class="h-4 bg-gray-200 rounded w-16 skeleton" />
                          <div class="h-3 bg-gray-200 rounded w-20 skeleton" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Список заявок -->
                <template v-else>
                  <div
                    v-for="request in filteredRequests"
                    :key="request.id"
                    class="group p-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-slate-700 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 animate-fade-in"
                    @click="showRequestDetails(request)"
                  >
                    <div class="flex items-start space-x-3">
                      <div :class="['w-16 h-16 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all', getIconGradient(request.type)]">
                        <span class="text-2xl">{{ getIcon(request.type) }}</span>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <h4 class="text-base font-black text-gray-900 dark:text-white mb-1 truncate">
                          {{ request.title }}
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                          {{ request.description }}
                        </p>
                        <div class="flex items-center justify-between">
                          <span class="text-lg font-black text-green-600 dark:text-green-400">{{ request.amount }}₽</span>
                          <span class="text-xs text-gray-500 dark:text-gray-300">📍 {{ request.distance }}</span>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-300 mt-1">
                          🕒 {{ formatDate(request.created_at) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            
            <!-- Карта -->
            <div
              class="flex-1 relative"
              :style="{ zIndex: Z_INDEX.MAP }"
            >
              <!-- Ленивый рендер карты с skeleton -->
              <Suspense>
                <template #default>
                  <LazyMap
                    ref="mapRef"
                    :requests="filteredRequests"
                    @ready="onMapReady"
                  />
                </template>
                <template #fallback>
                  <div class="w-full h-full grid place-items-center">
                    <div class="animate-pulse text-center">
                      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 mx-auto mb-4" />
                      <div class="h-4 w-64 bg-gray-200 rounded mx-auto mb-2" />
                      <div class="h-4 w-48 bg-gray-200 rounded mx-auto" />
                    </div>
                  </div>
                </template>
              </Suspense>
            </div>
          </div>
        </div>
        
        <!-- Модальное окно с деталями запроса (вынесено за пределы контейнера карты) -->
        <Transition name="modal">
          <div 
            v-if="selectedRequest" 
            class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
            :style="{ zIndex: Z_INDEX.MODAL }"
            role="dialog"
            aria-modal="true" 
            :aria-labelledby="'request-title'" 
            @click.self="selectedRequest = null"
          >
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-2xl w-full shadow-2xl focus:outline-none"
              tabindex="-1"
            >
              <div class="flex items-start justify-between mb-4 md:mb-6">
                <div class="flex items-center space-x-3 md:space-x-4">
                  <div :class="['w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg', getIconGradient(selectedRequest.type)]">
                    <span class="text-3xl md:text-4xl">{{ getIcon(selectedRequest.type) }}</span>
                  </div>
                  <div>
                    <h2
                      :id="'request-title'"
                      class="text-xl md:text-3xl font-black text-gray-900 dark:text-white"
                    >
                      {{ selectedRequest.title }}
                    </h2>
                    <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 font-semibold">
                      {{ selectedRequest.distance }}
                    </p>
                  </div>
                </div>
                <button
                  class="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg p-1"
                  aria-label="Закрыть модальное окно"
                  @click="selectedRequest = null"
                >
                  ×
                </button>
              </div>
                
              <!-- Skeleton модалки при загрузке -->
              <div
                v-if="isLoadingModal"
                class="space-y-4 mb-6"
              >
                <div class="bg-gray-50 rounded-2xl p-6">
                  <div class="h-5 w-40 bg-gray-200 rounded skeleton mb-3" />
                  <div class="h-4 w-full bg-gray-200 rounded skeleton mb-2" />
                  <div class="h-4 w-5/6 bg-gray-200 rounded skeleton" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-green-50 rounded-2xl p-6 text-center">
                    <div class="h-4 w-24 bg-green-200 rounded mx-auto skeleton mb-2" />
                    <div class="h-8 w-20 bg-green-200 rounded mx-auto skeleton" />
                  </div>
                  <div class="bg-blue-50 rounded-2xl p-6 text-center">
                    <div class="h-4 w-24 bg-blue-200 rounded mx-auto skeleton mb-2" />
                    <div class="h-8 w-24 bg-blue-200 rounded mx-auto skeleton" />
                  </div>
                </div>
              </div>
                
              <div
                v-else
                class="space-y-4 mb-6"
              >
                <div class="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6">
                  <h3 class="text-lg font-black text-gray-900 dark:text-white mb-3">
                    📝 Описание
                  </h3>
                  <p class="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                    {{ selectedRequest.description }}
                  </p>
                </div>
                  
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div class="bg-green-50 dark:bg-green-900/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-center">
                    <div class="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ВОЗНАГРАЖДЕНИЕ
                    </div>
                    <div class="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400">
                      {{ selectedRequest.amount }}₽
                    </div>
                  </div>
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-center">
                    <div class="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      РАССТОЯНИЕ
                    </div>
                    <div class="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
                      {{ selectedRequest.distance }}
                    </div>
                  </div>
                </div>
              </div>
                
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-safe">
                <!-- Кнопка Откликнуться - скрыта для собственных заявок -->
                <router-link 
                  v-if="currentUser?.id !== selectedRequest.user_id"
                  :to="`/responses/${selectedRequest.id}`"
                  class="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm md:text-base text-center hover:from-blue-600 hover:to-purple-700 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  👋 Откликнуться
                </router-link>
                <!-- Для собственных заявок показываем информацию -->
                <div
                  v-else
                  class="px-4 md:px-6 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm md:text-base text-center cursor-not-allowed"
                  title="Это ваша заявка"
                >
                  ℹ️ Ваша заявка
                </div>
                <a
                  :href="`https://yandex.ru/maps/?text=${selectedRequest.lat},${selectedRequest.lon}`"
                  target="_blank"
                  class="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-bold text-sm md:text-base text-center hover:from-yellow-500 hover:to-yellow-600 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
                >
                  🗺️ Яндекс
                </a>
                <router-link 
                  :to="`/chat/${selectedRequest.id}`"
                  class="px-4 md:px-6 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm md:text-base text-center hover:bg-gray-200 dark:hover:bg-slate-600 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  💬 Чат заявки
                </router-link>
                <button
                  class="px-4 md:px-6 py-3 md:py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold text-sm md:text-base text-center hover:bg-green-200 dark:hover:bg-green-900/50 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
                  @click="shareSelected()"
                >
                  📤 Поделиться
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ОСТАЛЬНЫЕ СЕКЦИИ -->
    <div class="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-800">
      <div class="container mx-auto px-4 sm:px-6">
        <!-- Статистика -->
        <div class="mt-8 sm:mt-12 md:mt-16 grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div 
            v-for="stat in statsCards" 
            :key="stat.id"
            :class="['p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl text-white transform hover:scale-105 transition cursor-pointer', stat.gradient]"
            @click="openInfoModal(stat)"
          >
            <div class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3">
              {{ stat.id === 'requests' ? liveRequests.length : stat.value }}
            </div>
            <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold opacity-90">
              {{ stat.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Как это работает -->
    <div class="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-900">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <span class="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">КАК ЭТО РАБОТАЕТ</span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
            3 простых шага
          </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative">
          <!-- Соединительная линия -->
          <div class="hidden md:block absolute top-24 left-1/6 right-1/6 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full opacity-30" />
          
          <div 
            v-for="step in stepsCards" 
            :key="step.id"
            class="relative text-center p-4 sm:p-6 md:p-8 group cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl sm:rounded-3xl transition-all"
            @click="openInfoModal(step)"
          >
            <div :class="['w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform text-white text-xl sm:text-2xl md:text-3xl font-black', step.gradient]">
              {{ step.number }}
            </div>
            <div class="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
              {{ step.icon }}
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-black mb-2 sm:mb-4 text-gray-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
              {{ step.shortDesc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <span class="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">ПРЕИМУЩЕСТВА</span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
            Почему Help-Car?
          </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div 
            v-for="feature in featuresCards" 
            :key="feature.id"
            class="group bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
            @click="openInfoModal(feature)"
          >
            <div :class="['w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 md:mb-8 shadow-lg group-hover:scale-110 transition-transform', feature.iconGradient]">
              <span class="text-2xl sm:text-3xl md:text-4xl">{{ feature.iconEmoji }}</span>
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-black mb-2 sm:mb-4 text-gray-900 dark:text-white">
              {{ feature.icon }} {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
              {{ feature.shortDesc }}
            </p>
          </div>
        </div>
        
        <!-- Дополнительные преимущества -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12">
          <div 
            v-for="extra in extraCards" 
            :key="extra.id"
            class="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            @click="openInfoModal(extra)"
          >
            <div class="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
              {{ extra.icon }}
            </div>
            <div class="min-w-0">
              <div class="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
                {{ extra.title }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ extra.subtitle }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Отзывы пользователей -->
    <div class="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-900">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <span class="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">ОТЗЫВЫ</span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
            Что говорят пользователи
          </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
            <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold">
                АК
              </div>
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  Алексей К.
                </div>
                <div class="text-yellow-500 text-sm sm:text-base">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg italic">
              "Застрял на трассе с пробитым колесом. Через 20 минут подъехал помощник и всё починил. Супер сервис!"
            </p>
            <div class="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Москва • Помощь с колесом
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
            <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold">
                МС
              </div>
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  Марина С.
                </div>
                <div class="text-yellow-500 text-sm sm:text-base">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg italic">
              "Закончился бензин посреди города. Очень быстро нашла помощника, который довез канистру. Спасибо!"
            </p>
            <div class="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Санкт-Петербург • Доставка топлива
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
            <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold">
                ДВ
              </div>
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  Дмитрий В.
                </div>
                <div class="text-yellow-500 text-sm sm:text-base">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg italic">
              "Сам помогаю людям через приложение. Удобный интерфейс, хорошие люди. Рекомендую всем водителям!"
            </p>
            <div class="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Казань • Помощник
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Типы помощи -->
    <div class="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <span class="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">ВИДЫ ПОМОЩИ</span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
            Чем мы можем помочь?
          </h2>
        </div>
        
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          <div 
            v-for="service in services" 
            :key="service.id"
            class="bg-white/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl text-center hover:bg-white/20 hover:scale-105 transition-all cursor-pointer group"
            @click="openServiceModal(service)"
          >
            <div class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform">
              {{ service.icon }}
            </div>
            <div class="font-bold text-xs sm:text-sm md:text-base">
              {{ service.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с описанием услуги -->
    <Transition name="service-modal">
      <div 
        v-if="selectedService" 
        class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
        @click.self="selectedService = null"
      >
        <div class="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/10">
          <!-- Шапка с иллюстрацией -->
          <div :class="['relative h-48 md:h-64 overflow-hidden', selectedService.gradient]">
            <!-- SVG иллюстрация -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-full h-full"
                v-html="selectedService.illustration"
              />
            </div>
            <!-- Оверлей -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <!-- Иконка -->
            <div class="absolute bottom-4 left-6 flex items-center gap-4">
              <div class="text-6xl md:text-7xl drop-shadow-lg">
                {{ selectedService.icon }}
              </div>
              <div>
                <h2 class="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                  {{ selectedService.title }}
                </h2>
                <p class="text-white/80 font-semibold">
                  {{ selectedService.subtitle }}
                </p>
              </div>
            </div>
            <!-- Кнопка закрытия -->
            <button 
              class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              @click="selectedService = null"
            >
              ✕
            </button>
          </div>
          
          <!-- Контент -->
          <div class="p-6 md:p-8">
            <!-- Описание -->
            <p class="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
              {{ selectedService.description }}
            </p>
            
            <!-- Что включено -->
            <div class="bg-white/5 rounded-2xl p-5 mb-6">
              <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="text-2xl">✨</span> Что включено
              </h3>
              <ul class="space-y-3">
                <li 
                  v-for="(feature, idx) in selectedService.features" 
                  :key="idx"
                  class="flex items-start gap-3 text-gray-300"
                >
                  <span class="text-green-400 text-xl">✓</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <!-- Цена и время -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                <div class="text-sm text-green-300 font-semibold mb-1">
                  Средняя цена
                </div>
                <div class="text-2xl font-black text-green-400">
                  {{ selectedService.price }}
                </div>
              </div>
              <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                <div class="text-sm text-blue-300 font-semibold mb-1">
                  Время ожидания
                </div>
                <div class="text-2xl font-black text-blue-400">
                  {{ selectedService.time }}
                </div>
              </div>
            </div>
            
            <!-- Кнопки действий -->
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link 
                to="/register"
                class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-center hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
              >
                🚀 Создать заявку
              </router-link>
              <router-link 
                to="/map"
                class="flex-1 px-6 py-4 bg-white/10 text-white rounded-xl font-bold text-center hover:bg-white/20 transition"
              >
                🗺️ Посмотреть на карте
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Универсальное модальное окно для информации -->
    <Transition name="service-modal">
      <div 
        v-if="selectedInfo" 
        class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
        @click.self="selectedInfo = null"
      >
        <div class="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto">
          <!-- Шапка -->
          <div :class="['relative p-8 overflow-hidden', selectedInfo.gradient || 'bg-gradient-to-br from-blue-600 to-purple-700']">
            <!-- SVG иллюстрация -->
            <div
              v-if="selectedInfo.illustration"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-full h-full"
                v-html="selectedInfo.illustration"
              />
            </div>
            <!-- Оверлей -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <!-- Контент -->
            <div class="relative flex items-center gap-4">
              <div class="text-6xl md:text-7xl drop-shadow-lg">
                {{ selectedInfo.icon }}
              </div>
              <div>
                <h2 class="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                  {{ selectedInfo.title }}
                </h2>
                <p
                  v-if="selectedInfo.subtitle"
                  class="text-white/80 font-semibold"
                >
                  {{ selectedInfo.subtitle }}
                </p>
              </div>
            </div>
            <!-- Кнопка закрытия -->
            <button 
              class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              @click="selectedInfo = null"
            >
              ✕
            </button>
          </div>
          
          <!-- Контент -->
          <div class="p-6 md:p-8">
            <!-- Описание -->
            <p class="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
              {{ selectedInfo.description }}
            </p>
            
            <!-- Что включено -->
            <div
              v-if="selectedInfo.features && selectedInfo.features.length"
              class="bg-white/5 rounded-2xl p-5 mb-6"
            >
              <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="text-2xl">✨</span> Подробнее
              </h3>
              <ul class="space-y-3">
                <li 
                  v-for="(feature, idx) in selectedInfo.features" 
                  :key="idx"
                  class="flex items-start gap-3 text-gray-300"
                >
                  <span class="text-green-400 text-xl">✓</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <!-- Доп. информация -->
            <div
              v-if="selectedInfo.stats"
              class="grid grid-cols-2 gap-4 mb-6"
            >
              <div 
                v-for="(stat, idx) in selectedInfo.stats" 
                :key="idx"
                :class="['border rounded-xl p-4 text-center', stat.bgClass || 'bg-blue-500/20 border-blue-500/30']"
              >
                <div :class="['text-sm font-semibold mb-1', stat.labelClass || 'text-blue-300']">
                  {{ stat.label }}
                </div>
                <div :class="['text-2xl font-black', stat.valueClass || 'text-blue-400']">
                  {{ stat.value }}
                </div>
              </div>
            </div>
            
            <!-- Кнопки действий -->
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link 
                to="/register"
                class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-center hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
              >
                🚀 Начать сейчас
              </router-link>
              <button 
                class="flex-1 px-6 py-4 bg-white/10 text-white rounded-xl font-bold text-center hover:bg-white/20 transition"
                @click="selectedInfo = null"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- CTA -->
    <div class="py-16 sm:py-24 md:py-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-center relative overflow-hidden">
      <!-- Анимированные фигуры -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-float" />
        <div
          class="absolute top-1/2 -right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-float"
          style="animation-delay: 2s"
        />
        <div
          class="absolute -bottom-10 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"
          style="animation-delay: 4s"
        />
      </div>
      
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.2) 40px, rgba(255,255,255,0.2) 50px);"
      />
      <div class="relative z-10 container mx-auto px-4 sm:px-6">
        <div class="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm sm:text-base md:text-lg font-bold mb-4 sm:mb-6 md:mb-8">
          🚀 Бесплатно и без рекламы
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 md:mb-8">
          Готовы начать?
        </h2>
        <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 md:mb-12 font-bold opacity-90">
          Присоединяйтесь к сообществу взаимопомощи
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <router-link
            to="/register"
            class="inline-block px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-white text-blue-600 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl font-black hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Создать аккаунт →
          </router-link>
          <router-link
            to="/map"
            class="inline-block px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 border-2 sm:border-3 border-white rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl font-black hover:bg-white/20 transition-all"
          >
            🗺️ Посмотреть карту
          </router-link>
        </div>
      </div>
    </div>

    <!-- Партнёры и доверие -->
    <div class="py-10 sm:py-12 md:py-16 bg-gray-50 dark:bg-slate-800">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-6 sm:mb-8 md:mb-10">
          <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg font-bold">
            НАМ ДОВЕРЯЮТ
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 opacity-60">
          <div class="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl font-black text-gray-400 dark:text-gray-500">
            <span class="text-2xl sm:text-3xl md:text-4xl">🚗</span> AutoClub
          </div>
          <div class="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl font-black text-gray-400 dark:text-gray-500">
            <span class="text-2xl sm:text-3xl md:text-4xl">🛠️</span> DriveHelp
          </div>
          <div class="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl font-black text-gray-400 dark:text-gray-500">
            <span class="text-2xl sm:text-3xl md:text-4xl">⛽</span> FuelFast
          </div>
          <div class="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl font-black text-gray-400 dark:text-gray-500">
            <span class="text-2xl sm:text-3xl md:text-4xl">📱</span> TechAuto
          </div>
        </div>
      </div>
    </div>

    <!-- PWA УСТАНОВКА -->
    <div class="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      <div class="container mx-auto px-4 sm:px-6">
        <InstallPWA />
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-16">
      <div class="container mx-auto px-6 text-center">
        <div class="flex items-center justify-center space-x-3 mb-6">
          <svg
            class="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
          </svg>
          <span class="text-white font-black text-2xl">Help-Car</span>
        </div>
        <p class="text-lg mb-8">
          P2P платформа для автомобилистов России
        </p>

        <!-- Быстрые ссылки -->
        <div class="flex flex-wrap items-center justify-center gap-3 mb-8">
          <router-link
            to="/map"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition"
          >
            🗺 Карта
          </router-link>
          <router-link
            to="/create-request"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition"
          >
            🆘 Создать заявку
          </router-link>
          <router-link
            to="/city-chats"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition"
          >
            💬 Чаты городов
          </router-link>
          <router-link
            to="/profile"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition"
          >
            👤 Личный кабинет
          </router-link>
        </div>
        <p class="text-sm">
          &copy; 2025 Help-Car. Все права защищены.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LazyMap from '@/components/OpenStreetMapWidget.vue'
import InstallPWA from '@/components/InstallPWA.vue'
import { useRequestHelpers } from '@/composables/useRequestHelpers'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import Z_INDEX from '@/utils/zIndex'

const { formatDate, calculateDistance } = useRequestHelpers()
const authStore = useAuthStore()

// Получаем текущего пользователя
const currentUser = computed(() => authStore.user)

const liveRequests = ref([])

// Статистика для Hero секции
const stats = ref({
  totalUsers: 1250,
  totalHelpers: 320,
  completedRequests: 4800
})

// const lastRequest = ref(liveRequests.value[0]) // для будущего использования
const mapRef = ref(null)
const selectedRequest = ref(null)
const selectedService = ref(null)
const selectedInfo = ref(null)

// Данные для статистики
const statsCards = ref([
  {
    id: 'requests',
    icon: '📊',
    title: 'Запросов сейчас',
    value: '0',
    subtitle: 'Активные заявки',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    description: 'Это количество активных запросов о помощи прямо сейчас. Каждый запрос - это человек, которому нужна помощь на дороге. Заявки обновляются в реальном времени.',
    features: [
      'Заявки обновляются автоматически',
      'Отображаются на интерактивной карте',
      'Фильтрация по типу помощи',
      'Сортировка по расстоянию и времени'
    ],
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-20"><circle cx="100" cy="100" r="60" fill="#3b82f6"/><circle cx="200" cy="80" r="40" fill="#60a5fa"/><circle cx="300" cy="120" r="50" fill="#93c5fd"/></svg>`
  },
  {
    id: 'online',
    icon: '👥',
    title: 'Пользователей онлайн',
    value: '247',
    subtitle: 'Активные помощники',
    gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    description: 'Это количество пользователей, которые сейчас готовы помочь. Они видят ваши заявки и могут быстро приехать на помощь.',
    features: [
      'Помощники по всей России',
      'Рейтинговая система доверия',
      'Верифицированные аккаунты',
      'Отслеживание в реальном времени'
    ],
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-20"><circle cx="120" cy="100" r="30" fill="#22c55e"/><circle cx="200" cy="100" r="30" fill="#22c55e"/><circle cx="280" cy="100" r="30" fill="#22c55e"/><circle cx="160" cy="60" r="20" fill="#4ade80"/><circle cx="240" cy="140" r="20" fill="#4ade80"/></svg>`
  },
  {
    id: 'radius',
    icon: '📍',
    title: 'Средний радиус',
    value: '1.2 км',
    subtitle: 'Расстояние до помощника',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    description: 'Среднее расстояние до ближайшего помощника. Благодаря большому сообществу, помощь всегда рядом!',
    features: [
      'Геолокация в реальном времени',
      'Автоматический поиск ближайших',
      'Отображение на карте',
      'Расчёт времени прибытия'
    ],
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-20"><circle cx="200" cy="100" r="80" fill="none" stroke="#a855f7" stroke-width="4" stroke-dasharray="10,5"/><circle cx="200" cy="100" r="50" fill="none" stroke="#c084fc" stroke-width="3" stroke-dasharray="8,4"/><circle cx="200" cy="100" r="20" fill="#a855f7"/></svg>`
  }
])

// Данные для шагов "Как это работает"
const stepsCards = ref([
  {
    id: 'step1',
    number: 1,
    icon: '📱',
    title: 'Опишите проблему',
    shortDesc: 'Укажите тип помощи, местоположение и желаемую сумму вознаграждения',
    subtitle: 'Шаг 1 из 3',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    description: 'Создайте заявку за минуту! Выберите тип проблемы (батарея, топливо, колесо), укажите ваше местоположение и сумму, которую готовы заплатить за помощь.',
    features: [
      'Выбор типа помощи из списка',
      'Автоматическое определение геолокации',
      'Добавление фото проблемы',
      'Установка своей цены'
    ]
  },
  {
    id: 'step2',
    number: 2,
    icon: '🔔',
    title: 'Получите отклики',
    shortDesc: 'Водители рядом увидят вашу заявку и предложат помощь',
    subtitle: 'Шаг 2 из 3',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    description: 'После создания заявки, все помощники в радиусе получат уведомление. Они смогут откликнуться и предложить свою помощь.',
    features: [
      'Мгновенные уведомления помощникам',
      'Просмотр рейтинга и отзывов',
      'Чат с потенциальными помощниками',
      'Выбор лучшего предложения'
    ]
  },
  {
    id: 'step3',
    number: 3,
    icon: '🤝',
    title: 'Получите помощь',
    shortDesc: 'Выберите помощника, отслеживайте его на карте и оплатите после',
    subtitle: 'Шаг 3 из 3',
    gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    description: 'Примите отклик и следите за прибытием помощника на карте. После оказания помощи - оплатите и оставьте отзыв.',
    features: [
      'Отслеживание помощника на карте',
      'Оплата только после помощи',
      'Система оценок и отзывов',
      'История всех поездок'
    ]
  }
])

// Данные для преимуществ
const featuresCards = ref([
  {
    id: 'fast',
    icon: '⚡',
    iconEmoji: '⚡',
    title: 'Быстро',
    shortDesc: 'Помощь приедет в течение 15-30 минут. Ближайшие водители сразу видят вашу заявку.',
    subtitle: 'Скорость реагирования',
    iconGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    description: 'Мы понимаем, что когда вы застряли на дороге, каждая минута на счету. Наша система мгновенно уведомляет всех ближайших помощников.',
    features: [
      'Среднее время ожидания 15-30 минут',
      'Push-уведомления помощникам',
      'Расчёт ETA в реальном времени',
      'Приоритет ближайшим помощникам'
    ]
  },
  {
    id: 'cheap',
    icon: '💰',
    iconEmoji: '💰',
    title: 'Выгодно',
    shortDesc: 'Вы сами устанавливаете цену. Никаких скрытых комиссий и наценок сервиса.',
    subtitle: 'Прозрачное ценообразование',
    iconGradient: 'bg-gradient-to-br from-green-400 to-green-600',
    gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    description: 'Никаких скрытых комиссий и наценок! Вы договариваетесь с помощником напрямую, без посредников.',
    features: [
      'Вы сами устанавливаете цену',
      'Нет комиссии сервиса',
      'Оплата напрямую помощнику',
      'Прозрачная история цен'
    ]
  },
  {
    id: 'reliable',
    icon: '🛡️',
    iconEmoji: '🛡️',
    title: 'Надёжно',
    shortDesc: 'Система рейтингов и отзывов. Только проверенные помощники.',
    subtitle: 'Безопасность и доверие',
    iconGradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    description: 'Каждый помощник имеет рейтинг и отзывы от реальных пользователей. Вы всегда знаете, кому доверяете.',
    features: [
      'Рейтинговая система помощников',
      'Реальные отзывы пользователей',
      'Верификация аккаунтов',
      'История выполненных заказов'
    ]
  }
])

// Данные для дополнительных преимуществ
const extraCards = ref([
  {
    id: 'russia',
    icon: '📍',
    title: 'Вся Россия',
    subtitle: '100+ городов',
    gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
    description: 'Наш сервис работает по всей России - от Калининграда до Владивостока. Помощники есть в более чем 100 городах.',
    features: [
      'Москва и Московская область',
      'Санкт-Петербург',
      'Все крупные города',
      'Федеральные трассы'
    ]
  },
  {
    id: 'secure',
    icon: '🔒',
    title: 'Безопасно',
    subtitle: 'SSL шифрование',
    gradient: 'bg-gradient-to-br from-green-600 to-teal-500',
    description: 'Все данные защищены современным SSL шифрованием. Ваши личные данные и платежи в безопасности.',
    features: [
      'SSL/TLS шифрование данных',
      'Защищённые платежи',
      'Конфиденциальность личных данных',
      'Защита от мошенничества'
    ]
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'Чат в приложении',
    subtitle: 'Общение без номера',
    gradient: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    description: 'Общайтесь с помощниками напрямую в приложении, не раскрывая свой номер телефона.',
    features: [
      'Встроенный чат в реальном времени',
      'Отправка фото и геолокации',
      'История переписок',
      'Приватность ваших данных'
    ]
  },
  {
    id: 'pwa',
    icon: '📱',
    title: 'PWA приложение',
    subtitle: 'Работает как нативное',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Установите приложение на домашний экран и пользуйтесь как обычным приложением - без загрузки из магазина!',
    features: [
      'Работает оффлайн',
      'Push-уведомления',
      'Установка в один клик',
      'Автоматические обновления'
    ]
  }
])

// Функция открытия универсального модального окна
function openInfoModal(item) {
  selectedInfo.value = item
}

// Данные об услугах с красочными описаниями
const services = ref([
  {
    id: 'battery',
    icon: '🔋',
    title: 'Прикуривание',
    subtitle: 'Быстрый запуск двигателя',
    description: 'Сел аккумулятор в самый неподходящий момент? Не беда! Наши помощники приедут с пуско-зарядным устройством или проводами для прикуривания и заведут ваш автомобиль за считанные минуты.',
    features: [
      'Прикуривание от другого авто',
      'Использование пускозарядного устройства',
      'Диагностика состояния АКБ',
      'Рекомендации по замене'
    ],
    price: '300-800₽',
    time: '15-30 мин',
    gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fbbf24"/>
          <stop offset="100%" style="stop-color:#ef4444"/>
        </linearGradient>
      </defs>
      <!-- Батарея -->
      <rect x="100" y="50" width="180" height="100" rx="10" fill="url(#batteryGrad)" opacity="0.8"/>
      <rect x="280" y="75" width="20" height="50" rx="5" fill="url(#batteryGrad)" opacity="0.8"/>
      <!-- Молнии -->
      <path d="M160 70 L140 100 L160 100 L140 130" stroke="#fff" stroke-width="4" fill="none"/>
      <path d="M200 70 L180 100 L200 100 L180 130" stroke="#fff" stroke-width="4" fill="none"/>
      <path d="M240 70 L220 100 L240 100 L220 130" stroke="#fff" stroke-width="4" fill="none"/>
      <!-- Кабели -->
      <path d="M50 80 Q80 80 100 90" stroke="#22c55e" stroke-width="6" fill="none"/>
      <path d="M50 120 Q80 120 100 110" stroke="#ef4444" stroke-width="6" fill="none"/>
      <circle cx="50" cy="80" r="12" fill="#22c55e"/>
      <circle cx="50" cy="120" r="12" fill="#ef4444"/>
    </svg>`
  },
  {
    id: 'fuel',
    icon: '⛽',
    title: 'Топливо',
    subtitle: 'Доставка бензина или дизеля',
    description: 'Закончилось топливо посреди дороги? Наши помощники привезут вам канистру с бензином, дизелем или газом. Быстро, удобно и без необходимости искать ближайшую АЗС.',
    features: [
      'Доставка бензина АИ-92, АИ-95, АИ-98',
      'Доставка дизельного топлива',
      'Канистра от 5 до 20 литров',
      'Помощь с заправкой'
    ],
    price: '500-1500₽',
    time: '20-40 мин',
    gradient: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="fuelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e"/>
          <stop offset="100%" style="stop-color:#14b8a6"/>
        </linearGradient>
      </defs>
      <!-- Колонка -->
      <rect x="150" y="30" width="100" height="140" rx="8" fill="url(#fuelGrad)" opacity="0.8"/>
      <rect x="160" y="45" width="80" height="40" rx="4" fill="#fff" opacity="0.3"/>
      <!-- Шланг -->
      <path d="M250 80 Q280 80 300 100 Q320 120 320 150" stroke="#1e3a5f" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Пистолет -->
      <rect x="310" y="145" width="40" height="20" rx="4" fill="#1e3a5f"/>
      <rect x="345" y="140" width="15" height="30" rx="2" fill="#1e3a5f"/>
      <!-- Капли -->
      <ellipse cx="355" cy="180" rx="4" ry="6" fill="#22c55e" opacity="0.8"/>
      <ellipse cx="350" cy="190" rx="3" ry="5" fill="#22c55e" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'tire',
    icon: '🛞',
    title: 'Колесо',
    subtitle: 'Замена или ремонт шины',
    description: 'Прокололи колесо? Нет запаски или не знаете как её поменять? Наши помощники приедут с необходимым инструментом и быстро решат проблему.',
    features: [
      'Замена колеса на запаску',
      'Ремонт прокола жгутом',
      'Подкачка колеса',
      'Помощь с домкратом'
    ],
    price: '400-1200₽',
    time: '15-45 мин',
    gradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#6366f1"/>
        </linearGradient>
      </defs>
      <!-- Колесо -->
      <circle cx="200" cy="100" r="70" fill="#1e293b" stroke="url(#tireGrad)" stroke-width="25"/>
      <circle cx="200" cy="100" r="30" fill="#64748b"/>
      <circle cx="200" cy="100" r="15" fill="#1e293b"/>
      <!-- Болты -->
      <circle cx="200" cy="80" r="4" fill="#94a3b8"/>
      <circle cx="218" cy="90" r="4" fill="#94a3b8"/>
      <circle cx="218" cy="110" r="4" fill="#94a3b8"/>
      <circle cx="200" cy="120" r="4" fill="#94a3b8"/>
      <circle cx="182" cy="110" r="4" fill="#94a3b8"/>
      <circle cx="182" cy="90" r="4" fill="#94a3b8"/>
      <!-- Гаечный ключ -->
      <rect x="300" y="60" width="60" height="12" rx="2" fill="#94a3b8" transform="rotate(45 330 66)"/>
      <circle cx="340" cy="95" r="15" fill="none" stroke="#94a3b8" stroke-width="5"/>
    </svg>`
  },
  {
    id: 'towing',
    icon: '🚗',
    title: 'Буксировка',
    subtitle: 'Транспортировка автомобиля',
    description: 'Автомобиль сломался и не может ехать самостоятельно? Наши помощники отбуксируют вас до ближайшего сервиса или до дома. Безопасно и аккуратно.',
    features: [
      'Буксировка на гибкой сцепке',
      'Буксировка на жёсткой сцепке',
      'Транспортировка до 50 км',
      'Помощь в выборе СТО'
    ],
    price: '1000-3000₽',
    time: '20-60 мин',
    gradient: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="towGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6"/>
          <stop offset="100%" style="stop-color:#0ea5e9"/>
        </linearGradient>
      </defs>
      <!-- Машина спереди -->
      <rect x="50" y="90" width="100" height="50" rx="8" fill="url(#towGrad)" opacity="0.8"/>
      <rect x="60" y="75" width="80" height="25" rx="5" fill="url(#towGrad)" opacity="0.8"/>
      <circle cx="75" cy="145" r="12" fill="#1e293b"/>
      <circle cx="135" cy="145" r="12" fill="#1e293b"/>
      <!-- Трос -->
      <line x1="150" y1="115" x2="230" y2="115" stroke="#fbbf24" stroke-width="4" stroke-dasharray="10,5"/>
      <!-- Машина сзади -->
      <rect x="230" y="90" width="120" height="50" rx="8" fill="#64748b" opacity="0.6"/>
      <rect x="245" y="75" width="90" height="25" rx="5" fill="#64748b" opacity="0.6"/>
      <circle cx="255" cy="145" r="12" fill="#1e293b"/>
      <circle cx="325" cy="145" r="12" fill="#1e293b"/>
      <!-- Восклицательный знак -->
      <circle cx="290" cy="60" r="15" fill="#ef4444"/>
      <text x="290" y="66" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">!</text>
    </svg>`
  },
  {
    id: 'sober_driver',
    icon: '🚕',
    title: 'Трезвый водитель',
    subtitle: 'Довезём вас и ваш авто',
    description: 'Выпили на вечеринке? Не рискуйте! Наш трезвый водитель отвезёт вас домой на вашем же автомобиле. Безопасно, конфиденциально, без штрафов.',
    features: [
      'Водитель с правами и опытом',
      'Доставка вас и авто домой',
      'Полная конфиденциальность',
      'Работаем круглосуточно'
    ],
    price: '800-2500₽',
    time: '15-45 мин',
    gradient: 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="driverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#eab308"/>
          <stop offset="100%" style="stop-color:#f97316"/>
        </linearGradient>
      </defs>
      <!-- Такси -->
      <rect x="100" y="80" width="180" height="70" rx="10" fill="url(#driverGrad)" opacity="0.8"/>
      <rect x="130" y="55" width="120" height="35" rx="8" fill="url(#driverGrad)" opacity="0.8"/>
      <!-- Окна -->
      <rect x="140" y="62" width="45" height="22" rx="3" fill="#87ceeb" opacity="0.7"/>
      <rect x="195" y="62" width="45" height="22" rx="3" fill="#87ceeb" opacity="0.7"/>
      <!-- Колёса -->
      <circle cx="145" cy="155" r="15" fill="#1e293b"/>
      <circle cx="235" cy="155" r="15" fill="#1e293b"/>
      <!-- Шашечки -->
      <rect x="150" y="95" width="80" height="15" fill="#1e293b"/>
      <rect x="150" y="95" width="10" height="15" fill="#fff"/>
      <rect x="170" y="95" width="10" height="15" fill="#fff"/>
      <rect x="190" y="95" width="10" height="15" fill="#fff"/>
      <rect x="210" y="95" width="10" height="15" fill="#fff"/>
      <!-- Человек -->
      <circle cx="320" cy="100" r="20" fill="#64748b"/>
      <ellipse cx="320" cy="145" rx="15" ry="25" fill="#64748b"/>
      <!-- Улыбка -->
      <path d="M312 105 Q320 112 328 105" stroke="#fff" stroke-width="2" fill="none"/>
    </svg>`
  },
  {
    id: 'other',
    icon: '🔧',
    title: 'Другое',
    subtitle: 'Любая помощь на дороге',
    description: 'Ваша проблема не подходит под стандартные категории? Ничего страшного! Опишите ситуацию, и мы найдём помощника, который сможет вам помочь.',
    features: [
      'Мелкий ремонт на месте',
      'Помощь с замком/ключом',
      'Замена лампочек и предохранителей',
      'Консультация по авто'
    ],
    price: '300-2000₽',
    time: '15-60 мин',
    gradient: 'bg-gradient-to-br from-gray-500 via-slate-500 to-zinc-600',
    illustration: `<svg viewBox="0 0 400 200" class="w-full h-full opacity-30">
      <defs>
        <linearGradient id="toolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#64748b"/>
          <stop offset="100%" style="stop-color:#475569"/>
        </linearGradient>
      </defs>
      <!-- Гаечный ключ -->
      <rect x="80" y="70" width="120" height="20" rx="3" fill="url(#toolGrad)" transform="rotate(-30 140 80)"/>
      <circle cx="95" cy="58" r="18" fill="none" stroke="url(#toolGrad)" stroke-width="10"/>
      <!-- Отвёртка -->
      <rect x="220" y="50" width="15" height="100" rx="2" fill="#f97316"/>
      <rect x="215" y="140" width="25" height="40" rx="3" fill="#1e293b"/>
      <!-- Шестерёнка -->
      <circle cx="320" cy="100" r="35" fill="url(#toolGrad)"/>
      <circle cx="320" cy="100" r="15" fill="#1e293b"/>
      <rect x="315" y="60" width="10" height="15" fill="url(#toolGrad)"/>
      <rect x="315" y="125" width="10" height="15" fill="url(#toolGrad)"/>
      <rect x="280" y="95" width="15" height="10" fill="url(#toolGrad)"/>
      <rect x="345" y="95" width="15" height="10" fill="url(#toolGrad)"/>
    </svg>`
  }
])

function openServiceModal(service) {
  selectedService.value = service
}
const isLoadingList = ref(true)
const showSidebar = ref(false) // Состояние боковой панели на мобильных

// Фильтрация по типу
const activeType = ref('all')
const typeOptions = [
  { value: 'all', label: 'Все' },
  { value: 'battery', label: 'Батарея' },
  { value: 'fuel', label: 'Топливо' },
  { value: 'tire', label: 'Колесо' },
  { value: 'towing', label: 'Эвакуатор' },
  { value: 'road_conflict', label: 'Конфликт' },
  { value: 'sober_driver', label: 'Трезвый водитель' },
  { value: 'other', label: 'Другое' },
]

const filteredRequests = computed(() => {
  if (activeType.value === 'all') return liveRequests.value
  return liveRequests.value.filter(r => r.type === activeType.value)
})

// Интервал для автообновления заявок
let refreshInterval = null

onMounted(async () => {
  // Загружаем реальные заявки из API
  await loadRequests()
  // OpenStreetMap загружается автоматически в компоненте
  setTimeout(() => { isLoadingList.value = false }, 500)
  
  // Автообновление каждые 30 секунд
  refreshInterval = setInterval(async () => {
    console.log('🔄 Автообновление заявок...')
    await loadRequests()
  }, 30000) // 30 секунд
  
  console.log('✅ Автообновление заявок включено (каждые 30 сек)')
})

onUnmounted(() => {
  // Очищаем интервал при уходе со страницы
  if (refreshInterval) {
    clearInterval(refreshInterval)
    console.log('🗑️ Автообновление заявок остановлено')
  }
})

// Загрузка заявок с сервера
async function loadRequests() {
  try {
    isLoadingList.value = true
    console.log('🔄 Загружаем активные заявки...')
    
    // Получаем геолокацию пользователя для расчета расстояния
    let userLat = null
    let userLon = null
    
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000 // Кэш 5 минут
          })
        })
        userLat = position.coords.latitude
        userLon = position.coords.longitude
        console.log('📍 Геолокация пользователя:', userLat, userLon)
      }
    } catch (geoError) {
      console.warn('⚠️ Не удалось получить геолокацию:', geoError.message)
    }
    
    // Загружаем активные заявки
    const response = await apiService.getHelpRequests({ status: 'active' })
    console.log('📦 Получено заявок:', response?.data?.length || response?.length || 0)
    
    const requestsData = response?.data || response
    if (requestsData && Array.isArray(requestsData)) {
      // Обрабатываем каждую заявку
      liveRequests.value = requestsData.map(request => {
        const problemTypeIcons = {
          battery: '🔋',
          fuel: '⛽',
          tire: '🛞',
          towing: '🚗',
          sober_driver: '🚕',
          road_conflict: '🚨',
          other: '🔧'
        }
        
        const problemTypeNames = {
          battery: 'Севшая батарея',
          fuel: 'Нет топлива',
          tire: 'Прокол колеса',
          towing: 'Буксировка',
          sober_driver: 'Трезвый водитель',
          road_conflict: 'Конфликт на дороге',
          other: 'Другое'
        }
        
        const type = request.problem_type || request.type || 'other'
        const icon = problemTypeIcons[type] || '❓'
        const typeName = problemTypeNames[type] || 'Помощь'
        
        // Рассчитываем расстояние если есть геолокация
        let distance = '—'
        if (userLat && userLon && request.latitude && request.longitude) {
          const distKm = calculateDistance(
            userLat, userLon,
            parseFloat(request.latitude), parseFloat(request.longitude)
          )
          distance = distKm < 1 ? `${Math.round(distKm * 1000)} м` : `${distKm.toFixed(1)} км`
        }
        
        // Нормализуем поле даты
        const createdDate = request.createdAt || request.created_at
        console.log('📅 Дата заявки:', request.id, '- createdAt:', request.createdAt, 'created_at:', request.created_at, 'parsed:', createdDate)
        
        return {
          id: request.id,
          user_id: request.user_id, // ID автора заявки
          type: type,
          title: `${icon} ${typeName}`,
          description: request.description || 'Требуется помощь',
          amount: request.amount || 0,
          distance: distance,
          lat: parseFloat(request.latitude),
          lon: parseFloat(request.longitude),
          address: request.address,
          created_at: createdDate,
          status: request.status
        }
      })
      
      // Сортируем по дате создания (новые сверху)
      liveRequests.value.sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return dateB - dateA
      })
      
      console.log('✅ Заявки загружены и отсортированы:', liveRequests.value.length)
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки заявок:', error)
    // В случае ошибки оставляем пустой массив
    liveRequests.value = []
  } finally {
    isLoadingList.value = false
  }
}

// Показать детали запроса с фокусом на карте
function showRequestDetails(request) {
  console.log('🎯 Показываем детали запроса:', request.title)
  
  // Устанавливаем выбранный запрос (откроется модальное окно)
  selectedRequest.value = request
  
  // Закрываем боковую панель на мобильных при открытии модалки
  showSidebar.value = false
  
  // Приближаем карту к запросу в фоне
  if (mapRef.value && mapRef.value.focusOnRequest) {
    mapRef.value.focusOnRequest(request)
  }
}

// Функция для фокусировки на запросе (старая, для совместимости)
// function focusOnRequest(request) {
//   showRequestDetails(request)
// }

function onMapReady() {
  // Можно показать toast или убрать skeleton (handled by Suspense)
}

// Загрузка данных модалки (демо-симуляция запроса к бэку)
const isLoadingModal = ref(false)

function _buildRouteToSelected() {
  if (!selectedRequest.value || !mapRef.value || !mapRef.value.buildRoute) return
  isLoadingModal.value = true
  // эмулируем подгрузку деталей
  setTimeout(async () => {
    try {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
        })
        const from = [pos.coords.latitude, pos.coords.longitude]
        const to = [selectedRequest.value.lat, selectedRequest.value.lon]
        await mapRef.value.buildRoute(from, to)
      }
    } catch (error) {
      console.warn('Route build error:', error)
    }
    isLoadingModal.value = false
  }, 600)
}

async function shareSelected() {
  if (!selectedRequest.value) return
  const url = `${window.location.origin}/responses/${selectedRequest.value.id}`
  if (navigator.share) {
    try {
      await navigator.share({ title: selectedRequest.value.title, text: selectedRequest.value.description, url })
    } catch (err) {
      // Пользователь отменил или произошла ошибка - пробуем скопировать в буфер
      if (err.name !== 'AbortError') {
        console.warn('Share failed, trying clipboard:', err)
        try {
          await navigator.clipboard.writeText(url)
          alert('Ссылка скопирована')
        } catch (clipboardErr) {
          console.error('Clipboard write failed:', clipboardErr)
          alert('Не удалось поделиться или скопировать ссылку')
        }
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(url)
      alert('Ссылка скопирована')
    } catch (err) {
      console.error('Clipboard write failed:', err)
      alert('Не удалось скопировать ссылку')
    }
  }
}

function getIcon(type) {
  const icons = { battery: '🔋', fuel: '⛽', tire: '🛞', towing: '🚗', road_conflict: '🚨', other: '🔧' }
  return icons[type] || '❓'
}

function getIconGradient(type) {
  const gradients = {
    battery: 'bg-gradient-to-br from-orange-400 to-red-600',
    fuel: 'bg-gradient-to-br from-green-400 to-green-600',
    tire: 'bg-gradient-to-br from-purple-400 to-purple-600',
    towing: 'bg-gradient-to-br from-blue-400 to-blue-600',
    road_conflict: 'bg-gradient-to-br from-red-400 to-red-600',
    other: 'bg-gradient-to-br from-gray-400 to-gray-600'
  }
  return gradients[type] || 'bg-gradient-to-br from-gray-400 to-gray-600'
}
</script>

<style scoped>
.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 100px;
  height: 80px;
  width: 200px;
  animation: float-cloud 80s linear infinite;
}

.cloud::before, .cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 100px;
}

.cloud::before {
  width: 120px;
  height: 100px;
  top: -50px;
  left: 30px;
}

.cloud::after {
  width: 140px;
  height: 90px;
  top: -40px;
  right: 30px;
}

.cloud-1 {
  top: 15%;
  left: -15%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 35%;
  left: -20%;
  animation-delay: 27s;
  transform: scale(0.8);
}

.cloud-3 {
  top: 55%;
  left: -25%;
  animation-delay: 54s;
  transform: scale(1.2);
}

@keyframes float-cloud {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(100vw + 300px)); }
}

@keyframes road-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
}

@keyframes slide-up {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out;
}

/* Анимация появления для карточек */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.35s ease-out; }

/* Скелетоны */
.skeleton {
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* Анимация модального окна */
.modal-enter-active {
  transition: opacity 0.25s ease-out;
}
.modal-enter-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out;
}
.modal-leave-active {
  transition: opacity 0.2s ease-in;
}
.modal-leave-active > div {
  transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > div {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Анимация модального окна услуг */
.service-modal-enter-active {
  transition: opacity 0.3s ease-out;
}
.service-modal-enter-active > div {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out;
}
.service-modal-leave-active {
  transition: opacity 0.2s ease-in;
}
.service-modal-leave-active > div {
  transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}
.service-modal-enter-from {
  opacity: 0;
}
.service-modal-enter-from > div {
  transform: scale(0.8) translateY(40px);
  opacity: 0;
}
.service-modal-leave-to {
  opacity: 0;
}
.service-modal-leave-to > div {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
