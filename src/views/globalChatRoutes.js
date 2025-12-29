const express = require('express');
const router = express.Router();
const globalChatController = require('../controllers/globalChatController');
const { protect } = require('../middleware/auth');

// Получить или создать глобальный чат
router.post('/join', protect, globalChatController.getOrCreateGlobalChat);

// Получить сообщения глобального чата
router.get('/:globalChatId/messages', protect, globalChatController.getGlobalChatMessages);

// Отправить сообщение в глобальный чат
router.post('/:globalChatId/messages', protect, globalChatController.sendGlobalChatMessage);

// Покинуть глобальный чат
router.delete('/:globalChatId/leave', protect, globalChatController.leaveGlobalChat);

module.exports = router;





