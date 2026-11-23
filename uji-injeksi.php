<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/API/middleware.php';
require_once __DIR__ . '/API/auth.php';

// File latihan Modul 13: versi SETELAH perbaikan (prepared statement + wajib login).
try {
    startSecureSession();
    requireRole(['admin', 'petugas', 'viewer']);
    require_once __DIR__ . '/config/database.php';

    $k = trim((string) ($_GET['kategori'] ?? ''));
    $stmt = db()->prepare('SELECT nama FROM alat WHERE kategori = :kategori');
    $stmt->execute(['kategori' => $k]);
    sendJson(200, ['data' => $stmt->fetchAll()]);
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[uji-injeksi] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}