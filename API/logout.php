<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/auth.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Allow: POST');
        throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Logout harus memakai POST');
    }

    startSecureSession();
    if (!empty($_SESSION['user_id'])) {
        requireCsrf();   // cegah logout paksa dari situs lain
    }
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $params['path'],
            'domain'   => $params['domain'],
            'secure'   => (bool) $params['secure'],
            'httponly' => (bool) $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax',
        ]);
    }
    session_destroy();

    sendJson(200, ['message' => 'Logout berhasil']);
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[logout] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}