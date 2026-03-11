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
        { id: 'gold', name: 'Ouro', key: 'gold', icon: 'ph-coins', unit: 'oz' },
        { id: 'silver', name: 'Prata', key: 'silver', icon: 'ph-coin', unit: 'oz' },
        { id: 'coffee', name: 'Café Arabica', key: 'coffee', icon: 'ph-coffee', scale: 132.276, unit: 'saca' },
        { id: 'iron', name: 'Minério de Ferro', key: 'iron', icon: 'ph-factory', unit: 'ton' },
        { id: 'oil-brent', name: 'Petróleo Brent', key: 'oil', icon: 'ph-drop', unit: 'barril' }
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
            // Cache busting via URL é suficiente e evita erro de CORS (Preflight)
            const res = await fetch(`${GIST_URL}?t=${new Date().getTime()}&r=${Math.random()}`);

            if (!res.ok) throw new Error('Falha ao carregar Gist');
            const data = await res.json();

            // Debug Sênior: Ver exatamente o que está vindo do Gist
            console.log('[Commodities] Dados recebidos do Gist:', data);

            // Sincronização Sênior: Se o Gist estiver vazio ou for antigo, loga no console
            if (!data.gold || !data.last_update) {
                console.warn('[Commodities] Gist carregado mas incompleto. Verifique o Scraper.');
            }

            const processedQuotes = commoditiesConfig.map(config => {
                const item = data[config.key];
                let price = item ? item.price : 0;

                // Aplica escala se necessário (Ex: lb -> saca 60kg)
                if (config.scale && price > 0) {
                    price *= config.scale;
                }

                return {
                    id: config.id,
                    name: config.name,
                    icon: config.icon,
                    price: price,
                    prefix: 'US$',
                    unit: config.unit || ''
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
            const cardHtml = `
                <div class="commodity-mini-card">
                    <div class="commodity-header">
                        <i class="ph ${data.icon}"></i> ${data.name}
                    </div>
                    <div class="commodity-price" title="${data.name} em tempo real">
                        <span>${priceStr} <small style="font-size: 0.6rem; opacity: 0.5; font-weight: 400;">${data.unit}</small></span>
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
    // Atualiza a cada 5 minutos (leitura do Gist sincronizado via GitHub Action a cada 1h)
    setInterval(fetchCommodities, 300000);
});

