USE pemweb_obe;

INSERT INTO alat (nama, kategori, jumlah, kondisi, lokasi) VALUES
('Router',        'Jaringan',    4,  'Baik',      'Lab Jaringan'),
('Multimeter',    'Elektronika', 6,  'Baik',      'Lab Elektronika'),
('Kabel UTP',     'Jaringan',    20, 'Perlu Cek', 'Lab Jaringan'),
('Solder',        'Elektronika', 10, 'Baik',      'Lab Elektronika'),
('Switch 8 Port', 'Jaringan',    3,  'Perlu Cek', 'Lab Jaringan');

INSERT INTO users (nama, email, password_hash, role) VALUES
('Muhammad Rizal', 'rizal@example.com', 'GANTI_DENGAN_HASH_DARI_password_hash', 'admin');c  