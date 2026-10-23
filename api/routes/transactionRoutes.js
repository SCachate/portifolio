const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');

// Configuração do Multer para usar a pasta temporária do sistema
const upload = multer({ dest: '/tmp/' });

// Rota para listar as transações com suporte a filtros (GET)
router.get('/', authMiddleware, transactionController.getTransactions);

// Rota para adicionar uma transação manualmente via formulário (POST)
router.post('/manual', authMiddleware, transactionController.addManual);

// Rota para atualizar uma transação existente (PUT)
router.put('/:id', authMiddleware, transactionController.updateTransaction);

// Rota para excluir uma transação (DELETE)
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

// Rota para processar o PDF
router.post('/addPDF', authMiddleware, upload.single('nota'), transactionController.addPDF);

module.exports = router;