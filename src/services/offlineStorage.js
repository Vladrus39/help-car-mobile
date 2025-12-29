/**
 * Оффлайн хранилище для мессенджера Help Car
 * 
 * Использует SQLite для хранения сообщений, чатов, контактов
 * Работает полностью оффлайн, синхронизируется при появлении сети
 */

import { Capacitor } from '@capacitor/core'

// SQLite будет загружен динамически только в нативном приложении
let sqlite = null
let db = null

/**
 * Инициализация базы данных
 */
export async function initDatabase() {
  if (!Capacitor.isNativePlatform()) {
    console.log('💾 Using IndexedDB for web')
    return initIndexedDB()
  }
  
  try {
    const { CapacitorSQLite } = await import('@capacitor-community/sqlite')
    sqlite = CapacitorSQLite
    
    // Создаём соединение
    db = await sqlite.createConnection({
      database: 'helpcar_messenger',
      version: 1,
      encrypted: false,
      mode: 'no-encryption'
    })
    
    await db.open()
    
    // Создаём таблицы
    await createTables()
    
    console.log('💾 SQLite database initialized')
    return true
  } catch (error) {
    console.error('Failed to init SQLite:', error)
    return initIndexedDB()
  }
}

/**
 * Создание таблиц
 */
async function createTables() {
  const queries = [
    // Сообщения
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'text',
      media_url TEXT,
      created_at INTEGER NOT NULL,
      read_at INTEGER,
      delivered_at INTEGER,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    )`,
    
    // Чаты
    `CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      type TEXT DEFAULT 'private',
      name TEXT,
      avatar_url TEXT,
      last_message_id TEXT,
      last_message_at INTEGER,
      unread_count INTEGER DEFAULT 0,
      muted INTEGER DEFAULT 0,
      pinned INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 0
    )`,
    
    // Участники чатов
    `CREATE TABLE IF NOT EXISTS chat_participants (
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at INTEGER,
      PRIMARY KEY (chat_id, user_id)
    )`,
    
    // Контакты (кэш пользователей)
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      is_online INTEGER DEFAULT 0,
      last_seen INTEGER,
      is_favorite INTEGER DEFAULT 0,
      synced_at INTEGER
    )`,
    
    // Очередь отправки (для оффлайн сообщений)
    `CREATE TABLE IF NOT EXISTS send_queue (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'text',
      media_path TEXT,
      created_at INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0
    )`,
    
    // Настройки
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
    
    // Индексы для быстрого поиска
    `CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sync ON messages(synced)`,
    `CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats(last_message_at DESC)`
  ]
  
  for (const query of queries) {
    await db.execute({ statement: query })
  }
}

/**
 * IndexedDB fallback для веб-версии
 */
let indexedDB = null

async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('helpcar_messenger', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' })
        messagesStore.createIndex('chat_id', 'chat_id', { unique: false })
        messagesStore.createIndex('synced', 'synced', { unique: false })
      }
      
      // Chats store
      if (!db.objectStoreNames.contains('chats')) {
        const chatsStore = db.createObjectStore('chats', { keyPath: 'id' })
        chatsStore.createIndex('last_message_at', 'last_message_at', { unique: false })
      }
      
      // Contacts store
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' })
      }
      
      // Send queue
      if (!db.objectStoreNames.contains('send_queue')) {
        db.createObjectStore('send_queue', { keyPath: 'id' })
      }
      
      // Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    
    request.onsuccess = () => {
      indexedDB = request.result
      console.log('💾 IndexedDB initialized')
      resolve(true)
    }
  })
}

// ==================== MESSAGES ====================

/**
 * Сохранить сообщение
 */
