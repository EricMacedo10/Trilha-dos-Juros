const https = require('https');

module.exports = async (req, res) => {
    // URL oficial do Tesouro Transparente (Dados Abertos)
    const url = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv';
    
    return new Promise((resolve) => {
        const request = https.get(url, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
                // Otimização: Se já tivermos dados suficientes do final do arquivo ou se o arquivo for muito grande,
                // em uma implementação real usaríamos streams. Para este caso, vamos ler o CSV.
            });

            apiRes.on('end', () => {
                try {
                    const lines = data.split('\n');
                    const headers = lines[0].split(';');
                    
                    // Filtrar apenas dados de 2026
                    // Estrutura: Tipo Titulo;Data Vencimento;Data Base;Taxa Compra Manha;...
                    const currentYearEntries = lines.filter(line => line.includes('/2026'));
                    
                    if (currentYearEntries.length === 0) {
                        throw new Error('Nenhum dado de 2026 encontrado no arquivo oficial');
                    }

                    // Pegar a data base mais recente encontrada
                    const dates = currentYearEntries.map(l => l.split(';')[2]).sort();
                    const latestDate = dates[dates.length - 1];
                    
                    const latestEntries = currentYearEntries.filter(l => l.split(';')[2] === latestDate);

                    // Mapear para o formato que o frontend espera
                    const processedBonds = latestEntries.map(line => {
                        const cols = line.split(';');
                        return {
                            nm: cols[0], // Nome
                            dtVct: cols[1], // Vencimento
                            unidInvt: 'S',
                            TrsuryBondTyp: { nm: cols[0] },
                            TrsuryBondSts: { nm: 'Ativo' },
                            annlIncrtRate: parseFloat(cols[3].replace(',', '.')), // Taxa Compra
                            unnmrdRate: parseFloat(cols[4].replace(',', '.')), // Taxa Venda
                            untPrUnitBuy: parseFloat(cols[5].replace(',', '.')), // PU Compra
                            untPrUnitSell: parseFloat(cols[6].replace(',', '.')) // PU Venda
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
                    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
                    res.status(200).json(response);
                    resolve();
                } catch (e) {
                    res.status(500).json({ error: 'Erro ao processar CSV do Tesouro', details: e.message });
                    resolve();
                }
            });
        });

        request.on('error', (err) => {
            res.status(500).json({ error: 'Falha na conexao com Tesouro Transparente' });
            resolve();
        });
    });
};
