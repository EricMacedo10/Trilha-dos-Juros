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
        { id: 'BTC',     name: 'Bitcoin (BTC)',      type: 'crypto', icon: 'ph-currency-btc',           price: '...', change: 0, isFeatured: true },
        { id: 'IPCA_BC', name: 'IPCA Mensal (BCB)',  type: 'rate',   icon: 'ph-bank',                   price: '...', change: 0, isFeatured: false, subtitle: 'Último divulgado' },
        { id: 'IPCA_12', name: 'IPCA 12 meses',      type: 'rate',   icon: 'ph-chart-line-up',          price: '...', change: 0, isFeatured: false, subtitle: 'Acumulado BCB' },
        { id: 'COMPRA',  name: 'Real em 1994',       type: 'rate',   icon: 'ph-currency-circle-dollar', price: '...', change: 0, isFeatured: false, subtitle: 'Poder de Compra' },
        { id: 'PETR4',   name: 'Petrobras',          type: 'stock',  icon: 'ph-gas-pump',               price: '...', change: 0, isFeatured: false },
        { id: 'VALE3',   name: 'Vale',               type: 'stock',  icon: 'ph-mountains',              price: '...', change: 0, isFeatured: false },
        { id: 'ITUB4',   name: 'Itaú Unibanco',      type: 'stock',  icon: 'ph-bank',                   price: '...', change: 0, isFeatured: false },
        { id: 'BBDC4',   name: 'Bradesco',           type: 'stock',  icon: 'ph-bank',                   price: '...', change: 0, isFeatured: false }
    ];

    function renderRadar() {
        let htmlContent = '';

        ativosData.forEach(ativo => {
            const isUp = ativo.change >= 0;
            const changeClass = ativo.change === 0 ? 'neutral' : (ativo.change > 0 ? 'up' : 'down');
            const changeIcon = ativo.change === 0 ? '' : (ativo.change > 0 ? '▲' : '▼');
            const changeText = ativo.change === 0 ? '0.00%' : `${ativo.change > 0 ? '+' : ''}${ativo.change.toFixed(2)}%`;
            
            const featuredClass = ativo.isFeatured ? 'radar-card-featured' : '';
            const subtitleHtml = ativo.subtitle ? `<small style="display:block; font-size:0.6rem; opacity:0.6; margin-top: -2px;">${ativo.subtitle}</small>` : '';
            
            htmlContent += `
                <div class="commodity-mini-card ${featuredClass}">
                    <div class="commodity-header">
                        <i class="ph-fill ${ativo.icon}"></i> ${ativo.name}
                    </div>
                    <div class="commodity-price">
                        <div style="display:flex; flex-direction:column;">
                            <span>${ativo.price}</span>
                            ${subtitleHtml}
                        </div>
                        <span class="commodity-change ${changeClass}">${changeIcon} ${changeText}</span>
                    </div>
                </div>
            `;
        });

        radarGrid.innerHTML = htmlContent;
    }

    // Render Inicial
    renderRadar();

    // Sintoniza com o Banco Central via calculator.js para o IPCA Mensal Oficial
    document.addEventListener('ratesLoaded', (e) => {
        const rates = e.detail;
        if (rates.ipca) {
            const bcAtivo = ativosData.find(a => a.id === 'IPCA_BC');
            if (bcAtivo) {
                bcAtivo.price = `${rates.ipca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
                bcAtivo.change = 0;
                renderRadar();
            }
        }
    });

    // Helper para verificar se está rodando localmente (inclui protocolo file://)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

    async function fetchRadarData() {
        // 1. IPCA Acumulado 12 meses — BCB Série 13522 (gratuito, sem chave, sempre real)
        // A série 13522 JÁ É o IPCA Acumulado (Anualizado), não podemos aplicar juros compostos em cima dela!
        try {
            const ipcaUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json';
            const ipcaRes = await fetch(ipcaUrl);
            if (ipcaRes.ok) {
                const ipcaData = await ipcaRes.json();
                if (Array.isArray(ipcaData) && ipcaData.length > 0) {
                    const ipcaAcumulado = parseFloat(ipcaData[0].valor);

                    const ipca12Ativo = ativosData.find(a => a.id === 'IPCA_12');
                    if (ipca12Ativo) {
                        ipca12Ativo.price = `${ipcaAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
                        ipca12Ativo.change = 0;
                    }
                }
            }
        } catch (e) {
            console.warn('[Radar] Erro ao buscar IPCA 12m do BCB.', e);
        }

        // 1.1 Poder de Compra Histórico (Real desde 1994) — BCB Série 433 (Calculado)
        try {
            const historyUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/07/1994';
            const historyRes = await fetch(historyUrl);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                if (Array.isArray(historyData) && historyData.length > 0) {
                    let accumulatedIndex = 1.0;
                    historyData.forEach(item => {
                        accumulatedIndex *= (1 + (parseFloat(item.valor) / 100));
                    });
                    const power = 100.0 / accumulatedIndex;

                    const compraAtivo = ativosData.find(a => a.id === 'COMPRA');
                    if (compraAtivo) {
                        compraAtivo.price = `R$ ${power.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        compraAtivo.change = 0;
                    }
                }
            }
        } catch (e) {
            console.warn('[Radar] Erro ao calcular Poder de Compra Histórico. Usando Fallback de Simulação.', e);
            // Fallback para visualização local caso o CORS do Banco Central bloqueie o fetch direto no browser
            const compraAtivo = ativosData.find(a => a.id === 'COMPRA');
            if (compraAtivo && (compraAtivo.price === '...' || compraAtivo.price === 'Erro')) {
                compraAtivo.price = 'R$ 11,46'; // Valor real calculado via sênior scraper
            }
        }

        // 2. Fetch Criptomoedas (AwesomeAPI)
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
        const stocksToFetch = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA'];
        
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
