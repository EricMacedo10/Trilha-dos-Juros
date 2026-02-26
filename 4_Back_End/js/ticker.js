/**
 * Letreiro Dinâmico de Mercado (Ticker)
 * Aquece a autoridade visual do site na mente do usuário.
 */

document.addEventListener('DOMContentLoaded', () => {

    const tickerContent = document.getElementById('ticker-content');

    // Dados Iniciais (Servindo como Fallback se a internet cair)
    let marketData = [
        { symbol: "SELIC", value: "11.25%", status: "neutral" },
        { symbol: "CDI", value: "11.15%", status: "neutral" },
        { symbol: "IBOVESPA", value: "128.530 pts", status: "up" },
        { symbol: "DÓLAR", value: "R$ 6.05", status: "up" },
        { symbol: "EURO", value: "R$ 6.15", status: "up" },
        { symbol: "PETR4", value: "R$ 41.22", status: "up" },
        { symbol: "VALE3", value: "R$ 67.80", status: "down" },
        { symbol: "ITUB4", value: "R$ 34.15", status: "up" },
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
            // 1. AwesomeAPI (Moedas - Funcionando OK em lote)
            const currencyResponse = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
            if (currencyResponse.ok) {
                const cData = await currencyResponse.json();
                marketData[3].value = `R$ ${parseFloat(cData.USDBRL.bid).toFixed(2)}`;
                marketData[3].status = parseFloat(cData.USDBRL.pctChange) >= 0 ? "up" : "down";

                marketData[4].value = `R$ ${parseFloat(cData.EURBRL.bid).toFixed(2)}`;
                marketData[4].status = parseFloat(cData.EURBRL.pctChange) >= 0 ? "up" : "down";
            }

            // 2. BrAPI (Stocks - REQUER CHAMADAS INDIVIDUAIS PARA USO PÚBLICO SEM TOKEN)
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

            // 3. IBOVESPA (Caso Especial - Tentativa Individual)
            try {
                const ibovRes = await fetch('https://brapi.dev/api/quote/%5EBVSP');
                if (ibovRes.ok) {
                    const ibovData = await ibovRes.json();
                    if (ibovData.results) {
                        const ibov = ibovData.results[0];
                        marketData[2].value = `${ibov.regularMarketPrice.toLocaleString('pt-BR')} pts`;
                        marketData[2].status = ibov.regularMarketChangePercent >= 0 ? "up" : "down";
                    }
                }
            } catch (e) { /* Fallback para IBOV se falhar chamadas sem token */ }

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
        marketData[0].value = `${taxasReais.selic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
        marketData[1].value = `${taxasReais.cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;

        if (tickerContent) {
            tickerContent.innerHTML = createTickerString(marketData);
        }
    });

});
