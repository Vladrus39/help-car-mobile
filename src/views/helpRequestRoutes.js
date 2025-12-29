const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, helpRequestController.create);
router.get('/', protect, helpRequestController.getAll);
router.get('/my', protect, helpRequestController.getUserRequests);
router.get('/:id', protect, helpRequestController.getById);
router.post('/:id/accept', protect, helpRequestController.accept);
router.post('/:id/complete', protect, helpRequestController.complete);
router.post('/:id/cancel', protect, helpRequestController.cancel);
router.delete('/:id', protect, helpRequestController.deleteRequest);

module.exports = router;

