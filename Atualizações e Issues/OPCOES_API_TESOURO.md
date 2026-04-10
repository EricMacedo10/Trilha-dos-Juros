# Opções de API para Títulos Públicos (Tesouro Direto)

Este documento resume as opções para integração de dados de títulos públicos no projeto **Trilha dos Juros**.

## 1. Fontes Gratuitas (Oficiais)

### Tesouro Transparente (CKAN API)
- **O que é:** Portal de dados abertos do governo brasileiro.
- **Endpoint:** `https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search`
- **Recurso de Preços e Taxas:** `796d2059-14e9-44e3-80c9-2d9e30b405c1`
- **Custo:** R$ 0,00.

### Banco Central do Brasil (SGS)
- **O que é:** Sistema de Séries Temporais para indicadores macro.
- **Útil para:** Selic, IPCA, CDI e histórico de rentabilidade.
- **Endpoint:** `https://api.bcb.gov.br/dados/serie/bcdata.sgs.[CODIGO]/dados?formato=json`
- **Custo:** R$ 0,00.

---

## 2. Fontes Pagas ou Freemium (Terceiros)

### Fintz / Dados de Mercado
- **Vantagem:** Dados já limpos, normalizados e com documentação técnica superior.
- **Custo:** Possuem planos gratuitos limitados (freemium) e planos pagos conforme o volume.

### ANBIMA
- **Vantagem:** O padrão "ouro" do mercado financeiro brasileiro.
- **Custo:** Elevado, voltado para uso institucional e corporativo.

---

## 3. Análise de Pontos Negativos (Opções Gratuitas)

| Ponto | Descrição |
| :--- | :--- |
| **Padronização** | Nomes de campos costumam ter espaços e acentos (ex: "Data Vencimento"). Exige mapeamento manual. |
| **Disponibilidade** | Sem garantia de SLA. Pode ficar instável em dias de alta volatilidade. |
| **Tempo Real** | Não existe streaming de dados. Atualizado em "janelas" de mercado. |
| **CORS** | Muitas vezes bloqueia requisições direto do Browser, exigindo um Proxy (Backend). |
| **Documentação** | Geralmente limitada a manuais de uso da plataforma genérica (CKAN). |

---

## 4. Estratégia Recomendada para o Projeto

Para manter o custo **Zero** e alta performance no **Trilha dos Juros**:

1.  **Backend Proxy/Cache:** Utilizar um script (GitHub Actions ou Serverless Function) para buscar os dados no Tesouro Nacional 1x por dia.
2.  **Normalização:** O script deve "limpar" o JSON (ex: converter "Data Vencimento" para "dueDate").
3.  **Entrega Local:** Salvar os dados limpos em um arquivo estático (ex: `titulos.json`) dentro do repositório ou bucket.
4.  **Uso no Front:** O front-end consome o seu próprio JSON, garantindo velocidade instantânea e 100% de disponibilidade.
