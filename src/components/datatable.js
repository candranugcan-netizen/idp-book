import { formatTanggalIndo } from '../utils/date-helper.js';
import { debounce } from '../utils/ui-helper.js';

export const initDataTable = (allBookings) => {
    // State DataTable
    let state = {
        data: allBookings,
        searchQuery: '',
        filterStatus: 'all',
        sortBy: 'newest', // newest, oldest, name_az
        currentPage: 1,
        itemsPerPage: 10
    };

    // Elements
    const searchInput = document.getElementById('dtSearch');
    const filterStatus = document.getElementById('dtFilterStatus');
    const sortSelect = document.getElementById('dtSort');
    const limitSelect = document.getElementById('dtLimit');
    const tbody = document.getElementById('dtTbody');
    const prevBtn = document.getElementById('dtPrevBtn');
    const nextBtn = document.getElementById('dtNextBtn');
    const pageInfo = document.getElementById('dtPageInfo');

    // Fungsi Render Utama
    const renderTable = () => {
        // 1. FILTERING
        let processedData = allBookings.filter(b => {
            const matchSearch = b.nama_guru.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                                b.mata_pelajaran.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                b.panel_id.toLowerCase().includes(state.searchQuery.toLowerCase());
            
            const matchStatus = state.filterStatus === 'all' || b.status === state.filterStatus;
            
            return matchSearch && matchStatus;
        });

        // 2. SORTING
        processedData.sort((a, b) => {
            if (state.sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
            if (state.sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
            if (state.sortBy === 'name_az') return a.nama_guru.localeCompare(b.nama_guru);
            return 0;
        });

        // 3. PAGINATION
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;
        
        // Pastikan halaman saat ini tidak melebihi total halaman (jika data mengecil karena filter)
        if (state.currentPage > totalPages) state.currentPage = totalPages;

        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedData = processedData.slice(startIndex, endIndex);

        // 4. MENGGAMBAR KE HTML
        tbody.innerHTML = '';

        if (paginatedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">Tidak ada data ditemukan.</td></tr>`;
        } else {
            paginatedData.forEach(b => {
                // Badge Status
                let badgeClass = b.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                 b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                 'bg-red-100 text-red-700';
                
                // Terjemahan status ke Bahasa Indonesia
                let statusIndo = b.status === 'approved' ? 'Disetujui' : 
                                 b.status === 'pending' ? 'Pending' : 'Ditolak';

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-700/50 trans-200';
                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="font-medium text-slate-800 dark:text-slate-200">${formatTanggalIndo(b.tanggal)}</div>
                        <div class="text-xs text-slate-500">${b.jam_mulai} - ${b.jam_selesai}</div>
                    </td>
                    <td class="py-3 px-4 font-semibold text-primary">${b.panel_id}</td>
                    <td class="py-3 px-4">
                        <div class="font-medium text-slate-800 dark:text-slate-200">${b.nama_guru}</div>
                        <div class="text-xs text-slate-500">${b.mata_pelajaran}</div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 text-xs font-semibold rounded-lg ${badgeClass}">${statusIndo}</span>
                    </td>
              
                `;
                tbody.appendChild(tr);
            });
        }

        // 5. UPDATE PAGINATION UI
        pageInfo.textContent = `Hal ${state.currentPage} dari ${totalPages}`;
        prevBtn.disabled = state.currentPage === 1;
        nextBtn.disabled = state.currentPage === totalPages;
    };

    // Event Listeners dengan Debounce untuk Input Pencarian
    searchInput.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1; // Reset ke halaman 1 saat mencari
        renderTable();
    }, 300)); // Jeda 300ms

    filterStatus.addEventListener('change', (e) => {
        state.filterStatus = e.target.value;
        state.currentPage = 1;
        renderTable();
    });

    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        renderTable();
    });

    limitSelect.addEventListener('change', (e) => {
        state.itemsPerPage = parseInt(e.target.value);
        state.currentPage = 1;
        renderTable();
    });

    prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        state.currentPage++;
        renderTable();
    });

    // Render awal
    renderTable();

    // Kembalikan fungsi updateData agar bisa dipanggil saat ada booking baru
    return {
        updateData: (newData) => {
            allBookings = newData;
            renderTable();
        }
    };
};