CREATE DATABASE IF NOT EXISTS pemweb_obe
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pemweb_obe;

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama          VARCHAR(100) NOT NULL,
    email         VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','petugas','viewer') NOT NULL DEFAULT 'viewer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alat (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama       VARCHAR(120) NOT NULL,
    kategori   VARCHAR(80)  NOT NULL,
    jumlah     INT UNSIGNED NOT NULL DEFAULT 0,
    kondisi    ENUM('Baik','Perlu Cek','Rusak') NOT NULL DEFAULT 'Baik',
    lokasi     VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alat_kategori (kategori)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS peminjaman (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    alat_id         BIGINT UNSIGNED NOT NULL,
    jumlah          INT UNSIGNED NOT NULL DEFAULT 1,
    tanggal_pinjam  DATE NOT NULL,
    tanggal_kembali DATE NULL,
    status          ENUM('Diajukan','Dipinjam','Selesai','Ditolak') NOT NULL DEFAULT 'Diajukan',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_peminjaman_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_peminjaman_alat FOREIGN KEY (alat_id) REFERENCES alat(id)
) ENGINE=InnoDB;