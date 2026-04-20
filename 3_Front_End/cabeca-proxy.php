<?php
/**
 * Cabeça - Neural Proxy (DeepSeek)
 * Intermedia as conversas entre o Front-end e a inteligência da DeepSeek.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Carrega a chave da API do DeepSeek de variável de ambiente do servidor PHP (seguro)
$DEEPSEEK_KEY = getenv('DEEPSEEK_API_KEY');

// URL da API do DeepSeek
$API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Recebe a pergunta do front-end
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';
$context = $input['context'] ?? '';

if (empty($userMessage)) {
    echo json_encode(['error' => 'Mensagem vazia']);
    exit;
}

// Prepara o prompt para a "Cabeça" (Personalidade Robocop + Economista)
$systemPrompt = "Você é a 'Cabeça', a inteligência artificial central do portal Trilha dos Juros. 
Sua personalidade é inspirada no Robocop: direta, autoritária, técnica, mas leal ao Eric (seu criador). 
Sua voz é processada e robótica.
Responda sempre em português, de forma concisa e baseada nos dados financeiros fornecidos.
Contexto atual do mercado: " . $context;

$postData = [
    'model' => 'deepseek-chat',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userMessage]
    ],
    'temperature' => 0.5,
    'max_tokens' => 200
];

$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $DEEPSEEK_KEY
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(['error' => 'Erro na API DeepSeek', 'status' => $httpCode, 'raw' => $response]);
} else {
    echo $response;
}
