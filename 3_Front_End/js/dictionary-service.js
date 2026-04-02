/**
 * Dictionary Service
 * Fornece definições financeiras rápidas (pílulas de conhecimento).
 */

const FinancialDictionary = {
    "CDI": "Certificado de Depósito Interbancário. É a taxa de juros que os bancos usam para emprestar dinheiro entre si. Serve como principal referência para investimentos de renda fixa.",
    "SELIC": "Taxa básica de juros da economia brasileira, definida pelo COPOM. Ela influencia todas as outras taxas de juros do país, como empréstimos e rendimentos.",
    "CDB": "Certificado de Depósito Bancário. Você 'empresta' dinheiro para o banco em troca de juros. É um título seguro e protegido pelo FGC.",
    "LCI": "Letras de Crédito Imobiliário (LCI) e do Agronegócio (LCA). São investimentos isentos de Imposto de Renda para pessoas físicas. Os recursos são destinados aos setores de imóveis e rural, respectivamente.",
    "LCA": "Letra de Crédito do Agronegócio. Investimento isento de Imposto de Renda focado no setor rural. Similar à LCI, mas voltada ao agronegócio.",
    "IPCA": "O termômetro oficial da inflação no Brasil. Mede a variação de preços para o consumidor final. Investir em ativos IPCA+ garante seu poder de compra.",
    "FGC": "Fundo Garantidor de Créditos. É uma espécie de seguro que protege o investidor em até R$ 250 mil por CPF e por instituição financeira em caso de quebra do banco.",
    "TESOURO DIRETO": "Programa do Governo Federal para venda de títulos públicos para pessoas físicas. É considerado o investimento de menor risco do mercado.",
    "PREFIXADO": "Título onde você sabe exatamente quanto vai receber no vencimento desde o dia da compra. A taxa de juros não muda.",
    "PÓS-FIXADO": "Rendimento atrelado a um indexador (como o CDI ou SELIC). O valor final varia conforme a flutuação dessa taxa durante o período.",
    "LIQUIDEZ DIÁRIA": "Diz respeito à facilidade de transformar o investimento em dinheiro vivo. Significa que você pode resgatar seu dinheiro a qualquer momento sem perdas."
};

class DictionaryService {
    constructor() {
        this.terms = FinancialDictionary;
    }

    getDefinition(term) {
        const upperTerm = term.toUpperCase();
        return this.terms[upperTerm] || null;
    }

    /**
     * Retorna um termo aleatório para o banner 'Pílula de Conhecimento'
     */
    getRandomTerm() {
        const keys = Object.keys(this.terms);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return {
            term: randomKey,
            definition: this.terms[randomKey]
        };
    }

    /**
     * Aplica automaticamente tooltips em elementos que contenham data-term
     */
    applyTooltips() {
        const elements = document.querySelectorAll('[data-term]');
        elements.forEach(el => {
            const term = el.getAttribute('data-term');
            const definition = this.getDefinition(term);
            
            if (definition) {
                // Se já tiver uma estrutura de tooltip, atualiza o texto
                const tooltipText = el.querySelector('.tooltip-text');
                if (tooltipText) {
                    tooltipText.textContent = definition;
                } else {
                    // Caso contrário, cria a estrutura premium
                    el.classList.add('info-tooltip');
                    const icon = document.createElement('i');
                    icon.className = 'ph ph-info';
                    icon.style.marginLeft = '4px';
                    
                    const span = document.createElement('span');
                    span.className = 'tooltip-text';
                    span.textContent = definition;
                    
                    el.appendChild(icon);
                    el.appendChild(span);
                }
            }
        });
    }
}

window.DictionaryService = DictionaryService;
