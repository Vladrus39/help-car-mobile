const express = require('express')
const router = express.Router()
const superAdminController = require('../controllers/superAdminController')
const { requireAdmin } = require('../middleware/adminAuth')

// Middleware для проверки прав super_admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Требуются права super_admin'
    })
  }
  next()
}

// Управление файлами
router.post('/files/read', requireAdmin, requireSuperAdmin, superAdminController.readFile)
router.post('/files/write', requireAdmin, requireSuperAdmin, superAdminController.writeFile)
router.post('/files/list', requireAdmin, requireSuperAdmin, superAdminController.listDirectory)

// Управление системой
router.post('/system/execute', requireAdmin, requireSuperAdmin, superAdminController.executeCommand)
router.get('/system/info/:type', requireAdmin, requireSuperAdmin, superAdminController.getSystemInfo)

// Управление базой данных
router.get('/database/stats', requireAdmin, requireSuperAdmin, superAdminController.getDatabaseStats)
router.post('/database/query', requireAdmin, requireSuperAdmin, superAdminController.executeSQL)

module.exports = router




