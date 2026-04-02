require('dotenv').config();
const mysql = require('mysql2/promise');

console.error([process.env.DB_HOST,process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME]); 

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Teste de conexão silencioso
db.getConnection()
    .then(conn => {
        console.log('✅ Conexão com KingHost centralizada.');
        conn.release();
    })
    .catch(err => console.error('❌ Erro no arquivo de config:', err));

module.exports = db;