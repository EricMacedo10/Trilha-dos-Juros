/**
 * UI Controller - Liga a Matemática (Engine) ao HTML/CSS
 * Responsável também pela renderização do gráfico Chart.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Controle de Navegação (Pills)
    const navBtns = document.querySelectorAll('.nav-btn[data-target]');
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
            
            // Inicializa dados do Tesouro se for o target
            if (targetId === 'treasury-view' && typeof TreasuryService !== 'undefined') {
                TreasuryService.init();
            }

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
        if (growthChartInstance) {
            growthChartInstance.destroy();
        }
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
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1,
                        pointBackgroundColor: '#0f172a', // Hollow center matching background
                        pointBorderColor: '#3b82f6',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Saldo Acumulado (Com Juros)',
                        data: [],
                        borderColor: '#10b981', // neon green
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 3,
                        fill: '-1', // Fill area between this and previous dataset
                        tension: 0.1,
                        pointBackgroundColor: '#0f172a',
                        pointBorderColor: '#10b981',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        // Premium Glow Effect
                        shadowColor: 'rgba(16, 185, 129, 0.4)',
                        shadowBlur: 10
                    },
                    {
                        label: 'Poupança (Comparativo)',
                        data: [],
                        borderColor: '#fbbf24', // amber neon
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: '#0f172a',
                        pointBorderColor: '#fbbf24',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
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

                                // Se for o dataset de Saldo Acumulado, mostrar o lucro proporcional
                                if (context.datasetIndex === 1 && context.parsed.y !== null) {
                                    const index = context.dataIndex;
                                    const investido = context.chart.data.datasets[0].data[index];
                                    const lucro = context.parsed.y - investido;
                                    const pct = ((lucro / investido) * 100).toFixed(1);
                                    
                                    return [
                                        label,
                                        `Lucro: R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (+${pct}%)`
                                    ];
                                }

                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#a1a1aa',
                            maxTicksLimit: 12, // Evita sobreposição de dezenas de labels
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: false,
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

    /**
     * Animação Suave de Números (Counter)
     * @param {HTMLElement} obj Elemento DOM
     * @param {number} start Valor inicial
     * @param {number} end Valor final
     * @param {number} duration Duração em ms
     * @param {boolean} isCurrency Se deve formatar como R$
     */
    function animateValue(obj, start, end, duration, isCurrency = true) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = progress * (end - start) + start;
            
            if (isCurrency) {
                obj.innerHTML = currentVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            } else {
                obj.innerHTML = currentVal.toFixed(2).replace('.', ',');
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Armazenar últimos valores para animar a partir deles
    let lastResults = { total: 0, invested: 0, interest: 0, tax: 0 };

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

        // Atualizar KPIs com Animação
        animateValue(resNetTotal, lastResults.total, dados.valorLiquido, 400);
        animateValue(resTotalInvested, lastResults.invested, dados.totalInvestido, 400);
        animateValue(resTotalInterest, lastResults.interest, dados.lucroBruto, 400);

        // Feedback Visual de Pulso no Card Principal
        const mainCard = resNetTotal.closest('.kpi-card');
        if (mainCard) {
            mainCard.classList.remove('pulse-animation');
            void mainCard.offsetWidth; // Force reflow
            mainCard.classList.add('pulse-animation');
        }

        if (dados.isentoIR) {
            resTaxLabel.textContent = "Imposto de Renda (Isento)";
            resTaxDiscount.textContent = "R$ 0,00";
            resTaxDiscount.style.color = "#a1a1aa"; // Gray
        } else {
            resTaxLabel.textContent = "Imposto de Renda Retido";
            animateValue(resTaxDiscount, lastResults.tax, -dados.impostoRetido, 400);
            resTaxDiscount.style.color = "var(--hazard-red)";
        }

        // Atualiza estado para a próxima animação
        lastResults = {
            total: dados.valorLiquido,
            invested: dados.totalInvestido,
            interest: dados.lucroBruto,
            tax: -dados.impostoRetido
        };

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

            growthChartInstance.data.datasets[1].data = dataAcumulado;
            growthChartInstance.data.datasets[2].data = dataPoupanca;

            // Ajuste Dinâmico de Escala: "Abre" o gráfico focando nos dados
            const allPoints = [...dataInvestido, ...dataAcumulado, ...dataPoupanca];
            const minVal = Math.min(...allPoints);

            // Forçamos o gráfico a começar em 99% do valor mínimo real (Zero espaço morto)
            growthChartInstance.options.scales.y.min = Math.floor(minVal * 0.99);

            // Se o ativo principal JÁ FOR a poupanca, escondemos a linha fantasma pra não duplicar/sobrescrever visuals
            if (type === 'poupanca') {
                growthChartInstance.data.datasets[2].hidden = true;
            } else {
                growthChartInstance.data.datasets[2].hidden = false;
            }

            growthChartInstance.update();
        }

        // Chamar o carregamento de notícias (Apenas se estiver na view da calculadora)
        if (type !== 'poupanca' || true) { // Queremos notícias sempre agora
            loadNews();
        }
    }

    // Configura atualização periódica de notícias (a cada 10 minutos)
    setInterval(loadNews, 600000);

    async function loadNews() {
        const newsSection = document.getElementById('news-section');
        const newsGrid = document.getElementById('news-grid');

        if (!newsSection || !newsGrid) return;

        // Mostrar a seção (já que ela começa com display:none no HTML)
        newsSection.style.display = 'block';

        try {
            const news = await NewsService.fetchNews();
            renderNewsCards(news);
            updateNewsTimestamp();
        } catch (error) {
            console.warn('[Trilha dos Juros] Falha ao carregar notícias filtradas.', error);
            newsGrid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Não foi possível carregar as notícias agora. Tente novamente mais tarde.</p>';
        }
    }

    function updateNewsTimestamp() {
        const newsSection = document.getElementById('news-section');
        const header = newsSection.querySelector('h3').parentElement;
        let timeLabel = document.getElementById('news-sync-time');

        if (!timeLabel) {
            timeLabel = document.createElement('span');
            timeLabel.id = 'news-sync-time';
            timeLabel.className = 'helper-text';
            timeLabel.style.fontSize = '0.7rem';
            timeLabel.style.opacity = '0.7';

            // Substitui o span estático "Atualizado em tempo real" se existir
            const oldSpan = header.querySelector('.helper-text');
            if (oldSpan && oldSpan.textContent.includes('Atualizado')) {
                oldSpan.replaceWith(timeLabel);
            } else {
                header.appendChild(timeLabel);
            }
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        timeLabel.innerHTML = `<i class="ph ph-clock"></i> Atualizado às ${timeStr}`;
    }

    function renderNewsCards(newsArray) {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;

        if (newsArray.length === 0) {
            newsGrid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Nenhuma notícia relevante encontrada no momento.</p>';
            return;
        }

        let html = '';
        newsArray.slice(0, 4).forEach(item => { // Forçamos o limite de 4 cards na UI
            const timeStr = item.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

            // Usa as tags dinâmicas enviadas pelo NewsService ou fallback
            const tagClass = item.tagClass || (item.tag === 'rf' ? 'rf' : 'macro');
            const tagLabel = item.tagLabel || (item.tag === 'rf' ? 'Renda Fixa' : 'Macroeconomia');

            html += `
                <a href="${item.link}" target="_blank" rel="noopener" class="news-card">
                    <span class="news-card-tag ${tagClass}">${tagLabel}</span>
                    <h4 class="news-card-title">${item.title}</h4>
                    <div class="news-card-footer">
                        <span class="source"><i class="ph ph-newspaper"></i> ${item.source}</span>
                        <span class="date">${timeStr}</span>
                    </div>
                </a>
            `;
        });

        newsGrid.innerHTML = html;

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

    // ========================================================
    // Lógica do Modal de Contato (SGA Invest)
    // ========================================================
    const btnOpenContact = document.getElementById('btn-open-contact');
    const btnCloseContact = document.getElementById('btn-close-contact');
    const contactModal = document.getElementById('contact-modal');
    const btnCopyEmail = document.getElementById('btn-copy-email');
    const emailText = document.getElementById('sga-email-text').textContent;
    const copyFeedback = document.getElementById('copy-feedback');

    if (btnOpenContact && contactModal && btnCloseContact) {
        // Abrir Modal
        btnOpenContact.addEventListener('click', () => {
            contactModal.style.display = 'flex';
        });

        // Fechar Modal (via botão X)
        btnCloseContact.addEventListener('click', () => {
            contactModal.style.display = 'none';
        });

        // Fechar Modal (clicando fora)
        window.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                contactModal.style.display = 'none';
            }
        });

        // Copiar E-mail
        if (btnCopyEmail) {
            btnCopyEmail.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(emailText);
                    // Feedback Visual
                    copyFeedback.style.display = 'block';
                    btnCopyEmail.innerHTML = '<i class="ph-fill ph-check"></i>';
                    btnCopyEmail.style.color = 'var(--neon-green)';
                    btnCopyEmail.style.borderColor = 'var(--neon-green)';

                    setTimeout(() => {
                        copyFeedback.style.display = 'none';
                        btnCopyEmail.innerHTML = '<i class="ph ph-copy"></i>';
                        btnCopyEmail.style.color = '';
                        btnCopyEmail.style.borderColor = '';
                    }, 2000);
                } catch (err) {
                    console.error('Falha ao copiar:', err);
                }
            });
        }
    }

    // Boot Inicial Fallback
    initChart();
    updateCalculator();

    // ========================================================
    // Lógica do Accordion (FAQ / Guia Prático)
    // ========================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Fecha todos os itens
                faqItems.forEach(i => i.classList.remove('active'));
                
                // Abre o clicado se não estava ativo
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

});
