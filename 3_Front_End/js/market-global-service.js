class MarketGlobalService {
    constructor() {
        this.cacheKey = 'hg_market_cache';
        this.cacheTimeKey = 'hg_market_cache_time';
        this.cacheDuration = 10 * 60 * 1000; // 10 minutos em ms
        
        // Contêineres da Barra Lateral
        this.currencyContainer = document.getElementById('market-global-list');
        this.stocksContainer = document.getElementById('stock-indices-list');
        
        // Contêineres da Nova View (Cotações)
        this.viewCurrencies = document.getElementById('market-view-currencies');
        this.viewStocks = document.getElementById('market-view-stocks');
        this.viewFiis = document.getElementById('market-view-fiis');

        this.init();
    }

    async init() {
        const data = await this.getMarketData();
        if (data && data.results) {
            this.renderAll(data.results);
        }
    }

    async getMarketData() {
        const now = Date.now();
        const cachedData = sessionStorage.getItem(this.cacheKey);
        const cachedTime = sessionStorage.getItem(this.cacheTimeKey);

        // Se tiver cache válido, retorna ele (Respeitando o Plano Member)
        if (cachedData && cachedTime && (now - cachedTime < this.cacheDuration)) {
            console.log('[Market Service] Usando dados em cache (Member Mode)');
            return JSON.parse(cachedData);
        }

        try {
            console.log('[Market Service] Buscando novos dados da HG Brasil...');
            const response = await fetch('/api/hg');
            if (!response.ok) throw new Error('Falha na API HG');
            
            const data = await response.json();
            
            // Salva no cache
            sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
            sessionStorage.setItem(this.cacheTimeKey, now.toString());
            
            return data;
        } catch (error) {
            console.error('[Market Service] Erro ao buscar dados:', error);
            return cachedData ? JSON.parse(cachedData) : null;
        }
    }

    renderAll(results) {
        if (results.currencies) {
            this.renderCurrencies(results.currencies, this.currencyContainer);
            this.renderCurrencies(results.currencies, this.viewCurrencies, true);
        }
        if (results.stocks) {
            this.renderStocks(results.stocks, this.stocksContainer);
            this.renderStocks(results.stocks, this.viewStocks, true);
        }
        
        // Renderiza FIIs (Destaques do Plano Member)
        this.renderFiis();
    }

    renderCurrencies(currencies, container, isFullView = false) {
        if (!container) return;
        const targets = isFullView ? ['USD', 'EUR', 'GBP', 'ARS', 'BTC'] : ['USD', 'EUR', 'GBP'];
        
        container.innerHTML = targets.map(key => {
            const coin = currencies[key];
            if (!coin) return '';
            const isUp = coin.variation >= 0;
            return `
                <div class="market-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-weight: 700; color: var(--brand-blue);">${key}</div>
                        <span style="font-size: 0.85rem; color: var(--text-main);">${coin.name}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700;">R$ ${coin.buy.toFixed(2)}</div>
                        <div style="font-size: 0.7rem; color: ${isUp ? '#10b981' : '#ef4444'};">
                            ${isUp ? '▲' : '▼'} ${coin.variation}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStocks(stocks, container, isFullView = false) {
        if (!container) return;
        const targets = isFullView ? ['IBOVESPA', 'IFIX', 'NASDAQ', 'DOWJONES', 'NIKKEI'] : ['IBOVESPA', 'IFIX'];

        container.innerHTML = targets.map(key => {
            const stock = stocks[key];
            if (!stock) return '';
            const isUp = stock.variation >= 0;
            return `
                <div class="market-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-weight: 700; color: #8b5cf6;">${key.substring(0,4)}</div>
                        <span style="font-size: 0.85rem; color: var(--text-main);">${stock.name}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700;">${stock.points.toLocaleString('pt-BR')} pts</div>
                        <div style="font-size: 0.7rem; color: ${isUp ? '#10b981' : '#ef4444'};">
                            ${isUp ? '▲' : '▼'} ${stock.variation}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderFiis() {
        if (!this.viewFiis) return;
        
        // Ativos de destaque para o Radar (Plano Member)
        const fiis = [
            { ticker: 'MXRF11', name: 'Maxi Renda', price: 10.45, var: 0.12 },
            { ticker: 'HGLG11', name: 'CGHG Logística', price: 168.30, var: -0.05 },
            { ticker: 'KNCR11', name: 'Kinea Rendimentos', price: 102.15, var: 0.22 },
            { ticker: 'XPLG11', name: 'XP Logística', price: 108.40, var: -0.15 }
        ];

        this.viewFiis.innerHTML = fiis.map(f => `
            <tr>
                <td style="font-weight: 700; color: var(--neon-green);">${f.ticker}</td>
                <td style="text-align: left; font-size: 0.8rem;">${f.name}</td>
                <td style="font-weight: 600;">R$ ${f.price.toFixed(2)}</td>
                <td style="color: ${f.var >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                    ${f.var >= 0 ? '▲' : '▼'} ${f.var}%
                </td>
            </tr>
        `).join('');
    }
}

// Singleton para acesso global
window.marketService = new MarketGlobalService();
