/**
 * Máquina de Gamificação - Jornada dos Depósitos
 * Gera engajamento e salva estado localmente.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Referências do DOM - UI
    const gridContainer = document.getElementById('envelope-grid');
    const saldoTxt = document.getElementById('chal-saved');
    const jurosTxt = document.getElementById('chal-interest');
    const progressFill = document.getElementById('challenge-progress-fill');
    const progressStatus = document.getElementById('challenge-status-text');
    const btnReset = document.getElementById('btn-reset-challenge');
    const btnNewJourney = document.getElementById('btn-new-journey');
    const actionsPanel = document.getElementById('gamification-actions');

    // Referências do DOM - Setup
    const setupPanel = document.getElementById('journey-setup-panel');
    const progressBox = document.getElementById('journey-progress-box');
    const inputMeta = document.getElementById('chal-val-meta');
    const inputSteps = document.getElementById('chal-val-steps');
    const btnStart = document.getElementById('btn-start-journey');
    const displayMeta = document.getElementById('chal-display-meta');

    const CHAVE_STORAGE = '@trilha_juros_jornada_v2';

    // Estado da Aplicação
    let state = carregarEstado();

    function carregarEstado() {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        if (salvo) {
            try {
                return JSON.parse(salvo);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    function salvarEstado() {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(state));
        atualizarMetricas();
    }

    // Inicialização da Grid
    function renderGrid() {
        gridContainer.innerHTML = '';

        if (!state) {
            gridContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 2rem;">Configure sua jornada acima para gerar as etapas de depósito.</p>';
            return;
        }

        // Recuperar config
        const N = state.etapas;
        const M = state.metaFinal;

        // Progressão Aritmética
        // Soma S = N * (N + 1) / 2
        // Base U = M / S
        const S = (N * (N + 1)) / 2;
        const U = M / S;

        let somaReal = 0;
        let valorEnvelope = [];

        for (let i = 1; i <= N; i++) {
            let val = i * U;
            if (i === N) {
                // Ajuste no último para garantir a soma exata (correção de centavos)
                val = M - somaReal;
            } else {
                val = Math.round(val * 100) / 100; // Arredondar para moedas (2 casas decimais)
            }
            somaReal += val;
            valorEnvelope.push(val);
        }

        for (let i = 0; i < N; i++) {
            const indexEnvelope = i;
            const val = valorEnvelope[i];

            const el = document.createElement('div');
            el.classList.add('envelope');

            // Formatando valor para o grid de forma amigável
            el.innerHTML = `<small>Depósito ${i + 1}</small><span>R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.gap = '0.2rem';
            el.style.fontSize = '0.9rem';
            el.style.padding = '0.5rem';

            if (state.envelopesCompletos.includes(indexEnvelope)) {
                el.classList.add('completed');
            }

            el.addEventListener('click', () => {
                toggleEnvelope(indexEnvelope, el, val);
            });

            gridContainer.appendChild(el);
        }

        // Esconder setup, mostrar caixa de progresso e barra de botões
        setupPanel.style.display = 'none';
        progressBox.style.display = 'flex';
        if (actionsPanel) actionsPanel.style.display = 'flex';
        displayMeta.textContent = M.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function toggleEnvelope(index, elemento, valorGanhado) {
        if (!state) return;
        const position = state.envelopesCompletos.indexOf(index);

        if (position > -1) {
            // Remover
            state.envelopesCompletos.splice(position, 1);
            state.caixa -= valorGanhado;
            elemento.classList.remove('completed');
        } else {
            // Adicionar
            state.envelopesCompletos.push(index);
            state.caixa += valorGanhado;
            elemento.classList.add('completed');
        }

        salvarEstado();
    }

    // Matemática de Atualização
    function calcularGanhosEstimados(valorCaixa) {
        // Base de CDI atual da UI (aproximadamente usando uma taxa de 0.8% a.m estimativa educacional global)
        return valorCaixa * 0.0084;
    }

    function atualizarMetricas() {
        if (!state) {
            saldoTxt.textContent = "R$ 0,00";
            jurosTxt.textContent = "+ R$ 0,00";
            progressFill.style.width = "0%";
            progressStatus.textContent = "0 / 0 depósitos completados";
            return;
        }

        const pctProgresso = (state.envelopesCompletos.length / state.etapas) * 100;

        // Atualizar Barra
        progressFill.style.width = `${pctProgresso}%`;
        progressStatus.textContent = `${state.envelopesCompletos.length} / ${state.etapas} depósitos completados`;

        // Textos Financeiros
        saldoTxt.textContent = `R$ ${state.caixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const rendimentoMes = calcularGanhosEstimados(state.caixa);
        jurosTxt.textContent = `+ R$ ${rendimentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    btnStart.addEventListener('click', () => {
        const meta = parseFloat(inputMeta.value);
        const etapas = parseInt(inputSteps.value);

        if (isNaN(meta) || isNaN(etapas) || meta < 1 || etapas < 1) {
            alert("Por favor, preencha valores válidos para Meta e Etapas.");
            return;
        }

        state = {
            metaFinal: meta,
            etapas: etapas,
            caixa: 0,
            envelopesCompletos: []
        };

        salvarEstado();
        renderGrid();
    });

    btnReset.addEventListener('click', () => {
        if (!state) return;
        // Removido confirm() pois o Chrome silencia popups em locahost/file local caso o usuário tenha marcado "Não exibir novamente".
        state.caixa = 0;
        state.envelopesCompletos = [];
        salvarEstado();
        renderGrid();
    });

    if (btnNewJourney) {
        btnNewJourney.addEventListener('click', () => {
            // Ação direta e robusta
            localStorage.removeItem(CHAVE_STORAGE);
            state = null;

            // Voltar painéis para o Setup
            setupPanel.style.display = 'flex';
            progressBox.style.display = 'none';
            if (actionsPanel) actionsPanel.style.display = 'none';

            // Usando window.location.reload() como garantia brutal de destruição de estado em cache no navegador do usuario
            window.location.reload(true);
        });
    }

    // Boot
    if (state) {
        setupPanel.style.display = 'none';
        progressBox.style.display = 'flex';
        if (actionsPanel) actionsPanel.style.display = 'flex';
        renderGrid();
        atualizarMetricas();
    } else {
        setupPanel.style.display = 'flex';
        progressBox.style.display = 'none';
        if (actionsPanel) actionsPanel.style.display = 'none';
        atualizarMetricas();
    }

});
