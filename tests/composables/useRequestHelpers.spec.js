import { describe, it, expect, beforeEach } from 'vitest'
import { useRequestHelpers } from '@/composables/useRequestHelpers'

describe('useRequestHelpers', () => {
  let helpers

  beforeEach(() => {
    helpers = useRequestHelpers()
  })

  describe('getProblemTypeLabel', () => {
    it('should return correct label for battery', () => {
      expect(helpers.getProblemTypeLabel('battery')).toBe('Разряженная батарея')
    })

    it('should return correct label for fuel', () => {
      expect(helpers.getProblemTypeLabel('fuel')).toBe('Закончилось топливо')
    })

    it('should return correct label for tire', () => {
      expect(helpers.getProblemTypeLabel('tire')).toBe('Прокол колеса')
    })

    it('should return correct label for towing', () => {
      expect(helpers.getProblemTypeLabel('towing')).toBe('Нужна эвакуация')
    })

    it('should return default label for unknown type', () => {
      expect(helpers.getProblemTypeLabel('unknown')).toBe('Другая проблема')
    })
  })

  describe('getProblemTypeIcon', () => {
    it('should return correct icon for each type', () => {
      expect(helpers.getProblemTypeIcon('battery')).toContain('🔋')
      expect(helpers.getProblemTypeIcon('fuel')).toContain('⛽')
      expect(helpers.getProblemTypeIcon('tire')).toContain('🛞')
      expect(helpers.getProblemTypeIcon('towing')).toContain('🚛')
      expect(helpers.getProblemTypeIcon('other')).toContain('🆘')
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct label for active', () => {
      expect(helpers.getStatusLabel('active')).toBe('Активен')
    })

    it('should return correct label for in_progress', () => {
      expect(helpers.getStatusLabel('in_progress')).toBe('В процессе')
    })

    it('should return correct label for completed', () => {
      expect(helpers.getStatusLabel('completed')).toBe('Завершён')
    })

    it('should return correct label for cancelled', () => {
      expect(helpers.getStatusLabel('cancelled')).toBe('Отменён')
    })
  })

  describe('getStatusColor', () => {
    it('should return green for active', () => {
      expect(helpers.getStatusColor('active')).toBe('green')
    })

    it('should return blue for in_progress', () => {
      expect(helpers.getStatusColor('in_progress')).toBe('blue')
    })

    it('should return gray for completed', () => {
      expect(helpers.getStatusColor('completed')).toBe('gray')
    })

    it('should return red for cancelled', () => {
      expect(helpers.getStatusColor('cancelled')).toBe('red')
    })
  })

  describe('formatAmount', () => {
    it('should format amount with ruble sign', () => {
      expect(helpers.formatAmount(1000)).toBe('1,000 ₽')
    })

    it('should handle zero', () => {
      expect(helpers.formatAmount(0)).toBe('0 ₽')
    })

    it('should handle large numbers', () => {
      expect(helpers.formatAmount(50000)).toBe('50,000 ₽')
    })
  })

  describe('formatDistance', () => {
    it('should format distance in km for values >= 1', () => {
      expect(helpers.formatDistance(5.5)).toBe('5.5 км')
    })

    it('should format distance in meters for values < 1', () => {
      expect(helpers.formatDistance(0.5)).toBe('500 м')
    })

    it('should handle zero', () => {
      expect(helpers.formatDistance(0)).toBe('0 м')
    })
  })

  describe('formatTime', () => {
    it('should format time in hours and minutes', () => {
      const time = helpers.formatTime(90) // 90 minutes
      expect(time).toContain('1 ч')
      expect(time).toContain('30 мин')
    })

    it('should format minutes only', () => {
      expect(helpers.formatTime(45)).toBe('45 мин')
    })

    it('should handle zero', () => {
      expect(helpers.formatTime(0)).toBe('0 мин')
    })
  })
})









