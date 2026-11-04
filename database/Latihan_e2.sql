ALTER TABLE peminjaman
  ADD COLUMN keperluan VARCHAR(255) NULL AFTER jumlah,
  ADD COLUMN petugas_id BIGINT UNSIGNED NULL AFTER status,
  ADD CONSTRAINT fk_peminjaman_petugas
    FOREIGN KEY (petugas_id) REFERENCES users(id) ON DELETE SET NULL;