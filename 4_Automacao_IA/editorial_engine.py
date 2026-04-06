import os
import json
import feedparser
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# Configurações do Ambiente
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Fontes de Notícias RSS (Foco em Yahoo Finance e Investing.com)
NEWS_SOURCES = {
    "Brasil": "https://br.investing.com/rss/market_overview.rss",
    "Brasil_Yahoo": "https://br.financas.yahoo.com/rss",
    "Global_Yahoo": "https://finance.yahoo.com/rss/topstories",
    "Global_CNBC": "https://search.cnbc.com/rs/search/all/view.rss?partnerId=2000&keywords=finance",
    "Cripto": "https://www.coindesk.com/arc/outboundfeeds/rss/",
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
    tipo = "Morning Call" if mode == "morning" else "Resumo do Dia"
    
    print(f"-> Gerando {tipo} via Gemini...")
    
    prompt = f"""
    Você é um Editor Sênior de Finanças para a plataforma 'Trilha dos Juros'.
    Sua missão é escrever um { tipo } baseado nas seguintes notícias coletadas agora:
    
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
            "body": "<p>Houve uma falha técnica ao processar as notícias de hoje. Nossa equipe editorial já foi notificada.</p>"
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

    # Determina o turno baseado na hora UTC (GitHub Actions roda em UTC)
    # 08:30 BRT = 11:30 UTC | 18:00 BRT = 21:00 UTC
    # Usaremos 15:00 UTC (12:00 BRT) como divisor de águas
    current_utc_hour = datetime.utcnow().hour
    is_morning_shift = current_utc_hour < 15

    # Inicializa o novo feed com os dados antigos (Fallback)
    feed_data = {
        "morning": existing_data.get("morning"),
        "evening": existing_data.get("evening"),
        "daily_term": existing_data.get("daily_term"),
        "last_update": datetime.now().isoformat()
    }

    if is_morning_shift:
        print("-> Turno Detectado: MATUTINO (Morning Call)")
        morning_call = generate_editorial(news_context, mode="morning")
        if morning_call:
            morning_call["date"] = datetime.now().strftime("%d/%m/%Y • 08:30h")
            feed_data["morning"] = morning_call
    else:
        print("-> Turno Detectado: VESPERTINO (Resumo do Dia)")
        evening_call = generate_editorial(news_context, mode="evening")
        if evening_call:
            evening_call["date"] = datetime.now().strftime("%d/%m/%Y • 18:00h")
            feed_data["evening"] = evening_call

    # A Pílula de Conhecimento e o timestamp são atualizados em ambos os turnos
    daily_term = generate_educational_pill(news_context)
    if daily_term:
        feed_data["daily_term"] = daily_term
    
    # Salva o arquivo final combinado
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! Feed editorial ({'Morning' if is_morning_shift else 'Evening'}) sincronizado em: {output_path}")

if __name__ == "__main__":
    main()
