import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor конфигурация для Help Car - МЕССЕНДЖЕР
 * 
 * РЕЖИМ: Локальные файлы + OTA обновления (как Telegram/WhatsApp)
 * - Мгновенный запуск из локальных файлов
 * - Push-уведомления работают ВСЕГДА (даже когда приложение закрыто)
 * - Оффлайн работа с локальной БД
 * - Обновления через Capgo без магазинов
 */
const config: CapacitorConfig = {
  appId: 'online.helpcar.app',
  appName: 'Help Car',
  webDir: 'dist',
  
  // Локальные файлы для мгновенного запуска
  server: {
    // НЕ используем url - работаем из локальных файлов!
    androidScheme: 'https',
    iosScheme: 'capacitor',
    
    // Разрешаем запросы к API
    allowNavigation: [
      'help-car.online',
      '*.help-car.online',
      'firebaseapp.com',
      '*.firebaseapp.com',
      '*.googleapis.com'
    ]
  },

  // Плагины для мессенджера
  plugins: {
    // Splash Screen - быстрый, без спиннера
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 200,
      backgroundColor: '#2563EB',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    
    // Push уведомления - ГЛАВНОЕ для мессенджера!
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    
    // Локальные уведомления (для оффлайн напоминаний)
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#2563EB',
      sound: 'notification.wav'
    },
    
    // Клавиатура
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      style: 'DARK'
    },
    
    // Статус бар
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2563EB',
      overlaysWebView: false
    },
    
    // Badge - счётчик непрочитанных на иконке
    Badge: {
      persist: true,
      autoClear: false
    },
    
    // Capgo Live Updates - обновления без магазина!
    CapacitorUpdater: {
      autoUpdate: true,
      updateUrl: 'https://help-car.online/api/v1/app/update-manifest',
      appReadyTimeout: 10000,
      responseTimeout: 60,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: false,
      directUpdate: false
    }
  },

  // Android - оптимизировано для мессенджера
  android: {
    webContentsDebuggingEnabled: true,  // Включаем для отладки!
    allowMixedContent: true,  // Разрешаем mixed content
    captureInput: true,
    useLegacyBridge: false,
    backgroundColor: '#ffffff',
    
    // Минимальная версия для новых API
    minWebViewVersion: '70',
    
    // Включаем build config для Firebase
    includePlugins: [
      '@capacitor/push-notifications',
      '@capacitor/local-notifications',
      '@capgo/capacitor-updater'
    ]
  },

  // iOS
  ios: {
    scheme: 'helpcar',
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile',
    backgroundColor: '#ffffff'
  }
};

export default config;
