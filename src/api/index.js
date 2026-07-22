/**
 * src/api/index.js
 * Modul untuk menangani semua komunikasi data dengan Backend (Google Apps Script).
 */
import { CONFIG } from '../config/constants.js';
import { showError } from '../utils/ui-helper.js';

/**
 * Fungsi base request yang membungkus logika fetch dan error handling SweetAlert2
 */
const request = async (url, options = {}) => {
    try {
        // Karena GAS sering kali melakukan HTTP Redirect untuk keamanan,
        // parameter redirect: 'follow' ini WAJIB ada.
        const mergedOptions = {
            ...options,
            redirect: 'follow' 
        };

        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        }

        const result = await response.json();

        // Cek response JSON dari Google Apps Script (Tahap 6)
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        // Jika sukses, kembalikan bagian "data"-nya saja
        return result.data;

    } catch (error) {
        // Tampilkan SweetAlert dari ui-helper (otomatis memblokir UI dengan pesan error)
        showError(error.message);
        
        // Lempar kembali error-nya agar fungsi pemanggil bisa mematikan status loading
        throw error; 
    }
};

/**
 * Objek 'api' yang berisi kumpulan fungsi spesifik untuk diekspor ke UI Component
 */
export const api = {
    // GET: Ambil daftar Panel
    getPanels: () => {
        return request(`${CONFIG.API_URL}?action=getPanels`);
    },

    // GET: Ambil daftar Booking
    getBookings: () => {
        return request(`${CONFIG.API_URL}?action=getBookings`);
    },

    // POST: Simpan Booking Baru
    createBooking: (payloadData) => {
        return request(CONFIG.API_URL, {
            method: 'POST',
            // Gunakan text/plain untuk melewati batasan CORS pada Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify({
                action: 'createBooking',
                data: payloadData
            })
            
        });
    },

    updateStatus: (id, status) => {
        return request(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'updateStatus',
                data: {
                    id: id,
                    status: status
                }
            })
        });
    }

    
};

