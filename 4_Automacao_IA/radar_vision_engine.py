import os
import json
import requests
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

# Configurações do Ambiente
load_dotenv()

# Inicialização das APIs
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

firecrawl_app = FirecrawlApp(api_key=FIRECRAWL_KEY)
genai.configure(api_key=GOOGLE_API_KEY)

def scrape_investing_screenshot():
    """Tira um print do calendário econômico da Investing.com via Firecrawl."""
    print("-> Capturando imagem (Screenshot) da Investing.com...")
    url = "https://www.investing.com/economic-calendar"
    
    try:
        # Pede ao Firecrawl para tirar um screenshot da página
        scrape_result = firecrawl_app.scrape_url(
            url, 
            params={
                'formats': ['screenshot'],
                'waitFor': 3000  # Aguarda o carregamento dos dados
            }
        )
        return scrape_result.get('screenshot', '')
    except Exception as e:
        print(f"ERRO no Firecrawl (Screenshot): {e}")
        return None

def parse_image_with_gemini(image_url):
    """Utiliza o Gemini 1.5 Flash para ler a tabela da imagem e extrair dados."""
    if not image_url:
        return None

    print("-> Analisando imagem com Gemini 1.5 Flash (Visão)...")
    
    # Download da imagem para enviar ao Gemini
    response = requests.get(image_url)
    img_data = response.content

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    current_date = datetime.now().strftime("%d/%m")
    
    prompt = f"""
    Você é um analista financeiro sênior. 
    Abaixo está uma captura de tela do calendário econômico da Investing.com.
    
    SUA MISSÃO:
    1. Localize os eventos de HOJE ({current_date}).
    2. Identifique os eventos de ALTO IMPACTO (3 estrelas/touros).
    3. Selecione os 4 eventos mais importantes.
    4. Extraia os valores exatos de 'Atual' (Actual), 'Projetado' (Forecast/Proj) e 'Anterior' (Previous).
    
    OBSERVAÇÃO IMPORTANTE: 
    - Se a coluna 'Atual' estiver em branco ou com um traço na imagem para aquele horário, retorne '---'.
    - Transcreva o número exatamente como aparece (ex: 3.5%, 100K, 50.2).
    - Traduza o nome do evento para Português de forma profissional.

    RETORNE APENAS JSON NO SEGUINTE FORMATO:
    {{
      "events": [
        {{
          "date": "dd/mm",
          "time": "hh:mm",
          "country": "sigla (us, br, eu, etc)",
          "event": "Nome em Português",
          "impact": "High",
          "atual": "valor",
          "proj": "valor",
          "prev": "valor"
        }}
      ]
    }}
    """

    try:
        # Enviando imagem e prompt para o Gemini
        response = model.generate_content([
            prompt,
            {'mime_type': 'image/png', 'data': img_data}
        ])
        
        # Limpeza simples para garantir JSON puro
        raw_text = response.text
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"ERRO no Gemini Vision: {e}")
        return None

def main():
    print("[Radar Vision Engine] Iniciando captura inteligente...")
    
    # Caminho do arquivo de saída
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "..", "3_Front_End", "radar_data.json"))

    image_url = scrape_investing_screenshot()
    if not image_url:
        print("Abortando: Falha na captura da imagem.")
        return

    radar_json = parse_image_with_gemini(image_url)
    
    if radar_json and "events" in radar_json:
        # Adiciona metadados de atualização
        radar_json["last_update"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(radar_json, f, ensure_ascii=False, indent=2)
        
        print(f"Sucesso! Radar atualizado via Visão Computacional: {output_path}")
    else:
        print("Erro: A IA não conseguiu extrair dados da imagem.")
        import sys
        sys.exit(1)

if __name__ == "__main__":
    main()
