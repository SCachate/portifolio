const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getDividendReportByClass = asyncHandler(async (req, res) => {
    const { inicio, termino } = req.params;
    const userId = req.userId;

    const query = `
        SELECT 
            ce.id AS eventId,
            ce.userId,
            ce.assetId,
            COALESCE(a.ticket, SUBSTR(a.description, 1, 5)) AS ticker,
            a.description AS assetName,
            ce.brokerId,
            b.name AS brokerName,
            ce.eventType,
            DATE_FORMAT(ce.eventDate, '%Y-%m-%d') AS eventDate,
            saldos_historicos.classId,
            ic.name AS className,
            saldos_historicos.quantidade_na_classe AS quantityReceived,
            -- Multiplicação segura prevenindo divisão por zero
            (saldos_historicos.quantidade_na_classe * (ce.amountTotal / IF(ce.quantityChange = 0, 1, ce.quantityChange))) AS amountTotal
        FROM 
            corporate_events ce
        INNER JOIN (
            -- Subquery Point-in-Time isolando o saldo por Usuário, Ativo, Corretora e Classe
            SELECT 
                ce_interno.id AS event_id,
                historico.brokerId,
                historico.classId,
                SUM(historico.q) AS quantidade_na_classe
            FROM corporate_events ce_interno
            INNER JOIN (
                SELECT assetId, brokerId, toClassId AS classId, quantity AS q, eventDate 
                FROM allocation_events 
                WHERE userId = ?
                
                UNION ALL
                
                SELECT assetId, brokerId, fromClassId AS classId, -quantity AS q, eventDate 
                FROM allocation_events 
                WHERE userId = ?
            ) historico ON historico.assetId = ce_interno.assetId 
                       AND historico.brokerId = ce_interno.brokerId
                       AND historico.eventDate <= ce_interno.eventDate
            WHERE ce_interno.userId = ?
            GROUP BY ce_interno.id, historico.brokerId, historico.classId
            HAVING quantidade_na_classe <> 0
        ) saldos_historicos ON saldos_historicos.event_id = ce.id
        LEFT JOIN investment_classes ic ON saldos_historicos.classId = ic.id
        LEFT JOIN brokers b ON ce.brokerId = b.id
        LEFT JOIN assets a ON ce.assetId = a.id
        WHERE ce.userId = ?
          AND ce.eventDate BETWEEN ? AND ?
        ORDER BY ce.eventDate ASC, ce.id ASC;
    `;  

    // Executa a query passando os parâmetros na ordem correta das interrogações (?)
    const [rows] = await db.execute(query, [
        userId,  userId, // Parâmetros da tabela temporária 'historico'
        userId,                           // Parâmetro do filtro ce_interno
        userId, inicio, termino           // Parâmetros do filtro principal da corporate_events
    ]);

    // Montagem da árvore de objetos estruturada (JSON) para consumo no Vue 3
    const report = {
        totalGeneral: 0,
        classes: {}
    };

    rows.forEach(row => {
        const cId = row.classId;
        const className = row.className || 'Não Classificado';
        const bId = row.brokerId;
        const brokerName = row.brokerName || 'Desconhecido';
        const amount = parseFloat(row.amountTotal);

        // 1. Agrupa por Classe
        if (!report.classes[cId]) {
            report.classes[cId] = {
                className: className,
                classTotal: 0,
                brokers: {}
            };
        }

        // 2. Agrupa por Instituição/Corretora
        if (!report.classes[cId].brokers[bId]) {
            report.classes[cId].brokers[bId] = {
                brokerName: brokerName,
                brokerTotal: 0,
                assets: []
            };
        }

        // 3. Insere os detalhes granulares do Ativo
        report.classes[cId].brokers[bId].assets.push({
            eventId: row.eventId,
            assetId: row.assetId,
            ticker: row.ticker,
            assetName: row.assetName,
            eventType: row.eventType,
            eventDate: row.eventDate,
            quantityReceived: parseFloat(row.quantityReceived),
            amountTotal: amount
        });

        // 4. Soma acumulativa dos subtotais e totais
        report.classes[cId].brokers[bId].brokerTotal += amount;
        report.classes[cId].classTotal += amount;
        report.totalGeneral += amount;
    });

    res.json(report);
});

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
		    SELECT assetId
		    FROM (
		        SELECT assetId, quantity 
		        FROM allocation_events 
		        WHERE userId = ? AND toClassId = ?
		        
		        UNION ALL
		        
		        SELECT assetId, -quantity 
		        FROM allocation_events 
		        WHERE userId = ? AND fromClassId = ?
		    ) t
		    GROUP BY assetId
		    -- HAVING SUM(quantity) <> 0
		) resumo
		JOIN assets a ON resumo.assetId = a.id
		JOIN (
		    SELECT 
		        vrda.assetId, 
		        SUM(vrda.lucro_prejuizo_dia_brl) AS total_lucro
		    FROM v_rendimento_diario_asset vrda
		    WHERE vrda.classId = ? 
		      AND vrda.data BETWEEN ? AND ?
		    GROUP BY vrda.assetId
		) stats ON a.id = stats.assetId
		ORDER BY resultado DESC;
    `;  
    const [rows] = await db.execute(query, [userId, classId, userId, classId, classId, inicio, termino ]);
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
    v_rendimento_diario_asset AS vrda
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
	, ic.targetPercent target
	, vpc.ativo
	, vpc.description
	, vpc.corretora
	, vpc.moeda_origem
	, vpc.cotacao_atual_brl
	, vpc.preco_medio_brl
	, vpc.quantidade
	, vpc.valor_mercado_brl
	, vpc.*
FROM
	v_patrimonio_consolidado vpc
	left join investment_classes ic  on ic.id = vpc.classId
where
	vpc.userId = ?
order BY
	vpc.classe,
	vpc.valor_mercado_brl desc	
	`, [userId]);
	res.json(rows);
});