# Controle de Atualizações e Issues

## 📋 Pendências e Configurações Futuras (Pós-Sessão Sênior)

### 1. Monitoramento de Cota IA (Gemini API)
**Status:** ⚠️ Atenção (Free Tier)
**Descrição:** Devido aos intensos testes de deploy hoje (02/04), a cota gratuita de 20 requisições diárias foi atingida (Erro 429). 
**Ação:** O robô voltará a gerar conteúdos novos automaticamente amanhã (03/04) às 08:30h, quando a cota resetar. O sistema de "fallback" (mensagens de segurança) está funcionando corretamente para manter o site estável.

### 2. Remoção do Aviso de Próximo Pregão
**Status:** Pendente (Próxima Atualização)
**Descrição:** Inserimos um banner amarelo manual em `index.html` informando que a atualização ocorrerá no próximo pregão.
**Ação:** Assim que o robô gerar o primeiro conteúdo real de amanhã, este aviso visual pode ser removido do HTML para limpar a interface.

### 3. Integração de Inteligência GII (Fase 2: Expansão)
**Status:** Concluído / Evoluindo (02/04/2026)
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

---
*Atualizado em 02/04/2026 às 18:45 (Horário de Brasília) - Sessão Sênior Finalizada.*
