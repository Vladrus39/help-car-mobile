const express = require('express');
const router = express.Router();
const cityChatController = require('../controllers/cityChatController');
const { protect } = require('../middleware/auth');

// Получить или создать городской чат
router.post('/join', protect, cityChatController.getOrCreateCityChat);

// Получить список чатов пользователя
router.get('/my-chats', protect, cityChatController.getUserCityChats);

// Получить сообщения чата
router.get('/:cityChatId/messages', protect, cityChatController.getCityChatMessages);

// Отправить сообщение
router.post('/:cityChatId/messages', protect, cityChatController.sendMessage);

// Покинуть чат
router.post('/:cityChatId/leave', protect, cityChatController.leaveCityChat);

// Список городов
router.get('/cities', protect, cityChatController.getCities);

module.exports = router;

