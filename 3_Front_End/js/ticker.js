/**
 * Letreiro Dinâmico de Mercado (Ticker)
 * Aquece a autoridade visual do site na mente do usuário.
 */

document.addEventListener('DOMContentLoaded', () => {

    const tickerContent = document.getElementById('ticker-content');

    // Dados Iniciais (Servindo como Fallback se a internet cair ou APIs bloquearem índices)
    let marketData = [
        { symbol: "SELIC", value: "11.25%", status: "neutral" },
        { symbol: "CDI", value: "11.15%", status: "neutral" },
        { symbol: "IBOVESPA", value: "Aguardando...", status: "neutral" },
        { symbol: "DÓLAR", value: "Aguardando...", status: "neutral" },
        { symbol: "EURO", value: "Aguardando...", status: "neutral" },
        { symbol: "BITCOIN", value: "Aguardando...", status: "neutral" },
        { symbol: "PETR4", value: "Aguardando...", status: "neutral" },
        { symbol: "VALE3", value: "Aguardando...", status: "neutral" },
        { symbol: "ITUB4", value: "Aguardando...", status: "neutral" },
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

        // 2 & 3. Ibovespa e Ações via Vercel Serverless Function (Sem limite de CORS ou IP bloqueado)
        try {
            const assetsToFetch = ['%5EBVSP', 'PETR4.SA', 'VALE3.SA', 'ITUB4.SA'];
            const promessas = assetsToFetch.map(async (sym) => {
                const urlBackend = `/api/yahoo?symbol=${sym}`;
                try {
                    const res = await fetch(urlBackend, { signal: AbortSignal.timeout(5000) });
                    if(res.ok) {
                        const data = await res.json();
                        if (data?.chart?.result?.[0]?.meta) {
                            const meta = data.chart.result[0].meta;
                            const internalSym = sym === '%5EBVSP' ? 'IBOVESPA' : sym.replace('.SA', '');
                            const target = marketData.find(m => m.symbol === internalSym);
                            
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
                } catch(e) { /* skip individual fallback request */ }
            });
            await Promise.allSettled(promessas);
        } catch(e) { /* master skip */ }

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
            // Removendo eventuais frames de CSS animation presa
            tickerContent.innerHTML = '';
            // Forçando repaint clean
            setTimeout(() => {
                tickerContent.innerHTML = createTickerString(marketData);
            }, 10);
        }
    });

});
