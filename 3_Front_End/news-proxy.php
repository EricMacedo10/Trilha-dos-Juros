<?php
/**
 * Trilha dos Juros - News Proxy
 * Usa file_get_contents com stream context para compatibilidade máxima com Hostinger.
 */

header('Access-Control-Allow-Origin: *');

$url = '';
if (isset($_GET['b64url'])) {
    $url = base64_decode($_GET['b64url']);
} elseif (isset($_GET['url'])) {
    $url = $_GET['url'];
}

if (empty($url)) {
    http_response_code(400);
    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><error>URL missing</error>';
    exit;
}

// Lista de domínios permitidos
$allowed_domains = [
    'infomoney.com.br', 'valor.globo.com', 'estadao.com.br', 'globo.com', 'ebc.com.br',
    'yahoo.com', 'hgbrasil.com', 'brapi.dev', 'awesomeapi.com.br'
];
$parsed_url = parse_url($url);
$domain_allowed = false;

if (isset($parsed_url['host'])) {
    foreach ($allowed_domains as $allowed) {
        if (strpos($parsed_url['host'], $allowed) !== false) {
            $domain_allowed = true;
            break;
        }
    }
}

if (!$domain_allowed) {
    http_response_code(403);
    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><error>Domain not allowed</error>';
    exit;
}

// Dynamically set Content-Type
$is_json = (strpos($url, 'yahoo.com') !== false || strpos($url, 'hgbrasil.com') !== false || strpos($url, 'brapi.dev') !== false || strpos($url, 'awesomeapi.com.br') !== false);
if ($is_json) {
    header('Content-Type: application/json; charset=utf-8');
} else {
    header('Content-Type: application/xml; charset=utf-8');
}

$opts = [
    'http' => [
        'method' => 'GET',
        'header' => implode("\r\n", [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: pt-BR,pt;q=0.9,en;q=0.7',
        ]),
        'timeout' => 15,
        'follow_location' => 1,
        'ignore_errors' => true,
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ]
];

$context = stream_context_create($opts);

// Tenta com curl se disponível, senão usa file_get_contents
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/xml,text/xml,*/*']);

    $data = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($data && $http_code === 200) {
        http_response_code(200);
        echo $data;
        exit;
    }
}

// Fallback: file_get_contents
$data = @file_get_contents($url, false, $context);

if ($data === false || empty($data)) {
    http_response_code(502);
    echo '<?xml version="1.0" encoding="UTF-8"?><error>Failed to fetch feed</error>';
    exit;
}

http_response_code(200);
echo $data;
