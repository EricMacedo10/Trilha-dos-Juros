/**
 * Máquina de Gamificação - Desafio 102 (Envelopes)
 * Gera engajamento e salva estado localmente.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Referências do DOM
    const gridContainer = document.getElementById('envelope-grid');
    const saldoTxt = document.getElementById('chal-saved');
    const jurosTxt = document.getElementById('chal-interest');
    const progressFill = document.getElementById('challenge-progress-fill');
    const progressStatus = document.getElementById('challenge-status-text');
    const btnReset = document.getElementById('btn-reset-challenge');

    const TOTAL_ENVELOPES = 102;
    const CHAVE_STORAGE = '@trilha_juros_102';

    // Estado da Aplicação
    let envelopesCompletos = carregarEstado();

    function carregarEstado() {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        return salvo ? JSON.parse(salvo) : [];
    }

    function salvarEstado() {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(envelopesCompletos));
        atualizarMetricas();
    }

    // Inicialização da Grid
    function renderGrid() {
        gridContainer.innerHTML = '';

        for (let val = 1; val <= TOTAL_ENVELOPES; val++) {
            const el = document.createElement('div');
            el.classList.add('envelope');
            el.textContent = val;
            el.dataset.valor = val;

            if (envelopesCompletos.includes(val)) {
                el.classList.add('completed');
            }

            el.addEventListener('click', () => {
                toggleEnvelope(val, el);
            });

            gridContainer.appendChild(el);
        }
    }

    function toggleEnvelope(valor, elemento) {
        const index = envelopesCompletos.indexOf(valor);

        if (index > -1) {
            // Remover
            envelopesCompletos.splice(index, 1);
            elemento.classList.remove('completed');
        } else {
            // Adicionar
            envelopesCompletos.push(valor);
            elemento.classList.add('completed');
        }

        salvarEstado();
    }

    // Matemática de Atualização
    function calcularGanhosEstimados(valorCaixa) {
        // Base de CDI 10.65% a.a (Aproximadamente 0.84% a.m.)
        // Estima quanto esse valor já guardado estaria rendendo em apenas 1 mês
        return valorCaixa * 0.0084;
    }

    function atualizarMetricas() {
        const pctProgresso = (envelopesCompletos.length / TOTAL_ENVELOPES) * 100;

        let dinheiroCaixa = 0;
        envelopesCompletos.forEach(v => dinheiroCaixa += v);

        // Atualizar Barra
        progressFill.style.width = `${pctProgresso}%`;
        progressStatus.textContent = `${envelopesCompletos.length} / ${TOTAL_ENVELOPES} depósitos completados`;

        // Textos Financeiros
        saldoTxt.textContent = `R$ ${dinheiroCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const rendimentoMes = calcularGanhosEstimados(dinheiroCaixa);
        jurosTxt.textContent = `+ R$ ${rendimentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    btnReset.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja recomeçar a jornada e apagar o progresso atual?")) {
            envelopesCompletos = [];
            salvarEstado();
            renderGrid();
        }
    });

    // Boot
    renderGrid();
    atualizarMetricas();

});
