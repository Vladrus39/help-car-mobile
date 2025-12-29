<template>
  <div class="mobile-apps-section">
    <!-- Компактная версия (для встраивания) -->
    <div
      v-if="compact"
      class="compact-version"
    >
      <div class="flex items-center justify-center gap-4">
        <!-- Если пользователь уже на мобильном - показываем только его платформу -->
        <button 
          v-if="!isMobile || userPlatform === 'android'"
          class="download-btn android-btn"
          :class="{ 'opacity-50 cursor-not-allowed': checking }"
          :disabled="checking"
          @click="triggerBuildAndDownload('android')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z" />
          </svg>
          <span class="font-bold text-sm">
            {{ checking ? 'Проверка...' : (androidBuilding ? 'Собираем...' : (androidReady ? 'Скачать Android' : 'Собрать Android')) }}
          </span>
        </button>
        
        <button 
          v-if="!isMobile || userPlatform === 'ios'"
          class="download-btn ios-btn"
          :class="{ 'opacity-50 cursor-not-allowed': checking }"
          :disabled="checking"
          @click="triggerBuildAndDownload('ios')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.25,3.51,7.59,9.05,7.31c1.35,0.07,2.29,0.74,3.08,0.8c1.18-0.24,2.31-0.93,3.57-0.84c1.51,0.12,2.65,0.72,3.4,1.8 c-3.12,1.87-2.38,5.98,0.48,7.13c-0.57,1.5-1.31,2.99-2.54,4.09L17.05,20.28z M12.03,7.25c-0.15-2.23,1.66-4.07,3.74-4.25 c0.29,2.58-2.34,4.5-3.74,4.25z" />
          </svg>
          <span class="font-bold text-sm">
            {{ checking ? 'Проверка...' : (iosBuilding ? 'Собираем...' : (iosReady ? 'Скачать iOS' : 'Собрать iOS')) }}
          </span>
        </button>
        
        <!-- Сообщение для мобильных пользователей -->
        <div
          v-if="isMobile && !androidReady && !iosReady"
          class="text-center text-sm text-gray-600"
        >
          <p class="font-semibold">
            📱 Вы уже используете веб-версию!
          </p>
          <p class="text-xs mt-1">
            Приложения ещё не собраны
          </p>
        </div>
      </div>
    </div>

    <!-- Полная версия (секция на странице) -->
    <div
      v-else
      class="full-version"
    >
      <div class="text-center mb-12">
        <h2 class="text-5xl font-black mb-6 text-gray-900">
          📱 Мобильное приложение
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto font-semibold">
          Выберите способ установки: PWA (быстро) или Native (полнофункционально)
        </p>
      </div>
      
      <!-- ВАРИАНТ 1: PWA - БЫСТРАЯ УСТАНОВКА -->
      <div class="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200">
        <div class="text-center mb-6">
          <div class="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold mb-4">
            ⚡ РЕКОМЕНДУЕМ
          </div>
          <h3 class="text-3xl font-black mb-2 text-gray-900">
            Быстрая установка (PWA)
          </h3>
          <p class="text-gray-600 font-semibold">
            Установите за 3 секунды прямо из браузера!
          </p>
        </div>
        <!-- Простая кнопка установки прямо под текстом -->
        <div class="text-center mb-8">
          <button
            v-if="!isStandalone"
            class="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            @click="handleInstall"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{{ deferredPrompt ? 'Установить приложение' : 'Показать инструкцию' }}</span>
          </button>
          <div
            v-else
            class="inline-flex items-center gap-2 px-10 py-4 bg-green-100 text-green-800 rounded-2xl font-black text-lg"
          >
            <span>✅ Приложение установлено</span>
          </div>
        </div>
        <div class="mt-6 grid md:grid-cols-3 gap-4 text-sm">
          <div class="text-center p-4 bg-white rounded-xl shadow">
            <div class="text-2xl mb-2">
              ⚡
            </div>
            <strong>Моментально</strong>
            <p class="text-gray-600 text-xs mt-1">
              Установка за 3 секунды
            </p>
          </div>
          <div class="text-center p-4 bg-white rounded-xl shadow">
            <div class="text-2xl mb-2">
              🔄
            </div>
            <strong>Автообновления</strong>
            <p class="text-gray-600 text-xs mt-1">
              Всегда актуальная версия
            </p>
          </div>
          <div class="text-center p-4 bg-white rounded-xl shadow">
            <div class="text-2xl mb-2">
              📦
            </div>
            <strong>~500 KB</strong>
            <p class="text-gray-600 text-xs mt-1">
              Минимальный размер
            </p>
          </div>
        </div>
      </div>
      
      <!-- ВАРИАНТ 2: NATIVE ПРИЛОЖЕНИЯ - АВТОСБОРКА -->
      <div class="bg-white rounded-3xl p-8 border-2 border-gray-200">
        <div class="text-center mb-8">
          <h3 class="text-3xl font-black mb-2 text-gray-900">
            Нативные приложения
          </h3>
          <p class="text-gray-600 font-semibold">
            Полнофункциональные APK и IPA с автоматической сборкой
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Android -->
          <div class="platform-card android-card">
            <div class="icon-wrapper">
              <svg
                class="w-20 h-20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z" />
              </svg>
            </div>
          
            <h3 class="text-3xl font-black mb-4 text-gray-900">
              Android
            </h3>
          
            <ul class="text-left space-y-2 mb-6 text-gray-700">
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>Android 5.0 и выше</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>Размер: ~{{ androidSize }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>Версия: {{ appVersion }}</span>
              </li>
            </ul>
          
            <!-- Прогресс сборки -->
            <div
              v-if="androidBuilding"
              class="mb-4"
            >
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
                  :style="{ width: androidProgress + '%' }"
                />
              </div>
              <p class="text-sm text-gray-600 mt-2 text-center font-semibold">
                🔨 Сборка: {{ androidProgress }}% 
                <span v-if="androidProgress < 50">(Подготовка...)</span>
                <span v-else-if="androidProgress < 90">(Компиляция...)</span>
                <span v-else>(Финализация...)</span>
              </p>
            </div>
          
            <button 
              class="download-button android-btn"
              :class="{ 'opacity-50 cursor-wait': androidBuilding }"
              :disabled="androidBuilding"
              @click="triggerBuildAndDownload('android')"
            >
              <svg
                v-if="!androidBuilding"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ androidBuilding ? 'Собираем APK...' : (androidReady ? 'Скачать APK' : 'Собрать и скачать APK') }}
            </button>
          
            <p class="text-sm text-gray-500 mt-4">
              {{ androidBuilding ? '⏳ Ожидайте 3-5 минут' : 'Автоматическая сборка и установка' }}
            </p>
          </div>

          <!-- iOS -->
          <div class="platform-card ios-card">
            <div class="icon-wrapper">
              <svg
                class="w-20 h-20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.25,3.51,7.59,9.05,7.31c1.35,0.07,2.29,0.74,3.08,0.8c1.18-0.24,2.31-0.93,3.57-0.84c1.51,0.12,2.65,0.72,3.4,1.8 c-3.12,1.87-2.38,5.98,0.48,7.13c-0.57,1.5-1.31,2.99-2.54,4.09L17.05,20.28z M12.03,7.25c-0.15-2.23,1.66-4.07,3.74-4.25 c0.29,2.58-2.34,4.5-3.74,4.25z" />
              </svg>
            </div>
          
            <h3 class="text-3xl font-black mb-4 text-gray-900">
              iOS
            </h3>
          
            <ul class="text-left space-y-2 mb-6 text-gray-700">
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>iOS 12.0 и выше</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>Размер: ~{{ iosSize }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <span>Версия: {{ appVersion }}</span>
              </li>
            </ul>
          
            <!-- Прогресс сборки -->
            <div
              v-if="iosBuilding"
              class="mb-4"
            >
              <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-black to-gray-700 h-full transition-all duration-500"
                  :style="{ width: iosProgress + '%' }"
                />
              </div>
              <p class="text-sm text-gray-600 mt-2 text-center font-semibold">
                🔨 Сборка: {{ iosProgress }}%
                <span v-if="iosProgress < 50">(Подготовка...)</span>
                <span v-else-if="iosProgress < 90">(Компиляция...)</span>
                <span v-else>(Финализация...)</span>
              </p>
            </div>
          
            <button 
              class="download-button ios-btn"
              :class="{ 'opacity-50 cursor-wait': iosBuilding }"
              :disabled="iosBuilding"
              @click="triggerBuildAndDownload('ios')"
            >
              <svg
                v-if="!iosBuilding"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ iosBuilding ? 'Собираем IPA...' : (iosReady ? 'Скачать IPA' : 'Собрать и скачать IPA') }}
            </button>
          
            <p class="text-sm text-gray-500 mt-4">
              {{ iosBuilding ? '⏳ Ожидайте 5-10 минут (только macOS)' : 'Автоматическая сборка и установка' }}
            </p>
          </div>
        </div>

        <!-- Ошибка сборки -->
        <div
          v-if="buildError"
          class="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6"
        >
          <h4 class="text-xl font-black text-red-700 mb-2">
            ❌ Ошибка сборки
          </h4>
          <p class="text-red-600 font-semibold">
            {{ buildError }}
          </p>
          <p class="text-sm text-gray-600 mt-3">
            Используйте <strong>PWA вариант выше</strong> - он работает без установки дополнительных программ!
          </p>
        </div>
      </div>
      
      <!-- Инструкции по установке -->
      <div class="mt-12 bg-blue-50 rounded-2xl p-8">
        <h3 class="text-2xl font-black mb-4 text-gray-900">
          📖 Инструкция по установке
        </h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h4 class="font-bold text-lg mb-3 text-gray-800">
              🤖 Android:
            </h4>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Скачайте файл <strong>Help-Car-universal.apk</strong></li>
              <li>Откройте «Настройки» → «Безопасность»</li>
              <li>Разрешите установку из неизвестных источников</li>
              <li>Найдите скачанный APK и откройте его</li>
              <li>Нажмите «Установить» и следуйте инструкциям</li>
            </ol>
          </div>
          
          <div>
            <h4 class="font-bold text-lg mb-3 text-gray-800">
              🍎 iOS:
            </h4>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Скачайте <strong>AltStore</strong> или <strong>Sideloadly</strong></li>
              <li>Подключите iPhone к компьютеру</li>
              <li>Откройте IPA файл в программе</li>
              <li>Введите Apple ID (используется локально)</li>
              <li>Дождитесь установки приложения</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import InstallPWA from './InstallPWA.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

