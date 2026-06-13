document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('accountsTableBody');
    const addBtn = document.getElementById('addAccountBtn');
    const searchInput = document.getElementById('searchAccount');
    const accountCountEl = document.getElementById('accountCount');

    const roleBadgeClasses = {
        'Admin': 'admin-badge',
        'Servant': 'servant-badge',
        'Worship Planner': 'worship-badge',
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

    function onDeleteClick(e) {
        const row = e.target.closest('tr');
        const name = row.querySelector('.td-name').innerText;
        if (confirm(`Hapus akun "${name}"?`)) {
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateCount();
            }, 300);
        }
    }

    // Add Account
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const name = document.getElementById('newName').value.trim();
            const email = document.getElementById('newEmail').value.trim();
            const role = document.getElementById('newRole').value;

            if (!name || !email) {
                alert('Nama dan email wajib diisi.');
                return;
            }

            const roleClass = roleBadgeClasses[role] || 'guest-badge';
            const options = Object.keys(roleBadgeClasses).map(r =>
                `<option ${r === role ? 'selected' : ''}>${r}</option>`
            ).join('');

            const newRow = document.createElement('tr');
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
            attachRoleChangeListeners();
            attachDeleteListeners();
            updateCount();

            // Reset form
            document.getElementById('newName').value = '';
            document.getElementById('newEmail').value = '';
            document.getElementById('newRole').value = 'Guest';
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

    // Initial bindings
    attachRoleChangeListeners();
    attachDeleteListeners();
});
