import os
import json
from firecrawl import FirecrawlApp
from openai import OpenAI
from datetime import datetime
from dotenv import load_dotenv

# Configurações do Ambiente
load_dotenv()

# Inicializa Firecrawl e DeepSeek
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")

firecrawl_app = FirecrawlApp(api_key=FIRECRAWL_KEY)
deepseek_client = OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com")

def scrape_investing():
    """Realiza a raspagem do calendário econômico da Investing.com via Firecrawl."""
    print("-> Iniciando raspagem da Investing.com...")
    url = "https://www.investing.com/economic-calendar"
    
    try:
        # Usamos o modo 'scrape_url' para obter o markdown simplificado da página
        scrape_result = firecrawl_app.scrape_url(
            url, 
            params={
                'formats': ['markdown'],
                'onlyMainContent': True
            }
        )
        return scrape_result.get('markdown', '')
    except Exception as e:
        print(f"ERRO no Firecrawl: {e}")
        return None

def parse_with_deepseek(markdown_content):
    """Utiliza DeepSeek IA para extrair apenas os 4 eventos de maior impacto de 'Hoje'."""
    if not markdown_content:
        return None

    print("-> Analisando dados com DeepSeek (IA Detetive)...")
    
    current_date = datetime.now().strftime("%d/%m/%Y")
    
    system_prompt = "Você é um analista de dados macroeconômicos sênior."
    
    prompt = f"""
    Abaixo está o conteúdo em Markdown do calendário econômico da Investing.com capturado hoje.
    
    SUA MISSÃO:
    1. Localize os eventos registrados para HOJE ({current_date}).
    2. Identifique os eventos de ALTO IMPACTO (High Volatility Expected / 3 estrelas ou 3 touros).
    3. Selecione os 4 eventos mais importantes.
    4. Extraia os valores exatos de 'Atual' (Actual), 'Projetado' (Forecast/Proj) e 'Anterior' (Previous/Prev).
    5. Traduza os nomes dos eventos para Português de forma profissional.
    
    REGRAS DE EXTRAÇÃO:
    - Se o valor 'Atual' não estiver disponível (evento ainda não ocorreu), use '---'.
    - Determine o país ('br', 'us', 'eu', 'cn', etc.) baseado na bandeira ou sigla.
    - Impacto deve ser sempre 'High' para estes 4 selecionados.
    
    RETORNE APENAS JSON PURO NO SEGUINTE FORMATO:
    {{
      "events": [
        {{
          "date": "dd/mm",
          "time": "hh:mm",
          "country": "us",
          "event": "Nome do Evento em PT-BR",
          "impact": "High",
          "atual": "valor",
          "proj": "valor",
          "prev": "valor"
        }}
      ]
    }}
    
    CONTEÚDO RASPADO:
    {markdown_content[:20000]}  # Limitando o context para evitar estouro de token
    """

    try:
        response = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            stream=False,
            response_format={'type': 'json_object'}
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"ERRO no DeepSeek: {e}")
        return None

def main():
    print("[Radar Engine] Iniciando atualização em tempo real...")
    
    # Caminho do arquivo de saída
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "..", "3_Front_End", "radar_data.json"))

    markdown = scrape_investing()
    if not markdown:
        print("Abortando: Falha na captura dos dados.")
        return

    radar_json = parse_with_deepseek(markdown)
    
    if radar_json and "events" in radar_json:
        # Adiciona metadados de atualização
        radar_json["last_update"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(radar_json, f, ensure_ascii=False, indent=2)
        
        print(f"Sucesso! Radar atualizado com {len(radar_json['events'])} eventos em: {output_path}")
    else:
        print("Erro: A IA não conseguiu extrair dados válidos.")

if __name__ == "__main__":
    main()
