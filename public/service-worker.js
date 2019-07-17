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
workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "a4e2271d19eb1f6f93a15e1b7a4e74dd"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "fa0e35159c7095db007067b09a3fae88"
  },
  {
    "url": "manifest.json",
    "revision": "8254faad7ae461b36b6ecbca9f9692ae"
  },
  {
    "url": "offline.html",
    "revision": "c32f2712f4683cda624ea09ef0196de6"
  },
  {
    "url": "src/css/app.css",
    "revision": "a01a26923591260184caeb4f5ae5fb50"
  },
  {
    "url": "src/css/feed.css",
    "revision": "c175e6a45ea0442b3a45f971831d0fe2"
  },
  {
    "url": "src/css/help.css",
    "revision": "81922f16d60bd845fd801a889e6acbd7"
  },
  {
    "url": "src/js/app.js",
    "revision": "fa7d68c8051c0072ae70823e7d5be6e5"
  },
  {
    "url": "src/js/feed.js",
    "revision": "3ab6132b0b376683ea3dbe73382ced1a"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "a19d2f0046405943299effe64f614336"
  },
  {
    "url": "src/js/idb.js",
    "revision": "a52b1a00d763b5e6caa3075499b77184"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "e68511951f1285c5cbf4aa510e8a2faf"
  },
  {
    "url": "src/js/promise.js",
    "revision": "c1109fcd842c06ca5c0c54bbd6acdb3d"
  },
  {
    "url": "src/js/utility.js",
    "revision": "c071139857ae3872639d84723ee8e5c5"
  },
  {
    "url": "sw-base.js",
    "revision": "babf328bcd6f9548cf8041920b04bcb4"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);
