const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');

// Configuração do Multer para usar a pasta temporária do sistema
const upload = multer({ dest: '/tmp/' });

// --- NOVAS ROTAS ---

// Rota para listar as transações com suporte a filtros (GET)
// Exemplo de uso: /api/transactions?startDate=2026-01-01&brokerId=1
router.get('/', authMiddleware, transactionController.getTransactions);

// Rota para adicionar uma transação manualmente via formulário (POST)
//router.post('/manual', authMiddleware, transactionController.addManual);

// Rota para processar o PDF
router.post('/addPDF', authMiddleware, upload.single('nota'), transactionController.addPDF);

module.exports = router;
