<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/auth.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET');
        throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method tidak diizinkan');
    }
    startSecureSession();
    requireLogin();   // token hanya untuk session yang sudah login
    sendJson(200, ['data' => ['csrf_token' => csrfToken()]]);
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[csrf] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}