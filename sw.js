/* Mi entrenamiento - cache sencillo para que abra sin internet */
var CACHE = "mi-entrenamiento-v1";
var ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./favicon.png",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-192.png",
  "./icons/maskable-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copia = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(r){ return r || caches.match("./index.html"); });
    })
  );
});
