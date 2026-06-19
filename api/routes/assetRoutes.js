const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const assetController = require('../controllers/assetController');

router.use(auth);

router.get('/ByClass/:classId/:inicio/:termino', assetController.getAssetsByClassWithResult);
router.get('/Rendimentos/:assetId/:classId/:inicio/:termino',  assetController.getRendimentos);
router.get('/patrimonio', assetController.getPatrimoio);
router.get('/Dividendos/:inicio/:termino', assetController.getDividendReportByClass);
router.get('/', assetController.getAllAssets);
router.post('/', assetController.createAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
