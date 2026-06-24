require('dotenv').config(); // Membaca file rahasia .env
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 3000;

// ==========================================
// 1. KONFIGURASI DATABASE POSTGRESQL
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err) => {
    if (err) console.error('Koneksi database PostgreSQL gagal:', err.stack);
    else console.log('Sukses! Database kitteens_hub terhubung dengan aman.');
});

// ==========================================
// 2. MIDDLEWARE & SESSION EXPRESS
// ==========================================
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'kitteens_secret_key_123',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Menghubungkan Express ke folder public agar file HTML, CSS, dan JS bisa dibaca browser
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. LOGIKA PASSPORT GOOGLE OAUTH
// ==========================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
    async function (accessToken, refreshToken, profile, done) {
        const emailGmail = profile.emails[0].value;
        const namaLengkap = profile.displayName;

        try {
            // Cek apakah pengguna sudah pernah terdaftar di database
            let res = await pool.query('SELECT * FROM pengguna WHERE email_gmail = $1', [emailGmail]);

            if (res.rows.length === 0) {
                // Jika BELUM terdaftar, jangan lakukan INSERT
                return done(null, false, { message: 'Akun Anda belum terdaftar di sistem. Hubungi Admin.' });
            } else {
                // Jika SUDAH terdaftar, cek status_aktif
                const user = res.rows[0];
                if (user.status_aktif) {
                    // Jika status_aktif true, loloskan
                    return done(null, user);
                } else {
                    // Jika status_aktif false, tolak
                    return done(null, false, { message: 'Akun Anda sedang dinonaktifkan. Hubungi Admin.' });
                }
            }
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const res = await pool.query('SELECT * FROM pengguna WHERE id = $1', [id]);
        done(null, res.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

// Middleware Pengaman: Menolak akses jika user belum login lewat Google
function pastikanSudahLogin(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// ==========================================
// 4. JALUR UTAMA GERBANG AUTH GOOGLE
// ==========================================

// Pintu masuk ketika tombol login Gmail diklik
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Jalur pengembalian sukses/gagal dari server Google
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/login?error=unauthorized'
    })
);

// Route Keluar Akun (Logout)
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});


// ==========================================
// 5. RUTE HALAMAN JALUR WEB (ROUTES)
// ==========================================

// Rute Utama: Jika membuka localhost:3000, langsung tampilkan login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rute Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rute Dashboard Admin (Kini Terproteksi)
app.get('/dashboard', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rute Jadwal Pelayanan (Kini Terproteksi)
app.get('/jadwal', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jadwal.html'));
});

// Rute Bank Lagu (Kini Terproteksi)
app.get('/bank-lagu', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bank-lagu.html'));
});

// Rute Rekap History (Kini Terproteksi)
app.get('/rekap-history', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rekap-history.html'));
});

// Rute Permintaan (Kini Terproteksi)
app.get('/permintaan', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'permintaan.html'));
});

// Rute Manajemen Akun (Kini Terproteksi)
app.get('/manajemen-akun', pastikanSudahLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manajemen-akun.html'));
});

// ==========================================
// 6. API ROUTES
// ==========================================

