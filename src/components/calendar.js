import { formatWaktuIndo } from '../utils/date-helper.js';

export const initCalendar = (bookings, openModalCallback) => {
    // 1. Inisialisasi FullCalendar (Desktop)
    const calendarEl = document.getElementById('fullCalendarContainer');
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'approved': return '#2563EB'; // Biru
            case 'pending': return '#EAB308'; // Kuning
            case 'rejected': return '#EF4444'; // Merah
            default: return '#64748B'; // Abu-abu
        }
    };

    const events = bookings.map(b => ({
        id: b.id,
        title: `${b.panel_id} - ${b.nama_guru}`,
        start: `${b.tanggal}T${b.jam_mulai}`,
        end: `${b.tanggal}T${b.jam_selesai}`,
        color: getStatusColor(b.status),
        extendedProps: { ...b }
    }));

    if (calendarEl) {
        calendarEl.innerHTML = ''; // Clear instance lama jika re-render
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: window.innerWidth < 1024 ? 'timeGridWeek' : 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events,
            dateClick: (info) => openModalCallback(info.dateStr),
            eventClick: (info) => {
                const d = info.event.extendedProps;
                Swal.fire({
                    title: 'Detail Booking',
                    html: `
                        <div class="text-left space-y-2 mt-4 text-sm">
                            <p><strong>Panel:</strong> ${d.panel_id}</p>
                            <p><strong>Guru:</strong> ${d.nama_guru}</p>
                            <p><strong>Mapel:</strong> ${d.mata_pelajaran}</p>
                            <p><strong>Waktu:</strong> ${d.jam_mulai} - ${d.jam_selesai}</p>
                            <p><strong>Status:</strong> <span class="uppercase font-bold">${d.status}</span></p>
                        </div>
                    `,
                    confirmButtonColor: '#2563EB'
                });
            }
        });
        calendar.render();
    }

    // 2. Render Mobile View awal
    const datePicker = document.getElementById('mobileDatePicker');
    const selectedDate = datePicker && datePicker.value ? datePicker.value : null;
    renderMobileAgenda(bookings, selectedDate);
};

export const renderMobileAgenda = (bookings, selectedDate = null) => {
    const mobileAgendaList = document.getElementById('mobileAgendaList');
    const datePicker = document.getElementById('mobileDatePicker');
    
    if (!mobileAgendaList) return;

    // Set default date ke hari ini jika kosong
    if (!selectedDate) {
        selectedDate = new Date().toISOString().split('T')[0];
    }

    if (datePicker) {
        datePicker.value = selectedDate;
    }

    // Filter agenda berdasarkan tanggal
    const dailyBookings = bookings.filter(b => String(b.tanggal).trim() === String(selectedDate).trim());
    
    // Sort berdasarkan jam mulai
    dailyBookings.sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''));

    mobileAgendaList.innerHTML = '';

    if (dailyBookings.length === 0) {
        mobileAgendaList.innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">Tidak ada booking untuk tanggal ini.</p>`;
        return;
    }

    dailyBookings.forEach(b => {
        let statusBadge = '';
        let borderClass = '';
        if (b.status === 'approved') {
            statusBadge = '<span class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs rounded-lg font-semibold">Disetujui</span>';
            borderClass = 'border-l-4 border-l-blue-600';
        } else if (b.status === 'pending') {
            statusBadge = '<span class="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs rounded-lg font-semibold">Pending</span>';
            borderClass = 'border-l-4 border-l-amber-500';
        } else {
            statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs rounded-lg font-semibold">Ditolak</span>';
            borderClass = 'border-l-4 border-l-red-500';
        }

        const card = document.createElement('div');
        card.className = `bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 ${borderClass} flex flex-col gap-2`;
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-sm font-bold text-slate-800 dark:text-white">${b.jam_mulai} - ${b.jam_selesai}</span>
                ${statusBadge}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-300">
                <p class="font-semibold text-primary">${b.panel_id}</p>
                <p>${b.nama_guru} • ${b.mata_pelajaran}</p>
            </div>
        `;
        mobileAgendaList.appendChild(card);
    });
};

/**
 * Inisialisasi Navigasi Tanggal Mobile (Input Date + Tombol Prev/Next)
 */
export function initMobileDatePicker(onDateChangeCallback) {
    const btnPrev = document.getElementById('btnPrevDate');
    const btnNext = document.getElementById('btnNextDate');
    const datePicker = document.getElementById('mobileDatePicker');

    if (!datePicker) return;

    // Helper: Format Date Object ke "YYYY-MM-DD"
    const formatDate = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper: Parse string "YYYY-MM-DD" ke Date Lokal tanpa efek UTC Shift
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        return new Date();
    };

    if (!datePicker.value) {
        datePicker.value = formatDate(new Date());
    }

    const handleDateUpdate = () => {
        const selectedDate = datePicker.value;
        if (typeof onDateChangeCallback === 'function') {
            onDateChangeCallback(selectedDate);
        }
    };

    // Tombol Prev (Mundur 1 Hari)
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            const current = parseLocalDate(datePicker.value);
            current.setDate(current.getDate() - 1);
            datePicker.value = formatDate(current);
            handleDateUpdate();
        });
    }

    // Tombol Next (Maju 1 Hari)
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const current = parseLocalDate(datePicker.value);
            current.setDate(current.getDate() + 1);
            datePicker.value = formatDate(current);
            handleDateUpdate();
        });
    }

    // Input Date Manual
    datePicker.addEventListener('change', () => {
        handleDateUpdate();
    });
}