importScripts('/src/js/idb.js');

const CACHE_STATIC_CURRENT_NAME = 'static-v3';
const CACHE_DYNAMIC_CURRENT_NAME = 'dynamic-v2';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

const dbPromise = idb.open('posts-store', 1, (db) => {
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {keyPath: 'id'});
    }
});

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker ...', event);
    event.waitUntil(caches.open(CACHE_STATIC_CURRENT_NAME)
        .then((cache) => {
            console.log('[Serwice worker] Precaching App Shell');
            cache.addAll(STATIC_FILES);
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
    var url = 'https://pwa-cource-project.firebaseio.com/posts';
    // get from network only data requests not cached previously
    if (~event.request.url.indexOf(url)) {
        console.log('[Service Worker] JSON Data requested');
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    const clonedResponse = res.clone();
                    clonedResponse.json()
                        .then((data) => {
                            for (const key in data) {
                                if(!data.hasOwnProperty(key)) {
                                    return;
                                }
                                dbPromise
                                    .then((db) => {
                                        const transaction = db.transaction('posts', 'readwrite');
                                        const store = transaction.objectStore('posts');
                                        store.put(data[key]);
                                        return transaction.complete;
                                    })
                            }
                        });
                    return res;
                })
        );
    } else if (STATIC_FILES.includes(event.request.url)) {
        // Use cache only strategy for static files
        event.respondWith(
        //Respond with cached resource
        caches.match(event.request));
    } else {
        // get pre-fetched resources from cache
        // otherwise try to get from network
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
                            .catch((err) => {
                                return caches.open(CACHE_STATIC_CURRENT_NAME)
                                    .then((cache) => {
                                        // return fallback file if html file is requested
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    })
                            });
                    }
                })
        );
    }

});

// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         caches.match(event.request)
//             .then((response) => {
//                 if (response) {
//                    return response;
//                 } else {
//                     return fetch(event.request)
//                         .then((res) => {
//                             return caches.open(CACHE_DYNAMIC_CURRENT_NAME)
//                                 .then((cache) => {
//                                     cache.put(event.request.url, res.clone());
//                                     return res;
//                                 })
//                         })
//                         .catch((err) => {
//                             return caches.open(CACHE_STATIC_CURRENT_NAME)
//                                 .then((cache) => {
//                                     return cache.match('/offline.html');
//                                 })
//                         });
//                 }
//             })
//     );
// });

// //Network first with cache fallback strategy
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         fetch(event.request)
//             // Use dynamic caching if loaded from network
//             .then((res => caches.open(CACHE_DYNAMIC_CURRENT_NAME)
//                                     .then((cache) => {
//                                         cache.put(event.request.url, res.clone());
//                                         return res;
//                                     })))
//             .catch((error) => {
//                 // on any error try to get resource from the cache
//                 return caches.match(event.request);
//             })
//     );
// });

// // Cache only strategy - no network request
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         //Respond with cached resource
//         caches.match(event.request)
//     );
// });

// // Network only strategy - no cache used
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         //Respond with fetched resource
//         fetch(event.request)
//     );
// });