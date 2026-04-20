# Guia de Operação: CABEÇA v3.0 (Jarvis Protocol)

Bem-vindo ao centro de comando tático da Trilha dos Juros. Este documento descreve como operar, manter e expandir sua assistente inteligente.

## 1. Como Iniciar a Operação
A "Cabeça" funciona através de um link neural entre o seu navegador e o seu servidor local.

1.  **Inicie o Cérebro:** No terminal, execute:
    ```bash
    python 4_Automacao_IA/cabeca_brain.py
    ```
2.  **Inicie a Interface:** Abra o arquivo `3_Front_End/cabeca.html` no seu navegador (recomendado: porta 5500 via Live Server).

## 2. Comandos de Voz Táticos
A Cabeça utiliza a DeepSeek AI para processar diretivas. Você pode conversar naturalmente. Exemplos:
- *"Jarvis, qual a situação do mercado agora?"*
- *"Como estão as nossas taxas Selic e CDI?"*
- *"Qual o próximo evento de alto impacto?"*

## 3. Modo Sentinela (Vigilância Ativa)
A Cabeça monitora o portal oficial (`trilhadosjuros.com.br`) a cada 5 minutos.
- **Estado Nominal:** Cérebro pulsando em Azul. LOG indica latência do servidor.
- **Estado de Alerta:** Cérebro pulsando em Vermelho.
- **Gatilhos de Alerta:** 
    - Site offline (HTTP != 200).
    - Dados estagnados por mais de 45 minutos em horário comercial (09:00 - 19:00 BRT).

## 4. Arquitetura de Inteligência
- **IA:** DeepSeek Chat (v1).
- **Voz:** Web Speech API integrada (Pitch e Rate ajustados para estilo robótico).
- **Dados:** A Cabeça lê os arquivos `hg.json`, `editorial_feed.json` e `radar_data.json` localmente para ter contexto real do que está no site.

## 5. Manutenção e Segurança
- **API Keys:** Armazenadas de forma segura no servidor Python. Nunca exponha as chaves no código HTML.
- **Estética:** Baseada em Three.js (Point-cloud organic brain) e Holographic HUD.

---
**DIRETIVA PRIMÁRIA:** Proteger a autoridade do portal e servir ao Eric.
