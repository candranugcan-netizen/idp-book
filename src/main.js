import { initTheme } from './utils/theme.js';
import { api } from './api/index.js';
import { initCalendar, renderMobileAgenda, initMobileDatePicker } from './components/calendar.js';
import { initModal } from './components/modal.js';
import { initDataTable } from './components/datatable.js';
import { showError, showSuccess } from './utils/ui-helper.js'; // <-- Diperbaiki: Tambahkan Helper UI

let appState = {
    panels: [],
    bookings: []
};

let dataTableControl = null;
let isMobileNavInitialized = false;

const loadAppData = async () => {
    try {
        const [panelsData, bookingsData] = await Promise.all([
            api.getPanels(),
            api.getBookings()
        ]);
        
        appState.panels = panelsData;
        appState.bookings = bookingsData;

        // 1. Update Dashboard Stats
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('statPanels').textContent = appState.panels.length;
        document.getElementById('statToday').textContent = appState.bookings.filter(b => b.tanggal === today).length;
        document.getElementById('statPending').textContent = appState.bookings.filter(b => b.status === 'pending').length;
        document.getElementById('statApproved').textContent = appState.bookings.filter(b => b.status === 'approved').length;

        // 2. Inisialisasi Modal
        const modalControl = initModal(appState.panels, loadAppData);

        // 3. Inisialisasi Kalender (Desktop & Agenda Mobile)
        initCalendar(appState.bookings, (dateStr) => {
            modalControl.openModal(dateStr);
        });

        // 4. Inisialisasi Tombol Navigasi Tanggal Mobile (Prev/Next/Picker)
        if (!isMobileNavInitialized) {
            initMobileDatePicker((selectedDate) => {
                // Render ulang kartu agenda mobile saat tanggal berubah
                renderMobileAgenda(appState.bookings, selectedDate);
            });
            isMobileNavInitialized = true;
        } else {
            // Update agenda mobile jika data di-refresh
            const datePicker = document.getElementById('mobileDatePicker');
            const currentDate = datePicker ? datePicker.value : today;
            renderMobileAgenda(appState.bookings, currentDate);
        }

        // 5. Inisialisasi / Update Data Table
        if (!dataTableControl) {
            dataTableControl = initDataTable(appState.bookings);
        } else {
            dataTableControl.updateData(appState.bookings);
        }

    } catch (error) {
        console.error("Gagal merender aplikasi:", error);
        showError("Gagal memuat data dari server.");
    }
};

// --- FUNGSI EXPORT KE EXCEL ---
async function handleExportExcel() {
    try {
        Swal.fire({
            title: 'Menyiapkan Data...',
            text: 'Sedang mengunduh laporan booking',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const bookings = appState.bookings.length > 0 ? appState.bookings : await api.getBookings();

        if (!bookings || bookings.length === 0) {
            Swal.fire('Info', 'Tidak ada data booking untuk di-export.', 'info');
            return;
        }

        const dataForExcel = bookings.map((item, index) => ({
            'No': index + 1,
            'ID Booking': item.id,
            'Tanggal': item.tanggal,
            'Jam Mulai': item.jam_mulai,
            'Jam Selesai': item.jam_selesai,
            'Panel Interaktif': item.panel_id,
            'Nama Guru': item.nama_guru,
            'Mata Pelajaran': item.mata_pelajaran,
            'Keperluan': item.keperluan || '-',
            'Status': item.status ? item.status.toUpperCase() : 'PENDING'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

        worksheet['!cols'] = [
            { wch: 5 },  // No
            { wch: 16 }, // ID Booking
            { wch: 14 }, // Tanggal
            { wch: 12 }, // Jam Mulai
            { wch: 12 }, // Jam Selesai
            { wch: 16 }, // Panel
            { wch: 22 }, // Nama Guru
            { wch: 20 }, // Mapel
            { wch: 25 }, // Keperluan
            { wch: 14 }  // Status
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Booking");

        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Laporan_Booking_Panel_${today}.xlsx`);

        Swal.close();
        showSuccess('File Excel berhasil diunduh!');

    } catch (error) {
        showError('Gagal melakukan export Excel: ' + error.message);
    }
}

// --- INITIALIZATION SINGLE LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadAppData();

    // Event Export Excel
    const btnExport = document.getElementById('btnExportExcel');
    if (btnExport) {
        btnExport.addEventListener('click', handleExportExcel);
    }
});

// --- REGISTRASI SERVICE WORKER UNTUK PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => {
                console.log('[SW] Registered successfully:', reg.scope);
            })
            .catch((err) => {
                console.error('[SW] Registration failed:', err);
            });
    });
}