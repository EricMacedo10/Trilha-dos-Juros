const https = require('https');

module.exports = async (req, res) => {
    const resourceId = '796d2059-14e9-44e3-80c9-2d9e30b405c1';
    
    // Pegamos 400 registros para garantir que temos pelo menos 2 ou 3 dias úteis de margem
    const url = `https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search?resource_id=${resourceId}&limit=400&sort=_id%20desc`;
    
    return new Promise((resolve) => {
        https.get(url, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) throw new Error('Erro na fonte oficial');

                    const records = json.result.records;
                    
                    // 1. Filtrar apenas registros que tenham PREÇO e TAXA válidos (maiores que zero)
                    const validRecords = records.filter(r => {
                        const priceKey = r["PU Compra Manha"] !== undefined ? "PU Compra Manha" : "PU_Compra_Manha";
                        const price = parseFloat(String(r[priceKey] || "0").replace(',', '.'));
                        return price > 0;
                    });

                    if (validRecords.length === 0) throw new Error('Nenhum dado válido encontrado no histórico recente');

                    // 2. A data mais recente com dados é o nosso D-1 real
                    const latestDate = validRecords[0]["Data Base"] || validRecords[0]["Data_Base"];
                    
                    // 3. Pegar todos os títulos desse dia específico
                    const d1Entries = validRecords.filter(r => (r["Data Base"] || r["Data_Base"]) === latestDate);

                    const processedBonds = d1Entries.map(r => {
                        // Mapeamento dinâmico para suportar variações de nomes de colunas
                        const name = r["Tipo Titulo"] || r["Tipo_Titulo"];
                        const rate = parseFloat(String(r["Taxa Compra Manha"] || r["Taxa_Compra_Manha"] || "0").replace(',', '.'));
                        const price = parseFloat(String(r["PU Compra Manha"] || r["PU_Compra_Manha"] || "0").replace(',', '.'));
                        const maturity = r["Data Vencimento"] || r["Data_Vencimento"];

                        return {
                            nm: name,
                            ltapnmDate: maturity,
                            annlRenmRate: rate,
                            invstmtVal: price,
                            minInvestAmt: Math.max(price * 0.01, 30.00), // Mínimo de 1% ou R$ 30
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
                    res.status(500).json({ error: 'Erro no processamento D-1', details: e.message });
                    resolve();
                }
            });
        }).on('error', (err) => {
            res.status(500).json({ error: 'Erro de conexao com o Tesouro' });
            resolve();
        });
    });
};
