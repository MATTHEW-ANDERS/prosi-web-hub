document.addEventListener('DOMContentLoaded', () => {
    // Month navigation (static demo)
    const months = [
        'Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026',
        'Mei 2026', 'Juni 2026', 'Juli 2026', 'Agustus 2026',
        'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'
    ];
    let currentMonthIndex = 5; // Juni 2026

    const monthLabel = document.getElementById('monthLabel');
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');

    if (prevBtn && nextBtn && monthLabel) {
        prevBtn.addEventListener('click', () => {
            if (currentMonthIndex > 0) {
                currentMonthIndex--;
                monthLabel.textContent = months[currentMonthIndex];
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentMonthIndex < months.length - 1) {
                currentMonthIndex++;
                monthLabel.textContent = months[currentMonthIndex];
            }
        });
    }

    // Animate servant bars on load
    const bars = document.querySelectorAll('.servant-bar');
    bars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 200);
    });
});
