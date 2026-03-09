import requests
import json
from datetime import datetime, timedelta, timezone

def fetch_prices():
    results = {}
    print("Iniciando Sincronização de Commodities (Producao - GitHub Actions)...")
    
    # 1. Busca Ouro e Prata via AwesomeAPI (Referência Global em USD)
    # AwesomeAPI é extremamente resiliente e não costuma bloquear requests simples
    try:
        print("[AwesomeAPI] Buscando Ouro e Prata...")
        res = requests.get("https://economia.awesomeapi.com.br/json/last/XAU-USD,XAG-USD", timeout=15)
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

    # 2. Busca Petróleo Brent via Yahoo Finance API Direta
    # Evitamos a biblioteca yfinance para reduzir peso e instabilidade de IP
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

    # Validação Final e Escrita
    # Garantimos que pelo menos 2 dos 3 assets foram capturados antes de salvar
    if len(results) >= 2:
        # Fuso horário de Brasília (UTC-3)
        tz_br = timezone(timedelta(hours=-3))
        results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")
        
        # O GitHub Action executa: cd API_Investimento && python scraper.py
        # Então 'cota_hoje.json' é criado em API_Investimento/cota_hoje.json no repositório.
        # Este arquivo é commitado e publicado no GitHub, onde o front-end o lê via Raw URL.
        with open('cota_hoje.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"\n[SUCESSO] Sincronizacao concluida as {results['last_update']} (BRT).")
        print("Arquivo 'cota_hoje.json' atualizado. GitHub Actions fara o commit automaticamente.")
    else:
        print("\n[ERRO CRITICO] Falha na captacao dos dados. O arquivo nao foi alterado.")

if __name__ == '__main__':
    fetch_prices()
