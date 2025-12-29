/**
 * Единая система z-index для всего приложения
 * Использовать эти константы вместо магических чисел
 */

export const Z_INDEX = {
  // Базовый слой
  BASE: 1,
  
  // Карта и её элементы
  MAP: 1,
  MAP_CONTROLS: 500,
  MAP_MARKERS: 600,
  
  // Навигация
  HEADER: 900,
  NAVIGATION: 1000,
  QUICK_NAV: 1000,
  
  // Панели и сайдбары
  SIDEBAR: 40,          // Боковая панель HomeView (на мобильных - overlay)
  PANEL: 1100,          // Панели MapView
  
  // Кнопки и контролы
  FLOATING_BUTTON: 1200,
  TOGGLE_BUTTON: 50,    // Кнопка открытия сайдбара
  
  // Модальные окна
  MODAL_BACKDROP: 1300,
  MODAL: 1400,
  
  // Критичные элементы
  PWA_INSTALL: 2000,
  TOAST: 9000,
  NOTIFICATION: 9999,
  
  // Экстренные overlay
  EMERGENCY: 10000
}

/**
 * Получить Tailwind класс для z-index
 * @param {number} level - Уровень из Z_INDEX
 * @returns {string} - Tailwind класс
 */
export function getZIndexClass(level) {
  return `z-[${level}]`
}

export default Z_INDEX
