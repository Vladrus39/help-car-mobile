import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should create toast notification', () => {
    const { toasts, success } = useToast()
    
    expect(toasts.value.length).toBe(0)
    
    success('Test message')
    
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].message).toBe('Test message')
    expect(toasts.value[0].type).toBe('success')
  })

  it('should auto-remove toast after duration', () => {
    const { toasts, success } = useToast()
    
    success('Test message', 'Title', 3000)
    
    expect(toasts.value.length).toBe(1)
    
    vi.advanceTimersByTime(3000)
    
    expect(toasts.value.length).toBe(0)
  })

  it('should handle different toast types', () => {
    const { toasts, success, error, warning, info } = useToast()
    
    success('Success message')
    error('Error message')
    warning('Warning message')
    info('Info message')
    
    expect(toasts.value.length).toBe(4)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[1].type).toBe('error')
    expect(toasts.value[2].type).toBe('warning')
    expect(toasts.value[3].type).toBe('info')
  })

  it('should remove specific toast', () => {
    const { toasts, success, removeToast } = useToast()
    
    const id1 = success('Message 1')
    const id2 = success('Message 2')
    
    expect(toasts.value.length).toBe(2)
    
    removeToast(id1)
    
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].id).toBe(id2)
  })

  it('should clear all toasts', () => {
    const { toasts, success, clearToasts } = useToast()
    
    success('Message 1')
    success('Message 2')
    success('Message 3')
    
    expect(toasts.value.length).toBe(3)
    
    clearToasts()
    
    expect(toasts.value.length).toBe(0)
  })
})

