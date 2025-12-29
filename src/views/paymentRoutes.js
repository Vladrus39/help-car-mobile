const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Создать платеж для заявки
router.post('/help-request/:helpRequestId', protect, paymentController.createPayment);

// Подтвердить платеж
router.post('/:paymentId/confirm', protect, paymentController.confirmPayment);

// Получить платежи пользователя
router.get('/', protect, paymentController.getUserPayments);

// Получить статистику платежей
router.get('/stats', protect, paymentController.getPaymentStats);

module.exports = router;