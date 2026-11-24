// Мінімальний service worker Easy: лише щоб Android / Chrome дозволяв встановлення в один дотик.
// Нічого не кешує — усі запити йдуть у мережу як звичайно (оновлення сайту видно одразу).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
