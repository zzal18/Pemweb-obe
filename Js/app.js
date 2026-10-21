import {
  ringkasInventaris,
  filterByLokasi,
  cariAlatById,
  buatRingkasanAlat,
  filterByKondisi,
  searchByNama
} from './utils.js';

const inventaris = [
  { id: 1, nama: 'Router', kategori: 'Jaringan', jumlah: 4, kondisi: 'Baik', lokasi: 'Lab Jaringan' },
  { id: 2, nama: 'Multimeter', kategori: 'Elektronika', jumlah: 6, kondisi: 'Baik', lokasi: 'Lab Elektronika' },
  { id: 3, nama: 'Kabel UTP', kategori: 'Jaringan', jumlah: 20, kondisi: 'Perlu Cek', lokasi: 'Lab Jaringan' },
  { id: 4, nama: 'Solder', kategori: 'Elektronika', jumlah: 10, kondisi: 'Baik', lokasi: 'Lab Elektronika' },
  { id: 5, nama: 'Switch 8 Port', kategori: 'Jaringan', jumlah: 3, kondisi: 'Perlu Cek', lokasi: 'Lab Jaringan' }
];

const alatBaik = inventaris.filter(item => item.kondisi === 'Baik');
const namaAlat = inventaris.map(({ nama }) => nama);
const totalUnit = inventaris.reduce((total, item) => total + item.jumlah, 0);
const ringkasan = ringkasInventaris(inventaris);

console.table(alatBaik);
console.log('Nama alat:', namaAlat);
console.log('Total unit:', totalUnit);
console.log('Ringkasan inventaris:', ringkasan);

try {
  ringkasInventaris('bukan array');
} catch (error) {
  console.warn('Tertangkap error saat validasi data:', error.message);
}

const alatLabJaringan = filterByLokasi(inventaris, 'Lab Jaringan');
const idDicari = 2;
const alatDicari = cariAlatById(inventaris, idDicari);
const daftarRingkasan = inventaris.map(buatRingkasanAlat);

console.log('Latihan E.1 - Alat di Lab Jaringan:', alatLabJaringan);
console.log('Latihan E.2 - Alat dengan id 3:', alatDicari);
console.log('Latihan E.3 - Ringkasan tiap alat:', daftarRingkasan);

function renderInventaris() {
  const ringkasanEl = document.getElementById('ringkasan-inventaris');
  const namaAlatEl = document.getElementById('daftar-nama-alat');

  if (!ringkasanEl || !namaAlatEl) return;

  ringkasanEl.replaceChildren();
  const baris = [
    `Jenis alat: ${ringkasan.jenisAlat}`,
    `Total unit: ${ringkasan.totalUnit}`,
    `Alat perlu dicek: ${ringkasan.perluCek}`
  ];
  for (const teks of baris) {
    const li = document.createElement('li');
    li.textContent = teks;
    ringkasanEl.append(li);
  }

  namaAlatEl.replaceChildren();
  for (const nama of namaAlat) {
    const li = document.createElement('li');
    li.textContent = nama;
    namaAlatEl.append(li);
  }
}

function renderLatihan() {
  const lokasiEl = document.getElementById('alat-lokasi');
  const dicariEl = document.getElementById('alat-dicari');
  const dicariJudulEl = document.getElementById('judul-alat-dicari');
  const ringkasanTeksEl = document.getElementById('ringkasan-per-alat');

  if (!lokasiEl || !dicariEl || !ringkasanTeksEl) return;

  lokasiEl.replaceChildren();
  for (const item of alatLabJaringan) {
    const li = document.createElement('li');
    li.textContent = item.nama;
    lokasiEl.append(li);
  }

  if (dicariJudulEl) {
    dicariJudulEl.textContent = `Cari Alat (id: ${idDicari})`;
  }

  dicariEl.textContent = alatDicari
    ? buatRingkasanAlat(alatDicari)
    : 'Alat tidak ditemukan';

  ringkasanTeksEl.replaceChildren();
  for (const teks of daftarRingkasan) {
    const li = document.createElement('li');
    li.textContent = teks;
    ringkasanTeksEl.append(li);
  }
}

const daftarAlatEl = document.querySelector('#daftar-alat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const inputCari = document.querySelector('#cari-alat');
const selectPerHalaman = document.querySelector('#per-halaman');
const themeButton = document.querySelector('#theme-button');
const statusEl = document.querySelector('#status-info');

let currentFilter = 'Semua';
let currentSearch = '';

function getItemsPerPage() {
  const saved = localStorage.getItem('itemsPerPage');
  return saved ? Number(saved) : 10;
}

function renderItems(items) {
  if (!daftarAlatEl) return;
  daftarAlatEl.replaceChildren();

  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'card';
    li.textContent = 'Tidak ada alat yang cocok.';
    daftarAlatEl.append(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = item.id;

    const judul = document.createElement('h4');
    judul.textContent = item.nama;

    const info = document.createElement('p');
    info.textContent = `${item.kategori} - ${item.jumlah} unit - ${item.kondisi} - ${item.lokasi}`;

    const tombolDetail = document.createElement('button');
    tombolDetail.type = 'button';
    tombolDetail.className = 'button';
    tombolDetail.textContent = 'Detail';
    tombolDetail.dataset.action = 'detail';

    li.append(judul, info, tombolDetail);
    daftarAlatEl.append(li);
  }
}

function applyPipelineAndRender() {
  const hasilFilter = filterByKondisi(inventaris, currentFilter);
  const hasilCari = searchByNama(hasilFilter, currentSearch);
  const perHalaman = getItemsPerPage();
  const ditampilkan = hasilCari.slice(0, perHalaman);

  renderItems(ditampilkan);

  if (statusEl) {
    statusEl.textContent =
      `Menampilkan ${ditampilkan.length} dari ${hasilCari.length} alat (maks ${perHalaman}/halaman).`;
  }
}

tombolFilter.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    tombolFilter.forEach(b => b.classList.toggle('active', b === button));
    applyPipelineAndRender();
  });
});

if (inputCari) {
  inputCari.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    applyPipelineAndRender();
  });
}

if (daftarAlatEl) {
  daftarAlatEl.addEventListener('click', (e) => {
    const tombol = e.target.closest('[data-action="detail"]');
    if (!tombol) return;

    const li = tombol.closest('.card');
    const id = Number(li.dataset.id);
    const item = inventaris.find(i => i.id === id);
    if (!item) return;

    alert(buatRingkasanAlat(item));
  });
}

if (selectPerHalaman) {
  selectPerHalaman.value = String(getItemsPerPage());
  selectPerHalaman.addEventListener('change', () => {
    localStorage.setItem('itemsPerPage', selectPerHalaman.value);
    applyPipelineAndRender();
  });
}

const savedTheme = localStorage.getItem('theme') ?? 'light';
document.documentElement.dataset.theme = savedTheme;

if (themeButton) {
  themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderInventaris();
  renderLatihan();
  applyPipelineAndRender();
});