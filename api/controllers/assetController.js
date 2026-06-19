const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getDividendReportByClass = asyncHandler(async (req, res) => {
    const { inicio, termino } = req.params;
    const userId = req.userId;

    // 🔥 Query SQL Corrigida: Filtra os NULLs na origem do cálculo de saldo
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
            (saldos_historicos.quantidade_na_classe * (ce.amountTotal / IF(ce.quantityChange = 0, 1, ce.quantityChange))) AS amountTotal
        FROM 
            corporate_events ce
        INNER JOIN (
            SELECT 
                ce_interno.id AS event_id,
                historico.brokerId,
                historico.classId,
                SUM(historico.q) AS quantidade_na_classe
            FROM corporate_events ce_interno
            INNER JOIN (
                -- 🟢 ENTRADAS: Só contabiliza se a classe de destino for válida
                SELECT assetId, brokerId, toClassId AS classId, quantity AS q, eventDate 
                FROM allocation_events 
                WHERE userId = ? AND toClassId IS NOT NULL
                
                UNION ALL
                
                -- 🔴 SAÍDAS/TRANSFERÊNCIAS: Só contabiliza se a classe de origem for válida
                SELECT assetId, brokerId, fromClassId AS classId, -quantity AS q, eventDate 
                FROM allocation_events 
                WHERE userId = ? AND fromClassId IS NOT NULL
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

    const [rows] = await db.execute(query, [
        userId, userId, // Parâmetros do UNION de saldo histórico
        userId,         // Filtro ce_interno
        userId, inicio, termino // Filtro principal
    ]);

    let acumuladorTotalGeral = 0;

    const report = {
        totalGeneral: 0,
        classes: {}
    };

    rows.forEach(row => {
        const cId = row.classId;
        const className = row.className || 'Não Classificado';
        const bId = row.brokerId;
        const brokerName = row.brokerName || 'Desconhecido';
        const amount = parseFloat(row.amountTotal) || 0;

        if (!report.classes[cId]) {
            report.classes[cId] = {
                className: className,
                classTotal: 0,
                brokers: {}
            };
        }

        if (!report.classes[cId].brokers[bId]) {
            report.classes[cId].brokers[bId] = {
                brokerName: brokerName,
                brokerTotal: 0,
                assets: []
            };
        }

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

        report.classes[cId].brokers[bId].brokerTotal += amount;
        report.classes[cId].classTotal += amount;
        acumuladorTotalGeral += amount;
    });

    report.totalGeneral = acumuladorTotalGeral;

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

// =========================================================================
// MÓDULO DE GESTÃO E CADASTRO DE ATIVOS (CRUD)
// =========================================================================

// GET /assets - Lista ativos com suporte a paginação e busca no banco
exports.getAllAssets = asyncHandler(async (req, res) => {
    const userId = req.userId;
    
    // Captura os parâmetros da URL (ex: /assets?page=1&limit=10&search=petr)
    const page = parseInt(req.query.page) || null;
    const limit = parseInt(req.query.limit) || null;
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;

    let query = `
        SELECT 
            a.id, a.ticket, a.description, a.assetType, a.apiCode,
            a.defaultClassId, a.strategyId, a.currencyAssetId, a.is_liquidity,
            c.name AS className,
            s.name AS strategyName,
            curr.ticket AS currencyTicket
        FROM assets a
        INNER JOIN investment_classes c ON a.defaultClassId = c.id
        LEFT JOIN investment_strategies s ON a.strategyId = s.id
        LEFT JOIN assets curr ON a.currencyAssetId = curr.id
    `;

    const params = [];

    // Se houver busca por texto, filtra direto na query do banco (ganho absurdo de performance)
    if (search) {
        query += ` where (a.ticket LIKE ? OR a.description LIKE ?)`;
        params.push(search, search);
    }

    query += ` ORDER BY a.assetType ASC, a.ticket ASC, a.description ASC`;

    // Se foi solicitada a paginação, faz o cálculo do OFFSET
    if (page && limit) {
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Query secundária rápida para contar o total de registros com o mesmo filtro
        let countQuery = `SELECT COUNT(*) AS total FROM assets`;
          if (search) {
            countQuery += ` AND (ticket LIKE ? OR description LIKE ?)`;
            countParams.push(search, search);
        }

        const [assetsRows] = await db.execute(query, params);
        const [countRows] = await db.execute(countQuery, countParams);

        // Retorna a lista junto com os metadados da paginação
        return res.json({
            data: assetsRows,
            meta: {
                totalItems: countRows[0].total,
                totalPages: Math.ceil(countRows[0].total / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });
    }

    // Fallback: se não passar paginação, traz todos os dados (comportamento original)
    const [rows] = await db.execute(query, params);
    res.json(rows);
});

// POST /assets - Cadastra um novo ativo no dicionário do usuário
exports.createAsset = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { ticket, description, assetType, apiCode, defaultClassId, strategyId, currencyAssetId, is_liquidity } = req.body;

    if (!description || !assetType || !defaultClassId) {
        return res.status(400).json({ error: 'Descrição, Tipo de Ativo e Classe Macro são obrigatórios.' });
    }

    const query = `
        INSERT INTO assets (ticket, description, assetType, apiCode, defaultClassId, strategyId, currencyAssetId, is_liquidity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
        ticket ? ticket.toUpperCase().trim() : null, 
        description.trim(), 
        assetType, 
        apiCode || null, 
        defaultClassId, 
        strategyId || null, 
        currencyAssetId || null, 
        is_liquidity ? 1 : 0
    ]);

    res.status(201).json({ id: result.insertId, message: 'Ativo cadastrado com sucesso!' });
});

// PUT /assets/:id - Modifica os parâmetros de enquadramento do ativo
exports.updateAsset = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const { ticket, description, assetType, apiCode, defaultClassId, strategyId, currencyAssetId, is_liquidity } = req.body;

    const query = `
        UPDATE assets 
        SET ticket = ?, description = ?, assetType = ?, apiCode = ?, defaultClassId = ?, strategyId = ?, currencyAssetId = ?, is_liquidity = ?
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [
        ticket ? ticket.toUpperCase().trim() : null, 
        description.trim(), 
        assetType, 
        apiCode || null, 
        defaultClassId, 
        strategyId || null, 
        currencyAssetId || null, 
        is_liquidity ? 1 : 0,
        id
    ]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ativo não encontrado ou permissão negada.' });
    }

    res.json({ message: 'Ativo atualizado com sucesso!' });
});

// DELETE /assets/:id - Remove a definição de um ativo de forma isolada
exports.deleteAsset = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM assets WHERE id = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ativo não localizado.' });
    }

    res.json({ message: 'Ativo removido do portfólio.' });
});