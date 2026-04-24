const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');

// Configuração do Multer para usar a pasta temporária do sistema
const upload = multer({ dest: '/tmp/' });

// Rota para processar o PDF (POST é obrigatório para uploads)
router.post('/addPDF', authMiddleware, upload.single('nota'), transactionController.addPDF);

module.exports = router;
