const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /strategies - Lista as estratégias trazendo dados da classe pai
exports.getAllStrategies = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const query = `
        SELECT 
            s.id, 
            s.name, 
            s.classId,
            c.name AS className,
            CAST(s.targetPercent AS DECIMAL(5,2)) AS targetPercent
        FROM investment_strategies s
        INNER JOIN investment_classes c ON s.classId = c.id
        WHERE c.userId = ?
        ORDER BY c.name
    `;

    const [rows] = await db.execute(query, [userId]);
    return res.status(200).json(rows);
});

// POST /strategies - Cria uma nova estratégia vinculada a uma classe
exports.createStrategy = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, classId, targetPercent } = req.body;

    if (!name || !classId) {
        return res.status(400).json({ error: 'Os campos Nome e Classe Macro são obrigatórios.' });
    }

    const query = `
        INSERT INTO investment_strategies ( classId, name, targetPercent) 
        VALUES ( ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
        classId,
        name,
        targetPercent || 0.00
    ]);

    return res.status(201).json({ 
        id: result.insertId, 
        message: 'Estratégia de investimento gerada com sucesso!' 
    });
});

// PUT /strategies/:id - Atualiza os dados da estratégia
exports.updateStrategy = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, classId, targetPercent } = req.body;

    if (!name || !classId) {
        return res.status(400).json({ error: 'Os campos Nome e Classe Macro são obrigatórios.' });
    }

    const query = `
        UPDATE investment_strategies 
        SET name = ?, classId = ?, targetPercent = ? 
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [name, classId, targetPercent || 0.00, id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Estratégia não localizada ou permissão negada.' });
    }

    return res.status(200).json({ message: 'Estratégia atualizada com sucesso!' });
});

// DELETE /strategies/:id - Remove a estratégia
exports.deleteStrategy = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM investment_strategies 
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Estratégia não localizada ou permissão negada.' });
    }

    return res.status(200).json({ success: true, message: 'Estratégia excluída com sucesso!' });
});