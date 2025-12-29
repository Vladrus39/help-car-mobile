const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/help-request/:helpRequestId', protect, ratingController.create);
router.get('/help-request/:helpRequestId/status', protect, ratingController.getRatingStatus);
router.get('/user/:userId', protect, ratingController.getUserRatings);

module.exports = router;

