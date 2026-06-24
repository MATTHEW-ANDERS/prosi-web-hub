require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS penugasan_pelayanan (
                id SERIAL PRIMARY KEY,
                jadwal_id INTEGER REFERENCES jadwal(id) ON DELETE CASCADE,
                pengguna_id INTEGER REFERENCES pengguna(id) ON DELETE CASCADE,
                peran VARCHAR(100) NOT NULL
            );
        `);
        console.log("Tabel penugasan_pelayanan berhasil dibuat / sudah ada.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        pool.end();
    }
}

createTable();
