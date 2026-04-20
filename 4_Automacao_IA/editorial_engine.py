import os
import json
import feedparser
import requests
from openai import OpenAI
import socket
from datetime import datetime, timezone
from dotenv import load_dotenv

# Configuração de timeout global para evitar travamentos em feeds lentos
socket.setdefaulttimeout(10)

# Configurações do Ambiente
load_dotenv()

# Inicializa cliente DeepSeek (Provedor Único)
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")

deepseek_client = None
if DEEPSEEK_KEY:
    deepseek_client = OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com")
    print("-> DeepSeek configurado com sucesso.")
else:
    print("ERRO CRÍTICO: DEEPSEEK_API_KEY não encontrada! O motor editorial não funcionará.")

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
        if not text: return None
        # Tenta encontrar o JSON entre blocos de código markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        return json.loads(text.strip())
    except Exception as e:
        print(f"Erro ao extrair JSON: {e}")
        try:
            return json.loads(text.strip())
        except:
            return None

def ask_llm(prompt, system_prompt="Você é um assistente especializado em finanças."):
    """Chamada direta ao DeepSeek (Provedor Único)."""
    
    if not deepseek_client:
        print("   [IA] ERRO: Cliente DeepSeek não inicializado. Verifique a DEEPSEEK_API_KEY.")
        return None
    
    try:
        print("   [IA] Chamando DeepSeek (Reasoner Core)...")
        response = deepseek_client.chat.completions.create(
            model="deepseek-reasoner",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"   [IA] Falha no DeepSeek: {e}")
        return None

def generate_editorial(context, mode="morning"):
    """Gera o texto editorial respeitando as regras da CVM."""
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
    
    print(f"-> Gerando {tipo}...")
    
    system_prompt = "Você é um Editor Sênior de Finanças para a plataforma 'Trilha dos Juros'. Seu tom é sóbrio, analítico e profissional."
    
    prompt = f"""
    Sua missão é escrever um { tipo } ({subtitulo}) baseado nas seguintes notícias coletadas agora:
    
    {context}
    
    REGRAS CRÍTICAS DE COMPLIANCE E PRECISÃO FATUAL:
    1. Seja estritamente INFORMATIVO. 
    2. NUNCA use palavras como 'Recomendamos', 'Compre', 'Venda', 'Invista'.
    3. Evite adjetivos fortes como 'Espetacular', 'Terrível', 'Imperdível'.
    4. Mencione os fatos e deixe o investidor tirar suas próprias conclusões.
    5. Donald Trump É O ATUAL PRESIDENTE dos EUA (NUNCA O CITE COMO EX-PRESIDENTE). Aja sob esta premissa de forma natural.
    6. No final do texto, liste as fontes utilizadas de forma discreta.
    
    REQUISITOS DE FORMATAÇÃO:
    - Use HTML básico (<strong>, <p>, <ul>, <li>).
    - O título deve ser curto e impactante (máx 10 palavras).
    
    FORNEÇA O RESULTADO APENAS COMO JSON PURO NO SEGUINTE FORMATO:
    {{
      "title": "Título do artigo",
      "date": "{current_time}",
      "body": "Conteúdo em HTML"
    }}
    """
    
    response_text = ask_llm(prompt, system_prompt)
    return clean_json_response(response_text)

def generate_educational_pill(context):
    """Gera um termo financeiro educativo baseado no contexto das notícias (Termo do Dia)."""
    print("-> Gerando Pílula de Conhecimento...")
    
    system_prompt = "Você é um educador financeiro didático."
    
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
    
    response_text = ask_llm(prompt, system_prompt)
    return clean_json_response(response_text)

def main():
    print("[Senior Mode] Iniciando Motor Editorial DeepSeek...")
    
    if not deepseek_client:
        print("ABORTANDO: Sem cliente DeepSeek. Configure DEEPSEEK_API_KEY.")
        return
    
    # Caminho do feed (Baseado na localização do script para ser resiliente)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "..", "3_Front_End", "editorial_feed.json"))
    
    existing_data = {}
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            print("-> Feed existente carregado.")
        except Exception as e:
            print(f"-> Aviso: Erro ao carregar feed anterior: {e}")

    news_context = fetch_top_news()
    if not news_context:
        print("Aviso: Nenhuma notícia encontrada.")
        return

    current_utc_hour = datetime.now(timezone.utc).hour
    
    feed_data = {
        "morning": existing_data.get("morning"),
        "coffee": existing_data.get("coffee"),
        "evening": existing_data.get("evening"),
        "daily_term": existing_data.get("daily_term"),
        "last_update": datetime.now().isoformat()
    }

    # Turnos baseados em UTC
    if current_utc_hour < 13: # Morning Call
        print("-> Turno Detectado: MATUTINO")
        call = generate_editorial(news_context, mode="morning")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 08:30h")
            feed_data["morning"] = call
            
    elif 13 <= current_utc_hour < 17: # Coffee Break
        print("-> Turno Detectado: INTERMEDIÁRIO")
        call = generate_editorial(news_context, mode="coffee")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 12:00h")
            feed_data["coffee"] = call
            
    else: # Resumo do Dia
        print("-> Turno Detectado: VESPERTINO")
        call = generate_editorial(news_context, mode="evening")
        if call:
            call["date"] = datetime.now().strftime("%d/%m/%Y • 18:00h")
            feed_data["evening"] = call

    daily_term = generate_educational_pill(news_context)
    if daily_term:
        feed_data["daily_term"] = daily_term

    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! Feed atualizado via DeepSeek em: {output_path}")

if __name__ == "__main__":
    main()
