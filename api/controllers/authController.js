const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // Lógica de banco (Model simplificado)
        await db.execute(
            'INSERT INTO users (googleId, email, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?',
            [googleId, email, name, name]
        );

        const [rows] = await db.execute('SELECT * FROM users WHERE googleId = ?', [googleId]);
        console.info(rows[0]);
        res.json(rows[0]);
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};