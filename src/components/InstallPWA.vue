<template>
  <div class="install-pwa-section">
    <!-- Показываем только если PWA не установлено -->
    <div
      v-if="!isStandalone"
      class="install-card"
    >
      <div class="install-content">
        <div class="install-header">
          <div class="install-icon">
            <svg
              class="w-12 h-12 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div class="install-text">
            <h2 class="install-title">
              📱 Установите приложение
            </h2>
            <p class="install-description">
              Быстрая помощь на дорогах всегда под рукой!
            </p>
          </div>
        </div>
        <div class="install-benefits">
          <span class="benefit">⚡ Мгновенный запуск</span>
          <span class="benefit">🔔 Push-уведомления</span>
          <span class="benefit">💾 Работает офлайн</span>
        </div>
        <button
          class="install-button"
          :disabled="!canInstall && !deferredPrompt"
          @click="handleInstall"
        >
          <svg
            class="w-5 h-5"
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
          {{ installButtonText }}
        </button>
        <p
          v-if="!canInstall && !deferredPrompt"
          class="install-hint"
        >
          {{ platformHint }}
        </p>
      </div>
    </div>

    <!-- Плавающая кнопка быстрой установки -->
    <Transition name="fab">
      <button
        v-if="!isStandalone && showFloatingButton"
        class="floating-install-button"
        :class="{ 'fab-ios': platform === 'ios' }"
        aria-label="Установить приложение"
        @click="handleFloatingInstall"
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
            stroke-width="2.5"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span class="fab-text">Установить</span>
      </button>
    </Transition>

    <!-- iOS инструкция (модальное окно) -->
    <Transition name="modal">
      <div
        v-if="showIOSInstructions"
        class="modal-backdrop"
        @click="showIOSInstructions = false"
      >
        <div
          class="modal-content"
          @click.stop
        >
          <div class="modal-header">
            <h3 class="modal-title">
              📱 Установка на iOS
            </h3>
            <button
              class="modal-close"
              aria-label="Закрыть"
              @click="showIOSInstructions = false"
            >
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="instruction-step">
              <div class="step-number">
                1
              </div>
              <div class="step-text">
                <strong>Откройте Safari</strong><br>
                Приложение можно установить только из Safari
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">
                2
              </div>
              <div class="step-text">
                <strong>Нажмите на кнопку "Поделиться"</strong><br>
                <span style="font-size: 24px;">⬆️</span> (внизу экрана в Safari)
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">
                3
              </div>
              <div class="step-text">
                <strong>Выберите "На экран Домой"</strong><br>
                Прокрутите список и найдите этот пункт
              </div>
            </div>
            <div class="instruction-step">
              <div class="step-number">
                4
              </div>
              <div class="step-text">
                <strong>Нажмите "Добавить"</strong><br>
                Готово! Иконка появится на главном экране
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const deferredPrompt = ref(null)
const canInstall = ref(false)
const isStandalone = ref(false)
const platform = ref('desktop')
const showFloatingButton = ref(false)
const showIOSInstructions = ref(false)

onMounted(() => {
  detectPlatform()
  checkIfStandalone()
  setupPWAPrompt()
  
  // Показываем плавающую кнопку через 3 секунды для новых пользователей
  setTimeout(() => {
    if (!isStandalone.value && !localStorage.getItem('pwa-install-dismissed')) {
      showFloatingButton.value = true
    }
  }, 3000)
})

// Определение платформы
function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  
  if (/android/i.test(ua)) {
    platform.value = 'android'
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    platform.value = 'ios'
  } else {
    platform.value = 'desktop'
  }
}

// Проверка standalone режима
function checkIfStandalone() {
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true
}

// Настройка PWA промпта
function setupPWAPrompt() {
  console.log('🔧 [PWA] Настройка установки PWA, платформа:', platform.value)
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ [PWA] beforeinstallprompt event получен!')
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
  })
  
  window.addEventListener('appinstalled', () => {
    console.log('✅ [PWA] Приложение установлено')
    isStandalone.value = true
    canInstall.value = false
    deferredPrompt.value = null
  })
  
  // Проверка через 2 секунды
  setTimeout(() => {
    if (!deferredPrompt.value) {
      console.warn('⚠️ [PWA] beforeinstallprompt НЕ сработал. Возможные причины:')
      console.warn('  1. PWA уже установлено (isStandalone:', isStandalone.value + ')')
      console.warn('  2. Браузер уже показывал промпт и пользователь отклонил')
      console.warn('  3. PWA критерии не выполнены (manifest/SW/HTTPS)')
      console.warn('  4. Не Chrome/Edge браузер')
      console.warn('  5. User-Agent:', navigator.userAgent)
    } else {
      console.log('✅ [PWA] deferredPrompt готов к использованию')
    }
  }, 2000)
}

