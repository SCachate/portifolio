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

exports.getRendimentos = asyncHandler(async (req, res) => {
    const { assetId, classId, inicio, termino } = req.params;
    const [rows] = await db.execute(`
SELECT
	data
	, vrda.valor_inicial_brl inicial
	, vrda.aportes_brl aportes
	, vrda.retiradas_brl retiradas
	, vrda.proventos_brl proventos
	, vrda.valor_final_brl final
	, vrda.lucro_prejuizo_dia_brl resultado
FROM 
    kaxatapi.v_rendimento_diario_asset AS vrda
where 
    vrda.assetid = ?
    and vrda.classId = ?
    and data between ? and ?
`, [assetId, classId, inicio, termino]);
    res.json(rows);
});