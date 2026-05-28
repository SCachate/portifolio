// Alterado para usar o puppeteer-extra com o plugin Stealth
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Controller responsável por realizar o scraping de dividendos do portal B3.
 * Utiliza modo Stealth para evitar detecção e bloqueio de firewalls (Cloudflare).
 */
exports.dividendosB3 = async (req, res) => {
    console.log('[API] Iniciando processo de raspagem de dividendos na B3 com Stealth Mode...');
    
    let browser = null;
    let page = null;
    
    try {
        // Credenciais temporárias para teste
        const B3_CPF = '13345187860';
        const B3_PASSWORD = 'B3C@ch@t302';

        // Inicialização do Puppeteer camuflado
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                // Esconde a flag que diz "Este navegador está sendo automatizado"
                '--disable-blink-features=AutomationControlled' 
            ]
        });

        page = await browser.newPage();
        
        // Simula um comportamento e cabeçalho humano real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        page.setDefaultTimeout(25000); // Aumentado levemente para dar margem à camuflagem

        // Otimização de rede (mantendo CSS estrutural)
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
        console.log('[Puppeteer] Acessando a tela de login de forma camuflada...');
        await page.goto('https://www.investidor.b3.com.br/login', { waitUntil: 'networkidle2' });
        
        // Inserção do CPF
        await page.waitForSelector('#cpf-input', { visible: true });
        await page.type('#cpf-input', B3_CPF, { delay: 60 }); // Delay um pouco mais "humano" ao digitar
        await page.click('#btn-continuar');
        
        // Inserção da Senha
        await page.waitForSelector('#senha-input', { visible: true });
        await page.type('#senha-input', B3_PASSWORD, { delay: 60 });
        await page.click('#btn-entrar');
        
        // Aguarda a B3 autenticar e mudar de página
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('[Puppeteer] Login efetuado com sucesso.');

        // 2. Navegação Direta para o Extrato de Proventos
        console.log('[Puppeteer] Navegando para o extrato de proventos...');
        await page.goto('https://www.investidor.b3.com.br/extratos/proventos', { waitUntil: 'networkidle2' });
        
        const TABELA_SELECTOR = '.tabela-proventos';
        const LINHAS_SELECTOR = '.tabela-proventos tbody tr';
        const BOTAO_PROXIMO = '.pagination-next';
        
        await page.waitForSelector(TABELA_SELECTOR);
        
        let todosDividendos = [];
        let temProximaPagina = true;
        let paginaAtual = 1;
        
        // 3. Loop de Paginação Dinâmica
        while (temProximaPagina) {
            console.log(`[Puppeteer] Raspando dados da página ${paginaAtual}...`);
            
            const dadosDaPagina = await page.evaluate((linhasSel) => {
                const rows = document.querySelectorAll(linhasSel);
                
                return Array.from(rows).map(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 7) return null;

                    const parseMoeda = (txt) => {
                        if (!txt) return 0;
                        return parseFloat(txt.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                    };

                    const parseData = (txt) => {
                        if (!txt || !txt.includes('/')) return '0000-00-00';
                        const [d, m, a] = txt.trim().split('/');
                        return `${a}-${m}-${d}`;
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
                }).filter(item => item !== null);
            }, LINHAS_SELECTOR);
            
            todosDividendos.push(...dadosDaPagina);
            
            const botaoProximo = await page.$(BOTAO_PROXIMO);
            if (botaoProximo) {
                const isDisabled = await page.evaluate(btn => btn.hasAttribute('disabled') || btn.classList.contains('disabled'), botaoProximo);
                
                if (!isDisabled) {
                    paginaAtual++;
                    await Promise.all([
                        page.click(BOTAO_PROXIMO),
                        page.waitForNetworkIdle({ idleTime: 600 })
                    ]);
                } else {
                    temProximaPagina = false;
                }
            } else {
                temProximaPagina = false;
            }
        }
        
        console.log(`[Puppeteer] Raspagem concluída. Total de registros: ${todosDividendos.length}`);
        
        return res.status(200).json({
            sucesso: true,
            total_encontrado: todosDividendos.length,
            dados: todosDividendos
        });

    } catch (error) {
        console.error('[Controller Error] Falha na automação da B3:', error.message);
        
        let screenshotBase64 = null;
        if (page) {
            try {
                screenshotBase64 = await page.screenshot({ encoding: 'base64', fullPage: true });
            } catch (ssError) {
                console.error('Não foi possível gerar a screenshot:', ssError.message);
            }
        }
        
        return res.status(500).json({
            sucesso: false,
            erro: 'Falha ao interagir com os elementos da B3.',
            detalhes: error.message,
            SuaTelaB3NoMomentoDoErro: screenshotBase64 ? `data:image/png;base64,${screenshotBase64}` : 'Não disponível'
        });
        
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('[Puppeteer] Instância encerrada com segurança.');
        }
    }
};
