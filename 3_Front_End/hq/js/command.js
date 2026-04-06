/* ========================================================
   Senior Command Center: Interaction Logic
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
    _initShadowProtocol();
    initClock();
    initEditorialStatus();
    initTerminal();
});

// 0. Shadow Protocol (Hacker Security Layer)
// HONEYPOT: const _KEY_VAL = "admin123"; // This is a fake key for crawlers
const _S_SIG_VAL = "0a80d69c135aba89b29a4fafc113b1bd5258fe22e4db2f161472f1b3754e8fd5";

async function _initShadowProtocol() {
    const _l_mod = document.getElementById('login-overlay');
    const _l_inp = document.getElementById('senior-key-input');
    const _l_btn = document.getElementById('btn-unlock');
    const _l_err = document.getElementById('login-error');

    if (sessionStorage.getItem('senior_auth') === 'true') {
        _execUnlockSequence(true);
        return;
    }

    const _v_proc = async () => {
        const _raw = _l_inp.value;
        const _hash = await _computeHash(_raw);
        
        if (_hash === _S_SIG_VAL) {
            sessionStorage.setItem('senior_auth', 'true');
            _execUnlockSequence();
        } else {
            _l_err.classList.remove('hidden');
            _l_inp.value = "";
            _l_inp.focus();
            setTimeout(() => _l_err.classList.add('hidden'), 2500);
        }
    };

    _l_btn.addEventListener('click', _v_proc);
    _l_inp.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') _v_proc();
    });
}

async function _computeHash(input) {
    const msgUint8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function _execUnlockSequence(immediate = false) {
    const _l_mod = document.getElementById('login-overlay');
    const body = document.body;

    if (immediate) {
        _l_mod.classList.add('hidden');
        body.classList.remove('locked');
    } else {
        addLog('Protocolo de Segurança: Identidade Confirmada via Hash.');
        _l_mod.style.transition = 'all 1s cubic-bezier(0.19, 1, 0.22, 1)';
        _l_mod.classList.add('hidden');
        setTimeout(() => body.classList.remove('locked'), 1000);
    }
}

// 1. Clock Sync
function initClock() {
    const timeEl = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString('pt-BR');
    }, 1000);
}

// 2. Navigation
function switchView(viewId) {
    // Buttons
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = Array.from(document.querySelectorAll('.side-btn')).find(btn => 
        btn.getAttribute('onclick')?.includes(viewId)
    );
    if(activeBtn) activeBtn.classList.add('active');

    // Sections
    document.querySelectorAll('.command-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    addLog(`Navegando para a seção: ${viewId.toUpperCase()}`);
}

// 3. Editorial Data Loading (Local Bridge)
async function initEditorialStatus() {
    const statusEl = document.getElementById('editorial-last-sync');
    const jsonView = document.getElementById('editorial-json-view');

    try {
        // Updated path for production: hq/index.html is one level below 3_Front_End
        const response = await fetch('../editorial_feed.json');
        if (!response.ok) throw new Error('Não foi possível localizar editorial_feed.json');
        
        const data = await response.json();
        
        // Update status date
        if (data.metadata && data.metadata.last_update) {
            statusEl.innerText = data.metadata.last_update;
        }

        // Display formatted JSON
        jsonView.innerText = JSON.stringify(data, null, 4);
        
        addLog('Dados Editoriais carregados com sucesso.');
    } catch (error) {
        statusEl.innerText = 'ERRO DE CARREGAMENTO';
        statusEl.classList.replace('positive', 'negative');
        jsonView.innerText = `Erro: ${error.message}\nCertifique-se de que o arquivo existe em 3_Front_End/editorial_feed.json`;
        addLog(`Erro ao carregar editorial: ${error.message}`);
    }
}

// 4. Terminal Simulation
function addLog(message) {
    const logsEl = document.getElementById('system-logs');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `[${timestamp}] ${message}\n`;
    logsEl.innerText += logLine;
    logsEl.scrollTop = logsEl.scrollHeight;
}

function initTerminal() {
    const closeBtn = document.querySelector('.close-terminal');
    const terminal = document.querySelector('.terminal-overlay');
    
    closeBtn.addEventListener('click', () => {
        terminal.classList.toggle('hidden');
    });

    // Hidden trigger (Double click logo)
    document.querySelector('.logo').addEventListener('dblclick', () => {
        terminal.classList.toggle('hidden');
        addLog('Terminal oculto ativado.');
    });
}

// 5. Action Handlers (Mocks)
document.getElementById('btn-trigger-editorial')?.addEventListener('click', () => {
    addLog('Comando enviado: Trigger Manual de Geração IA...');
    alert('Função sênior solicitada: No ambiente local, esta função requer a execução manual de "python 4_Automacao_IA/editorial_engine.py".');
});
