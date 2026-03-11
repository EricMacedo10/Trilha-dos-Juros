# 📈 Trilha dos Juros - Simulador Financeiro Premium

[![Status](https://img.shields.io/badge/Status-Produção-success?style=for-the-badge)](https://trilhadosjuros.com.br)
[![Build](https://img.shields.io/badge/CI%2FCD-Vercel%20Edge-black?style=for-the-badge)](https://vercel.com)
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

### 2. Orquestração de Dados Resiliente (Vercel Serverless)
O sistema possui um motor de cotações automáticas totalmente Serverless (Zero PHP, zero FTP):
- **Indicadores Oficiais:** Selic, CDI e IPCA (12 meses) sincronizados diretamente com a API do **Banco Central do Brasil (SGS)** nativamente via CORS.
- **Ações B3:** PETR4, VALE3, ITUB4 e IBOVESPA roteados a prova de balas por uma **Vercel Serverless Function** secreta (`api/yahoo.js`), blindada de bloqueios de IP proxy da AWS.
- **Moedas & Crypto:** Dolar, Euro e Bitcoin via integração na AwesomeAPI Brasileira.
- **Mercado Global (Commodities):** Gold e Silver atualizados via Python Scraper salvos em um **GitHub Gist Público**, alimentando o Frontend com Zero FTP timeouts.

### 3. Gamificação: Jornada dos Depósitos
Uma ferramenta exclusiva de retenção (monetização via AdSense) que quebra metas financeiras em micro-etapas de depósitos crescentes (Progressão Aritmética), incentivando o retorno recorrente do usuário.

---

## 🏗️ Arquitetura de Deploy Mística (Edge Cloud)

Esta arquitetura finalizou a instabilidade raiz de FTP de servidores base, migrando todo o ecossistema para a Vercel Global Edge Network.

```
[GitHub - Branch Main]
          ↓
    Git Push (Automatic Trigger)
          ↓
    Vercel Edge Build
    ├── Roteamento de Frontend Estático (index.html, JS, CSS) em CDN Global
    └── Compilação do Backend (Node.js) para a Serverless Function (/api/yahoo)
          ↓
    Deploy Automático com SSL Let's Encrypt Zero-Toque Ativado
```

---

## 🛠️ Stack Tecnológica

- **Front-end:** Vanilla JavaScript (ES6+), CSS3 (Dark Mode Glassmorphism), HTML5 Semântico.
- **Backend (Edge):** Node.js em Vercel Serverless Functions (`api/yahoo.js`).
- **Gráficos:** Chart.js para visualização de rendimentos compostos.
- **Commodities Pipeline:** Python 3.10 via Workflows rodando apenas via cache Gist.
- **DevOps:** CI/CD contínuo integrado pelo Webhook do GitHub com a Vercel. Nada de FTP legados ou painel CPanel hostinger.
- **Segurança:** Proteção absoluta XSS, DDoS Nativo pela Cloudflare/Vercel. Ausência de bancos de dados hackeáveis. 

---

## 🔐 Gestão de Credenciais (Cybersecurity)

O projeto foi auditado e configurado para arquitetura **Clean-Secret**.
- **Não há conexões expostas** de Banco de dados nos arquivos JS/HTML.
- Os Tokens vitais como `GIST_TOKEN` ou arquivos `.env` do robô de Python devem residir exclusivamente nas *Action Secrets* do GitHub (Vault Restrito), garantindo que varreduras automatizadas no repositório nunca apontarão exploits.
- Tokens de monitoramento como rastreamento Google (Analytics / AdSense pub) rodam abertamente no Front, como em toda a arquitetura web do mundo, sem expor o painel matriz ao usuário.

---

## 🚀 Como Visualizar
O projeto está em produção máxima blindada em: [trilhadosjuros.com.br](https://trilhadosjuros.com.br)

---

## 🖋️ Autoria
Desenvolvido sob o padrão **Skill Senior Workflow**, cruzando Design Premium PWA com infraestrutura de Banco Digital Resiliente.

---
© 2026 Trilha dos Juros. Todos os direitos reservados.
