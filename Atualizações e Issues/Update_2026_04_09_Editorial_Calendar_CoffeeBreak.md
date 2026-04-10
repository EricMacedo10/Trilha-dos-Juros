# 🚀 Update Editorial Hub 2.0: Calendário Global & Coffee Break
**Data:** 09 de Abril de 2026
**Deploy em Produção:** ✅ 10 de Abril de 2026 — 06:00h BRT
**Status:** Em Produção

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
*   **Agenda Real (ForexFactory):** O motor agora consome a API JSON do **ForexFactory** (`nfs.faireconomy.media`) para alimentar o Gemini com a agenda econômica real da semana, eliminando eventos fictícios/alucinados pela IA.
*   **Lógica de Merge:** O robô **preserva** as notícias dos turnos anteriores. Se ele rodar o Coffee Break, o Morning Call não é apagado.
*   **Fallback Resiliente:** Se a API do Gemini retornar erro 429 (Quota), o calendário existente é **preservado** (return `None`) em vez de ser sobrescrito por um fallback genérico.

---

## ✅ Checklist de Produção (Concluído em 10/04/2026)

1.  ✅ **GEMINI_API_KEY** ativa no GitHub Secrets.
2.  ✅ **Commit assinado** como `EricMacedo10` para compatibilidade Vercel Hobby.
3.  ✅ **GitHub Actions** rodou sem erros após o push.
4.  ✅ **Cache-busting** via `?v=timestamp` no JS está ativo.
5.  ✅ **Radar de Eventos** alimentado por dados reais (ForexFactory API).
6.  ✅ **Alinhamento visual** do painel Calls com Radar de Eventos ajustado (`margin-top: 4rem`, `max-height: 980px`).

---

## 🛡️ Notas de Segurança e Estabilidade
*   **Fallback Resiliente (Bugfix 10/04):** Se a API do Gemini falhar (Erro 429 Quota Exceeded), o motor agora retorna `None` e **preserva os dados existentes** no JSON. Anteriormente, o fallback sobrescrevia o calendário inteiro com um evento genérico.
*   **Progresso do Usuário:** Nenhuma mudança foi feita na lógica de depósitos ou saldo. O **Desafio dos Depósitos** permanece 100% seguro no localStorage dos clientes.
*   **Dependência `requests`:** Já incluída no `requirements.txt` para suportar a chamada HTTP ao ForexFactory.

---
**Assinado:** *Motor de IA Antigravity (Selo de Qualidade Sênior)*