export async function saveMessage(message) {
  const data = {
    id: message.id || crypto.randomUUID(),
    chat_id: message.chat_id,
    sender_id: message.sender_id,
    content: message.content,
    type: message.type || 'text',
    media_url: message.media_url || null,
    created_at: message.created_at || Date.now(),
    read_at: message.read_at || null,
    delivered_at: message.delivered_at || null,
    synced: message.synced ? 1 : 0,
    deleted: 0
  }
  
  if (db) {
    await db.run({
      statement: `INSERT OR REPLACE INTO messages 
        (id, chat_id, sender_id, content, type, media_url, created_at, read_at, delivered_at, synced, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [data.id, data.chat_id, data.sender_id, data.content, data.type, 
               data.media_url, data.created_at, data.read_at, data.delivered_at, data.synced, data.deleted]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('messages', 'readwrite')
    tx.objectStore('messages').put(data)
  }
  
  return data
}

/**
 * Получить сообщения чата
 */
export async function getMessages(chatId, limit = 50, beforeTimestamp = null) {
  if (db) {
    let query = `SELECT * FROM messages WHERE chat_id = ? AND deleted = 0`
    const values = [chatId]
    
    if (beforeTimestamp) {
      query += ` AND created_at < ?`
      values.push(beforeTimestamp)
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`
    values.push(limit)
    
    const result = await db.query({ statement: query, values })
    return result.values || []
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('messages', 'readonly')
      const store = tx.objectStore('messages')
      const index = store.index('chat_id')
      const request = index.getAll(chatId)
      
      request.onsuccess = () => {
        let messages = request.result || []
        if (beforeTimestamp) {
          messages = messages.filter(m => m.created_at < beforeTimestamp)
        }
        messages.sort((a, b) => b.created_at - a.created_at)
        resolve(messages.slice(0, limit))
      }
    })
  }
  
  return []
}

/**
 * Получить несинхронизированные сообщения
 */
export async function getUnsyncedMessages() {
  if (db) {
    const result = await db.query({
      statement: 'SELECT * FROM messages WHERE synced = 0 ORDER BY created_at ASC',
      values: []
    })
    return result.values || []
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('messages', 'readonly')
      const index = tx.objectStore('messages').index('synced')
      const request = index.getAll(0)
      request.onsuccess = () => resolve(request.result || [])
    })
  }
  return []
}

/**
 * Отметить сообщение как синхронизированное
 */
