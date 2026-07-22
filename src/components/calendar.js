import { formatWaktuIndo } from '../utils/date-helper.js';

export const initCalendar = (bookings, openModalCallback) => {
    // 1. Inisialisasi FullCalendar (Desktop)
    const calendarEl = document.getElementById('fullCalendarContainer');
    
    // Pemetaan warna berdasarkan status
    const getStatusColor = (status) => {
        switch(status) {
            case 'approved': return '#2563EB'; // Biru
            case 'pending': return '#EAB308'; // Kuning
            case 'rejected': return '#EF4444'; // Merah
            default: return '#64748B'; // Abu-abu
        }
    };

    // Format data API ke format FullCalendar
    const events = bookings.map(b => ({
        id: b.id,
        title: `${b.panel_id} - ${b.nama_guru}`,
        start: `${b.tanggal}T${b.jam_mulai}`,
        end: `${b.tanggal}T${b.jam_selesai}`,
        color: getStatusColor(b.status),
        extendedProps: { ...b }
    }));

    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: window.innerWidth < 1024 ? 'timeGridWeek' : 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events,
            dateClick: (info) => openModalCallback(info.dateStr), // Buka form form ketika klik tanggal
            eventClick: (info) => {
                // Tampilkan detail via SweetAlert saat event diklik
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

    // 2. Render Mobile View
    renderMobileAgenda(bookings);
};

export const renderMobileAgenda = (bookings, selectedDate = null) => {
    const mobileAgendaList = document.getElementById('mobileAgendaList');
    const datePicker = document.getElementById('mobileDatePicker');
    
    // Set default date ke hari ini jika kosong
    if (!selectedDate) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        selectedDate = today;
    } else {
        datePicker.value = selectedDate;
    }

    // Filter agenda berdasarkan tanggal
    const dailyBookings = bookings.filter(b => b.tanggal === selectedDate);
    
    // Sort berdasarkan jam mulai
    dailyBookings.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

    mobileAgendaList.innerHTML = ''; // Clear skeleton

    if (dailyBookings.length === 0) {
        mobileAgendaList.innerHTML = `<p class="text-center text-slate-500 py-8">Tidak ada booking untuk tanggal ini.</p>`;
        return;
    }

    dailyBookings.forEach(b => {
        // Tentukan warna border dan badge
        let statusBadge = '';
        let borderClass = '';
        if (b.status === 'approved') {
            statusBadge = '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-semibold">Disetujui</span>';
            borderClass = 'border-l-4 border-l-blue-600';
        } else if (b.status === 'pending') {
            statusBadge = '<span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg font-semibold">Pending</span>';
            borderClass = 'border-l-4 border-l-amber-500';
        } else {
            statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-semibold">Ditolak</span>';
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