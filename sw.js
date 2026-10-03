const CACHE_VERSION = "20261003184500";
const CORE_CACHE = `tidal-study-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tidal-study-runtime-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20261003184500",
  "./farm.css?v=20261003184500",
  "./character-roster.js?v=20261003184500",
  "./character-marks.js?v=20261003184500",
  "./farm-game.js?v=20261003184500",
  "./farm-art.js?v=20261003184500",
  "./app.js?v=20261003184500",
  "./manifest.webmanifest",
  "./assets/characters/idle/idle-frames.js?v=20261003184500",
  "./assets/characters/idle/deep-current/idle.webp",
  "./assets/mobile/characters/cute/deep-current-cute-cutout-v1.webp",
  "./assets/mobile/characters/cute/frost-scale-cute-cutout-v1.webp",
  "./assets/mobile/characters/cute/scarlet-page-cute-cutout-v1.webp",
  "./assets/farm/doubao/map-tide-meadow-v2-2560.webp",
  "./assets/farm/doubao/map-moon-bay-v2-2560.webp",
  "./assets/farm/doubao/map-coral-terrace-v2-2560.webp",
  "./assets/farm/doubao/buildings/tide-meadow-cottage.png",
  "./assets/farm/npc/lanyin-portrait-v1.png",
  "./assets/mobile/farm/workbuddy/farm-background.webp",
  "./assets/mobile/farm/doubao/cottage-level-1.webp",
  "./assets/mobile/farm/doubao/cottage-level-2.webp",
  "./assets/mobile/farm/doubao/cottage-level-3.webp",
  "./assets/mobile/farm/doubao/room-level-1.webp",
  "./assets/mobile/farm/doubao/room-level-2.webp",
  "./assets/mobile/farm/doubao/room-level-3.webp",
  "./assets/launcher/tidal-study-192.png",
  "./assets/launcher/tidal-study-512.png",
  "./assets/launcher/tidal-study-maskable-512.png",
  "./vendor/lucide.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
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
            .filter((key) => key !== CORE_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isRuntimeAsset(request, url) {
  return (
    request.destination === "image" ||
    url.pathname.includes("/assets/mobile/") ||
    url.pathname.includes("/assets/characters/idle/") ||
    url.pathname.endsWith("/vendor/lucide.js")
  );
}

function isShellAsset(request) {
  return ["style", "script", "manifest", "font"].includes(request.destination);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CORE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put("./index.html", response.clone());
    return response;
  } catch {
    return (await cache.match("./index.html")) || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isRuntimeAsset(request, url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (isShellAsset(request)) {
    event.respondWith(staleWhileRevalidate(request, CORE_CACHE));
  }
});
