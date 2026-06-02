const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Xisto

router.post('/google', authController.googleLogin);

module.exports = router;