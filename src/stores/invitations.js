import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInvitationsStore = defineStore('invitations', () => {
  // Приглашения от друзей помочь с заявками
  const invitations = ref([])

  // Загрузка из localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('friendInvitations')
      if (saved) {
        invitations.value = JSON.parse(saved)
        // Удаляем старые приглашения (старше 24 часов)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        invitations.value = invitations.value.filter(inv => inv.timestamp > oneDayAgo)
        saveToStorage()
      }
    } catch (e) {
      console.error('Failed to load invitations:', e)
    }
  }

  // Сохранение в localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('friendInvitations', JSON.stringify(invitations.value))
    } catch (e) {
      console.error('Failed to save invitations:', e)
    }
  }

  // Добавить приглашение
  const addInvitation = (data) => {
    // Проверяем, не дубликат ли
    const exists = invitations.value.some(
      inv => inv.helpRequestId === data.helpRequestId && inv.sender?.id === data.sender?.id
    )
    if (exists) return

    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      helpRequestId: data.helpRequestId,
      problemType: data.problemType,
      description: data.description,
      sender: data.sender,
      message: data.message,
      timestamp: Date.now(),
      status: 'pending' // pending, accepted, declined
    }

    invitations.value.unshift(invitation)
    saveToStorage()
  }

  // Принять приглашение
  const acceptInvitation = (id) => {
    const inv = invitations.value.find(i => i.id === id)
    if (inv) {
      inv.status = 'accepted'
      saveToStorage()
    }
    return inv
  }

  // Отклонить приглашение
  const declineInvitation = (id) => {
    const inv = invitations.value.find(i => i.id === id)
    if (inv) {
      inv.status = 'declined'
      saveToStorage()
    }
  }

  // Удалить приглашение
  const removeInvitation = (id) => {
    invitations.value = invitations.value.filter(i => i.id !== id)
    saveToStorage()
  }

  // Очистить все приглашения
  const clearAll = () => {
    invitations.value = []
    saveToStorage()
  }

  // Только ожидающие
  const pendingInvitations = computed(() => 
    invitations.value.filter(i => i.status === 'pending')
  )

  // Количество ожидающих
  const pendingCount = computed(() => pendingInvitations.value.length)

  // Инициализация
  loadFromStorage()

  return {
    invitations,
    pendingInvitations,
    pendingCount,
    addInvitation,
    acceptInvitation,
    declineInvitation,
    removeInvitation,
    clearAll,
    loadFromStorage
  }
})
