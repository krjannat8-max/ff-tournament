const CACHE_NAME = 'ff-pro-v6'; // Increment this whenever you update the app
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './auth.js',
    './wallet.js',
    './matches.js',
    './assets/icon.png'
];

// Install: Cache all assets
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Make new SW active immediately
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activate: Cleanup old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
