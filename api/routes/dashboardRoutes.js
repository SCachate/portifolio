const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/auth');

router.get('/pendencias', authMiddleware, dashboardController.getPendencias);
router.get('/resumo', authMiddleware, dashboardController.getResumo);
router.get('/evolucao', authMiddleware, dashboardController.getEvolucao);
router.get('/resultado', authMiddleware, dashboardController.getResultado);

module.exports = router;