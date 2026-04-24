const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// Inicialização das APIs do Google
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// ... (seu código anterior)

exports.addPDF = asyncHandler(async (req, res) => {
  const userId = req.userId;

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
      model: "gemini-1.5-flash", // Altere para "gemini-1.5-pro-latest" se realmente precisar do Pro
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 3. Prompt (Melhorado para garantir JSON puro)
    const prompt = `
      Analise esta nota de corretagem financeira. Extraia as operações de compra e venda.
      Retorne um objeto JSON seguindo exatamente este esquema:
      {
        "transacoes": [
          {
            "data": "YYYY-MM-DD",
            "ticker": "string",
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

    res.json(dadosExtraidos);

  } catch (error) {
    console.error("Erro detalhado:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message || "Erro ao processar a nota." });
  }
});
