document.addEventListener('DOMContentLoaded', () => {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationOverlay = document.getElementById('notificationOverlay');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');

    if (notificationBtn && notificationPopup && notificationOverlay) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPopup.classList.toggle('hidden');
            notificationOverlay.classList.toggle('hidden');
        });

        // Close when clicking the X button
        if (closeNotificationBtn) {
            closeNotificationBtn.addEventListener('click', () => {
                notificationPopup.classList.add('hidden');
                notificationOverlay.classList.add('hidden');
            });
        }

        // Close when clicking outside (on the overlay)
        notificationOverlay.addEventListener('click', () => {
            notificationPopup.classList.add('hidden');
            notificationOverlay.classList.add('hidden');
        });

        // Prevent clicks inside the popup from closing it
        notificationPopup.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});
