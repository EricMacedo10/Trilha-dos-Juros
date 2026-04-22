const https = require('https');

module.exports = async (req, res) => {
    const url = 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsumary.json';
    
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm',
            'Origin': 'https://www.tesourodireto.com.br'
        },
        timeout: 5000
    };

    return new Promise((resolve) => {
        https.get(url, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    if (apiRes.statusCode !== 200) {
                        throw new Error(`Status ${apiRes.statusCode}`);
                    }
                    
                    const jsonData = JSON.parse(data);
                    
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
                    
                    res.status(200).send(jsonData);
                    resolve();
                } catch (e) {
                    res.status(500).json({ error: 'Erro ao processar JSON', details: e.message });
                    resolve();
                }
            });

        }).on('error', (err) => {
            res.status(500).json({ error: 'Erro de conexao com o Tesouro', details: err.message });
            resolve();
        });
    });
};
