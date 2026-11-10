/* Mi entrenamiento - cache y aviso de actualización */
const V = "me-1.2.0";
const CORE = ["./","index.html","manifest.webmanifest","favicon.png",
  "icons/icon-192.png","icons/icon-512.png","icons/maskable-192.png",
  "icons/maskable-512.png","icons/apple-touch-icon.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE))) });
self.addEventListener("message", e => { if(e.data === "skip") self.skipWaiting() });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request; if(r.method !== "GET") return;
  const u = new URL(r.url);
  if(r.mode === "navigate"){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put("index.html", cp)); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  if(u.origin === location.origin || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if(res && (res.ok || res.type === "opaque")){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
