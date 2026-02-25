/**
 * Motor Matemático - Trilha dos Juros (Renda Fixa Premium)
 * Preciso, baseado no sistema financeiro brasileiro.
 */

const FinMath = (function() {
    
    // Taxas Base (Podem ser alimentadas por API futura)
    const SELIC_ANUAL_DEFAULT = 10.75;
    const CDI_ANUAL_DEFAULT = 10.65;
    const POUPANCA_ANUAL = SELIC_ANUAL_DEFAULT > 8.5 ? 6.17 : (SELIC_ANUAL_DEFAULT * 0.7);

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
     * @param {number} rentabilidadePct (Ex: 110 para 110% do CDI)
     * @returns {Object} Dados completos da simulação incluindo histórico
     */
    function simulate(tipo, valorInicial, aporteMensal, meses, rentabilidadePct = 100) {
        
        let taxaAnual = 0;
        let isentoIR = false;
        
        if (tipo === 'poupanca') {
            taxaAnual = POUPANCA_ANUAL;
            isentoIR = true;
        } else if (tipo === 'lci') {
            taxaAnual = CDI_ANUAL_DEFAULT * (rentabilidadePct / 100);
            isentoIR = true;
        } else {
            // CDB ou Padrão Tributado
            taxaAnual = CDI_ANUAL_DEFAULT * (rentabilidadePct / 100);
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
        CDI_DEFAULT: CDI_ANUAL_DEFAULT
    };

})();
