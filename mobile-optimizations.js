/**
 * mobile-optimizations.js
 * Ce script est chargé en dernier et optimise spécifiquement la performance mobile
 */

// Fonction pour charger les ressources de manière différée
function loadResourcesWhenIdle() {
    // Vérifier si requestIdleCallback est disponible
    const requestIdle = window.requestIdleCallback || 
        function(cb) { return setTimeout(function() { 
            const start = Date.now();
            cb({ 
                didTimeout: false, 
                timeRemaining: function() { return Math.max(0, 50 - (Date.now() - start)); } 
            }); 
        }, 1); };
    
    // Charger les ressources moins critiques quand le navigateur est inactif
    requestIdle(() => {
        // Charger les polices personnalisées si nécessaires
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        document.head.appendChild(fontLink);
        
        // Précharger les images nécessaires
        const iconURLs = [
            "./icons/icon-72x72.png",
            "./icons/icon-192x192.png"
        ];
        
        iconURLs.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }, { timeout: 2000 });
}

// Gérer l'installation de l'application (PWA)
function handlePWAInstall() {
    let deferredPrompt;
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone || 
                          document.referrer.includes('android-app://');
    
    if (isPWAInstalled) {
        console.log('Application déjà installée en mode PWA');
        return;
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Empêcher Chrome de montrer automatiquement la boîte de dialogue
        e.preventDefault();
        // Stocker l'événement pour plus tard
        deferredPrompt = e;
        
        // Afficher notre propre bouton d'installation
        setTimeout(() => {
            if (!localStorage.getItem('pwa-dismissed')) {
                showInstallBanner();
            }
        }, 30000); // Attendre 30s pour ne pas gêner l'utilisateur immédiatement
    });
    
    function showInstallBanner() {
        if (!deferredPrompt) return;
        
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div>
                <strong>Installer l'application</strong>
                <p>Utilisez cette application hors-ligne et accédez-y plus rapidement</p>
            </div>
            <div>
                <button class="btn btn-primary btn-install">Installer</button>
                <button class="btn-close" aria-label="Fermer">×</button>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        const installBtn = banner.querySelector('.btn-install');
        const closeBtn = banner.querySelector('.btn-close');
        
        installBtn.addEventListener('click', async () => {
            // Montrer la boîte de dialogue d'installation
            deferredPrompt.prompt();
            // Attendre que l'utilisateur réponde
            const { outcome } = await deferredPrompt.userChoice;
            // On n'a plus besoin de l'événement
            deferredPrompt = null;
            // Supprimer la bannière
            banner.remove();
            
            if (outcome === 'accepted') {
                console.log('Utilisateur a accepté l\'installation');
            } else {
                console.log('Utilisateur a refusé l\'installation');
                localStorage.setItem('pwa-dismissed', 'true');
            }
        });
        
        closeBtn.addEventListener('click', () => {
            banner.remove();
            localStorage.setItem('pwa-dismissed', 'true');
        });
    }
}

// Optimiser les images pour les appareils mobiles
function optimizeImages() {
    if (!window.IntersectionObserver) return;
    
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                img.classList.add('loaded');
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Optimiser le défilement des longs tableaux
function optimizeTableScrolling() {
    const tables = document.querySelectorAll('.table-container');
    
    tables.forEach(table => {
        let lastScrollPosition = 0;
        let scrollTimeout;
        
        table.addEventListener('scroll', function() {
            // Si on défile rapidement, réduire les animations pour améliorer les performances
            if (!table.classList.contains('fast-scrolling')) {
                table.classList.add('fast-scrolling');
            }
            
            // Réactiver les animations après la fin du défilement
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                table.classList.remove('fast-scrolling');
            }, 150);
            
            lastScrollPosition = this.scrollLeft;
        }, { passive: true });
    });
}

// Initialiser toutes les optimisations mobiles
document.addEventListener('DOMContentLoaded', () => {
    const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches ||
                             'ontouchstart' in window;
    
    // Charge les ressources moins critiques pendant les périodes d'inactivité
    loadResourcesWhenIdle();
    
    // Sur mobile/tablette, activer les optimisations supplémentaires
    if (isMobileOrTablet) {
        // Optimiser le chargement des images
        optimizeImages();
        
        // Améliorer le défilement des tableaux
        optimizeTableScrolling();
        
        // Gérer l'installation PWA
        handlePWAInstall();
        
        // Appliquer les optimisations tactiles
        document.querySelectorAll('a, button, .btn, input[type="submit"], select')
            .forEach(el => {
                el.style.touchAction = 'manipulation';
            });
    }
});
