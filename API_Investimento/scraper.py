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
        'oil': 'BRENTOIL-SPOT',
        'coffee': 'CA',
        'iron': 'TIOC'
    }
    
    symbols_str = ",".join(SYMBOLS_MAP.values())
    
    try:
        # 1. Busca Cotações Atuais
        print(f"[API] Solicitando rates para: {symbols_str}")
        res_latest = requests.get(f"{API_URL}/latest?apiKey={api_key}&symbols={symbols_str}", timeout=20)
        res_latest.raise_for_status()
        data_latest = res_latest.json()
        
        # 2. Busca Cotações de Ontem (Variação %)
        yesterday_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        print(f"[API] Solicitando histórico de {yesterday_date}...")
        res_hist = requests.get(f"{API_URL}/historical?apiKey={api_key}&symbols={symbols_str}&date={yesterday_date}", timeout=20)
        res_hist.raise_for_status()
        data_hist = res_hist.json()

        if data_latest.get('success') and data_hist.get('success'):
            rates = data_latest['rates']
            hist_rates = data_hist['rates']
            
            for key, symbol in SYMBOLS_MAP.items():
                current = rates.get(symbol)
                prev = hist_rates.get(symbol)
                
                # Trata formato da API (pode ser valor ou objeto)
                if isinstance(prev, dict): prev = prev.get('close')
                
                current_val = float(current) if current else None
                prev_val = float(prev) if prev else None
                
                if current_val:
                    variation = 0.0
                    if prev_val:
                        variation = ((current_val - prev_val) / prev_val) * 100
                    
                    # FILTRO DE SANIDADE SENIOR (Evita alucinações de contratos/rolagem)
                    if abs(variation) > 12.0:
                        print(f"[AVISO] Variação anômala detectada em {key.upper()} ({variation:.2f}%). Zerando para segurança.")
                        variation = 0.0
                    
                    results[key] = {
                        "price": round(current_val, 2),
                        "variation": round(variation, 2)
                    }
                    print(f"[OK] {key.upper()}: {current_val} ({variation:.2f}%)")
            
            if not results:
                print("[AVISO] Nenhum dado extraído. Verifique os símbolos.")
                return

            # Metadados de Tempo (Brasília)
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
