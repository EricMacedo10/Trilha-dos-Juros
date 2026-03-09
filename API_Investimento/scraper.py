import requests
import json
import os
from datetime import datetime, timedelta, timezone

# ID do Gist Público onde as cotações são publicadas
GIST_ID = "09e0576859ee449aec8218405293db20"

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
    response = requests.patch(
        f"https://api.github.com/gists/{GIST_ID}",
        headers=headers,
        json=payload,
        timeout=15
    )
    response.raise_for_status()
    print(f"[OK] Gist atualizado: {response.json().get('html_url')}")

def fetch_prices():
    results = {}
    print("Iniciando Sincronizacao de Commodities (Producao - Gist Strategy)...")
    
    # 1. Busca Ouro e Prata via AwesomeAPI (Referencia Global em USD)
    try:
        print("[AwesomeAPI] Buscando Ouro e Prata...")
        res = requests.get(
            "https://economia.awesomeapi.com.br/json/last/XAU-USD,XAG-USD",
            timeout=15
        )
        if res.status_code == 200:
            data = res.json()
            results['gold'] = {
                "price": round(float(data['XAUUSD']['bid']), 2),
                "variation": round(float(data['XAUUSD']['pctChange']), 2)
            }
            results['silver'] = {
                "price": round(float(data['XAGUSD']['bid']), 2),
                "variation": round(float(data['XAGUSD']['pctChange']), 2)
            }
            print(f"[OK] GOLD: {results['gold']['price']} ({results['gold']['variation']}%)")
            print(f"[OK] SILVER: {results['silver']['price']} ({results['silver']['variation']}%)")
    except Exception as e:
        print(f"[Erro] Falha ao buscar Metais via AwesomeAPI: {e}")

    # 2. Busca Petroleo Brent via Yahoo Finance API Direta
    try:
        print("[Yahoo API] Buscando Petroleo Brent...")
        url = "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        res_oil = requests.get(url, headers=headers, timeout=15)
        if res_oil.status_code == 200:
            data_oil = res_oil.json()
            meta = data_oil['chart']['result'][0]['meta']
            price_oil = meta['regularMarketPrice']
            prev_close = meta['chartPreviousClose']
            variation_oil = ((price_oil - prev_close) / prev_close) * 100
            results['oil'] = {
                "price": round(float(price_oil), 2),
                "variation": round(float(variation_oil), 2)
            }
            print(f"[OK] OIL (Brent): {results['oil']['price']} ({results['oil']['variation']}%)")
    except Exception as e:
        print(f"[Erro] Falha ao buscar Petroleo via Yahoo API: {e}")

    # Validacao Final — ao menos 2 dos 3 ativos capturados
    if len(results) >= 2:
        tz_br = timezone(timedelta(hours=-3))
        results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")

        # Publicar no Gist público (fonte primária do front-end)
        gist_token = os.environ.get("GIST_TOKEN", "")
        if gist_token:
            try:
                update_gist(results, gist_token)
            except Exception as e:
                print(f"[Aviso] Falha ao atualizar Gist: {e}")
        else:
            print("[Aviso] GIST_TOKEN nao encontrado. Pulando atualizacao do Gist.")

        # Salvar localmente como backup (cota_hoje.json no diretorio do script)
        with open('cota_hoje.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"\n[SUCESSO] Sincronizacao concluida as {results['last_update']} (BRT).")
    else:
        print("\n[ERRO CRITICO] Falha na captacao dos dados. Arquivo nao alterado.")

if __name__ == '__main__':
    fetch_prices()