// Версия приложения (из package.json или hardcoded)
const appVersion = ref('1.0.0')
const androidSize = ref('25 MB')
const iosSize = ref('30 MB')

// Определение платформы пользователя
const userPlatform = ref('desktop')
const isMobile = ref(false)

// Статус готовности приложений
const androidReady = ref(false)
const iosReady = ref(false)
const checking = ref(true)

// Статус сборки
const androidBuilding = ref(false)
const iosBuilding = ref(false)
const androidProgress = ref(0)
const iosProgress = ref(0)
const buildError = ref(null)

// PWA установка
const deferredPrompt = ref(null)
const isStandalone = ref(false)

onMounted(async () => {
  detectPlatform()
  await checkAppsStatus()
  checkIfStandalone()
  setupPWAPrompt()
})

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  
  if (/android/i.test(ua)) {
    userPlatform.value = 'android'
    isMobile.value = true
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    userPlatform.value = 'ios'
    isMobile.value = true
  } else {
    userPlatform.value = 'desktop'
    isMobile.value = false
  }
  
  console.log('📱 Определена платформа:', userPlatform.value)
}

// Проверка standalone режима
function checkIfStandalone() {
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true
}

// Настройка PWA промпта
function setupPWAPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ beforeinstallprompt событие получено!')
    e.preventDefault()
    deferredPrompt.value = e
    console.log('💾 deferredPrompt сохранён')
  })
  
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA установлено!')
    isStandalone.value = true
    deferredPrompt.value = null
  })
  
  // Проверяем через небольшую задержку, если событие уже произошло
  setTimeout(() => {
    if (!deferredPrompt.value && !isStandalone.value) {
      console.log('⚠️ beforeinstallprompt не получен - возможно браузер не поддерживает или PWA уже установлено')
    }
  }, 1000)
}

