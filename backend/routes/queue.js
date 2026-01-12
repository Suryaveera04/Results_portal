const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.post('/join', queueController.joinQueue);
router.get('/status/:token', queueController.getQueueStatus);
router.delete('/leave/:token', queueController.leaveQueue);

module.exports = router;
