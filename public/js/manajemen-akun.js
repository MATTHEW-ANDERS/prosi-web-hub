document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('accountsTableBody');
    const addBtn = document.getElementById('addAccountBtn');
    const searchInput = document.getElementById('searchAccount');
    const accountCountEl = document.getElementById('accountCount');

    const roleBadgeClasses = {
        'Admin': 'admin-badge',
        'Servant': 'servant-badge',
        'Worship Planner': 'worship-badge',
        'Worship Leader': 'guest-badge', // Menambahkan fallback untuk role ini jika ada
        'Guest': 'guest-badge'
    };

    function updateCount() {
        const rows = tableBody.querySelectorAll('tr');
        if (accountCountEl) {
            accountCountEl.textContent = `${rows.length} Akun Terdaftar`;
        }
    }

    function updateRoleBadgeClass(select) {
        Object.values(roleBadgeClasses).forEach(cls => select.classList.remove(cls));
        const selectedRole = select.value;
        const cls = roleBadgeClasses[selectedRole] || 'guest-badge';
        select.classList.add(cls);
    }

    function attachRoleChangeListeners() {
        tableBody.querySelectorAll('.role-badge').forEach(select => {
            select.removeEventListener('change', onRoleChange);
            select.addEventListener('change', onRoleChange);
        });
    }

    function onRoleChange(e) {
        updateRoleBadgeClass(e.target);
    }

    function attachDeleteListeners() {
        tableBody.querySelectorAll('.delete-account-btn').forEach(btn => {
            btn.removeEventListener('click', onDeleteClick);
            btn.addEventListener('click', onDeleteClick);
        });
    }

    async function onDeleteClick(e) {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const name = row.querySelector('.td-name').innerText;
        if (confirm(`Hapus akun "${name}"?`)) {
            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    row.style.opacity = '0';
                    setTimeout(() => {
                        fetchUsers();
                    }, 300);
                } else {
                    alert('Gagal menghapus akun dari database.');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Terjadi kesalahan saat menghapus akun.');
            }
        }
    }

    // Fungsi untuk mengambil data dari server
    async function fetchUsers() {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Gagal mengambil data dari server');
            const data = await response.json();
            
            tableBody.innerHTML = ''; // Bersihkan mock data
            
            data.forEach(user => {
                const name = user.nama_lengkap;
                const email = user.email_gmail;
                const role = user.role;
                
                const roleClass = roleBadgeClasses[role] || 'guest-badge';
                const options = Object.keys(roleBadgeClasses).map(r =>
                    `<option ${r === role ? 'selected' : ''}>${r}</option>`
                ).join('');

                const newRow = document.createElement('tr');
                newRow.dataset.id = user.id;
                newRow.dataset.name = name;
                newRow.dataset.email = email;
                newRow.innerHTML = `
                    <td class="td-name">${name}</td>
                    <td class="td-email">${email}</td>
                    <td>
                        <div class="role-select-wrapper">
                            <select class="role-badge ${roleClass}">${options}</select>
                        </div>
                    </td>
                    <td>
                        <button class="delete-account-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            });
            
            attachRoleChangeListeners();
            attachDeleteListeners();
            updateCount();
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Add Account
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const name = document.getElementById('newName').value.trim();
            const email = document.getElementById('newEmail').value.trim();
            const roleSelect = document.getElementById('newRole');
            const role = roleSelect ? roleSelect.value : 'Servant';

            if (!name || !email) {
                alert('Nama dan email wajib diisi.');
                return;
            }

            try {
                // Kirim data ke backend
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama: name, email: email, role: role })
                });

                if (response.ok) {
                    // Reset form jika sukses
                    document.getElementById('newName').value = '';
                    document.getElementById('newEmail').value = '';
                    if (roleSelect) roleSelect.value = 'Servant';
                    
                    // Refresh tabel dengan data terbaru
                    fetchUsers();
                } else {
                    alert('Gagal menambahkan akun ke database.');
                }
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Terjadi kesalahan saat menambahkan akun.');
            }
        });
    }

    // Search/Filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            tableBody.querySelectorAll('tr').forEach(row => {
                const name = (row.dataset.name || '').toLowerCase();
                const email = (row.dataset.email || '').toLowerCase();
                row.style.display = (name.includes(q) || email.includes(q)) ? '' : 'none';
            });
        });
    }

    // Ambil data pertama kali saat halaman dimuat
    fetchUsers();
});
