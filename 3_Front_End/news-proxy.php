<?php
/**
 * Trilha dos Juros - News Proxy
 * Evita erros de CORS e bloqueios de proxies públicos buscando as notícias diretamente do servidor.
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/xml; charset=utf-8');

$url = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($url)) {
    http_response_code(400);
    echo '<?xml version="1.0" encoding="UTF-8"?><error>URL missing</error>';
    exit;
}

// Lista de domínios permitidos para segurança
$allowed_domains = ['infomoney.com.br', 'valor.globo.com', 'estadao.com.br', 'globo.com'];
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
    echo '<?xml version="1.0" encoding="UTF-8"?><error>Domain not allowed</error>';
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$data = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?><error>Curl error: ' . htmlspecialchars(curl_error($ch)) . '</error>';
} else {
    http_response_code($http_code);
    echo $data;
}

curl_close($ch);
