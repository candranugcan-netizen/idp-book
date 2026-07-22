/**
 * Konfigurasi Global SweetAlert agar sesuai dengan tema Tailwind
 */
const swalConfig = {
    confirmButtonColor: '#2563EB', // Warna Primary (blue-600)
    cancelButtonColor: '#64748B',  // slate-500
    borderRadius: '1rem',
};

export const showLoading = (title = "Memproses...") => {
    Swal.fire({
        title: title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const showSuccess = (message) => {
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: message,
        confirmButtonColor: swalConfig.confirmButtonColor,
        timer: 3000,
        timerProgressBar: true
    });
};

export const showError = (message) => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        confirmButtonColor: swalConfig.confirmButtonColor,
    });
};

/**
 * Custom Anti-Double Submit Wrapper
 */
export const withAntiDoubleSubmit = async (buttonElement, asyncFunction) => {
    if (buttonElement.disabled) return; // Cegah jika sedang loading
    
    // Simpan teks asli tombol
    const originalText = buttonElement.innerHTML;
    
    try {
        // Disable tombol & ubah tampilan jadi loading
        buttonElement.disabled = true;
        buttonElement.classList.add('opacity-75', 'cursor-not-allowed');
        buttonElement.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`;
        
        await asyncFunction();
    } catch (error) {
        showError(error.message || "Terjadi kesalahan pada sistem.");
    } finally {
        // Kembalikan tombol ke state awal
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-75', 'cursor-not-allowed');
        buttonElement.innerHTML = originalText;
    }
};

/**
 * Utility Debounce untuk pencarian
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};