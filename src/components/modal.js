import { isJamOperasional } from '../utils/date-helper.js';
import { withAntiDoubleSubmit, showSuccess, showError, showLoading } from '../utils/ui-helper.js';
import { api } from '../api/index.js';
import { isValidDuration } from '../utils/date-helper.js';

export const initModal = (panels, onSuccessCallback) => {
    const modal = document.getElementById('bookingModal');
    const backdrop = document.getElementById('modalBackdrop');
    const content = document.getElementById('modalContent');
    const btnClose = document.getElementById('btnCloseModal');
    const form = document.getElementById('formBooking');
    const selectPanel = document.getElementById('inputPanel');
    const btnFAB = document.getElementById('btnFAB');

    // Isi Dropdown Panel dari data Spreadsheet
    selectPanel.innerHTML = '<option value="">-- Pilih Panel --</option>';
    panels.forEach(p => {
        if(p.status === 'aktif') {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nama_panel;
            selectPanel.appendChild(opt);
        }
    });

    const openModal = (initialDate = null) => {
        form.reset();
        if (initialDate) document.getElementById('inputTanggal').value = initialDate;
        
        modal.classList.remove('hidden');
        // Sedikit delay untuk trigger animasi transisi Tailwind
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            content.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => modal.classList.add('hidden'), 200); // Tunggu animasi selesai
    };

    // Event Listeners
    if (btnFAB) btnFAB.addEventListener('click', () => openModal());
    btnClose.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Form Submit Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('inputTanggal').value;
        const jamMulai = document.getElementById('inputJamMulai').value;
        const jamSelesai = document.getElementById('inputJamSelesai').value;

        // 1. Validasi Jam Operasional (07:00 - 16:00)
        const cekJam = isJamOperasional(tanggal, jamMulai, jamSelesai);
        if (!cekJam.valid) {
            showError(cekJam.pesan);
            return; // Hentikan eksekusi
        }

        // 2. Validasi Durasi (Selesai > Mulai) --> BARU
         // Pastikan ini di-import di atas file modal.js
        const cekDurasi = isValidDuration(jamMulai, jamSelesai);
        if (!cekDurasi.valid) {
            showError(cekDurasi.pesan);
            return; // Hentikan eksekusi
        }

        const payload = {
            id: 'BK-' + Date.now(),
            tanggal: tanggal,
            jam_mulai: jamMulai,
            jam_selesai: jamSelesai,
            panel_id: selectPanel.value,
            nama_guru: document.getElementById('inputGuru').value,
            mata_pelajaran: document.getElementById('inputMapel').value,
            keperluan: document.getElementById('inputMapel').value
        };

        const btnSubmit = document.getElementById('btnSubmitBooking');

        // Gunakan Anti-Double Submit
        withAntiDoubleSubmit(btnSubmit, async () => {
            // Tampilkan popup loading menutupi layar
            showLoading("Mengirim permohonan booking...");
            
            await api.createBooking(payload);
            
            closeModal();
            showSuccess("Booking berhasil diajukan dan menunggu persetujuan admin!");
            
            if (onSuccessCallback) onSuccessCallback();
        });
    });

    // Expose openModal agar bisa dipanggil dari calendar.js (saat tanggal diklik)
    return { openModal };
};