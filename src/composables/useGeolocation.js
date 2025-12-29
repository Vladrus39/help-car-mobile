import { ref, onMounted, onUnmounted } from 'vue'

export function useGeolocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const accuracy = ref(null)
  const error = ref(null)
  const isLoading = ref(true)
  
  let watchId = null

  /**
   * Получить текущее местоположение
   */
  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Геолокация не поддерживается вашим браузером')
        error.value = err.message
        reject(err)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value = position.coords.latitude
          longitude.value = position.coords.longitude
          accuracy.value = position.coords.accuracy
          isLoading.value = false
          error.value = null
          
          console.log('✅ Геолокация получена:', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy + ' метров',
            timestamp: new Date(position.timestamp).toLocaleString('ru-RU')
          })
          
          resolve(position)
        },
        (err) => {
          const errorMessages = {
            1: 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.',
            2: 'Местоположение недоступно. Проверьте GPS или Wi-Fi.',
            3: 'Таймаут запроса. Попробуйте еще раз.'
          }
          error.value = errorMessages[err.code] || err.message
          isLoading.value = false
          
          console.error('❌ Ошибка геолокации:', {
            код: err.code,
            сообщение: error.value
          })
          
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      )
    })
  }

  /**
   * Начать отслеживание местоположения
   */
  function startWatching() {
    if (!navigator.geolocation) {
      error.value = 'Геолокация не поддерживается'
      return
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        latitude.value = position.coords.latitude
        longitude.value = position.coords.longitude
        accuracy.value = position.coords.accuracy
        isLoading.value = false
        error.value = null
        
        console.log('📍 Местоположение обновлено:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy + ' м'
        })
      },
      (err) => {
        const errorMessages = {
          1: 'Доступ к геолокации запрещён',
          2: 'Местоположение недоступно',
          3: 'Таймаут запроса'
        }
        error.value = errorMessages[err.code] || err.message
        isLoading.value = false
        
        console.error('❌ Ошибка отслеживания:', error.value)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
  }

  /**
   * Остановить отслеживание
   */
  function stopWatching() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  /**
   * Вычислить расстояние между двумя точками (Haversine formula)
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Радиус Земли в км
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  /**
   * Проверить, находится ли точка в радиусе
   */
  function isWithinRadius(targetLat, targetLon, radiusKm = 5) {
    if (!latitude.value || !longitude.value) return false
    
    const distance = calculateDistance(
      latitude.value,
      longitude.value,
      targetLat,
      targetLon
    )
    
    return distance <= radiusKm
  }

  onMounted(() => {
    getCurrentPosition()
  })

  onUnmounted(() => {
    stopWatching()
  })

  return {
    latitude,
    longitude,
    accuracy,
    error,
    isLoading,
    getCurrentPosition,
    startWatching,
    stopWatching,
    calculateDistance,
    isWithinRadius
  }
}

