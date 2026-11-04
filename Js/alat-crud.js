const API_URL = 'API/alats.php';
const PER_PAGE = 5;
const DEBOUNCE_MS = 300;

const form = document.querySelector('#form-alat');
const pesan = document.querySelector('#pesan');
const tabel = document.querySelector('#tabel-alat');
const cari = document.querySelector('#cari');
const filterKategori = document.querySelector('#filter-kategori');
const btnPrev = document.querySelector('#btn-prev');
const btnNext = document.querySelector('#btn-next');
const infoHalaman = document.querySelector('#info-halaman');
const btnBatal = document.querySelector('#btn-batal');
const judulForm = document.querySelector('#judul-form');
const FIELDS = ['nama', 'kategori', 'jumlah', 'kondisi', 'lokasi'];

let page = 1;
let totalPages = 1;

function setPesan(teks, type = '') {
  pesan.textContent = teks;
  pesan.className = type;
}

function clearErrors() {
  document.querySelectorAll('.error[id^="error-"]').forEach(el => (el.textContent = ''));
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
}

function showFieldErrors(fields = {}) {
  for (const [field, msg] of Object.entries(fields)) {
    const el = document.querySelector(`#error-${field}`);
    if (el) el.textContent = msg;
    form.elements[field]?.setAttribute('aria-invalid', 'true');
  }
}

// Wrapper fetch: melempar ApiError berisi status, message, dan fields dari server.
class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options.headers ?? {}) }
    });
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server.');
  }
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error?.message ?? `HTTP ${response.status}`,
      payload.error?.fields ?? {}
    );
  }
  return payload;
}

// ---------- READ ----------
async function loadAlat() {
  const params = new URLSearchParams({ page, per_page: PER_PAGE });
  if (cari.value.trim()) params.set('q', cari.value.trim());
  if (filterKategori.value) params.set('kategori', filterKategori.value);

  try {
    const { data, meta } = await request(`${API_URL}?${params}`);
    totalPages = meta.total_pages;

    // Jika halaman saat ini kosong (mis. setelah hapus item terakhir), mundur satu halaman.
    if (data.length === 0 && page > 1) {
      page = totalPages;
      return loadAlat();
    }

    renderTabel(data);
    infoHalaman.textContent = `Halaman ${meta.page} dari ${meta.total_pages} (${meta.total} data)`;
    btnPrev.disabled = meta.page <= 1;
    btnNext.disabled = meta.page >= meta.total_pages;
    setPesan(data.length ? `Menampilkan ${data.length} data.` : 'Data tidak ditemukan.');
  } catch (err) {
    setPesan(`Gagal memuat data: ${err.message}`, 'error');
  }
}

function renderTabel(items) {
  tabel.replaceChildren();
  for (const item of items) {
    const tr = document.createElement('tr');
    for (const key of FIELDS) {
      const td = document.createElement('td');
      td.textContent = item[key] ?? '-';
      tr.append(td);
    }

    const aksi = document.createElement('td');
    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.textContent = 'Edit';
    btnEdit.addEventListener('click', () => mulaiEdit(item));

    const btnHapus = document.createElement('button');
    btnHapus.type = 'button';
    btnHapus.textContent = 'Hapus';
    btnHapus.addEventListener('click', () => hapusAlat(item.id));

    aksi.append(btnEdit, ' ', btnHapus);
    tr.append(aksi);
    tabel.append(tr);
  }
}

// ---------- CREATE & UPDATE ----------
form.addEventListener('submit', async event => {
  event.preventDefault();
  clearErrors();

  const body = {};
  for (const f of FIELDS) body[f] = form.elements[f].value;
  body.jumlah = body.jumlah === '' ? null : Number(body.jumlah);

  const id = form.elements.id.value;
  const isEdit = id !== '';
  const url = isEdit ? `${API_URL}?id=${encodeURIComponent(id)}` : API_URL;

  try {
    await request(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setPesan(isEdit ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.', 'success');
    resetForm();
    if (!isEdit) page = 1;
    await loadAlat();
    // loadAlat menimpa pesan; tampilkan lagi konfirmasi sukses
    setPesan(isEdit ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.', 'success');
  } catch (err) {
    showFieldErrors(err.fields);
    setPesan(err.message, 'error');
  }
});

function mulaiEdit(item) {
  clearErrors();
  form.elements.id.value = item.id;
  for (const f of FIELDS) form.elements[f].value = item[f] ?? '';
  judulForm.textContent = `Edit Alat #${item.id}`;
  btnBatal.hidden = false;
  form.elements.nama.focus();
}

function resetForm() {
  form.reset();
  form.elements.id.value = '';
  judulForm.textContent = 'Tambah Alat';
  btnBatal.hidden = true;
  clearErrors();
}
btnBatal.addEventListener('click', resetForm);

// ---------- DELETE ----------
async function hapusAlat(id) {
  if (!confirm('Hapus data ini?')) return;
  try {
    await request(`${API_URL}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (form.elements.id.value === String(id)) resetForm();
    await loadAlat();
    setPesan('Data berhasil dihapus.', 'success');
  } catch (err) {
    setPesan(`Gagal menghapus: ${err.message}`, 'error');
  }
}

// ---------- Search / filter / pagination ----------
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
cari.addEventListener('input', debounce(() => { page = 1; loadAlat(); }, DEBOUNCE_MS));
filterKategori.addEventListener('change', () => { page = 1; loadAlat(); });
btnPrev.addEventListener('click', () => { if (page > 1) { page--; loadAlat(); } });
btnNext.addEventListener('click', () => { if (page < totalPages) { page++; loadAlat(); } });

loadAlat();
