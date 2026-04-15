# Mapa de Arquivos do Sistema — Trilha dos Juros

> Referência rápida: "quem faz o quê" em cada arquivo do projeto.
> Atualizado em 10/04/2026.

---

## 📁 Estrutura Raiz

| Arquivo/Pasta | Função |
|:---|:---|
| `1_Skill_WorkFlow_Senior/` | Contrato de qualidade e workflow sênior (ADRs, regras de ouro) |
| `2_Documentacao_do_Sistema/` | Toda a documentação técnica e guias de operação |
| `3_Front_End/` | **Código de produção** — HTML, CSS, JS e APIs serverless |
| `4_Automacao_IA/` | Motor Editorial IA Híbrido (DeepSeek + Gemini) — Python isolado |
| `4_Back_End/` | ⚠️ **Legado** — PHP obsoleto (Hostinger), NÃO usar |
| `API_Investimento/` | Scraper de Commodities (Python → Gist Strategy) |
| `Atualizações e Issues/` | Controle de pendências, bugs e conquistas |
| `.github/workflows/` | GitHub Actions (automação CI/CD) |
| `.gitignore` | Proteção de credenciais (.env, etc.) |
| `ads.txt` | Autorização de anunciantes Google AdSense |

---

## 🎨 3_Front_End/ — O Palco Principal

### Arquivos de Entrada

| Arquivo | Responsabilidade |
|:---|:---|
| `index.html` | Página principal (SPA). Contém TODO o HTML: Simulador, Jornada, Radar, Calls do Mercado, FAQ |
| `privacidade.html` | Política de privacidade (LGPD) |
| `sobre.html` | Página "Sobre Nós" - Relato da missão e valores (E-E-A-T AdSense) |
| `termos.html` | Termos e Condições de Uso |
| `sitemap.xml` | Mapa do site para indexação SEO e Google Bots |
| `manifest.json` | Configuração PWA (instalação como app no celular) |
| `sw.js` | Service Worker — cache offline e estratégia de atualização |
| `editorial_feed.json` | Feed editorial gerado pelo robô IA (Morning Call + Coffee Break + Resumo do Dia + Calendário Econômico) |
| `mercado_global.json` | Dados de commodities (lido do Gist público) |

### CSS (`3_Front_End/css/`)

| Arquivo | Responsabilidade |
|:---|:---|
| `style.css` | Design system base: variáveis CSS, cores, tipografia, dark mode |
| `components.css` | Todos os componentes visuais: cards glassmorphism, sliders neon, ticker, FAQ, gamificação |

### JavaScript (`3_Front_End/js/`) — Os Motores

| Arquivo | Responsabilidade | Fonte de Dados |
|:---|:---|:---|
| `calculator.js` | Motor de juros compostos (CDI 252du, IR Regressivo, Poupança) | Cálculo local |
| `ui-controller.js` | Orquestrador geral: navegação, sliders, tooltips, animações, AdSense | DOM local |
| `gamification.js` | Jornada dos Depósitos — progressão aritmética, envelopes, localStorage | localStorage |
| `ticker.js` | Barra de cotações infinita (60fps). Renderização "No-DOM-Trash" (ADR-003) | HG Brasil (Domain-Locked) + BCB SGS |
| `radar-service.js` | Radar de Ativos — grid com Selic, CDI, IPCA, BTC, Ouro | BCB SGS + Gist |
| `commodities.js` | Leitura de cotações do Gist público (Ouro, Prata, etc.) | GitHub Gist CDN |
| `editorial-service.js` | Carrega e exibe Morning Call / Coffee Break / Resumo do Dia + Calendário Econômico | `editorial_feed.json` |
| `news-service.js` | Módulo de notícias via RSS (com fallbacks) | RSS Feeds via CORS |
| `dictionary-service.js` | Pílulas de Conhecimento — dicionário financeiro educativo | Local + IA |
| `compliance-service.js` | Motor de compliance CVM 178 — valida linguagem e disclaimers | Regras locais |
| `buying-power.js` | Gráfico "O Real em 1994 vs Hoje" — perda de poder de compra | BCB SGS (Série 433) |

### Central de Comando Sênior (`3_Front_End/hq/`)

| Arquivo/Pasta | Responsabilidade |
|:---|:---|
| `index.html` | Dashboard administrativo restrito ("Shadow Protocol"). Gerencia a infra, status de APIs e motor IA |
| `css/command.css` | Estilização isolada do dashboard (Glassmorphism Sênior, Terminal Theme) |
| `js/command.js` | Lógica autônoma do painel. Realiza fetch dinâmico (anti-cache) do `editorial_feed.json` |

### API Serverless (`3_Front_End/api/`) — Vercel Functions

| Arquivo | Responsabilidade | Segurança |
|:---|:---|:---|
| `yahoo.js` | Proxy para Yahoo Finance (ações B3: PETR4, VALE3, ITUB4, IBOV) | Blinda CORS + esconde origem |
| `hg.js` | Proxy HG Brasil (backup, atualmente bypass via Domain-Lock ADR-010) | Chave protegida server-side |

---

## 🤖 4_Automacao_IA/ — Motor Editorial

| Arquivo | Responsabilidade |
|:---|:---|
| `editorial_engine.py` | Script principal: coleta RSS + ForexFactory → IA Híbrida → gera `editorial_feed.json` (3 turnos + calendário real) |
| `requirements.txt` | Dependências Python (google-generativeai, openai, feedparser, requests) |
| `.env` | 🔒 Chaves `GEMINI_API_KEY` e `DEEPSEEK_API_KEY` local (NUNCA subir ao Git) |
| `check_models.py` | Utilitário de debug — lista modelos Gemini disponíveis |

---

## 📊 API_Investimento/ — Gist Strategy (Commodities)

| Arquivo | Responsabilidade |
|:---|:---|
| `scraper.py` | Scraper Python: busca cotações via yfinance e salva no Gist público |
| `requirements.txt` | Dependências Python (requests) |
| `cota_hoje.json` | Cache local de cotações (debug) |

---

## ⚙️ .github/workflows/ — Automações CI/CD

| Arquivo | Gatilho | O que faz |
|:---|:---|:---|
| `editorial-automation.yml` | Cron 08:30/12:00/18:00 BRT + Push + Manual | Roda `editorial_engine.py` → commit `editorial_feed.json` → deploy Vercel |
| `update_prices.yml` | Cron a cada hora + Manual | Roda `scraper.py` → atualiza Gist de commodities |

### ⚠️ Regra Crítica dos Workflows
O autor do commit nos workflows **deve ser** `EricMacedo10` / `ericmacedo10@gmail.com`.
Qualquer outro nome será **bloqueado pela Vercel Hobby**. (Ref: ADR-013)

---

## 🚫 Arquivos Legados (NÃO USAR)

| Arquivo | Status | Motivo |
|:---|:---|:---|
| `4_Back_End/api_commodities.php` | ❌ Obsoleto | PHP/Hostinger erradicado (ADR-002) |
| `3_Front_End/news-proxy.php` | ❌ Obsoleto | Proxy PHP erradicado (ADR-002) |
| `.htaccess` | ❌ Legado | Configuração Apache/Hostinger, ignorada na Vercel |
| `hq/` (Raiz) | ❌ Obsoleto | Pasta legada, movida para `3_Front_End/hq/` |
| `5_Central_Comando_Senior/` | ❌ Proibido | Vercel não monitora pastas fora de `3_Front_End`. Usar `3_Front_End/hq/` |

---
*Documentação atualizada em 15/04/2026 — Implementação de Sitemap, Compliance AdSense e Estabilização 2.0.*
