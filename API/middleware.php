<?php
declare(strict_types=1);

/**
 * Exception khusus untuk error yang BOLEH dilihat client (4xx).
 * Error tak terduga (DB, dll.) tidak memakai kelas ini -> jadi 500 generik.
 */
final class ApiException extends RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $fields = []
    ) {
        parent::__construct($message);
    }
}

/** Kirim response JSON sukses. */
function sendJson(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Kirim error dengan format konsisten: {error:{code,message,fields}} */
function sendError(int $status, string $code, string $message, array $fields = []): never
{
    http_response_code($status);
    echo json_encode(
        ['error' => ['code' => $code, 'message' => $message, 'fields' => (object) $fields]],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

function requireJsonContentType(): void
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== 0) {
        throw new ApiException(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type harus application/json');
    }
}

/** Baca & validasi body JSON (harus object). */
function readJsonBody(): array
{
    requireJsonContentType();
    try {
        $payload = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new ApiException(400, 'INVALID_JSON', 'Format JSON tidak valid');
    }
    if (!is_array($payload) || array_is_list($payload)) {
        throw new ApiException(400, 'INVALID_BODY', 'Body JSON harus berupa object');
    }
    return $payload;
}
