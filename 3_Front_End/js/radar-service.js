/**
 * Radar de Ativos em Destaque
 * Substitui o antigo painel de Commodities.
 * Busca Criptomoedas (AwesomeAPI) e Ações (Vercel Serverless / Yahoo).
 */

document.addEventListener('DOMContentLoaded', () => {

    const radarGrid = document.getElementById('radar-grid');
    if (!radarGrid) return;

    // Estado local para armazenar e renderizar de uma vez
    const ativosData = [
        { id: 'BTC', name: 'Bitcoin (BTC)', type: 'crypto', icon: 'ph-currency-btc', price: '...', change: 0, isFeatured: true },
        { id: 'PETR4', name: 'Petrobras', type: 'stock', icon: 'ph-gas-pump', price: '...', change: 0, isFeatured: false },
        { id: 'VALE3', name: 'Vale', type: 'stock', icon: 'ph-mountains', price: '...', change: 0, isFeatured: false },
        { id: 'ITUB4', name: 'Itaú Unibanco', type: 'stock', icon: 'ph-bank', price: '...', change: 0, isFeatured: false }
    ];

    function renderRadar() {
        let htmlContent = '';

        ativosData.forEach(ativo => {
            const isUp = ativo.change >= 0;
            const changeClass = ativo.change === 0 ? 'neutral' : (ativo.change > 0 ? 'up' : 'down');
            const changeIcon = ativo.change === 0 ? '' : (ativo.change > 0 ? '▲' : '▼');
            const changeText = ativo.change === 0 ? '0.00%' : `${ativo.change > 0 ? '+' : ''}${ativo.change.toFixed(2)}%`;
            
            const featuredClass = ativo.isFeatured ? 'radar-card-featured' : '';
            
            htmlContent += `
                <div class="commodity-mini-card ${featuredClass}">
                    <div class="commodity-header">
                        <i class="ph-fill ${ativo.icon}"></i> ${ativo.name}
                    </div>
                    <div class="commodity-price">
                        <span>${ativo.price}</span>
                        <span class="commodity-change ${changeClass}">${changeIcon} ${changeText}</span>
                    </div>
                </div>
            `;
        });

        radarGrid.innerHTML = htmlContent;
    }

    // Render Inicial
    renderRadar();

    // Helper para verificar se está rodando localmente
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    async function fetchRadarData() {
        // 1. Fetch Criptomoedas (AwesomeAPI - 100% Gratuito e sem CORS)
        try {
            // Alterado para BTC-USD conforme solicitação
            const resCrypto = await fetch('https://economia.awesomeapi.com.br/json/last/BTC-USD');
            if (resCrypto.ok) {
                const data = await resCrypto.json();
                if (data.BTCUSD) {
                    const btc = ativosData.find(a => a.id === 'BTC');
                    if (btc) {
                        btc.price = `$ ${parseFloat(data.BTCUSD.bid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        btc.change = parseFloat(data.BTCUSD.pctChange);
                    }
                }
            }
        } catch (e) {
            console.warn('[Radar] Erro ao buscar Criptomoedas.', e);
        }

        renderRadar(); // Atualiza a tela com o Bitcoin que já chegou rápido

        // 2. Fetch Ações B3 (Vercel Serverless Function via Yahoo Finance)
        // Só tenta se NÃO estiver local para evitar ERROS 404 no console do navegador
        const stocksToFetch = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA'];
        
        const promessas = stocksToFetch.map(async (sym) => {
            if (isLocal) {
                const ativo = ativosData.find(a => a.id === sym.replace('.SA', ''));
                if (ativo) ativo.price = 'Modo Prod.';
                return;
            }

            try {
                const res = await fetch(`/api/yahoo?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.chart?.result?.[0]?.meta) {
                        const meta = data.chart.result[0].meta;
                        const internalSym = sym.replace('.SA', '');
                        
                        const ativo = ativosData.find(a => a.id === internalSym);
                        if (ativo && meta.regularMarketPrice) {
                            ativo.price = `R$ ${meta.regularMarketPrice.toFixed(2)}`;
                            
                            const prevClose = meta.previousClose || meta.chartPreviousClose;
                            if (prevClose) {
                                ativo.change = ((meta.regularMarketPrice - prevClose) / prevClose) * 100;
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`[Radar] Falha ao buscar ${sym} via Vercel Function.`, e);
                
                const ativo = ativosData.find(a => a.id === sym.replace('.SA', ''));
                if (ativo && ativo.price === '...') {
                    ativo.price = 'Erro';
                }
            }
        });

        await Promise.allSettled(promessas);
        
        // Render Final das Ações
        renderRadar();
    }

    // Inicia 1 segundo após o boot para não competir com o Ticker principal
    setTimeout(fetchRadarData, 1000);

    // Sincroniza a cada 5 minutos
    setInterval(fetchRadarData, 300000);

});
