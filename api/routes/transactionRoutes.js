const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middlewares/auth');

router.get('/addPDF', authMiddleware, classController.getAll);

module.exports = router;
