/**
 * Compliance Service
 * Portado do Assistente para garantir o Padrão de Transparência CVM 178.
 * Este módulo roda no frontend para checagem em tempo real.
 */

const NivelRisco = {
    BAIXO: "baixo",
    MEDIO: "medio",
    ALTO: "alto",
    CRITICO: "critico"
};

const PalavrasProibidas = {
    recomendacao: [
        "recomendo", "recomendamos", "recomenda-se", "sugiro", "sugerimos",
        "aconselho", "aconselhamos", "indico", "indicamos",
        "compre", "venda", "invista", "aposte", "garanto", "garantimos",
        "certeza", "com certeza", "seguramente", "sem risco",
        "lucro garantido", "lucro certo", "retorno garantido",
        "melhor investimento", "oportunidade imperdível"
    ],
    promessa: [
        "vai subir", "vai cair", "vai valorizar", "vai desvalorizar",
        "certamente", "definitivamente", "sem dúvida",
        "100% de certeza", "impossível perder", "risco zero"
    ],
    alerta_alto_risco: [
        "dica quente", "informação privilegiada", "inside",
        "antes de todo mundo", "informação exclusiva",
        "esquema", "pirâmide", "retorno rápido"
    ]
};

class ComplianceService {
    constructor() {
        this.todasPalavras = [
            ...PalavrasProibidas.recomendacao,
            ...PalavrasProibidas.promessa,
            ...PalavrasProibidas.alerta_alto_risco
        ];
    }

    detectarPalavrasProibidas(texto) {
        const textoLower = texto.toLowerCase();
        const encontradas = [];

        this.todasPalavras.forEach(palavra => {
            // Regex para buscar a palavra exata (bordas de palavra)
            const regex = new RegExp(`\\b${palavra}\\b`, 'i');
            if (regex.test(textoLower)) {
                encontradas.push(palavra);
            }
        });

        return encontradas;
    }

    calcularNivelRisco(texto, palavrasEncontradas) {
        // Checagem CRITICO
        if (palavrasEncontradas.some(p => PalavrasProibidas.alerta_alto_risco.includes(p))) {
            return NivelRisco.CRITICO;
        }

        // Checagem ALTO
        const altoRisco = [...PalavrasProibidas.recomendacao, ...PalavrasProibidas.promessa];
        if (palavrasEncontradas.some(p => altoRisco.includes(p))) {
            return NivelRisco.ALTO;
        }

        // Checagem MEDIO (Termos de análise)
        const termosAnalise = ['indicador', 'análise', 'histórico', 'tendência', 'fundamentalista', 'técnica', 'balanço', 'resultado'];
        const textoLower = texto.toLowerCase();
        if (termosAnalise.some(t => textoLower.includes(t))) {
            return NivelRisco.MEDIO;
        }

        return NivelRisco.BAIXO;
    }

    gerarSugestoes(palavrasEncontradas) {
        const sugestoes = [];
        
        if (palavrasEncontradas.length > 0) {
            sugestoes.push("Remova expressões que sugerem recomendação de investimento.");
            
            if (palavrasEncontradas.some(p => PalavrasProibidas.recomendacao.includes(p))) {
                sugestoes.push("Substitua termos de recomendação por descrições objetivas: 'os dados indicam' ou 'historicamente observa-se'.");
            }
            if (palavrasEncontradas.some(p => PalavrasProibidas.promessa.includes(p))) {
                sugestoes.push("Evite promessas de mercado: prefira 'pode apresentar alta' ou 'a tendência indica'.");
            }
            if (palavrasEncontradas.some(p => PalavrasProibidas.alerta_alto_risco.includes(p))) {
                sugestoes.push("CRÍTICO: Remova imediatamente referências a informações privilegiadas ou de ganho irreal/garantido.");
            }
        }
        
        return sugestoes;
    }

    validar(conteudo) {
        const palavrasEncontradas = this.detectarPalavrasProibidas(conteudo);
        const nivelRisco = this.calcularNivelRisco(conteudo, palavrasEncontradas);
        // Um texto não é conforme se possui risco crítico ou alto, ou contém palavras banidas
        const conforme = (nivelRisco !== NivelRisco.CRITICO && palavrasEncontradas.length === 0);
        
        return {
            conforme,
            nivelRisco,
            palavrasProibidasEncontradas: palavrasEncontradas,
            sugestoesCorrecao: this.gerarSugestoes(palavrasEncontradas)
        };
    }

    obterAvisoCVM() {
        const dataStr = new Date().toLocaleString('pt-BR');
        return `⚠️ Aviso Importante:
As informações apresentadas são de caráter exclusivamente informativo e educacional.

Não constituem:
• Recomendação de investimento
• Oferta de compra ou venda de valores mobiliários
• Consultoria ou assessoria de investimentos

Este conteúdo está em conformidade com a Resolução CVM nº 178/2023.
Investimentos em renda variável envolvem riscos. Rentabilidade passada não representa garantia de resultados futuros.
(Validação de compliance processada em ${dataStr})
`;
    }
}

// Expor classe globalmente
window.ComplianceService = ComplianceService;
