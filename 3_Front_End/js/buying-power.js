/**
 * Monitor Interativo de Poder de Compra (IPCA Histórico)
 * Trilha dos Juros - Módulo de Impacto Visual
 */

const BuyingPowerMonitor = (function () {
    let chartInstance = null;

    async function init() {
        const ctx = document.getElementById('buyingPowerChart');
        if (!ctx) return;

        console.log('[Trilha] Iniciando Monitor de Poder de Compra...');

        try {
            // Busca dados históricos do BCB (Série 433 - IPCA Mensal)
            const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/07/1994');
            if (!res.ok) throw new Error('Falha ao buscar dados do BCB');
            
            const data = await res.json();
            
            let accumulatedIndex = 1.0;
            const labels = [];
            const values = [];

            data.forEach((item, index) => {
                accumulatedIndex *= (1 + (parseFloat(item.valor) / 100));
                
                // Pegamos um ponto a cada 6 meses para não sobrecarregar o gráfico, mas mantemos o detalhe
                if (index % 6 === 0 || index === data.length - 1) {
                    const power = 100.0 / accumulatedIndex;
                    labels.push(item.data);
                    values.push(power.toFixed(2));
                }
            });

            renderChart(ctx, labels, values);
            updateSummary(values[values.length - 1]);

        } catch (error) {
            console.error('[Trilha] Erro no Monitor de Poder de Compra:', error);
            // Fallback se o BCB estiver offline ou CORS local
            const mockLabels = ['01/07/1994', '01/01/2000', '01/01/2010', '01/01/2020', '01/02/2026'];
            const mockValues = [100, 52.4, 27.8, 15.2, 11.46];
            renderChart(ctx, mockLabels, mockValues);
            updateSummary(11.46);
        }
    }

    function renderChart(ctx, labels, data) {
        if (chartInstance) chartInstance.destroy();

        const canvasCtx = ctx.getContext('2d');
        
        // Gradiente para a área preenchida (Area Fill)
        const areaGradient = canvasCtx.createLinearGradient(0, 0, 0, 400);
        areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        areaGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
        areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        // Gradiente para a linha (Border Stroke Gradient)
        const lineGradient = canvasCtx.createLinearGradient(0, 0, 800, 0);
        lineGradient.addColorStop(0, '#34d399');   // Início (1994) mais brilhante
        lineGradient.addColorStop(0.5, '#10b981'); // Meio
        lineGradient.addColorStop(1, '#059669');   // Final (Hoje) mais profundo

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Poder de Compra (R$)',
                    data: data,
                    borderColor: lineGradient,
                    borderWidth: 4,
                    pointRadius: 0,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#10b981',
                    pointHoverBorderWidth: 4,
                    fill: true,
                    backgroundColor: areaGradient,
                    tension: 0.4,
                    // Efeito de Profundidade Sênior: Sombra Neon no Traçado
                    segment: {
                        borderColor: (ctx) => lineGradient,
                    },
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                elements: {
                    line: {
                        // Aplica sombra através do contexto nativo do canvas para performance e estética
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowBlur: 15,
                        shadowColor: 'rgba(16, 185, 129, 0.5)',
                        shadowOffsetY: 4
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(9, 9, 11, 0.98)',
                        titleColor: '#a1a1aa',
                        titleFont: { family: 'Outfit', weight: '600' },
                        bodyColor: '#fff',
                        bodyFont: { family: 'Inter', size: 13 },
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 1,
                        padding: 15,
                        cornerRadius: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `R$ 100,00 valiam R$ ${parseFloat(context.raw).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, weight: '500' },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8,
                            padding: 10,
                            callback: function(val, index) {
                                const label = this.getLabelForValue(val);
                                // Mostra apenas o ano a cada intervalo para limpar o visual
                                return label ? label.split('/')[2] : '';
                            }
                        }
                    },
                    y: {
                        min: 0,
                        max: 115,
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, weight: '500' },
                            padding: 10,
                            callback: function(value) { return 'R$ ' + value; }
                        }
                    }
                }
            }
        });
    }

    function updateSummary(currentValue) {
        const loss = ((100 - currentValue)).toFixed(2);
        const el = document.getElementById('buying-power-loss-pct');
        if (el) el.innerText = `-${loss}%`;
        
        const valEl = document.getElementById('buying-power-current-val');
        if (valEl) valEl.innerText = `R$ ${parseFloat(currentValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }

    return { init };
})();

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para priorizar o carregamento principal
    setTimeout(BuyingPowerMonitor.init, 1500);
});
