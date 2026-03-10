/**
 * Módulo de Cotações de Commodities
 * Busca dados em tempo real via CommodityPriceAPI v2.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('commodities-grid');
    if (!grid) return;

    // CONFIGURAÇÃO: O Proxy PHP gerencia o cache e esconde sua API Key.
    const GIST_URL = 'https://gist.githubusercontent.com/EricMacedo10/09e0576859ee449aec8218405293db20/raw/cota_hoje.json';

    const commoditiesConfig = [
        { id: 'gold', name: 'Ouro', key: 'gold', icon: 'ph-coins' },
        { id: 'silver', name: 'Prata', key: 'silver', icon: 'ph-coin' },
        { id: 'coffee', name: 'Café', key: 'coffee', icon: 'ph-coffee' },
        { id: 'iron', name: 'Minério de Ferro', key: 'iron', icon: 'ph-factory' },
        { id: 'oil-brent', name: 'Petróleo Brent', key: 'oil', icon: 'ph-drop' }
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
            // Adicionado timestamp para evitar cache agressivo
            const res = await fetch(`${GIST_URL}?t=${new Date().getTime()}`);
            if (!res.ok) throw new Error('Falha ao carregar Gist');
            const data = await res.json();

            const processedQuotes = commoditiesConfig.map(config => {
                const item = data[config.key];
                return {
                    id: config.id,
                    name: config.name,
                    icon: config.icon,
                    price: item ? item.price : 0,
                    variation: item ? item.variation : 0,
                    prefix: 'US$'
                };
            });

            renderCommodities(processedQuotes);
            updateUpdateStatus(data.last_update);

        } catch (error) {
            console.error('[Commodities] Erro ao buscar cotações do Gist:', error);
            showError();
        }
    }

    function updateUpdateStatus(timeStr) {
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

        if (statusEl && timeStr) {
            const shortStr = timeStr.split(' ')[1].substring(0, 5);
            statusEl.innerHTML = `<i class="ph ph-clock"></i> Atualizado às ${shortStr}`;
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

