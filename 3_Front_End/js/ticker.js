/**
 * Letreiro Dinâmico de Mercado (Ticker)
 * Aquece a autoridade visual do site na mente do usuário.
 */

document.addEventListener('DOMContentLoaded', () => {

    const tickerContent = document.getElementById('ticker-content');

    // Dados Iniciais (Servindo como Fallback se a internet cair ou APIs bloquearem índices)
    let marketData = [
        { symbol: "SELIC", value: "15.00%", status: "neutral" },
        { symbol: "CDI", value: "14.90%", status: "neutral" },
        { symbol: "IBOVESPA", value: "190.870 pts", status: "down" },
        { symbol: "DÓLAR", value: "R$ 6.05", status: "up" },
        { symbol: "EURO", value: "R$ 6.15", status: "up" },
        { symbol: "BITCOIN", value: "$ 67.499", status: "up" },
        { symbol: "PETR4", value: "R$ 39.50", status: "down" },
        { symbol: "VALE3", value: "R$ 88.70", status: "up" },
        { symbol: "ITUB4", value: "R$ 47.42", status: "up" },
        { symbol: "IPCA (12m)", value: "4.50%", status: "neutral" }
    ];

    function createTickerString(marketDataArray) {
        let htmlString = "";
        // Repetimos o array para garantir o fluxo contínuo do CSS Animation
        const fullArray = [...marketDataArray, ...marketDataArray, ...marketDataArray];

        fullArray.forEach(item => {
            let color = "#10b981"; // neon green
            let icon = "▲";

            if (item.status === "down") {
                color = "#ef4444"; // red
                icon = "▼";
            } else if (item.status === "neutral") {
                color = "#a1a1aa"; // gray
                icon = "■";
            }

            htmlString += `<span class="ticker-item" style="color: ${color};"><strong style="color: #f8fafc;">${item.symbol}</strong> ${item.value} ${icon}</span>`;
        });

        return htmlString;
    }

    async function updateMarketQuotes() {
        console.log('[Trilha dos Juros] Iniciando rodada de atualização de cotações...');

        // 1. AwesomeAPI (Moedas + Bitcoin)
        try {
            const currencyResponse = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD');
            if (currencyResponse.ok) {
                const cData = await currencyResponse.json();

                // Dólar
                const usd = marketData.find(m => m.symbol === "DÓLAR");
                if (usd && cData.USDBRL && cData.USDBRL.bid) {
                    usd.value = `R$ ${parseFloat(cData.USDBRL.bid).toFixed(2)}`;
                    usd.status = parseFloat(cData.USDBRL.pctChange) >= 0 ? "up" : "down";
                }

                // Euro
                const eur = marketData.find(m => m.symbol === "EURO");
                if (eur && cData.EURBRL && cData.EURBRL.bid) {
                    eur.value = `R$ ${parseFloat(cData.EURBRL.bid).toFixed(2)}`;
                    eur.status = parseFloat(cData.EURBRL.pctChange) >= 0 ? "up" : "down";
                }

                // Bitcoin
                const btc = marketData.find(m => m.symbol === "BITCOIN");
                if (btc && cData.BTCUSD && cData.BTCUSD.bid) {
                    btc.value = `$ ${parseFloat(cData.BTCUSD.bid).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                    btc.status = parseFloat(cData.BTCUSD.pctChange) >= 0 ? "up" : "down";
                }
            }
        } catch (e) {
            console.warn('[Trilha dos Juros] AwesomeAPI falhou.', e);
        }

        // 2. Ações B3 via Proxy HGBrasil (Plano A) ou Yahoo
        const hgUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.hgbrasil.com/finance?format=json-cors')}`;
        
        try {
            const hgRes = await fetch(hgUrl, { signal: AbortSignal.timeout(5000) });
            if (hgRes.ok) {
                const jsonPayload = await hgRes.json();
                const hgData = JSON.parse(jsonPayload.contents);
                
                if (hgData && hgData.results && hgData.results.stocks) {
                    const stocks = hgData.results.stocks;
                    
                    // Ibovespa
                    if (stocks.IBOVESPA) {
                        const target = marketData.find(m => m.symbol === "IBOVESPA");
                        if (target) {
                            target.value = `${stocks.IBOVESPA.points.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                            target.status = stocks.IBOVESPA.variation >= 0 ? "up" : "down";
                        }
                    }
                    
                    // Ações Notórias
                    const mappedStocks = {
                        "PETR4": "PETR4",
                        "VALE3": "VALE3",
                        "ITUB4": "ITUB4"
                    };
                    
                    // As free APIs costumam nao ter cotaçoes especificas, dependendo do momento.
                    // Na ausência, usamos um fallback pro Yahoo Allorigins
                }
            }
        } catch(e) { /* Silenced */ }
        
        // 3. Fallback Yahoo Finance via proxy livre
        try {
            const assetsToFetch = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', '%5EBVSP'];
            for (const sym of assetsToFetch) {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                
                try {
                    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
                    if(res.ok) {
                        const jsonPayload = await res.json();
                        const data = JSON.parse(jsonPayload.contents);
                        
                        if (data?.chart?.result?.[0]?.meta) {
                            const meta = data.chart.result[0].meta;
                            const internalSym = sym === '%5EBVSP' ? 'IBOVESPA' : sym.replace('.SA', '');
                            const target = marketData.find(m => m.symbol === internalSym);
                            
                            // Apenas sobrecreve se tiver fallback padrao ou erro
                            if (target && meta.regularMarketPrice) {
                                if (internalSym === 'IBOVESPA') {
                                    target.value = `${meta.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                                } else {
                                    target.value = `R$ ${meta.regularMarketPrice.toFixed(2)}`;
                                }
                                target.status = meta.regularMarketPrice >= (meta.previousClose || meta.chartPreviousClose) ? "up" : "down";
                            }
                        }
                    }
                } catch(e) { /* skip */ }
            }
        } catch(e) {
            // master skip
        }

        // Renderização Final do Ticker
        if (tickerContent) {
            tickerContent.innerHTML = createTickerString(marketData);
        }
    }

    // Inicialização
    if (tickerContent) {
        tickerContent.innerHTML = createTickerString(marketData);
    }

    updateMarketQuotes();
    setInterval(updateMarketQuotes, 300000); // Atualiza a cada 5 minutos

    // Escuta a API Real do BCB vinda do calculator.js
    document.addEventListener('ratesLoaded', (e) => {
        const taxasReais = e.detail;

        const selic = marketData.find(m => m.symbol === "SELIC");
        if (selic) selic.value = `${taxasReais.selic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;

        const cdi = marketData.find(m => m.symbol === "CDI");
        if (cdi) cdi.value = `${taxasReais.cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;

        if (taxasReais.ipca) {
            const ipca = marketData.find(m => m.symbol === "IPCA (12m)");
            if (ipca) ipca.value = `${taxasReais.ipca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
        }

        if (tickerContent) {
            tickerContent.innerHTML = createTickerString(marketData);
        }
    });

});
