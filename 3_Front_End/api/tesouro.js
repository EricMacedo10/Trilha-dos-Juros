const https = require('https');

module.exports = async (req, res) => {
    const resourceId = '796d2059-14e9-44e3-80c9-2d9e30b405c1';
    
    // Filtro agressivo: Pedimos os últimos 300 registros para garantir que pegamos o fechamento de um dia útil
    const url = `https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search?resource_id=${resourceId}&limit=300&sort=_id%20desc`;
    
    return new Promise((resolve) => {
        https.get(url, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) throw new Error('Falha no CKAN');

                    const records = json.result.records;
                    
                    // 1. Descobrir qual a data mais recente que possui dados preenchidos (preço > 0)
                    const validRecords = records.filter(r => {
                        const price = parseFloat(String(r["PU Compra Manha"] || r["PU_Compra_Manha"] || "0").replace(',', '.'));
                        return price > 0;
                    });

                    if (validRecords.length === 0) throw new Error('Nenhum dado válido encontrado');

                    const latestDate = validRecords[0]["Data Base"] || validRecords[0]["Data_Base"];
                    
                    // 2. Filtrar apenas os títulos dessa data específica
                    const dayEntries = validRecords.filter(r => (r["Data Base"] || r["Data_Base"]) === latestDate);

                    // 3. Mapear com suporte a nomes de colunas alternativos (com ou sem espaço)
                    const processedBonds = dayEntries.map(r => {
                        const name = String(r["Tipo Titulo"] || r["Tipo_Titulo"] || "");
                        const buyRate = parseFloat(String(r["Taxa Compra Manha"] || r["Taxa_Compra_Manha"] || "0").replace(',', '.'));
                        const buyPrice = parseFloat(String(r["PU Compra Manha"] || r["PU_Compra_Manha"] || "0").replace(',', '.'));
                        const maturity = r["Data Vencimento"] || r["Data_Vencimento"];

                        return {
                            nm: name,
                            ltapnmDate: maturity,
                            annlRenmRate: buyRate || 0,
                            invstmtVal: buyPrice || 0,
                            minInvestAmt: (buyPrice * 0.01) > 30 ? (buyPrice * 0.01) : 30.00,
                            type: name.toLowerCase().includes('selic') ? 'selic' : 
                                  (name.toLowerCase().includes('ipca') ? 'ipca' : 'pre'),
                            TrsuryBondTyp: { nm: name }
                        };
                    });

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
                    res.status(500).json({ error: 'Erro nos dados', details: e.message });
                    resolve();
                }
            });
        }).on('error', (err) => {
            res.status(500).json({ error: 'Erro de conexao' });
            resolve();
        });
    });
};
