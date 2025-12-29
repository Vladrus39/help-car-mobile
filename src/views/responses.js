const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const responseController = require('../controllers/responseController');

// Откликнуться на запрос
router.post('/requests/:requestId/responses', protect, responseController.createResponse);

// Получить отклики на запрос (только автор)
router.get('/requests/:requestId/responses', protect, responseController.getResponsesForRequest);

// Принять помощника (только автор запроса)
router.post('/responses/:responseId/accept', protect, responseController.acceptResponse);

// Отклонить помощника (только автор запроса)
router.post('/responses/:responseId/reject', protect, responseController.rejectResponse);

// Обновить местоположение помощника
router.put('/responses/:responseId/location', protect, responseController.updateHelperLocation);

module.exports = router;

