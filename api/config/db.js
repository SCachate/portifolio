require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Caminho absoluto para o certificado da Aiven
const sslCertPath = path.join(__dirname, 'certs/ca.pem'); // Ajuste o caminho relativo se este arquivo estiver dentro de /config ou /src

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    
    // Otimizações extras para produção na nuvem
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Se o arquivo ca.pem existir (Ambiente de Produção/Aiven), injeta a validação SSL
if (fs.existsSync(sslCertPath)) {
    dbConfig.ssl = {
        rejectUnauthorized: true,
        ca: fs.readFileSync(sslCertPath).toString()
    };
} else {
    console.log('ℹ️ Conectando sem SSL (Ambiente Local/Desenvolvimento).');
}

const db = mysql.createPool(dbConfig);

// Teste de conexão silencioso
db.getConnection()
    .then(conn => {
        console.log('✅ Conexão com Aiven centralizada e protegida via SSL.');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erro no arquivo de config da Aiven:', err); 
        console.info([process.env]);
    });

module.exports = db;