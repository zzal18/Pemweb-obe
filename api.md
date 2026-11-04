# Dokumentasi API - Resource `alat`

Base URL: `http://localhost/pemweb-obe/API/alats.php`

Format error semua endpoint:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Data tidak valid", "fields": { "jumlah": "Jumlah harus bilangan bulat 0 atau lebih" } } }
```

| Method | Path | Tujuan | Parameter / Body | Sukses | Gagal |
|---|---|---|---|---|---|
| GET | `/API/alats.php` | Daftar alat | Query: `kategori`, `q` (cari nama), `page` (default 1), `per_page` (1-100, default 10) | 200 `{data:[...], meta:{page,per_page,total,total_pages}}` | 400 parameter tidak valid; 500 |
| GET | `/API/alats.php?id={id}` | Detail satu alat | Query: `id` (int >= 1) | 200 `{data:{...}}` | 400 id tidak valid; 404 tidak ditemukan; 500 |
| POST | `/API/alats.php` | Tambah alat | JSON: `nama`*, `kategori`*, `jumlah`*, `kondisi` (Baik/Perlu Cek/Rusak), `lokasi` | 201 `{data:{...}}` + header `Location` | 400 JSON rusak; 415 bukan JSON; 422 validasi; 500 |
| PUT | `/API/alats.php?id={id}` | Ganti seluruh data | Query `id` + JSON lengkap seperti POST | 200 `{data:{...}}` | 400; 404; 415; 422; 500 |
| PATCH | `/API/alats.php?id={id}` | Ubah sebagian field | Query `id` + JSON field yang diubah | 200 `{data:{...}}` | 400; 404; 415; 422; 500 |
| DELETE | `/API/alats.php?id={id}` | Hapus alat | Query `id` | 204 tanpa body | 400; 404; 409 masih dipakai peminjaman; 500 |

Method lain -> 405 `METHOD_NOT_ALLOWED` (header `Allow` berisi method yang didukung).

## Contoh

```
GET /API/alats.php?kategori=Jaringan&q=router&page=1&per_page=5
-> 200 {"data":[{"id":1,"nama":"Router","kategori":"Jaringan","jumlah":4,"kondisi":"Baik","lokasi":"Lab Jaringan"}],
        "meta":{"page":1,"per_page":5,"total":1,"total_pages":1}}

POST /API/alats.php   {"nama":"","kategori":"Jaringan","jumlah":-1}
-> 422 {"error":{"code":"VALIDATION_ERROR","message":"Data tidak valid",
        "fields":{"nama":"Nama wajib diisi, maksimal 120 karakter","jumlah":"Jumlah harus bilangan bulat 0 atau lebih"}}}

GET /API/alats.php?id=9999
-> 404 {"error":{"code":"NOT_FOUND","message":"Data alat tidak ditemukan","fields":{}}}
```
