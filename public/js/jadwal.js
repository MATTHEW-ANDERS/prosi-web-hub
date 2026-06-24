document.addEventListener('DOMContentLoaded', () => {
    const servicesList = document.querySelector('.services-list');
    
    // Format tanggal ke format bahasa Indonesia
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    }

    // Fungsi Fetch Jadwal dari API
    async function fetchJadwal() {
        try {
            const response = await fetch('/api/jadwal');
            if (!response.ok) throw new Error('Gagal mengambil data jadwal');
            const data = await response.json();
            
            if (servicesList) {
                servicesList.innerHTML = ''; // Bersihkan data statis
                
                if (data.length === 0) {
                    servicesList.innerHTML = '<p class="body-text" style="text-align:center; margin-top:20px;">Belum ada jadwal pelayanan.</p>';
                } else {
                    data.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'service-item-card';
                        card.dataset.id = item.id;
                        card.dataset.date = item.tanggal_mulai;
                        card.style.cursor = 'pointer';
                        card.innerHTML = `
                            <div class="service-card-header">
                                <span class="service-date-tag text-blue">${formatDate(item.tanggal_mulai)}</span>
                                <svg class="open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </div>
                            <h3 class="service-card-title">${item.judul || 'Tanpa Judul'}</h3>
                            <div class="service-card-body">
                                <div class="body-row">
                                    <span class="body-label">TUJUAN</span>
                                    <p class="body-text">${item.tujuan_ringkasan || '-'}</p>
                                </div>
                                <div class="body-row">
                                    <span class="body-label">PENGKHOTBAH</span>
                                    <p class="body-text highlight-name">${item.pengkhotbah || '-'}</p>
                                </div>
                            </div>
                            <button class="delete-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        `;
                        
                        // Card Click -> Detail View
                        card.addEventListener('click', (e) => {
                            if (e.target.closest('.delete-btn')) return; // Abaikan delete
                            openDetailView(item.id);
                        });

                        servicesList.appendChild(card);
                    });
                }
                attachDeleteListeners();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Add Schedule Form Logic
    const addJadwalBtn = document.getElementById('addJadwalBtn');
    const addJadwalSection = document.getElementById('addJadwalSection');
    const cancelJadwalBtn = document.getElementById('cancelJadwalBtn');
    const formTambahJadwal = document.getElementById('formTambahJadwal');
    const timPelayananContainer = document.getElementById('timPelayananContainer');

    const listPeran = [
        'Worship Leader', 'Singer 1', 'Singer 2', 'Pianist', 
        'Bassist', 'Gitaris', 'Drummer', 'MCM', 
        'Lighting', 'Soundman', 'Usher 1', 'Usher 2'
    ];

    let allUsers = [];

    // Ambil data user untuk dropdown
    async function loadUsersForDropdown() {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                allUsers = await res.json();
                renderTimPelayananDropdowns();
            }
        } catch (err) {
            console.error('Error loading users:', err);
        }
    }

    function renderTimPelayananDropdowns() {
        if (!timPelayananContainer) return;
        timPelayananContainer.innerHTML = '';
        
        let optionsHtml = `<option value="">-- Pilih --</option>`;
        allUsers.forEach(u => {
            optionsHtml += `<option value="${u.id}">${u.nama_lengkap}</option>`;
        });

        listPeran.forEach(peran => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label style="color: #6B7280; font-size: 12px; margin-bottom: 2px; display: block;">${peran}</label>
                <select class="tim-pelayanan-select" data-peran="${peran}" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px;">
                    ${optionsHtml}
                </select>
            `;
            timPelayananContainer.appendChild(div);
        });
    }

    // Styling Radio Button Kategori
    document.querySelectorAll('input[name="kategori"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('input[name="kategori"]').forEach(r => {
                r.parentElement.style.background = 'transparent';
                r.parentElement.style.color = '#000';
            });
            if (e.target.checked) {
                e.target.parentElement.style.background = '#1E3A8A';
                e.target.parentElement.style.color = 'white';
            }
        });
    });

    if (addJadwalBtn) {
        addJadwalBtn.addEventListener('click', () => {
            if (servicesList) servicesList.style.display = 'none';
            if (addJadwalSection) addJadwalSection.style.display = 'block';
            if (allUsers.length === 0) loadUsersForDropdown();
        });
    }

    if (cancelJadwalBtn) {
        cancelJadwalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (addJadwalSection) addJadwalSection.style.display = 'none';
            if (servicesList) servicesList.style.display = 'flex'; 
            if (formTambahJadwal) formTambahJadwal.reset();
            // Reset radio background
            document.querySelectorAll('input[name="kategori"]').forEach((r, i) => {
                r.parentElement.style.background = i === 0 ? '#1E3A8A' : 'transparent';
                r.parentElement.style.color = i === 0 ? 'white' : '#000';
            });
        });
    }

    if (formTambahJadwal) {
        formTambahJadwal.addEventListener('submit', async (e) => {
            e.preventDefault();

            const kategori = document.querySelector('input[name="kategori"]:checked').value;
            const judul = document.getElementById('jadwalTema').value.trim();
            const tujuan_ringkasan = document.getElementById('jadwalRingkasan').value.trim();
            const pengkhotbah = document.getElementById('jadwalPengkhotbah').value.trim();
            const tanggal = document.getElementById('jadwalTanggal').value;
            const jam = document.getElementById('jadwalJam').value;
            
            const tanggal_mulai = jam ? `${tanggal} ${jam}:00` : `${tanggal} 00:00:00`;

            const tim_pelayanan = [];
            document.querySelectorAll('.tim-pelayanan-select').forEach(select => {
                if (select.value) {
                    tim_pelayanan.push({
                        peran: select.dataset.peran,
                        pengguna_id: select.value
                    });
                }
            });

            try {
                const response = await fetch('/api/jadwal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        judul, 
                        tanggal_mulai, 
                        pengkhotbah, 
                        tujuan_ringkasan, 
                        kategori,
                        tim_pelayanan
                    })
                });

                if (response.ok) {
                    alert('Jadwal berhasil ditambahkan!');
                    cancelJadwalBtn.click(); // Reset dan tutup form
                    fetchJadwal();
                    fetchKalender(); // Refresh kalender
                } else {
                    alert('Gagal menambahkan jadwal.');
                }
            } catch (error) {
                console.error(error);
                alert('Terjadi kesalahan saat menyimpan jadwal.');
            }
        });
    }

    // Delete buttons handler
    function attachDeleteListeners() {
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
    }

    // ==========================================
    // KALENDER DINAMIS
    // ==========================================
    const calendarGrid = document.querySelector('.calendar-grid');
    const calMonthTitle = document.querySelector('.cal-month-title');
    const calNavBtns = document.querySelectorAll('.cal-nav-btn');
    
    let currentDate = new Date();
    let kalenderData = []; 

    async function fetchKalender() {
        try {
            const res = await fetch('/api/jadwal/kalender');
            if (res.ok) {
                kalenderData = await res.json();
                renderCalendar();
            }
        } catch (e) { console.error('Error fetching kalender', e); }
    }

    function renderCalendar() {
        if (!calendarGrid) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); 
        
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        if (calMonthTitle) calMonthTitle.innerText = `${monthNames[month]} ${year}`;
        
        // Reset grid (keep day names)
        calendarGrid.innerHTML = `
            <span class="day-name">MIN</span>
            <span class="day-name">SEN</span>
            <span class="day-name">SEL</span>
            <span class="day-name">RAB</span>
            <span class="day-name">KAM</span>
            <span class="day-name">JUM</span>
            <span class="day-name">SAB</span>
        `;
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Empty cells for first day
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.innerHTML += `<span class="day-number empty"></span>`;
        }
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasService = kalenderData.some(d => {
                const dateObj = new Date(d);
                return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day;
            });
            
            const isToday = isCurrentMonth && today.getDate() === day;
            let classes = "day-number";
            if (hasService) classes += " has-service";
            if (isToday) classes += " active-day";
            
            const span = document.createElement('span');
            span.className = classes;
            span.innerText = day;
            span.dataset.date = dateStr;
            
            if (hasService) {
                const dot = document.createElement('span');
                dot.className = 'service-dot';
                span.appendChild(dot);
            }
            
            span.addEventListener('click', () => {
                document.querySelectorAll('.day-number').forEach(d => d.classList.remove('active-day'));
                span.classList.add('active-day');
                filterServicesByDate(dateStr);
            });
            
            calendarGrid.appendChild(span);
        }
    }

    if (calNavBtns.length >= 2) {
        calNavBtns[0].addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        calNavBtns[1].addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    function filterServicesByDate(dateStr) {
        const dObj = new Date(dateStr);
        document.querySelectorAll('.service-item-card').forEach(card => {
            if(!card.dataset.date) return;
            const cardDate = new Date(card.dataset.date);
            if (cardDate.getFullYear() === dObj.getFullYear() && cardDate.getMonth() === dObj.getMonth() && cardDate.getDate() === dObj.getDate()) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ==========================================
    // DETAIL JADWAL & LAGU JADWAL
    // ==========================================
    let currentDetailJadwalId = null;

    async function openDetailView(id) {
        try {
            const res = await fetch(`/api/jadwal/${id}`);
            if(!res.ok) return;
            const jadwal = await res.json();
            
            currentDetailJadwalId = id;
            
            // fetch user me
            const userRes = await fetch('/api/auth/me');
            let currentUser = null;
            if(userRes.ok) currentUser = await userRes.json();
            
            // Check if user is admin or Worship Leader
            let canAddSong = false;
            if(currentUser && currentUser.role === 'admin') canAddSong = true;
            if(currentUser) {
                const isWl = jadwal.tim_pelayanan.some(p => p.nama_posisi === 'Worship Leader' && p.pengguna_id === currentUser.id);
                if (isWl) canAddSong = true;
            }
            
            const btnTambahLagu = document.getElementById('showAddLaguModalBtn');
            if(btnTambahLagu) btnTambahLagu.style.display = canAddSong ? 'block' : 'none';
            
            // Populate info
            document.getElementById('detailInfoCard').innerHTML = `
                <div class="service-card-header">
                    <span class="service-date-tag text-blue" style="font-size: 12px; font-weight: 800;">${formatDate(jadwal.tanggal_mulai)}</span>
                </div>
                <h3 class="service-card-title" style="margin-top: 12px; margin-bottom: 24px;">${jadwal.judul || 'Tanpa Judul'}</h3>
                <div class="service-card-body">
                    <div class="body-row" style="margin-bottom: 16px;">
                        <span class="body-label">TUJUAN</span>
                        <p class="body-text">${jadwal.tujuan_ringkasan || '-'}</p>
                    </div>
                    <div class="body-row">
                        <span class="body-label">PENGKHOTBAH</span>
                        <p class="body-text highlight-name">${jadwal.pengkhotbah || '-'}</p>
                    </div>
                </div>
            `;
            
            // Populate tim
            let timHtml = '';
            if (jadwal.tim_pelayanan && jadwal.tim_pelayanan.length > 0) {
                jadwal.tim_pelayanan.forEach(t => {
                    timHtml += `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                            <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${t.nama_posisi}</span>
                            <span style="font-size: 13px; font-weight: 700; color: #0e375a;">${t.nama_lengkap}</span>
                        </div>
                    `;
                });
            } else {
                timHtml = '<p class="body-text" style="font-size:13px; color:#64748b;">Belum ada tim pelayanan.</p>';
            }
            document.getElementById('detailTimList').innerHTML = timHtml;
            
            // Hide main view, show detail view
            document.getElementById('mainJadwalView').style.display = 'none';
            document.getElementById('detailJadwalView').style.display = 'block';
            
            loadLaguJadwal(id);
        } catch(e) { console.error('Error opening detail view:', e); }
    }

    async function loadLaguJadwal(id) {
        try {
            const res = await fetch(`/api/jadwal/${id}/lagu`);
            if(!res.ok) return;
            const laguList = await res.json();
            
            const laguContainer = document.getElementById('detailLaguList');
            laguContainer.innerHTML = '';
            
            if(laguList.length === 0) {
                laguContainer.innerHTML = '<p class="body-text" style="font-size:13px; color:#64748b; background: white; padding: 24px; border-radius: 16px; border: 1px solid rgba(226, 232, 240, 0.8);">Belum ada daftar lagu.</p>';
                return;
            }
            
            laguList.forEach(l => {
                laguContainer.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid #bce2f4; border-radius: 16px; padding: 16px 24px; background: #e0f2fe; box-shadow: 0 4px 12px rgba(180, 210, 225, 0.15);">
                        <div style="display: flex; gap: 24px; align-items: center;">
                            <span style="font-weight: 800; color: #0e375a; font-size: 16px;">${l.urutan_lagu}</span>
                            <span style="font-weight: 700; color: #0e375a; font-size: 15px;">${l.judul_lagu}</span>
                        </div>
                        <div style="background: #0e375a; color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 16px;">
                            ${l.nada_digunakan}
                        </div>
                    </div>
                `;
            });
        } catch(e) { console.error(e); }
    }

    document.getElementById('backToJadwalBtn')?.addEventListener('click', () => {
        document.getElementById('detailJadwalView').style.display = 'none';
        document.getElementById('mainJadwalView').style.display = 'block';
    });

    const showAddLaguModalBtn = document.getElementById('showAddLaguModalBtn');
    const addLaguModal = document.getElementById('addLaguModal');
    const closeAddLaguModalBtn = document.getElementById('closeAddLaguModalBtn');
    const formJadwalLagu = document.getElementById('formJadwalLagu');
    const modalSelectLagu = document.getElementById('modalSelectLagu');
    
    if(showAddLaguModalBtn) {
        showAddLaguModalBtn.addEventListener('click', async () => {
            const res = await fetch('/api/lagu');
            if(res.ok) {
                const laguBank = await res.json();
                modalSelectLagu.innerHTML = '<option value="">-- Pilih Lagu --</option>';
                laguBank.forEach(l => {
                    modalSelectLagu.innerHTML += `<option value="${l.id}">${l.judul_lagu} (${l.nada_dasar_default})</option>`;
                });
            }
            addLaguModal.style.display = 'flex';
        });
    }
    
    if(closeAddLaguModalBtn) {
        closeAddLaguModalBtn.addEventListener('click', () => {
            addLaguModal.style.display = 'none';
            formJadwalLagu.reset();
        });
    }
    
    if(formJadwalLagu) {
        formJadwalLagu.addEventListener('submit', async (e) => {
            e.preventDefault();
            const lagu_id = modalSelectLagu.value;
            const nada_digunakan = document.getElementById('modalSelectNada').value;
            
            const existingRes = await fetch(`/api/jadwal/${currentDetailJadwalId}/lagu`);
            const existing = await existingRes.json();
            const urutan_lagu = existing.length + 1;
            
            const res = await fetch('/api/jadwal-lagu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jadwal_id: currentDetailJadwalId,
                    lagu_id,
                    urutan_lagu,
                    nada_digunakan
                })
            });
            
            if(res.ok) {
                addLaguModal.style.display = 'none';
                formJadwalLagu.reset();
                loadLaguJadwal(currentDetailJadwalId); 
            } else {
                alert('Gagal menambahkan lagu.');
            }
        });
    }

    // Inisialisasi awal mengambil data dari database
    fetchJadwal();
    fetchKalender();
});
