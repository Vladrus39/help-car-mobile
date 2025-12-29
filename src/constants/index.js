// Типы проблем
export const PROBLEM_TYPES = {
  battery: 'Севшая батарея',
  fuel: 'Нет топлива',
  towing: 'Буксировка',
  tire: 'Прокол колеса',
  road_conflict: 'Конфликт на дороге',
  other: 'Другое'
}

// Статусы запросов
export const REQUEST_STATUSES = {
  active: 'Активный',
  pending_acceptance: 'Ожидает принятия',
  accepted: 'Принят',
  in_progress: 'В процессе',
  completed: 'Завершен',
  cancelled: 'Отменен'
}

// Статусы откликов
export const RESPONSE_STATUSES = {
  pending: 'Ожидает',
  accepted: 'Принят',
  rejected: 'Отклонен',
  cancelled: 'Отменен'
}

// Оценки рейтинга
export const RATING_STARS = [1, 2, 3, 4, 5]

// Цвета статусов
export const STATUS_COLORS = {
  active: { bg: 'bg-blue-100', text: 'text-blue-800' },
  pending_acceptance: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
}

// Иконки типов проблем
export const PROBLEM_ICONS = {
  battery: '🔋',
  fuel: '⛽',
  towing: '🚗',
  tire: '🛞',
  road_conflict: '🚨',
  other: '🔧'
}

// API настройки
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || `${window.location.origin}/api/v1`,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
}

// WebSocket настройки
export const WS_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || (window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `http://${window.location.host}`),
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000
}

// Навигационные ссылки
export const NAV_LINKS = [
  { path: '/map', label: '🗺️ Карта', icon: 'map' },
  { path: '/my-requests', label: '📋 Мои запросы', icon: 'requests' },
  { path: '/my-helps', label: '🤝 Мои помощи', icon: 'helps' },
  { path: '/profile', label: '👤 Профиль', icon: 'profile' }
]

// Лимиты
export const LIMITS = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 100000,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 500,
  SEARCH_RADIUS_KM: 50
}

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
  UNAUTHORIZED: 'Необходимо войти в систему',
  FORBIDDEN: 'Доступ запрещен',
  NOT_FOUND: 'Ресурс не найден',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже',
  VALIDATION_ERROR: 'Проверьте правильность введенных данных'
}

// Успешные сообщения
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Запрос успешно создан',
  RESPONSE_SENT: 'Отклик отправлен',
  RATING_SUBMITTED: 'Спасибо за оценку!',
  PROFILE_UPDATED: 'Профиль обновлен',
  REQUEST_COMPLETED: 'Запрос завершен'
}

// Экстренные номера
export const EMERGENCY_NUMBERS = {
  UNIFIED: '112', // Единый номер экстренных служб
  RESCUE: '103', // Служба спасения
  POLICE: '102', // Полиция
  AMBULANCE: '103' // Скорая помощь
}

