const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /classes - Lista as classes do usuário logado
exports.getAllClasses = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const query = `
        SELECT id, name, CAST(targetPercent AS DECIMAL(5,2)) AS targetPercent, color 
        FROM investment_classes 
        WHERE userId = ?
        ORDER BY name ASC
    `;
    const [rows] = await db.execute(query, [userId]);
    res.json(rows);
});

// POST /classes - Cria uma nova classe
exports.createClass = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, targetPercent, color } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'O nome da classe é obrigatório.' });
    }

    const query = `
        INSERT INTO investment_classes (userId, name, targetPercent, color) 
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [userId, name, targetPercent || 0, color || '#8884d8']);

    res.status(201).json({ id: result.insertId, message: 'Classe criada com sucesso!' });
});

// PUT /classes/:id - Atualiza uma classe existente
exports.updateClass = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const { name, targetPercent, color } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'O nome da classe é obrigatório.' });
    }

    const query = `
        UPDATE investment_classes 
        SET name = ?, targetPercent = ?, color = ? 
        WHERE id = ? AND userId = ?
    `;
    const [result] = await db.execute(query, [name, targetPercent || 0, color || '#8884d8', id, userId]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Classe não encontrada ou não pertence ao usuário.' });
    }

    res.json({ message: 'Classe atualizada com sucesso!' });
});

// DELETE /classes/:id - Remove uma classe
exports.deleteClass = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    console.info([userId, id]);

    // Opcional: Aqui você poderia checar se existem ativos vinculados a esta classe antes de deletar
    const query = `
        DELETE FROM investment_classes 
        WHERE id = ? AND userId = ?
    `;
    const [result] = await db.execute(query, [id, userId]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Classe não encontrada ou não pertence ao usuário.' });
    }

    res.json({ message: 'Classe removida com sucesso!' });
});