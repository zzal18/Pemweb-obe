const form = document.querySelector('#form-alat');
const status = document.querySelector('#form-status');
const preview = document.querySelector('#preview');
const previewList = document.querySelector('#preview-list');

const KATEGORI_VALID = ['elektronik', 'mekanik', 'jaringan', 'lainnya'];
const KONDISI_VALID = ['baik', 'rusak-ringan', 'rusak-berat'];

function getHariIni() {
    const now = new Date();
    const bulan = String(now.getMonth() + 1).padStart(2, '0'); 
    const hari = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${bulan}-${hari}`;
}

form.elements.tanggal.max = getHariIni();

function validateForm(data) {
    const errors = {};

    const nama = String(data.get('nama') ?? '').trim();
    const kategori = String(data.get('kategori') ?? '');
    const jumlahRaw = String(data.get('jumlah') ?? '').trim();
    const kondisi = String(data.get('kondisi') ?? '');
    const tanggal = String(data.get('tanggal') ?? '');

if (nama === '') {
    errors.nama = 'Nama alat wajib diisi.';
    } else if (nama.length < 3) {
    errors.nama = 'Nama alat minimal 3 karakter.';
    } else if (!/^[\p{L}\p{N}\s.\-\/()]+$/u.test(nama)) {
    errors.nama = 'Nama alat hanya boleh berisi huruf, angka, spasi, dan tanda . - / ( ).';
}

if (kategori === '') {
    errors.kategori = 'Pilih salah satu kategori.';
    } else if (!KATEGORI_VALID.includes(kategori)) {
    errors.kategori = 'Kategori tidak tersedia. Pilih dari daftar.';
}

    const jumlah = Number(jumlahRaw);
    if (form.elements.jumlah.validity.badInput) {
    errors.jumlah = 'Format jumlah tidak valid. Isi dengan angka bulat, misalnya 5.';
    } else if (jumlahRaw === '') {
    errors.jumlah = 'Jumlah wajib diisi.';
    } else if (!Number.isInteger(jumlah) || jumlah < 0) {
    errors.jumlah = 'Jumlah harus bilangan bulat 0 atau lebih.';
    }

if (kondisi === '') {
    errors.kondisi = 'Pilih kondisi alat.';
    } else if (!KONDISI_VALID.includes(kondisi)) {
    errors.kondisi = 'Kondisi tidak valid. Pilih dari daftar.';
}

if (form.elements.tanggal.validity.badInput) {
    errors.tanggal = 'Format tanggal tidak valid. Lengkapi hari, bulan, dan tahun.';
    } else if (tanggal === '') {
    errors.tanggal = 'Tanggal perolehan wajib diisi.';
    } else if (Number.isNaN(Date.parse(tanggal))) {
    errors.tanggal = 'Format tanggal tidak valid.';
    } else if (tanggal > getHariIni()) {
    errors.tanggal = 'Tanggal perolehan tidak boleh melebihi hari ini.';
}

return errors;
}

form.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(form);
    const errors = validateForm(data);

document.querySelectorAll('.error').forEach(el => (el.textContent = ''));
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    preview.hidden = true;

if (Object.keys(errors).length) {
    for (const [field, message] of Object.entries(errors)) {
        document.querySelector(`#error-${field}`).textContent = message;
        form.elements[field]?.setAttribute('aria-invalid', 'true');
    }
    const firstField = Object.keys(errors)[0];
    form.elements[firstField]?.focus();
    status.textContent = 'Periksa kembali data yang belum valid.';
    return;
}

status.textContent = 'Data valid dan siap dikirim.';
    showPreview(data);
});

function showPreview(data) {
    const labels = {
    nama: 'Nama alat',
    kategori: 'Kategori',
    jumlah: 'Jumlah',
    kondisi: 'Kondisi',
    tanggal: 'Tanggal perolehan'
};

previewList.replaceChildren();
for (const [key, label] of Object.entries(labels)) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = String(data.get(key)).trim();
    previewList.append(dt, dd);
}
preview.hidden = false;
}