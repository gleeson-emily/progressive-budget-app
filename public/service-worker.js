const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./index.js",
  "./db.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function (evt) {

  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );


  self.skipWaiting();
});



self.addEventListener('fetch', function(evt) {
  if(evt.request.url.includes('/api/')) {
      console.log("SERVICE WORKER FETCH DATA", evt.request.url);
  evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
          .then(response => {
              if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
              }
              return response;
          })
          .catch(err => {
              return cache.match(evt.request);
          })
      })
  );
  return
  }

  evt.respondWith(
    fetch(evt.request).catch(function() {
      return caches.match(evt.request).then(function(response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});
