var CACHE_NAME = 'static-v12';

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
}

function _getFromCache(req) {
    return caches.open(CACHE_NAME)
        .then(cache => {
            return caches.match(req).then(response => {
                if (response) {
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
    e.waitUntil(_addToCache('addAll', [
        '/']));
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