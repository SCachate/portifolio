const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');

router.get('/addPDF', authMiddleware, classController.addPDF);

module.exports = router;
