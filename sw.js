const CACHE_NAME = 'color-tiles-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/favicon.svg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // 새 SW 즉시 대기 해제
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // AdSense 스크립트는 네트워크에서만 로드
  if (event.request.url.includes('googlesyndication.com') || 
      event.request.url.includes('adsbygoogle.js')) {
    return; // Service Worker에서 처리하지 않음
  }
  
  // HTML 문서는 네트워크 우선(최신 반영), 그 외는 캐시 우선
  const req = event.request;
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => new Response('Network error', { status: 408 }));
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 모든 클라이언트에 즉시 적용
  clients.claim();
});

// 메시지로 강제 활성화 지원
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
