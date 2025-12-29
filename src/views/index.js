const express = require('express');
const router = express.Router();

// Import route modules (синхронизировано с рабочим кодом в контейнере)
const authRoutes = require('./authRoutes');
const helpRequestRoutes = require('./helpRequestRoutes');
const responseRoutes = require('./responses');
const chatRoutes = require('./chatRoutes');
const uploadRoutes = require('./uploads');
const ratingRoutes = require('./ratingRoutes');
const paymentRoutes = require('./paymentRoutes');
const cityChatRoutes = require('./cityChatRoutes');
const globalChatRoutes = require('./globalChatRoutes');
const notificationRoutes = require('./notificationRoutes');
const mobileRoutes = require('./mobile');
const buildAppRoutes = require('./buildApp');
const pushRoutes = require('./pushRoutes');
const diagnosticsRoutes = require('./diagnosticsRoutes');
// Временно отключено из-за ошибок в контроллерах
// const aiAdminRoutes = require('./aiAdminRoutes');
// const enhancedAIAdminRoutes = require('./enhancedAIAdminRoutes');
// const superAutonomousAIRoutes = require('./superAutonomousAIRoutes');
// const telegramBotRoutes = require('./telegramBotRoutes');
// const securityRoutes = require('./securityRoutes');
const adminRoutes = require('./adminRoutes');
const superAdminRoutes = require('./superAdminRoutes');

// Mount routes
// Специфичные роуты ПЕРЕД общими (чтобы избежать конфликтов)
router.use('/auth', authRoutes);
router.use('/help-requests', helpRequestRoutes);
router.use('/chats', chatRoutes);
router.use('/ratings', ratingRoutes);
router.use('/payments', paymentRoutes);
router.use('/city-chats', cityChatRoutes);
router.use('/global-chats', globalChatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/mobile', mobileRoutes);
router.use('/build', buildAppRoutes);
router.use('/push', pushRoutes);
router.use('/diagnostics', diagnosticsRoutes);
// Временно отключено из-за ошибок в контроллерах
// router.use('/ai-admin', aiAdminRoutes);
// router.use('/ai-admin/enhanced', enhancedAIAdminRoutes);
// router.use('/enhanced-ai-admin', enhancedAIAdminRoutes);
// router.use('/super-ai', superAutonomousAIRoutes);
// router.use('/telegram-bot', telegramBotRoutes);
// router.use('/security', securityRoutes);
router.use('/admin', adminRoutes);
router.use('/super-admin', superAdminRoutes);

// Общие роуты в конце (responseRoutes и uploadRoutes используют '/')
router.use('/', responseRoutes);
router.use('/', uploadRoutes);

module.exports = router;

