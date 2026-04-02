/**
 * Editorial Service - Carrega o Editorial Hub (IA-Driven) no Simulador
 */

const EditorialService = {
    async loadFeed() {
        try {
            const response = await fetch('editorial_feed.json');
            if (!response.ok) throw new Error('Falha no carregamento do feed editorial.');
            const data = await response.json();
            this.renderFeed(data);
        } catch (error) {
            console.warn('[Trilha dos Juros] Editorial Hub aguardando geração local ou dados indisponíveis.', error);
        }
    },

    renderFeed(data) {
        if (!data) return;

        // Morning Call
        if (data.morning) {
            const mDate = document.getElementById('morning-date');
            const mTitle = document.getElementById('morning-title');
            const mBody = document.getElementById('morning-body');
            
            if (mDate) mDate.innerHTML = `<i class="ph ph-calendar"></i> ${data.morning.date}`;
            if (mTitle) mTitle.innerHTML = data.morning.title;
            if (mBody) mBody.innerHTML = data.morning.body;
        }

        // Resumo do Dia
        if (data.evening) {
            const eDate = document.getElementById('evening-date');
            const eTitle = document.getElementById('evening-title');
            const eBody = document.getElementById('evening-body');

            if (eDate) eDate.innerHTML = `<i class="ph ph-calendar"></i> ${data.evening.date}`;
            if (eTitle) eTitle.innerHTML = data.evening.title;
            if (eBody) eBody.innerHTML = data.evening.body;
        }

        // Pílula de Conhecimento Baseada em IA (Termo do Dia)
        if (data.daily_term) {
            const termTitle = document.getElementById('term-title');
            const termDef = document.getElementById('term-definition');
            const tipEl = document.getElementById('educational-tip');

            if (termTitle) termTitle.innerHTML = data.daily_term.term;
            if (termDef) termDef.innerHTML = data.daily_term.definition;
            
            // Dá um leve destaque extra (Brilho e borda) por ser gerado por IA
            if (tipEl) {
                tipEl.style.borderLeftColor = 'var(--neon-green)';
                const icon = tipEl.querySelector('.ph-lightbulb');
                if (icon) {
                    icon.style.color = 'var(--neon-green)';
                    icon.parentElement.style.background = 'rgba(16, 185, 129, 0.1)';
                }
                
                // Exibe a pílula mesmo que o JS não tenha randomizado
                tipEl.style.display = 'block';
            }
        }
    }
};

// Funções de Troca de Aba (Tabs) para o Editorial
window.switchCallTab = function(type) {
    const btnM = document.getElementById('btn-tab-morning');
    const btnE = document.getElementById('btn-tab-evening');
    const artM = document.getElementById('call-morning');
    const artE = document.getElementById('call-evening');

    if (type === 'morning') {
        btnM.classList.add('active');
        btnE.classList.remove('active');
        btnM.style.background = 'var(--brand-blue)';
        btnE.style.background = 'transparent';
        btnE.style.color = 'var(--text-muted)';
        btnM.style.color = 'white';
        artM.style.display = 'block';
        artE.style.display = 'none';
    } else {
        btnE.classList.add('active');
        btnM.classList.remove('active');
        btnE.style.background = 'var(--brand-blue)';
        btnM.style.background = 'transparent';
        btnM.style.color = 'var(--text-muted)';
        btnE.style.color = 'white';
        artE.style.display = 'block';
        artM.style.display = 'none';
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    EditorialService.loadFeed();
});
