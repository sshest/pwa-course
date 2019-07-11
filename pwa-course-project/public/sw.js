
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker ...', event);
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetching smth ', event);
});