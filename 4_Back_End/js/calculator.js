/**
 * Motor Matemático - Trilha dos Juros (Renda Fixa Premium)
 * Preciso, baseado no sistema financeiro brasileiro.
 */

const FinMath = (function () {

    // Taxas Base Iniciais (Usadas como Fallback se a API falhar)
    let SELIC_ANUAL_DEFAULT = 11.25; // Taxa Selic Atualizada Padrão
    let CDI_ANUAL_DEFAULT = 11.15; // CDI Atualizado Padrão
    let POUPANCA_ANUAL = SELIC_ANUAL_DEFAULT > 8.5 ? 6.17 : (SELIC_ANUAL_DEFAULT * 0.7);

    /**
     * Busca a Taxa Selic Meta real da API Pública do Banco Central do Brasil (BCB)
     * SGS - Sistema Gerenciador de Séries Temporais (Código 432 = Selic Meta)
     */
    async function fetchRealRates() {
        try {
            // Tentativa primária: API HG Brasil (Requer CORS proxy ou backend futuro)
            // Tentativa secundária pública garantida: Banco Central SGS (JSON)
            const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const selicReal = parseFloat(data[0].valor);
                    SELIC_ANUAL_DEFAULT = selicReal;
                    // CDI geralmente é 0.10 a menos que a Selic Meta no Brasil
                    CDI_ANUAL_DEFAULT = selicReal - 0.10;
                    POUPANCA_ANUAL = selicReal > 8.5 ? 6.17 : (selicReal * 0.7);

                    console.log(`[Trilha dos Juros] Taxas autênticas carregadas do BCB. SELIC: ${selicReal}% | CDI: ${CDI_ANUAL_DEFAULT}%`);

                    // Dispara evento para o UI Controller saber que os novos valores reais chegaram e repintar a tela
                    document.dispatchEvent(new CustomEvent('ratesLoaded', { detail: { selic: SELIC_ANUAL_DEFAULT, cdi: CDI_ANUAL_DEFAULT } }));
                }
            }
        } catch (error) {
            console.warn('[Trilha dos Juros] Fallback de segurança: Usando taxas CDI/Selic offline pré-fixadas devido a bloqueio de rede.', error);
        }
    }

    // Inicia a busca asíncrona log ao carregar
    fetchRealRates();

    /**
     * Tabela Regressiva Tradicional de IR
     * @param {number} dias Corridos no investimento
     * @returns {number} Alíquota a descontar sobre o lucro (ex: 0.225 para 22,5%)
     */
    function getTaxRate(dias) {
        if (dias <= 180) return 0.225;
        if (dias <= 360) return 0.200;
        if (dias <= 720) return 0.175;
        return 0.150;
    }

    /**
     * Converte Taxa Anual para Mensal de forma Exata (Juros Compostos)
     * @param {number} rateAnual Taxa em porcentagem (ex: 10.65)
     * @returns {number} Fator Mensal (ex: 0.0084 para 0.84% a.m.)
     */
    function toMonthlyRate(rateAnual) {
        return Math.pow(1 + (rateAnual / 100), 1 / 12) - 1;
    }

    /**
     * Simula a evolução do capital no tempo
     * @param {string} tipo (cdb, lci, poupanca)
     * @param {number} valorInicial 
     * @param {number} aporteMensal 
     * @param {number} meses 
     * @param {number} rentabilidadeValor (Ex: 110 para 110% do CDI, ou 12.0 para % a.a.)
     * @param {string} tipoRentabilidade ('pos' ou 'pre')
     * @returns {Object} Dados completos da simulação incluindo histórico
     */
    function simulate(tipo, valorInicial, aporteMensal, meses, rentabilidadeValor = 100, tipoRentabilidade = 'pos') {

        let taxaAnual = 0;
        let isentoIR = false;

        if (tipo === 'poupanca') {
            taxaAnual = POUPANCA_ANUAL;
            isentoIR = true;
        } else if (tipo === 'lci') {
            taxaAnual = tipoRentabilidade === 'pos' ? CDI_ANUAL_DEFAULT * (rentabilidadeValor / 100) : rentabilidadeValor;
            isentoIR = true;
        } else {
            // CDB ou Padrão Tributado
            taxaAnual = tipoRentabilidade === 'pos' ? CDI_ANUAL_DEFAULT * (rentabilidadeValor / 100) : rentabilidadeValor;
        }

        const taxaMensal = toMonthlyRate(taxaAnual);
        const historico = [];

        // Simulação Mês a Mês
        let saldoAcumulado = valorInicial;
        let totalInvestido = valorInicial;

        historico.push({
            mes: 0,
            acrescimo: 0,
            saldo: saldoAcumulado,
            investido: totalInvestido
        });

        for (let i = 1; i <= meses; i++) {
            let rendimentoMes = saldoAcumulado * taxaMensal;
            saldoAcumulado += rendimentoMes;

            saldoAcumulado += aporteMensal;
            totalInvestido += aporteMensal;

            historico.push({
                mes: i,
                rendimentoMes: rendimentoMes,
                saldo: saldoAcumulado,
                investido: totalInvestido
            });
        }

        const lucroBrutoTotal = saldoAcumulado - totalInvestido;
        const diasTotais = meses * 30; // Aproximação comercial

        let descontoIR = 0;
        if (!isentoIR && lucroBrutoTotal > 0) {
            // Em uma calculadora exata de banco, o IR é calculado por aporte. 
            // Para simplificação visual, aplicamos o peso médio baseando na tabela.
            const aliquota = getTaxRate(diasTotais);
            descontoIR = lucroBrutoTotal * aliquota;
        }

        const valorLiquido = saldoAcumulado - descontoIR;

        return {
            dadosGerais: {
                totalInvestido: totalInvestido,
                lucroBruto: lucroBrutoTotal,
                impostoRetido: descontoIR,
                valorLiquido: valorLiquido,
                isentoIR: isentoIR
            },
            historicoMensal: historico
        };
    }

    return {
        simulate,
        getRates: () => ({ selic: SELIC_ANUAL_DEFAULT, cdi: CDI_ANUAL_DEFAULT })
    };

})();
