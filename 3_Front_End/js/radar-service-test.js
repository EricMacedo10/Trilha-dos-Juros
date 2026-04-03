/**
 * Radar de Ativos em Destaque (VERSÃO DE TESTE - INTEGRADO COM DEEP LINKS)
 * Portado do GII para o Trilha dos Juros
 */

document.addEventListener('DOMContentLoaded', () => {

    const radarGrid = document.getElementById('radar-grid');
    if (!radarGrid) return;

    // Mapeamento de Deep Links (Herança do GII)
    const deepLinks = {
        'PETR4': {
            statusInvest: 'https://statusinvest.com.br/acoes/petr4',
            investing: 'https://br.investing.com/equities/petroleo-bras-sa-pn'
        },
        'VALE3': {
            statusInvest: 'https://statusinvest.com.br/acoes/vale3',
            investing: 'https://br.investing.com/equities/vale-sa-on-vale3'
        },
        'ITUB4': {
            statusInvest: 'https://statusinvest.com.br/acoes/itub4',
            investing: 'https://br.investing.com/equities/itau-unibanco-pn-ed-pure'
        },
        'BBDC4': {
            statusInvest: 'https://statusinvest.com.br/acoes/bbdc4',
            investing: 'https://br.investing.com/equities/bradesco-pn-ej-n1'
        },
        'IPCA_BC': {
            fonteOficial: 'https://www.bcb.gov.br/controleinflacao/indicepreco'
        },
        'IPCA_FOCUS': {
            fonteOficial: 'https://www.bcb.gov.br/publicacoes/focus'
        }
    };

    const ativosData = [
        { id: 'BTC',     name: 'Bitcoin (BTC)',      type: 'crypto', icon: 'ph-currency-btc',           price: '...', change: 0, isFeatured: true },
        { id: 'IPCA_BC', name: 'IPCA Mensal (BCB)',  type: 'rate',   icon: 'ph-bank',                   price: '...', change: 0, isFeatured: false, subtitle: 'Último divulgado' },
        { id: 'IPCA_FOCUS', name: 'IPCA (Focus 12m)', type: 'rate',   icon: 'ph-chart-line-up',          price: '...', change: 0, isFeatured: false, subtitle: 'Expectativa Mercado' },
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
            
            // Adição de Deep Links se existirem para o ID
            const linksAtivo = deepLinks[ativo.id];
            let deepLinkHtml = '';
            
            if (linksAtivo) {
                deepLinkHtml = `
                    <div class="deep-links-overlay" style="margin-top: 0.6rem; display: flex; justify-content: center; opacity: 1; transition: all 0.3s ease;">
                        ${linksAtivo.statusInvest ? `<a href="${linksAtivo.statusInvest}" target="_blank" style="color:var(--neon-green); font-size: 0.7rem; border: 1px solid rgba(16,185,129,0.3); padding: 3px 10px; border-radius: 4px; text-decoration:none; background: rgba(16,185,129,0.05); font-weight: 500;"><i class="ph ph-trend-up"></i> Ver Detalhes</a>` : ''}
                        ${linksAtivo.fonteOficial ? `<a href="${linksAtivo.fonteOficial}" target="_blank" style="color:var(--text-muted); font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 4px; text-decoration:none; background: rgba(255,255,255,0.02);"><i class="ph ph-link"></i> Fonte Oficial</a>` : ''}
                    </div>
                `;
            }

            htmlContent += `
                <div class="commodity-mini-card ${featuredClass}" style="position:relative; cursor:default;">
                    <div class="commodity-header">
                        <i class="ph-fill ${ativo.icon}"></i> ${ativo.name}
                    </div>
                    <div class="commodity-price" style="margin-bottom: ${linksAtivo ? '0.25rem' : '0'}">
                        <div style="display:flex; flex-direction:column;">
                            <span>${ativo.price}</span>
                            ${subtitleHtml}
                        </div>
                        <span class="commodity-change ${changeClass}">${changeIcon} ${changeText}</span>
                    </div>
                    ${deepLinkHtml}
                </div>
            `;
        });

        radarGrid.innerHTML = htmlContent;
    }

    renderRadar();

    // Sintoniza com o Banco Central via calculator.js para o IPCA Mensal Oficial
    document.addEventListener('ratesLoaded', (e) => {
        const rates = e.detail;
        if (rates.ipcaMensal) {
            const bcAtivo = ativosData.find(a => a.id === 'IPCA_BC');
            if (bcAtivo) {
                bcAtivo.price = `${rates.ipcaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
            }
        }
        if (rates.ipcaProjetado) {
            const ipcaFocusAtivo = ativosData.find(a => a.id === 'IPCA_FOCUS');
            if (ipcaFocusAtivo) {
                ipcaFocusAtivo.price = `${rates.ipcaProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%`;
            }
        }
        renderRadar();
    });

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

    async function fetchRadarData() {
        // Poder de Compra Histórico
        try {
            const historyUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/07/1994';
            const historyRes = await fetch(historyUrl);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                if (Array.isArray(historyData) && historyData.length > 0) {
                    let accumulatedIndex = 1.0;
                    historyData.forEach(item => { accumulatedIndex *= (1 + (parseFloat(item.valor) / 100)); });
                    const power = 100.0 / accumulatedIndex;
                    const compraAtivo = ativosData.find(a => a.id === 'COMPRA');
                    if (compraAtivo) {
                        compraAtivo.price = `R$ ${power.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                }
            }
        } catch (e) {
            const compraAtivo = ativosData.find(a => a.id === 'COMPRA');
            if (compraAtivo) compraAtivo.price = 'R$ 11,46';
        }

        // Crypto
        try {
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
        } catch (e) {}

        renderRadar();

        // Stocks (Só em produção ou via API Proxy)
        const stocksToFetch = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA'];
        const promessas = stocksToFetch.map(async (sym) => {
            if (isLocal) {
                const ativo = ativosData.find(a => a.id === sym.replace('.SA', ''));
                if (ativo && ativo.price === '...') ativo.price = 'Modo Local';
                return;
            }
            try {
                const res = await fetch(`/api/yahoo?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.chart?.result?.[0]?.meta) {
                        const meta = data.chart.result[0].meta;
                        const ativo = ativosData.find(a => a.id === sym.replace('.SA', ''));
                        if (ativo && meta.regularMarketPrice) {
                            ativo.price = `R$ ${meta.regularMarketPrice.toFixed(2)}`;
                            const prevClose = meta.previousClose || meta.chartPreviousClose;
                            if (prevClose) ativo.change = ((meta.regularMarketPrice - prevClose) / prevClose) * 100;
                        }
                    }
                }
            } catch (e) {}
        });

        await Promise.allSettled(promessas);
        renderRadar();
    }

    setTimeout(fetchRadarData, 1000);
    setInterval(fetchRadarData, 300000);
});
