const db = require('../config/db');

exports.getPendencias = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query('CALL sp_obter_pendencias_dashboard(?)', [userId]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};