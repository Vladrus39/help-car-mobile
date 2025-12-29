import { ref, watch, onMounted, computed, onUnmounted } from 'vue'

export function useDarkMode() {
  // Получаем системную тему
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  // Проверяем сохраненную тему или используем системную
  const getInitialThemeMode = () => {
    const savedTheme = localStorage.getItem('themeMode')
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme
    }
    return 'system' // По умолчанию системная тема
  }

  const themeMode = ref(getInitialThemeMode())

  // Вычисляем фактическую тему (для system берем системную)
  const isDark = computed(() => {
    if (themeMode.value === 'system') {
      return getSystemTheme() === 'dark'
    }
    return themeMode.value === 'dark'
  })

  // Применяем тему к документу
  const applyTheme = () => {
    const shouldBeDark = isDark.value
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Устанавливаем режим темы
  const setThemeMode = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) {
      console.warn('Invalid theme mode:', mode)
      return
    }
    themeMode.value = mode
    localStorage.setItem('themeMode', mode)
    applyTheme()
  }

  // Переключатель между режимами (light -> dark -> system -> light)
  const cycleTheme = () => {
    const modes = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(themeMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }

  // Переключатель только между светлой и темной (для обратной совместимости)
  const toggleDarkMode = () => {
    if (themeMode.value === 'system') {
      // Если системная, переключаем на противоположную системной
      setThemeMode(getSystemTheme() === 'dark' ? 'light' : 'dark')
    } else {
      // Переключаем между light и dark
      setThemeMode(themeMode.value === 'dark' ? 'light' : 'dark')
    }
  }

  // Обработчик изменения системной темы
  let mediaQuery = null
  let mediaQueryHandler = null

  const setupSystemThemeListener = () => {
    if (window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryHandler = (_e) => {
        // Обновляем только если выбран режим 'system'
        if (themeMode.value === 'system') {
          applyTheme()
        }
      }
      mediaQuery.addEventListener('change', mediaQueryHandler)
    }
  }

  // Инициализация при монтировании
  onMounted(() => {
    applyTheme()
    setupSystemThemeListener()
  })

  // Очистка при размонтировании
  onUnmounted(() => {
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler)
    }
  })

  // Следим за изменениями режима темы
  watch(themeMode, () => {
    applyTheme()
    // Переустанавливаем слушатель при изменении режима
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler)
    }
    setupSystemThemeListener()
  })

  // Следим за изменениями isDark (включая системные изменения)
  watch(isDark, () => {
    applyTheme()
  }, { immediate: true })

  return {
    isDark,
    themeMode,
    toggleDarkMode,
    setThemeMode,
    cycleTheme,
    getSystemTheme
  }
}





