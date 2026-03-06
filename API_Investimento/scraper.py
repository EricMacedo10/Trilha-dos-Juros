import yfinance as yf
import json
from datetime import datetime, timedelta, timezone

def fetch_prices():
    # Símbolos no Yahoo Finance correspondentes às commodities originais
    assets = {
        'gold': 'GC=F',       # Ouro (Gold Futures)
        'silver': 'SI=F',     # Prata (Silver Futures)
        'oil': 'BZ=F'         # Petróleo Brent Crude
    }
    
    results = {}
    print("Buscando cotações globais via API yfinance (Resistente a bloqueios)...")
    
    for key, symbol in assets.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            price = info.get('regularMarketPrice')
            var_pct = info.get('regularMarketChangePercent')
            
            # Formatando corretamente para a UI do painel
            if price is not None and var_pct is not None:
                results[key] = {
                    "price": round(float(price), 2),
                    "variation": round(float(var_pct), 2)
                }
                print(f"[OK] {key.upper()} ({symbol}): {results[key]['price']} ({results[key]['variation']}%)")
            else:
                print(f"[Aviso] Dados insuficientes na biblioteca para {key} ({symbol}).")
        except Exception as e:
            print(f"[Erro] Falha ao consultar {key} ({symbol}): {e}")
            
    if results:
        # Fuso horário de Brasília
        tz_br = timezone(timedelta(hours=-3))
        results["last_update"] = datetime.now(tz_br).strftime("%Y-%m-%d %H:%M:%S")
        
        # Salva sobrescrevendo cota_hoje.json com a nova atualização
        with open('cota_hoje.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"\nSucesso! Arquivo 'cota_hoje.json' sincronizado às {results['last_update']} (BRT).")
    else:
        print("\n[Erro Crítico] Nenhuma cotação capturada. O dashboard não será alterado.")

if __name__ == '__main__':
    fetch_prices()
