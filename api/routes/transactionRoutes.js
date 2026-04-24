const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');

// Configuração do upload aqui nas rotas
const upload = multer({ dest: '/tmp/' });

// Rota POST com o middleware upload.single
router.post('/addPDF', authMiddleware, upload.single('nota'), transactionController.addPDF);

module.exports = router;
