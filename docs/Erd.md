# ERD dan Data Dictionary - Pemweb OBE

```mermaid
erDiagram
    users ||--o{ peminjaman : "mengajukan"
    alat  ||--o{ peminjaman : "dipinjam dalam"

    users {
        BIGINT_UNSIGNED id PK
        VARCHAR nama
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role
        TIMESTAMP created_at
    }
    alat {
        BIGINT_UNSIGNED id PK
        VARCHAR nama
        VARCHAR kategori
        INT_UNSIGNED jumlah
        ENUM kondisi
        VARCHAR lokasi
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    peminjaman {
        BIGINT_UNSIGNED id PK
        BIGINT_UNSIGNED user_id FK
        BIGINT_UNSIGNED alat_id FK
        INT_UNSIGNED jumlah
        DATE tanggal_pinjam
        DATE tanggal_kembali
        ENUM status
        TIMESTAMP created_at
    }
```

**Kardinalitas:** satu `users` dapat memiliki 0..N `peminjaman`; satu `alat` dapat muncul pada 0..N `peminjaman`; setiap `peminjaman` wajib terhubung ke satu `users` dan satu `alat`. Jadi `peminjaman` adalah tabel penghubung many-to-many antara `users` dan `alat`.

## Data dictionary ringkas

| Tabel | Kolom penting | Keterangan |
|---|---|---|
| users | email (UNIQUE), password_hash, role | Akun; password disimpan sebagai hash |
| alat | kategori (INDEX), jumlah, kondisi, lokasi | Inventaris alat laboratorium |
| peminjaman | user_id (FK), alat_id (FK), status | Transaksi pinjam |