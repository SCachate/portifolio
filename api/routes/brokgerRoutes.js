const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const brokerController = require('../controllers/brokerController');

// Todas as rotas de corretoras exigem autenticação
router.use(auth);

// Rota principal para listagem
router.get('/', brokerController.getAllBrokers);

module.exports = router;