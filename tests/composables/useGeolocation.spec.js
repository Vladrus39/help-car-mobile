import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGeolocation } from '@/composables/useGeolocation'

describe('useGeolocation', () => {
  beforeEach(() => {
    // Mock navigator.geolocation
    global.navigator = {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn()
      }
    }
  })

  it('should initialize with null values', () => {
    const { latitude, longitude, accuracy, error, isLoading } = useGeolocation()
    
    expect(latitude.value).toBeNull()
    expect(longitude.value).toBeNull()
    expect(accuracy.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(true)
  })

  it('should get current position successfully', async () => {
    const mockPosition = {
      coords: {
        latitude: 55.755819,
        longitude: 37.617644,
        accuracy: 25
      },
      timestamp: Date.now()
    }

    global.navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    const { getCurrentPosition, latitude, longitude, accuracy } = useGeolocation()
    
    await getCurrentPosition()
    
    expect(latitude.value).toBe(55.755819)
    expect(longitude.value).toBe(37.617644)
    expect(accuracy.value).toBe(25)
  })

  it('should handle geolocation error', async () => {
    const mockError = {
      code: 1,
      message: 'User denied geolocation'
    }

    global.navigator.geolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const { getCurrentPosition, error } = useGeolocation()
    
    try {
      await getCurrentPosition()
    } catch (err) {
      expect(error.value).toBeTruthy()
    }
  })

  it('should calculate distance correctly', () => {
    const { calculateDistance } = useGeolocation()
    
    // Расстояние от Москвы до Санкт-Петербурга (~634 км)
    const distance = calculateDistance(
      55.755819, 37.617644, // Москва
      59.938678, 30.314474  // СПб
    )
    
    expect(distance).toBeGreaterThan(630)
    expect(distance).toBeLessThan(640)
  })

  it('should check if point is within radius', () => {
    const { latitude, longitude, isWithinRadius } = useGeolocation()
    
    latitude.value = 55.755819
    longitude.value = 37.617644
    
    // Точка в 2 км
    const withinRadius = isWithinRadius(55.770000, 37.630000, 5)
    expect(withinRadius).toBe(true)
    
    // Точка в 100 км
    const outsideRadius = isWithinRadius(56.855819, 37.617644, 5)
    expect(outsideRadius).toBe(false)
  })
})

