const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /brokers - Lista todas as corretoras do sistema
exports.getAllBrokers = asyncHandler(async (req, res) => {
    const query = `SELECT id, name, cnpj FROM brokers ORDER BY name ASC`;
    const [rows] = await db.execute(query);
    res.json(rows);
});