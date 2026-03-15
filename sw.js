const CACHE_NAME = 'merch-kw-v3.1';
const ASSETS = [
  '/amazon-merch-keyword-generator/',
  '/amazon-merch-keyword-generator/index.html',
  '/amazon-merch-keyword-generator/manifest.json',
  '/amazon-merch-keyword-generator/icon-192.png',
  '/amazon-merch-keyword-generator/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('api.openai.com') ||
      url.includes('api.anthropic.com') ||
      url.includes('openrouter.ai') ||
      url.includes('generativelanguage.googleapis.com') ||
      url.includes('supabase.co')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
