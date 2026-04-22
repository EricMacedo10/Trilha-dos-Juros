const https = require('https');

module.exports = async (req, res) => {
    // Usando a API de busca do CKAN para pegar apenas os últimos 50 registros (que são os mais recentes)
    // Isso evita baixar o arquivo de 13MB inteiro.
    const resourceId = '796d2059-14e9-44e3-80c9-2d9e30b405c1';
    const url = `https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search?resource_id=${resourceId}&limit=50&sort=_id%20desc`;
    
    return new Promise((resolve) => {
        https.get(url, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) throw new Error('API do governo retornou erro');

                    const records = json.result.records;
                    
                    // Os campos na API do CKAN podem ter nomes levemente diferentes do CSV
                    // Mapeamos para o formato esperado pelo site
                    const processedBonds = records.map(r => ({
                        nm: r["Tipo Titulo"],
                        dtVct: r["Data Vencimento"],
                        unidInvt: 'S',
                        TrsuryBondTyp: { nm: r["Tipo Titulo"] },
                        TrsuryBondSts: { nm: 'Ativo' },
                        annlIncrtRate: parseFloat(String(r["Taxa Compra Manha"]).replace(',', '.')),
                        unnmrdRate: parseFloat(String(r["Taxa Venda Manha"]).replace(',', '.')),
                        untPrUnitBuy: parseFloat(String(r["PU Compra Manha"]).replace(',', '.')),
                        untPrUnitSell: parseFloat(String(r["PU Venda Manha"]).replace(',', '.'))
                    }));

                    const latestDate = records[0]["Data Base"];

                    const response = {
                        response: {
                            TrsuryBondSery: {
                                TrsuryBond: processedBonds,
                                TrsuryBondMktSts: { nm: `Dados Oficiais (${latestDate})` }
                            }
                        }
                    };

                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json(response);
                    resolve();
                } catch (e) {
                    res.status(500).json({ error: 'Falha ao processar API do Tesouro', details: e.message });
                    resolve();
                }
            });
        }).on('error', (err) => {
            res.status(500).json({ error: 'Erro de conexao' });
            resolve();
        });
    });
};
