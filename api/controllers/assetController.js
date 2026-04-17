const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');


exports.getByClass = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { classId } = req.params;
    const [rows] = await db.execute(`
SELECT 
    a.id AS Id,
    COALESCE(a.ticket, substr(a.description,1, 5)) as ticker,
    a.description AS nome_completo
FROM (
    SELECT toClassId AS classId, assetId, quantity AS quantidade, userId 
    FROM allocation_events 
    WHERE toClassId IS NOT NULL    
    UNION ALL    
    SELECT fromClassId AS classId, assetId, -quantity AS quantidade, userId 
    FROM allocation_events 
    WHERE fromClassId IS NOT NULL
) resumo
JOIN investment_classes ic ON resumo.classId = ic.id
JOIN assets a ON resumo.assetId = a.id
WHERE resumo.userId = ?
    and resumo.classId = ?
GROUP BY ic.id, a.id
HAVING SUM(resumo.quantidade)  > 0 
ORDER BY ic.name, a.ticket;`, [userId,classId]);
    res.json(rows);
});