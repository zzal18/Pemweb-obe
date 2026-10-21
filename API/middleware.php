<?php
declare(strict_types=1);

function requireJsonContentType(): void
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== 0) {
        http_response_code(415);
        echo json_encode(['error' => 'Content-Type harus application/json']);
        exit;
    }
}
