const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const assetController = require('../controllers/assetController');

router.get('/ByClass/:classId/:inicio/:termino', assetController.getAssetsByClassWithResult);
router.get('/Rendimentos/:assetId/:classId/:inicio/:termino', authMiddleware, assetController.getRendimentos);

module.exports = router;