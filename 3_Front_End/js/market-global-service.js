/**
 * MarketGlobalService - Gerencia a exibição de Câmbio e Mercado Global
 * Dados seguros originados da API HG Brasil Finance.
 */
class MarketGlobalService {
    constructor() {
        this.currencyContainer = document.getElementById('market-global-list');
        this.stocksContainer = document.getElementById('stock-indices-list');
        this.dataFile = 'hg.json'; 
        this.init();
    }

    async init() {
        try {
            let response = await fetch('/hg.json');
            if (!response.ok) {
                response = await fetch('../hg.json'); 
            }
            
            if (!response.ok) throw new Error('Falha ao carregar HG Data');

            const data = await response.json();
            
            if (data && data.results) {
                // Renderiza Moedas
                if (data.results.currencies) {
                    this.renderCurrencies(data.results.currencies);
                }
                // Renderiza Bolsas
                if (data.results.stocks) {
                    this.renderStocks(data.results.stocks);
                }
            }
        } catch (error) {
            console.warn('[MarketGlobalService] Erro ao carregar dados do mercado:', error);
            this.renderError();
        }
    }

    renderCurrencies(currencies) {
        if (!this.currencyContainer) return;

        const targets = ['USD', 'EUR', 'GBP', 'ARS', 'CAD', 'JPY'];
        
        const html = targets.map(key => {
            const coin = currencies[key];
            if (!coin) return '';

            const variationIcon = coin.variation >= 0 ? 'ph-trend-up' : 'ph-trend-down';
            const variationColor = coin.variation >= 0 ? '#10b981' : '#ef4444';

            return `
                <div class="market-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; color: var(--brand-blue);">
                            ${key.substring(0,2)}
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-main);">${coin.name}</span>
                            <span style="font-size: 0.6rem; color: var(--text-muted);">${key} / BRL</span>
                        </div>
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">R$ ${coin.buy.toFixed(2).replace('.', ',')}</span>
                        <span style="font-size: 0.65rem; color: ${variationColor}; display: flex; align-items: center; justify-content: flex-end; gap: 2px;">
                            <i class="ph ${variationIcon}"></i> ${coin.variation}%
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        this.currencyContainer.innerHTML = html;
    }

    renderStocks(stocks) {
        if (!this.stocksContainer) return;

        const targets = ['IBOVESPA', 'IFIX', 'NASDAQ', 'DOWJONES', 'CAC', 'NIKKEI'];
        
        const html = targets.map(key => {
            const stock = stocks[key];
            if (!stock) return '';

            const variationIcon = stock.variation >= 0 ? 'ph-trend-up' : 'ph-trend-down';
            const variationColor = stock.variation >= 0 ? '#10b981' : '#ef4444';

            return `
                <div class="market-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 32px; height: 32px; background: rgba(139, 92, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; color: #8b5cf6;">
                            ${key.substring(0,1)}
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-main);">${stock.name}</span>
                            <span style="font-size: 0.6rem; color: var(--text-muted);">${stock.location}</span>
                        </div>
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">${stock.points.toLocaleString('pt-BR')} pts</span>
                        <span style="font-size: 0.65rem; color: ${variationColor}; display: flex; align-items: center; justify-content: flex-end; gap: 2px;">
                            <i class="ph ${variationIcon}"></i> ${stock.variation}%
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        this.stocksContainer.innerHTML = html;
    }

    renderError() {
        if (this.currencyContainer) this.currencyContainer.innerHTML = '<p style="text-align:center; font-size:0.7rem;">Erro ao carregar câmbio.</p>';
        if (this.stocksContainer) this.stocksContainer.innerHTML = '<p style="text-align:center; font-size:0.7rem;">Erro ao carregar bolsas.</p>';
    }
}

// Inicializa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    new MarketGlobalService();
});
