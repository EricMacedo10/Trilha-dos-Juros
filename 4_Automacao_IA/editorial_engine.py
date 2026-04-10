import os
import json
import feedparser
import google.generativeai as genai
import socket
from datetime import datetime
from dotenv import load_dotenv

# Configuração de timeout global para evitar travamentos em feeds lentos
socket.setdefaulttimeout(10)

# Configurações do Ambiente
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Fontes de Notícias RSS (Foco em Yahoo Finance e Investing.com)
NEWS_SOURCES = {
    "Brasil": "https://br.investing.com/rss/market_overview.rss",
    "Brasil_Yahoo": "https://br.financas.yahoo.com/rss",
    "Global_Yahoo": "https://finance.yahoo.com/rss/topstories",
    "Commodities": "https://br.investing.com/rss/stock_Commodities.rss"
}

def fetch_top_news():
    """Busca as principais notícias de cada fonte."""
    context = []
    print(f"-> Coletando notícias de {len(NEWS_SOURCES)} fontes...")
    for category, url in NEWS_SOURCES.items():
        try:
            print(f"   - Buscando: {category}")
            feed = feedparser.parse(url)
            # Pega os 5 primeiros itens de cada fonte
            if feed.entries:
                for entry in feed.entries[:5]:
                    context.append(f"[{category}] {entry.title}: {entry.description if 'description' in entry else ''}")
            else:
                print(f"     ! Feed vazio: {category}")
        except Exception as e:
            print(f"     ! Erro em {category}: {e}")
    return "\n".join(context)

def clean_json_response(text):
    """Extrai e limpa o JSON da resposta da IA de forma robusta."""
    try:
        # Tenta encontrar o JSON entre blocos de código markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        return json.loads(text.strip())
    except Exception as e:
        print(f"Erro ao extrair JSON: {e}")
        # Fallback: tenta carregar o texto bruto se nada mais funcionar
        try:
            return json.loads(text.strip())
        except:
            return None