// Обработка установки
async function handleInstall() {
  console.log('👆 [PWA] Клик на кнопку установки')
  console.log('   deferredPrompt:', deferredPrompt.value ? '✅ есть' : '❌ нет')
  console.log('   platform:', platform.value)
  console.log('   isStandalone:', isStandalone.value)
  
  // Если есть deferredPrompt - используем нативный промпт
  if (deferredPrompt.value) {
    console.log('✅ [PWA] Запуск нативного промпта установки')
    try {
      // Показываем нативный промпт установки
      await deferredPrompt.value.prompt()
      
      // Ждём ответа пользователя
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ Пользователь принял установку')
        showFloatingButton.value = false
        localStorage.setItem('pwa-install-dismissed', 'true')
      } else {
        console.log('❌ Пользователь отклонил установку')
      }
      
      deferredPrompt.value = null
      canInstall.value = false
    } catch (error) {
      console.error('Ошибка установки PWA:', error)
    }
    return
  }

  // Если deferredPrompt недоступен - показываем инструкции
  console.log('⚠️ [PWA] deferredPrompt недоступен, показываем инструкцию')
  
  if (platform.value === 'ios') {
    // Для iOS показываем модальное окно с инструкцией
    showIOSInstructions.value = true
  } else if (platform.value === 'android') {
    // Для Android показываем alert с подсказкой
    alert('Откройте меню браузера Chrome:\n\n1. Нажмите на три точки (⋮) в правом верхнем углу\n2. Выберите "Добавить на главный экран"\n3. Нажмите "Добавить"')
  } else {
    // Для десктопа
    alert('Откройте сайт с мобильного устройства для установки приложения')
  }
}

// Обработка плавающей кнопки
function handleFloatingInstall() {
  if (platform.value === 'ios') {
    // Для iOS показываем инструкцию
    showIOSInstructions.value = true
  } else if (deferredPrompt.value) {
    // Для других платформ используем стандартную установку
    handleInstall()
  } else {
    // Если промпт недоступен, показываем подсказку
    if (platform.value === 'android') {
      alert('Откройте меню браузера Chrome → "Добавить на главный экран"')
    } else {
      alert('Откройте сайт с мобильного устройства для установки')
    }
  }
}

// Текст кнопки
const installButtonText = computed(() => {
  if (deferredPrompt.value) {
    return 'Установить приложение'
  }
  if (platform.value === 'ios') {
    return 'Показать инструкцию'
  }
  if (platform.value === 'android') {
    return 'Показать инструкцию'
  }
  return 'Открыть с телефона'
})

// Подсказка для платформы
const platformHint = computed(() => {
  if (platform.value === 'android') {
    return 'Chrome → Меню → "Добавить на главный экран"'
  } else if (platform.value === 'ios') {
    return 'Safari → Поделиться → "На экран Домой"'
  }
  return 'Откройте сайт с телефона для установки'
})
</script>

<style scoped>
.install-pwa-section {
  width: 100%;
}

.install-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.install-content {
  max-width: 800px;
  margin: 0 auto;
}

.install-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.install-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.install-icon svg {
  color: white;
}

.install-text {
  flex: 1;
}

.install-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #111827;
}

.install-description {
  font-size: 16px;
  margin: 0;
  color: #6b7280;
}

.install-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.benefit {
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.install-button {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 16px 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.install-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.install-button:active:not(:disabled) {
  transform: translateY(0);
}

.install-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.install-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

@media (max-width: 640px) {
  .install-card {
    padding: 24px 20px;
  }
  
  .install-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .install-title {
    font-size: 20px;
  }
  
  .install-description {
    font-size: 14px;
  }
  
  .install-benefits {
    flex-direction: column;
    gap: 8px;
  }
  
  .install-button {
    font-size: 16px;
    padding: 14px 24px;
  }
}

/* Плавающая кнопка */
.floating-install-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  z-index: 1000;
  transition: all 0.3s;
}

.floating-install-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.6);
}

.floating-install-button:active {
  transform: translateY(-1px);
}

.floating-install-button.fab-ios {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.5);
}

.fab-text {
  white-space: nowrap;
}

/* Анимация плавающей кнопки */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fab-enter-from {
  transform: translateY(100px) scale(0);
  opacity: 0;
}

.fab-leave-to {
  transform: translateY(100px) scale(0);
  opacity: 0;
}

/* Модальное окно iOS */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
}

.modal-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 24px;
}

.instruction-step {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.instruction-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  line-height: 1.6;
  color: #374151;
}

.step-text strong {
  display: block;
  color: #111827;
  margin-bottom: 4px;
}

/* Анимация модального окна */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-enter-from .modal-content {
  transform: scale(0.8) translateY(50px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: scale(0.8) translateY(50px);
  opacity: 0;
}

@media (max-width: 640px) {
  .floating-install-button {
    bottom: 20px;
    right: 20px;
    left: 20px;
    justify-content: center;
  }
  
  .modal-backdrop {
    padding: 0;
  }
  
  .modal-content {
    border-radius: 0;
    max-width: 100%;
    height: 100%;
  }
  
  .modal-body {
    overflow-y: auto;
    max-height: calc(100vh - 90px);
  }
}
</style>
