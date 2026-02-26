/**
 * UI Controller - Liga a Matemática (Engine) ao HTML/CSS
 * Responsável também pela renderização do gráfico Chart.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Controle de Navegação (Pills)
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active style from all
            navBtns.forEach(b => b.classList.remove('active'));
            views.forEach(v => {
                v.classList.remove('active');
                v.style.display = 'none';
            });

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.dataset.target;
            const targetView = document.getElementById(targetId);

            targetView.style.display = 'block';
            setTimeout(() => {
                targetView.classList.add('active');
            }, 50); // slight delay for CSS animation
        });
    });

    // 2. Elementos da Calculadora
    const inputTypeRadios = document.querySelectorAll('input[name="invest-type"]');
    const inputRateTypeRadios = document.querySelectorAll('input[name="rate-type"]');

    // Sliders
    const sliderInitial = document.getElementById('initial-investment');
    const sliderMonthly = document.getElementById('monthly-investment');
    const sliderDuration = document.getElementById('duration-months');
    const sliderRatePos = document.getElementById('interest-rate-pos');
    const sliderRatePre = document.getElementById('interest-rate-pre');

    // Display Values (Spans curtos em cima do slider)
    const valInitial = document.getElementById('val-initial');
    const valMonthly = document.getElementById('val-monthly');
    const valDuration = document.getElementById('val-duration');
    const valRatePos = document.getElementById('val-rate-pos');
    const valRatePre = document.getElementById('val-rate-pre');

    // Divs condicionais para esconder taxa no caso da Poupança ou do Toggle
    const rentabilidadeTypeGroup = document.getElementById('rentabilidade-type-group');
    const rentabilidadePosGroup = document.getElementById('rentabilidade-pos-group');
    const rentabilidadePreGroup = document.getElementById('rentabilidade-pre-group');
    const cdiHelper = document.getElementById('cdi-helper');

    // KPI Resultados
    const resNetTotal = document.getElementById('res-net-total');
    const resTotalInvested = document.getElementById('res-total-invested');
    const resTotalInterest = document.getElementById('res-total-interest');
    const resTaxDiscount = document.getElementById('res-tax-discount');
    const resTaxLabel = document.getElementById('res-tax-label');

    // Setup do Gráfico
    let growthChartInstance = null;
    const ctx = document.getElementById('growthChart').getContext('2d');

    function initChart() {
        growthChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Meses
                datasets: [
                    {
                        label: 'Total Investido (Bolso)',
                        data: [],
                        borderColor: '#3b82f6', // brand blue
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Saldo Acumulado (Com Juros)',
                        data: [],
                        borderColor: '#10b981', // neon green
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 2,
                        fill: '-1', // Fill area between this and previous dataset
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Poupança (Comparativo)',
                        data: [],
                        borderColor: '#fbbf24', // amber neon
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        labels: { color: '#a1a1aa', font: { family: 'Inter' } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#a1a1aa' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#a1a1aa',
                            callback: function (value) { return 'R$ ' + (value / 1000) + 'k'; }
                        }
                    }
                }
            }
        });
    }

    // Função Principal de Atualização Visual
    function updateCalculator() {

        let type = 'cdb';
        inputTypeRadios.forEach(radio => {
            if (radio.checked) type = radio.value;
        });

        let rateType = 'pos';
        if (inputRateTypeRadios) {
            inputRateTypeRadios.forEach(radio => {
                if (radio.checked) rateType = radio.value;
            });
        }

        const initial = parseFloat(sliderInitial.value);
        const monthly = parseFloat(sliderMonthly.value);
        const duration = parseInt(sliderDuration.value);

        const ratePos = sliderRatePos ? parseFloat(sliderRatePos.value) : 100;
        const ratePre = sliderRatePre ? parseFloat(sliderRatePre.value) : 12;

        // Atualizar textos dos Sliders
        valInitial.textContent = `R$ ${initial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valMonthly.textContent = `R$ ${monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valDuration.textContent = `${duration} meses`;
        if (valRatePos) valRatePos.textContent = `${ratePos}%`;
        if (valRatePre) valRatePre.textContent = `${ratePre.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

        // Elemento Informativo da Poupança
        const poupancaInfo = document.getElementById('poupanca-info');
        const poupancaRuleText = document.getElementById('poupanca-rule-text');

        // Lógica Visual Condicional
        if (type === 'poupanca') {
            if (rentabilidadeTypeGroup) rentabilidadeTypeGroup.style.display = 'none';
            if (rentabilidadePosGroup) rentabilidadePosGroup.style.display = 'none';
            if (rentabilidadePreGroup) rentabilidadePreGroup.style.display = 'none';

            // Mostra o card da poupança
            if (poupancaInfo) poupancaInfo.style.display = 'block';

            // Define o texto baseado na Selic atual
            const taxasReais = FinMath.getRates();
            if (poupancaRuleText && taxasReais.selic > 8.5) {
                poupancaRuleText.innerHTML = `Como a Selic atual (${taxasReais.selic}%) está acima de 8,5% ao ano, a regra em vigor garante rendimento fixo de <strong>0,5% ao mês + Taxa Referencial (TR)</strong>. (Aprox. 6.17% a.a.)`;
            } else if (poupancaRuleText) {
                poupancaRuleText.innerHTML = `Como a Selic atual (${taxasReais.selic}%) está igual ou abaixo de 8,5% ao ano, a regra indica que a poupança rende <strong>70% da Selic + Taxa Referencial (TR)</strong>.`;
            }

        } else {
            if (rentabilidadeTypeGroup) rentabilidadeTypeGroup.style.display = 'block';

            if (rateType === 'pos') {
                if (rentabilidadePosGroup) rentabilidadePosGroup.style.display = 'block';
                if (rentabilidadePreGroup) rentabilidadePreGroup.style.display = 'none';
            } else {
                if (rentabilidadePosGroup) rentabilidadePosGroup.style.display = 'none';
                if (rentabilidadePreGroup) rentabilidadePreGroup.style.display = 'block';
            }

            // Esconde o card da poupança
            if (poupancaInfo) poupancaInfo.style.display = 'none';

            // Puxa as taxas recém-atualizadas da Engine Financeira
            const taxasReais = FinMath.getRates();
            if (cdiHelper) cdiHelper.textContent = `Considerando Taxa Selic ${taxasReais.selic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}% / CDI ${taxasReais.cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}% a.a.`;
        }

        // Chamar a Engine Matemática
        const activeRate = rateType === 'pos' ? ratePos : ratePre;
        const result = FinMath.simulate(type, initial, monthly, duration, activeRate, rateType);
        const dados = result.dadosGerais;

        // Atualizar KPIs
        resNetTotal.textContent = `R$ ${dados.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resTotalInvested.textContent = `R$ ${dados.totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resTotalInterest.textContent = `+ R$ ${dados.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (dados.isentoIR) {
            resTaxLabel.textContent = "Imposto de Renda (Isento)";
            resTaxDiscount.textContent = "R$ 0,00";
            resTaxDiscount.style.color = "#a1a1aa"; // Gray
        } else {
            resTaxLabel.textContent = "Imposto de Renda Retido";
            resTaxDiscount.textContent = `- R$ ${dados.impostoRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resTaxDiscount.style.color = "var(--hazard-red)";
        }

        // Atualizar Chart.js
        if (growthChartInstance) {
            // Obter dataset do investimento principal
            const labelsHtml = result.historicoMensal.map(h => `Mês ${h.mes}`);
            const dataInvestido = result.historicoMensal.map(h => h.investido);
            const dataAcumulado = result.historicoMensal.map(h => h.saldo);

            // Obter dataset da Poupança como comparador fantasma (sempre calculado pra Chart independente da View)
            const poupancaRef = FinMath.simulate('poupanca', initial, monthly, duration, 100, 'pos');
            const dataPoupanca = poupancaRef.historicoMensal.map(h => h.saldo);

            growthChartInstance.data.labels = labelsHtml;
            growthChartInstance.data.datasets[0].data = dataInvestido;
            growthChartInstance.data.datasets[1].data = dataAcumulado;
            growthChartInstance.data.datasets[2].data = dataPoupanca;

            // Se o ativo principal JÁ FOR a poupanca, escondemos a linha fantasma pra não duplicar/sobrescrever visuals
            if (type === 'poupanca') {
                growthChartInstance.data.datasets[2].hidden = true;
            } else {
                growthChartInstance.data.datasets[2].hidden = false;
            }

            growthChartInstance.update();
        }
    }

    // Bind de Eventos
    [sliderInitial, sliderMonthly, sliderDuration, sliderRatePos, sliderRatePre].forEach(slider => {
        if (slider) slider.addEventListener('input', updateCalculator); // Update as dragging for real-time feel
    });

    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateCalculator);
    });

    if (inputRateTypeRadios) {
        inputRateTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateCalculator);
        });
    }

    // Evento Customizado vindo da API do BCB
    document.addEventListener('ratesLoaded', (e) => {
        console.log("UI Controller recebeu taxas reais da API! Repintando tela...");
        updateCalculator();
    });

    // Boot Inicial Fallback
    initChart();
    updateCalculator();
});
