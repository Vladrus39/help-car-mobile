const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const centralLogger = require('../utils/centralLogger')
const { sequelize } = require('../database')
const AdminActivityLogger = require('../services/adminActivityLogger')

const execAsync = promisify(exec)

/**
 * POST /api/v1/super-admin/files/read
 * Чтение файла
 */
const readFile = async (req, res) => {
  try {
    const { path: filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Путь к файлу не указан'
      })
    }

    // Безопасность: проверяем, что путь не выходит за пределы разрешенных директорий
    const allowedPaths = [
      '/home/vmroadhelp',
      '/var/www',
      process.cwd()
    ]

    const isAllowed = allowedPaths.some(allowed => filePath.startsWith(allowed))
    if (!isAllowed) {
      centralLogger.warn('Super admin attempted to access restricted path', 'super-admin', { path: filePath, adminId: req.admin?.id || req.admin?.adminId })
      return res.status(403).json({
        success: false,
        error: 'Доступ к этому пути запрещен'
      })
    }

    const content = await fs.readFile(filePath, 'utf8')
    const adminId = req.admin?.id || req.admin?.adminId

    centralLogger.info('File read via super admin', 'super-admin', { path: filePath, adminId })
    await AdminActivityLogger.logFileEdit(adminId, filePath, 'read')

    res.json({
      success: true,
      content,
      path: filePath
    })
  } catch (error) {
    centralLogger.error('Read file error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка чтения файла'
    })
  }
}

/**
 * POST /api/v1/super-admin/files/write
 * Запись в файл
 */
const writeFile = async (req, res) => {
  try {
    const { path: filePath, content } = req.body

    if (!filePath || content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Путь к файлу и содержимое обязательны'
      })
    }

    // Безопасность: проверяем, что путь не выходит за пределы разрешенных директорий
    const allowedPaths = [
      '/home/vmroadhelp',
      '/var/www',
      process.cwd()
    ]

    const isAllowed = allowedPaths.some(allowed => filePath.startsWith(allowed))
    if (!isAllowed) {
      centralLogger.warn('Super admin attempted to write to restricted path', 'super-admin', { path: filePath, adminId: req.admin?.id || req.admin?.adminId })
      return res.status(403).json({
        success: false,
        error: 'Доступ к этому пути запрещен'
      })
    }

    // Создаем директорию, если её нет
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(filePath, content, 'utf8')
    const adminId = req.admin?.id || req.admin?.adminId

    centralLogger.info('File written via super admin', 'super-admin', { path: filePath, adminId })
    await AdminActivityLogger.logFileEdit(adminId, filePath, 'write')

    res.json({
      success: true,
      message: 'Файл успешно сохранен',
      path: filePath
    })
  } catch (error) {
    centralLogger.error('Write file error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка записи файла'
    })
  }
}

/**
 * POST /api/v1/super-admin/files/list
 * Список файлов в директории
 */
const listDirectory = async (req, res) => {
  const adminId = getAdminId(req);
  try {
    const { path: dirPath } = req.body
    const targetPath = dirPath || '/home/vmroadhelp'

    // Безопасность - разрешенные пути
    const allowedPaths = [
      '/home/vmroadhelp',
      '/var/www',
      '/app',
      process.cwd()
    ]

    const isAllowed = allowedPaths.some(allowed => targetPath.startsWith(allowed))
    if (!isAllowed) {
      centralLogger.warn('Super admin attempted to list restricted path', 'super-admin', { path: targetPath, adminId });
      return res.status(403).json({
        success: false,
        error: 'Доступ к этому пути запрещен'
      })
    }

    // Проверяем существование директории
    let stats;
    try {
      stats = await fs.stat(targetPath)
      if (!stats.isDirectory()) {
        centralLogger.warn('Super admin attempted to list a non-directory path', 'super-admin', { path: targetPath, adminId });
        return res.status(400).json({
          success: false,
          error: 'Указанный путь не является директорией'
        })
      }
    } catch (statError) {
      if (statError.code === 'ENOENT') {
        centralLogger.warn('Super admin attempted to list non-existent path', 'super-admin', { path: targetPath, adminId, error: statError.message });
        return res.status(404).json({
          success: false,
          error: 'Директория не найдена'
        })
      }
      centralLogger.error('Error checking directory stats', 'super-admin', { path: targetPath, adminId, error: statError });
      throw statError
    }

    const items = []
    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(targetPath, entry.name)
        try {
          const itemStats = await fs.stat(fullPath)
          items.push({
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: itemStats.size,
            modified: itemStats.mtime
          })
        } catch (e) {
          // Пропускаем файлы, к которым нет доступа
          centralLogger.warn('Cannot access file in listDirectory', 'super-admin', {
            path: fullPath,
            error: e.message,
            adminId
          })
        }
      }
    } catch (readError) {
      centralLogger.error('Error reading directory', 'super-admin', {
        path: targetPath,
        error: readError.message || readError,
        stack: readError.stack,
        adminId
      })
      throw readError
    }

    centralLogger.info('Directory listed via super admin', 'super-admin', { path: targetPath, adminId, itemsCount: items.length });

    res.json({
      success: true,
      items,
      path: targetPath
    })
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    centralLogger.error('List directory error', 'super-admin', {
      error: errorMessage,
      stack: error?.stack,
      path: req.body?.path,
      adminId
    })
    res.status(500).json({
      success: false,
      error: errorMessage || 'Ошибка получения списка файлов'
    })
  }
}

