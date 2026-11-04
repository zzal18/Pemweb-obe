<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/middleware.php';

const KONDISI_VALID = ['Baik', 'Perlu Cek', 'Rusak'];

/** Validasi id dari query string. Mengembalikan null bila tidak ada. */
function readId(): ?int
{
    if (!isset($_GET['id'])) {
        return null;
    }
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) {
        throw new ApiException(400, 'INVALID_ID', 'Parameter id harus bilangan bulat positif');
    }
    return $id;
}

/** Validasi input alat. Mengembalikan data bersih, atau melempar 422 + detail per field. */
function validateAlat(array $in): array
{
    $errors = [];

    $nama     = trim((string) ($in['nama'] ?? ''));
    $kategori = trim((string) ($in['kategori'] ?? ''));
    $kondisi  = trim((string) ($in['kondisi'] ?? 'Baik'));
    $lokasiIn = $in['lokasi'] ?? null;
    $lokasi   = $lokasiIn === null ? '' : trim((string) $lokasiIn);
    $jumlah   = filter_var($in['jumlah'] ?? null, FILTER_VALIDATE_INT);

    if ($nama === '' || mb_strlen($nama) > 120) {
        $errors['nama'] = 'Nama wajib diisi, maksimal 120 karakter';
    }
    if ($kategori === '' || mb_strlen($kategori) > 80) {
        $errors['kategori'] = 'Kategori wajib diisi, maksimal 80 karakter';
    }
    if ($jumlah === false || $jumlah < 0) {
        $errors['jumlah'] = 'Jumlah harus bilangan bulat 0 atau lebih';
    }
    if (!in_array($kondisi, KONDISI_VALID, true)) {
        $errors['kondisi'] = 'Kondisi harus salah satu dari: ' . implode(', ', KONDISI_VALID);
    }
    if (mb_strlen($lokasi) > 120) {
        $errors['lokasi'] = 'Lokasi maksimal 120 karakter';
    }

    if ($errors) {
        throw new ApiException(422, 'VALIDATION_ERROR', 'Data tidak valid', $errors);
    }

    return [
        'nama'     => $nama,
        'kategori' => $kategori,
        'jumlah'   => $jumlah,
        'kondisi'  => $kondisi,
        'lokasi'   => $lokasi === '' ? null : $lokasi,
    ];
}

function findAlat(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT id, nama, kategori, jumlah, kondisi, lokasi FROM alat WHERE id = :id'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

function normalizeRow(array $row): array
{
    $row['id']     = (int) $row['id'];
    $row['jumlah'] = (int) $row['jumlah'];
    return $row;
}

try {
    require_once dirname(__DIR__) . '/config/database.php';
    $pdo    = db();
    $method = $_SERVER['REQUEST_METHOD'];
    $id     = readId();

    switch ($method) {
        // ---------- READ ----------
        case 'GET':
            if ($id !== null) {
                $row = findAlat($pdo, $id);
                if ($row === null) {
                    throw new ApiException(404, 'NOT_FOUND', 'Data alat tidak ditemukan');
                }
                sendJson(200, ['data' => normalizeRow($row)]);
            }

            // Collection: filter kategori + search nama + pagination
            $kategori = trim((string) ($_GET['kategori'] ?? ''));
            $q        = trim((string) ($_GET['q'] ?? ''));

            $page = filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            $per  = filter_var($_GET['per_page'] ?? 10, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100]]);
            if ($page === false || $per === false) {
                throw new ApiException(400, 'INVALID_PARAMETER', 'page harus >= 1 dan per_page antara 1 sampai 100');
            }

            $where  = [];
            $params = [];
            if ($kategori !== '') {
                $where[] = 'kategori = :kategori';
                $params['kategori'] = $kategori;
            }
            if ($q !== '') {
                $where[] = 'nama LIKE :q';
                $params['q'] = '%' . addcslashes($q, '%_\\') . '%';
            }
            $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM alat $whereSql");
            $stmt->execute($params);
            $total = (int) $stmt->fetchColumn();

            $stmt = $pdo->prepare(
                "SELECT id, nama, kategori, jumlah, kondisi, lokasi
                FROM alat $whereSql ORDER BY id DESC LIMIT :limit OFFSET :offset"
            );
            foreach ($params as $k => $v) {
                $stmt->bindValue(':' . $k, $v);
            }
            $stmt->bindValue(':limit', $per, PDO::PARAM_INT);
            $stmt->bindValue(':offset', ($page - 1) * $per, PDO::PARAM_INT);
            $stmt->execute();

            sendJson(200, [
                'data' => array_map('normalizeRow', $stmt->fetchAll()),
                'meta' => [
                    'page'        => $page,
                    'per_page'    => $per,
                    'total'       => $total,
                    'total_pages' => max(1, (int) ceil($total / $per)),
                ],
            ]);

        // ---------- CREATE ----------
        case 'POST':
            if ($id !== null) {
                throw new ApiException(400, 'INVALID_REQUEST', 'POST tidak menerima parameter id');
            }
            $data = validateAlat(readJsonBody());
            $stmt = $pdo->prepare(
                'INSERT INTO alat (nama, kategori, jumlah, kondisi, lokasi)
                VALUES (:nama, :kategori, :jumlah, :kondisi, :lokasi)'
            );
            $stmt->execute($data);
            $newId = (int) $pdo->lastInsertId();

            header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?') . '?id=' . $newId);
            sendJson(201, ['data' => normalizeRow(findAlat($pdo, $newId))]);

        // ---------- UPDATE ----------
        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                throw new ApiException(400, 'INVALID_ID', 'Parameter id wajib diisi');
            }
            $existing = findAlat($pdo, $id);
            if ($existing === null) {
                throw new ApiException(404, 'NOT_FOUND', 'Data alat tidak ditemukan');
            }
            $input = readJsonBody();
            // PUT = ganti penuh; PATCH = gabungkan dengan data lama
            $merged = $method === 'PATCH' ? array_merge($existing, $input) : $input;
            $data   = validateAlat($merged);
            $data['id'] = $id;

            $stmt = $pdo->prepare(
                'UPDATE alat SET nama = :nama, kategori = :kategori, jumlah = :jumlah,
                                kondisi = :kondisi, lokasi = :lokasi
                WHERE id = :id'
            );
            $stmt->execute($data);
            sendJson(200, ['data' => normalizeRow(findAlat($pdo, $id))]);

        // ---------- DELETE ----------
        case 'DELETE':
            if ($id === null) {
                throw new ApiException(400, 'INVALID_ID', 'Parameter id wajib diisi');
            }
            if (findAlat($pdo, $id) === null) {
                throw new ApiException(404, 'NOT_FOUND', 'Data alat tidak ditemukan');
            }
            try {
                $stmt = $pdo->prepare('DELETE FROM alat WHERE id = :id');
                $stmt->execute(['id' => $id]);
            } catch (PDOException $e) {
                // 23000 = pelanggaran constraint (alat masih dipakai di tabel peminjaman)
                if ($e->getCode() === '23000') {
                    throw new ApiException(409, 'CONFLICT', 'Alat tidak dapat dihapus karena masih dipakai data peminjaman');
                }
                throw $e;
            }
            http_response_code(204);
            exit;

        default:
            header('Allow: GET, POST, PUT, PATCH, DELETE');
            throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'Method tidak diizinkan');
    }
} catch (ApiException $e) {
    sendError($e->status, $e->errorCode, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    // Detail internal hanya ke log server, client menerima pesan generik.
    error_log('[alats] ' . get_class($e) . ': ' . $e->getMessage());
    sendError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server');
}