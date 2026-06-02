import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process'; 
import fs from 'fs';

// Inicializa o SDK passando explicitamente a API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runCodeReview() {
  try {
    console.log("Iniciando Code Review com IA...");

    // 2. Captura as alterações do último commit (o 'diff')
    // Usamos o comando git nativo para pegar o que mudou
    const diff = execSync('git diff HEAD~1 HEAD').toString();

    if (!diff.trim()) {
      console.log("Nenhuma alteração detectada no código.");
      return;
    }

    // 3. Monta o prompt contextualizado com a sua stack (Node.js e Vue.js)
    const prompt = `
    Você é um Engenheiro de Software Sênior especialista em Node.js e Vue.js.
    Sua tarefa é fazer o Code Review do seguinte 'git diff'. 
    
    Foques em:
    - Bugs críticos ou problemas de lógica.
    - Vulnerabilidades de segurança (ex: injeção de SQL, vazamento de variáveis).
    - Boas práticas de arquitetura e performance no Node.js e Vue.js.
    - Se o código estiver bom, elogie brevemente.

    Seja direto, claro e use markdown para formatar sua resposta (com bullet points e blocos de código se necessário).
     Responda em Português do Brasil.

    Aqui está o código alterado:
    \`\`\`diff
    ${diff}
    \`\`\`
    `;

    // 4. Chame o modelo mais rápido e eficiente para análise de texto (gemini-2.5-flash)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reviewResult = response.text;
    console.log("\n=== REVISÃO DA IA ===\n");
    console.log(reviewResult);

    // 5. Salva o resultado em um arquivo temporário para o GitHub Actions ler depois
    fs.writeFileSync('review_output.md', reviewResult);

  } catch (error) {
    console.error("Erro ao executar o code review:", error);
    process.exit(1);
  }
}

runCodeReview();