/**
 * POST /api/v1/super-admin/system/execute
 * Выполнение системной команды
 */
const executeCommand = async (req, res) => {
  try {
    const { command } = req.body

    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Команда не указана'
      })
    }

    // Безопасность: разрешаем только безопасные команды
    const dangerousCommands = ['rm -rf', 'dd if=', 'mkfs', 'fdisk', 'format']
    const isDangerous = dangerousCommands.some(cmd => command.toLowerCase().includes(cmd))
    
    if (isDangerous) {
      centralLogger.warn('Super admin attempted dangerous command', 'super-admin', { command, adminId: req.admin?.id || req.admin?.adminId })
      return res.status(403).json({
        success: false,
        error: 'Эта команда запрещена из соображений безопасности'
      })
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 секунд максимум
      maxBuffer: 1024 * 1024 * 10 // 10MB максимум
    })
    const adminId = req.admin?.id || req.admin?.adminId

    centralLogger.info('System command executed via super admin', 'super-admin', { command, adminId })
    await AdminActivityLogger.logCommand(adminId, command, stdout || stderr)

    res.json({
      success: true,
      output: stdout || stderr || 'Команда выполнена успешно',
      error: stderr || null
    })
  } catch (error) {
    centralLogger.error('Execute command error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка выполнения команды',
      output: error.stdout || error.stderr || ''
    })
  }
}

/**
 * GET /api/v1/super-admin/system/info/:type
 * Получение информации о системе
 */
const getSystemInfo = async (req, res) => {
  try {
    const { type } = req.params

    let command = ''
    switch (type) {
      case 'memory':
        command = 'free -h'
        break
      case 'disk':
        command = 'df -h'
        break
      case 'cpu':
        command = 'top -bn1 | head -20'
        break
      default:
        return res.status(400).json({
          success: false,
          error: 'Неизвестный тип информации'
        })
    }

    const { stdout } = await execAsync(command, { timeout: 10000 })

    res.json({
      success: true,
      info: stdout
    })
  } catch (error) {
    centralLogger.error('Get system info error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка получения информации о системе'
    })
  }
}

/**
 * GET /api/v1/super-admin/database/stats
 * Статистика базы данных
 */
const getDatabaseStats = async (req, res) => {
  try {
    const { User, HelpRequest, Response, Chat, Message, CityChat, Admin } = sequelize.models

    const stats = {
      users: await User.count(),
      helpRequests: await HelpRequest.count(),
      responses: await Response.count(),
      chats: await Chat.count(),
      messages: await Message.count(),
      cityChats: await CityChat.count(),
      admins: await Admin.count()
    }

    res.json({
      success: true,
      stats
    })
  } catch (error) {
    centralLogger.error('Get database stats error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка получения статистики'
    })
  }
}

/**
 * POST /api/v1/super-admin/database/query
 * Выполнение SQL запроса
 */
const executeSQL = async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'SQL запрос не указан'
      })
    }

    // Безопасность: разрешаем только SELECT, SHOW, DESCRIBE, EXPLAIN
    const upperQuery = query.trim().toUpperCase()
    const allowedCommands = ['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN']
    const isAllowed = allowedCommands.some(cmd => upperQuery.startsWith(cmd))

    if (!isAllowed) {
      centralLogger.warn('Super admin attempted non-SELECT SQL query', 'super-admin', { query, adminId: req.admin?.id || req.admin?.adminId })
      return res.status(403).json({
        success: false,
        error: 'Разрешены только SELECT, SHOW, DESCRIBE, EXPLAIN запросы'
      })
    }

    const [results] = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    })
    const adminId = req.admin?.id || req.admin?.adminId

    centralLogger.info('SQL query executed via super admin', 'super-admin', { query, adminId })
    await AdminActivityLogger.logSQLQuery(adminId, query, results)

    res.json({
      success: true,
      result: results
    })
  } catch (error) {
    centralLogger.error('Execute SQL error', 'super-admin', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Ошибка выполнения SQL запроса'
    })
  }
}

module.exports = {
  readFile,
  writeFile,
  listDirectory,
  executeCommand,
  getSystemInfo,
  getDatabaseStats,
  executeSQL
}



