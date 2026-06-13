const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Menghubungkan Express ke folder public agar file HTML, CSS, dan JS bisa dibaca browser
app.use(express.static(path.join(__dirname, 'public')));

// Rute Utama: Jika membuka localhost:3000, langsung tampilkan login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rute Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rute Dashboard Admin
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rute Jadwal Pelayanan
app.get('/jadwal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jadwal.html'));
});

// Rute Bank Lagu
app.get('/bank-lagu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bank-lagu.html'));
});

// Rute Rekap History
app.get('/rekap-history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rekap-history.html'));
});

// Rute Permintaan
app.get('/permintaan', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'permintaan.html'));
});

// Rute Manajemen Akun
app.get('/manajemen-akun', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manajemen-akun.html'));
});

app.listen(PORT, () => {
    console.log(`Server Kitteens Hub aktif di http://localhost:${PORT}`);
});