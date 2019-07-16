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

workbox.precaching.precacheAndRoute([]);
