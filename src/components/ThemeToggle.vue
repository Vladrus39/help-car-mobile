<template>
  <!-- Скрываем на мобильных - тема переключается в ProfileView -->
  <div class="theme-toggle-container hidden sm:block">
    <!-- Кнопка переключателя -->
    <button
      ref="buttonRef"
      class="theme-toggle-button"
      :class="{ 'menu-open': showMenu }"
      :title="getThemeTitle()"
      aria-label="Переключить тему"
      @click="toggleMenu"
    >
      <div class="theme-icon-wrapper">
        <!-- Солнце (светлая тема) -->
        <svg
          v-if="themeMode === 'light'"
          class="theme-icon sun-icon"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
        
        <!-- Луна (темная тема) -->
        <svg
          v-else-if="themeMode === 'dark'"
          class="theme-icon moon-icon"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10 10 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clip-rule="evenodd"
          />
        </svg>
        
        <!-- Системная тема -->
        <svg
          v-else
          class="theme-icon system-icon"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      </div>
    </button>

    <!-- Меню выбора темы -->
    <Transition name="theme-menu">
      <div
        v-if="showMenu"
        ref="menuRef"
        class="theme-menu"
      >
        <div class="theme-menu-header">
          <span class="theme-menu-title">Тема</span>
          <button
            class="theme-menu-close"
            aria-label="Закрыть меню"
            @click="closeMenu"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        
        <div class="theme-menu-options">
          <button
            class="theme-option"
            :class="{ active: themeMode === 'light' }"
            @click="selectTheme('light')"
          >
            <svg
              class="theme-option-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
            <span class="theme-option-text">Светлая</span>
            <svg
              v-if="themeMode === 'light'"
              class="theme-option-check"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>

          <button
            class="theme-option"
            :class="{ active: themeMode === 'dark' }"
            @click="selectTheme('dark')"
          >
            <svg
              class="theme-option-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10 10 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="theme-option-text">Темная</span>
            <svg
              v-if="themeMode === 'dark'"
              class="theme-option-check"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>

          <button
            class="theme-option"
            :class="{ active: themeMode === 'system' }"
            @click="selectTheme('system')"
          >
            <svg
              class="theme-option-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <span class="theme-option-text">Системная</span>
            <span class="theme-option-hint">{{ getSystemTheme() === 'dark' ? '🌙' : '☀️' }}</span>
            <svg
              v-if="themeMode === 'system'"
              class="theme-option-check"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { themeMode, setThemeMode, getSystemTheme } = useDarkMode()
const showMenu = ref(false)
const menuRef = ref(null)
const buttonRef = ref(null)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const selectTheme = (mode) => {
  setThemeMode(mode)
  closeMenu()
}

const getThemeTitle = () => {
  const titles = {
    light: 'Светлая тема',
    dark: 'Темная тема',
    system: 'Системная тема'
  }
  return titles[themeMode.value] || 'Переключить тему'
}

// Обработчик клика вне меню
const handleClickOutside = (event) => {
  if (showMenu.value) {
    const menu = menuRef.value
    const button = buttonRef.value
    if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      closeMenu()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-toggle-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-toggle-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4),
              0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.theme-toggle-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-toggle-button:hover::before {
  opacity: 1;
}

.theme-toggle-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5),
              0 4px 8px rgba(0, 0, 0, 0.15);
}

.theme-toggle-button:active {
  transform: translateY(0) scale(0.95);
}

.theme-toggle-button.menu-open {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
}

.dark .theme-toggle-button {
  background: linear-gradient(135deg, #1e40af 0%, #5b21b6 100%);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.5),
              0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .theme-toggle-button:hover {
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.6),
              0 4px 8px rgba(0, 0, 0, 0.3);
}

.theme-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  z-index: 1;
}

.theme-icon {
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-button:hover .theme-icon {
  transform: rotate(15deg);
}

.theme-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15),
              0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.dark .theme-menu {
  background: #1e293b;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4),
              0 4px 12px rgba(0, 0, 0, 0.3);
}

.theme-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .theme-menu-header {
  border-bottom-color: #334155;
}

.theme-menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.dark .theme-menu-title {
  color: #f1f5f9;
}

.theme-menu-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.theme-menu-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dark .theme-menu-close {
  color: #94a3b8;
}

.dark .theme-menu-close:hover {
  background: #334155;
  color: #f1f5f9;
}

.theme-menu-options {
  padding: 8px;
}

.theme-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.theme-option:hover {
  background: #f3f4f6;
}

.dark .theme-option {
  color: #e5e7eb;
}

.dark .theme-option:hover {
  background: #334155;
}

.theme-option.active {
  background: #eff6ff;
  color: #2563eb;
}

.dark .theme-option.active {
  background: #1e3a8a;
  color: #93c5fd;
}

.theme-option-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.theme-option-text {
  flex: 1;
  text-align: left;
}

.theme-option-hint {
  font-size: 16px;
  margin-left: auto;
  margin-right: 4px;
}

.theme-option-check {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Анимации */
.theme-menu-enter-active,
.theme-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-menu-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.theme-menu-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Адаптивность для мобильных */
@media (max-width: 640px) {
  .theme-toggle-container {
    bottom: 16px;
    right: 16px;
  }

  .theme-toggle-button {
    width: 52px;
    height: 52px;
  }

  .theme-icon-wrapper {
    width: 24px;
    height: 24px;
  }

  .theme-menu {
    bottom: 66px;
    width: 180px;
    right: 0;
  }

  .theme-menu-header {
    padding: 10px 14px;
  }

  .theme-option {
    padding: 10px;
    font-size: 13px;
  }

  .theme-option-icon {
    width: 18px;
    height: 18px;
  }
}

/* Анимация иконки при переключении */
.sun-icon,
.moon-icon,
.system-icon {
  animation: icon-rotate 0.3s ease;
}

@keyframes icon-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>


