<?php
declare(strict_types=1);

// Hanya boleh lewat terminal, bukan browser.
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Script seed hanya boleh dijalankan lewat CLI.');
}

require_once dirname(__DIR__) . '/config/database.php';

// Password dummy khusus lokal.
$users = [
    ['Muhammad Rizal', 'rizal@example.com',   'Admin#12345',   'admin'],
    ['Petugas Lab',    'petugas@example.com', 'Petugas#12345', 'petugas'],
    ['Viewer Lab',     'viewer@example.com',  'Viewer#12345',  'viewer'],
];

$pdo  = db();
$stmt = $pdo->prepare(
    'INSERT INTO users (nama, email, password_hash, role) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE nama = ?, password_hash = ?, role = ?'
);

foreach ($users as [$nama, $email, $password, $role]) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt->execute([$nama, $email, $hash, $role, $nama, $hash, $role]);
    echo "OK: {$email} ({$role})\n";
}