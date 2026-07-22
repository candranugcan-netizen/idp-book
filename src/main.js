import { initTheme } from './utils/theme.js';
import { api } from './api/index.js';
import { initCalendar, renderMobileAgenda } from './components/calendar.js';
import { initModal } from './components/modal.js';
import { initDataTable } from './components/datatable.js'; // <-- BARU

let appState = {
    panels: [],
    bookings: []
};

let dataTableControl = null; // Simpan referensi datatable

const loadAppData = async () => {
    try {
        const [panelsData, bookingsData] = await Promise.all([
            api.getPanels(),
            api.getBookings()
        ]);
        
        appState.panels = panelsData;
        appState.bookings = bookingsData;

        // Update Dashboard Stats... (kode tetap sama seperti sebelumnya)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('statPanels').textContent = appState.panels.length;
        document.getElementById('statToday').textContent = appState.bookings.filter(b => b.tanggal === today).length;
        document.getElementById('statPending').textContent = appState.bookings.filter(b => b.status === 'pending').length;
        document.getElementById('statApproved').textContent = appState.bookings.filter(b => b.status === 'approved').length;

        // Init/Update Modal & Calendar... (kode tetap sama seperti sebelumnya)
        const modalControl = initModal(appState.panels, loadAppData);
        initCalendar(appState.bookings, (dateStr) => {
            modalControl.openModal(dateStr);
        });

        // --- INIT ATAU UPDATE DATA TABLE ---
        if (!dataTableControl) {
            dataTableControl = initDataTable(appState.bookings);
        } else {
            dataTableControl.updateData(appState.bookings);
        }

    } catch (error) {
        console.error("Gagal merender aplikasi:", error);
    }
};

// ... (Sisa event listener di DOMContentLoaded tetap sama)

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadAppData();

    // Event Listener untuk DatePicker Mobile
    const mobileDatePicker = document.getElementById('mobileDatePicker');
    if (mobileDatePicker) {
        mobileDatePicker.addEventListener('change', (e) => {
            renderMobileAgenda(appState.bookings, e.target.value);
        });
    }
});