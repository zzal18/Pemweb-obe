<?php
declare(strict_types=1);
require_once __DIR__ . '/../vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode(['name' => 'Pemweb OBE API', 'version' => '1.0']);