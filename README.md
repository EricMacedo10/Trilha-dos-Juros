# 📈 Trilha dos Juros - Simulador Financeiro Premium

[![Status](https://img.shields.io/badge/Status-Produção-success?style=for-the-badge)](https://trilhadosjuros.com.br)
[![Build](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge)](https://github.com/EricMacedo10/Trilha-dos-Juros/actions)
[![Tech](https://img.shields.io/badge/Vanilla-JS%20%2F%20CSS-yellow?style=for-the-badge)]()

**Trilha dos Juros** é um terminal de inteligência financeira projetado para entregar precisão absoluta em simulações de renda fixa. Com uma interface inspirada em fintechs de elite (Faria Lima Style), o sistema combina matemática rigorosa com gamificação para retenção de usuários.

---

## 💎 Diferenciais Estratégicos

### 1. Precisão Matemática Impecável
Diferente de simuladores simplistas, nosso motor de cálculo (JS Nativo) processa:
- **Tabela Regressiva de IR:** Descontos automáticos de 22.5% a 15% conforme o prazo.
- **Calendário B3:** Cálculos baseados em 252 dias úteis para CDI.
- **Isenções Inteligentes:** Tratamento específico para LCI, LCA e Poupança.
- **Contraste Dinâmico:** Comparação em tempo real contra o benchmark da Poupança para gerar gatilhos de conversão.

### 2. Orquestração de Dados Resiliente (v13)
O sistema possui um motor de cotações automáticas com tripla camada de fallback:
- **Indicadores Oficiais:** Selic, CDI e IPCA (12 meses) sincronizados via API do **Banco Central do Brasil (SGS)**.
- **Ações B3 & Crypto:** PETR4, VALE3, ITUB4 e **Bitcoin (BTC-USD)** em tempo real.
- **Ticker Blindado:** Orquestração inteligente usando Yahoo Finance Proxy, HG Brasil e BrAPI para contornar restrições de CORS e Tokens.

### 3. Gamificação: Jornada dos Depósitos
Uma ferramenta exclusiva de retenção (monetização via AdSense) que quebra metas financeiras em micro-etapas de depósitos crescentes (Progressão Aritmética), incentivando o retorno recorrente do usuário.

---

## 🛠️ Stack Tecnológica

- **Front-end:** Vanilla JavaScript (ES6+), CSS3 (Dark Mode Glassmorphism), HTML5 Semântico.
- **Gráficos:** Chart.js para visualização de rendimentos compostos.
- **Integrações:** BCB SGS, Yahoo Finance, AwesomeAPI, BrAPI.
- **DevOps:** CI/CD via GitHub Actions para deploy atômico na Hostinger.
- **Segurança:** Proteção contra XSS, CSRF e ocultação total de triggers de leads.

---

## 🚀 Como Visualizar
O projeto está em produção em: [trilhadosjuros.com.br](https://trilhadosjuros.com.br)

---

## 🖋️ Autoria
Desenvolvido sob o padrão **Skill Senior Workflow**, garantindo código limpo, escalável e focado em performance máxima.

---
© 2026 Trilha dos Juros. Todos os direitos reservados.
