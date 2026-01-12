const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, resultController.getResult);
router.get('/download', authMiddleware, resultController.downloadPDF);
router.post('/email', authMiddleware, resultController.emailResult);

module.exports = router;
