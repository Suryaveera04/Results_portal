const express = require('express');
const router = express.Router();
const resultLinksController = require('../controllers/resultLinksController');

router.get('/available', resultLinksController.getAvailableResults);

module.exports = router;
