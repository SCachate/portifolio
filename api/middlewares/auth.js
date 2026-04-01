const jwt = require('jsonwebtoken'); // Ou sua biblioteca de validação
const auth = require('../controllers/authController')

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"

  try {
    // Valida o token (aqui você usa sua chave secreta ou o endpoint do Google)
    const {sub: googleId} = await auth.decodeToken(token);
    const userId = await auth.getUserId(googleId);
    req.userId = userId;
    next(); // Permite seguir para o controller
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = authMiddleware;