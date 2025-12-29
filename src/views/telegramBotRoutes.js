const express = require('express');
const router = express.Router();
const telegramBotController = require('../controllers/telegramBotController');

/**
 * POST /api/v1/telegram-bot/start
 * Запуск Telegram бота
 */
router.post('/start', telegramBotController.startTelegramBot);

/**
 * POST /api/v1/telegram-bot/stop
 * Остановка Telegram бота
 */
router.post('/stop', telegramBotController.stopTelegramBot);

/**
 * GET /api/v1/telegram-bot/status
 * Получение статуса Telegram бота
 */
router.get('/status', telegramBotController.getTelegramBotStatus);

/**
 * POST /api/v1/telegram-bot/send-message
 * Отправка сообщения через Telegram бота
 */
router.post('/send-message', telegramBotController.sendTelegramMessage);

module.exports = router;
