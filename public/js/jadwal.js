document.addEventListener('DOMContentLoaded', () => {
    // Add Schedule click handler
    const addJadwalBtn = document.getElementById('addJadwalBtn');
    if (addJadwalBtn) {
        addJadwalBtn.addEventListener('click', () => {
            alert('Formulir tambah jadwal pelayanan sedang dikembangkan!');
        });
    }

    // Delete buttons handler
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.service-item-card');
            if (card) {
                const title = card.querySelector('.service-card-title').innerText;
                if (confirm(`Apakah Anda yakin ingin menghapus jadwal "${title}"?`)) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.remove();
                    }, 300);
                }
            }
        });
    });

    // Calendar Day click selection
    const dayNumbers = document.querySelectorAll('.day-number:not(.empty)');
    dayNumbers.forEach(day => {
        day.addEventListener('click', () => {
            dayNumbers.forEach(d => d.classList.remove('active-day'));
            day.classList.add('active-day');
            console.log(`Tanggal ${day.innerText} Juni 2026 dipilih.`);
        });
    });
});
