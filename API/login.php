<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/auth.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Allow: POST');
        throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method tidak diizinkan');
    }
    require_once dirname(__DIR__) . '/config/database.php';

    $in       = readJsonBody();
    $email    = trim((string) ($in['email'] ?? ''));
    $password = (string) ($in['password'] ?? '');

    if ($email === '' || $password === '') {
        throw new ApiException(422, 'VALIDATION_ERROR', 'Email dan password wajib diisi');
    }

    $stmt = db()->prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        throw new ApiException(401, 'INVALID_CREDENTIALS', 'Email atau password salah');
    }

    startSecureSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['role']    = $user['role'];
    unset($_SESSION['csrf']);   // token baru untuk session baru
    $csrf = csrfToken();

    sendJson(200, [
        'message' => 'Login berhasil',
        'data'    => ['id' => (int) $user['id'], 'nama' => $user['nama'], 'role' => $user['role'], 'csrf_token' => $csrf],
    ]);
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[login] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}