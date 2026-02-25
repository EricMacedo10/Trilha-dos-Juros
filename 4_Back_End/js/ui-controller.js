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

    // Sliders
    const sliderInitial = document.getElementById('initial-investment');
    const sliderMonthly = document.getElementById('monthly-investment');
    const sliderDuration = document.getElementById('duration-months');
    const sliderRate = document.getElementById('interest-rate');

    // Display Values (Spans curtos em cima do slider)
    const valInitial = document.getElementById('val-initial');
    const valMonthly = document.getElementById('val-monthly');
    const valDuration = document.getElementById('val-duration');
    const valRate = document.getElementById('val-rate');

    // Divs condicionais para esconder taxa no caso da Poupança
    const rateHeaderContainer = document.getElementById('rate-header-container');
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

        const initial = parseFloat(sliderInitial.value);
        const monthly = parseFloat(sliderMonthly.value);
        const duration = parseInt(sliderDuration.value);
        const rate = parseFloat(sliderRate.value);

        // Atualizar textos dos Sliders
        valInitial.textContent = `R$ ${initial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valMonthly.textContent = `R$ ${monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valDuration.textContent = `${duration} meses`;
        valRate.textContent = `${rate}%`;

        // Lógica Visual Condicional
        if (type === 'poupanca') {
            sliderRate.style.display = 'none';
            rateHeaderContainer.style.display = 'none';
            cdiHelper.style.display = 'none';
        } else {
            sliderRate.style.display = 'block';
            rateHeaderContainer.style.display = 'flex';
            cdiHelper.style.display = 'block';
        }

        // Chamar a Engine Matemática
        const result = FinMath.simulate(type, initial, monthly, duration, rate);
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
            const labelsHtml = result.historicoMensal.map(h => `Mês ${h.mes}`);
            const dataInvestido = result.historicoMensal.map(h => h.investido);
            const dataAcumulado = result.historicoMensal.map(h => h.saldo);

            growthChartInstance.data.labels = labelsHtml;
            growthChartInstance.data.datasets[0].data = dataInvestido;
            growthChartInstance.data.datasets[1].data = dataAcumulado;
            growthChartInstance.update();
        }
    }

    // Bind de Eventos
    [sliderInitial, sliderMonthly, sliderDuration, sliderRate].forEach(slider => {
        slider.addEventListener('input', updateCalculator); // Update as dragging for real-time feel
    });

    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateCalculator);
    });

    // Boot
    initChart();
    updateCalculator();
});
