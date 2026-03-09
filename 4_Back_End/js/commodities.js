/**
 * Módulo de Cotações de Commodities
 * Busca dados usando APIs alternativas (BrAPI, AwesomeAPI, etc).
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('commodities-grid');
    if (!grid) return;

    // Configuração dos Ativos
    // Em virtude do bloqueio severo de CORS do Yahoo Finance e proxies,
    // usaremos fontes alternativas Brasileiras que refletem os derivativos ou mercado local/global.
    const commodities = [
        { id: 'gold', name: 'Ouro', symbol: 'GC=F', icon: 'ph-coins', unit: 'oz' },
        { id: 'silver', name: 'Prata', symbol: 'SI=F', icon: 'ph-coin', unit: 'oz' },
        { id: 'oil', name: 'Petróleo Brent', symbol: 'BZ=F', icon: 'ph-drop', unit: 'bbl' }
    ];

    // Array de ativos para renderizar via B3 (BrAPI) ou fallback estático simulado devido à escassez de APIs gratuitas de commodities abertas
    // Como a API gratuita da B3 (BrAPI) foca em ações e FIIs, e não derivativos puros (BGI, ICF), 
    // usaremos um mock inteligente baseado na variação macroeconômica do dia para manter a UI viva, 
    // ou tentaremos buscar o que for possível da API Awesome.

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
            // Tenta buscar cotação USD para converter valores se necessário
            let usdRate = 6.00;
            try {
                const usdRes = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
                if (usdRes.ok) {
                    const usdData = await usdRes.json();
                    usdRate = parseFloat(usdData.USDBRL.bid);
                }
            } catch (e) { }

            // Puxa os dados reais raspados pelo nosso script Python hospedado localmente/no GitHub
            let baseData = null;
            try {
                // Cache busting simples: adiciona timestamp para evitar cache do navegador/proxy
                const cacheBuster = new Date().getTime();
                const jsonUrl = `mercado_global.json?t=${cacheBuster}`;

                const res = await fetch(jsonUrl, { cache: 'no-store' });
                if (res.ok) {
                    const scrapedData = await res.json();
                    console.log("[Commodities] Dados sincronizados recebidos:", scrapedData.last_update);

                    const buildBase = (key, pfx) => {
                        const s = scrapedData[key] || {};
                        const p = s.price || 0;
                        return {
                            price: p,
                            variation: s.variation !== null && s.variation !== undefined ? s.variation : 0,
                            prefix: pfx
                        };
                    };

                    baseData = {
                        gold: buildBase('gold', 'US$'),
                        silver: buildBase('silver', 'US$'),
                        oil: buildBase('oil', 'US$'),
                        lastUpdate: scrapedData.last_update || null
                    };
                }
            } catch (err) {
                console.warn("Aviso: cota_hoje.json não encontrado ou erro no fetch. Rodando valores de salvaguarda.");
            }

            // Fallback Inteligente caso o robô scraper esteja offline ou o JSON não construído
            if (!baseData) {
                baseData = {
                    gold: { price: 2928.40, variation: -0.24, prefix: 'US$' },
                    silver: { price: 33.55, variation: 0.85, prefix: 'US$' },
                    oil: { price: 77.23, variation: 1.12, prefix: 'US$' },
                    lastUpdate: null
                };
            }

            const todayQuotes = commodities.map(c => {
                const base = baseData[c.id];
                return {
                    id: c.id,
                    symbol: c.symbol,
                    regularMarketPrice: base.price,
                    regularMarketChangePercent: base.variation,
                    prefix: base.prefix
                };
            });

            // Para garantir que a promessa demore um instante e mostre o loading
            setTimeout(() => {
                renderCommodities(todayQuotes);
                updateUpdateStatus(baseData.lastUpdate);
            }, 800);

        } catch (error) {
            console.error('[Commodities] Erro ao buscar cotações:', error);
            showError();
        }
    }

    function updateUpdateStatus(timestamp) {
        let statusEl = document.getElementById('market-status-time');
        if (!statusEl) {
            const panel = document.getElementById('commodities-panel');
            const h4 = panel.querySelector('h4');
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

        if (timestamp) {
            const date = new Date(timestamp);
            const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            statusEl.innerHTML = `<i class="ph ph-clock"></i> Sincronizado às ${timeStr}`;
        } else {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            statusEl.innerHTML = `<i class="ph ph-clock"></i> Simulado às ${timeStr}`;
        }
    }

    function renderCommodities(quotes) {
        grid.innerHTML = '';

        commodities.forEach(config => {
            const data = quotes.find(q => q.id === config.id);
            if (!data) return;

            const formatPrice = (val) => {
                const numericVal = parseFloat(val);
                if (isNaN(numericVal)) return "0,00";
                return numericVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            const price = `${data.prefix} ${formatPrice(data.regularMarketPrice)}`;
            const changePct = data.regularMarketChangePercent || 0;
            const changeStr = changePct !== null
                ? `${changePct > 0 ? '+' : ''}${formatPrice(changePct)}%`
                : '--';

            let changeClass = 'neutral';
            if (changePct > 0) changeClass = 'up';
            if (changePct < 0) changeClass = 'down';

            const cardHtml = `
                <div class="commodity-mini-card">
                    <div class="commodity-header">
                        <i class="ph ${config.icon}"></i> ${config.name}
                    </div>
                    <div class="commodity-price" title="${config.name} na referência de mercado">
                        <span>${price}</span>
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
                Não foi possível carregar o mercado financeiro.
            </div>
        `;
    }

    fetchCommodities();
    setInterval(fetchCommodities, 60000); // Atualiza a simulação visual a cada 1 min
});
