from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import requests
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Configurações do Ambiente
load_dotenv()

# Configurações
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY", "")
API_URL = 'https://api.deepseek.com/v1/chat/completions'
PROD_URL = 'https://trilhadosjuros.com.br/hg.json'

class CabecaHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        # Rota de Auditoria da Produção
        if self.path == '/audit':
            self.audit_production()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        # Rota de Chat IA
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            input_data = json.loads(post_data)
            
            user_message = input_data.get('message', '')
            print(f"[CABECA] Recebido comando Eric: {user_message}", flush=True)
            
            market_context = input_data.get('context', 'Dados locais.')

            system_prompt = (
                "DIRETIVA: Você é a 'Cabeça', IA tática da Trilha dos Juros. Estilo Robocop. "
                "Sua missão é dar suporte estratégico ao Eric. Nunca invente dados. "
                f"CONTEXTO TÁTICO: {market_context}"
            )

            payload = {
                "model": "deepseek-reasoner",
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}],
                "temperature": 0.1,
                "max_tokens": 200
            }

            print(f"[CABECA] Solicitando reflexão ao DeepSeek...", flush=True)
            response = requests.post(API_URL, json=payload, headers={"Authorization": f"Bearer {DEEPSEEK_KEY}"}, timeout=15)
            
            if response.status_code == 200:
                print(f"[CABECA] DeepSeek respondeu com sucesso.", flush=True)
            else:
                print(f"[CABECA] Erro na API Heart: {response.status_code} - {response.text}", flush=True)
                
            self.reply_json(response.json())
        except Exception as e:
            print(f"[CABECA] Falha crítica no processamento: {e}", flush=True)
            self.reply_json({"error": str(e)}, 500)

    def audit_production(self):
        """Verifica se o site oficial está online e com dados atualizados"""
        try:
            start_time = time.time()
            resp = requests.get(PROD_URL, timeout=10, verify=False)
            latency = round((time.time() - start_time) * 1000)
            
            if resp.status_code == 200:
                data = resp.json()
                results = data.get('results', {})
                
                # Tenta pegar o tempo, se não houver, tenta a data nas taxas
                update_time = results.get('time')
                update_date = None
                
                taxes = results.get('taxes', [])
                if taxes:
                    update_date = taxes[0].get('date')
                
                now = datetime.now()
                status = "NOMINAL"
                alert = None
                
                # Se tivermos a data, verificamos se é hoje
                if update_date:
                    today_str = now.strftime("%Y-%m-%d")
                    if update_date != today_str:
                        status = "STALE"
                        alert = f"DADOS ANTIGOS NA PRODUÇÃO. DATA: {update_date}"
                
                # Se tivermos o tempo e for hoje, verificamos a estagnação horária
                if update_time and status == "NOMINAL":
                    try:
                        h, m = map(int, update_time.split(':'))
                        last_up = now.replace(hour=h, minute=m, second=0)
                        diff_min = (now - last_up).total_seconds() / 60
                        if diff_min > 60 and 9 <= now.hour <= 19:
                            status = "STALE"
                            alert = f"DADOS ESTAGNADOS NA PRODUÇÃO HÁ {int(diff_min)} MINUTOS."
                    except:
                        pass
                
                self.reply_json({
                    "status": status,
                    "latency": f"{latency}ms",
                    "last_update": update_time or update_date or "Desconhecido",
                    "alert": alert
                })
            else:
                self.reply_json({"status": "OFFLINE", "alert": "PORTAL OFICIAL FORA DO AR (HTTP " + str(resp.status_code) + ")"}, 500)
        except Exception as e:
            self.reply_json({"status": "CRITICAL", "alert": f"FALHA DE CONEXÃO COM O SERVIDOR DE PRODUÇÃO: {str(e)}"}, 500)

    def reply_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def run(port=5005):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CabecaHandler)
    print(f"[CABECA] Cerebro Online v2.5 com Auditoria de Producao na porta {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
