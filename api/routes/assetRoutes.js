const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const assetController = require('../controllers/assetController');

router.get('/ByClass/:classId', authMiddleware, assetController.getByClass);

module.exports = router;