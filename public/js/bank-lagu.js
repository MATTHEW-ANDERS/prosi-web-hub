document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const songsGrid = document.getElementById('songsGrid');
    const songCountSpan = document.getElementById('songCount');
    const addLaguBtn = document.getElementById('addLaguBtn');

    // Update song count display
    function updateSongCount() {
        const activeCards = songsGrid.querySelectorAll('.song-card').length;
        if (songCountSpan) {
            songCountSpan.innerText = activeCards;
        }
    }

    // Filter songs based on search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = songsGrid.querySelectorAll('.song-card');
            
            cards.forEach(card => {
                const title = card.querySelector('.song-title').innerText.toLowerCase();
                const artist = card.querySelector('.song-artist').innerText.toLowerCase();
                
                if (title.includes(query) || artist.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Add song simulator
    if (addLaguBtn) {
        addLaguBtn.addEventListener('click', () => {
            alert('Formulir tambah lagu baru sedang dikembangkan!');
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
});
