const CACHE_NAME = 'trilha-juros-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/components.css',
  './js/news-service.js',
  './js/ticker.js',
  './js/calculator.js',
  './js/ui-controller.js',
  './js/gamification.js',
  './js/buying-power.js',
  './js/editorial-service.js',
  './js/radar-service.js',
  './js/compliance-service.js',
  './js/dictionary-service.js',
  './assets/favicon.png',
  './manifest.json'
];

// O evento 'install' é acionado quando o Service Worker é instalado.
// Ele faz o pré-cache dos arquivos essenciais.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Fazendo cache dos arquivos essenciais');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// O evento 'activate' é acionado quando o SW toma controle.
// Útil para limpar caches antigos.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// O evento 'fetch' intercepta as requisições de rede.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // IMPORTANTE: Não interceptar requisições externas (CORS) para evitar erros no Cache API
  if (!event.request.url.startsWith(self.location.origin)) {
    return; // Deixa o navegador resolver a requisição externa normalmente
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Atualiza o cache se a requisição for bem sucedida
          if (networkResponse.ok && event.request.url.startsWith('http')) {
             // Ignora respostas parciais (vídeos/áudio) pois o Cache API não as suporta
             if (networkResponse.status === 206) return networkResponse;

             const responseClone = networkResponse.clone();
             caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, responseClone);
             });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se falhar (ex: offline), e não houver cache, podemos tratar aqui.
          // O CachedResponse já será retornado abaixo se existir.
          console.warn('[Service Worker] Falha ao buscar:', event.request.url);
        });

      // Retorna a resposta em cache imediatamente se existir, 
      // ou aguarda a rede se não houver cache.
      return cachedResponse || fetchPromise;
    })
  );
});
