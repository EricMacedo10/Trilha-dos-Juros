const https = require('https');

module.exports = async (req, res) => {
    const resourceId = '796d2059-14e9-44e3-80c9-2d9e30b405c1';
    const url = `https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search?resource_id=${resourceId}&limit=100&sort=_id%20desc`;
    
    return new Promise((resolve) => {
        https.get(url, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) throw new Error('API do governo retornou erro');

                    const records = json.result.records;
                    
                    // Mapeamento EXATO para o que o frontend espera
                    const processedBonds = records.map(r => {
                        const name = String(r["Tipo Titulo"] || "");
                        const buyRate = parseFloat(String(r["Taxa Compra Manha"] || "0").replace(',', '.'));
                        const buyPrice = parseFloat(String(r["PU Compra Manha"] || "0").replace(',', '.'));
                        
                        return {
                            nm: name,
                            ltapnmDate: r["Data Vencimento"], // Data de Vencimento
                            annlRenmRate: buyRate || 0, // TAXA COMPRA (O que causou o erro toFixed)
                            invstmtVal: buyPrice || 0, // PREÇO UNITÁRIO
                            minInvestAmt: (buyPrice * 0.01) || 30.00, // Investimento Mínimo (aprox 1%)
                            type: name.toLowerCase().includes('selic') ? 'selic' : 
                                  (name.toLowerCase().includes('ipca') ? 'ipca' : 'pre'),
                            TrsuryBondTyp: { nm: name }
                        };
                    });

                    const latestDate = records[0] ? records[0]["Data Base"] : "Hoje";

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
                    res.status(500).json({ error: 'Erro no processamento', details: e.message });
                    resolve();
                }
            });
        }).on('error', (err) => {
            res.status(500).json({ error: 'Erro de conexao' });
            resolve();
        });
    });
};
