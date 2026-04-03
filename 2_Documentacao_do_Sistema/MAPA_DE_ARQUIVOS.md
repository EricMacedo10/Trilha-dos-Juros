# Mapa de Arquivos do Sistema — Trilha dos Juros

> Referência rápida: "quem faz o quê" em cada arquivo do projeto.
> Atualizado em 03/04/2026.

---

## 📁 Estrutura Raiz

| Arquivo/Pasta | Função |
|:---|:---|
| `1_Skill_WorkFlow_Senior/` | Contrato de qualidade e workflow sênior (ADRs, regras de ouro) |
| `2_Documentacao_do_Sistema/` | Toda a documentação técnica e guias de operação |
| `3_Front_End/` | **Código de produção** — HTML, CSS, JS e APIs serverless |
| `4_Automacao_IA/` | Motor Editorial IA (Gemini) — Python isolado |
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
| `manifest.json` | Configuração PWA (instalação como app no celular) |
| `sw.js` | Service Worker — cache offline e estratégia de atualização |
| `editorial_feed.json` | Feed de notícias gerado pelo robô IA (Morning Call + Resumo do Dia) |
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
| `editorial-service.js` | Carrega e exibe o Morning Call / Resumo do Dia no front | `editorial_feed.json` |
| `news-service.js` | Módulo de notícias via RSS (com fallbacks) | RSS Feeds via CORS |
| `dictionary-service.js` | Pílulas de Conhecimento — dicionário financeiro educativo | Local + IA |
| `compliance-service.js` | Motor de compliance CVM 178 — valida linguagem e disclaimers | Regras locais |
| `buying-power.js` | Gráfico "O Real em 1994 vs Hoje" — perda de poder de compra | BCB SGS (Série 433) |
| `radar-service-test.js` | ⚠️ Arquivo de TESTE — NÃO vai para produção | — |

### API Serverless (`3_Front_End/api/`) — Vercel Functions

| Arquivo | Responsabilidade | Segurança |
|:---|:---|:---|
| `yahoo.js` | Proxy para Yahoo Finance (ações B3: PETR4, VALE3, ITUB4, IBOV) | Blinda CORS + esconde origem |
| `hg.js` | Proxy HG Brasil (backup, atualmente bypass via Domain-Lock ADR-010) | Chave protegida server-side |

---

## 🤖 4_Automacao_IA/ — Motor Editorial

| Arquivo | Responsabilidade |
|:---|:---|
| `editorial_engine.py` | Script principal: coleta RSS → Gemini → gera `editorial_feed.json` |
| `requirements.txt` | Dependências Python (google-generativeai, feedparser, etc.) |
| `.env` | 🔒 Chave `GEMINI_API_KEY` local (NUNCA subir ao Git) |
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
| `editorial-automation.yml` | Cron 08:30/18:00 BRT + Push + Manual | Roda `editorial_engine.py` → commit `editorial_feed.json` → deploy Vercel |
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

---
*Documentação criada em 03/04/2026 — Sessão de Estabilização.*