app.get('/api/users', pastikanSudahLogin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nama_lengkap, email_gmail, role FROM pengguna WHERE status_aktif = true ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Rute untuk mendapatkan session user saat ini
app.get('/api/auth/me', pastikanSudahLogin, (req, res) => {
    res.json({
        id: req.user.id,
        nama_lengkap: req.user.nama_lengkap,
        email_gmail: req.user.email_gmail,
        role: req.user.role
    });
});

// Rute untuk menambahkan pengguna baru
app.post('/api/users', pastikanSudahLogin, async (req, res) => {
    try {
        const { nama, email, role } = req.body;
        const result = await pool.query(
            'INSERT INTO pengguna (nama_lengkap, email_gmail, role, status_aktif) VALUES ($1, $2, $3, $4) RETURNING *',
            [nama, email, role || 'user', true]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Rute untuk menonaktifkan pengguna (Soft Delete)
app.delete('/api/users/:id', pastikanSudahLogin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE pengguna SET status_aktif = false WHERE id = $1', [id]);
        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// API untuk JADWAL PELAYANAN
app.get('/api/jadwal', pastikanSudahLogin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jadwal ORDER BY tanggal_mulai ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jadwal:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

app.post('/api/jadwal', pastikanSudahLogin, async (req, res) => {
    try {
        const { kategori, judul, tanggal_mulai, pengkhotbah, tujuan_ringkasan, tim_pelayanan } = req.body;

        await pool.query('BEGIN'); // Mulai transaksi

        // Simpan jadwal
        const jadwalResult = await pool.query(
            'INSERT INTO jadwal (kategori, judul, tanggal_mulai, tanggal_selesai, pengkhotbah, tujuan_ringkasan, status, dibuat_oleh) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [kategori, judul, tanggal_mulai, tanggal_mulai, pengkhotbah, tujuan_ringkasan, 'Draft', req.user.id]
        );
        const newJadwal = jadwalResult.rows[0];

        // Simpan tim pelayanan jika ada
        if (tim_pelayanan && Array.isArray(tim_pelayanan)) {
            for (const p of tim_pelayanan) {
                if (p.pengguna_id) { // Hanya simpan jika user dipilih
                    // 1. Cari atau buat posisi_pelayanan_id
                    let posisiId;
                    const posisiRes = await pool.query('SELECT id FROM posisi_pelayanan WHERE nama_posisi = $1', [p.peran]);
                    if (posisiRes.rows.length > 0) {
                        posisiId = posisiRes.rows[0].id;
                    } else {
                        const newPosisi = await pool.query('INSERT INTO posisi_pelayanan (nama_posisi) VALUES ($1) RETURNING id', [p.peran]);
                        posisiId = newPosisi.rows[0].id;
                    }

                    // 2. Insert penugasan
                    await pool.query(
                        'INSERT INTO penugasan_pelayanan (jadwal_id, pengguna_id, posisi_pelayanan_id, status_tugas) VALUES ($1, $2, $3, $4)',
                        [newJadwal.id, p.pengguna_id, posisiId, 'Ditugaskan']
                    );
                }
            }
        }

        await pool.query('COMMIT'); // Selesaikan transaksi
        res.status(201).json(newJadwal);
    } catch (error) {
        await pool.query('ROLLBACK'); // Batalkan jika gagal
        console.error('Error inserting jadwal:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// API untuk BANK LAGU
app.get('/api/lagu', pastikanSudahLogin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lagu ORDER BY judul_lagu ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching lagu:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

app.post('/api/lagu', pastikanSudahLogin, async (req, res) => {
    try {
        const { judul_lagu, pencipta, link_youtube, nada_dasar_default, kategori, chord_lirik } = req.body;
        const result = await pool.query(
            'INSERT INTO lagu (judul_lagu, pencipta, link_youtube, nada_dasar_default, kategori, chord_lirik, dibuat_oleh) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [judul_lagu, pencipta, link_youtube, nada_dasar_default, kategori, chord_lirik, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting lagu:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// API untuk JADWAL DETAIL & KALENDER
app.get('/api/jadwal/kalender', pastikanSudahLogin, async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT DATE(tanggal_mulai) as tanggal FROM jadwal');
        res.json(result.rows.map(row => row.tanggal));
    } catch (error) {
        console.error('Error fetching kalender:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

app.get('/api/jadwal/:id', pastikanSudahLogin, async (req, res) => {
    try {
        const jadwalResult = await pool.query('SELECT * FROM jadwal WHERE id = $1', [req.params.id]);
        if (jadwalResult.rows.length === 0) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
        const jadwal = jadwalResult.rows[0];

        const penugasanResult = await pool.query(`
            SELECT pp.pengguna_id, p.nama_lengkap, pos.nama_posisi 
            FROM penugasan_pelayanan pp
            JOIN pengguna p ON pp.pengguna_id = p.id
            JOIN posisi_pelayanan pos ON pp.posisi_pelayanan_id = pos.id
            WHERE pp.jadwal_id = $1
        `, [jadwal.id]);

        jadwal.tim_pelayanan = penugasanResult.rows;
        res.json(jadwal);
    } catch (error) {
        console.error('Error fetching detail jadwal:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

app.get('/api/jadwal/:id/lagu', pastikanSudahLogin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT lj.id as lagu_jadwal_id, lj.urutan_lagu, lj.nada_digunakan, l.id as lagu_id, l.judul_lagu, l.pencipta 
            FROM lagu_jadwal lj
            JOIN lagu l ON lj.lagu_id = l.id
            WHERE lj.jadwal_id = $1
            ORDER BY lj.urutan_lagu ASC
        `, [req.params.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching lagu jadwal:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

app.post('/api/jadwal-lagu', pastikanSudahLogin, async (req, res) => {
    try {
        const { jadwal_id, lagu_id, urutan_lagu, nada_digunakan } = req.body;
        const result = await pool.query(
            'INSERT INTO lagu_jadwal (jadwal_id, lagu_id, urutan_lagu, nada_digunakan) VALUES ($1, $2, $3, $4) RETURNING *',
            [jadwal_id, lagu_id, urutan_lagu, nada_digunakan]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting lagu_jadwal:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server Kitteens Hub aktif di http://localhost:${PORT}`);
});