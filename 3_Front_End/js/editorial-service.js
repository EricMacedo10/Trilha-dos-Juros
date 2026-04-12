/**
 * Editorial Service - Carrega o Editorial Hub (IA-Driven) no Simulador
 */

const EditorialService = {
    async loadFeed() {
        try {
            // 1. Carrega o Editorial Hub (Morning Call, Coffee Break, etc)
            const editorialResponse = await fetch('editorial_feed.json?v=' + new Date().getTime());
            if (editorialResponse.ok) {
                const editorialData = await editorialResponse.json();
                this.renderFeed(editorialData);
            }

            // 2. Carrega o Radar de Eventos em Tempo Real (Independente)
            const radarResponse = await fetch('radar_data.json?v=' + new Date().getTime());
            if (radarResponse.ok) {
                const radarData = await radarResponse.json();
                this.renderCalendar(radarData);
            }

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

        // Coffee Break (Midday)
        if (data.coffee) {
            const cDate = document.getElementById('coffee-date');
            const cTitle = document.getElementById('coffee-title');
            const cBody = document.getElementById('coffee-body');

            if (cDate) cDate.innerHTML = `<i class="ph ph-calendar"></i> ${data.coffee.date}`;
            if (cTitle) cTitle.innerHTML = data.coffee.title;
            if (cBody) cBody.innerHTML = data.coffee.body;
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
    },

    renderCalendar(data) {
        if (!data || !data.events) return;

        const listContainer = document.getElementById('calendar-events-list');
        if (!listContainer) return;

        let html = `
            <div class="calendar-header-table">
                <span class="col-time">HORA</span>
                <span class="col-event">EVENTO</span>
                <span class="col-val">ATUAL</span>
                <span class="col-val">PROJ.</span>
                <span class="col-val">ANT.</span>
            </div>
        `;

        data.events.forEach(item => {
            const impactClass = `impact-${item.impact.toLowerCase()}`;
            const atual = item.atual || '---';
            const proj = item.proj || '---';
            const prev = item.prev || '---';
            const time = item.time || '--:--';
            const country = item.country ? item.country.toUpperCase() : '--';
            
            html += `
                <div class="event-row ${impactClass}">
                    <span class="col-time">
                        <span style="display:flex; align-items:center; gap:4px;">
                            ${time} 
                            <span class="country-tag">${country}</span>
                        </span>
                        <small>${item.date}</small>
                    </span>
                    <span class="col-event">${item.event}</span>
                    <span class="col-val val-atual">${atual}</span>
                    <span class="col-val val-muted">${proj}</span>
                    <span class="col-val val-muted-more">${prev}</span>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    }
};

// Funções de Troca de Aba (Tabs) para o Editorial
// Funções de Troca de Aba (Tabs) para o Editorial
window.switchCallTab = function(type) {
    const btnM = document.getElementById('btn-tab-morning');
    const btnC = document.getElementById('btn-tab-coffee');
    const btnE = document.getElementById('btn-tab-evening');
    const artM = document.getElementById('call-morning');
    const artC = document.getElementById('call-coffee');
    const artE = document.getElementById('call-evening');

    const btns = [btnM, btnC, btnE];
    const arts = [artM, artC, artE];

    // Reset All
    btns.forEach(b => {
        if(b) {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = 'var(--text-muted)';
        }
    });
    arts.forEach(a => { if(a) a.style.display = 'none'; });

    // Activate Current
    if (type === 'morning') {
        btnM.classList.add('active');
        btnM.style.background = 'var(--brand-blue)';
        btnM.style.color = 'white';
        artM.style.display = 'block';
    } else if (type === 'coffee') {
        btnC.classList.add('active');
        btnC.style.background = 'var(--brand-blue)';
        btnC.style.color = 'white';
        artC.style.display = 'block';
    } else {
        btnE.classList.add('active');
        btnE.style.background = 'var(--brand-blue)';
        btnE.style.color = 'white';
        artE.style.display = 'block';
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    EditorialService.loadFeed();
});
