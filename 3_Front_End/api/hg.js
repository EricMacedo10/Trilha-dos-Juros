// Proxy Seguro para HG Brasil - Trilha dos Juros
module.exports = async (req, res) => {
    // Chave real extraída do seu painel oficial
    const HG_KEY = 'cce1a3d7';

    try {
        const url = `https://api.hgbrasil.com/finance?key=${HG_KEY}&format=json-cors`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HG Brasil respondeu com status: ${response.status}`);
        }

        const data = await response.json();

        // Cabeçalhos de Segurança e Cache
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json(data);
    } catch (error) {
        console.error('[HG Proxy Error]:', error.message);
        return res.status(500).json({ error: 'Falha ao buscar dados do HG Brasil' });
    }
};
