/* const express = require('express');
const mysql = require('mysql2/promise');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Conexão com o banco que você importou do dump
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

app.post('/auth/google', async (req, res) => {
        console.log('testando');

    const { token } = req.body;

    try {
        // 1. Verifica se o token do Google é real
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        console.log('testando');

        console.info(googleId);

        /*

        // 2. Procura o usuário na sua tabela 'users' (do seu dump)
        const [rows] = await db.execute('SELECT * FROM users WHERE googleId = ?', [googleId]);

        if (rows.length === 0) {
            // 3. Se não existe, cria ele agora (Engenharia: Auto-registro)
            await db.execute(
                'INSERT INTO users (googleId, email, name) VALUES (?, ?, ?)',
                [googleId, email, name]
            );
            console.log(`Novo usuário cadastrado no K-Portfolio: ${name}`);
        }
        
        res.json({ success: true, user: { name, email, picture } });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Falha na autenticação' });
    }
});

app.listen(3000, () => console.log('API do K-Portfolio rodando na porta 3000'));
*/

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
port: process.env.DB_PORT || 3306
});

db.getConnection()
.then(() => console.log('✅ Conectado ao banco da KingHost com sucesso!'))
.catch(err => console.error('❌ Erro de conexão:', err.message));

app.post('/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
 
        // 2. Procura o usuário na sua tabela 'users' (do seu dump)
        const [rows] = await db.execute('SELECT * FROM users WHERE googleId = ?', [googleId]);

        if (rows.length === 0) {
            // 3. Se não existe, cria ele agora (Engenharia: Auto-registro)
            await db.execute(
                'INSERT INTO users (googleId, email, name) VALUES (?, ?, ?)',
                [googleId, email, name]
            );
            console.log(`Novo usuário cadastrado no K-Portfolio: ${name}`);
        }
        
        res.json({ success: true, user: { name, email, picture } });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Falha na autenticação' });
    }

});

app.listen(3000, () => console.log('🚀 API rodando na porta 3000'));