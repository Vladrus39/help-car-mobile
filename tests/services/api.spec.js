import { describe, it, expect, vi, beforeEach } from 'vitest'
// Remove unused axios import
import { apiService } from '@/services/api'

// Mock axios
vi.mock('@/services/api', () => {
  return {
    apiService: {
      client: {
        post: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
      }
    }
  }
})

describe('apiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should call POST /auth/register with user data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '+79001234567'
      }

      apiService.client.post = vi.fn().mockResolvedValue({
        data: { success: true, data: { token: 'abc' } }
      })

      await apiService.register(userData)

      expect(apiService.client.post).toHaveBeenCalledWith('/auth/register', userData)
    })
  })

  describe('login', () => {
    it('should call POST /auth/login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      apiService.client.post = vi.fn().mockResolvedValue({
        data: { success: true, data: { token: 'abc' } }
      })

      await apiService.login(credentials)

      expect(apiService.client.post).toHaveBeenCalledWith('/auth/login', credentials)
    })
  })

  describe('createHelpRequest', () => {
    it('should call POST /help-requests with request data', async () => {
      const requestData = {
        problem_type: 'battery',
        description: 'Need help',
        amount: 500,
        latitude: 55.75,
        longitude: 37.62,
        address: 'Moscow'
      }

      apiService.client.post = vi.fn().mockResolvedValue({
        data: { success: true }
      })

      await apiService.createHelpRequest(requestData)

      expect(apiService.client.post).toHaveBeenCalledWith('/help-requests', requestData)
    })
  })

  describe('getHelpRequests', () => {
    it('should call GET /help-requests with params', async () => {
      const params = { status: 'active', limit: 10 }

      apiService.client.get = vi.fn().mockResolvedValue({
        data: { success: true, data: [] }
      })

      await apiService.getHelpRequests(params)

      expect(apiService.client.get).toHaveBeenCalledWith('/help-requests', { params })
    })
  })
})









