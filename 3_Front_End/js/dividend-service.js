/**
 * DividendService - Gerencia a exibição do Radar de Proventos (Data-COM)
 * Baseado no script de raspagem performado no diretório de automação.
 */
class DividendService {
    constructor() {
        this.container = document.getElementById('dividends-list');
        this.dataFile = 'proventos_data.json';
        this.init();
    }

    async init() {
        try {
            const data = await this.fetchDividends();
            if (data && data.length > 0) {
                this.render(data);
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.warn('[DividendService] Falha ao carregar proventos:', error);
            this.renderEmpty();
        }
    }

    async fetchDividends() {
        // Tenta carregar o JSON gerado pelo script de raspagem
        const response = await fetch(this.dataFile + '?t=' + Date.now());
        if (!response.ok) return null;
        return await response.json();
    }

    render(dividends) {
        if (!this.container) return;

        // Filtra apenas os 5 mais recentes ou relevantes (Data-COM futura ou presente)
        const displayData = dividends.slice(0, 6);

        this.container.innerHTML = displayData.map(item => `
            <div class="dividend-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); font-family: 'Outfit', sans-serif;">${item.ticker}</span>
                    <span style="font-size: 0.6rem; color: var(--text-muted);">${item.empresa || 'Provento'}</span>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: #f59e0b;">R$ ${item.valor}</span>
                    <span style="font-size: 0.55rem; color: var(--text-muted);">COM: ${item.data_com}</span>
                </div>
            </div>
        `).join('');
    }

    renderEmpty() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.7rem;">
                <p>Nenhuma Data-COM próxima encontrada hoje.</p>
            </div>
        `;
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    window.dividendService = new DividendService();
});
