const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const securityMonitor = require('../utils/securityMonitor');

// Получить статистику безопасности (только для админов или для мониторинга)
router.get('/stats', protect, (req, res) => {
  try {
    const stats = securityMonitor.getSecurityStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get security stats'
    });
  }
});

module.exports = router;


