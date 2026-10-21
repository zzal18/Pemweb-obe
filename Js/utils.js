export function ringkasInventaris(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }

  return {
    jenisAlat: data.length,
    totalUnit: data.reduce((sum, item) => sum + item.jumlah, 0),
    perluCek: data.filter(item => item.kondisi !== 'Baik').length
  };
}

export function filterByLokasi(data, lokasi) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }
  return data.filter(item => item.lokasi === lokasi);
}

export function cariAlatById(data, id) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }
  return data.find(item => item.id === id);
}

export function buatRingkasanAlat(item) {
  const { nama, kategori, jumlah, kondisi, lokasi } = item;
  return `${nama} (${kategori}) - ${jumlah} unit, kondisi: ${kondisi}, lokasi: ${lokasi}`;
}

export function filterByKondisi(data, kondisi) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }
  if (kondisi === 'Semua') return data;
  return data.filter(item => item.kondisi === kondisi);
}

export function searchByNama(data, kataKunci) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }
  const kata = kataKunci.trim().toLowerCase();
  if (kata === '') return data;
  return data.filter(item => item.nama.toLowerCase().includes(kata));
}