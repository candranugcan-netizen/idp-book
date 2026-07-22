import { api } from './api/index.js';
import { formatTanggalIndo } from './utils/date-helper.js';
import { showLoading, showSuccess, showError, withAntiDoubleSubmit } from './utils/ui-helper.js';

// PIN Sederhana untuk simulasi (Sebaiknya diganti yang lebih aman nanti)
const ADMIN_PIN = "123456"; 

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const formLogin = document.getElementById('formLogin');
    const inputPin = document.getElementById('inputPin');
    const btnLogout = document.getElementById('btnLogout');
    const tbody = document.getElementById('adminTbody');
    const adminBody = document.getElementById('adminBody');

    // 1. CEK SESSION (Apakah sudah login?)
    if (sessionStorage.getItem('isAdmin') === 'true') {
        showDashboard();
    }

    // 2. PROSES LOGIN
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        if (inputPin.value === ADMIN_PIN) {
            sessionStorage.setItem('isAdmin', 'true');
            showDashboard();
            inputPin.value = '';
        } else {
            showError("PIN Salah! Akses ditolak.");
        }
    });

    // 3. PROSES LOGOUT
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('isAdmin');
        adminDashboard.classList.add('hidden');
        loginScreen.classList.remove('opacity-0', 'pointer-events-none');
        adminBody.classList.add('overflow-hidden');
    });

    // Tampilkan Dashboard & Load Data
    function showDashboard() {
        loginScreen.classList.add('opacity-0', 'pointer-events-none');
        adminDashboard.classList.remove('hidden');
        adminBody.classList.remove('overflow-hidden');
        loadPendingBookings();
    }

    // Load Data Pending dari API
    async function loadPendingBookings() {
        try {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Memuat data...</td></tr>';
            const bookings = await api.getBookings();
            
            // Filter hanya yang berstatus 'pending'
            const pendingBookings = bookings.filter(b => b.status === 'pending');
            renderTable(pendingBookings);
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Gagal memuat data: ${error.message}</td></tr>`;
        }
    }

    // Render Tabel Approval
    function renderTable(data) {
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-500">Tidak ada pengajuan booking yang perlu disetujui. 🎉</td></tr>';
            return;
        }

        data.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-3 px-4">
                    <div class="font-medium">${formatTanggalIndo(b.tanggal)}</div>
                    <div class="text-xs text-slate-500">${b.jam_mulai} - ${b.jam_selesai}</div>
                </td>
                <td class="py-3 px-4 font-bold text-primary">${b.panel_id}</td>
                <td class="py-3 px-4">
                    <div class="font-medium">${b.nama_guru}</div>
                    <div class="text-xs text-slate-500">${b.mata_pelajaran}</div>
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                    <button class="btn-action bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow text-sm font-semibold trans-200" data-id="${b.id}" data-action="approved">Setujui</button>
                    <button class="btn-action bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-sm font-semibold trans-200" data-id="${b.id}" data-action="rejected">Tolak</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Pasang Event Listener ke setiap tombol aksi (Setujui / Tolak)
        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                const confirmText = action === 'approved' ? 'menyetujui' : 'menolak';

                Swal.fire({
                    title: `Konfirmasi`,
                    text: `Apakah Anda yakin ingin ${confirmText} pengajuan ini?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Lanjutkan',
                    cancelButtonText: 'Batal'
                }).then((result) => {
                    if (result.isConfirmed) {
                        prosesApproval(btn, id, action);
                    }
                });
            });
        });
    }

    // Fungsi Update Status ke Apps Script
    async function prosesApproval(buttonElement, id, status) {
        withAntiDoubleSubmit(buttonElement, async () => {
            showLoading("Menyimpan perubahan...");
            await api.updateStatus(id, status);
            showSuccess(`Booking berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`);
            loadPendingBookings(); // Refresh tabel setelah sukses
        });
    }
});