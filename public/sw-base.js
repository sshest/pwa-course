/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

const savePostUrl = 'https://us-central1-pwa-cource-project.cloudfunctions.net/storePostsData';

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
        maxEntries: 3,
        maxAgeSeconds: 60 * 60 * 24 * 30
    }
}));

workbox.routing.registerRoute(/.*(?:firebasestorage.googleapis)\.com.*$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'post-images'
}));

workbox.routing.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'material-css'
}));

workbox.routing.registerRoute('https://us-central1-pwa-cource-project.cloudfunctions.net/', (args) => {
    return fetch(args.event.request)
        .then((res) => {
            const clonedResponse = res.clone();
            clearAllData('posts')
                .then(() => {
                    return clonedResponse.json()
                })
                .then((data) => {
                    for (const key in data) {
                        if (!data.hasOwnProperty(key)) {
                            return;
                        }
                        writeData('posts', data[key]);
                    }
                });
            return res;
        });
});

workbox.routing.registerRoute((routeData )=> {
    return routeData.event.request.headers.get('accept').includes('text/html');
}, (args) => {
    return caches.match(args.event.request)
        .then((response) => {
            if (response) {
                return response;
            } else {
                return fetch(args.event.request)
                    .then((res) => {
                        return caches.open('dynamic')
                            .then((cache) => {
                                cache.put(args.event.request.url, res.clone());
                                return res;
                            })
                    })
                    .catch((err) => {
                        return caches.match('/offline.html')
                            .then((res) => {
                                return res;
                            })
                    });
            }
        });
});

self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background syncing');
    if (event.tag === 'sync-new-post') {
        event.waitUntil(
            readAllData('sync-posts')
                .then((data) => {
                    for (const dt of data) {
                        const postId = dt.id;
                        const postData = new FormData();
                        postData.append('id', postId);
                        postData.append('title', dt.title);
                        postData.append('location', dt.location);
                        postData.append('file', dt.picture, postId + '.png');
                        postData.append('rawLocation', dt.rawLocation);
                        fetch(savePostUrl, {
                            method: 'POST',
                            body: postData
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

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    if (action === 'confirm') {
        notification.close();
    } else {
        event.waitUntil(
            clients.matchAll()
                .then(cnts => {
                    const client = cnts.find(c => c.visibilityState === 'visible');
                    if (!!client) {
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url);
                    }
                })
        );
        notification.close();
    }
});

self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed', event);
});

self.addEventListener('push', (event) => {
    console.log('Push notification received, event');

    let data = {
        title: 'New!',
        content: 'Dummy content from the browser',
        openUrl: '/'
    };
    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    const options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
});
workbox.precaching.precacheAndRoute([]);
