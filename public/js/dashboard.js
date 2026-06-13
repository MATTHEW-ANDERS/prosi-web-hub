document.addEventListener('DOMContentLoaded', () => {
    // Notification button interaction
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert('Anda memiliki 2 notifikasi baru terkait jadwal pelayanan.');
        });
    }
});
