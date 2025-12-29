import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'

// Подключаем плагин для относительного времени
dayjs.extend(relativeTime)

/**
 * Composable для работы с запросами помощи
 * Переиспользуемые функции для форматирования данных
 */
export function useRequestHelpers() {
  dayjs.locale('ru')

  /**
   * Получить название типа проблемы
   */
  function getProblemTypeName(type) {
    const names = {
      battery: 'Севшая батарея',
      fuel: 'Нет топлива',
      towing: 'Буксировка',
      tire: 'Прокол колеса',
      sober_driver: 'Трезвый водитель',
      road_conflict: 'Конфликт на дороге',
      other: 'Другое'
    }
    return names[type] || 'Помощь'
  }

  /**
   * Получить название статуса
   */
  function getStatusName(status) {
    const names = {
      active: 'Активный',
      accepted: 'Принят',
      pending_acceptance: 'Ожидает принятия',
      in_progress: 'В процессе',
      completed: 'Завершен',
      cancelled: 'Отменен'
    }
    return names[status] || status
  }

  /**
   * Получить CSS классы для статуса
   */
  function getStatusClass(status) {
    const classes = {
      active: 'bg-blue-100 text-blue-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      pending_acceptance: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Форматировать дату с учетом часового пояса пользователя
   * Для недавних заявок показывает относительное время, для старых - полную дату
   * Поддерживает оба формата: created_at (snake_case) и createdAt (camelCase)
   */
  function formatDate(date) {
    if (!date) {
      console.warn('⚠️ formatDate: дата не указана')
      return 'Дата не указана'
    }
    
    // Пробуем несколько способов парсинга
    let parsedDate = null
    
    // 1. Прямой парсинг dayjs
    parsedDate = dayjs(date)
    
    if (!parsedDate.isValid()) {
      // 2. Пробуем через new Date
      const jsDate = new Date(date)
      if (!isNaN(jsDate.getTime())) {
        parsedDate = dayjs(jsDate)
      }
    }
    
    if (!parsedDate || !parsedDate.isValid()) {
      // 3. Пробуем парсить как ISO строку
      if (typeof date === 'string') {
        // Пробуем разные форматы
        const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD']
        for (const fmt of formats) {
          const parsed = dayjs(date, fmt)
          if (parsed.isValid()) {
            parsedDate = parsed
            break
          }
        }
      }
    }
    
    if (!parsedDate || !parsedDate.isValid()) {
      console.error('❌ formatDate: неверная дата:', date)
      return 'Неверная дата'
    }
    
    // Проверка на адекватность даты (не в будущем и не слишком старая)
    const now = dayjs()
    const year = parsedDate.year()
    if (year < 2020 || year > now.year() + 1) {
      console.error('❌ formatDate: неадекватная дата:', date, 'year:', year)
      return 'Неверная дата'
    }
    
    // Для заявок младше 24 часов показываем относительное время
    const hoursDiff = now.diff(parsedDate, 'hour')
    
    if (hoursDiff < 0) {
      // Дата в будущем - показываем абсолютное время
      return parsedDate.format('DD MMMM YYYY, HH:mm')
    }
    
    if (hoursDiff < 24) {
      return parsedDate.fromNow() // "Час назад", "5 минут назад"
    }
    
    // Для старых заявок показываем полную дату (в локальном часовом поясе)
    return parsedDate.format('DD MMMM YYYY, HH:mm')
  }

  /**
   * Получить относительное время (например, "2 часа назад")
   */
  function formatRelativeTime(date) {
    if (!date) {
      return 'Дата не указана'
    }
    
    const parsedDate = dayjs(date)
    
    if (!parsedDate.isValid()) {
      const fallbackDate = dayjs(new Date(date))
      if (fallbackDate.isValid()) {
        return fallbackDate.fromNow()
      }
      return 'Неверная дата'
    }
    
    return parsedDate.fromNow()
  }

  /**
   * Вычислить расстояние между двумя точками (формула Haversine)
   * @param {number} lat1 - широта точки 1
   * @param {number} lon1 - долгота точки 1
   * @param {number} lat2 - широта точки 2
   * @param {number} lon2 - долгота точки 2
   * @returns {number} - расстояние в километрах
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
    return Math.round(distance * 10) / 10 // Округляем до 1 знака после запятой
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  /**
   * Форматировать расстояние для отображения
   */
  function formatDistance(km) {
    if (km < 1) {
      return `${Math.round(km * 1000)} м`
    }
    return `${km.toFixed(1)} км`
  }

  /**
   * Получить иконку для типа проблемы
   */
  function getProblemIcon(type) {
    const icons = {
      battery: '🔋',
      fuel: '⛽',
      tire: '🛞',
      towing: '🚗',
      sober_driver: '🚕',
      road_conflict: '🚨',
      other: '🔧'
    }
    return icons[type] || '❓'
  }

  return {
    getProblemTypeName,
    getStatusName,
    getStatusClass,
    formatDate,
    formatRelativeTime,
    calculateDistance,
    formatDistance,
    getProblemIcon
  }
}













