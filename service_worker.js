var CACHE_NAME = 'static';

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

self.addEventListener('install', function _installHandler(e) {
    e.waitUntil(_addToCache('addAll', [
        '/css/master.css',
        '/js/app.js',
        '/views/templates.html',
        '/'])
    );
});

self.addEventListener('fetch', function _fetchHandler(e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (response) {
                if (response) {
                    return response;
                }

                var request = e.request.clone();

                return fetch(e.request).then(
                    response => {
                        if (!response ||
                            response.status !== 200 ||
                            response.type !== 'basic') {
                            return response;
                        }

                        var responseClone = response.clone();
                        _addToCache(e.request, responseClone);

                        return response;
                    }
                );
            })
    );
});