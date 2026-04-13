import os
import json
from datetime import datetime
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

# Configurações do Ambiente
load_dotenv()

# Inicializa Firecrawl
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")
firecrawl_app = FirecrawlApp(api_key=FIRECRAWL_KEY)

def scrape_radar_data():
    """Usa o extrator nativo do Firecrawl para capturar os eventos em tempo real."""
    print("-> Iniciando extração inteligente via Firecrawl (Modo Extract)...")
    url = "https://www.investing.com/economic-calendar"
    
    # Definimos exatamente o que queremos extrair
    schema = {
        "type": "object",
        "properties": {
            "events": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "time": {"type": "string"},
                        "country": {"type": "string"},
                        "event": {"type": "string"},
                        "impact": {"type": "string"},
                        "atual": {"type": "string"},
                        "proj": {"type": "string"},
                        "prev": {"type": "string"}
                    },
                    "required": ["time", "event", "atual"]
                }
            }
        }
    }

    try:
        # O Firecrawl já faz a raspagem e a IA extrai o JSON direto
        extract_result = firecrawl_app.scrape_url(
            url, 
            params={
                'formats': ['extract'],
                'extract': {
                    'schema': schema,
                    'prompt': "Extraia os 4 eventos de ALTO IMPACTO (3 estrelas/touros) de HOJE. Traduza os nomes dos eventos para Português. Capture os valores de 'Actual' na coluna 'atual'. Se não houver valor atual, use '---'."
                }
            }
        )
        return extract_result.get('extract', {})
    except Exception as e:
        print(f"ERRO no Firecrawl Extract: {e}")
        return None

def main():
    print("[Radar Precision Engine] Atualizando dados...")
    
    # Caminho do arquivo de saída
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "..", "3_Front_End", "radar_data.json"))

    radar_data = scrape_radar_data()
    
    if radar_data and "events" in radar_data:
        # Adiciona a data no formato dd/mm para cada evento e metadados
        current_date_short = datetime.now().strftime("%d/%m")
        for ev in radar_data["events"]:
            ev["date"] = current_date_short
            ev["impact"] = "High" # Garante o label
            
        radar_data["last_update"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(radar_data, f, ensure_ascii=False, indent=2)
        
        print(f"Sucesso! Radar atualizado com precisão: {output_path}")
    else:
        print("Erro: Falha na extração dos dados.")
        import sys
        sys.exit(1)

if __name__ == "__main__":
    main()
