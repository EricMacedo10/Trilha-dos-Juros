# Guia do Motor Editorial IA-Driven (Trilha dos Juros)

Este guia descreve o funcionamento do sistema automatizado de geração de conteúdo para o **Morning Call** e **Resumo do Dia**, implementado na Sessão Sênior de 02/04/2026.

## 🏁 Visão Geral
O sistema utiliza IA para coletar notícias de fontes financeiras reais (RSS), processá-las sob a ótica de compliance CVM e gerar um feed JSON que alimenta o front-end automaticamente.

## 🛰️ Arquitetura de Dados
1.  **Fontes**: Investing.com, Yahoo Finance, CoinDesk, CNBC.
2.  **Motor (Python)**: `4_Automacao_IA/editorial_engine.py`
3.  **Inteligência**: Google Gemini API (`gemini-flash-latest`).
4.  **Entrega**: Gerador de arquivo `3_Front_End/editorial_feed.json`.
5.  **Apresentação**: `3_Front_End/js/editorial-service.js`.

## 🤖 Regras de Automação (GitHub Actions)
O robô está configurado em `.github/workflows/editorial-automation.yml`:
*   **Cron 08:30 BRT**: Gera o Morning Call.
*   **Cron 18:00 BRT**: Gera o Resumo do Dia.
*   **On Push**: Também roda sempre que houver mudanças no código.
*   **Permissões**: Requer `contents: write` ativado no repositório.

## 🛠️ Resolução de Problemas (FAQ)

### ❓ As notícias estão com data errada/antiga?
O sistema agora força a data do servidor através do Python. Se a data estiver travada, verifique se o navegador está usando cache (limpe o cache ou use o timestamp `?v=` na URL). No dia 02/04, adicionamos um alerta manual no HTML: *"A atualização irá ocorrer no próximo pregão"*.

### ❓ Erro 429 (Quota Exceeded)?
Significa que o limite de 15 a 20 requisições diárias (Free Tier) foi atingido. O robô entrará em modo de **Fallback**, mostrando mensagens padrão até que a cota seja renovada no dia seguinte.

### ❓ Como rodar manualmente?
Se você estiver no seu computador (`localhost`):
```bash
cd 4_Automacao_IA
python editorial_engine.py
```

### ❓ Deploy bloqueado na Vercel (Status "Blocked")?
Isso acontece quando o commit do robô é assinado com um nome diferente do proprietário da conta Vercel Hobby. O autor do commit no workflow **deve obrigatoriamente ser** `EricMacedo10` com o e-mail `ericmacedo10@gmail.com`. Qualquer outro nome (ex: "Trilha Editorial Automático") será rejeitado pela Vercel. Verifique as linhas de `git config` no arquivo `.github/workflows/editorial-automation.yml`.

### ❓ Vários feeds RSS estão vazios?
Algumas fontes RSS (CoinDesk, CNBC, Yahoo BR) podem estar temporariamente indisponíveis ou bloqueando requisições de servidores cloud. O motor editorial funciona com pelo menos 1 fonte ativa, mas a qualidade do conteúdo melhora com mais fontes. Avalie substituir feeds inativos.

## 🔒 Segurança e Compliance (CVM 178)
O prompt da IA está programado para:
*   Ser estritamente informativo (Sem recomendações de compra/venda).
*   Manter distanciamento institucional.
*   Referenciar fontes oficiais do mercado financeiro.

---
*Documentação criada em 02/04/2026. Atualizada em 03/04/2026.*
