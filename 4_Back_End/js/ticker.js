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
        try {
            // 1. AwesomeAPI (Moedas + Bitcoin - Funcionando OK em lote)
            const currencyResponse = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD');
            if (currencyResponse.ok) {
                const cData = await currencyResponse.json();

                // Dólar
                const usd = marketData.find(m => m.symbol === "DÓLAR");
                if (usd) {
                    usd.value = `R$ ${parseFloat(cData.USDBRL.bid).toFixed(2)}`;
                    usd.status = parseFloat(cData.USDBRL.pctChange) >= 0 ? "up" : "down";
                }

                // Euro
                const eur = marketData.find(m => m.symbol === "EURO");
                if (eur) {
                    eur.value = `R$ ${parseFloat(cData.EURBRL.bid).toFixed(2)}`;
                    eur.status = parseFloat(cData.EURBRL.pctChange) >= 0 ? "up" : "down";
                }

                // Bitcoin
                const btc = marketData.find(m => m.symbol === "BITCOIN");
                if (btc && cData.BTCUSD) {
                    btc.value = `$ ${parseFloat(cData.BTCUSD.bid).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                    btc.status = parseFloat(cData.BTCUSD.pctChange) >= 0 ? "up" : "down";
                }
            }

            // 2. BrAPI (Stocks - Fetches individuais para evitar restrição de token em lote)
            const assetsToFetch = ['PETR4', 'VALE3', 'ITUB4'];
            const fetchPromises = assetsToFetch.map(symbol =>
                fetch(`https://brapi.dev/api/quote/${symbol}`).then(res => res.ok ? res.json() : null)
            );

            const results = await Promise.allSettled(fetchPromises);

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value && result.value.results) {
                    const res = result.value.results[0];
                    const target = marketData.find(m => m.symbol === res.symbol);
                    if (target) {
                        target.value = `R$ ${res.regularMarketPrice.toFixed(2)}`;
                        target.status = res.regularMarketChangePercent >= 0 ? "up" : "down";
                    }
                }
            });

            // 3. IBOVESPA (Sincronização Definitiva - Priorizando HG Brasil pois BrAPI falha sem token para índices)
            try {
                // Tenta HG Brasil primeiro (CORS-friendly e sem token)
                const hgResponse = await fetch('https://api.hgbrasil.com/finance?format=json-cors');
                if (hgResponse.ok) {
                    const hgData = await hgResponse.json();
                    if (hgData && hgData.results && hgData.results.stocks && hgData.results.stocks.IBOVESPA) {
                        const ibov = hgData.results.stocks.IBOVESPA;
                        const target = marketData.find(m => m.symbol === "IBOVESPA");
                        if (target) {
                            target.value = `${ibov.points.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                            target.status = ibov.variation >= 0 ? "up" : "down";
                        }
                    } else {
                        throw new Error('HG Brasil format mismatch');
                    }
                } else {
                    throw new Error('HG Brasil response not ok');
                }
            } catch (e) {
                console.warn('[Trilha dos Juros] Fallback: Tentando BrAPI para IBOVESPA...', e);
                try {
                    const ibovResponse = await fetch('https://brapi.dev/api/quote/^BVSP');
                    if (ibovResponse.ok) {
                        const ibovData = await ibovResponse.json();
                        const ibov = ibovData.results[0];
                        const target = marketData.find(m => m.symbol === "IBOVESPA");
                        if (target && ibov) {
                            target.value = `${ibov.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                            target.status = ibov.regularMarketChangePercent >= 0 ? "up" : "down";
                        }
                    }
                } catch (e2) {
                    console.warn('[Trilha dos Juros] Todas as APIs de IBOVESPA falharam.', e2);
                }
            }

        } catch (error) {
            console.warn('[Trilha dos Juros] Erro ao carregar cotações reais. Mantendo fallbacks.', error);
        } finally {
            if (tickerContent) {
                tickerContent.innerHTML = createTickerString(marketData);
            }
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
