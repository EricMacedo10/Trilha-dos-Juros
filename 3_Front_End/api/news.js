const https = require('https');

module.exports = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL do feed e obrigatoria' });
    }

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*'
        },
        timeout: 6000
    };

    return new Promise((resolve) => {
        const request = https.get(url, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Content-Type', 'application/xml');
                    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
                    
                    res.status(200).send(data);
                    resolve();
                } catch (e) {
                    res.status(500).json({ error: 'Erro ao processar feed' });
                    resolve();
                }
            });

        });

        request.on('error', (err) => {
            res.status(500).json({ error: 'Falha na conexao com o feed' });
            resolve();
        });

        request.on('timeout', () => {
            request.destroy();
            res.status(504).json({ error: 'Timeout no feed' });
            resolve();
        });
    });
};
