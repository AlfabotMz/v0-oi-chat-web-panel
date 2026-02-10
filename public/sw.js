self.addEventListener('install', (event) => {
    console.log('[v0 SW] Instalando Service Worker...');
});

self.addEventListener('fetch', (event) => {
    // Minimal sw to satisfy PWA requirements
});
