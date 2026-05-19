const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// Inicialização das APIs do Google
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/**
 * Lista as transações com filtros dinâmicos
 * Endpoint: GET /api/transactions
 */
exports.getTransactions = asyncHandler(async (req, res) => {
    // 1. Pegamos o userId (do middleware de auth) e os filtros da query string
    const userId = req.userId || 1; // Fallback para teste
    const { startDate, endDate, brokerId, assetId } = req.query;

    // 2. Base da Query SQL (Usando os nomes de colunas da sua definição de tabela)
    // Fizemos o JOIN para trazer nomes e tickets para o front facilitar
    let sql = `
        SELECT 
            t.id,
            t.date,
            t.quantity,
            t.priceUnit,
            t.fees,
            t.pm,
            (t.quantity * t.priceUnit) AS total,
            t.assetId,
            a.ticket,
            a.description AS assetDescription,
            t.brokerId,
            b.name AS brokerName
        FROM transactions t
        LEFT JOIN assets a ON t.assetId = a.id
        LEFT JOIN brokers b ON t.brokerId = b.id
        WHERE t.userId = ?
    `;

    // 3. Array de parâmetros para evitar SQL Injection
    const queryParams = [userId];

    // 4. Construção Dinâmica dos Filtros
    if (startDate) {
        sql += ` AND t.date >= ?`;
        queryParams.push(startDate);
    }

    if (endDate) {
        sql += ` AND t.date <= ?`;
        queryParams.push(endDate);
    }

    if (brokerId) {
        sql += ` AND t.brokerId = ?`;
        queryParams.push(brokerId);
    }

    if (assetId) {
        sql += ` AND t.assetId = ?`;
        queryParams.push(assetId);
    }

    // 5. Ordenação (Mais recentes primeiro)
    sql += ` ORDER BY t.date DESC, t.id DESC`;

    // 6. Execução
    const [rows] = await db.execute(sql, queryParams);

    // 7. Resposta formatada
    res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
    });
});

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Usamos o fetch nativo ou o interno da lib para listar
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log(`Modelos disponíveis para sua chave(${process.env.GEMINI_API_KEY}):`);
    if (data.models) {
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.log("Nenhum modelo encontrado ou erro na resposta:", data);
    }
  } catch (e) {
    console.error("Erro ao conectar:", e);
  }
}

exports.addPDF = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // await listModels();

  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }

  const filePath = req.file.path;

  try {
    // 1. Upload do arquivo
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: "Nota de Corretagem",
    });

    // 2. Configurar o modelo (Usando 1.5-flash que é mais estável para v1beta)
    // E forçando a resposta em JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", // Altere para "gemini-1.5-pro-latest" se realmente precisar do Pro
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 3. Prompt (Melhorado para garantir JSON puro)
    const prompt = `
     Analise esta nota de corretagem financeira. Extraia as operações de compra e venda.

Instruções para identificação do Ticker (Código do Ativo):
1. Identifique o ativo transacionado e converta-o para o seu código oficial de negociação em bolsa (Ticker padrão B3 com 4 letras + número, ou ticker internacional caso aplicável, ex: AAPL, TSLA).
2. Se a nota indicar mercado fracionário (ex: final "F"), remova o "F" e mantenha o ticker padrão do lote padrão (ex: transforme "PETR4F" em "PETR4").
3. Certifique-se de capturar o código correto caso trate-se de fundos imobiliários (final 11), ações ordinárias (final 3), preferenciais (final 4), units (final 11) ou opções de ações/índices (ex: PETRE300).

Instruções para o cálculo de custos:
1. Identifique o valor total de todos os custos, impostos, taxas (como taxa de liquidação, emolumentos) e outros encargos operacionais da nota.
2. Realize o rateio proporcional desse custo total entre os itens transacionados, utilizando como base o volume financeiro de cada operação (Quantidade x Preço Unitário). 
3. O valor resultante do rateio para cada item deve ser inserido no campo "custos_operacionais".

Retorne um objeto JSON seguindo exatamente este esquema:
{
  "cnpj_corretora": "string (formato 00.000.000/0001-00)",
  "cnpj_cpf_cliente": "string (formato CPF ou CNPJ limpo ou formatado)",
  "transacoes": [
    {
      "data": "YYYY-MM-DD",
      "ticker": "string (Código oficial da B3 ou Bolsa Internacional, ex: VALE3, ITUB4, IVVB11)",
      "tipo": "C ou V",
      "quantidade": number,
      "preco_unitario": number,
      "custos_operacionais": number
    }
  ]
}
    `;

    // 4. Gerar resposta
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: prompt },
    ]);

    const textResponse = result.response.text();
    const dadosExtraidos = JSON.parse(textResponse);

    // 5. Limpeza
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.info(dadosExtraidos);

    res.json(dadosExtraidos);

  } catch (error) {
    console.error("Erro detalhado:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message || "Erro ao processar a nota." });
  }
});
