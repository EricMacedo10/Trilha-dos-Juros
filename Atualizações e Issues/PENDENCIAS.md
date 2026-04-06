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

## 🏛️ Roadmap de Evolução: Central de Comando Sênior (HQ)
**Data de Proposição:** 06/04/2026

Para elevar o nível de controle e transformar a HQ em uma verdadeira "Torre de Controle" profissional, estas são as melhorias detalhadas:

### 1. 🟢 Orquestrador de Mercado (Monitoramento Ativo)
*   **Problema:** Atualmente a aba de "Orquestrador" é um esqueleto visual (skeletons).
*   **Melhoria:** Implementar lógica de `fetch` real para validar o status das APIs (BCB, Yahoo, AwesomeAPI).
*   **Interface:** Substituir "Skeletons" por indicadores LED (Verde: Online / Vermelho: Offline).
*   **Impacto:** Detecção imediata de falhas de cotação antes que o usuário final perceba.

### 2. 📝 Editor Editorial de Contingência (Manual Override)
*   **Problema:** Dependência 100% da IA. Se o Gemini falhar ou houver erro no texto, é necessário editar arquivos JSON via VS Code.
*   **Melhoria:** Adicionar um campo de edição (Textarea) na HQ que permita o usuário editar manualmente o `editorial_feed.json`.
*   **Ação:** Botão "Salvar e Republicar" que dispara um `git commit` ou salva os dados (via API futura).
*   **Impacto:** Controle total sobre o conteúdo em casos de furos de reportagem ou correções expressas.

### 3. 🛡️ Audit Log de Automação (Shadow Logs)
*   **Problema:** A aba "Console de Eventos" contém apenas mensagens estáticas de boot.
*   **Melhoria:** Conectar a HQ ao histórico de execuções do GitHub Actions.
*   **Interface:** Lista cronológica: *"Há 15min: IA Editorial rodou com sucesso (12 notícias processadas)"*.
*   **Impacto:** Segurança psicológica para o gestor saber que a "máquina" está trabalhando em segundo plano.

### 4. 🔏 Gestor Dinâmico da Shadow Key (Segurança Premium)
*   **Problema:** A senha de acesso (`Deia...`) é fixa e difícil de mudar sem ajuda técnica.
*   **Melhoria:** Aba "Segurança" para definir uma nova chave de acesso.
*   **Lógica:** O sistema gera o hash SHA-256 e o salva em um local seguro (env ou config).
*   **Impacto:** Autonomia total do mestre sobre quem e como acessa a HQ.

---

## ✅ Conquistas Recentes (Sessão de Estabilização HQ 06/04/2026)
*   **Restaurador de Rotas (Erro 404):** Identificado e corrigido o erro de 404 na Vercel movendo a HQ para `3_Front_End/hq/`.
*   **Consolidador de Caminhos Relativos:** Ajustados links de CSS e Fetch do JSON para garantir funcionamento idêntico entre Localhost e Produção.
*   **Shadow Protocol V2:** Implementada autenticação baseada em SHA-256 (Hash) na entrada da HQ, removendo senhas em texto puro do código.
*   **Badge de Ambiente:** Implementada tag visual "MODO: PRODUÇÃO SÊNIOR" no dashboard.
*   **Documentação ADR-016:** Formalizada a regra de "Vercel Root Directory" para evitar futuras regressões de caminhos.

---
*Atualizado em 06/04/2026 às 15:05 (Horário de Brasília) — Consolidação e Roadmapping da HQ.*
