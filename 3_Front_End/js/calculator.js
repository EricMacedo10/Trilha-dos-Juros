/**
 * Motor Matemático - Trilha dos Juros (Renda Fixa Premium)
 * Preciso, baseado no sistema financeiro brasileiro.
 */

const FinMath = (function () {

    // Taxas Base Iniciais (Usadas como Fallback se a API falhar ou demorar para responder)
    let SELIC_ANUAL_DEFAULT = 14.75; // Taxa Selic Atualizada Real de 2026
    let CDI_ANUAL_DEFAULT = 14.65; // CDI Atualizado Real de 2026
    let POUPANCA_ANUAL = SELIC_ANUAL_DEFAULT > 8.5 ? 6.17 : (SELIC_ANUAL_DEFAULT * 0.7);

    /**
     * Busca os indicadores reais (Selic, CDI e IPCA) da API do Banco Central (BCB)
     */
    async function fetchRealRates() {
        console.log('[Trilha dos Juros] Sincronizando taxas oficiais com o Banco Central...');
        try {
            // Removido o proxy PHP legado que quebrava na Vercel com 404 (O BCB aceita CORS nativo)
            const endpoints = {
                selic: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
                cdi: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json',
                ipcaMensal: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json',
                ipca12m: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json',
                ipcaFocus: "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador%20eq%20'IPCA'%20and%20Suavizada%20eq%20'S'&$orderby=Data%20desc&$top=1&$format=json"
            };

            // Usamos Promise.allSettled para garantir resiliência
            const [selicRes, cdiRes, ipcaMensalRes, ipca12mRes, ipcaFocusRes] = await Promise.allSettled([
                fetch(endpoints.selic).then(r => r.ok ? r.json() : null),
                fetch(endpoints.cdi).then(r => r.ok ? r.json() : null),
                fetch(endpoints.ipcaMensal).then(r => r.ok ? r.json() : null),
                fetch(endpoints.ipca12m).then(r => r.ok ? r.json() : null),
                fetch(endpoints.ipcaFocus).then(r => r.ok ? r.json() : null)
            ]);

            let realData = {
                selic: SELIC_ANUAL_DEFAULT,
                cdi: CDI_ANUAL_DEFAULT,
                ipcaMensal: 0.83, // Fallback (Fev/2026)
                ipca12m: 3.81, // IPCA Acumulado Real (Fev/2026 divulgado pelo IBGE)
                ipcaProjetado: 4.10 // Expectativa Focus 12m suavizada
            };

            if (selicRes.status === 'fulfilled' && selicRes.value && selicRes.value.length > 0) {
                realData.selic = parseFloat(selicRes.value[0].valor);
                SELIC_ANUAL_DEFAULT = realData.selic;
            }

            // O CDI oficial pelo BCB sofre atraso da série 4389. 
            // Seguindo a convenção de mercado e contornando o delay: CDI = Selic Meta - 0,10 a.a.
            realData.cdi = Math.max(0, realData.selic - 0.10);
            CDI_ANUAL_DEFAULT = realData.cdi;

            if (ipcaMensalRes.status === 'fulfilled' && ipcaMonthlyVal(ipcaMensalRes.value)) {
                realData.ipcaMensal = parseFloat(ipcaMensalRes.value[0].valor);
            }

            if (ipca12mRes.status === 'fulfilled' && ipca12mRes.value && ipca12mRes.value.length > 0) {
                realData.ipca12m = parseFloat(ipca12mRes.value[0].valor);
            }

            if (ipcaFocusRes.status === 'fulfilled' && ipcaFocusRes.value && ipcaFocusRes.value.value && ipcaFocusRes.value.value.length > 0) {
                // Focus API retorna a mediana na chave "Mediana" dentro de "value"
                realData.ipcaProjetado = parseFloat(ipcaFocusRes.value.value[0].Mediana);
            }

            // Função extra para garantir valor do IPCA mensal
            function ipcaMonthlyVal(val) { return val && val.length > 0; }

            // Atualiza poupança baseada na nova Selic (Regra Pós-2012)
            POUPANCA_ANUAL = SELIC_ANUAL_DEFAULT > 8.5 ? 6.17 : (SELIC_ANUAL_DEFAULT * 0.7);

            console.log(`[Trilha dos Juros] Indicadores BCB sintonizados: Selic ${realData.selic}% | CDI ${realData.cdi}% | IPCA 12m ${realData.ipca12m}% | IPCA Focus ${realData.ipcaProjetado}%`);

            // Dispara evento global para o Ticker e UI
            document.dispatchEvent(new CustomEvent('ratesLoaded', {
                detail: {
                    selic: realData.selic,
                    cdi: realData.cdi,
                    ipca: realData.ipca12m, // Realizado 12m
                    ipcaMensal: realData.ipcaMensal, // Realizado 1 mês
                    ipcaProjetado: realData.ipcaProjetado // Projeção Focus 12m (Suavizada)
                }
            }));

        } catch (error) {
            console.warn('[Trilha dos Juros] Fallback: Usando taxas offline por erro de rede inesperado.', error);
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
        toMonthlyRate,
        getRates: () => ({ selic: SELIC_ANUAL_DEFAULT, cdi: CDI_ANUAL_DEFAULT })
    };

})();
