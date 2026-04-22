/**
 * TreasuryService - Gestão e Simulação de Títulos Públicos (Tesouro Direto)
 * Trilha dos Juros - Módulo de Inteligência de Renda Fixa Governamental
 */

const TreasuryService = (function () {
    const API_URL = '/api/tesouro';
    let treasuryChartInstance = null;
    let currentBondsData = null;
    let currentFilter = 'all';
    let searchQuery = '';

    // Elementos da UI
    const sliders = {
        initial: 'treasury-initial-investment',
        monthly: 'treasury-monthly-investment',
        duration: 'treasury-duration-months'
    };

    const displays = {
        initial: 'val-treasury-initial',
        monthly: 'val-treasury-monthly',
        duration: 'val-treasury-duration'
    };

    const kpis = {
        netTotal: 'treasury-res-net-total',
        invested: 'treasury-res-total-invested',
        interest: 'treasury-res-total-interest',
        tax: 'treasury-res-tax-discount'
    };

    let lastKpiValues = { invested: 0, net: 0, interest: 0, tax: 0 };
    
    // Títulos selecionados para comparação (Inicia com defaults)
    let selectedBonds = {
        selic: null,
        ipca: null,
        pre: null
    };

    async function fetchBonds() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            console.log('[Treasury] Buscando títulos oficiais...');
            const response = await fetch(API_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Falha ao conectar com o servidor do Tesouro');
            
            const data = await response.json();
            return processBonds(data);
        } catch (error) {
            console.warn('[Treasury] Usando mock de segurança:', error);
            updateStatusBadge('Dados Offline');
            return getMockBonds();
        }
    }

    function updateStatusBadge(text) {
        const textElement = document.getElementById('status-text');
        const iconElement = document.getElementById('status-icon');
        
        if (textElement) {
            textElement.innerText = text;
        }
        if (iconElement) {
            iconElement.style.color = text.includes('Offline') ? '#ef4444' : '#10b981';
        }
    }

    function processBonds(apiResponse) {
        const bonds = apiResponse.response.TrsuryBondSery.TrsuryBond;
        const status = apiResponse.response.TrsuryBondSery.TrsuryBondMktSts.nm;
        updateStatusBadge(status);
        
        return {
            selic: bonds.filter(b => b.TrsuryBondTyp.nm.toLowerCase().includes('selic')),
            ipca: bonds.filter(b => b.TrsuryBondTyp.nm.toLowerCase().includes('ipca')),
            pre: bonds.filter(b => b.TrsuryBondTyp.nm.toLowerCase().includes('prefixado')),
            status: status
        };
    }

    function getMockBonds() {
        return {
            selic: [
                { TrsuryBondTyp: { nm: 'Tesouro Selic 2027' }, annlRenmRate: 0.15, minInvestAmt: 154.20, ltapnmDate: '2027-03-01', invstmtVal: 15420.00 },
                { TrsuryBondTyp: { nm: 'Tesouro Selic 2029' }, annlRenmRate: 0.17, minInvestAmt: 153.80, ltapnmDate: '2029-03-01', invstmtVal: 15380.00 }
            ],
            ipca: [
                { TrsuryBondTyp: { nm: 'Tesouro IPCA+ 2029' }, annlRenmRate: 6.25, minInvestAmt: 35.40, ltapnmDate: '2029-05-15', invstmtVal: 3540.00 },
                { TrsuryBondTyp: { nm: 'Tesouro IPCA+ 2035' }, annlRenmRate: 6.40, minInvestAmt: 42.10, ltapnmDate: '2035-05-15', invstmtVal: 4210.00 }
            ],
            pre: [
                { TrsuryBondTyp: { nm: 'Tesouro Prefixado 2027' }, annlRenmRate: 11.80, minInvestAmt: 38.50, ltapnmDate: '2027-01-01', invstmtVal: 3850.00 },
                { TrsuryBondTyp: { nm: 'Tesouro Prefixado 2031' }, annlRenmRate: 12.15, minInvestAmt: 45.90, ltapnmDate: '2031-01-01', invstmtVal: 4590.00 }
            ],
            status: 'Dados Offline'
        };
    }

    function initChart() {
        const ctx = document.getElementById('treasuryGrowthChart');
        if (!ctx) return;

        if (treasuryChartInstance) treasuryChartInstance.destroy();

        treasuryChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Tesouro Selic', data: [], borderColor: '#10b981', backgroundColor: 'transparent', borderWidth: 2, tension: 0.1, pointRadius: 0 },
                    { label: 'Tesouro IPCA+', data: [], borderColor: '#3b82f6', backgroundColor: 'transparent', borderWidth: 2, tension: 0.1, pointRadius: 0 },
                    { label: 'Tesouro Prefixado', data: [], borderColor: '#f59e0b', backgroundColor: 'transparent', borderWidth: 2, tension: 0.1, pointRadius: 0 },
                    { label: 'Poupança', data: [], borderColor: '#a1a1aa', borderDash: [5, 5], backgroundColor: 'transparent', borderWidth: 2, tension: 0.1, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#a1a1aa', font: { size: 10 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#666', maxTicksLimit: 6 } },
                    y: { 
                        grid: { color: 'rgba(255,255,255,0.05)' }, 
                        ticks: { 
                            color: '#666', 
                            callback: function(value) {
                                if (value >= 1000) return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                                return 'R$ ' + Math.floor(value);
                            }
                        } 
                    }
                }
            }
        });
    }

    function updateSimulation() {
        if (!currentBondsData) return;

        const initial = parseFloat(document.getElementById(sliders.initial).value);
        const monthly = parseFloat(document.getElementById(sliders.monthly).value);
        const months = parseInt(document.getElementById(sliders.duration).value);

        // Atualiza Displays
        document.getElementById(displays.initial).innerText = initial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById(displays.monthly).innerText = monthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById(displays.duration).innerText = `${months} meses`;

        const rates = FinMath.getRates();
        
        // Pegamos os títulos selecionados ou os primeiros da lista como default
        const selicBond = selectedBonds.selic || currentBondsData.selic[0];
        const ipcaBond = selectedBonds.ipca || currentBondsData.ipca[0];
        const preBond = selectedBonds.pre || currentBondsData.pre[0];

        // Se não houver dados, aborta
        if (!selicBond || !ipcaBond || !preBond) return;

        const results = {
            selic: simulateTreasury(initial, monthly, months, (rates.selic + selicBond.annlRenmRate), 'selic'),
            ipca: simulateTreasury(initial, monthly, months, ((1 + (rates.ipca/100)) * (1 + (ipcaBond.annlRenmRate/100)) - 1) * 100, 'ipca'),
            pre: simulateTreasury(initial, monthly, months, preBond.annlRenmRate, 'pre'),
            poupanca: FinMath.simulate('poupanca', initial, monthly, months, 100, 'pos')
        };

        // Identifica o Vencedor (Melhor Rendimento Líquido)
        const candidates = [
            { id: 'selic', name: selicBond.TrsuryBondTyp.nm, res: results.selic },
            { id: 'ipca', name: ipcaBond.TrsuryBondTyp.nm, res: results.ipca },
            { id: 'pre', name: preBond.TrsuryBondTyp.nm, res: results.pre }
        ];
        
        const winner = candidates.reduce((prev, current) => 
            (prev.res.valorLiquido > current.res.valorLiquido) ? prev : current
        );

        // Atualiza a Label do Vencedor
        const winnerLabel = document.getElementById('treasury-winner-name');
        if (winnerLabel) winnerLabel.innerText = winner.name;

        // Atualiza KPIs baseado no Vencedor
        const mainRes = winner.res;
        animateValue(document.getElementById(kpis.netTotal), lastKpiValues.net, mainRes.valorLiquido);
        animateValue(document.getElementById(kpis.invested), lastKpiValues.invested, mainRes.totalInvestido);
        animateValue(document.getElementById(kpis.interest), lastKpiValues.interest, (mainRes.valorLiquido - mainRes.totalInvestido));
        animateValue(document.getElementById(kpis.tax), lastKpiValues.tax, mainRes.impostoTotal, true);

        lastKpiValues = {
            invested: mainRes.totalInvestido,
            net: mainRes.valorLiquido,
            interest: mainRes.valorLiquido - mainRes.totalInvestido,
            tax: mainRes.impostoTotal
        };

        if (treasuryChartInstance) {
            treasuryChartInstance.data.labels = results.selic.historicoMensal.map(h => `Mês ${h.mes}`);
            treasuryChartInstance.data.datasets[0].data = results.selic.historicoMensal.map(h => h.saldo);
            treasuryChartInstance.data.datasets[1].data = results.ipca.historicoMensal.map(h => h.saldo);
            treasuryChartInstance.data.datasets[2].data = results.pre.historicoMensal.map(h => h.saldo);
            treasuryChartInstance.data.datasets[3].data = results.poupanca.historicoMensal.map(h => h.saldo);
            treasuryChartInstance.update();
        }
    }

    function simulateTreasury(initial, monthly, months, annualRate, type) {
        const monthlyRate = FinMath.toMonthlyRate(annualRate);
        const feeB3Annual = 0.0020; 
        const monthlyFeeB3 = Math.pow(1 + feeB3Annual, 1/12) - 1;
        
        let saldo = initial;
        let investido = initial;
        const history = [];

        for (let i = 1; i <= months; i++) {
            let rendimento = saldo * monthlyRate;
            saldo += rendimento;
            let fee = (type === 'selic' && saldo <= 10000) ? 0 : saldo * monthlyFeeB3;
            saldo -= fee;
            saldo += monthly;
            investido += monthly;
            history.push({ mes: i, saldo: saldo });
        }

        const profit = saldo - investido;
        const days = months * 30;
        let irRate = days <= 180 ? 0.225 : (days <= 360 ? 0.20 : (days <= 720 ? 0.175 : 0.15));
        const netSaldo = profit > 0 ? saldo - (profit * irRate) : saldo;

        return { 
            historicoMensal: history, 
            valorLiquido: netSaldo, 
            totalInvestido: investido,
            impostoTotal: profit > 0 ? (profit * irRate) : 0 
        };
    }

    function animateValue(element, start, end, isTax = false) {
        if (!element) return;
        const duration = 400;
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = start + (end - start) * progress;
            element.innerText = (isTax ? '- ' : '') + current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    function renderExplorer() {
        if (!currentBondsData) return;
        const body = document.getElementById('treasury-market-body');
        if (!body) return;

        // Consolida todos os títulos
        let allBonds = [
            ...currentBondsData.selic.map(b => ({ ...b, type: 'selic' })),
            ...currentBondsData.ipca.map(b => ({ ...b, type: 'ipca' })),
            ...currentBondsData.pre.map(b => ({ ...b, type: 'pre' }))
        ];

        // Filtra por Categoria
        if (currentFilter !== 'all') {
            allBonds = allBonds.filter(b => b.type === currentFilter);
        }

        // Filtra por Busca
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allBonds = allBonds.filter(b => 
                b.TrsuryBondTyp.nm.toLowerCase().includes(query) ||
                new Date(b.ltapnmDate).getFullYear().toString().includes(query)
            );
        }

        body.innerHTML = ''; // Limpa antes de renderizar

        if (!allBonds || allBonds.length === 0) {
            body.innerHTML = '<tr><td colspan="6" style="padding: 2rem; opacity: 0.6;">Nenhum título disponível no momento.</td></tr>';
            return;
        }

        const html = allBonds.map(b => {
            if (!b || !b.TrsuryBondTyp) return ''; // Pula se o dado for inválido

            const isSelected = selectedBonds[b.type] && selectedBonds[b.type].TrsuryBondTyp.nm === b.TrsuryBondTyp.nm;
            const maturityDate = b.ltapnmDate ? new Date(b.ltapnmDate) : null;
            const maturity = (maturityDate && !isNaN(maturityDate)) ? maturityDate.toLocaleDateString('pt-BR') : 'N/D';
            
            const rate = b.annlRenmRate || 0;
            const rateDisplay = b.type === 'pre' ? rate.toFixed(2) + '%' : 
                               (b.type === 'selic' ? 'Selic + ' + rate.toFixed(2) + '%' : 'IPCA + ' + rate.toFixed(2) + '%');

            const price = b.invstmtVal || 0;
            const minInv = b.minInvestAmt || 0;

            return `
                <tr class="${isSelected ? 'selected-row' : ''}">
                    <td style="text-align: left; font-weight: 600;">${b.TrsuryBondTyp.nm}</td>
                    <td>${maturity}</td>
                    <td class="neon-text">${rateDisplay}</td>
                    <td>R$ ${(b.invstmtVal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${(b.minInvestAmt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                        <button class="btn-table-action" onclick="TreasuryService.selectBond('${b.TrsuryBondTyp.nm}', '${b.type}')">
                            ${isSelected ? '<i class="ph-fill ph-check-circle"></i>' : '<i class="ph ph-plus-circle"></i>'} 
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        body.innerHTML = html;
    }
    }

    function selectBond(bondName, type) {
        const bond = currentBondsData[type].find(b => b.TrsuryBondTyp.nm === bondName);
        if (bond) {
            selectedBonds[type] = bond;
            renderExplorer();
            updateSimulation();
            window.scrollTo({ top: document.querySelector('.treasury-panel').offsetTop, behavior: 'smooth' });
        }
    }

    return {
        init: async () => {
            initChart();
            currentBondsData = await fetchBonds();
            
            // Set Initial Defaults if empty
            if (!selectedBonds.selic) selectedBonds.selic = currentBondsData.selic[0];
            if (!selectedBonds.ipca) selectedBonds.ipca = currentBondsData.ipca[0];
            if (!selectedBonds.pre) selectedBonds.pre = currentBondsData.pre[0];

            renderExplorer();
            
            // Bind Sliders
            Object.values(sliders).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', updateSimulation);
            });

            // Bind Search
            const searchInput = document.getElementById('treasury-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchQuery = e.target.value;
                    renderExplorer();
                });
            }

            // Bind Chips
            const chips = document.querySelectorAll('#treasury-filter-chips .chip');
            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    chips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    currentFilter = chip.dataset.filter;
                    renderExplorer();
                });
            });

            updateSimulation();
        },
        selectBond
    };
})();
