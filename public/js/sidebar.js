document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    // Fetch and inject sidebar HTML
    fetch('components/sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal memuat sidebar.');
            }
            return response.text();
        })
        .then(html => {
            sidebarContainer.innerHTML = html;
            highlightActiveMenu();
            setupLogoutHandler();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
        });

    function highlightActiveMenu() {
        const path = window.location.pathname;
        
        // Remove all active classes first
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Set active item based on current URL path
        if (path === '/dashboard' || path === '/') {
            const dashboardMenu = document.getElementById('menu-dashboard');
            if (dashboardMenu) dashboardMenu.classList.add('active');
        } else if (path === '/jadwal') {
            const jadwalMenu = document.getElementById('menu-jadwal');
            if (jadwalMenu) jadwalMenu.classList.add('active');
        } else if (path === '/bank-lagu') {
            const bankLaguMenu = document.getElementById('menu-bank-lagu');
            if (bankLaguMenu) bankLaguMenu.classList.add('active');
        } else if (path === '/rekap-history') {
            const historyMenu = document.getElementById('menu-history');
            if (historyMenu) historyMenu.classList.add('active');
        } else if (path === '/permintaan') {
            const permintaanMenu = document.getElementById('menu-permintaan');
            if (permintaanMenu) permintaanMenu.classList.add('active');
        } else if (path === '/manajemen-akun') {
            const akunMenu = document.getElementById('menu-akun');
            if (akunMenu) akunMenu.classList.add('active');
        }
    }

    function setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Redirect to login page
                window.location.href = '/login';
            });
        }
    }
});
