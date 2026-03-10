/**
 * Módulo de Cotações de Commodities
 * Busca dados em tempo real via CommodityPriceAPI v2.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('commodities-grid');
    if (!grid) return;

    // CONFIGURAÇÃO: O Proxy PHP gerencia o cache e esconde sua API Key.
    const PROXY_URL = '../api_commodities.php';

    const commoditiesConfig = [
        { id: 'gold', name: 'Ouro', symbol: 'XAU', icon: 'ph-coins' },
        { id: 'silver', name: 'Prata', symbol: 'XAG', icon: 'ph-coin' },
        { id: 'coffee', name: 'Café', symbol: 'CA', icon: 'ph-coffee' },
        { id: 'iron', name: 'Minério de Ferro', symbol: 'TIOC', icon: 'ph-factory' },
        { id: 'oil-brent', name: 'Petróleo Brent', symbol: 'BRENTOIL-FUT', icon: 'ph-drop' }
    ];

    async function fetchCommodities() {
        if (grid.innerHTML.trim() === '') {
            grid.innerHTML = `
                <div class="loading-commodities" style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.8rem; grid-column: 1 / -1;">
                    <i class="ph ph-circle-notch ph-spin" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                    Sincronizando Mercado Global...
                </div>
            `;
        }

        try {
            const symbols = commoditiesConfig.map(c => c.symbol).join(',');

            // 1. Busca Preços Atuais via Proxy PHP
            const latestRes = await fetch(`${PROXY_URL}?action=latest&symbols=${symbols}`);
            if (!latestRes.ok) throw new Error('Erro na consulta de preços atuais');
            const latestData = await latestRes.json();

            // 2. Busca Preços de Ontem via Proxy PHP
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            const histRes = await fetch(`${PROXY_URL}?action=historical&symbols=${symbols}&date=${dateStr}`);
            let histData = null;
            if (histRes.ok) {
                histData = await histRes.json();
            }

            const processedQuotes = commoditiesConfig.map(config => {
                const currentPrice = latestData.rates[config.symbol];
                let variation = 0;

                if (currentPrice && histData && histData.rates[config.symbol]) {
                    const prevClose = histData.rates[config.symbol].close || histData.rates[config.symbol];
                    if (prevClose > 0) {
                        variation = ((currentPrice - prevClose) / prevClose) * 100;
                    }
                }

                return {
                    id: config.id,
                    name: config.name,
                    icon: config.icon,
                    price: currentPrice || 0,
                    variation: variation,
                    prefix: 'US$'
                };
            });

            renderCommodities(processedQuotes);
            updateUpdateStatus(latestData.timestamp * 1000);

        } catch (error) {
            console.error('[Commodities] Erro ao buscar cotações via Proxy:', error);
            showError();
        }
    }

    function updateUpdateStatus(timestamp) {
        let statusEl = document.getElementById('market-status-time');
        if (!statusEl) {
            const panel = document.getElementById('commodities-panel');
            const h4 = panel ? panel.querySelector('h4') : null;
            if (h4) {
                h4.style.display = 'flex';
                h4.style.justifyContent = 'space-between';
                h4.style.alignItems = 'center';

                statusEl = document.createElement('span');
                statusEl.id = 'market-status-time';
                statusEl.style.fontSize = '0.65rem';
                statusEl.style.opacity = '0.6';
                statusEl.style.fontWeight = '400';
                h4.appendChild(statusEl);
            }
        }

        if (statusEl && timestamp) {
            const date = new Date(timestamp);
            const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            statusEl.innerHTML = `<i class="ph ph-clock"></i> Atualizado às ${timeStr}`;
        }
    }

    function renderCommodities(quotes) {
        grid.innerHTML = '';

        quotes.forEach(data => {
            const formatPrice = (val) => {
                return parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            const priceStr = `${data.prefix} ${formatPrice(data.price)}`;
            const changePct = data.variation;
            const changeStr = `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`;

            let changeClass = 'neutral';
            if (changePct > 0) changeClass = 'up';
            if (changePct < 0) changeClass = 'down';

            const cardHtml = `
                <div class="commodity-mini-card">
                    <div class="commodity-header">
                        <i class="ph ${data.icon}"></i> ${data.name}
                    </div>
                    <div class="commodity-price" title="${data.name} em tempo real">
                        <span>${priceStr}</span>
                        <span class="commodity-change ${changeClass}">${changeStr}</span>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function showError() {
        grid.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem; grid-column: 1 / -1; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px;">
                <i class="ph ph-warning-circle" style="font-size: 1.2rem; color: #f59e0b; margin-bottom: 0.5rem; display: block;"></i>
                Serviço de mercado temporariamente indisponível.
            </div>
        `;
    }

    fetchCommodities();
    // Atualiza a cada 5 minutos para economizar requests do plano Lite (2000/mês)
    setInterval(fetchCommodities, 300000);
});

