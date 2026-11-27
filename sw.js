/* Tứ Chiếu: service worker tối giản để cài được lên màn hình.
   Luôn lấy bản mới từ mạng trước (không giữ bản cũ khi vừa cập nhật web); mất mạng mới dùng bản đã lưu. Không đụng tới /api. */
const C = 'tuchieu-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== C) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request);
      if (r.ok) { const c = await caches.open(C); c.put(e.request, r.clone()); }
      return r;
    } catch (err) {
      const hit = await caches.match(e.request, { ignoreSearch: u.pathname === '/' });
      if (hit) return hit;
      throw err;
    }
  })());
});
