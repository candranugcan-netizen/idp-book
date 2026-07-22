/**
 * Utility untuk memanipulasi dan memformat tanggal sesuai standar Indonesia (WIB)
 */

// Format ke: "Senin, 15 Agustus 2026"
export const formatTanggalIndo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

// Format ke: "08:30" (WIB)
export const formatWaktuIndo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

// Cek apakah waktu yang dipilih masuk jam operasional
export const isJamOperasional = (tanggal, jamMulai, jamSelesai) => {
    const hari = new Date(tanggal).getDay(); // 0 = Minggu, 1 = Senin, dst
    
    // Minggu libur
    if (hari === 0) return { valid: false, pesan: "Hari Minggu tidak dapat melakukan booking." };
    
    const batasMulai = "06:30";
    const batasSelesai = (hari === 6) ? "12:00" : "15:30"; // Sabtu s/d 12:00
    
    if (jamMulai < batasMulai || jamSelesai > batasSelesai) {
        return { 
            valid: false, 
            pesan: `Di luar jam operasional. Jam aktif: ${batasMulai} - ${batasSelesai}` 
        };
    }
    
    if (jamMulai >= jamSelesai) {
        return { valid: false, pesan: "Jam selesai harus lebih besar dari jam mulai." };
    }
    
    return { valid: true, pesan: "Oke" };
};

export const isValidDuration = (jamMulai, jamSelesai) => {
    // Ubah "08:30" menjadi menit (8 * 60 + 30 = 510)
    const getMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const menitMulai = getMinutes(jamMulai);
    const menitSelesai = getMinutes(jamSelesai);

    if (menitSelesai <= menitMulai) {
        return {
            valid: false,
            pesan: "Jam Selesai harus lebih lambat dari Jam Mulai."
        };
    }

    return { valid: true };
};