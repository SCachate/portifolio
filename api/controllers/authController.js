const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.decodeToken = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
}

exports.getUserId = async (googleId) => {
  try {

    const [rows] = await db.execute(
      'SELECT id FROM users WHERE googleId = ? LIMIT 1', 
      [googleId]
    );
    return rows.length > 0 ? rows[0].id : null;
    
  } catch (error) {
    console.error('Erro ao buscar ID do usuário:', error);
    return null;
  }
};

exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {

        const { sub: googleId, email, name, picture } = await this.decodeToken(token);

        await db.execute(
            'INSERT INTO users (googleId, email, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?',
            [googleId, email, name, name]
        );

        const [rows] = await db.execute('SELECT id, name FROM users WHERE googleId = ?', [googleId]);
        res.json(rows[0]);
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};