const express = require('express');
const router = express.Router();
const enhancedAIAdminController = require('../controllers/enhancedAIAdminController');
const { requireAdmin, requirePermission } = require('../middleware/adminAuth');

/**
 * POST /api/v1/enhanced-ai-admin/start
 * Запуск расширенного AI-админа (только для супер-админов)
 */
router.post('/start', requireAdmin, requirePermission('ai_management'), enhancedAIAdminController.startEnhancedAIAdmin);

/**
 * POST /api/v1/enhanced-ai-admin/stop
 * Остановка расширенного AI-админа (только для супер-админов)
 */
router.post('/stop', requireAdmin, requirePermission('ai_management'), enhancedAIAdminController.stopEnhancedAIAdmin);

/**
 * GET /api/v1/enhanced-ai-admin/status
 * Получение статуса расширенного AI-админа (только для админов)
 */
router.get('/status', requireAdmin, requirePermission('system_diagnostics'), enhancedAIAdminController.getEnhancedAIAdminStatus);

/**
 * POST /api/v1/enhanced-ai-admin/analyze
 * Принудительный анализ системы (только для админов)
 */
router.post('/analyze', requireAdmin, requirePermission('system_diagnostics'), enhancedAIAdminController.forceEnhancedAnalysis);

/**
 * GET /api/v1/enhanced-ai-admin/logs
 * Получение логов расширенного AI-админа (только для админов)
 */
router.get('/logs', requireAdmin, requirePermission('logs_access'), enhancedAIAdminController.getEnhancedAIAdminLogs);

/**
 * POST /api/v1/enhanced-ai-admin/chat
 * Чат с расширенным AI-админом (только для админов)
 */
router.post('/chat', requireAdmin, requirePermission('system_diagnostics'), enhancedAIAdminController.chatWithEnhancedAIAdmin);

/**
 * GET /api/v1/enhanced-ai-admin/chat/history
 * Получение истории чата (только для админов)
 */
router.get('/chat/history', requireAdmin, requirePermission('logs_access'), enhancedAIAdminController.getChatHistory);

/**
 * POST /api/v1/enhanced-ai-admin/tasks
 * Добавление задачи для AI-админа (только для админов)
 */
router.post('/tasks', requireAdmin, requirePermission('system_settings'), enhancedAIAdminController.addTask);

/**
 * GET /api/v1/enhanced-ai-admin/tasks
 * Получение списка задач (только для админов)
 */
router.get('/tasks', requireAdmin, requirePermission('system_diagnostics'), enhancedAIAdminController.getTasks);

/**
 * PUT /api/v1/enhanced-ai-admin/tasks/:taskId
 * Обновление статуса задачи (только для админов)
 */
router.put('/tasks/:taskId', requireAdmin, requirePermission('system_settings'), enhancedAIAdminController.updateTaskStatus);

/**
 * DELETE /api/v1/enhanced-ai-admin/tasks/:taskId
 * Удаление задачи (только для админов)
 */
router.delete('/tasks/:taskId', requireAdmin, requirePermission('system_settings'), enhancedAIAdminController.deleteTask);

/**
 * POST /api/v1/enhanced-ai-admin/teach
 * Обучение расширенного AI-админа (только для супер-админов)
 */
router.post('/teach', requireAdmin, requirePermission('ai_management'), enhancedAIAdminController.teachEnhancedAIAdmin);

module.exports = router;
