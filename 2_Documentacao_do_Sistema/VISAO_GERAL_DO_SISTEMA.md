# Visão Geral do Sistema: Trilha dos Juros

## 1. O Propósito e a Identidade ("A Missão")
O projeto **"Trilha dos Juros"** é uma plataforma financeira estratégica (*web app* e *PWA*) desenvolvida na sua premissa para entregar muito mais que meras calculadoras. Ela foi concebida sob os seguintes pilares fundamentais:
*   **Matemática Financeira Impecável ("Resgate Exato"):** Oferecer aos usuários o valor real e líquido de seus investimentos, cravando as projeções de juros compostos, abatendo IOF e a Tabela Regressiva Tradicional de IR, com precisão absoluta nos rendimentos como CDI (base em 252 dias úteis).
*   **Design Premium ("Faria Lima" / Fintech):** Distanciar-se dos velhos formulários estáticos e aborrecidos e da UI engessada institucional, utilizando *Dark Mode* sofisticado, sliders intuitivos de neon, áreas analíticas e *Glassmorphism* moderno, gerando a sensação de "terminal de investimentos de elite".
*   **Máquina de Retenção e Monetização (AdSense):** Estruturado logicamente via SEO extremo e "Tráfego Recorrente". A grande revolução da "Trilha dos Juros" é gamificar a rotina financeira do brasileiro por meio de uma "**Jornada de Depósitos Dinâmica**" — onde o próprio usuário define sua Meta e Quantidade de Etapas, instigando-o a retornar religiosamente para bater metas personalizadas e garantindo um engajamento estrondoso nas visualizações (RPM/CPC).
*   **Autonomia com IA (Operações Zero-Toque):** Arquitetura "Self-Driving". O front-end puxa dados via orquestração de APIs (Yahoo Finance Proxy, Banco Central SGS), atualizando Tickers e indicadores financeiros (Selic, CDI, IPCA) de forma síncrona e resiliente, anulando a necessidade de manutenção manual.

## 2. A Arquitetura do Sistema
O sistema opera em uma estrutura ágil, blindada de gargalos, e otimizada unicamente para velocidade (Vitals) e escalabilidade.

### 2.1. O Front-end ("O Palco Principal")
*   **A "Interface Fintech":** SPA/PWA responsiva projetada Mobile-First. Construída para deslizar perfeitamente no toque do dedo do celular.
*   **Módulos de Cálculos:** O motor javascript nativo, isolado para proteger e executar centenas de iterações do simulador temporal de juros, com alternância de modelo Pós-Fixado (% CDI) e Pré-Fixado (% a.a.). 
*   **Motor Fantasma de Contraste:** O simulador roda uma via invisível permanente da Poupança para plotar o benchmark no Gráfico `Chart.js`, esfregando na cara do usuário (contraste visual) a ineficiência daquele modelo arcaico em contraponto ao CDB/LCI.
*   **A Jornada Gamificada:** Área interativa persistida localmente (`localStorage`) que quebra uma Meta Financeira gigante em depósitos menores via Progressão Aritmética, gerando *envelopes* clicáveis.
*   **Captação Institucional de Leads:** Módulo de contato em formato *Glassmorphism* com integração fluida ao Gmail/App Padrão, escorando-se na autoridade da Ancord e SGA Invest, focado em conversão livre da fricção de formulários longos.

### 2.2. A Matemática (O Motor de Juros Compostos)
*   **Algoritmo de Conversão de Taxa Equivalente:** Conversão matemática exata (ao Ano <> ao Mês, e ao Dia Útil para CDI).
*   **Regras do Imposto de Renda Automáticas:** Parametrização estrita. Prazo selecionado => Gatilho imediato do desconto condicional correspondente (22.5%, 20%, 17.5%, 15%) em cima unicamente da variável de *Lucro Líquido*, ou anulação para Cestas Isentas.
*   **Composição Mista:** Adição progressiva (Aportes Regulares) submetidos a prazos de vida útil diferentes.  

