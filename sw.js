const CACHE_VERSION = "20261003225500";
const CORE_CACHE = `tidal-study-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tidal-study-runtime-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20261003225500",
  "./farm.css?v=20261003225500",
  "./character-roster.js?v=20261003225500",
  "./character-marks.js?v=20261003225500",
  "./farm-game.js?v=20261003225500",
  "./farm-art.js?v=20261003225500",
  "./app.js?v=20261003225500",
  "./manifest.webmanifest",
  "./assets/characters/idle/idle-frames.js?v=20261003225500",
  "./assets/launcher/tidal-study-192.png",
  "./assets/launcher/tidal-study-512.png",
  "./assets/launcher/tidal-study-maskable-512.png",
  "./vendor/lucide.js",
];

async function precacheCoreAssets() {
  const cache = await caches.open(CORE_CACHE);
  await Promise.allSettled(
    CORE_ASSETS.map(async (asset) => {
      const response = await fetch(asset, { cache: "reload" });
      if (response.ok) await cache.put(asset, response);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    precacheCoreAssets().then(() => self.skipWaiting()),
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
  if (response.ok || response.type === "opaque") {
    try {
      await cache.put(request, response.clone());
    } catch {
      // 部分浏览器的跨域响应可能不允许落盘，图片仍可正常显示。
    }
  }
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
