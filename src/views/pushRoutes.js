const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const pushController = require('../controllers/pushController');

router.post('/subscribe', protect, pushController.subscribe);
router.post('/unsubscribe', protect, pushController.unsubscribe);

module.exports = router;










