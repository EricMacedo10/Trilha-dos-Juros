# Mapa de Arquivos: Trilha dos Juros (Abril/2026)

Este mapa descreve a hierarquia e a função de cada componente vital do sistema para garantir manutenção rápida e escalabilidade.

## 1. Núcleo Front-End (`/3_Front_End`)
O "coração" visível da plataforma. Focado em performance e UX.

*   `index.html`: Página principal, integrando simuladores e Hub Editorial.
*   `cabeca.html`: **[NOVO]** Dashboard Holográfico Jarvis (Admin Only / Localhost).
*   `hg.json`: Backup local de dados de mercado (Sync automático via GitHub Actions).
*   `editorial_feed.json`: Conteúdo dinâmico gerado por IA (Calls de Mercado).
*   `radar_data.json`: Calendário econômico extraído por IA.
*   **`/js`**: Camada de lógica.
    *   `ticker.js`: Motor da barra flutuante (60fps).
    *   `market-global-service.js`: Consumo e renderização de dados HG Brasil.
    *   `news-service.js`: Integrador de notícias RSS.
    *   `sw.js`: Service Worker (PWA) para cache offline e performance.
*   **`/api`**: Endpoints Serverless (Vercel Functions).
    *   `tesouro.js`: Ponte oficial para o Tesouro Transparente (D-1 Detection).
    *   `news.js`: Proxy local para feeds de notícias (Bypass CORS).
    *   `hg.js`: Proxy de proteção para chaves HG Brasil.
*   **`/css`**: Design System.
    *   `estilo.css`: Tokens de design, glassmorphism e cores neon.
*   **`/img`**: Assets visuais.
    *   `brain_bg.png`: **[NOVO]** Background orgânico da interface IA.

## 2. Automação e Inteligência (`/4_Automacao_IA`)
O "cérebro" invisível que alimenta o portal.

*   `update_market_data.py`: **[NOVO]** Sincronizador real-time com HG Brasil (Otimizado).
*   `editorial_engine.py`: Motor DeepSeek que redige os boletins diários.
*   `radar_engine.py`: Extrator de eventos econômicos via Firecrawl (Investing.com).
*   `cabeca_brain.py`: **[NOVO]** Servidor de processamento neural e monitoramento Sentinela.
*   `requirements.txt`: Dependências Python (requests, python-dotenv, flask/http).

## 3. Infraestrutura CI/CD (`/.github/workflows`)
Orquestração de nuvem e robôs de manutenção.

*   `atualizar_mercado_hg.yml`: **[NOVO]** Robô que atualiza o mercado a cada 15m.
*   `editorial-automation.yml`: Publicador automático dos boletins de IA.
*   `radar-automation.yml`: Extrator automático de eventos macro.
*   `update_prices.yml`: Scraper de commodities (Ouro/Petróleo).

## 4. Documentação (`/2_Documentacao_do_Sistema`)
*   `VISAO_GERAL_DO_SISTEMA.md`: Manual de arquitetura e propósitos.
*   `GUIA_CABECA_IA_JARVIS.md`: **[NOVO]** Manual de uso da interface de voz e monitoramento.
*   `MAPA_DE_ARQUIVOS.md`: Este guia de referência.

## 5. Protocolos de Segurança Sênior (`Cyber-Defense`)
*   **Identidade em Nuvem**: Commits assinados exclusivamente pelo `EricMacedo10` para garantir validação de deploy Vercel e integridade de autoria.
*   **Proteção de Segredos**: Uso de *GitHub Secrets* para chaves de IA (DeepSeek/Firecrawl) e Tokens de Gist.
*   **Sanitização de Código**: Bloqueio de qualquer dado sensível em arquivos `.md` ou `.json` públicos (ADR-014).

---
**Ultima Auditoria:** 23 de Abril de 2026.
*Status: Sistema Blindado, Cache v2 Ativo e 100% Sincronizado.*
