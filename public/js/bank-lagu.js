document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const songsGrid = document.getElementById('songsGrid');
    const songCountSpan = document.getElementById('songCount');
    const addLaguBtn = document.getElementById('addLaguBtn');

    let allSongs = []; // Simpan data lagu di memori untuk pencarian/filter

    // Update song count display
    function updateSongCount() {
        const activeCards = songsGrid.querySelectorAll('.song-card[style="display: flex;"], .song-card:not([style*="display: none"])').length;
        if (songCountSpan) {
            songCountSpan.innerText = activeCards;
        }
    }

    // Fungsi Fetch Lagu
    async function fetchLagu() {
        try {
            const response = await fetch('/api/lagu');
            if (!response.ok) throw new Error('Gagal mengambil data lagu');
            allSongs = await response.json();
            renderSongs(allSongs);
        } catch (error) {
            console.error('Error fetching lagu:', error);
        }
    }

    // Fungsi Render Lagu
    function renderSongs(data) {
        if (!songsGrid) return;
        songsGrid.innerHTML = '';

        if (data.length === 0) {
            songsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Belum ada lagu tersedia.</p>';
            updateSongCount();
            return;
        }

        data.forEach(lagu => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.dataset.category = lagu.kategori ? lagu.kategori.toLowerCase() : 'lainnya';
            card.dataset.id = lagu.id;
            
            card.innerHTML = `
                <div class="song-main">
                    <div class="music-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    </div>
                    <div class="song-details">
                        <h3 class="song-title">${lagu.judul_lagu || 'Tanpa Judul'}</h3>
                        <p class="song-artist">${lagu.pencipta || 'Unknown'}</p>
                    </div>
                    <div class="key-badge">${lagu.nada_dasar_default || '-'}</div>
                </div>
                <button class="delete-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            `;
            songsGrid.appendChild(card);
        });

        updateSongCount();
    }

    // Filter songs function
    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = categorySelect ? categorySelect.value.toLowerCase() : 'all';

        const cards = songsGrid.querySelectorAll('.song-card');
        let count = 0;
        
        cards.forEach(card => {
            const title = card.querySelector('.song-title').innerText.toLowerCase();
            const artist = card.querySelector('.song-artist').innerText.toLowerCase();
            const cardCategory = card.dataset.category || '';
            
            const matchesQuery = title.includes(query) || artist.includes(query);
            const matchesCategory = category === 'all' || cardCategory === category;

            if (matchesQuery && matchesCategory) {
                card.style.display = 'flex';
                count++;
            } else {
                card.style.display = 'none';
            }
        });

        if (songCountSpan) {
            songCountSpan.innerText = count;
        }
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);

    // Add song simulator / prompt input
    const addLaguSection = document.getElementById('addLaguSection');
    const cancelLaguBtn = document.getElementById('cancelLaguBtn');
    const formTambahLagu = document.getElementById('formTambahLagu');
    const headerSection = document.querySelector('.content-header');
    const filterSection = document.querySelector('.filters-section');

    if (addLaguBtn) {
        addLaguBtn.addEventListener('click', () => {
            // Sembunyikan bagian utama
            if (headerSection) headerSection.style.display = 'none';
            if (filterSection) filterSection.style.display = 'none';
            if (songsGrid) songsGrid.style.display = 'none';
            
            // Tampilkan form
            if (addLaguSection) addLaguSection.style.display = 'block';
        });
    }

    if (cancelLaguBtn) {
        cancelLaguBtn.addEventListener('click', () => {
            // Tampilkan bagian utama
            if (headerSection) headerSection.style.display = 'flex';
            if (filterSection) filterSection.style.display = 'flex';
            if (songsGrid) songsGrid.style.display = 'grid';
            
            // Sembunyikan form
            if (addLaguSection) addLaguSection.style.display = 'none';
            
            // Reset form
            if (formTambahLagu) formTambahLagu.reset();
        });
    }

    if (formTambahLagu) {
        formTambahLagu.addEventListener('submit', async (e) => {
            e.preventDefault();

            const judul_lagu = document.getElementById('laguJudul').value.trim();
            const pencipta = document.getElementById('laguPenyanyi').value.trim();
            const kategori = document.getElementById('laguKategori').value;
            const nada_dasar_default = document.getElementById('laguNada').value;
            const link_youtube = document.getElementById('laguLink').value.trim();
            const chord_lirik = document.getElementById('laguChord').value;

            try {
                const response = await fetch('/api/lagu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        judul_lagu,
                        pencipta,
                        nada_dasar_default,
                        kategori,
                        link_youtube,
                        chord_lirik
                    })
                });

                if (response.ok) {
                    alert('Lagu berhasil ditambahkan!');
                    formTambahLagu.reset();
                    cancelLaguBtn.click(); // Kembali ke tampilan awal
                    fetchLagu(); // Refresh Data
                } else {
                    alert('Gagal menambahkan lagu.');
                }
            } catch (error) {
                console.error(error);
                alert('Terjadi kesalahan saat menyimpan lagu.');
            }
        });
    }

    // Handle song deletions with dynamic bindings
    if (songsGrid) {
        songsGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const card = deleteBtn.closest('.song-card');
                if (card) {
                    const title = card.querySelector('.song-title').innerText;
                    if (confirm(`Apakah Anda yakin ingin menghapus lagu "${title}"?`)) {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.remove();
                            updateSongCount();
                        }, 300);
                    }
                }
            }
        });
    }

    // Inisialisasi awal ambil data dari server
    fetchLagu();
});
