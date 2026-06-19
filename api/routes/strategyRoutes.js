const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const strategyController = require('../controllers/strategyController');

// Proteção global por Token JWT
router.use(authMiddleware);

router.get('/', strategyController.getAllStrategies);
router.post('/', strategyController.createStrategy);
router.put('/:id', strategyController.updateStrategy);
router.delete('/:id', strategyController.deleteStrategy);

module.exports = router;