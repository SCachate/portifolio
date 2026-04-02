const db = require('../config/db');

exports.getPendencias = async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_obter_pendencias_dashboard(?)', [req.userId]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getResumo = async (req, res) => {
    try {
        const query = `
            SELECT vepc.nome_classe AS classe, vepc.patrimonio_classe AS valor, vepc.cor_classe AS cor 
            FROM v_evolucao_por_classe vepc 
            WHERE vepc.referenceDate = (SELECT MAX(vepc2.referenceDate) FROM v_evolucao_por_classe vepc2)
              AND vepc.userId = ?`;
        
        const [rows] = await db.execute(query, [req.userId]);
        const formattedRows = rows.map(row => ({
            classe: row.classe,
            valor: parseFloat(row.valor),
            color: row.cor // Envia a cor para o frontend
        }));
        res.json(formattedRows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getEvolucao = async (req, res) => {
    try {
        const { ano } = req.query;
        // A query que você forneceu, mantendo userId e ano fixos para seus testes
        const query = `
            SELECT 
                nome_classe AS name,
                'column' AS type,
                mes,
                patrimonio_classe AS valor,
                cor_classe AS color
            FROM v_fechamento_mensal_por_classe
            WHERE userId = ? 
              AND ano = ?
            UNION ALL
            SELECT 
                'Ano Passado' AS name,
                'line' AS type,
                CONVERT(RIGHT(yearMonth, 2), SIGNED) AS mes,
                SUM(closingBalance) AS valor,
                '#ee0b0b' AS color -- Cor fixa sugerida para a linha de comparação
            FROM monthly_reports
            WHERE userId = ?
              AND LEFT(yearMonth, 4) = ?
            GROUP BY yearMonth
            ORDER BY type, name, mes;
        `;

        // Executa a query no banco de dados [1]
        const [rows] = await db.execute(query,[req.userId, ano, req.userId, ano-1]);

        // Processamento para agrupar os dados por "name" (Classe ou Ano Passado)
        const processado = rows.reduce((acc, row) => {
            if (!acc[row.name]) {
                acc[row.name] = {
                    name: row.name,
                    type: row.type,
                    color: row.color, // Atribui a cor vinda do SQL à série
                    data: new Array(12).fill(0)
                };
            }
            acc[row.name].data[row.mes - 1] = parseFloat(row.valor);
            return acc;
        }, {});

        // Converte o objeto de agrupamento em um array de objetos (formato final desejado)
        const resultadoFinal = Object.values(processado);

        // Retorna o JSON estruturado para o frontend [2]
        res.json(resultadoFinal);

    } catch (error) {
        // Tratamento de erro padrão conforme seus outros métodos [1, 3]
        res.status(500).json({ error: error.message });
    }
};

exports.getResultado = async (req, res) => {
    try {
        const userId = req.userId;

        const hoje = new Date();
        hoje.setDate(hoje.getDate());
        const dataHoje = hoje.toISOString().split('T')[0];
        
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const dataOntem = ontem.toISOString().split('T')[0];

        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];
        const inicioAno = new Date(new Date().getFullYear() - 1, 11, 31).toISOString().split('T')[0];

        // console.info([userId, dataHoje, dataOntem, inicioMes, inicioAno])

        // 1. Executa as chamadas (resDia, resMes e resAno recebem o pacote completo da procedure)
        const [resDia] = await db.query('CALL sp_resultado_periodo_por_classe(?, ?, ?)', [userId, dataOntem, dataHoje]);
        const [resMes] = await db.query('CALL sp_resultado_periodo_por_classe(?, ?, ?)', [userId, inicioMes, dataHoje]);
        const [resAno] = await db.query('CALL sp_resultado_periodo_por_classe(?, ?, ?)', [userId, inicioAno, dataHoje]);

        const resultadoPorClasse = {};

        // 2. Função corrigida para acessar o índice  do retorno da procedure
        const processar = (procedureResult, periodo) => {
            // O pacote da procedure traz os dados reais no primeiro elemento 
            const rows = procedureResult[0]; 

            if (rows && Array.isArray(rows)) {
                rows.forEach(row => {
                    // Garante que a classe existe no objeto agrupador
                    if (!resultadoPorClasse[row.nome_classe]) {
                        resultadoPorClasse[row.nome_classe] = { 
                            classe: row.nome_classe, 
                            dia: 0, 
                            mes: 0, 
                            ano: 0 
                        };
                    }
                    // Atribui o valor financeiro ao período correto (dia, mes ou ano)
                    resultadoPorClasse[row.nome_classe][periodo] = parseFloat(row.resultado_financeiro_periodo || 0);
                });
            }
        };

        // 3. Processa cada um dos períodos
        processar(resDia, 'dia');
        processar(resMes, 'mes');
        processar(resAno, 'ano');

        // Retorna o array de objetos formatado para o Vue
        res.json(Object.values(resultadoPorClasse));

    } catch (error) {
        console.error("Erro no getResultado:", error);
        res.status(500).json({ error: error.message });
    }
};