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

### 2.3. Cibersegurança e Infraestrutura (A Casamata)
*   **Hospedagem Hostinger / CDN Cache:** Implantação veloz com criptografia TLS 1.3 obrigatória, com redirecionamento forçado no servidor (`.htaccess` blindado).
*   **CI/CD Implacável via GitHub Actions:** Automação total do deploy. Todo código na branch main é validado e enviado automaticamente para a Hostinger, garantindo um ciclo de entrega contínuo e sem erros manuais de FTP.
*   **Orquestração de Dados (Ticker Blindado):** O sistema utiliza uma estratégia de camadas para cotações. Prioriza fontes robustas (Yahoo Finance via AllOrigins Proxy) e possui saltos automáticos para HG Brasil e BrAPI, garantindo que o letreiro nunca falhe por bloqueios de CORS ou tokens.
*   **Isolamento Analítico vs. Operacional:** Integração sutil mas pervasiva dos SDKs do Google AdSense (código das Tags) e Google Analytics sem travar as animações da simulação ou onerar a *Main Thread* do JS.

## 3. Fluxo de Vida Prática de Uso
1.  **A Atração:** Usuário navega pelo celular (via orgânico Google) atrás de "Quanto rende R$ 1000 na poupança?".
2.  **O Choque de UI:** Logo no hero section encontra a barra minimalista (Ticker) passando as cotações financeiras; ao ir para o Simulador, ele troca a via entre um CDI pós-fixado ou CDB pré-fixado usando *sliders* em verde neon, vendo instantaneamente o impacto da Tabela Regressiva contra a Poupança.
3.  **A Retenção AdSense:** Descobre a ferramenta mágica de gamificação (Jornada dos Depósitos). Configura sua própria meta e salva nos Favoritos, retornando com frequência para preencher os *envelopes virtuais*. Esse retorno contínuo expulsa a rejeição orgânica e clica involuntária e naturalmente nos banners altamente segmentados do Google. 

## 4. O Roadmap Imediato do Código (Status Atual)
1. Arquitetura unificada da Interface Inicial HTML/CSS principal (Foco no *Dark Mode Glass*). **[CONCLUÍDO]**
2. Construção Lógica do Módulo JS: Motor de Cálculos Misto (Calculadora Selic/CDI/Pré vs Poupança Dinâmica). **[CONCLUÍDO]**
3. Construção Lógica do Módulo JS: Máquina de Gamificação (Jornada de Depósitos por Progressão Aritmética). **[CONCLUÍDO]**
4. Inserção Segura e Responsiva dos Anúncios e Analytics. **[CONCLUÍDO]**
5. Refinamento de UX/UI Premium e Módulo de Contato Seguro (SGA / Ancord). **[CONCLUÍDO]**
6. Deploy Automático CI/CD na Produção via GitHub Actions. **[CONCLUÍDO]**
7. Integração de Bitcoin (BTC-USD) e Orquestração de Dados Resiliente (v13). **[CONCLUÍDO]**
