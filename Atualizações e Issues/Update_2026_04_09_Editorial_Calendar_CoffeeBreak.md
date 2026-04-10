# 🚀 Update Editorial Hub 2.0: Calendário Global & Coffee Break
**Data:** 09 de Abril de 2026
**Status:** Pronto para Produção (Agendado para Amanhã Cedo)

---

## 💎Resumo das Melhorias (Padrão Sênior)

Nesta atualização, elevamos a barra de qualidade do simulador **Trilha dos Juros**, transformando a sidebar em um terminal financeiro real e automatizando 100% da inteligência editorial intraday.

### 1. Arquitetura "Sticky Sidebar" (Zero Vácuo)
*   **Problema:** A coluna lateral "crescia" e deixava um espaço vazio enorme abaixo da logo.
*   **Solução:** Implementamos uma `sticky-column`. Agora, os Ativos, Parceiros e o Calendário ficam fixos na tela enquanto o usuário rola a ferramenta, mantendo o equilíbrio visual constante.

### 2. Radar de Eventos 2.0 (Cenário Global BR/US)
*   **Design Terminal:** Tabela profissional inspirada no Investing.com com 5 colunas: **HORA | EVENTO | ATUAL | PROJ. | ANT.**.
*   **Indicadores de País:** Cada evento agora possui uma `country-tag` (BR/US) para contextualizar o impacto.
*   **Scroll Premium:** Altura fixa de 350px (exibe ~5 eventos) com scrollbar neon customizada.

### 3. Novo Turno IA: "Coffee Break" ☕
*   **O que é:** Um resumo intermediário focado no que aconteceu na primeira metade do pregão.
*   **Horário:** Gerado automaticamente às **12:00h BRT**.
*   **Navegação:** Adicionada uma terceira aba no painel de Calls. O site agora tem o ciclo completo: *Morning Call* (08:30) ➔ *Coffee Break* (12:00) ➔ *Resumo do Dia* (18:00).

---

## 🛠️ Mudanças no Motor de IA (`editorial_engine.py`)

O robô agora é **100% autônomo** para o novo formato:
*   **3 Turnos de Publicação:** O script detecta a hora e gera o conteúdo específico (Manhã, Almoço ou Noite).
*   **Geração de Agenda:** O Gemini agora identifica os 5 eventos mais relevantes e estima as Projeções e Valores Anteriores automaticamente se o dado real ainda não tiver saído.
*   **Lógica de Merge:** O robô **preserva** as notícias dos turnos anteriores. Se ele rodar o Coffee Break, o Morning Call não é apagado.

---

## 📋 Checklist para Produção (Amanhã Cedo)

Para garantir que a transição seja perfeita (Zero Downtime):

1.  **Verificar Configuração:** Certifique-se de que a `GEMINI_API_KEY` está ativa no painel do GitHub Secrets ou Vercel.
2.  **Commit Seletivo:** 
    *   Subir apenas os arquivos da pasta `3_Front_End` e `4_Automacao_IA`.
    *   **IMPORTANTE:** Não sobrescrever o arquivo `.env` de produção com chaves locais.
3.  **Monitorar GitHub Actions:** Após o `push`, verifique se o workflow `editorial-automation.yml` roda sem erros.
4.  **Limpar Cache:** Se as mudanças não aparecerem de imediato, lembre-se que injetamos o `?v=timestamp` no JS para forçar o refresh do JSON.

---

## 🛡️ Notas de Segurança e Estabilidade
*   **Fallback Ativo:** Se a API do Gemini falhar (Erro 429), o site continuará funcionando com os textos padrão e não "quebrará" o layout.
*   **Progresso do Usuário:** Nenhuma mudança foi feita na lógica de depósitos ou saldo. O **Desafio dos Depósitos** permanece 100% seguro no localStorage dos clientes.

---
**Assinado:** *Motor de IA Antigravity (Selo de Qualidade Sênior)*
