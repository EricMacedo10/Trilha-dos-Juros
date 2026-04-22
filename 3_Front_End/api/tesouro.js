export default async function handler(req, res) {
    try {
        // Endpoint JSON oficial consumido pelo site do Tesouro Direto
        const url = 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsumary.json';
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm'
            }
        });

        if (!response.ok) {
            throw new Error(`Tesouro responded with status: ${response.status}`);
        }

        const data = await response.json();

        // CORS Headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        
        // Caching at the Edge for 30 minutes (O Tesouro não atualiza segundo a segundo)
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

        return res.status(200).json(data);
    } catch (error) {
        console.error('[Tesouro Proxy] Error:', error);
        return res.status(500).json({ error: 'Failed to fetch Treasury data' });
    }
}
