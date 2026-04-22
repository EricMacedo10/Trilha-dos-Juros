// API Proxy para o Tesouro Direto - Versão Robustecida
module.exports = async (req, res) => {
    try {
        const url = 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsumary.json';
        
        console.log('[API Tesouro] Iniciando busca oficial...');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Tesouro API retornou erro ${response.status}` });
        }

        const data = await response.json();

        // Configurações de CORS e Cache para performance
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

        return res.status(200).send(data);
    } catch (error) {
        console.error('[API Tesouro Error]:', error.message);
        return res.status(500).json({ error: 'Falha interna ao processar dados do Tesouro', details: error.message });
    }
};
