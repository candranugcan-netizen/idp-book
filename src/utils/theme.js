/**
 * Modul untuk mengatur Light/Dark Mode dan menyimpannya di Local Storage.
 */
export const initTheme = () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;
    
    // Cek LocalStorage atau preferensi sistem operasi pengguna
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
    // Terapkan tema saat awal dimuat
    if (isDarkMode) {
        htmlElement.classList.add('dark');
        themeIcon.textContent = '☀️';
    } else {
        htmlElement.classList.remove('dark');
        themeIcon.textContent = '🌙';
    }
    
    // Event Listener ketika tombol bulan/matahari diklik
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle class 'dark' di tag <html>
            htmlElement.classList.toggle('dark');
            const isDarkNow = htmlElement.classList.contains('dark');
            
            // Simpan pilihan ke Local Storage agar tidak hilang saat direfresh
            localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
            
            // Ubah ikon dengan animasi halus (karena ada class trans-200 di UI)
            themeIcon.textContent = isDarkNow ? '☀️' : '🌙';
        });
    }
};