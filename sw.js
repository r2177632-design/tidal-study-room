const CACHE_NAME = "tidal-study-shell-v20261003170000";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./farm.css",
  "./character-roster.js",
  "./character-marks.js",
  "./farm-game.js",
  "./farm-art.js",
  "./app.js",
  "./vendor/lucide.js",
  "./manifest.webmanifest",
  "./assets/launcher/tidal-study.ico",
  "./assets/launcher/tidal-study-180.png",
  "./assets/launcher/tidal-study-192.png",
  "./assets/launcher/tidal-study-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match("./index.html").then(
                (fallback) =>
                  fallback ||
                  new Response("潮汐书斋暂时无法离线打开。", {
                    status: 503,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                  }),
              ),
          ),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
