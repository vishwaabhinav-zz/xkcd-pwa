var CACHE_NAME = 'static-v17';

function _addToCache(method, resource, url) {
    if (method === 'addAll') {
        return caches.open(CACHE_NAME).then(cache => {
            cache[method](resource);
        });
    } else if (method === 'put') {
        return caches.open(CACHE_NAME).then(cache => {
            cache[method](url, resource);
        });
    }
    return Promise.resolve(true);
}

function _getFromCache(req) {
    return caches.open(CACHE_NAME)
        .then(cache => {
            return caches.match(req).then(response => {
                if (response && !req.url.includes('current=-1')) {
                    return response;
                }
                return fetch(req);
            });
        });
}

function updateCache(req) {
    caches.open(CACHE_NAME)
        .then(cache => {
            return fetch(req).then(response => {
                return cache.put(req, response.clone());
            });
        })
}

self.addEventListener('install', function _installHandler(e) {
    e.waitUntil(() => _addToCache('addAll', ['/']).then(() => self.skipWaiting()));
});

self.addEventListener('activate', function _activateHandler(e) {
    return self.clients.claim();
});

self.addEventListener('fetch', function _fetchHandler(e) {
    e.respondWith(_getFromCache(e.request.clone()));

    e.waitUntil(updateCache(e.request));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://xkcd-pwa.herokuapp.com/')
    );
});