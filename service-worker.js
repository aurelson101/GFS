/**
 * Service Worker pour l'application de Gestion Financière SAS
 * Permet l'utilisation hors ligne et l'amélioration des performances
 */

const CACHE_NAME = 'gfs-cache-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './responsive.css',
    './script_new_fixed.js',
    './data_manager.js',
    './stats.js',
    './comparison_module.js',
    './forecast_module.js',
    './budget_module.js',
    './reports_module.js',
    './optimizations.js',
    './enhancements.js',
    './advanced_features.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('Erreur lors de la mise en cache:', error);
            })
    );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Suppression des anciens caches:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    return self.clients.claim();
});

// Stratégie de mise en cache: Cache First, puis réseau avec mise à jour du cache
self.addEventListener('fetch', event => {
    // Ne pas mettre en cache les requêtes non GET
    if (event.request.method !== 'GET') return;
    
    // Ne pas mettre en cache les URLs externes sauf celles dans STATIC_ASSETS
    const url = new URL(event.request.url);
    const isCacheableExternal = STATIC_ASSETS.some(asset => 
        asset.startsWith('http') && event.request.url.includes(asset));
    
    if (url.origin !== self.location.origin && !isCacheableExternal) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si trouvé dans le cache, le renvoyer mais aussi mettre à jour le cache en arrière-plan
                if (cachedResponse) {
                    // Mise à jour du cache en arrière-plan
                    fetch(event.request)
                        .then(response => {
                            // Ne mettre à jour le cache que si la réponse est valide
                            if (response.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, response));
                            }
                        })
                        .catch(() => { /* Erreur silencieuse si mise à jour impossible */ });
                    
                    return cachedResponse;
                }
                
                // Si pas dans le cache, faire la requête réseau et mettre en cache
                return fetch(event.request)
                    .then(response => {
                        // Ne mettre en cache que si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    })
                    .catch(error => {
                        console.error('Erreur réseau:', error);
                        
                        // Si c'est une page HTML, renvoyer une page hors-ligne personnalisée
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }
                        
                        // Sinon, propager l'erreur
                        throw error;
                    });
            })
    );
});

// Gestion des messages du client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
