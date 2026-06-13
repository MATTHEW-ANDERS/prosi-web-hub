document.addEventListener('DOMContentLoaded', () => {
    const tabBelum = document.getElementById('tabBelum');
    const tabSemua = document.getElementById('tabSemua');
    const allCards = document.querySelectorAll('.request-card');

    // Filter tabs logic
    function setActiveTab(activeTab) {
        [tabBelum, tabSemua].forEach(t => t.classList.remove('active'));
        activeTab.classList.add('active');
    }

    if (tabBelum) {
        tabBelum.addEventListener('click', () => {
            setActiveTab(tabBelum);
            allCards.forEach(card => {
                card.style.display = card.dataset.status === 'pending' ? 'block' : 'none';
            });
        });
    }

    if (tabSemua) {
        tabSemua.addEventListener('click', () => {
            setActiveTab(tabSemua);
            allCards.forEach(card => {
                card.style.display = 'block';
            });
        });
    }

    // Approve button handler
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.request-card');
            const select = card.querySelector('.replacement-select');
            if (!select.value) {
                alert('Pilih nama pengganti terlebih dahulu.');
                return;
            }
            const name = card.querySelector('.request-name').innerText;
            if (confirm(`Tandai permintaan dari "${name}" sebagai selesai?`)) {
                card.dataset.status = 'done';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';
                setTimeout(() => card.remove(), 300);
            }
        });
    });

    // Reject button handler
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.request-card');
            const name = card.querySelector('.request-name').innerText;
            if (confirm(`Tolak permintaan dari "${name}"?`)) {
                card.dataset.status = 'rejected';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';
                setTimeout(() => card.remove(), 300);
            }
        });
    });
});
