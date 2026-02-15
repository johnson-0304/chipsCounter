var CACHE_NAME = "chips-counter-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./counter.js",
  "./themeChanger.js",
  "./decimal.js",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      // Network first for HTML, cache first for assets
      if (e.request.mode === "navigate") {
        return fetch(e.request).catch(function () { return cached; });
      }
      return cached || fetch(e.request);
    })
  );
});
