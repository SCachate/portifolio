require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const assetRoutes = require('./routes/assetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permite que o seu frontend (localhost) acesse o servidor
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Isso é o que faltava!
}));

app.use(express.json());

app.use((req, res, next) => {
    // Isso diz ao navegador: "Permita que o Google fale com esta página"
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});


app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// Rotas (Modularizadas)
app.use('/auth', authRoutes);
app.use('/classes/', classRoutes);
app.use('/assets/', assetRoutes);
app.use('/dashboard/',dashboardRoutes);
app.user('/transactions/', transactionRoutes);
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 K-Portfolio rodando sob Arquitetura Limpa na porta ${PORT}`);
});
