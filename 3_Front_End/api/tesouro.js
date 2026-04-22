const https = require('https');

module.exports = async (req, res) => {
    // URL sugerida para maior estabilidade
    const url = 'https://www.tesourodireto.com.br/json/br/com/b3/tesouro/bond/search.json';
    
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm',
            'Origin': 'https://www.tesourodireto.com.br'
        },
        timeout: 8000 // Aumentado para 8s para evitar timeouts falsos
    };

    return new Promise((resolve) => {
        const request = https.get(url, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    if (apiRes.statusCode !== 200) {
                        throw new Error(`Tesouro B3 retornou status ${apiRes.statusCode}`);
                    }
                    
                    const jsonData = JSON.parse(data);
                    
                    // Tratamento para garantir que o formato de saída seja consistente
                    const responseData = jsonData.response || jsonData;
                    
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
                    
                    res.status(200).send(responseData);
                    resolve();
                } catch (e) {
                    console.error('[API Tesouro] Erro no Parse:', e.message);
                    res.status(500).json({ error: 'Erro ao processar dados do Tesouro', details: e.message });
                    resolve();
                }
            });

        });

        request.on('error', (err) => {
            console.error('[API Tesouro] Erro de Conexao:', err.message);
            res.status(500).json({ error: 'Falha na conexao com a B3', details: err.message });
            resolve();
        });

        request.on('timeout', () => {
            request.destroy();
            res.status(504).json({ error: 'Timeout na resposta da B3' });
            resolve();
        });
    });
};
