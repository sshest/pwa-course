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
    
}));

workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "aa88e4ce2be709cebe4f9def8dcdc0e4"
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
    "revision": "579870ed59177c7cf9fc3e8b8af90f29"
  },
  {
    "url": "src/js/feed.js",
    "revision": "dcf272e4bbce7d7ba2f69bbd17db4f73"
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
    "revision": "518b88b453b46bf329a4d35ec7a4fe9f"
  },
  {
    "url": "sw.js",
    "revision": "492bcb45df1faa9438891578663dac24"
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
