/**
 * File konfigurasi global aplikasi.
 * Mencegah hardcode (penulisan nilai langsung) yang berulang di banyak tempat.
 */
export const CONFIG = {
    APP_NAME: 'Aplikasi Booking Panel',
    API_URL: 'https://script.google.com/macros/s/AKfycbyABKyMxSmhdPtE6tImNMLTqFpaVgMdRmgA1uLDH_U663tQd7pp_RCZGunLbTp8ltXGmQ/exec', // Akan diisi URL Google Apps Script pada Tahap 6
    OPERASIONAL: {
        BUKA: '06:30',
        TUTUP_HARI_KERJA: '15:30',
        TUTUP_SABTU: '12:00'
    },
    ROLE: {
        GURU: 'guru',
        ADMIN: 'admin'
    }
};