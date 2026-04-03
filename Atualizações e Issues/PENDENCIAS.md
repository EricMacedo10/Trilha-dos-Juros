# Controle de Atualizações e Issues

## 📋 Pendências e Configurações Futuras (Pós-Sessão Sênior)

### 1. Monitoramento de Cota IA (Gemini API)
**Status:** ✅ Resolvido (03/04/2026)
**Descrição:** Devido aos intensos testes de deploy em 02/04, a cota gratuita de 20 requisições diárias foi atingida (Erro 429). 
**Resolução:** A cota resetou em 03/04 e o robô gerou conteúdo com sucesso às 08:30h. O sistema de "fallback" permanece ativo como rede de segurança.

### 2. Remoção do Aviso de Próximo Pregão
**Status:** 🚨 Pendente — Precisa ser removido!
**Descrição:** Inserimos um banner amarelo manual em `index.html` (linhas 538-541) informando que a atualização ocorrerá no próximo pregão.
**Ação:** O robô já gerou conteúdo real em 03/04. Este banner **deve ser removido** do HTML para limpar a interface. Localização: seção `calls-warning` dentro de `#market-calls-section`.

### 3. Integração de Inteligência GII (Fase 2: Expansão)
**Status:** ✅ Concluído (02/04/2026)
**Descrição:** Motor Editorial IA-Driven 100% integrado ao ambiente de produção oficial.
**Ações Concluídas:**
1.  **Editorial Hub Automático:** Implementado via GitHub Actions com gatilhos de `schedule` e `push`.
2.  **Blindagem Anti-Alucinação:** Data do sistema agora é forçada via Python, impedindo a IA de inventar datas antigas.
3.  **Cache-Busting:** Implementado timestamp no fetch do JSON para garantir que o usuário veja as notícias novas instantaneamente.

### 4. Ajustes no Radar de Ativos
**Status:** ✅ Concluído (02/04/2026)
**Descrição:** Estabilização do Radar conforme solicitado pelo mestre.
**Conquistas:**
*   **Bitcoin (BTC):** Restaurado como ativo de destaque.
*   **Real 1994:** Removido definitivamente do grid.
*   **深 Deep Links:** Botões "Ver Detalhes" e "Fonte Oficial" agora fixos e visíveis em mobile.
*   **Cache V22:** Versão de scripts atualizada para forçar refresh nos clientes.

---

## ✅ Conquistas Recentes (Sessão Sênior 02/04/2026)
*   **Escriturador de Permissões GitHub:** Resolvido o erro 403 Forbidden nas Actions, garantindo que o robô tenha autoridade para salvar as notícias no repositório.
*   **Estilhaçador de Cache:** Implementação de `?v=timestamp` no carregamento do editorial, resolvendo o problema de "notícias presas no navegador".
*   **Sincronização de Deploy:** Resolvido o bloqueio de "Hobby Team" da Vercel através de commits assinados pelo proprietário localmente.
*   **Compliance CVM:** Refinamento do System Prompt da IA para garantir tom informativo e não-advisory.

### 5. Bloqueio de Deploy na Vercel (Hobby Plan)
**Status:** ✅ Resolvido (03/04/2026)
**Descrição:** Os deploys automáticos do robô editorial estavam sendo **bloqueados** pela Vercel porque o commit era assinado como `"Trilha Editorial Automático"` (bot@trilhadosjuros.com.br) — um autor que não existe na conta Hobby.
**Causa Raiz:** O workflow `.github/workflows/editorial-automation.yml` usava `git config user.name` com nome de bot fictício, violando a regra do ADR-013 do Skill Senior.
**Correção:** Alterado o autor do commit para `"EricMacedo10"` / `"ericmacedo10@gmail.com"`, garantindo que a Vercel reconheça como o proprietário da conta.

### 6. Blindagem de Segurança do .gitignore
**Status:** ✅ Resolvido (03/04/2026)
**Descrição:** O `.gitignore` original **não protegia** arquivos `.env`, expondo risco de vazamento da `GEMINI_API_KEY` caso alguém fizesse `git add .`.
**Correção:** Adicionadas regras para `.env`, `*.env`, `__pycache__/`, `node_modules/` e diretórios de teste local.

### 7. Feeds RSS com Falhas (4 de 6 fontes vazias)
**Status:** ⚠️ Monitorando
**Descrição:** Na última execução do motor editorial (03/04), apenas 2 de 6 fontes RSS retornaram dados (Brasil e Global_Yahoo). As fontes Brasil_Yahoo, Global_CNBC, Cripto (CoinDesk) e Commodities retornaram feeds vazios.
**Impacto:** O Gemini ainda consegue gerar conteúdo com as 2 fontes ativas, mas a diversidade do editorial fica reduzida.
**Ação Futura:** Avaliar substituição dos feeds inativos por fontes alternativas mais confiáveis.

---

## ✅ Conquistas Recentes (Sessão Sênior 02-03/04/2026)
*   **Escriturador de Permissões GitHub:** Resolvido o erro 403 Forbidden nas Actions, garantindo que o robô tenha autoridade para salvar as notícias no repositório.
*   **Estilhaçador de Cache:** Implementação de `?v=timestamp` no carregamento do editorial, resolvendo o problema de "notícias presas no navegador".
*   **Sincronização de Deploy:** Resolvido o bloqueio de "Hobby Team" da Vercel através de commits assinados pelo proprietário localmente.
*   **Compliance CVM:** Refinamento do System Prompt da IA para garantir tom informativo e não-advisory.
*   **🆕 Desbloqueio Vercel (03/04):** Corrigido o `user.name` no workflow editorial de "Trilha Editorial Automático" para "EricMacedo10". Deploys bloqueados eliminados.
*   **🆕 Blindagem .gitignore (03/04):** Proteção total contra vazamento de `.env` e credenciais no repositório público.

---
*Atualizado em 03/04/2026 às 10:30 (Horário de Brasília) - Sessão de Estabilização.*
