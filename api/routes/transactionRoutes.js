const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');

router.get('/addPDF', authMiddleware, transactionController.addPDF);

module.exports = router;
