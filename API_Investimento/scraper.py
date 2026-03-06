import requests
from bs4 import BeautifulSoup
import json
import time

import re

def clean_value(text):
    if not text: return None
    t = text.strip().replace('%', '').replace('(', '').replace(')', '')
    if not t: return None
    t_clean = t.replace('.', '').replace(',', '.')
    try:
        return float(t_clean)
    except:
        return None

def get_investing_price(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://br.investing.com/'
    }
    
    try:
        print(f"Buscando {url}...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        price_element = soup.find(attrs={"data-test": "instrument-price-last"})
        chg_element = soup.find(attrs={"data-test": "instrument-price-change-percent"})
        price = clean_value(price_element.text) if price_element else None
        variation = clean_value(chg_element.text) if chg_element else None
        
        return {
            "price": price,
            "variation": variation
        }
        
    except Exception as e:
        print(f"Erro ao buscar {url}: {e}")
        return None

def main():
    assets = {
        'gold': 'https://br.investing.com/commodities/gold',
        'silver': 'https://br.investing.com/commodities/silver',
        'oil': 'https://br.investing.com/commodities/brent-oil',
        'coffee': 'https://br.investing.com/commodities/arabica-coffee-4-5',
        'cattle': 'https://br.investing.com/commodities/live-cattle',
        'iron': 'https://br.investing.com/commodities/iron-ore-62-cfr-futures'
    }
    
    results = {}
    
    for key, url in assets.items():
        price = get_investing_price(url)
        if price is not None and price.get("price") is not None:
            results[key] = price
        # Delay de 2 segundos entre requests para não ativar Cloudflare
        time.sleep(2)
        
    if results:
        # Adiciona timestamp da última atualização bem-sucedida (Força UTC-3 - Brasília)
        from datetime import datetime, timedelta, timezone
        tz_br = timezone(timedelta(hours=-3))
        results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")
        print(f"\nResultados Finais: {results}")
        
        with open('cota_hoje.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
    else:
        print("\n[ERRO] Nenhum dado foi coletado. O arquivo não será sobrescrito.")

if __name__ == '__main__':
    main()
