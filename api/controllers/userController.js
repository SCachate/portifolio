const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /users/profile
exports.getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const query = `
        SELECT 
            id, 
            googleId, 
            email, 
            name, 
            DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt, 
            CPF 
        FROM users 
        WHERE id = ?
    `;

    const [rows] = await db.execute(query, [userId]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não localizado no sistema.' });
    }

    res.json(rows[0]);
});

// PUT /users/profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, email, CPF } = req.body;

    // Regra de negócio: Validação básica obrigatória
    if (!name || !email) {
        return res.status(400).json({ error: 'Nome e Email são informações obrigatórias.' });
    }

    // Garante higienização completa para persistir como BigInt/Decimal se aplicável no MySQL
    const cleanCPF = CPF ? String(CPF).replace(/\D/g, '') : null;

    const query = `
        UPDATE users 
        SET name = ?, email = ?, CPF = ? 
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [name, email, cleanCPF, userId]);

    if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'Houve uma falha interna ao atualizar as informações cadastrais.' });
    }

    res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
});