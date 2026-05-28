const puppeteer = require('puppeteer');

/**
 * Controller responsável por realizar o scraping de dividendos do portal B3.
 * Prioriza a liberação de memória e tratamento de erros para rodar em produção (Render).
 */
exports.dividendosB3 = async (req, res) => {
    console.log('[API] Iniciando processo de raspagem de dividendos na B3...');
    
    let browser = null;
    
    try {
        // Credenciais fixadas temporariamente para fins de teste
        const B3_CPF = '13345187860';
        const B3_PASSWORD = 'B3C@ch@t302';

        // Inicialização do Puppeteer otimizada para ambientes Linux/Docker/Render
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Vital para não estourar a memória RAM do container
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Define um timeout padrão global de 20 segundos
        page.setDefaultTimeout(20000);

        // Otimização: Bloqueia APENAS imagens e fontes (Mantém o CSS para não quebrar o layout dinâmico da B3)
        await page.setRequestInterception(true);
        page.on('request', (reqIntercepted) => {
            const resourceType = reqIntercepted.resourceType();
            if (resourceType === 'image' || resourceType === 'font') {
                reqIntercepted.abort();
            } else {
                reqIntercepted.continue();
            }
        });

        // 1. Fluxo de Autenticação na B3
        console.log('[Puppeteer] Acessando a tela de login...');
        await page.goto('https://www.investidor.b3.com.br/login', { waitUntil: 'networkidle2' });
        
        // Inserção do CPF
        await page.waitForSelector('#cpf-input', { visible: true });
        await page.type('#cpf-input', B3_CPF, { delay: 30 });
        await page.click('#btn-continuar');
        
        // Inserção da Senha
        await page.waitForSelector('#senha-input', { visible: true });
        await page.type('#senha-input', B3_PASSWORD, { delay: 30 });
        await page.click('#btn-entrar');
        
        // Aguarda a B3 autenticar e mudar de página
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('[Puppeteer] Login efetuado com sucesso.');

        // 2. Navegação Direta para o Extrato de Proventos
        console.log('[Puppeteer] Navegando para o extrato de proventos...');
        await page.goto('https://www.investidor.b3.com.br/extratos/proventos', { waitUntil: 'networkidle2' });
        
        // Mapeamento dos seletores do DOM da B3
        const TABELA_SELECTOR = '.tabela-proventos';
        const LINHAS_SELECTOR = '.tabela-proventos tbody tr';
        const BOTAO_PROXIMO = '.pagination-next';
        
        // Aguarda a tabela principal carregar
        await page.waitForSelector(TABELA_SELECTOR);
        
        let todosDividendos = [];
        let temProximaPagina = true;
        let paginaAtual = 1;
        
        // 3. Loop de Paginação Dinâmica
        while (temProximaPagina) {
            console.log(`[Puppeteer] Raspando dados da página ${paginaAtual}...`);
            
            // Avaliação do DOM dentro do contexto do navegador
            const dadosDaPagina = await page.evaluate((linhasSel) => {
                const rows = document.querySelectorAll(linhasSel);
                
                return Array.from(rows).map(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 7) return null; // Evita linhas de cabeçalho ou placeholders vazios

                    // Helpers de conversão de tipos BR -> MySQL nativo
                    const parseMoeda = (txt) => {
                        if (!txt) return 0;
                        return parseFloat(txt.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                    };

                    const parseData = (txt) => {
                        if (!txt || !txt.includes('/')) return '0000-00-00';
                        const [d, m, a] = txt.trim().split('/');
                        return `${a}-${m}-${d}`; // YYYY-MM-DD aceito pelo MySQL
                    };
                    
                    return {
                        ticker: cols[0]?.innerText.trim() || '',
                        empresa: cols[1]?.innerText.trim() || '',
                        tipo_provento: cols[2]?.innerText.trim() || '',
                        quantidade: parseInt(cols[3]?.innerText.replace(/\./g, '').trim()) || 0,
                        valor_unitario: parseMoeda(cols[4]?.innerText),
                        valor_liquido: parseMoeda(cols[5]?.innerText),
                        data_pagamento: parseData(cols[6]?.innerText)
                    };
                }).filter(item => item !== null); // Filtra possíveis linhas inválidas
            }, LINHAS_SELECTOR);
            
            todosDividendos.push(...dadosDaPagina);
            
            // Lógica do botão "Próximo" da paginação
            const botaoProximo = await page.$(BOTAO_PROXIMO);
            if (botaoProximo) {
                // Se o botão tiver o atributo 'disabled' ou classe 'disabled', chegamos ao fim
                const isDisabled = await page.evaluate(btn => btn.hasAttribute('disabled') || btn.classList.contains('disabled'), botaoProximo);
                
                if (!isDisabled) {
                    paginaAtual++;
                    await Promise.all([
                        page.click(BOTAO_PROXIMO),
                        page.waitForNetworkIdle({ idleTime: 500 }) // Aguarda o carregamento dos novos dados Ajax
                    ]);
                } else {
                    temProximaPagina = false;
                }
            } else {
                temProximaPagina = false; // Sem botão de paginação, dados em página única
            }
        }
        
        console.log(`[Puppeteer] Raspagem concluída. Total de registros: ${todosDividendos.length}`);
        
        // 4. Resposta para o n8n
        return res.status(200).json({
            sucesso: true,
            total_encontrado: todosDividendos.length,
            dados: todosDividendos
        });

    } catch (error) {
        console.error('[Controller Error] Falha na automação da B3:', error.message);
        
        return res.status(500).json({
            sucesso: false,
            erro: 'Falha interna ao processar dados da B3.',
            detalhes: error.message
        });
        
    } finally {
        // Garantia absoluta de encerramento do processo do Chromium
        if (browser !== null) {
            await browser.close();
            console.log('[Puppeteer] Instância do navegador encerrada com segurança.');
        }
    }
};
