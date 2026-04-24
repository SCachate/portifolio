const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

exports.addPDF = asyncHandler(async (req, res) => {
  const userId = req.userId;
  try {
    const filePath = req.file.path;

    // 1. Upload do arquivo para o File Manager do Google
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: "Nota de Corretagem",
    });

    // 2. Inicializar o modelo
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" } // Força saída JSON
    });

    // 3. Prompt detalhado para garantir a estrutura do banco MySQL
    const prompt = `
      Analise esta nota de corretagem. Extraia as operações de compra e venda.
      Retorne um objeto JSON seguindo estritamente este esquema:
      {
        "transacoes": [
          {
            "data": "ISO Date",
            "ticker": "string",
            "tipo": "COMPRA ou VENDA",
            "quantidade": "number",
            "preco_unitario": "number",
            "custos_operacionais": "number"
          }
        ],
        "total_liquido": "number"
      }
    `;

    // 4. Gerar o conteúdo
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: prompt },
    ]);

    const dadosExtraidos = JSON.parse(result.response.text());

    // 5. Limpeza: Deletar arquivo temporário local
    fs.unlinkSync(filePath);

    // Retorna os dados para o seu Vue.js conferir antes de salvar no MySQL
    res.json(dadosExtraidos);

  } catch (error) {
    console.error("Erro no processamento:", error);
    res.status(500).send("Erro ao processar a nota.");
  }
});
