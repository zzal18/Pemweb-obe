<?php
declare(strict_types=1);
require_once __DIR__ . '/middleware.php';

function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $isHttps,   // false di localhost HTTP, true di production HTTPS
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function requireLogin(): void
{
    if (empty($_SESSION['user_id'])) {
        throw new ApiException(401, 'UNAUTHENTICATED', 'Silakan login terlebih dahulu');
    }
}

function requireRole(array $roles): void
{
    requireLogin();
    if (!in_array($_SESSION['role'] ?? '', $roles, true)) {
        throw new ApiException(403, 'FORBIDDEN', 'Akses ditolak: role Anda tidak diizinkan');
    }
}

/** Token CSRF per session (dibuat sekali, disimpan di session server). */
function csrfToken(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Verifikasi header X-CSRF-Token dengan hash_equals() sebelum data diproses. */
function requireCsrf(): void
{
    $expected = $_SESSION['csrf'] ?? '';
    $token    = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($expected) || $expected === '' || !hash_equals($expected, (string) $token)) {
        throw new ApiException(403, 'CSRF_INVALID', 'Token CSRF tidak valid atau tidak ada');
    }
}