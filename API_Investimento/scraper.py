import requests
import json
import os
from datetime import datetime, timedelta, timezone

# CONFIGURAÇÂO - Chaves sensíveis via Environment Variables (Prioridade Máxima)
GIST_ID = "09e0576859ee449aec8218405293db20"

# Tenta ler de TODAS as variações possíveis de digitação para garantir o funcionamento
API_KEY = (
    os.environ.get("COMMODITY_API_KEY") or 
    os.environ.get("COMMODITTY_API_KEY") or 
    os.environ.get("COMMODITTY_APT_KEY") or
    os.environ.get("COMMODITY_APT_KEY")
)

# Fallback apenas para DESENVOLVIMENTO LOCAL
if not API_KEY and not os.environ.get("GITHUB_ACTIONS"):
    API_KEY = "0652c687-3f50-4b95-8c7c-670f9c77923c"

BASE_URL = "https://api.commoditypriceapi.com/v2"

# Mapeamento do Site para a API
SYMBOLS_MAP = {
    'gold': 'XAU',
    'silver': 'XAG',
    'coffee': 'CA',
    'iron': 'TIOC',
    'oil': 'BRENTOIL-FUT'
}

def update_gist(data: dict, token: str):
    """Envia os dados atualizados para o Gist público do GitHub."""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {
        "files": {
            "cota_hoje.json": {
                "content": json.dumps(data, ensure_ascii=False, indent=2)
            }
        }
    }
    try:
        response = requests.patch(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers,
            json=payload,
            timeout=15
        )
        response.raise_for_status()
        print(f"[OK] Gist atualizado com sucesso.")
    except Exception as e:
        print(f"[ERRO] Falha ao atualizar Gist: {e}")
        raise

def fetch_prices():
    results = {}
    print("Iniciando Sincronizacao de Commodities via API Profissional...")
    
    if not API_KEY:
        print("[ERRO CRITICO] COMMODITY_API_KEY nao configurada nos Secrets.")
        exit(1)

    symbols_str = ",".join(SYMBOLS_MAP.values())
    
    try:
        # 1. Busca Preços Atuais
        print(f"[API] Buscando precos atuais para: {symbols_str}")
        latest_res = requests.get(f"{BASE_URL}/rates/latest?apiKey={API_KEY}&symbols={symbols_str}", timeout=20)
        latest_res.raise_for_status()
        latest_data = latest_res.json()
        
        # 2. Busca Preços de Ontem (Variação %)
        yesterday_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        print(f"[API] Buscando precos historicos de {yesterday_date}...")
        hist_res = requests.get(f"{BASE_URL}/rates/historical?apiKey={API_KEY}&symbols={symbols_str}&date={yesterday_date}", timeout=20)
        hist_res.raise_for_status()
        hist_data = hist_res.json()

        if latest_data.get('success') and hist_data.get('success'):
            for key, symbol in SYMBOLS_MAP.items():
                current = latest_data['rates'].get(symbol)
                hist_item = hist_data['rates'].get(symbol)
                
                # Trata formato da API (valor direto ou objeto com 'close')
                prev_close = hist_item.get('close') if isinstance(hist_item, dict) else hist_item
                
                if current and prev_close:
                    variation = ((float(current) - float(prev_close)) / float(prev_close)) * 100
                    results[key] = {
                        "price": round(float(current), 2),
                        "variation": round(float(variation), 2)
                    }
                    print(f"[OK] {key.upper()}: {current} ({variation:.2f}%)")
            
            if not results:
                print("[AVISO] Nenhum dado processado com sucesso. Verifique os simbolos.")
                return

            # Metadados de Tempo (Horário oficial de Brasília)
            tz_br = timezone(timedelta(hours=-3))
            results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")

            # Publicar no Gist
            gist_token = os.environ.get("GIST_TOKEN", "")
            if gist_token:
                update_gist(results, gist_token)
            else:
                print("[ERRO] GIST_TOKEN nao encontrado no GitHub Secrets.")
                exit(1)
        else:
            print(f"[ERRO API] Sucesso falso. Latest: {latest_data.get('success')}, Hist: {hist_data.get('success')}")
            print(f"Mensagem: {latest_data.get('error', {}).get('info', 'Sem info')}")
            exit(1)

    except Exception as e:
        print(f"[ERRO CRITICO] Falha na Sincronizacao: {e}")
        exit(1)

if __name__ == '__main__':
    fetch_prices()

if __name__ == '__main__':
    fetch_prices()
