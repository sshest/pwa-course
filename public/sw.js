const CACHE_STATIC_CURRENT_NAME = 'static-v2';
const CACHE_DYNAMIC_CURRENT_NAME = 'dynamic-v2';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker ...', event);
    event.waitUntil(caches.open(CACHE_STATIC_CURRENT_NAME)
        .then((cache) => {
            console.log('[Serwice worker] Precaching App Shell');
            cache.addAll([
                '/',
                '/index.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/material.min.js',
                '/src/css/app.css',
                '/src/css/feed.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            ]);
        }));
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker ...', event);
    event.waitUntil(
        caches.keys()
            .then((keyList => {
                return Promise.all(
                    keyList.map((key) => {
                        if (key !== CACHE_STATIC_CURRENT_NAME && key !== CACHE_DYNAMIC_CURRENT_NAME) {
                            console.log('[Service Worker] Removing old static cache', key);
                            return caches.delete(key);
                        }
                    })
                )
            }))
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                   return response;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(CACHE_DYNAMIC_CURRENT_NAME)
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        })
                        .catch((err) => {});
                }
            })
    );
});