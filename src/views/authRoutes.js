const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Тестовый эндпоинт для проверки роутинга
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth route is working' });
});

// Middleware для логирования запросов к login
router.post('/login', (req, res, next) => {
  console.log('🔍 [AUTH ROUTE] Login request received');
  console.log('🔍 [AUTH ROUTE] Method:', req.method);
  console.log('🔍 [AUTH ROUTE] URL:', req.url);
  console.log('🔍 [AUTH ROUTE] Path:', req.path);
  console.log('🔍 [AUTH ROUTE] Original URL:', req.originalUrl);
  console.log('🔍 [AUTH ROUTE] Body:', JSON.stringify(req.body));
  console.log('🔍 [AUTH ROUTE] Content-Type:', req.headers['content-type']);
  console.log('🔍 [AUTH ROUTE] Body keys:', Object.keys(req.body || {}));
  console.log('🔍 [AUTH ROUTE] Body is empty?', !req.body || Object.keys(req.body).length === 0);
  next();
}, authController.login);

router.post('/register', authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.post('/location', protect, authController.updateLocation);

module.exports = router;