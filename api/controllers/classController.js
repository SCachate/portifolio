const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// Listar - Sem try/catch!
exports.getAll = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const [rows] = await db.execute('SELECT * FROM investment_classes WHERE userId = ?', [userId]);
    res.json(rows);
});

// Criar
exports.create = asyncHandler(async (req, res) => {
    const { name, userId } = req.body;
    await db.execute('INSERT INTO investment_classes (name, userId) VALUES (?, ?)', [name, userId]);
    res.status(201).json({ success: true, message: 'Classe criada!' });
});

// Atualizar
exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await db.execute('UPDATE investment_classes SET name = ? WHERE id = ?', [name, id]);
    res.json({ success: true, message: 'Classe atualizada!' });
});

// Eliminar
exports.delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.execute('DELETE FROM investment_classes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Classe removida!' });
});