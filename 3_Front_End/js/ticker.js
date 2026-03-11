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

        // 2 e 3. Yahoo Finance via AllOrigins (Ações + IBOVESPA)
        try {
            const assetsToFetch = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', '%5EBVSP'];
            const fetchPromises = assetsToFetch.map(symbol => {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
                return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(6000) })
                    .catch(() => null);
            });

            const results = await Promise.allSettled(fetchPromises);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status === 'fulfilled' && result.value && result.value.ok) {
                    try {
                        const jsonPayload = await result.value.json();
                        const data = JSON.parse(jsonPayload.contents);
                        
                        if (data && data.chart && data.chart.result && data.chart.result[0]) {
                            const meta = data.chart.result[0].meta;
                            // Corrige o nome do %5EBVSP no array
                            const targetSymbol = assetsToFetch[i] === '%5EBVSP' ? 'IBOVESPA' : assetsToFetch[i].replace('.SA', '');
                            const target = marketData.find(m => m.symbol === targetSymbol);
                            
                            if (target && meta.regularMarketPrice !== undefined) {
                                if (targetSymbol === 'IBOVESPA') {
                                    target.value = `${meta.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                                } else {
                                    target.value = `R$ ${meta.regularMarketPrice.toFixed(2)}`;
                                }
                                target.status = meta.regularMarketPrice >= (meta.previousClose || meta.chartPreviousClose) ? "up" : "down";
                            }
                        }
                    } catch (e) {
                         // Fall silently for parse errors
                    }
                }
            }
        } catch (e) {
            // Master catch bloc, silenciado para não sujar DevTools
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
