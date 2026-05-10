self.addEventListener('install', (event) => {
    console.log('[OiChat SW] Instalando Service Worker...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[OiChat SW] Service Worker ativado.');
});

self.addEventListener('fetch', (event) => {
    // Satisfy PWA requirement
});

// Listener básico para Push nativos no celular quando configurados futuramente
self.addEventListener('push', function (event) {
    let payload = { title: "Nova Encomenda - OiChat", body: "Você tem um novo lead!" };

    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body,
        icon: '/oichat-icon.jpg',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('/dashboard/leads') && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow('/dashboard/leads');
            }
        })
    );
});
