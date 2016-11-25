self.addEventListener('install', function _installHandler(e) {
    e.waitUntil(
        caches.open('static')
            .then(function _addToCache(cache) {
                cache.addAll([
                    '/css/master.css',
                    '/js/app.js',
                    '/views/templates.html',
                    '/'
                ])
            })
    );
});

self.addEventListener('fetch', function _fetchHandler(e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(e.request);
            })
    );
});