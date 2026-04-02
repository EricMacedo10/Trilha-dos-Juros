# Controle de Atualizações e Issues

## 📋 Pendências e Configurações Futuras

### 1. Configuração de Chave HG Brasil (Vercel)
**Status:** Pendente / Opcional
**Descrição:** Para que o sistema utilize uma cota de requisições exclusiva e personalizada, é necessário configurar a chave da HG Brasil diretamente no painel da Vercel. 
**Ação Necessária:** No painel da Vercel (Settings > Environment Variables), adicione a variável `HG_KEY` com o valor da sua chave.
**Observação:** Se não for adicionada, o sistema continuará operando em modo de segurança com a lógica de fallback, mas sob quotas compartilhadas ou limitadas.

### 2. Integração de Inteligência GII (Fase 1: Ambiente de Teste)
**Status:** Concluído / Evoluindo (31/03/2026)
**Descrição:** Migração das funcionalidades críticas do projeto GII para o ecossistema Trilha dos Juros sob o novo branding regulatório.
**Próximas Ações:**
1.  **Editorial Hub Automático** (Pendente): Implementar a automação 100% hands-off via IA para evitar edição de HTML ou intervenção manual durante ausências (férias).
2.  **Expansão do Dicionário**: Adicionar mais 50+ termos técnicos ao `dictionary-service.js`.
3.  **Refinamento Visual CVM 178**: Inserir o selo de transparência de forma mais proeminente no footer ou sidebar.
4.  **Teste de Stress Mobile**: Validar as abas de notícias em dispositivos de tela muito pequena (iPhone SE, etc).

### 3. Arquitetura do Editorial Hub Automático (IA-Driven)
**Status:** Em Implementação (Fase de Teste Local)
**Descrição:** Motor de conteúdo autônomo que atualiza o "Morning Call" e o "Resumo do Dia".
**Progresso Atual (02/04/2026):**
*   **Motor Editorial (Python):** `editorial_engine.py` funcional no ambiente local.
*   **Conectividade:** Integrado com Yahoo Finance (Global/BR), Investing.com e CoinDesk.
*   **IA:** Utilizando API Key do Gemini (Free Tier) para resumos em conformidade com CVM.
*   **Frontend:** `editorial-service.js` já renderiza o JSON gerado pela IA no simulador de teste.
**Benefício:** Site com "vida própria" 24h por dia, garantindo engajamento AdSense mesmo durante as férias do administrador.

### 4. Próximos Passos Estratégicos (Roadmap Concluído ✅)
Todas as opções do escopo da Sessão Sênior foram integradas com sucesso:
*   ~~**Opção A: Automação GitHub Actions:**~~ Configurada (Cron diário 08:30 / 18:00 BRT).
*   ~~**Opção B: Dicionário Dinâmico + IA:**~~ Inteligência ativada. O termo gerado anula o aleatório e ganha brilho neon.
*   ~~**Opção C: PWA e App Experience:**~~ Service Worker e `manifest.json` implementados, permitindo instalação mobile stand-alone e suporte offline instântaneo (Stale-While-Revalidate).

---

## ✅ Conquistas Recentes
*   **Motor Editorial IA (Alpha):** Criação bem-sucedida do script `editorial_engine.py` integrado com Gemini API e fontes RSS globais/locais.
*   **Dual-Control (Arquivado):** Prototipagem de input manual de valores; arquivado por decisão do mestre visando manter a pureza estética original dos sliders.
*   **Assinatura Institucional:** Editorial agora assinado como "Curadoria Trilha dos Juros" para compliance e autoridade.
*   **Hub Editorial "Calls do Mercado":** Implementação de sistema de abas e scroll interno para Morning Call e Resumo do Dia em `gii_test/index_test.html`.

---
*Atualizado em 02/04/2026 às 08:58.*
