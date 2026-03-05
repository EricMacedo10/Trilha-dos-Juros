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

        // 2. BrAPI (Stocks - Ações Individuais)
        try {
            const assetsToFetch = ['PETR4', 'VALE3', 'ITUB4'];
            const fetchPromises = assetsToFetch.map(symbol =>
                fetch(`https://brapi.dev/api/quote/${symbol}`).then(res => res.ok ? res.json() : null).catch(() => null)
            );

            const results = await Promise.allSettled(fetchPromises);

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value && result.value.results && result.value.results.length > 0) {
                    const res = result.value.results[0];
                    const target = marketData.find(m => m.symbol === res.symbol);
                    if (target && res.regularMarketPrice !== undefined) {
                        target.value = `R$ ${res.regularMarketPrice.toFixed(2)}`;
                        target.status = (res.regularMarketChangePercent || 0) >= 0 ? "up" : "down";
                    }
                }
            });
        } catch (e) {
            console.warn('[Trilha dos Juros] Erro crítico no lote da BrAPI.', e);
        }

        // 3. IBOVESPA (Sincronização Avançada com Fallback Hierárquico)
        let ibovSincronizado = false;

        // Fonte A: Yahoo Finance (via AllOrigins)
        try {
            const yahooUrl = encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP');
            const response = await fetch(`https://api.allorigins.win/get?url=${yahooUrl}`);
            if (response.ok) {
                const proxyData = await response.json();
                const yData = JSON.parse(proxyData.contents);
                if (yData && yData.chart && yData.chart.result && yData.chart.result[0]) {
                    const meta = yData.chart.result[0].meta;
                    const target = marketData.find(m => m.symbol === "IBOVESPA");
                    if (target && meta.regularMarketPrice) {
                        target.value = `${meta.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                        target.status = meta.regularMarketPrice >= meta.previousClose ? "up" : "down";
                        ibovSincronizado = true;
                        console.log('[Trilha dos Juros] Ibovespa sintonizado via Yahoo.');
                    }
                }
            }
        } catch (e) {
            console.warn('[Trilha dos Juros] Yahoo falhou. Saltando para HG Brasil...');
        }

        // Fonte B: HG Brasil (Se Yahoo falhar)
        if (!ibovSincronizado) {
            try {
                const hgResponse = await fetch('https://api.hgbrasil.com/finance?format=json-cors');
                if (hgResponse.ok) {
                    const hgData = await hgResponse.json();
                    const ibov = hgData.results.stocks.IBOVESPA;
                    const target = marketData.find(m => m.symbol === "IBOVESPA");
                    if (target && ibov) {
                        target.value = `${ibov.points.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                        target.status = ibov.variation >= 0 ? "up" : "down";
                        ibovSincronizado = true;
                        console.log('[Trilha dos Juros] Ibovespa sintonizado via HG Brasil.');
                    }
                }
            } catch (e) {
                console.warn('[Trilha dos Juros] HG Brasil falhou. Saltando para BrAPI...');
            }
        }

        // Fonte C: BrAPI (Último Fallback)
        if (!ibovSincronizado) {
            try {
                const brResponse = await fetch('https://brapi.dev/api/quote/%5EBVSP');
                if (brResponse.ok) {
                    const brData = await brResponse.json();
                    if (brData && brData.results && brData.results.length > 0) {
                        const ibov = brData.results[0];
                        const target = marketData.find(m => m.symbol === "IBOVESPA");
                        if (target && ibov && ibov.regularMarketPrice) {
                            target.value = `${ibov.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                            target.status = (ibov.regularMarketChangePercent || 0) >= 0 ? "up" : "down";
                            ibovSincronizado = true;
                            console.log('[Trilha dos Juros] Ibovespa sintonizado via BrAPI.');
                        }
                    }
                }
            } catch (e) {
                console.error('[Trilha dos Juros] Todos os provedores de IBOVESPA falharam.', e);
            }
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
