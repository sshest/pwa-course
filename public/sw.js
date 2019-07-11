
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker ...', event);
    event.waitUntil(caches.open('static')
        .then((cache) => {
            console.log('[Serwice worker] Precaching App Shell');
            cache.add('/src/js/app.js');
        }));
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                   return response;
                } else {
                    return fetch(event.request);
                }
            })
    );
});