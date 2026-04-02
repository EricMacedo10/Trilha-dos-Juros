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
    for category, url in NEWS_SOURCES.items():
        try:
            feed = feedparser.parse(url)
            # Pega os 5 primeiros itens de cada fonte
            for entry in feed.entries[:5]:
                context.append(f"[{category}] {entry.title}: {entry.description if 'description' in entry else ''}")
        except Exception as e:
            print(f"Erro ao buscar notícias de {category}: {e}")
    return "\n".join(context)

def generate_editorial(context, mode="morning"):
    """Gera o texto editorial via Gemini respeitando as regras da CVM."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    current_time = datetime.now().strftime("%d de %B, %Y • %H:%Mh")
    
    prompt = f"""
    Você é um Editor Sênior de Finanças para a plataforma 'Trilha dos Juros'.
    Sua missão é escrever um { 'Morning Call' if mode == 'morning' else 'Resumo do Dia' } 
    baseado nas seguintes notícias coletadas agora:
    
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
    
    RETORNE UMA ESTRUTURA JSON COM:
    {{
      "title": "Título do artigo",
      "date": "{current_time}",
      "body": "Conteúdo em HTML"
    }}
    """
    
    response = model.generate_content(prompt)
    try:
        # Limpa possíveis formatações de markdown da resposta
        clean_text = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(clean_text)
    except Exception as e:
        print(f"Erro ao processar JSON da IA: {e}")
        return None

def generate_educational_pill(context):
    """Gera um termo financeiro educativo baseado no contexto das notícias (Termo do Dia)."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    Baseado nas seguintes notícias do mercado financeiro:
    
    {context}
    
    Identifique 1 (um) termo financeiro, econômico ou de mercado importante que apareceu ou está relacionado a essas notícias (ex: CDI, Inflação, Hawkish, Commodities, Risco Fiscal, etc).
    Sua tarefa é explicar esse termo para investidores iniciantes de forma clara, didática e sem jargões complexos.
    O tamanho da explicação deve estar entre 2 e 4 frases curtas.
    
    RETORNE UMA ESTRUTURA JSON COM:
    {{
      "term": "Termo Escolhido",
      "definition": "Explicação didática do termo."
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(clean_text)
    except Exception as e:
        print(f"Erro ao processar Pílula de Conhecimento: {e}")
        return None

def main():
    print("[Alpha] Iniciando Motor Editorial IA-Driven...")
    news_context = fetch_top_news()
    
    if not news_context:
        print("Aviso: Nenhuma notícia encontrada nas fontes RSS.")
        return

    # Gera Morning Call
    morning_call = generate_editorial(news_context, mode="morning")
    # Gera Resumo do Dia
    evening_call = generate_editorial(news_context, mode="evening")
    # Gera Pílula de Conhecimento (Termo do Dia)
    daily_term = generate_educational_pill(news_context)
    
    feed_data = {
        "morning": morning_call,
        "evening": evening_call,
        "daily_term": daily_term
    }
    
    # Salva no diretório do Front-End (Ambiente de Produção Oficial)
    output_path = os.path.join("..", "3_Front_End", "editorial_feed.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! Feed editorial gerado em: {output_path}")

if __name__ == "__main__":
    main()
