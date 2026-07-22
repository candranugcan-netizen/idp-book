const CACHE_NAME = 'booking-panel-v1';

// Gunakan path relatif (./) agar aman di localhost maupun subfolder hosting
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './src/main.js',
    './src/api/index.js',
    './src/config/constants.js',
    './src/utils/theme.js',
    './src/utils/date-helper.js',
    './src/utils/ui-helper.js',
    './src/components/calendar.js',
    './src/components/modal.js',
    './src/components/datatable.js'
];

// 1. INSTALL: Simpan file ke cache secara aman (Promise.allSettled)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets...');
            // Menggunakan Promise.allSettled agar jika 1 file 404, SW tidak gagal install
            return Promise.allSettled(
                STATIC_ASSETS.map(url => 
                    cache.add(url).catch(err => console.warn(`[SW] Gagal caching asset: ${url}`, err))
                )
            );
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Hapus cache lama
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

// 3. FETCH: Stale-While-Revalidate untuk UI, Network-Only untuk API Google
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Jangan cache API Google Apps Script
    if (requestUrl.hostname.includes('script.google.com')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {/* Offline fallback */});

                return cachedResponse;
            }

            return fetch(event.request);
        })
    );
});