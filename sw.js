// Service worker: يخزّن غلاف التطبيق فقط. بيانات النظام تضل على Google Apps Script.
var CACHE = "astudiopm-shell-v3";
var SHELL = [
  "./",
  "index.html",
  "offline.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // لا نتدخل بطلبات جوجل

  if (req.mode === "navigate") {
    // الشبكة أولاً، وإذا ما في إنترنت نعرض صفحة offline
    e.respondWith(
      fetch(req).catch(function () { return caches.match("offline.html"); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) { return hit || fetch(req); })
  );
});
