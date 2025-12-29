const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, chatController.getMyChats);
router.get('/help-request/:helpRequestId', protect, chatController.getChatByRequest);
router.get('/:chatId/messages', protect, chatController.getMessages);
router.post('/', protect, chatController.createChat);
router.post('/:chatId/messages', protect, chatController.sendMessage);

module.exports = router;

