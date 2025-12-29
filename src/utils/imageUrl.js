/**
 * Утилита для формирования корректных URL изображений
 * Учитывает работу как в браузере, так и в мобильном приложении (Capacitor)
 */

// Детекция нативного приложения (Android/iOS через Capacitor)
const detectCapacitor = () => {
  if (typeof window === 'undefined') return false
  
  const proto = window.location?.protocol || ''
  const hostname = window.location?.hostname || ''
  const href = window.location?.href || ''
  const docUrl = document?.URL || ''
  const ua = navigator?.userAgent || ''
  
  // 0. Проверяем маркер из index.html
  if (window.__CAPACITOR_NATIVE__ === true) return true
  
  // 1. Проверяем window.Capacitor
  if (window.Capacitor?.isNativePlatform?.()) return true
  if (window.Capacitor !== undefined) return true
  
  // 2. Проверяем протокол URL
  if (proto === 'capacitor:' || proto === 'ionic:' || proto === 'file:') return true
  
  // 3. Проверяем document.URL и href
  if (docUrl.startsWith('capacitor://') || docUrl.startsWith('ionic://') || docUrl.startsWith('file://')) return true
  if (href.startsWith('file://') || href.indexOf('android_asset') !== -1) return true
  
  // 4. Проверяем User Agent на наличие маркеров Capacitor WebView
  if (ua.includes('CapacitorWebView') || (ua.includes('wv') && ua.includes('Android'))) return true
  
  // 5. Пустой hostname часто признак file:// или capacitor://
  if (hostname === '' || hostname === 'localhost') {
    // Дополнительная проверка для localhost в Capacitor
    if (ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad')) return true
  }
  
  return false
}

const isCapacitor = detectCapacitor()
const BASE_SERVER_URL = 'https://help-car.online'

/**
 * Преобразует относительный URL изображения в абсолютный
 * @param {string} url - URL изображения
 * @returns {string} - Абсолютный URL
 */
export function getImageUrl(url) {
  if (!url) return ''
  
  // Если уже абсолютный URL или blob - возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  
  // Убираем возможный дублирующий слеш
  const cleanUrl = url.startsWith('/') ? url : '/' + url
  
  // В Capacitor (мобильное приложение) всегда используем полный URL сервера
  if (isCapacitor) {
    return BASE_SERVER_URL + cleanUrl
  }
  
  // В браузере пробуем использовать env или origin
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (baseUrl) {
    return baseUrl.replace('/api/v1', '') + cleanUrl
  }
  
  return window.location.origin + cleanUrl
}

/**
 * Преобразует URL аватара
 * @param {string} url - URL аватара
 * @returns {string} - Абсолютный URL
 */
export function getAvatarUrl(url) {
  return getImageUrl(url)
}

/**
 * Преобразует URL голосового сообщения
 * @param {string} url - URL голосового сообщения
 * @returns {string} - Абсолютный URL
 */
export function getVoiceUrl(url) {
  return getImageUrl(url)
}

/**
 * Преобразует URL миниатюры
 * @param {string} url - URL миниатюры
 * @returns {string} - Абсолютный URL
 */
export function getThumbnailUrl(url) {
  return getImageUrl(url)
}

/**
 * Получает URL для WebSocket соединения
 * @returns {string} - URL для WebSocket (wss://...)
 */
export function getWebSocketUrl() {
  // В Capacitor (мобильное приложение) всегда используем полный URL сервера
  if (isCapacitor) {
    return 'wss://help-car.online'
  }
  
  // В браузере используем текущий хост
  const envWsUrl = import.meta.env.VITE_WS_URL
  if (envWsUrl) {
    return envWsUrl.startsWith('ws') ? envWsUrl : 
           (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + envWsUrl
  }
  
  return window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.host}`
}

/**
 * Получает URL для HTTP соединения Socket.IO
 * @returns {string} - URL для HTTP (https://...)
 */
export function getSocketIOUrl() {
  // В Capacitor (мобильное приложение) всегда используем полный URL сервера
  if (isCapacitor) {
    return 'https://help-car.online'
  }
  
  // В браузере используем текущий origin
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  if (envApiUrl) {
    return envApiUrl.replace('/api/v1', '')
  }
  
  return window.location.origin
}

/**
 * Получает базовый URL сервера
 * @returns {string} - Base URL (https://...)
 */
export function getBaseServerUrl() {
  if (isCapacitor) {
    return BASE_SERVER_URL
  }
  
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  if (envApiUrl) {
    return envApiUrl.replace('/api/v1', '')
  }
  
  return window.location.origin
}

export default {
  getImageUrl,
  getAvatarUrl,
  getVoiceUrl,
  getThumbnailUrl,
  getWebSocketUrl,
  getSocketIOUrl,
  getBaseServerUrl,
  isCapacitor,
  BASE_SERVER_URL
}
