class MarketGlobalService {
    constructor() {
        this.cacheKey = 'hg_market_cache';
        this.cacheTimeKey = 'hg_market_cache_time';
        this.cacheDuration = 10 * 60 * 1000; // 10 minutos em ms
        
        // Lista dos 15 FIIs mais conhecidos/liquidos (Top IFIX)
        this.topTickers = 'MXRF11,HGLG11,KNCR11,XPLG11,VISC11,BTLG11,XPML11,KNRI11,IRDM11,RECT11,VINO11,GALG11,MCCI11,VGIR11,VRTA11';
        this.fiiData = [];

        // Contêineres
        this.currencyContainer = document.getElementById('market-global-list');
        this.stocksContainer = document.getElementById('stock-indices-list');
        this.viewCurrencies = document.getElementById('market-view-currencies');
        this.viewStocks = document.getElementById('market-view-stocks');
        this.viewFiis = document.getElementById('market-view-fiis');

        this.init();
    }

    async init() {
        // Carrega dados globais e lista de FIIs em paralelo
        const [globalData, topAssets] = await Promise.all([
            this.getMarketData(),
            this.getBatchAssets(this.topTickers)
        ]);

        if (globalData && globalData.results) {
            this.renderGlobal(globalData.results);
        }
        
        if (topAssets && topAssets.results) {
            this.fiiData = Object.values(topAssets.results);
            this.renderFiis(this.fiiData);
        }
    }

    async getMarketData() {
        const now = Date.now();
        const cachedData = sessionStorage.getItem(this.cacheKey);
        const cachedTime = sessionStorage.getItem(this.cacheTimeKey);

        if (cachedData && cachedTime && (now - cachedTime < this.cacheDuration)) {
            return JSON.parse(cachedData);
        }

        try {
            const response = await fetch('/api/hg');
            const data = await response.json();
            sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
            sessionStorage.setItem(this.cacheTimeKey, now.toString());
            return data;
        } catch (error) {
            return cachedData ? JSON.parse(cachedData) : null;
        }
    }

    async getBatchAssets(symbols) {
        try {
            const response = await fetch(`/api/hg?symbol=${symbols}`);
            return await response.json();
        } catch (error) {
            console.error('[Market Service] Erro ao buscar batch:', error);
            return null;
        }
    }

    async searchAsset() {
        const input = document.getElementById('asset-search-input');
        const symbol = input.value.trim().toUpperCase();
        
        if (!symbol) return;
        
        // Verifica se já está na lista para não gastar API
        const exists = this.fiiData.find(f => f.symbol === symbol);
        if (exists) {
            input.value = '';
            alert(`O ativo ${symbol} já está na lista!`);
            return;
        }

        try {
            const btn = document.querySelector('.search-asset-box button');
            btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i>';
            
            const response = await fetch(`/api/hg?symbol=${symbol}`);
            const data = await response.json();
            
            if (data && data.results && data.results[symbol]) {
                const asset = data.results[symbol];
                if (asset.error) throw new Error('Ativo não encontrado');
                
                // Adiciona ao topo da lista
                this.fiiData.unshift(asset);
                this.renderFiis(this.fiiData);
                input.value = '';
            } else {
                alert('Ativo não encontrado na B3. Verifique o ticker (Ex: PETR4).');
            }
        } catch (error) {
            alert('Erro ao buscar ativo. Verifique se o código está correto.');
        } finally {
            document.querySelector('.search-asset-box button').innerHTML = '<i class="ph ph-magnifying-glass"></i>';
        }
    }

    renderGlobal(results) {
        if (results.currencies) {
            this.renderCurrencies(results.currencies, this.currencyContainer);
            this.renderCurrencies(results.currencies, this.viewCurrencies, true);
        }
        if (results.stocks) {
            this.renderStocks(results.stocks, this.stocksContainer);
            this.renderStocks(results.stocks, this.viewStocks, true);
        }
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

    renderFiis(assets) {
        if (!this.viewFiis) return;
        
        this.viewFiis.innerHTML = assets.map(f => `
            <tr>
                <td style="font-weight: 700; color: var(--neon-green);">${f.symbol}</td>
                <td style="text-align: left; font-size: 0.8rem;">${f.name || f.company_name}</td>
                <td style="font-weight: 600;">R$ ${f.price.toFixed(2)}</td>
                <td style="color: ${f.change_percent >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                    ${f.change_percent >= 0 ? '▲' : '▼'} ${f.change_percent.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    }
}

// Singleton para acesso global
window.marketService = new MarketGlobalService();

// Singleton para acesso global
window.marketService = new MarketGlobalService();
