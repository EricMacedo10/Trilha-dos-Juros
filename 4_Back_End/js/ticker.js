/**
 * Letreiro Dinâmico de Mercado (Ticker)
 * Aquece a autoridade visual do site na mente do usuário.
 */

document.addEventListener('DOMContentLoaded', () => {

    const tickerContent = document.getElementById('ticker-content');

    // Dados Fixos Simulando API em Tempo Real (Faria Lima Style)
    const marketData = [
        { symbol: "SELIC", value: "10.75%", status: "neutral" },
        { symbol: "CDI", value: "10.65%", status: "neutral" },
        { symbol: "IBOVESPA", value: "128.530 pts", status: "up" },
        { symbol: "DÓLAR", value: "R$ 4.95", status: "down" },
        { symbol: "EURO", value: "R$ 5.35", status: "down" },
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
            let color = "#10b981"; // neon green Default Up
            let icon = "▲";

            if (item.status === "down") {
                color = "#ef4444"; // red
                icon = "▼";
            } else if (item.status === "neutral") {
                color = "#a1a1aa"; // gray
                icon = "■";
            }

            htmlString += `<span style="color: ${color};"><strong style="color: #f8fafc;">${item.symbol}</strong> ${item.value} ${icon}</span>`;
        });

        return htmlString;
    }

    if (tickerContent) {
        tickerContent.innerHTML = createTickerString(marketData);
    }

    // Escuta a API Real do BCB vinda do calculator.js
    document.addEventListener('ratesLoaded', (e) => {
        const taxasReais = e.detail;

        // Atualiza o Mockup com os dados absolutos e reais
        marketData[0].value = `${taxasReais.selic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
        marketData[1].value = `${taxasReais.cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;

        // Repinta o Ticker
        if (tickerContent) {
            tickerContent.innerHTML = createTickerString(marketData);
        }
    });

});
