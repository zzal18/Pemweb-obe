INSERT INTO users (nama, email, password_hash, role)
VALUES ('Petugas Uji', 'petugas@example.com', 'hash_uji', 'petugas');

INSERT INTO peminjaman (user_id, alat_id, petugas_id, keperluan, tanggal_pinjam)
VALUES (1, 1, (SELECT id FROM users WHERE email='petugas@example.com'), 'uji FK petugas', CURDATE());

SELECT id, user_id, alat_id, petugas_id, keperluan FROM peminjaman;

DELETE FROM users WHERE email='petugas@example.com';

SELECT id, user_id, alat_id, petugas_id, keperluan FROM peminjaman;

DELETE FROM peminjaman WHERE keperluan='uji FK petugas';