const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin, requirePermission } = require('../middleware/adminAuth');

/**
 * POST /api/v1/admin/login
 * Авторизация админа
 */
router.post('/login', adminController.login);

/**
 * GET /api/v1/admin/profile
 * Получить профиль админа
 */
router.get('/profile', requireAdmin, adminController.getProfile);

/**
 * GET /api/v1/admin/dashboard
 * Получить данные для админ-панели
 */
router.get('/dashboard', requireAdmin, requirePermission('system_diagnostics'), adminController.getDashboard);

/**
 * GET /api/v1/admin/logs/:category
 * Получить логи (только для админов)
 */
router.get('/logs/:category', requireAdmin, requirePermission('logs_access'), adminController.getLogs);

/**
 * POST /api/v1/admin/logs/cleanup
 * Очистить логи (только для админов)
 */
router.post('/logs/cleanup', requireAdmin, requirePermission('system_settings'), adminController.cleanupLogs);

/**
 * GET /api/v1/admin/users
 * Получить список пользователей (только для админов)
 */
router.get('/users', requireAdmin, requirePermission('user_management'), adminController.getUsers);

/**
 * POST /api/v1/admin/logout
 * Выход админа
 */
router.post('/logout', requireAdmin, adminController.logout);

// Логирование ошибок (альтернатива Sentry)
const errorLogController = require('../controllers/errorLogController');
router.get('/errors', requireAdmin, errorLogController.getErrors);
router.get('/errors/stats', requireAdmin, errorLogController.getErrorStats);
router.post('/errors/:id/resolve', requireAdmin, errorLogController.resolveError);
router.post('/errors/log', requireAdmin, errorLogController.logError);

// Бэкапы
const backupController = require('../controllers/backupController');
router.post('/backup/create', requireAdmin, requirePermission('system_settings'), backupController.createBackup);
router.get('/backup/list', requireAdmin, requirePermission('system_settings'), backupController.listBackups);
router.post('/backup/restore', requireAdmin, requirePermission('system_settings'), backupController.restoreBackup);
router.get('/backup/download', requireAdmin, requirePermission('system_settings'), backupController.downloadBackup);

// Система
const systemController = require('../controllers/systemController');
router.get('/system/processes', requireAdmin, requirePermission('system_diagnostics'), systemController.getProcesses);
router.get('/system/docker/containers', requireAdmin, requirePermission('system_control'), systemController.getDockerContainers);
router.post('/system/docker/container/:id/restart', requireAdmin, requirePermission('system_control'), systemController.restartDockerContainer);
router.get('/system/logs/realtime', requireAdmin, requirePermission('logs_access'), systemController.getRealtimeLogs);
router.get('/system/env', requireAdmin, requirePermission('system_settings'), systemController.getEnvironmentVariables);
router.get('/system/git/status', requireAdmin, requirePermission('system_diagnostics'), systemController.getGitStatus);
router.get('/system/active-connections', requireAdmin, requirePermission('system_diagnostics'), systemController.getActiveConnections);

module.exports = router;
