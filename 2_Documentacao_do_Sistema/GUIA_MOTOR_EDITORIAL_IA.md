# Guia do Motor Editorial IA-Driven (Trilha dos Juros - v2.0)

Este guia descreve o funcionamento do sistema automatizado de geração de conteúdo para o **Editorial Hub**, atualizado para a arquitetura 100% DeepSeek em 10/04/2026.

## 🏁 Visão Geral
O sistema utiliza Inteligência Artificial de ponta para coletar notícias de fontes financeiras reais (RSS), processá-las sob a ótica de compliance CVM e gerar um feed JSON que alimenta o front-end automaticamente em três turnos diários.

## 🛰️ Arquitetura de Dados
1.  **Fontes**: Investing.com, Yahoo Finance, Agregadores BRL/USD/Commodities.
2.  **Motor (Python)**: `4_Automacao_IA/editorial_engine.py` (v2.1).
3.  **Inteligência**: **DeepSeek API** (`deepseek-chat`).
4.  **Entrega**: Gerador de arquivo `3_Front_End/editorial_feed.json`.
5.  **Apresentação**: `3_Front_End/js/editorial-service.js`.

## 🤖 Regras de Automação (GitHub Actions)
O robô está configurado em `.github/workflows/editorial-automation.yml`:
*   **⏰ 08:30 BRT (Matutino)**: Gera o **Morning Call**.
*   **☕ 12:00 BRT (Intermediário)**: Gera o **Coffee Break** (Relatório de Meio de Dia).
*   **🌆 18:00 BRT (Vespertino)**: Gera o **Resumo do Dia**.
*   **Manual**: Permite execução manual via *GitHub Actions -> Run Workflow*.
*   **⚠️ Nota de Deploy**: O gatilho `on: push` foi desativado para evitar sobrescritas acidentais e loops de deploy na Vercel.

## 🔍 Funcionalidades Especiais
### 🕵️ IA Detetive (Extração de Dados Reais)
Diferente de agendas econômicas estáticas, o motor editorial agora possui uma lógica de **extração ativa**. Se o resultado de um indicador (ex: inflação CPI) for citado nas notícias de última hora, a IA extrai o número e preenche automaticamente a coluna **ATUAL** do Radar de Eventos, eliminando o delay de APIs de terceiros.

### 📅 Agenda Econômica Inteligente
O radar prioriza automaticamente eventos de "Hoje em diante", filtrando o lixo de dados passados e focando apenas no que impacta a sessão de mercado atual.

## 🛠️ Resolução de Problemas (FAQ)

### ❓ Erro 429 ou Falha de IA?
Como migramos para a API paga do **DeepSeek**, o erro de cota gratuita (Gemini) foi eliminado. Se houver falha, verifique o saldo da conta DeepSeek no dashboard oficial.

### ❓ O site não atualizou mesmo após o robô rodar?
O site utiliza um **Service Worker (PWA)** para alta performance. Se você não vir a atualização, faça um **Hard Reload (Ctrl + F5)**. Isso forçará o navegador a ler o novo `editorial_feed.json`.

### ❓ Como rodar manualmente para teste?
```bash
cd 4_Automacao_IA
# Certifique-se de ter a DEEPSEEK_API_KEY no .env
python editorial_engine.py
```

## 🔒 Segurança e Compliance (CVM 178)
O motor editorial segue travas de segurança rígidas:
*   Proibido o uso de termos de recomendação (Compre/Venda).
*   Proibido adjetivos de pânico ou euforia.
*   Obrigatória a citação de fontes (Bloomberg, Yahoo, etc).

---
*Documentação atualizada em 15/04/2026 - Sprint: Estabilização Editorial Hub & Compliance AdSense.*
