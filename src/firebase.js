/**
 * Firebase Configuration for RoadHelp
 * Push Notifications via Firebase Cloud Messaging
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyDGONxwdm9u9lcWDdLg_6xR52Z5TtVh0K0",
  authDomain: "roadhelp-14383.firebaseapp.com",
  projectId: "roadhelp-14383",
  storageBucket: "roadhelp-14383.firebasestorage.app",
  messagingSenderId: "986564669652",
  appId: "1:986564669652:web:de12ea4073d02c47c4cb41",
  measurementId: "G-VCSR2BJPTK"
}

// VAPID Key for Web Push
const VAPID_KEY = 'BKau2kB8mOdYnoKUQrX3JIzqYENURVe7GVgBIjnWJkDXrFzD16H8wiN2Gsu4Evwoxf8iG69lFy-rTqpOr4zA7jU'

// Lazy initialization
let app = null
let messaging = null
let initialized = false

/**
 * Initialize Firebase lazily (after SW is ready)
 */
function initFirebase() {
  if (initialized) return messaging
  
  try {
    if (!app) {
      app = initializeApp(firebaseConfig)
      console.log('✅ Firebase App initialized')
    }
    
    if ('serviceWorker' in navigator && !messaging) {
      messaging = getMessaging(app)
      console.log('✅ Firebase Messaging initialized')
    }
    
    initialized = true
  } catch (error) {
    console.warn('⚠️ Firebase init error:', error.message)
  }
  
  return messaging
}

/**
 * Get FCM Token for push notifications
 * @returns {Promise<string|null>} FCM token or null
 */
export async function getFCMToken() {
  console.log('🔥 getFCMToken() called')
  
  // Initialize Firebase first
  const msg = initFirebase()
  
  if (!msg) {
    console.warn('⚠️ Firebase Messaging not available (msg is null)')
    return null
  }
  console.log('✅ Firebase Messaging object ready')

  try {
    // Check current notification permission
    console.log('🔔 Current permission:', Notification.permission)
    
    // Request notification permission first
    const permission = await Notification.requestPermission()
    console.log('🔔 Permission after request:', permission)
    
    if (permission !== 'granted') {
      console.log('❌ Notification permission denied')
      return null
    }
    console.log('✅ Notification permission granted')

    // Register Firebase-specific service worker
    console.log('⏳ Registering Firebase Service Worker...')
    let swRegistration = null
    
    try {
      // Сначала проверяем, есть ли уже Firebase SW
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const reg of registrations) {
        if (reg.active?.scriptURL?.includes('firebase-messaging-sw')) {
          console.log('✅ Found existing Firebase SW:', reg.active.scriptURL)
          swRegistration = reg
          break
        }
      }
      
      // Если нет - регистрируем
      if (!swRegistration) {
        console.log('📡 Registering new Firebase SW...')
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope'
        })
        console.log('✅ Firebase SW registered with scope:', swRegistration.scope)
        
        // Ждём активации
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (swError) {
      console.error('❌ Firebase SW registration error:', swError)
      // Fallback to default SW
      swRegistration = await navigator.serviceWorker.ready
    }
    
    console.log('📝 Final SW for FCM:', swRegistration?.active?.scriptURL || swRegistration?.scope)

    // Get FCM token
    console.log('🔑 Requesting FCM token with VAPID:', VAPID_KEY.substring(0, 20) + '...')
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    })

    if (token) {
      console.log('✅ FCM Token received:', token.substring(0, 30) + '...')
      console.log('📊 Token length:', token.length)
      return token
    } else {
      console.log('⚠️ No FCM token returned (token is null/empty)')
      return null
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    return null
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Handler for incoming messages
 */
export function onForegroundMessage(callback) {
  const msg = initFirebase()
  if (!msg) return

  onMessage(msg, (payload) => {
    console.log('📩 Foreground message received:', payload)
    
    // Show notification manually in foreground
    if (payload.notification) {
      const { title, body } = payload.notification
      
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.5
        audio.play().catch((err) => {
          if (import.meta.env.DEV) console.debug('Audio play blocked:', err.message)
        })
      } catch (_audioErr) {
        // Ошибка воспроизведения звука - игнорируем
      }
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title || 'RoadHelp', {
          body: body || 'Новое уведомление',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-144x144.png',
          vibrate: [200, 100, 200],
          data: payload.data
        })
      }
      
      // Call custom callback
      if (callback) {
        callback(payload)
      }
    }
  })
}

/**
 * Register FCM token with backend
 * @param {string} token - FCM token
 */
export async function registerTokenWithBackend(token) {
  console.log('📤 registerTokenWithBackend() called')
  console.log('🔑 Token to register:', token?.substring(0, 30) + '...')
  
  try {
    const authToken = localStorage.getItem('token')
    if (!authToken) {
      console.log('⚠️ No auth token in localStorage, skipping FCM registration')
      return false
    }
    console.log('✅ Auth token found, length:', authToken.length)

    console.log('🚀 Sending POST to /api/v1/users/fcm-token...')
    const response = await fetch('/api/v1/users/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcm_token: token })
    })

    console.log('📥 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ FCM token registered with backend:', data)
      return true
    } else {
      const errorText = await response.text()
      console.warn('❌ Failed to register FCM token:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.error('❌ Error registering FCM token:', error)
    console.error('❌ Error details:', error.message)
    return false
  }
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications() {
  try {
    const token = await getFCMToken()
    
    if (token) {
      await registerTokenWithBackend(token)
      onForegroundMessage((payload) => {
        console.log('Notification payload:', payload)
      })
      return true
    }
    
    return false
  } catch (error) {
    console.error('Push notification init error:', error)
    return false
  }
}

export { app, messaging, VAPID_KEY }
export default { getFCMToken, onForegroundMessage, registerTokenWithBackend, initializePushNotifications }
