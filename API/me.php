<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/auth.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET');
        throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method tidak diizinkan');
    }

    startSecureSession();
    requireLogin();   // belum login -> 401

    require_once dirname(__DIR__) . '/config/database.php';

    // password_hash TIDAK ikut di-SELECT
    $stmt = db()->prepare('SELECT id, nama, email, role, created_at FROM users WHERE id = :id');
    $stmt->execute(['id' => (int) $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user === false) {
        // User sudah dihapus sementara sessionnya masih aktif
        throw new ApiException(401, 'UNAUTHENTICATED', 'Sesi tidak valid, silakan login ulang');
    }
    $user['id'] = (int) $user['id'];

    sendJson(200, ['data' => $user]);
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[me] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}