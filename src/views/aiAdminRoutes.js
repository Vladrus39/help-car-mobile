const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');

// AI Admin status endpoint
router.get('/status', requireAdmin, (req, res) => {
  res.json({
    success: true,
    status: 'active',
    enabled: true,
    version: '1.0.0',
    message: 'AI Admin system operational'
  });
});

// Config endpoint
router.get('/config', requireAdmin, (req, res) => {
  res.json({
    success: true,
    config: {
      version: '1.0.0',
      enabled: true,
      features: ['monitoring', 'analysis', 'automation']
    }
  });
});

// Test endpoint
router.post('/test', requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'AI test completed successfully',
    result: 'OK'
  });
});

// Enhanced AI endpoints (proxy to enhanced routes)
router.use('/enhanced', require('./enhancedAIAdminRoutes'));

// Ping endpoint
router.get('/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
