require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    // Isso diz ao navegador: "Permita que o Google fale com esta página"
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// Rotas (Modularizadas)
app.use('/auth', authRoutes);
app.use('/classes', classRoutes);
app.use('/dashboard/',dashboardRoutes);
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 K-Portfolio rodando sob Arquitetura Limpa na porta ${PORT}`);
});
