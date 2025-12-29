const express = require('express');
const router = express.Router();
const superAutonomousAIController = require('../controllers/superAutonomousAIController');
const { requireAdmin, requirePermission } = require('../middleware/adminAuth');

/**
 * POST /api/v1/super-ai/start
 * Запуск супер-автономного AI (только для супер-админов)
 */
router.post('/start', requireAdmin, requirePermission('ai_management'), superAutonomousAIController.startSuperAutonomousAI);

/**
 * POST /api/v1/super-ai/stop
 * Остановка супер-автономного AI (только для супер-админов)
 */
router.post('/stop', requireAdmin, requirePermission('ai_management'), superAutonomousAIController.stopSuperAutonomousAI);

/**
 * GET /api/v1/super-ai/status
 * Получение статуса супер-автономного AI (только для админов)
 */
router.get('/status', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.getSuperAutonomousAIStatus);

/**
 * POST /api/v1/super-ai/analyze
 * Принудительный анализ системы (только для админов)
 */
router.post('/analyze', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.forceSuperAutonomousAnalysis);

/**
 * GET /api/v1/super-ai/logs
 * Получение логов супер-автономного AI (только для админов)
 */
router.get('/logs', requireAdmin, requirePermission('logs_access'), superAutonomousAIController.getSuperAutonomousAILogs);

/**
 * POST /api/v1/super-ai/chat
 * Чат с супер-автономным AI как с живым человеком (только для админов)
 */
router.post('/chat', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.chatWithSuperAutonomousAI);

/**
 * GET /api/v1/super-ai/chat/history
 * Получение истории чата (только для админов)
 */
router.get('/chat/history', requireAdmin, requirePermission('logs_access'), superAutonomousAIController.getChatHistory);

/**
 * POST /api/v1/super-ai/consult
 * Консультация с супер-автономным AI (только для админов)
 */
router.post('/consult', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.consultWithSuperAutonomousAI);

/**
 * GET /api/v1/super-ai/personality
 * Получение информации о личности AI (только для админов)
 */
router.get('/personality', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.getPersonality);

/**
 * POST /api/v1/super-ai/tasks
 * Добавление задачи для супер-автономного AI (только для админов)
 */
router.post('/tasks', requireAdmin, requirePermission('system_settings'), superAutonomousAIController.addTask);

/**
 * GET /api/v1/super-ai/tasks
 * Получение списка задач (только для админов)
 */
router.get('/tasks', requireAdmin, requirePermission('system_diagnostics'), superAutonomousAIController.getTasks);

/**
 * PUT /api/v1/super-ai/tasks/:taskId
 * Обновление статуса задачи (только для админов)
 */
router.put('/tasks/:taskId', requireAdmin, requirePermission('system_settings'), superAutonomousAIController.updateTaskStatus);

/**
 * DELETE /api/v1/super-ai/tasks/:taskId
 * Удаление задачи (только для админов)
 */
router.delete('/tasks/:taskId', requireAdmin, requirePermission('system_settings'), superAutonomousAIController.deleteTask);

module.exports = router;