// Обработка установки PWA
async function handleInstall() {
  console.log('🔘 Кнопка установки нажата!')
  console.log('deferredPrompt:', deferredPrompt.value)
  console.log('isStandalone:', isStandalone.value)
  
  // Если PWA уже установлено
  if (isStandalone.value) {
    alert('✅ Приложение уже установлено!')
    return
  }
  
  // Если нет нативного промпта - показываем инструкции
  if (!deferredPrompt.value) {
    console.log('⚠️ Нет deferredPrompt, показываем инструкции')
    showInstructions()
    return
  }
  
  try {
    console.log('📱 Вызываем нативный промпт установки...')
    await deferredPrompt.value.prompt()
    
    console.log('⏳ Ждём ответа пользователя...')
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      console.log('✅ Пользователь принял установку')
      alert('✅ Установка началась! Приложение будет установлено через несколько секунд.')
    } else {
      console.log('❌ Пользователь отклонил установку')
      alert('Установка отменена. Вы можете установить приложение позже.')
    }
    
    deferredPrompt.value = null
  } catch (error) {
    console.error('❌ Ошибка установки PWA:', error)
    alert('Автоматическая установка недоступна. Показываю инструкцию...')
    showInstructions()
  }
}

// Показать инструкции
function showInstructions() {
  let instructions = ''
  
  if (userPlatform.value === 'android') {
    instructions = `📱 Для установки на Android:

1. Нажмите ⋮ (меню) в Chrome
2. Выберите "Добавить на главный экран"
3. Нажмите "Установить"
4. Готово! 🎉`
  } else if (userPlatform.value === 'ios') {
    instructions = `📱 Для установки на iOS:

1. Нажмите 🔼 (Поделиться) в Safari
2. Прокрутите вниз
3. Выберите "На экран Домой"
4. Нажмите "Добавить"
5. Готово! 🎉`
  } else {
    instructions = `💻 Откройте сайт с телефона для установки PWA:

🤖 Android: Chrome → Меню → "Добавить на главный экран"
🍎 iOS: Safari → Поделиться → "На экран Домой"`
  }
  
  alert(instructions)
}

