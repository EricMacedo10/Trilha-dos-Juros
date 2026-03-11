import requests
import json
import os
from datetime import datetime, timedelta, timezone

# ADR-001: Gist ID para distribuição das cotações
GIST_ID = "09e0576859ee449aec8218405293db20"

# CONFIGURAÇÃO: CommodityPriceAPI Profissional
API_URL = "https://api.commoditypriceapi.com/v2/rates"

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
    print("🚀 Iniciando Sincronizacao via CommodityPriceAPI (Caminho Sem Erros)")
    
    # Chave de API priorizada
    api_key = os.environ.get("COMMODITY_API_KEY") or "0652c687-3f50-4b95-8c7c-670f9c77923c"
    
    # Mapeamento do Site para a API (Símbolos Confirmados pelo Usuário)
    SYMBOLS_MAP = {
        'gold': 'XAU',
        'silver': 'XAG',
        'oil': 'BRENTOIL-FUT',
        'coffee': 'CA',
        'iron': 'TIOC'
    }
    
    symbols_str = ",".join(SYMBOLS_MAP.values())
    
    try:
        # Busca Cotações Atuais
        print(f"[API] Solicitando rates para: {symbols_str}")
        res_latest = requests.get(f"{API_URL}/latest?apiKey={api_key}&symbols={symbols_str}", timeout=20)
        res_latest.raise_for_status()
        data_latest = res_latest.json()
        
        if data_latest.get('success'):
            rates = data_latest['rates']
            
            for key, symbol in SYMBOLS_MAP.items():
                current_val = rates.get(symbol)
                
                if current_val:
                    # Nenhuma variação percentual será calculada nem guardada
                    results[key] = {
                        "price": round(float(current_val), 2)
                    }
                    print(f"[OK] {key.upper()} (Último negócio): {current_val}")
            
            if not results:
                print("[AVISO] Nenhum dado extraído. Verifique os símbolos.")
                return

            # Metadados de Tempo Real (Brasília)
            tz_br = timezone(timedelta(hours=-3))
            results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")

            # Publicar no Gist
            gist_token = os.environ.get("GIST_TOKEN")
            if gist_token:
                update_gist(results, gist_token)
            else:
                print("[DEBUG] GIST_TOKEN não encontrado. Salvando localmente.")
                with open("cota_hoje.json", "w") as f:
                    json.dump(results, f, indent=2)
        else:
            print(f"[ERRO API] Resposta negativa da API. Verifique a chave ou símbolos.")

    except Exception as e:
        print(f"[ERRO CRITICO] Falha na Sincronização: {e}")

if __name__ == '__main__':
    fetch_prices()
