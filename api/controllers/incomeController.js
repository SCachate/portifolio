const puppeteer = require('puppeteer');

exports.dividendosB3 = async (req, res) => {
    console.log('[API] Iniciando processo de raspagem de dividendos na B3...');
    let browser = null;
    let page = null;
    
    try {
        const B3_CPF = '13345187860';
        const B3_PASSWORD = 'B3C@ch@t302';

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080' // Força uma resolução padrão de desktop
            ]
        });

        page = await browser.newPage();
        
        // --- EVITAR DETECÇÃO DE BOT ---
        // Define um User-Agent real para simular um humano no Chrome
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        page.setDefaultTimeout(20000);

        await page.setRequestInterception(true);
        page.on('request', (reqIntercepted) => {
            const resourceType = reqIntercepted.resourceType();
            if (resourceType === 'image' || resourceType === 'font') {
                reqIntercepted.abort();
            } else {
                reqIntercepted.continue();
            }
        });

        console.log('[Puppeteer] Acessando a tela de login...');
        await page.goto('https://www.investidor.b3.com.br/login', { waitUntil: 'networkidle2' });
        
        // Tentativa de esperar pelo seletor
        await page.waitForSelector('#cpf-input', { visible: true });
        await page.type('#cpf-input', B3_CPF, { delay: 50 });
        await page.click('#btn-continuar');
        
        await page.waitForSelector('#senha-input', { visible: true });
        await page.type('#senha-input', B3_PASSWORD, { delay: 50 });
        await page.click('#btn-entrar');
        
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('[Puppeteer] Login efetuado com sucesso.');

        // (O restante do seu loop de raspagem da tabela continua igual aqui...)
        // ...

        return res.status(200).json({ sucesso: true, dados: [] }); // Ajuste para o retorno original

    } catch (error) {
        console.error('[Controller Error] Falha na automação:', error.message);
        
        let screenshotBase64 = null;
        if (page) {
            try {
                // Tira um print da tela do erro para debug visual
                screenshotBase64 = await page.screenshot({ encoding: 'base64', fullPage: true });
                console.log('[Debug Visual] Screenshot gerada devido ao erro.');
            } catch (ssError) {
                console.error('Não foi possível gerar a screenshot:', ssError.message);
            }
        }
        
        // Retorna o erro e a imagem do que o robô estava vendo
        return res.status(500).json({
            sucesso: false,
            erro: 'Falha ao interagir com os elementos da B3.',
            detalhes: error.message,
            SuaTelaB3NoMomentoDoErro: screenshotBase64 ? `data:image/png;base64,${screenshotBase64}` : 'Não disponível'
        });
        
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('[Puppeteer] Instância encerrada.');
        }
    }
};
