# 📈 Trilha dos Juros - Simulador Financeiro Premium

[![Status](https://img.shields.io/badge/Status-Produção-success?style=for-the-badge)](https://trilhadosjuros.com.br)
[![Build](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge)](https://github.com/EricMacedo10/Trilha-dos-Juros/actions)
[![Tech](https://img.shields.io/badge/Vanilla-JS%20%2F%20CSS-yellow?style=for-the-badge)]()\
[![Commodities](https://img.shields.io/badge/Cotações-GitHub%20Gist%20Public-brightgreen?style=for-the-badge)]()

**Trilha dos Juros** é um terminal de inteligência financeira projetado para entregar precisão absoluta em simulações de renda fixa. Com uma interface inspirada em fintechs de elite (Faria Lima Style), o sistema combina matemática rigorosa com gamificação para retenção de usuários.

---

## 💎 Diferenciais Estratégicos

### 1. Precisão Matemática Impecável
Diferente de simuladores simplistas, nosso motor de cálculo (JS Nativo) processa:
- **Tabela Regressiva de IR:** Descontos automáticos de 22.5% a 15% conforme o prazo.
- **Calendário B3:** Cálculos baseados em 252 dias úteis para CDI.
- **Isenções Inteligentes:** Tratamento específico para LCI, LCA e Poupança.
- **Contraste Dinâmico:** Comparação em tempo real contra o benchmark da Poupança para gerar gatilhos de conversão.

### 2. Orquestração de Dados Resiliente (v14)
O sistema possui um motor de cotações automáticas com arquitetura em camadas:
- **Indicadores Oficiais:** Selic, CDI e IPCA (12 meses) sincronizados via API do **Banco Central do Brasil (SGS)**.
- **Ações B3 & Crypto:** PETR4, VALE3, ITUB4 e **Bitcoin (BTC-USD)** em tempo real.
- **Ticker Blindado:** Orquestração inteligente usando Yahoo Finance Proxy, HG Brasil e BrAPI.
- **Mercado Global (Commodities):** Gold, Silver e Petróleo Brent atualizados a cada 30 minutos via **GitHub Actions + Gist Público** (estratégia zero-FTP, arquitetura detalhada abaixo).

### 3. Gamificação: Jornada dos Depósitos
Uma ferramenta exclusiva de retenção (monetização via AdSense) que quebra metas financeiras em micro-etapas de depósitos crescentes (Progressão Aritmética), incentivando o retorno recorrente do usuário.

### 4. Notícias do Mercado em Tempo Real
Módulo de RSS classificado em 4 pilares (Geral, Empresas, Câmbio, Renda Fixa) servido via proxy PHP local (`/news-proxy.php`) na Hostinger, garantindo zero dependência de proxies públicos bloqueados (corsproxy.io).

---

## 🏗️ Arquitetura de Cotações de Commodities (Gist Strategy)

Esta é a arquitetura definitiva implementada para resolver a instabilidade do FTP da Hostinger:

```
[GitHub Actions - Cron a cada 30min]
         ↓
   scraper.py (Python)
   ├── AwesomeAPI → Gold, Silver (USD)
   └── Yahoo Finance API → Petróleo Brent (USD)
         ↓
   Gist Público do GitHub (cota_hoje.json)
   URL: gist.githubusercontent.com/EricMacedo10/{GIST_ID}/raw/cota_hoje.json
         ↓
   commodities.js (Front-end)
   └── fetch() direto do Gist → sem FTP, sem deploy, sem falhas
```

**Por que Gist e não GitHub Raw?** O repositório é privado. O GitHub Raw não serve arquivos de repositórios privados publicamente. O Gist é independente do repositório — é público e sempre acessível.

**Secret necessário:** `GIST_TOKEN` no GitHub Actions (PAT clássico com escopo `gist` apenas).

---

## 🛠️ Stack Tecnológica

- **Front-end:** Vanilla JavaScript (ES6+), CSS3 (Dark Mode Glassmorphism), HTML5 Semântico.
- **Gráficos:** Chart.js para visualização de rendimentos compostos.
- **Commodities Backend:** Python 3.10, `requests` (sem yfinance). APIs: AwesomeAPI + Yahoo Finance direto.
- **Publicação de Dados:** GitHub Gist público (atualização via API REST, autenticado por `GIST_TOKEN`).
- **Integrações:** BCB SGS, Yahoo Finance, AwesomeAPI, BrAPI.
- **DevOps:** CI/CD via GitHub Actions. Deploy FTP para Hostinger (ocasionalmente instável por timeout da Hostinger).
- **Proxy de Notícias:** PHP proxy local (`/news-proxy.php`) na Hostinger para RSS feeds.
- **Segurança:** Proteção contra XSS, CSRF e ocultação total de triggers de leads. Credenciais em GitHub Secrets.

---

## 🔐 Secrets do GitHub Actions

| Secret | Uso |
|---|---|
| `FTP_SERVER` | Servidor FTP da Hostinger para deploy |
| `FTP_USERNAME` | Usuário FTP da Hostinger |
| `FTP_PASSWORD` | Senha FTP da Hostinger |
| `GIST_TOKEN` | PAT clássico com escopo `gist` — usado pelo scraper para atualizar o Gist de cotações |

---

## 🚀 Como Visualizar
O projeto está em produção em: [trilhadosjuros.com.br](https://trilhadosjuros.com.br)

---

## 🖋️ Autoria
Desenvolvido sob o padrão **Skill Senior Workflow**, garantindo código limpo, escalável e focado em performance máxima.

---
© 2026 Trilha dos Juros. Todos os direitos reservados.