async function checkAppsStatus() {
  try {
    const base = `${window.location.origin}/api/v1`
    // Проверяем Android
    const androidResponse = await fetch(`${base}/mobile/status/android`)
    const androidData = await androidResponse.json()
    androidReady.value = androidData.ready || false
    if (androidData.size) androidSize.value = androidData.size
    
    // Проверяем iOS
    const iosResponse = await fetch(`${base}/mobile/status/ios`)
    const iosData = await iosResponse.json()
    iosReady.value = iosData.ready || false
    if (iosData.size) iosSize.value = iosData.size
    
    console.log('✅ Статус приложений:', { android: androidReady.value, ios: iosReady.value })
  } catch (error) {
    console.warn('⚠️ Не удалось проверить статус приложений:', error)
    // Fallback - предполагаем что не готовы
    androidReady.value = false
    iosReady.value = false
  } finally {
    checking.value = false
  }
}

// Запуск автосборки и скачивания
async function triggerBuildAndDownload(platform) {
  console.log(`🎯 КЛИК НА КНОПКУ: ${platform}`)
  console.log(`📊 Статус: androidReady=${androidReady.value}, iosReady=${iosReady.value}`)
  console.log(`🚀 Запуск автосборки ${platform} приложения...`)
  
  const isReady = platform === 'android' ? androidReady.value : iosReady.value
  
  // Если уже собрано - сразу скачиваем
  if (isReady) {
    const base = `${window.location.origin}/api/v1`
    const downloadUrl = `${base}/mobile/download/${platform}`
    console.log(`✅ ${platform} уже готов, скачиваем...`)
    console.log(`📥 URL: ${downloadUrl}`)
    window.location.href = downloadUrl
    return
  }
  
  // Запускаем сборку
  try {
    buildError.value = null
    
    if (platform === 'android') {
      androidBuilding.value = true
      androidProgress.value = 0
    } else {
      iosBuilding.value = true
      iosProgress.value = 0
    }
    
    const base = `${window.location.origin}/api/v1`
    const response = await fetch(`${base}/build/trigger/${platform}?t=${Date.now()}`,
      {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
    
    const data = await response.json()
    
    if (data.ready) {
      // Уже собрано, скачиваем
      window.location.href = data.downloadUrl
      return
    }
    
    if (data.building) {
      // Сборка началась, отслеживаем прогресс
      console.log(`⏳ Сборка ${platform} запущена. Примерное время: ${data.estimatedTime}`)
      trackBuildProgress(platform)
    }
    
  } catch (error) {
    console.error(`❌ Ошибка запуска сборки:`, error)
    buildError.value = `Ошибка: ${error.message}`
    
    if (platform === 'android') {
      androidBuilding.value = false
    } else {
      iosBuilding.value = false
    }
  }
}

// Отслеживание прогресса сборки
async function trackBuildProgress(platform) {
  const checkInterval = setInterval(async () => {
    try {
      const base = `${window.location.origin}/api/v1`
      const response = await fetch(`${base}/build/status/${platform}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-store'
        }
      })
      const data = await response.json()
      
      if (platform === 'android') {
        androidProgress.value = data.progress || 0
      } else {
        iosProgress.value = data.progress || 0
      }
      
      if (data.error) {
        clearInterval(checkInterval)
        buildError.value = data.error
        
        if (platform === 'android') {
          androidBuilding.value = false
        } else {
          iosBuilding.value = false
        }
        return
      }
      
      if (data.ready && data.downloadUrl) {
        clearInterval(checkInterval)
        
        if (platform === 'android') {
          androidBuilding.value = false
          androidReady.value = true
        } else {
          iosBuilding.value = false
          iosReady.value = true
        }
        
        console.log(`✅ ${platform} сборка завершена! Начинаем скачивание...`)
        
        // Автоматически скачиваем
        // Принудительное скачивание через создание скрытой ссылки
        setTimeout(() => {
          const a = document.createElement('a')
          a.href = `${window.location.origin}${data.downloadUrl}?t=${Date.now()}`
          a.download = ''
          a.rel = 'noopener'
          document.body.appendChild(a)
          a.click()
          a.remove()
        }, 700)
      }
      
    } catch (error) {
      console.error('Ошибка проверки статуса:', error)
    }
  }, 2000) // Проверяем каждые 2 секунды
}

// Старая функция для совместимости
// Текст для кнопки в зависимости от готовности
// function getButtonText(platform) {
//   const isReady = platform === 'android' ? androidReady.value : iosReady.value
//   
//   if (checking.value) {
//     return 'Проверка...'
//   }
//   
//   if (!isReady) {
//     return 'Не готово (собрать)'
//   }
//   
//   return platform === 'android' ? 'Скачать APK' : 'Скачать IPA'
// }
</script>

<style scoped>
.mobile-apps-section {
  width: 100%;
}

/* Компактная версия */
.compact-version {
  display: flex;
  justify-content: center;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.android-btn {
  background: linear-gradient(135deg, #3ddc84 0%, #30d158 100%);
  color: white;
}

.ios-btn {
  background: linear-gradient(135deg, #000000 0%, #434343 100%);
  color: white;
}

/* Полная версия */
.full-version {
  padding: 40px 0;
}

.platform-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  text-align: center;
}

.platform-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.android-card .icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #3ddc84 0%, #30d158 100%);
  border-radius: 30px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 8px 20px rgba(61, 220, 132, 0.3);
}

.ios-card .icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #000000 0%, #434343 100%);
  border-radius: 30px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.download-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  transition: all 0.3s;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.android-card .download-button {
  background: linear-gradient(135deg, #3ddc84 0%, #30d158 100%);
  color: white;
}

.ios-card .download-button {
  background: linear-gradient(135deg, #000000 0%, #434343 100%);
  color: white;
}
</style>