### 2.3. Cibersegurança e Infraestrutura (A Nuvem Vercel Edge)
*   **Hospedagem Zero-Config Integrada (Vercel):** Frontend servido via CDN Global ultra-rápida. Subverte atritos antigos do FTP legados (como delays de Hostinger) trazendo deploy em segundos sob Criptografia TLS Let's Encrypt padrão de fábrica.
*   **Backend Oculto (Serverless):** O sistema isola chamadas propensas a bloqueio corporativo (como a rota do Yahoo Finance) através de uma **função Cloud Node.js** engavetada (`/api/yahoo.js`). Isso blinda o app de proxies não confiáveis e falhas de CORS sem abrir o código-fonte ao público.
*   **Orquestração de Dados (Ticker Blindado V22):** A integração da barra infinita flutuante (60fps) consulta dados em *pure vanilla DOM Mutation* direto do Banco Central Brasileiro (SGS) em tempo real absoluto, somado às bolsas e criptos na Awesome API.
*   **Serviço de Notícias Resiliente:** Módulo `news-service.js` busca RSS de portais verificáveis sem engasgar o rendering nativo usando instâncias CORS abertas e fallbacks amigáveis ao invés de proxies locais obsoletos (PHP extirpado).

### 2.4. Arquitetura de Commodities — "Gist Strategy" (A Grande Muralha)
*   **Problema Resolvido:** O antigo deploy exigia dependência instável de pipelines FTP lentos que resultavam em `Timeout`.
*   **Solução Definitiva:** O front-end (`commodities.js`) exibe as commodities valiosas lendo as cotações perfeitamente de um **Gist Público do GitHub**, preenchido em *background* silencioso a cada 1 hora via GitHub Actions e `scraper.py`, isolando a plataforma de qualquer gargalos de taxa de requisição e blindando o front contra quebras de API Profissionais.

## 3. Fluxo de Vida Prática de Uso
1.  **A Atração:** Usuário navega pelo celular (via orgânico Google) atrás de "Quanto rende R$ 1000 na poupança?".
2.  **O Choque de UI:** Logo no hero section encontra a barra minimalista (Ticker) passando as cotações financeiras; ao ir para o Simulador, ele troca a via entre um CDI pós-fixado ou CDB pré-fixado usando *sliders* em verde neon, vendo instantaneamente o impacto da Tabela Regressiva contra a Poupança.
3.  **A Retenção AdSense:** Descobre a ferramenta mágica de gamificação (Jornada dos Depósitos). Configura sua própria meta e salva nos Favoritos, retornando com frequência para preencher os *envelopes virtuais*. Esse retorno contínuo expulsa a rejeição orgânica e clica involuntária e naturalmente nos banners altamente segmentados do Google. 

## 4. O Marco de Evolução Vercel (Mar/2026)
1.  **Arquitetura unificada HTML/CSS** (Foco no *Dark Mode Glass*) **[CONCLUÍDO]**
2.  **Deploy Automático CI/CD** direto para a Nuvem Edge Serverless da Vercel. **[CONCLUÍDO]**
3.  **Motor de Cotações de Commodities e Moedas** via Scraper Python + GIST Action. **[CONCLUÍDO]**
4.  **Modernização Estética & Gamificação:** Integração de vídeo 3D de alta fidelidade na Jornada dos Depósitos, contadores animados (KPIs) e efeitos neon de profundidade no simulador. **[NOVO - MAR/26]**
5.  **Segurança Master:** Migração de chaves HG Brasil para Serverless Proxy (`/api/hg.js`), eliminando chaves expostas no código. **[NOVO - MAR/26]**
6.  **Auditoria Técnica:** Correção de bugs de interface (tooltip clipping) e adesão total ao padrão *Senior Workflow*. **[CONCLUÍDO]**
