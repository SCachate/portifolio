const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');


exports.getAssetsByClassWithResult = asyncHandler(async (req, res) => {
    const { classId, inicio, termino } = req.params;
    const userId = req.userId;

    const query = `
        SELECT 
            a.id AS Id,
            COALESCE(a.ticket, SUBSTR(a.description, 1, 5)) AS ticker,
            a.description AS nome_completo,
            COALESCE(stats.total_lucro, 0) AS resultado
        FROM (
            SELECT assetId, toClassId AS classId
            FROM (
                SELECT assetId, toClassId, quantity FROM allocation_events WHERE toClassId IS NOT NULL AND userId = ?
                UNION ALL
                SELECT assetId, fromClassId, -quantity FROM allocation_events WHERE fromClassId IS NOT NULL AND userId = ?
            ) t
            WHERE toClassId = ?
            GROUP BY assetId, toClassId
            HAVING SUM(quantity) <> 0
        ) resumo
        JOIN assets a ON resumo.assetId = a.id
        LEFT JOIN (
            SELECT 
                vrda.assetId, 
                SUM(vrda.lucro_prejuizo_dia_brl) AS total_lucro
            FROM v_rendimento_diario_asset vrda
            WHERE vrda.classId = ? 
              AND vrda.data BETWEEN ? AND ?
            GROUP BY vrda.assetId
        ) stats ON a.id = stats.assetId
        ORDER BY COALESCE(stats.total_lucro, 0) DESC;
    `;

  
    const [rows] = await db.execute(query, [
        userId, userId, classId, // Parâmetros do bloco 'resumo'
        classId, inicio, termino  // Parâmetros do bloco 'stats'
    ]);

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
    and vrda.data between ? and ?
order by
    vrda.data desc
`, [assetId, classId, inicio, termino]);
    res.json(rows);
});

exports.getPatrimoio = asyncHandler(async (req, res) => {
	const userId = req.userId;
	const [rows] = await db.execute(`
SELECT 
	vpc.classe
	, vpc.ativo
	, vpc.description
	, vpc.corretora
	, vpc.moeda_origem
	, vpc.cotacao_atual_brl
	, vpc.preco_medio_brl
	, vpc.quantidade
	, vpc.valor_mercado_brl
FROM
	v_patrimonio_consolidado vpc
where
	vpc.userId = ?
order BY
	vpc.classe,
	vpc.valor_mercado_brl desc	
	`, [userId]);
	res.json(rows);
});
