import os
import json
import feedparser
import google.generativeai as genai
from openai import OpenAI
import socket
from datetime import datetime
from dotenv import load_dotenv

# Configuração de timeout global para evitar travamentos em feeds lentos
socket.setdefaulttimeout(10)

# Configurações do Ambiente
load_dotenv()

# Inicializa clientes de IA
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

deepseek_client = None
if DEEPSEEK_KEY:
    deepseek_client = OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com")
    print("-> DeepSeek configurado como provedor principal.")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    print("-> Gemini configurado como provedor de backup.")

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
    """Orquestrador de IA: Tenta DeepSeek primeiro, cai para Gemini se falhar."""
    
    # Tentativa 1: DeepSeek (Custo-Benefício e Estabilidade)
    if deepseek_client:
        try:
            print("   [IA] Chamando DeepSeek...")
            response = deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"   [IA] Falha no DeepSeek: {e}")

    # Tentativa 2: Gemini (Backup)
    if GEMINI_KEY:
        try:
            print("   [IA] Chamando Gemini (Backup)...")
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(f"{system_prompt}\n\n{prompt}")
            return response.text
        except Exception as e:
            print(f"   [IA] Falha no Gemini: {e}")

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
    
    REGRAS CRÍTICAS DE COMPLIANCE (CVM):
    1. Seja estritamente INFORMATIVO. 
    2. NUNCA use palavras como 'Recomendamos', 'Compre', 'Venda', 'Invista'.
    3. Evite adjetivos fortes como 'Espetacular', 'Terrível', 'Imperdível'.
    4. Mencione os fatos e deixe o investidor tirar suas próprias conclusões.
    5. No final do texto, liste as fontes utilizadas de forma discreta.
    
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

def generate_economic_calendar(context):
    """Gera uma lista de 5 eventos econômicos de alto impacto utilizando dados reais da semana."""
    current_month = datetime.now().strftime("%B de %Y")
    
    print("-> Gerando Agenda Econômica (5 Colunas)...")
    
    # Busca o calendário real da semana via API aberta
    real_calendar_text = "Nenhum evento global carregado."
    try:
        url = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
        headers = {'User-Agent': 'TrilhaDosJuros/1.0'}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            # Filtragem inteligente: Remover eventos passados
            from datetime import datetime
            today_str = datetime.now().strftime("%Y-%m-%d")
            
            events = response.json()
            future_events = []
            for e in events:
                e_date = e.get('date', '')[:10] # Formato YYYY-MM-DD
                if e_date >= today_str and e.get('impact') in ['High', 'Medium'] and e.get('country') in ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'BRL', 'CAD']:
                    future_events.append(e)
            
            lines = []
            # Se tivermos poucos eventos hoje/futuro, pegamos os últimos do passado para completar 8 opções para a IA
            if len(future_events) < 5:
                # Pega os eventos da semana inteira que são High/Medium
                all_valid = [e for e in events if e.get('impact') in ['High', 'Medium']]
                # Se hoje é sexta, o início da lista tem muita coisa velha. 
                # Vamos pegar os 10 mais próximos da data de hoje (mesmo que um pouco antes)
                lines = []
                for e in all_valid: # Aqui all_valid já está em ordem cronológica por padrão da API
                    e_date = e.get('date', '')[:10]
                    lines.append(f"- País: {e.get('country')} | Data: {e_date} | Evento: {e.get('title')} | Proj: {e.get('forecast')} | Ant: {e.get('previous')}")
                # Pegamos os 15 mais recentes (os últimos da lista costumam ser o final da semana)
                lines = lines[-15:] 
            else:
                for e in future_events[:10]:
                    e_date = e.get('date', '')[:10]
                    lines.append(f"- País: {e.get('country')} | Data: {e_date} | Evento: {e.get('title')} | Proj: {e.get('forecast')} | Ant: {e.get('previous')}")
            
            if lines:
                real_calendar_text = "\n".join(lines)
    except Exception as e:
        print(f"Aviso: Não foi possível carregar calendário real externo: {e}")
    
    system_prompt = "Você é um analista de dados macroeconômicos."
    
    prompt = f"""
    Hoje é {current_month}. Recebemos os seguintes eventos reais da agenda global desta semana:
    
    {real_calendar_text}
    
    Notícias recentes:
    {context}
    
    Sua tarefa é selecionar os 5 eventos mais impactantes para um investidor no Brasil, PRIORIZANDO eventos que ocorram HOJE ({datetime.now().strftime("%d/%m")}) ou nos próximos dias.
    1. Ignore eventos que já passaram (datas anteriores a hoje), a menos que não existam eventos futuros suficientes para completar a lista de 5.
    2. Utilize obrigatoriamente os eventos globais listados acima (traduzindo os títulos para Português).
    3. Se você encontrar nas "Notícias recentes" algum evento importante do Brasil (Copom, IPCA, IBC-Br, etc) para a semana, inclua-o também.
    4. NUNCA invente datas fictícias. Restrinja-se à agenda real passada acima.
    
    PARA CADA EVENTO, PREENCHA O JSON COM:
    1. country: use 'br' ou 'us' ou 'eu' (baseado no país do evento original).
    2. date: formato DD/MM.
    3. time: formato HH:MM ou 'Dia Todo'.
    4. event: nome curto do indicador em Português.
    5. impact: High, Medium ou Low.
    6. atual: sempre use "---". 
    7. proj: valor projetado (da agenda real).
    8. prev: valor anterior (da agenda real).

    FORNEÇA O RESULTADO APENAS COMO JSON PURO NO SEGUINTE FORMATO:
    {{
      "events": [
        {{ "date": "10/04", "time": "09:30", "country": "us", "event": "CPI - Inflação", "impact": "High", "atual": "---", "proj": "0.3%", "prev": "0.4%" }}
      ]
    }}
    """
    
    response_text = ask_llm(prompt, system_prompt)
    return clean_json_response(response_text)

import requests

def main():
    print("[Senior Mode] Iniciando Motor Editorial Híbrido (DeepSeek + Gemini)...")
    
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

    current_utc_hour = datetime.utcnow().hour
    
    feed_data = {
        "morning": existing_data.get("morning"),
        "coffee": existing_data.get("coffee"),
        "evening": existing_data.get("evening"),
        "daily_term": existing_data.get("daily_term"),
        "economic_calendar": existing_data.get("economic_calendar"),
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

    economic_calendar = generate_economic_calendar(news_context)
    if economic_calendar:
        feed_data["economic_calendar"] = economic_calendar
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! Feed atualizado via IA em: {output_path}")

if __name__ == "__main__":
    main()
