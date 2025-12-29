/**
 * Web Push Notifications Service
 * Uses Firebase Cloud Messaging for push notifications
 * Falls back to simple browser notifications if FCM unavailable
 */

import { getFCMToken, registerTokenWithBackend, onForegroundMessage } from '../firebase'

// Re-export for convenience
export { getFCMToken, registerTokenWithBackend, onForegroundMessage }

// FCM token stored locally
let fcmToken = null

/**
 * Register Firebase Messaging Service Worker
 */
async function registerFirebaseServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported')
    return null
  }

  try {
    // Сначала проверяем, есть ли уже зарегистрированный Firebase SW
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const reg of registrations) {
      if (reg.active?.scriptURL?.includes('firebase-messaging-sw')) {
        console.log('✅ Firebase SW already registered:', reg.scope)
        return reg
      }
    }
    
    // Регистрируем Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    })
    
    console.log('✅ Firebase SW registered:', registration.scope)
    
    // Ждём активации
    await navigator.serviceWorker.ready
    console.log('✅ Firebase SW is ready')
    
    return registration
  } catch (error) {
    console.error('Firebase SW registration failed:', error)
    return null
  }
}

/**
 * Request notification permission and initialize FCM
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission result:', permission)
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted')
      
      // Register Firebase SW first
      const swReg = await registerFirebaseServiceWorker()
      console.log('📡 Firebase SW registration:', swReg ? 'success' : 'failed')
      
      // Get FCM token with retry
      let token = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔑 Getting FCM token (attempt ${attempt}/3)...`)
          token = await getFCMToken()
          if (token) {
            console.log('✅ FCM token received:', token.substring(0, 40) + '...')
            break
          }
        } catch (err) {
          console.warn(`⚠️ FCM token attempt ${attempt} failed:`, err.message)
          if (attempt < 3) await new Promise(r => setTimeout(r, 1000))
        }
      }
      
      if (token) {
        fcmToken = token
        const registered = await registerTokenWithBackend(token)
        console.log('📤 Token registration:', registered ? 'success' : 'failed')
        
        // Setup foreground message handler
        onForegroundMessage((payload) => {
          console.log('📩 Message received:', payload)
          playNotificationSound()
        })
        
        console.log('✅ FCM initialized successfully')
      } else {
        console.warn('⚠️ Could not get FCM token after 3 attempts')
      }
      
      return true
    }
    
    console.log('⚠️ Notification permission denied')
    return false
  } catch (error) {
    console.error('Permission request error:', error)
    return false
  }
}

/**
 * Initialize push notifications (call on app start)
 */
export async function initPushNotifications() {
  // Check if already have permission
  if (Notification.permission === 'granted') {
    await registerFirebaseServiceWorker()
    
    try {
      fcmToken = await getFCMToken()
      if (fcmToken) {
        await registerTokenWithBackend(fcmToken)
        onForegroundMessage((payload) => {
          console.log('📩 Foreground message:', payload)
          playNotificationSound()
        })
      }
    } catch (error) {
      console.warn('FCM init error:', error)
    }
  }
}

/**
 * Get current FCM token
 */
export function getCurrentFCMToken() {
  return fcmToken
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.5
    audio.play().catch((err) => {
      if (import.meta.env.DEV) console.debug('Audio play blocked:', err.message)
    })
  } catch (e) {
    console.warn('Could not play notification sound')
  }
}

/**
 * Show local notification (for in-app use)
 */
export function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    try {
      // Play sound
      playNotificationSound()
      
      // Try Service Worker notification first
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body: options.body || '',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-144x144.png',
            vibrate: [200, 100, 200],
            tag: options.tag || 'notification-' + Date.now(),
            requireInteraction: options.requireInteraction || false,
            data: { url: options.url || '/' },
            ...options
          })
        }).catch(() => {
          showSimpleNotification(title, options)
        })
      } else {
        showSimpleNotification(title, options)
      }
    } catch (error) {
      console.warn('Notification error:', error)
      showSimpleNotification(title, options)
    }
  } else if (Notification.permission === 'default') {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        showNotification(title, options)
      }
    })
  }
}

/**
 * Simple notification fallback
 */
function showSimpleNotification(title, options = {}) {
  try {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-144x144.png',
      vibrate: [200, 100, 200],
      ...options
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      
      if (options.url) {
        window.location.href = options.url
      }
      
      notification.close()
    }
    
    setTimeout(() => notification.close(), 5000)
  } catch (error) {
    console.warn('Simple notification error:', error)
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      console.log('✅ Unsubscribed from push')
    }
    
    // Clear FCM token on server
    if (fcmToken) {
      try {
        await fetch('/api/v1/users/fcm-token', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      } catch (e) {
        console.warn('Failed to clear FCM token on server')
      }
    }
    
    fcmToken = null
    return true
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return false
  }
}

export default {
  requestNotificationPermission,
  initPushNotifications,
  getCurrentFCMToken,
  showNotification,
  unsubscribeFromPush
}
