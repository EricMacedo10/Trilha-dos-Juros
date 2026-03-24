import json
import os
import requests
from datetime import datetime, timedelta, timezone

# ==============================================================================
# ADR-001: Gist ID para distribuição das cotações de Commodities
# Migração: commoditypriceapi.com (pago) → Yahoo Finance via yfinance (gratuito)
# ==============================================================================
GIST_ID = "09e0576859ee449aec8218405293db20"

# Mapeamento: chave do JSON → ticker Yahoo Finance
# Referência de tickers: https://finance.yahoo.com/
SYMBOLS_MAP = {
    'gold':   'GC=F',         # Gold Futures (USD/troy oz)
    'silver': 'SI=F',         # Silver Futures (USD/troy oz)
    'oil':    'BZ=F',         # Brent Crude Oil Futures (USD/barril)
    'coffee': 'KC=F',         # Coffee C Futures (USD/libra)
    'iron':   'TIO=F',        # Iron Ore Futures (USD/tonelada)
}

def fetch_prices_yahoo() -> dict:
    """
    Busca cotações via API não-oficial do Yahoo Finance.
    Método: query2.finance.yahoo.com (sem chave de API, sem custos).
    """
    results = {}
    headers = {
        # User-Agent realista para evitar bloqueio por bot-detection
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
    }

    print("🚀 Iniciando Sincronização via Yahoo Finance (Gratuito, Sem Chave)")

    for key, ticker in SYMBOLS_MAP.items():
        try:
            url = f"https://query2.finance.yahoo.com/v8/finance/chart/{ticker}"
            params = {
                'interval': '1d',
                'range':    '2d',   # 2 dias para ter o fechamento anterior para calcular variação
            }

            res = requests.get(url, headers=headers, params=params, timeout=15)
            res.raise_for_status()
            data = res.json()

            result_block = data.get('chart', {}).get('result', [])
            if not result_block:
                print(f"[AVISO] {key.upper()} ({ticker}): Sem resultado no payload. Pulando.")
                continue

            meta = result_block[0].get('meta', {})
            current_price = meta.get('regularMarketPrice')
            prev_close    = meta.get('chartPreviousClose') or meta.get('previousClose')

            if current_price is None:
                print(f"[AVISO] {key.upper()} ({ticker}): regularMarketPrice ausente. Pulando.")
                continue

            current_price = round(float(current_price), 2)

            # Variação percentual em relação ao fechamento anterior
            variation = 0.0
            if prev_close and float(prev_close) != 0:
                variation = round(((current_price - float(prev_close)) / float(prev_close)) * 100, 2)

            results[key] = {
                'price':     current_price,
                'variation': variation,
            }
            print(f"[OK] {key.upper():6s} ({ticker:10s}): {current_price:>10.2f}  |  {variation:+.2f}%")

        except Exception as e:
            print(f"[ERRO] {key.upper()} ({ticker}): {e}")

    return results


def update_gist(data: dict, token: str):
    """Publica os dados atualizados no Gist público do GitHub."""
    headers = {
        'Authorization': f'token {token}',
        'Accept':        'application/vnd.github.v3+json',
    }
    payload = {
        'files': {
            'cota_hoje.json': {
                'content': json.dumps(data, ensure_ascii=False, indent=2)
            }
        }
    }
    response = requests.patch(
        f'https://api.github.com/gists/{GIST_ID}',
        headers=headers,
        json=payload,
        timeout=15,
    )
    response.raise_for_status()
    print(f"[OK] Gist atualizado com sucesso: https://gist.github.com/{GIST_ID}")


def main():
    prices = fetch_prices_yahoo()

    if not prices:
        print("[AVISO] Nenhum dado obtido. Abortando publicação no Gist.")
        return

    # Metadados de atualização (horário de Brasília)
    tz_br = timezone(timedelta(hours=-3))
    prices['last_update'] = datetime.now(tz_br).strftime('%Y-%m-%d %H:%M:%S')

    gist_token = os.environ.get('GIST_TOKEN')
    if gist_token:
        update_gist(prices, gist_token)
    else:
        # Fallback local: salva no arquivo (útil para debug sem secrets)
        local_path = os.path.join(os.path.dirname(__file__), 'cota_hoje.json')
        with open(local_path, 'w', encoding='utf-8') as f:
            json.dump(prices, f, ensure_ascii=False, indent=2)
        print(f"[DEBUG] GIST_TOKEN ausente. Salvo localmente em: {local_path}")


if __name__ == '__main__':
    main()
