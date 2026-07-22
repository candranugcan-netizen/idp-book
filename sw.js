const CACHE_NAME = 'booking-panel-v1';

// Daftar file statis yang akan disimpan di Cache Browser
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/manifest.json',
    '/src/main.js',
    '/src/admin.js',
    '/src/api/index.js',
    '/src/config/constants.js',
    '/src/utils/theme.js',
    '/src/utils/date-helper.js',
    '/src/utils/ui-helper.js',
    '/src/components/calendar.js',
    '/src/components/modal.js',
    '/src/components/datatable.js'
];

// 1. INSTALL: Simpan semua file statis ke Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets...');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Hapus Cache lama jika ada pembaruan versi
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH: Strategi Caching (Stale-While-Revalidate untuk UI, Network Only untuk API)
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Jangan simpan permintaan API Google Apps Script ke Cache (Harus selalu Live Data)
    if (requestUrl.hostname.includes('script.google.com')) {
        return; 
    }

    // Untuk aset UI statis: Ambil dari Cache dulu, lalu perbarui di latar belakang
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch ulang di background untuk update cache
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {/* Abaikan error fetch saat offline */});

                return cachedResponse;
            }

            // Jika tidak ada di cache, ambil dari internet
            return fetch(event.request);
        })
    );
});