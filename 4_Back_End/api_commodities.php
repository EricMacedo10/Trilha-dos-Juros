<?php
/**
 * PROXY DE SEGURANÇA - TRILHA DOS JUROS
 * Objetivo: Esconder a API Key e economizar créditos via Cache Local.
 */

// CONFIGURAÇÃO
$apiKey = '0652c687-3f50-4b95-8c7c-670f9c77923c';
$cacheFileLatest = 'cache_latest.json';
$cacheFileHist = 'cache_historical.json';
$cacheTimeLatest = 1800; // 30 minutos (em segundos)
$base_url = 'https://api.commoditypriceapi.com/v2';

// Captura os parâmetros da URL (symbols e action)
$action = isset($_GET['action']) ? $_GET['action'] : 'latest'; // 'latest' ou 'historical'
$symbols = isset($_GET['symbols']) ? $_GET['symbols'] : '';
$date = isset($_GET['date']) ? $_GET['date'] : '';

$cacheFile = ($action == 'historical') ? "cache_hist_" . $date . ".json" : $cacheFileLatest;
$cacheLimit = ($action == 'historical') ? 86400 : $cacheTimeLatest; // Histórico guardamos por 24h

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permite que o JS do site acesse o PHP

// 1. Verifica se temos uma cópia recente salva (Cache)
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheLimit)) {
    echo file_get_contents($cacheFile);
    exit;
}

// 2. Se não tem cache ou expirou, busca na API oficial
$url = $base_url . "/rates/" . $action . "?apiKey=" . $apiKey . "&symbols=" . $symbols;
if ($action == 'historical' && !empty($date)) {
    $url .= "&date=" . $date;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, HTTP_CODE);
curl_close($ch);

// 3. Se a busca deu certo, salva no cache e entrega pro site
if ($httpCode == 200 && !empty($response)) {
    file_put_contents($cacheFile, $response);
    echo $response;
} else {
    // Se a API falhou por algum motivo, tenta entregar o cache antigo mesmo que expirado
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "API Indisponível"]);
    }
}
?>
