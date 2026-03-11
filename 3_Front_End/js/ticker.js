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

    // Função Pura para Atualizar um Node Específico Sem Quebrar a Animação
    function updateTickerNode(symbol, value, status) {
        // Encontra todas as instâncias (já que triplicamos o array pra animação infinita)
        const nodes = document.querySelectorAll(`[data-ticker-symbol="${symbol}"]`);
        
        let color = "#10b981"; // green
        let icon = "▲";
        if (status === "down") {
            color = "#ef4444"; // red
            icon = "▼";
        } else if (status === "neutral") {
            color = "#a1a1aa"; // gray
            icon = "■";
        }

        nodes.forEach(node => {
            node.style.color = color;
            node.innerHTML = `<strong style="color: #f8fafc;">${symbol}</strong> ${value} ${icon}`;
        });
    }

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

            // Usamos data-ticker-symbol para rastrear as cópias geradas
            htmlString += `<span class="ticker-item" data-ticker-symbol="${item.symbol}" style="color: ${color};"><strong style="color: #f8fafc;">${item.symbol}</strong> ${item.value} ${icon}</span>`;
        });

        return htmlString;
    }

    // A injeção pesada acontece APENAS UMA VEZ no Boot
    if (tickerContent) {
        tickerContent.innerHTML = createTickerString(marketData);
    }

    async function updateMarketQuotes() {
        console.log('[Trilha dos Juros] Iniciando rodada de atualização de cotações API...');

        // 1. AwesomeAPI (Moedas + Bitcoin)
        try {
            const currencyResponse = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD');
            if (currencyResponse.ok) {
                const cData = await currencyResponse.json();

                if (cData.USDBRL && cData.USDBRL.bid) {
                    const status = parseFloat(cData.USDBRL.pctChange) >= 0 ? "up" : "down";
                    updateTickerNode("DÓLAR", `R$ ${parseFloat(cData.USDBRL.bid).toFixed(2)}`, status);
                }
                if (cData.EURBRL && cData.EURBRL.bid) {
                    const status = parseFloat(cData.EURBRL.pctChange) >= 0 ? "up" : "down";
                    updateTickerNode("EURO", `R$ ${parseFloat(cData.EURBRL.bid).toFixed(2)}`, status);
                }
                if (cData.BTCUSD && cData.BTCUSD.bid) {
                    const status = parseFloat(cData.BTCUSD.pctChange) >= 0 ? "up" : "down";
                    updateTickerNode("BITCOIN", `$ ${parseFloat(cData.BTCUSD.bid).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, status);
                }
            }
        } catch (e) {
            console.warn('[Trilha dos Juros] AwesomeAPI falhou.', e);
        }

        // 2 & 3. Ibovespa e Ações via Vercel Serverless Function
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
                            
                            if (meta.regularMarketPrice) {
                                const status = meta.regularMarketPrice >= (meta.previousClose || meta.chartPreviousClose) ? "up" : "down";
                                let valStr = `R$ ${meta.regularMarketPrice.toFixed(2)}`;
                                if (internalSym === 'IBOVESPA') {
                                    valStr = `${meta.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
                                }
                                updateTickerNode(internalSym, valStr, status);
                            }
                        }
                    }
                } catch(e) { /* skip */ }
            });
            await Promise.allSettled(promessas);
        } catch(e) { /* master skip */ }
    }

    updateMarketQuotes();
    setInterval(updateMarketQuotes, 300000); // Atualiza a cada 5 minutos

    // Escuta a API Real do BCB vinda do calculator.js
    document.addEventListener('ratesLoaded', (e) => {
        const taxasReais = e.detail;

        if (taxasReais.selic) {
            updateTickerNode("SELIC", `${taxasReais.selic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`, "neutral");
        }
        if (taxasReais.cdi) {
            updateTickerNode("CDI", `${taxasReais.cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`, "neutral");
        }
        if (taxasReais.ipca) {
            updateTickerNode("IPCA (12m)", `${taxasReais.ipca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`, "neutral");
        }
    });

});
