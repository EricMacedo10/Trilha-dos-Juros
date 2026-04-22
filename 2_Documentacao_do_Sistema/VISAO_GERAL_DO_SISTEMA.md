# Visão Geral do Sistema: Trilha dos Juros

## 1. O Propósito e a Identidade ("A Missão")
O projeto **"Trilha dos Juros"** é uma plataforma financeira estratégica (*web app* e *PWA*) desenvolvida na sua premissa para entregar muito mais que meras calculadoras. Ela foi concebida sob os seguintes pilares fundamentais:
*   **Matemática Financeira Impecável ("Resgate Exato"):** Oferecer aos usuários o valor real e líquido de seus investimentos, cravando as projeções de juros compostos, abatendo IOF e a Tabela Regressiva Tradicional de IR, com precisão absoluta nos rendimentos como CDI (base em 252 dias úteis).
*   **Design Premium ("Faria Lima" / Fintech):** Distanciar-se dos velhos formulários estáticos e aborrecidos e da UI engessada institucional, utilizando *Dark Mode* sofisticado, sliders intuitivos de neon, áreas analíticas e *Glassmorphism* moderno, gerando a sensação de "terminal de investimentos de elite".
*   **Máquina de Retenção e Monetização (AdSense):** Estruturado logicamente via SEO extremo e "Tráfego Recorrente". A grande revolução da "Trilha dos Juros" é gamificar a rotina financeira do brasileiro por meio de uma "**Jornada de Depósitos Dinâmica**" — onde o próprio usuário define sua Meta e Quantidade de Etapas, instigando-o a retornar religiosamente para bater metas personalizadas e garantindo um engajamento estrondoso nas visualizações (RPM/CPC).
*   **Autonomia com IA (Operações Zero-Toque):** Arquitetura "Self-Driving". O front-end puxa dados via orquestração de APIs (Yahoo Finance Proxy, Banco Central SGS), atualizando Tickers e indicadores financeiros (Selic, CDI, IPCA) de forma síncrona e resiliente, anulando a necessidade de manutenção manual.
*   **Hub Editorial IA Intraday:** Motor Python (Gemini/DeepSeek) gera 3 turnos editoriais autônomos (Morning Call → Coffee Break → Resumo do Dia) e um Calendário Econômico alimentado por dados reais. O sistema utiliza um **Proxy Local Server-side (`/api/news`)** para feeds RSS, eliminando dependências de proxies de terceiros instáveis.

## 2. A Arquitetura do Sistema
O sistema opera em uma estrutura ágil, blindada de gargalos, e otimizada unicamente para velocidade (Vitals) e escalabilidade.

### 2.1. O Front-end ("O Palco Principal")
*   **A "Interface Fintech":** SPA/PWA responsiva projetada Mobile-First. Construída para deslizar perfeitamente no toque do dedo do celular.
*   **Módulos de Cálculos:** O motor javascript nativo, isolado para proteger e executar centenas de iterações do simulador temporal de juros, com alternância de modelo Pós-Fixado (% CDI) e Pré-Fixado (% a.a.). 
*   **Motor Fantasma de Contraste:** O simulador roda uma via invisível permanente da Poupança para plotar o benchmark no Gráfico `Chart.js`, esfregando na cara do usuário (contraste visual) a ineficiência daquele modelo arcaico em contraponto ao CDB/LCI.

### 2.2. A Matemática (O Motor de Juros Compostos)
*   **Algoritmo de Conversão de Taxa Equivalente:** Conversão matemática exata (ao Ano <> ao Mês, e ao Dia Útil para CDI).
*   **Regras do Imposto de Renda Automáticas:** Parametrização estrita. Prazo selecionado => Gatilho imediato do desconto condicional correspondente (22.5%, 20%, 17.5%, 15%) em cima unicamente da variável de *Lucro Líquido*, ou anulação para Cestas Isentas.

### 2.3. Cibersegurança e Infraestrutura (A Nuvem Vercel Edge)
*   **Hospedagem Zero-Config Integrada (Vercel):** Frontend servido via CDN Global ultra-rápida. Subverte atritos antigos do FTP legados trazendo deploy em segundos sob Criptografia TLS padrão de fábrica.
*   **Backend Proxy First (API Functions):** O sistema isola chamadas propensas a falhas de CORS através de funções Node.js (`/api/tesouro`, `/api/news`, `/api/hg`). Isso blinda as chaves de API, garante estabilidade contra bloqueios de origem e permite processamento de dados brutos (como CSV do Tesouro) antes de chegar ao cliente.
*   **Serviço de Notícias Resiliente:** Módulo `news-service.js` busca RSS através de um **Backend Proxy Próprio (`api/news.js`)**. Isso blinda a aplicação contra o bloqueio de origens externas e garante que o *Service Worker* não interfira em requisições de mídia externas (YouTube), eliminando erros de rede.

### 2.4. Arquitetura de Dados Oficiais (Tesouro Direto)
*   **Fonte da Verdade:** Migração total para o portal oficial **Tesouro Transparente (Dados Abertos/CKAN API)**. O site consome dados brutos do governo, garantindo taxas reais e oficiais.
*   **Lógica Inteligente D-1:** Implementação de algoritmo de detecção automática do último dia útil fechado. O sistema "pula" feriados e fins de semana automaticamente para mostrar sempre a cotação oficial mais recente.
*   **Nuclear Safety Rendering:** Refatoração do motor de renderização do Tesouro com proteção contra dados malformados (null-checks e optional chaining), garantindo estabilidade total na UI.

## 3. Fluxo de Vida Prática de Uso
1.  **A Atração:** Usuário navega pelo celular atrás de "Quanto rende R$ 1000 na poupança?".
2.  **O Choque de UI:** Encontra o Painel do Tesouro com disclaimers claros sobre a fonte oficial e dados D-1, elevando a percepção de segurança.
3.  **A Retenção AdSense:** Descobre a ferramenta mágica de gamificação e retorna com frequência para preencher os *envelopes virtuais*.

## 4. O Marco de Evolução (Abr/2026)
1.  **Estabilização Tesouro 2.0:** Transição para API CKAN do governo e lógica de D-1. **[CONCLUÍDO]**
2.  **Proxy de Notícias Local:** Eliminação do AllOrigins em favor de `/api/news`. **[CONCLUÍDO]**
3.  **Transparência AdSense:** Injeção de disclaimers oficiais e conformidade de dados governamentais. **[CONCLUÍDO]**
4.  **Resiliência PWA:** Cache-busting (`v=26`) e Service Worker otimizado para mídia externa. **[CONCLUÍDO]**
