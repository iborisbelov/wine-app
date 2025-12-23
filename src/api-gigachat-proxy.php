<?php
/**
 * GigaChat API Proxy для WordPress
 * Обходит CORS и защищает credentials на сервере
 * 
 * Endpoint: https://uncork.ru/api-gigachat-proxy.php
 * 
 * УСТАНОВКА:
 * 1. Загрузите этот файл в корень WordPress
 * 2. Замените AUTH_BASIC на ваш ключ авторизации
 * 3. Убедитесь что SSL сертификат установлен или отключите verify
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 🔐 ВАЖНО: Замените на ваш реальный ключ авторизации
define('GIGACHAT_AUTH_BASIC', 'MDE5YjNkMTMtMDNjMC03YjkwLWEyYzYtNDY4NDI2NjNiZGVlOjYzYmFmMjU2LWI5ZGUtNGZkNC1iZTFmLWE5NDkzOGZkZTljNg==');
define('GIGACHAT_SCOPE', 'GIGACHAT_API_PERS');
define('GIGACHAT_OAUTH_URL', 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth');
define('GIGACHAT_CHAT_URL', 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions');

// Cache для токена (в transient на 25 минут)
$cache_key = 'gigachat_access_token';
$cache_expiry_key = 'gigachat_token_expires_at';

/**
 * Генерация RqUID (GUID)
 */
function generate_rquid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Получить access token от GigaChat OAuth API
 */
function get_gigachat_token() {
    global $cache_key, $cache_expiry_key;
    
    // Проверяем кэш
    $cached_token = get_transient($cache_key);
    $expires_at = get_transient($cache_expiry_key);
    
    if ($cached_token && $expires_at && time() < $expires_at - 60) {
        error_log('✅ Using cached GigaChat token');
        return $cached_token;
    }
    
    // Запрашиваем новый токен
    $rq_uid = generate_rquid();
    
    error_log('🔑 Requesting new GigaChat access token...');
    
    $response = wp_remote_post(GIGACHAT_OAUTH_URL, [
        'headers' => [
            'Accept' => 'application/json',
            'RqUID' => $rq_uid,
            'Authorization' => 'Basic ' . GIGACHAT_AUTH_BASIC,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ],
        'body' => 'scope=' . GIGACHAT_SCOPE,
        'timeout' => 30,
        'sslverify' => false, // ⚠️ Отключение проверки SSL (для тестирования)
    ]);
    
    if (is_wp_error($response)) {
        error_log('❌ GigaChat OAuth error: ' . $response->get_error_message());
        return null;
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if (!isset($data['access_token'])) {
        error_log('❌ No access_token in response: ' . $body);
        return null;
    }
    
    $access_token = $data['access_token'];
    $expires_at = isset($data['expires_at']) ? $data['expires_at'] / 1000 : time() + 1800; // 30 минут
    
    // Сохраняем в кэш на 25 минут (с запасом)
    set_transient($cache_key, $access_token, 1500);
    set_transient($cache_expiry_key, $expires_at, 1500);
    
    error_log('✅ GigaChat token received, expires at: ' . date('H:i:s', $expires_at));
    
    return $access_token;
}

/**
 * Отправить запрос в GigaChat Chat API
 */
function send_gigachat_request($messages) {
    $access_token = get_gigachat_token();
    
    if (!$access_token) {
        return ['error' => 'Failed to get access token'];
    }
    
    $request_body = [
        'model' => 'GigaChat',
        'messages' => $messages,
        'temperature' => 0.7,
    ];
    
    error_log('🤖 Sending request to GigaChat... ' . count($messages) . ' messages');
    
    $response = wp_remote_post(GIGACHAT_CHAT_URL, [
        'headers' => [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json; charset=utf-8',
        ],
        'body' => json_encode($request_body, JSON_UNESCAPED_UNICODE),
        'timeout' => 60,
        'sslverify' => false, // ⚠️ Отключение проверки SSL (для тестирования)
    ]);
    
    if (is_wp_error($response)) {
        error_log('❌ GigaChat API error: ' . $response->get_error_message());
        return ['error' => $response->get_error_message()];
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if (!isset($data['choices']) || count($data['choices']) === 0) {
        error_log('❌ No choices in GigaChat response: ' . $body);
        return ['error' => 'No choices in response', 'raw' => $body];
    }
    
    $ai_response = $data['choices'][0]['message']['content'];
    
    error_log('✅ GigaChat response: ' . strlen($ai_response) . ' chars');
    
    return [
        'success' => true,
        'response' => $ai_response,
        'usage' => isset($data['usage']) ? $data['usage'] : null,
    ];
}

// Получаем входные данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid request. Expected JSON with "messages" field',
        'received' => $input
    ]);
    exit;
}

// Отправляем запрос в GigaChat
$result = send_gigachat_request($data['messages']);

// Возвращаем результат
if (isset($result['error'])) {
    http_response_code(500);
    echo json_encode($result);
} else {
    echo json_encode($result);
}

exit;
