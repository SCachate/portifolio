require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const assetRoutes = require('./routes/assetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Garantir que a pasta temporária exista para o multer
const uploadDir = '/tmp';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aumentando o limite para suportar PDFs mais pesados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Rotas
app.use('/auth', authRoutes);
app.use('/classes', classRoutes);
app.use('/assets', assetRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/transactions', transactionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 K-Portfolio rodando sob Arquitetura Limpa na porta ${PORT}`);
});