export async function markMessageSynced(messageId) {
  if (db) {
    await db.run({
      statement: 'UPDATE messages SET synced = 1 WHERE id = ?',
      values: [messageId]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('messages', 'readwrite')
    const store = tx.objectStore('messages')
    const request = store.get(messageId)
    request.onsuccess = () => {
      if (request.result) {
        request.result.synced = 1
        store.put(request.result)
      }
    }
  }
}

// ==================== CHATS ====================

/**
 * Сохранить чат
 */
export async function saveChat(chat) {
  const data = {
    id: chat.id,
    type: chat.type || 'private',
    name: chat.name,
    avatar_url: chat.avatar_url,
    last_message_id: chat.last_message_id,
    last_message_at: chat.last_message_at || Date.now(),
    unread_count: chat.unread_count || 0,
    muted: chat.muted ? 1 : 0,
    pinned: chat.pinned ? 1 : 0,
    synced: chat.synced ? 1 : 0
  }
  
  if (db) {
    await db.run({
      statement: `INSERT OR REPLACE INTO chats 
        (id, type, name, avatar_url, last_message_id, last_message_at, unread_count, muted, pinned, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [data.id, data.type, data.name, data.avatar_url, data.last_message_id,
               data.last_message_at, data.unread_count, data.muted, data.pinned, data.synced]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('chats', 'readwrite')
    tx.objectStore('chats').put(data)
  }
  
  return data
}

/**
 * Получить все чаты
 */
export async function getChats() {
  if (db) {
    const result = await db.query({
      statement: 'SELECT * FROM chats ORDER BY pinned DESC, last_message_at DESC',
      values: []
    })
    return result.values || []
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('chats', 'readonly')
      const request = tx.objectStore('chats').getAll()
      request.onsuccess = () => {
        const chats = request.result || []
        chats.sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned
          return b.last_message_at - a.last_message_at
        })
        resolve(chats)
      }
    })
  }
  return []
}

/**
 * Обновить счётчик непрочитанных
 */
export async function updateUnreadCount(chatId, count) {
  if (db) {
    await db.run({
      statement: 'UPDATE chats SET unread_count = ? WHERE id = ?',
      values: [count, chatId]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('chats', 'readwrite')
    const store = tx.objectStore('chats')
    const request = store.get(chatId)
    request.onsuccess = () => {
      if (request.result) {
        request.result.unread_count = count
        store.put(request.result)
      }
    }
  }
}

// ==================== CONTACTS ====================

/**
 * Сохранить контакт
 */
export async function saveContact(contact) {
  const data = {
    id: contact.id,
    full_name: contact.full_name,
    avatar_url: contact.avatar_url,
    phone: contact.phone,
    is_online: contact.is_online ? 1 : 0,
    last_seen: contact.last_seen,
    is_favorite: contact.is_favorite ? 1 : 0,
    synced_at: Date.now()
  }
  
  if (db) {
    await db.run({
      statement: `INSERT OR REPLACE INTO contacts 
        (id, full_name, avatar_url, phone, is_online, last_seen, is_favorite, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [data.id, data.full_name, data.avatar_url, data.phone, 
               data.is_online, data.last_seen, data.is_favorite, data.synced_at]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('contacts', 'readwrite')
    tx.objectStore('contacts').put(data)
  }
  
  return data
}

/**
 * Получить контакт по ID
 */
export async function getContact(userId) {
  if (db) {
    const result = await db.query({
      statement: 'SELECT * FROM contacts WHERE id = ?',
      values: [userId]
    })
    return result.values?.[0] || null
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('contacts', 'readonly')
      const request = tx.objectStore('contacts').get(userId)
      request.onsuccess = () => resolve(request.result || null)
    })
  }
  return null
}

// ==================== SEND QUEUE ====================

/**
 * Добавить сообщение в очередь отправки (для оффлайн)
 */
export async function addToSendQueue(message) {
  const data = {
    id: crypto.randomUUID(),
    chat_id: message.chat_id,
    content: message.content,
    type: message.type || 'text',
    media_path: message.media_path,
    created_at: Date.now(),
    retry_count: 0
  }
  
  if (db) {
    await db.run({
      statement: `INSERT INTO send_queue (id, chat_id, content, type, media_path, created_at, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values: [data.id, data.chat_id, data.content, data.type, data.media_path, data.created_at, data.retry_count]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('send_queue', 'readwrite')
    tx.objectStore('send_queue').put(data)
  }
  
  return data
}

/**
 * Получить очередь отправки
 */
export async function getSendQueue() {
  if (db) {
    const result = await db.query({
      statement: 'SELECT * FROM send_queue ORDER BY created_at ASC',
      values: []
    })
    return result.values || []
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('send_queue', 'readonly')
      const request = tx.objectStore('send_queue').getAll()
      request.onsuccess = () => resolve(request.result || [])
    })
  }
  return []
}

/**
 * Удалить из очереди отправки
 */
export async function removeFromSendQueue(id) {
  if (db) {
    await db.run({
      statement: 'DELETE FROM send_queue WHERE id = ?',
      values: [id]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('send_queue', 'readwrite')
    tx.objectStore('send_queue').delete(id)
  }
}

// ==================== SETTINGS ====================

export async function setSetting(key, value) {
  if (db) {
    await db.run({
      statement: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      values: [key, JSON.stringify(value)]
    })
  } else if (indexedDB) {
    const tx = indexedDB.transaction('settings', 'readwrite')
    tx.objectStore('settings').put({ key, value: JSON.stringify(value) })
  }
}

export async function getSetting(key, defaultValue = null) {
  if (db) {
    const result = await db.query({
      statement: 'SELECT value FROM settings WHERE key = ?',
      values: [key]
    })
    if (result.values?.[0]?.value) {
      return JSON.parse(result.values[0].value)
    }
  } else if (indexedDB) {
    return new Promise((resolve) => {
      const tx = indexedDB.transaction('settings', 'readonly')
      const request = tx.objectStore('settings').get(key)
      request.onsuccess = () => {
        if (request.result?.value) {
          resolve(JSON.parse(request.result.value))
        } else {
          resolve(defaultValue)
        }
      }
    })
  }
  return defaultValue
}

// ==================== SYNC ====================

/**
 * Синхронизировать данные с сервером
 */
export async function syncWithServer(apiService) {
  console.log('🔄 Starting sync...')
  
  try {
    // 1. Отправляем сообщения из очереди
    const queue = await getSendQueue()
    for (const item of queue) {
      try {
        await apiService.sendMessage(item.chat_id, {
          content: item.content,
          type: item.type
        })
        await removeFromSendQueue(item.id)
      } catch (err) {
        console.error('Failed to send queued message:', err)
      }
    }
    
    // 2. Получаем новые сообщения с сервера
    const lastSync = await getSetting('lastSyncAt', 0)
    const newMessages = await apiService.getMessagesSince(lastSync)
    
    for (const msg of newMessages) {
      await saveMessage({ ...msg, synced: true })
    }
    
    // 3. Обновляем время синхронизации
    await setSetting('lastSyncAt', Date.now())
    
    console.log('✅ Sync completed')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

export default {
  initDatabase,
  saveMessage,
  getMessages,
  getUnsyncedMessages,
  markMessageSynced,
  saveChat,
  getChats,
  updateUnreadCount,
  saveContact,
  getContact,
  addToSendQueue,
  getSendQueue,
  removeFromSendQueue,
  setSetting,
  getSetting,
  syncWithServer
}
