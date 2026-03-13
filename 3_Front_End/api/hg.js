export default async function handler(req, res) {
    // A chave pode vir de uma variável de ambiente no Vercel (recomendado)
    // ou usamos a chave padrão se não estiver definida.
    const HG_KEY = process.env.HG_KEY;

    try {
        const url = `https://api.hgbrasil.com/finance?key=${HG_KEY}&format=json-cors`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HG Brasil responded with status: ${response.status}`);
        }

        const data = await response.json();

        // CORS Headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        
        // Caching at the Edge for 5 minutes (HG has rate limits)
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json(data);
    } catch (error) {
        console.error('[HG Proxy] Error:', error);
        return res.status(500).json({ error: 'Failed to fetch HG data' });
    }
}
