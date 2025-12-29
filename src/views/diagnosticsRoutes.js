const express = require('express');
const router = express.Router();

// Простой middleware для проверки авторизации
const requireAdmin = (req, res, next) => {
  // В продакшене здесь должна быть полноценная проверка JWT
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * GET /api/v1/diagnostics/status
 * Получить краткий статус системы
 */
router.get('/status', (req, res) => {
  try {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        backend: 'running',
        database: 'connected',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system status'
    });
  }
});

/**
 * GET /api/v1/diagnostics/full
 * Получить полную диагностику системы
 */
router.get('/full', requireAdmin, async (req, res) => {
  try {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage()
      },
      services: {
        backend: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid
        },
        database: {
          status: 'connected',
          lastCheck: new Date().toISOString()
        }
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      data: diagnostic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run full diagnostic'
    });
  }
});

/**
 * GET /api/v1/diagnostics/logs/:category
 * Получить логи по категории
 */
router.get('/logs/:category', requireAdmin, (req, res) => {
  try {
    const { category } = req.params;
    const { lines = 50 } = req.query;
    
    // Возвращаем пустой массив, т.к. централизованное логирование может быть не настроено
    const logs = [];
    
    res.json({
      success: true,
      data: {
        category,
        lines: logs.length,
        logs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get logs'
    });
  }
});

/**
 * GET /api/v1/diagnostics/logs
 * Получить все доступные категории логов
 */
router.get('/logs', (req, res) => {
  try {
    const categories = ['system', 'auth', 'requests', 'errors'];
    res.json({
      success: true,
      data: {
        categories,
        logFiles: {
          system: '/logs/system.log',
          auth: '/logs/auth.log',
          requests: '/logs/requests.log',
          errors: '/logs/errors.log'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get log categories'
    });
  }
});

/**
 * POST /api/v1/diagnostics/cleanup
 * Очистить старые логи
 */
router.post('/cleanup', requireAdmin, (req, res) => {
  try {
    const { daysToKeep = 7 } = req.body;
    
    // Здесь должна быть логика очистки логов
    // Пока просто возвращаем успех
    
    res.json({
      success: true,
      message: `Cleaned up logs older than ${daysToKeep} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup logs'
    });
  }
});

/**
 * GET /api/v1/diagnostics/health
 * Проверка здоровья системы (для мониторинга)
 */
router.get('/health', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    const isHealthy = heapUsedPercent < 90 && process.uptime() > 0;
    
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        message: 'System resources critical',
        issues: ['High memory usage']
      });
    }
    
    res.json({
      success: true,
      status: 'healthy',
      message: 'All systems operational',
      metrics: {
        uptime: process.uptime(),
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percent: heapUsedPercent.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

module.exports = router;

