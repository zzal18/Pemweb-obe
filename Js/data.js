// ====== Konfigurasi ======
// false = API publik JSONPlaceholder, true = file lokal data/users.json (offline)
const USE_LOCAL_DATA = false;
const ENDPOINT = USE_LOCAL_DATA
    ? './data/users.json'
    : 'https://jsonplaceholder.typicode.com/users';
const DEBOUNCE_MS = 300;

// ====== Elemen DOM ======
const output = document.querySelector('#api-output');
const message = document.querySelector('#api-message');
const retryBtn = document.querySelector('#retry-btn');
const searchInput = document.querySelector('#search');

// Cache hasil fetch: filter memakai data ini, tidak memanggil API lagi.
let allUsers = [];

function setMessage(text, type = '') {
    message.textContent = text;
    message.className = `status ${type}`.trim(); // '', 'success', atau 'error'
}

// Render aman: textContent, bukan innerHTML
function renderUsers(users) {
    output.replaceChildren();
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} - ${user.email}`;
        output.append(li);
    });
}

//LATIHAN 1 (tombol retry) ======
async function loadUsers() {
    retryBtn.hidden = true;
    searchInput.disabled = true;
    output.replaceChildren();
    setMessage('Memuat data...'); // loading state

    try {
        const response = await fetch(ENDPOINT);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        allUsers = await response.json();

        if (allUsers.length === 0) {
            setMessage('Data kosong.'); // empty state
            return;
        }

        renderUsers(allUsers);
        setMessage(`Berhasil memuat ${allUsers.length} data.`, 'success');
        searchInput.disabled = false;
    } catch (error) {
        console.error(error);
        setMessage(`Data belum dapat dimuat (${error.message}). Coba kembali.`, 'error');
        retryBtn.hidden = false; // LATIHAN 1: retry muncul hanya saat gagal
    }
}

retryBtn.addEventListener('click', loadUsers);

// ====== LATIHAN 2: filter lokal + debounce ======
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function filterUsers() {
    const keyword = searchInput.value.trim().toLowerCase();
    const result = allUsers.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );

    renderUsers(result);

    if (result.length === 0) {
        setMessage(`Tidak ada hasil untuk "${searchInput.value.trim()}".`);
    } else {
        setMessage(`Menampilkan ${result.length} dari ${allUsers.length} data.`, 'success');
    }
}

searchInput.addEventListener('input', debounce(filterUsers, DEBOUNCE_MS));

// ====== LATIHAN 3: contoh POST ======
const newUser = {
    name: 'Budi Santoso',
    username: 'budis',
    email: 'budi@example.com',
    phone: '0812-3456-7890',
    website: 'budi.example.com'
};

const postBodyEl = document.querySelector('#post-body');
const postBtn = document.querySelector('#post-btn');
const postMessage = document.querySelector('#post-message');
const postResponse = document.querySelector('#post-response');

postBodyEl.textContent = JSON.stringify(newUser, null, 2);

async function createUser() {
    postBtn.disabled = true;
    postMessage.textContent = 'Mengirim data...';
    postResponse.hidden = true;

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(newUser) // object -> string JSON
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const created = await response.json();
        postMessage.textContent = `Berhasil. Status: ${response.status} (Created).`;
        postResponse.textContent = JSON.stringify(created, null, 2);
        postResponse.hidden = false;
    } catch (error) {
        console.error(error);
        postMessage.textContent = `Gagal mengirim data (${error.message}).`;
    } finally {
        postBtn.disabled = false;
    }
}

postBtn.addEventListener('click', createUser);

// ====== Jalankan ======
loadUsers();