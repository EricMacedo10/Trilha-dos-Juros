export default async function handler(req, res) {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Missing symbol parameter' });
    }

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance responded with status: ${response.status}`);
        }

        const data = await response.json();

        // CORS Headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        
        // Caching at the Edge for 60 seconds
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch data' });
    }
}