def generate_editorial(context, mode="morning"):
    """Gera o texto editorial via Gemini respeitando as regras da CVM."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    current_time = datetime.now().strftime("%d de %B, %Y • %H:%Mh")
    
    if mode == "morning":
        tipo = "Morning Call"
        subtitulo = "preparando a abertura do mercado"
    elif mode == "coffee":
        tipo = "Coffee Break"
        subtitulo = "o que aconteceu até o meio-dia"
    else:
        tipo = "Resumo do Dia"
        subtitulo = "fechamento e principais movimentos"
    
    print(f"-> Gerando {tipo} via Gemini...")
    
    prompt = f"""
    Você é um Editor Sênior de Finanças para a plataforma 'Trilha dos Juros'.
    Sua missão é escrever um { tipo } ({subtitulo}) baseado nas seguintes notícias coletadas agora:
    
    {context}
    
    REGRAS CRÍTICAS DE COMPLIANCE (CVM):
    1. Seja estritamente INFORMATIVO. 
    2. NUNCA use palavras como 'Recomendamos', 'Compre', 'Venda', 'Invista'.
    3. Evite adjetivos fortes como 'Espetacular', 'Terrível', 'Imperdível'.
    4. Mencione os fatos e deixe o investidor tirar suas próprias conclusões.
    5. No final do texto, liste as fontes utilizadas de forma discreta.
    
    REQUISITOS DE FORMATAÇÃO:
    - Use HTML básico (<strong>, <p>, <ul>, <li>).
    - Mantenha o tom sóbrio, analítico e profissional.
    - O título deve ser curto e impactante (máx 10 palavras).
    
    FORNEÇA O RESULTADO APENAS COMO JSON PURO NO SEGUINTE FORMATO:
    {{
      "title": "Título do artigo",
      "date": "{current_time}",
      "body": "Conteúdo em HTML"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Erro na chamada Gemini ({mode}): {e}")
        return {
            "title": f"{tipo} Temporariamente Indisponível",
            "date": current_time,
            "body": f"<p>Houve uma falha técnica ao processar o {tipo}. Nossa equipe editorial já foi notificada.</p>"
        }

def generate_educational_pill(context):
    """Gera um termo financeiro educativo baseado no contexto das notícias (Termo do Dia)."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    print("-> Gerando Pílula de Conhecimento via Gemini...")
    
    prompt = f"""
    Baseado nas seguintes notícias do mercado financeiro:
    
    {context}
    
    Identifique 1 (um) termo financeiro, econômico ou de mercado importante que apareceu ou está relacionado a essas notícias.
    Sua tarefa é explicar esse termo para investidores iniciantes de forma clara e didática.
    
    FORNEÇA O RESULTADO APENAS COMO JSON PURO NO SEGUINTE FORMATO:
    {{
      "term": "Termo Escolhido",
      "definition": "Explicação didática do termo (2 a 4 frases)."
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Erro na chamada Gemini (Pílula): {e}")
        return {
            "term": "CDI",
            "definition": "O Certificado de Depósito Interbancário é a taxa que os bancos cobram para emprestar dinheiro entre si. É a principal referência para o rendimento da renda fixa."
        }

def generate_economic_calendar(context):
    """Gera uma lista de 5 eventos econômicos de alto impacto no novo modelo de 5 colunas."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    current_month = datetime.now().strftime("%B de %Y")
    print("-> Gerando Agenda Econômica (5 Colunas) via Gemini...")
    
    prompt = f"""
    Baseado nas notícias recentes ({context}) e no seu conhecimento atual (Hoje é {current_month}):
    
    Identifique os 5 PRÓXIMOS eventos econômicos de maior impacto para o investidor de renda fixa no Brasil (Misture Brasil e EUA).
    
    PARA CADA EVENTO, PREENCHA O JSON COM:
    1. country: use 'br' ou 'us'.
    2. date: formato DD/MM.
    3. time: formato HH:MM (horário estimado).
    4. event: nome curto do indicador.
    5. impact: High, Medium ou Low.
    6. atual: sempre use "---" (será preenchido em tempo real dps). 
    7. proj: valor projetado pelo mercado (ex: 0.5%, 10.75%, 200k) - estimativa baseada nas notícias.
    8. prev: valor anterior (ex: 0.8%, 11.25%, 250k).

    FORNEÇA O RESULTADO APENAS COMO JSON PURO NO SEGUINTE FORMATO:
    {{
      "events": [
        {{ 
          "date": "DD/MM", 
          "time": "HH:MM", 
          "country": "br", 
          "event": "Nome", 
          "impact": "High", 
          "atual": "---", 
          "proj": "0.5%", 
          "prev": "0.6%" 
        }},
        ... 100% fiel a este esquema.
      ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Erro na chamada Gemini (Agenda 2.0): {e}")
        return {
            "events": [
                { "date": "Amanhã", "time": "09:00", "country": "br", "event": "Abertura do Mercado", "impact": "Medium", "atual": "---", "proj": "---", "prev": "---" }
            ]
        }

def main():
    print("[Alpha] Iniciando Motor Editorial IA-Driven...")
    
    # Caminho do feed (Ambiente de Produção Oficial)
    output_path = os.path.join("..", "3_Front_End", "editorial_feed.json")
    
    # Tenta carregar o estado anterior para não apagar o conteúdo que não será atualizado
    existing_data = {}
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            print("-> Feed existente carregado com sucesso.")
        except Exception as e:
            print(f"-> Aviso: Não foi possível carregar o feed anterior: {e}")

    news_context = fetch_top_news()
    if not news_context:
        print("Aviso: Nenhuma notícia encontrada nas fontes RSS.")
        return

    # Turnos baseados em UTC (08:30 BRT = 11:30 UTC | 12:00 BRT = 15:00 UTC | 18:00 BRT = 21:00 UTC)
    current_utc_hour = datetime.utcnow().hour
    
    # Inicializa o novo feed com os dados antigos (Merge)
    feed_data = {
        "morning": existing_data.get("morning"),
        "coffee": existing_data.get("coffee"),
        "evening": existing_data.get("evening"),
        "daily_term": existing_data.get("daily_term"),
        "economic_calendar": existing_data.get("economic_calendar"),
        "last_update": datetime.now().isoformat()
    }

    if current_utc_hour < 13: # Antes das 10h BRT
        print("-> Turno Detectado: MATUTINO (Morning Call)")
        call = generate_editorial(news_context, mode="morning")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 08:30h")
            feed_data["morning"] = call
            
    elif 13 <= current_utc_hour < 17: # Entre 10h e 14h BRT
        print("-> Turno Detectado: INTERMEDIÁRIO (Coffee Break)")
        call = generate_editorial(news_context, mode="coffee")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 12:00h")
            feed_data["coffee"] = call
            
    else: # Após as 14h BRT
        print("-> Turno Detectado: VESPERTINO (Resumo do Dia)")
        call = generate_editorial(news_context, mode="evening")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 18:00h")
            feed_data["evening"] = call

    # Atualizações globais (Termo e Agenda) em cada run
    daily_term = generate_educational_pill(news_context)
    if daily_term:
        feed_data["daily_term"] = daily_term

    economic_calendar = generate_economic_calendar(news_context)
    if economic_calendar:
        feed_data["economic_calendar"] = economic_calendar
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! Processamento sincronizado em: {output_path}")

if __name__ == "__main__":
    main()
