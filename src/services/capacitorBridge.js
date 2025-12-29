/**
 * Capacitor Bridge - мост между веб и нативными функциями
 * 
 * Этот модуль определяет платформу и предоставляет унифицированный API
 * для работы с нативными функциями как в браузере, так и в приложении
 */

// Проверяем, доступен ли Capacitor
let Capacitor, Geolocation, PushNotifications, App, StatusBar, SplashScreen, Haptics, Browser, Device, Network, Preferences, Toast

// Функция показа тоста для выхода из приложения
function showExitToast(message) {
  // Пробуем нативный Toast
  if (Toast?.show) {
    Toast.show({
      text: message,
      duration: 'short',
      position: 'bottom'
    })
    return
  }
  
  // Fallback - создаём DOM toast
  const existingToast = document.getElementById('exit-toast')
  if (existingToast) {
    existingToast.remove()
  }
  
  const toast = document.createElement('div')
  toast.id = 'exit-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 99999;
    animation: fadeInOut 2s ease-in-out forwards;
  `
  
  // Добавляем анимацию если её нет
  if (!document.getElementById('exit-toast-style')) {
    const style = document.createElement('style')
    style.id = 'exit-toast-style'
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 2000)
}

const loadCapacitor = async () => {
  try {
    const core = await import('@capacitor/core')
    Capacitor = core.Capacitor
    
    if (Capacitor.isNativePlatform()) {
      const geo = await import('@capacitor/geolocation')
      const push = await import('@capacitor/push-notifications')
      const app = await import('@capacitor/app')
      const status = await import('@capacitor/status-bar')
      const splash = await import('@capacitor/splash-screen')
      const haptics = await import('@capacitor/haptics')
      const browser = await import('@capacitor/browser')
      const device = await import('@capacitor/device')
      const network = await import('@capacitor/network')
      const prefs = await import('@capacitor/preferences')
      
      Geolocation = geo.Geolocation
      PushNotifications = push.PushNotifications
      App = app.App
      StatusBar = status.StatusBar
      SplashScreen = splash.SplashScreen
      Haptics = haptics.Haptics
      Browser = browser.Browser
      Device = device.Device
      Network = network.Network
      Preferences = prefs.Preferences
    }
    
    return true
  } catch (e) {
    console.log('Capacitor not available, running in web mode')
    return false
  }
}

/**
 * Определяем платформу
 */
export const isNative = () => Capacitor?.isNativePlatform() || false
export const getPlatform = () => Capacitor?.getPlatform() || 'web'
export const isAndroid = () => getPlatform() === 'android'
export const isIOS = () => getPlatform() === 'ios'
export const isWeb = () => getPlatform() === 'web'

/**
 * Инициализация Capacitor при старте приложения
 */
export async function initCapacitor() {
  const loaded = await loadCapacitor()
  if (!loaded || !isNative()) {
    console.log('📱 Running in web mode')
    return
  }
  
  console.log(`📱 Running on ${getPlatform()}`)
  
  try {
    // Скрываем splash screen
    await SplashScreen?.hide()
    
    // Настраиваем статус бар
    if (StatusBar) {
      await StatusBar.setStyle({ style: 'LIGHT' })
      await StatusBar.setBackgroundColor({ color: '#2563EB' })
    }
    
    // Обработка кнопки "Назад" на Android с подтверждением выхода
    let lastBackPress = 0
    const BACK_PRESS_DELAY = 2000 // 2 секунды между нажатиями для выхода
    
    App?.addListener('backButton', ({ canGoBack }) => {
      const now = Date.now()
      
      if (canGoBack) {
        // Есть куда вернуться - просто идём назад
        window.history.back()
        lastBackPress = 0 // сбрасываем счётчик
      } else {
        // Некуда идти - проверяем двойное нажатие для выхода
        if (now - lastBackPress < BACK_PRESS_DELAY) {
          // Второе нажатие - выходим
          App.minimizeApp()
          lastBackPress = 0
        } else {
          // Первое нажатие - показываем тост
          lastBackPress = now
          showExitToast('Нажмите ещё раз для выхода')
        }
      }
    })
    
    // Обработка возврата в приложение
    App?.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('📱 App became active')
        // Триггерим событие для обновления данных
        window.dispatchEvent(new CustomEvent('app:resume'))
      } else {
        console.log('📱 App went to background')
        window.dispatchEvent(new CustomEvent('app:pause'))
      }
    })
    
    // Обработка deep links
    App?.addListener('appUrlOpen', (event) => {
      console.log('📱 Deep link:', event.url)
      const url = new URL(event.url)
      if (url.pathname) {
        window.location.href = url.pathname + url.search
      }
    })
    
    // Слушаем изменения сети
    Network?.addListener('networkStatusChange', (status) => {
      console.log('📱 Network status:', status.connected ? 'online' : 'offline')
      window.dispatchEvent(new CustomEvent('network:change', { detail: status }))
    })
    
  } catch (error) {
    console.error('Error initializing Capacitor:', error)
  }
}

/**
 * Геолокация - работает и на web, и в приложении
 */
export async function getCurrentPosition(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
  
  const opts = { ...defaultOptions, ...options }
  
  if (isNative() && Geolocation) {
    // Запрашиваем разрешение
    const permission = await Geolocation.checkPermissions()
    if (permission.location !== 'granted') {
      const request = await Geolocation.requestPermissions()
      if (request.location !== 'granted') {
        throw new Error('Геолокация не разрешена')
      }
    }
    
    const position = await Geolocation.getCurrentPosition(opts)
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      },
      timestamp: position.timestamp
    }
  } else {
    // Web fallback
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, opts)
    })
  }
}

/**
 * Следить за геолокацией
 */
export function watchPosition(callback, errorCallback, options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
  
  const opts = { ...defaultOptions, ...options }
  
  if (isNative() && Geolocation) {
    return Geolocation.watchPosition(opts, (position, err) => {
      if (err) {
        errorCallback?.(err)
      } else {
        callback({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: position.timestamp
        })
      }
    })
  } else {
    // Web fallback
    const watchId = navigator.geolocation.watchPosition(callback, errorCallback, opts)
    return {
      remove: () => navigator.geolocation.clearWatch(watchId)
    }
  }
}

/**
 * Push-уведомления
 */
export async function registerPushNotifications(options = {}) {
  const { onToken, onNotification, onAction } = options
  
  if (!isNative() || !PushNotifications) {
    console.log('📱 Push: Using web implementation')
    return null
  }
  
  try {
    // Запрашиваем разрешение
    let permission = await PushNotifications.checkPermissions()
    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions()
    }
    
    if (permission.receive !== 'granted') {
      console.warn('📱 Push notifications not granted')
      return null
    }
    
    // Регистрируемся
    await PushNotifications.register()
    
    // Слушаем токен
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 FCM Token:', token.value)
      onToken?.(token.value)
    })
    
    // Ошибка регистрации
    PushNotifications.addListener('registrationError', (error) => {
      console.error('📱 Push registration error:', error)
    })
    
    // Входящие уведомления (приложение активно)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📱 Push received:', notification)
      onNotification?.(notification)
    })
    
    // Нажатие на уведомление
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('📱 Push action:', action)
      onAction?.(action)
      
      // Навигация к нужному экрану
      const data = action.notification.data
      if (data?.route) {
        window.location.href = data.route
      }
    })
    
    return true
  } catch (error) {
    console.error('📱 Push registration failed:', error)
    return null
  }
}

/**
 * Вибрация
 */
export async function vibrate(style = 'medium') {
  if (isNative() && Haptics) {
    const styles = {
      light: 'Light',
      medium: 'Medium', 
      heavy: 'Heavy'
    }
    await Haptics.impact({ style: styles[style] || 'Medium' })
  } else if (navigator.vibrate) {
    // Web fallback
    const durations = { light: 10, medium: 25, heavy: 50 }
    navigator.vibrate(durations[style] || 25)
  }
}

/**
 * Notification vibration (три коротких)
 */
export async function vibrateNotification() {
  if (isNative() && Haptics) {
    await Haptics.notification({ type: 'SUCCESS' })
  } else if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 100])
  }
}

/**
 * Открыть внешнюю ссылку в браузере
 */
export async function openInBrowser(url) {
  if (isNative() && Browser) {
    await Browser.open({ url })
  } else {
    window.open(url, '_blank')
  }
}

/**
 * Открыть в системном браузере (для OAuth и т.п.)
 */
export async function openExternalUrl(url) {
  if (isNative() && Browser) {
    await Browser.open({ 
      url,
      windowName: '_system',
      presentationStyle: 'popover'
    })
  } else {
    window.open(url, '_blank')
  }
}

/**
 * Информация об устройстве
 */
export async function getDeviceInfo() {
  if (isNative() && Device) {
    return await Device.getInfo()
  }
  
  // Web fallback
  return {
    platform: 'web',
    operatingSystem: navigator.platform,
    model: navigator.userAgent,
    isVirtual: false
  }
}

/**
 * Информация о приложении
 */
export async function getAppInfo() {
  if (isNative() && App) {
    return await App.getInfo()
  }
  return null
}

/**
 * Проверка состояния сети
 */
export async function getNetworkStatus() {
  if (isNative() && Network) {
    return await Network.getStatus()
  }
  return {
    connected: navigator.onLine,
    connectionType: 'unknown'
  }
}

/**
 * Хранение данных (замена localStorage для нативных приложений)
 */
export const storage = {
  async get(key) {
    if (isNative() && Preferences) {
      const { value } = await Preferences.get({ key })
      return value ? JSON.parse(value) : null
    }
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  
  async set(key, value) {
    if (isNative() && Preferences) {
      await Preferences.set({ key, value: JSON.stringify(value) })
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  
  async remove(key) {
    if (isNative() && Preferences) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  },
  
  async clear() {
    if (isNative() && Preferences) {
      await Preferences.clear()
    } else {
      localStorage.clear()
    }
  }
}

/**
 * Выход из приложения (только для Android)
 */
export async function exitApp() {
  if (isAndroid() && App) {
    await App.exitApp()
  }
}

/**
 * Свернуть приложение (только для Android)
 */
export async function minimizeApp() {
  if (isAndroid() && App) {
    await App.minimizeApp()
  }
}

/**
 * Запрос всех необходимых разрешений при первом запуске
 * Вызывать при первом входе пользователя
 */
export async function requestAllPermissions() {
  if (!isNative()) {
    console.log('📱 Permissions: Web mode, skipping native permissions')
    return { success: true, web: true }
  }
  
  const results = {
    location: 'unknown',
    notifications: 'unknown',
    camera: 'unknown',
    microphone: 'unknown'
  }
  
  console.log('📱 Requesting all permissions...')
  
  try {
    // 1. Геолокация
    if (Geolocation) {
      try {
        const locPerm = await Geolocation.checkPermissions()
        if (locPerm.location !== 'granted') {
          const req = await Geolocation.requestPermissions()
          results.location = req.location
        } else {
          results.location = 'granted'
        }
        console.log('📍 Location permission:', results.location)
      } catch (e) {
        console.error('📍 Location permission error:', e)
        results.location = 'error'
      }
    }
    
    // 2. Push-уведомления
    if (PushNotifications) {
      try {
        const pushPerm = await PushNotifications.checkPermissions()
        if (pushPerm.receive !== 'granted') {
          const req = await PushNotifications.requestPermissions()
          results.notifications = req.receive
        } else {
          results.notifications = 'granted'
        }
        console.log('🔔 Notifications permission:', results.notifications)
      } catch (e) {
        console.error('🔔 Notifications permission error:', e)
        results.notifications = 'error'
      }
    }
    
    // 3. Камера и микрофон через Web API (работает в WebView)
    try {
      // Запрашиваем и камеру и микрофон одним запросом
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      // Сразу останавливаем stream, нам нужно было только разрешение
      stream.getTracks().forEach(track => track.stop())
      results.camera = 'granted'
      results.microphone = 'granted'
      console.log('📷 Camera permission: granted')
      console.log('🎤 Microphone permission: granted')
    } catch (e) {
      console.warn('📷🎤 Camera/Microphone permission error:', e.name)
      // Пробуем отдельно камеру
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoStream.getTracks().forEach(track => track.stop())
        results.camera = 'granted'
      } catch (ve) {
        results.camera = 'denied'
      }
      // Пробуем отдельно микрофон
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStream.getTracks().forEach(track => track.stop())
        results.microphone = 'granted'
      } catch (ae) {
        results.microphone = 'denied'
      }
    }
    
    console.log('📱 All permissions results:', results)
    return { success: true, permissions: results }
    
  } catch (error) {
    console.error('📱 Permission request error:', error)
    return { success: false, error: error.message, permissions: results }
  }
}

/**
 * Проверка состояния разрешений
 */
export async function checkAllPermissions() {
  if (!isNative()) {
    return { isNative: false }
  }
  
  const results = {
    isNative: true,
    location: 'unknown',
    notifications: 'unknown',
    camera: 'unknown',
    microphone: 'unknown'
  }
  
  try {
    if (Geolocation) {
      const loc = await Geolocation.checkPermissions()
      results.location = loc.location
    }
    
    if (PushNotifications) {
      const push = await PushNotifications.checkPermissions()
      results.notifications = push.receive
    }
    
    // Проверка камеры/микрофона через permissions API
    if (navigator.permissions) {
      try {
        const cam = await navigator.permissions.query({ name: 'camera' })
        results.camera = cam.state
      } catch (e) {
        results.camera = 'unsupported'
      }
      
      try {
        const mic = await navigator.permissions.query({ name: 'microphone' })
        results.microphone = mic.state
      } catch (e) {
        results.microphone = 'unsupported'
      }
    }
  } catch (error) {
    console.error('Check permissions error:', error)
  }
  
  return results
}

// Экспорт для обратной совместимости
export default {
  isNative,
  getPlatform,
  isAndroid,
  isIOS,
  isWeb,
  initCapacitor,
  getCurrentPosition,
  watchPosition,
  registerPushNotifications,
  vibrate,
  vibrateNotification,
  openInBrowser,
  openExternalUrl,
  getDeviceInfo,
  getAppInfo,
  getNetworkStatus,
  storage,
  exitApp,
  minimizeApp,
  requestAllPermissions,
  checkAllPermissions
}

