ALTER TABLE peminjaman
    ADD INDEX idx_peminjaman_status (status),
    ADD INDEX idx_peminjaman_tanggal (tanggal_pinjam);