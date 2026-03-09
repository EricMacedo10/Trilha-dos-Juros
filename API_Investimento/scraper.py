import requests
import json
from datetime import datetime, timedelta, timezone

def fetch_prices():
    results = {}
    print("Iniciando Sincronização de Commodities (Produção)...")
    
    # 1. Busca Ouro e Prata via AwesomeAPI (Referência Global em USD)
    try:
        print("[AwesomeAPI] Buscando Ouro e Prata...")
        res = requests.get("https://economia.awesomeapi.com.br/json/last/XAU-USD,XAG-USD", timeout=15)
        if res.status_code == 200:
            data = res.json()
            # Ouro
            results['gold'] = {
                "price": round(float(data['XAUUSD']['bid']), 2),
                "variation": round(float(data['XAUUSD']['pctChange']), 2)
            }
            # Prata
            results['silver'] = {
                "price": round(float(data['XAGUSD']['bid']), 2),
                "variation": round(float(data['XAGUSD']['pctChange']), 2)
            }
            print(f"[OK] GOLD: {results['gold']['price']} ({results['gold']['variation']}%)")
            print(f"[OK] SILVER: {results['silver']['price']} ({results['silver']['variation']}%)")
    except Exception as e:
        print(f"[Erro] Falha ao buscar Metais via AwesomeAPI: {e}")

    # 2. Busca Petróleo Brent via Yahoo Finance API Direta
    try:
        print("[Yahoo API] Buscando Petróleo Brent...")
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
        print(f"[Erro] Falha ao buscar Petróleo via Yahoo API: {e}")

    # Validação Final e Escrita
    if len(results) >= 2: # Garantimos que pelo menos 2 dos 3 assets foram capturados
        # Fuso horário de Brasília (UTC-3)
        tz_br = timezone(timedelta(hours=-3))
        results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")
        
        # Salvando no arquivo com encoding UTF-8 (sempre no diretório atual do script)
        # O GitHub Action chama: cd API_Investimento && python scraper.py
        # Assim ele criará API_Investimento/cota_hoje.json corretamente.
        with open('cota_hoje.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"\n[SUCESSO] Sincronização concluída às {results['last_update']} (BRT).")
    else:
        print("\n[ERRO CRÍTICO] Falha na captação dos dados. O arquivo não foi alterado.")

if __name__ == '__main__':
    fetch_prices()
