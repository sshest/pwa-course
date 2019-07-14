importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_CURRENT_NAME = 'static-v5';
const CACHE_DYNAMIC_CURRENT_NAME = 'dynamic-v5';
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
const url = 'https://us-central1-pwa-cource-project.cloudfunctions.net/storePostsData';

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
    // get from network only data requests not cached previously
    if (~event.request.url.indexOf(url)) {
        console.log('[Service Worker] JSON Data requested');
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    const clonedResponse = res.clone();
                    clearAllData('posts')
                        .then(() => {
                            return clonedResponse.json()
                        })
                        .then((data) => {
                            for (const key in data) {
                                if(!data.hasOwnProperty(key)) {
                                    return;
                                }
                                writeData('posts', data[key]);
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

self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background syncing');
    if (event.tag === 'sync-new-post') {
        event.waitUntil(
            readAllData('sync-posts')
                .then((data) => {
                    for (const dt of data) {
                        const postId = dt.id;
                        fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                title: dt.title,
                                location: dt.location,
                                image: 'https://firebasestorage.googleapis.com/v0/b/pwa-cource-project.appspot.com/o/sf-boat.jpg?alt=media&token=f954cec8-8679-4ee6-85c5-8eb10cdf69da'
                            })
                        })
                            .then((resp) => {
                                console.log('Sent data ', resp);
                                if (resp.ok) {
                                    deleteSingleItemData('sync-posts', postId);
                                }
                            })
                            .catch(console.log);
                    }
                })
        )
    }
});