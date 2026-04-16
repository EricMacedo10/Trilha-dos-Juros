import requests
import json
import os

def update_hg_data():
    # Chave encontrada no ticker.js (Plano do Usuário)
    API_KEY = "cce1a3d7"
    URL = f"https://api.hgbrasil.com/finance?key={API_KEY}"

    print("[Trilha dos Juros] Buscando cotacoes reais via HG Brasil...")

    try:
        response = requests.get(URL, timeout=15)
        response.raise_for_status()
        data = response.json()

        # Caminho para salvar no Front-End
        script_dir = os.path.dirname(os.path.abspath(__file__))
        dest_path = os.path.abspath(os.path.join(script_dir, "..", "3_Front_End", "hg.json"))

        with open(dest_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"Sucesso! Dados de mercado atualizados em: {dest_path}")
        
        # Mostra alguns valores para conferência
        res = data.get("results", {})
        usd = res.get("currencies", {}).get("USD", {})
        ibov = res.get("stocks", {}).get("IBOVESPA", {})
        print(f"Dolar: R$ {usd.get('buy')} | Ibov: {ibov.get('points')} pts")

    except Exception as e:
        print(f"Erro ao atualizar dados: {e}")

if __name__ == "__main__":
    update_hg_data()
