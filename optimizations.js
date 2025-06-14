/**
 * Optimisations et Corrections Finales
 * Corrections de bugs et améliorations de performance
 */

// Corrections globales et optimisations
document.addEventListener('DOMContentLoaded', () => {
    // Correction du formatage de devises global
    if (typeof app !== 'undefined' && app && !app.formatCurrency) {
        app.formatCurrency = function(amount) {
            if (typeof amount !== 'number' || isNaN(amount)) return '0 €';
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };
    }
    
    // Correction de la gestion des erreurs pour les graphiques
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Segoe UI', 'Roboto', sans-serif";
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.animation.duration = 750;
        
        // Plugin global pour gérer les erreurs de graphiques
        Chart.register({
            id: 'errorHandler',
            beforeInit: function(chart) {
                const originalUpdate = chart.update;
                chart.update = function(...args) {
                    try {
                        return originalUpdate.apply(this, args);
                    } catch (error) {
                        console.error('Erreur lors de la mise à jour du graphique:', error);
                        if (typeof app !== 'undefined' && app.showNotification) {
                            app.showNotification('Erreur lors de la mise à jour du graphique', 'warning');
                        }
                    }
                };
            }
        });
    }
    
    // Optimisation des calculs avec debouncing
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // Appliquer le debouncing aux inputs
    setTimeout(() => {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            if (!input.dataset.debounced) {
                const originalHandler = input.onchange || input.oninput;
                const debouncedHandler = debounce((e) => {
                    if (originalHandler) originalHandler(e);
                    if (typeof app !== 'undefined' && app.updateTotals) {
                        app.updateTotals();
                    }
                }, 300);
                
                input.addEventListener('input', debouncedHandler);
                input.dataset.debounced = 'true';
            }
        });
    }, 2000);
    
    // Correction de la gestion des données manquantes
    if (typeof FinancialApp !== 'undefined') {
        // Méthode sécurisée pour récupérer les données d'une année
        FinancialApp.prototype.getYearDataSafe = function(year) {
            if (!this.data[year]) {
                this.data[year] = this.months.map(month => ({
                    month: month,
                    revenue: 0,
                    losses: 0,
                    purchases: 0
                }));
            }
            return this.data[year];
        };
        
        // Validation des données avant sauvegarde
        FinancialApp.prototype.validateData = function() {
            const errors = [];
            
            Object.keys(this.data).forEach(year => {
                const yearData = this.data[year];
                if (!Array.isArray(yearData)) {
                    errors.push(`Données invalides pour l'année ${year}`);
                    return;
                }
                
                yearData.forEach((month, index) => {
                    if (!month || typeof month !== 'object') {
                        errors.push(`Données manquantes pour le mois ${index + 1} de ${year}`);
                        return;
                    }
                    
                    ['revenue', 'losses', 'purchases'].forEach(field => {
                        if (typeof month[field] !== 'number' || isNaN(month[field]) || month[field] < 0) {
                            month[field] = 0; // Correction automatique
                        }
                    });
                });
            });
            
            if (errors.length > 0) {
                console.warn('Erreurs de données détectées et corrigées:', errors);
                if (this.showNotification) {
                    this.showNotification(`${errors.length} erreur(s) de données corrigée(s)`, 'info');
                }
            }
            
            return errors.length === 0;
        };
        
        // Méthode de sauvegarde sécurisée
        FinancialApp.prototype.saveToStorageSafe = function() {
            try {
                this.validateData();
                
                const dataToSave = {
                    data: this.data,
                    config: this.config,
                    currentYear: this.currentYear,
                    version: '3.0',
                    lastSaved: new Date().toISOString()
                };
                
                localStorage.setItem('financialData', JSON.stringify(dataToSave));
                
                // Backup dans sessionStorage également
                sessionStorage.setItem('financialDataBackup', JSON.stringify(dataToSave));
                
                return true;
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                if (this.showNotification) {
                    this.showNotification('Erreur lors de la sauvegarde', 'danger');
                }
                return false;
            }
        };
        
        // Méthode de chargement sécurisée
        FinancialApp.prototype.loadFromStorageSafe = function() {
            try {
                let savedData = null;
                
                // Essayer localStorage d'abord
                try {
                    const localData = localStorage.getItem('financialData');
                    if (localData) {
                        savedData = JSON.parse(localData);
                    }
                } catch (e) {
                    console.warn('Erreur lecture localStorage:', e);
                }
                
                // Fallback sur sessionStorage
                if (!savedData) {
                    try {
                        const sessionData = sessionStorage.getItem('financialDataBackup');
                        if (sessionData) {
                            savedData = JSON.parse(sessionData);
                            if (this.showNotification) {
                                this.showNotification('Données restaurées depuis la sauvegarde de session', 'info');
                            }
                        }
                    } catch (e) {
                        console.warn('Erreur lecture sessionStorage:', e);
                    }
                }
                
                if (savedData) {
                    // Vérifier la version
                    if (savedData.version && savedData.version !== '3.0') {
                        this.migrateData(savedData);
                    }
                    
                    this.data = savedData.data || {};
                    this.config = { ...this.config, ...savedData.config };
                    this.currentYear = savedData.currentYear || new Date().getFullYear();
                    
                    this.validateData();
                    return true;
                }
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
                if (this.showNotification) {
                    this.showNotification('Erreur lors du chargement des données', 'warning');
                }
            }
            
            return false;
        };
        
        // Migration des données anciennes versions
        FinancialApp.prototype.migrateData = function(oldData) {
            console.log('Migration des données depuis la version', oldData.version);
            
            // Ajouter les champs manquants dans la config
            if (!oldData.config) oldData.config = {};
            
            const defaultConfig = {
                taxRate: 25,
                themeColor: '#3b82f6',
                alertThreshold: 5000,
                autoBackup: false,
                darkMode: false
            };
            
            Object.keys(defaultConfig).forEach(key => {
                if (oldData.config[key] === undefined) {
                    oldData.config[key] = defaultConfig[key];
                }
            });
            
            if (this.showNotification) {
                this.showNotification('Données migrées vers la nouvelle version', 'success');
            }
        };
        
        // Optimisation de la mise à jour des totaux
        FinancialApp.prototype.updateTotalsOptimized = function() {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            
            this.updateTimeout = setTimeout(() => {
                this.updateTotals();
                this.updateCharts();
                
                // Vérifier les seuils d'alerte
                if (this.config.alertThreshold > 0) {
                    this.checkAlertThresholds();
                }
            }, 100);
        };
        
        // Vérification des seuils d'alerte
        FinancialApp.prototype.checkAlertThresholds = function() {
            const yearData = this.getYearDataSafe(this.currentYear);
            const currentMonth = new Date().getMonth();
            
            if (yearData[currentMonth]) {
                const monthData = yearData[currentMonth];
                const grossProfit = monthData.revenue - monthData.losses - monthData.purchases;
                const netProfit = grossProfit - (grossProfit > 0 ? grossProfit * this.config.taxRate / 100 : 0);
                
                if (netProfit < 0 && Math.abs(netProfit) > this.config.alertThreshold) {
                    this.showAlert(`Alerte: Pertes importantes ce mois (${this.formatCurrency(netProfit)})`, 'danger');
                } else if (monthData.losses > this.config.alertThreshold) {
                    this.showAlert(`Alerte: Pertes élevées ce mois (${this.formatCurrency(monthData.losses)})`, 'warning');
                }
            }
        };
        
        // Système d'alertes amélioré
        FinancialApp.prototype.showAlert = function(message, type = 'info') {
            // Éviter les doublons
            const existingAlerts = document.querySelectorAll('.alert-message');
            for (let alert of existingAlerts) {
                if (alert.textContent.includes(message.substring(0, 30))) {
                    return; // Alert déjà affichée
                }
            }
            
            const alertContainer = document.getElementById('alertsContainer') || this.createAlertContainer();
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-message`;
            alert.innerHTML = `
                <div class="alert-content">
                    <span class="alert-icon">${this.getAlertIcon(type)}</span>
                    <span class="alert-text">${message}</span>
                    <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            alertContainer.appendChild(alert);
            
            // Auto-suppression après 5 secondes pour les infos
            if (type === 'info' || type === 'success') {
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 5000);
            }
        };
        
        // Créer le conteneur d'alertes s'il n'existe pas
        FinancialApp.prototype.createAlertContainer = function() {
            let container = document.getElementById('alertsContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'alertsContainer';
                container.className = 'alerts-container';
                
                const main = document.querySelector('main');
                if (main) {
                    main.insertBefore(container, main.firstChild);
                } else {
                    document.body.appendChild(container);
                }
            }
            return container;
        };
        
        // Icônes pour les alertes
        FinancialApp.prototype.getAlertIcon = function(type) {
            const icons = {
                success: '✅',
                info: 'ℹ️',
                warning: '⚠️',
                danger: '❌',
                error: '🚫'
            };
            return icons[type] || 'ℹ️';
        };
        
        // Système de cache pour améliorer les performances
        FinancialApp.prototype.initCache = function() {
            this.cache = {
                totals: {},
                charts: {},
                stats: {}
            };
        };
        
        // Méthode pour vider le cache
        FinancialApp.prototype.clearCache = function() {
            if (this.cache) {
                this.cache = {
                    totals: {},
                    charts: {},
                    stats: {}
                };
            }
        };
        
        // Calcul des totaux avec cache
        FinancialApp.prototype.calculateTotalsCached = function(year) {
            const cacheKey = `${year}_${JSON.stringify(this.data[year])}`;
            
            if (this.cache && this.cache.totals[cacheKey]) {
                return this.cache.totals[cacheKey];
            }
            
            const yearData = this.getYearDataSafe(year);
            const totals = yearData.reduce((acc, month) => {
                const grossProfit = month.revenue - month.losses - month.purchases;
                const taxes = grossProfit > 0 ? grossProfit * this.config.taxRate / 100 : 0;
                const netProfit = grossProfit - taxes;
                
                return {
                    revenue: acc.revenue + month.revenue,
                    losses: acc.losses + month.losses,
                    purchases: acc.purchases + month.purchases,
                    grossProfit: acc.grossProfit + grossProfit,
                    taxes: acc.taxes + taxes,
                    netProfit: acc.netProfit + netProfit
                };
            }, { revenue: 0, losses: 0, purchases: 0, grossProfit: 0, taxes: 0, netProfit: 0 });
            
            if (this.cache) {
                this.cache.totals[cacheKey] = totals;
            }
            
            return totals;
        };
    }
    
    // Gestion améliorée des erreurs globales
    window.addEventListener('error', (event) => {
        console.error('Erreur JavaScript:', event.error);
        
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification('Une erreur inattendue s\'est produite', 'warning');
        }
        
        // Empêcher l'affichage de l'erreur dans la console du navigateur
        event.preventDefault();
    });
    
    // Gestion des erreurs de promesses non catchées
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesse rejetée non gérée:', event.reason);
        
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification('Erreur de traitement asynchrone', 'warning');
        }
        
        event.preventDefault();
    });
    
    // Optimisation de la réactivité
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(debounce(() => {
            if (typeof app !== 'undefined' && app.updateCharts) {
                app.updateCharts();
            }
        }, 250));
        
        resizeObserver.observe(document.body);
    }
    
    // Préchargement des images et ressources
    function preloadResources() {
        const resources = [
            'https://cdn.jsdelivr.net/npm/chart.js',
            'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
        ];
        
        resources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }
    
    // Initialisation des optimisations
    setTimeout(() => {
        if (typeof app !== 'undefined' && app) {
            // Initialiser le cache
            if (!app.cache) {
                app.initCache();
            }
            
            // Remplacer la méthode saveToStorage par la version sécurisée
            if (app.saveToStorage && !app.saveToStorage.isSafe) {
                app.saveToStorageOriginal = app.saveToStorage;
                app.saveToStorage = app.saveToStorageSafe;
                app.saveToStorage.isSafe = true;
            }
            
            // Remplacer loadFromStorage par la version sécurisée
            if (app.loadFromStorage && !app.loadFromStorage.isSafe) {
                app.loadFromStorageOriginal = app.loadFromStorage;
                app.loadFromStorage = app.loadFromStorageSafe;
                app.loadFromStorage.isSafe = true;
            }
            
            // Améliorer updateTotals
            if (app.updateTotals && !app.updateTotals.isOptimized) {
                app.updateTotalsOriginal = app.updateTotals;
                app.updateTotals = app.updateTotalsOptimized;
                app.updateTotals.isOptimized = true;
            }
            
            console.log('✅ Optimisations et corrections appliquées');
        }
        
        preloadResources();
    }, 500);
});

// Styles CSS pour les améliorations
const optimizationStyles = `
    .alerts-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .alert-message {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
    }
    
    .alert-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .alert-text {
        flex: 1;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .alert-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        padding: 0;
        margin-left: auto;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .alert-close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .alert-message.removing {
        animation: slideOutRight 0.3s ease-in forwards;
    }
    
    /* Optimisations pour les performances */
    .financial-table {
        contain: layout style;
    }
    
    .chart-item {
        contain: layout;
    }
    
    input[type="number"] {
        transition: border-color 0.2s ease;
    }
    
    input[type="number"]:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Indicateurs de chargement */
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        border-radius: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .loading::before {
        content: '⏳';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        z-index: 1;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    /* Améliorations d'accessibilité */
    [role="button"]:focus,
    button:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }
    
    /* Mode haute performance pour les grands tableaux */
    .financial-table.high-performance {
        will-change: transform;
        transform: translateZ(0);
    }
    
    .financial-table.high-performance tbody {
        contain: strict;
        height: 400px;
        overflow-y: auto;
    }
    
    /* Optimisations mobile et tablette */
    @media (max-width: 1024px) {
        .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .back-to-top-btn {
            display: block;
        }
        
        /* Ajustements spécifiques pour les petits écrans */
        input[type="number"],
        input[type="text"],
        select {
            font-size: 16px;
            padding: 10px 8px;
        }
        
        /* Amélioration de la lisibilité des tableaux */
        .financial-table {
            font-size: 0.9rem;
        }
        
        /* Optimisation des graphiques */
        .chart-container {
            height: 300px;
        }
    }
`;

// Ajouter les styles d'optimisation
if (!document.getElementById('optimization-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'optimization-styles';
    styleElement.textContent = optimizationStyles;
    document.head.appendChild(styleElement);
}

console.log('🚀 Module d\'optimisations et corrections chargé');

/**
 * Optimisations mobile et tablette
 * Fonctionnalités pour améliorer l'expérience sur appareils mobiles
 */
function initMobileOptimizations() {
    // Détection d'appareil mobile/tablette
    const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
    
    // Configuration des écouteurs d'événements pour les appareils tactiles
    if (isMobileOrTablet) {
        console.log("Initialisation des optimisations pour appareils mobiles");
        setupMobileOptimizations();
    }

    // Gérer les orientations d'écran
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Installation du Service Worker pour fonctionnalités hors ligne
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
}

/**
 * Configure les optimisations spécifiques aux appareils mobiles
 */
function setupMobileOptimizations() {
    // Amélioration des tableaux défilables
    enhanceScrollableTables();
    
    // Optimisation des événements tactiles
    enhanceTouchTargets();
    
    // Ajouter le bouton "Retour en haut"
    addBackToTopButton();
    
    // Détecter les gestes tactiles pour la navigation
    detectSwipeGestures();
    
    // Optimisation des formulaires pour mobile
    optimizeFormsForMobile();
}

/**
 * Améliore les tableaux pour les rendre plus facilement défilables sur mobile
 */
function enhanceScrollableTables() {
    const tables = document.querySelectorAll('.table-container');
    
    tables.forEach(table => {
        if (!table.classList.contains('enhanced')) {
            // Indicateur de défilement
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.innerHTML = '← Faites défiler →';
            scrollIndicator.style.cssText = `
                text-align: center;
                padding: 5px;
                font-size: 12px;
                color: #666;
                background-color: rgba(255,255,255,0.7);
                border-radius: 4px;
                margin: 5px 0;
                position: sticky;
                left: 50%;
                transform: translateX(-50%);
                z-index: 5;
                pointer-events: none;
            `;
            
            // Ajouter l'indicateur
            if (!table.querySelector('.scroll-indicator')) {
                table.insertBefore(scrollIndicator, table.firstChild);
            }
            
            // Masquer l'indicateur après le premier défilement
            table.addEventListener('scroll', function() {
                const indicator = this.querySelector('.scroll-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            }, { once: true });
            
            table.classList.add('enhanced');
        }
    });
}

/**
 * Améliore les cibles tactiles pour faciliter l'interaction
 */
function enhanceTouchTargets() {
    // Augmenter la zone de clic des petits boutons
    const smallButtons = document.querySelectorAll('.btn-small, .action-btn');
    smallButtons.forEach(button => {
        if (!button.dataset.touchOptimized) {
            button.addEventListener('touchstart', function(e) {
                e.target.style.transform = 'scale(1.1)';
            });
            
            button.addEventListener('touchend', function(e) {
                e.target.style.transform = 'scale(1)';
            });
            
            button.dataset.touchOptimized = 'true';
        }
    });
}

/**
 * Ajoute un bouton "Retour en haut" sur les longs contenus
 */
function addBackToTopButton() {
    // Si le bouton existe déjà, ne pas le recréer
    if (document.querySelector('.back-to-top-btn')) return;
    
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '⬆';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.setAttribute('aria-label', 'Retour en haut de page');
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.8);
        color: white;
        border: none;
        cursor: pointer;
        display: none;
        z-index: 1000;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Afficher le bouton quand on descend dans la page
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Action du bouton
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Détecte les gestes de balayage pour faciliter la navigation
 */
function detectSwipeGestures() {
    if (document.body.dataset.swipeEnabled) return;
    
    let touchstartX = 0;
    let touchendX = 0;
    
    const gestureZone = document.body;
    
    gestureZone.addEventListener('touchstart', function(e) {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    gestureZone.addEventListener('touchend', function(e) {
        touchendX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, {passive: true});
    
    function handleSwipeGesture() {
        const sensitivity = 100; // Sensibilité du balayage
        
        // Balayage vers la gauche
        if (touchendX < touchstartX - sensitivity) {
            // Si on est sur un tableau à onglets, passer à l'onglet suivant
            const activeTabs = document.querySelectorAll('.tab-btn.active');
            if (activeTabs.length > 0) {
                const activeTab = activeTabs[0];
                const nextTab = activeTab.nextElementSibling;
                if (nextTab && nextTab.classList.contains('tab-btn')) {
                    nextTab.click();
                }
            }
        }
        
        // Balayage vers la droite
        if (touchendX > touchstartX + sensitivity) {
            // Si on est sur un tableau à onglets, passer à l'onglet précédent
            const activeTabs = document.querySelectorAll('.tab-btn.active');
            if (activeTabs.length > 0) {
                const activeTab = activeTabs[0];
                const prevTab = activeTab.previousElementSibling;
                if (prevTab && prevTab.classList.contains('tab-btn')) {
                    prevTab.click();
                }
            }
        }
    }
    
    document.body.dataset.swipeEnabled = 'true';
}

/**
 * Optimise les formulaires pour une meilleure expérience sur mobile
 */
function optimizeFormsForMobile() {
    // Ajuster la taille des inputs sur mobile
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.matchMedia('(max-width: 768px)').matches) {
                // Augmenter légèrement la taille sur focus pour faciliter la saisie
                this.style.fontSize = '16px'; // Évite le zoom automatique sur iOS
                this.style.padding = '10px 8px';
            }
        });
        
        input.addEventListener('blur', function() {
            this.style.fontSize = '';
            this.style.padding = '';
        });
    });
    
    // Ajuster les selects pour une meilleure utilisabilité
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            select.style.fontSize = '16px'; // Évite le zoom automatique sur iOS
            select.style.height = '44px'; // Taille minimale recommandée pour tactile
        }
    });
}

/**
 * Gère les changements d'orientation de l'écran
 */
function handleOrientationChange() {
    // Recalculer les hauteurs et largeurs des graphiques
    setTimeout(() => {
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chartContainer => {
            const canvas = chartContainer.querySelector('canvas');
            if (canvas && canvas.chart) {
                canvas.chart.resize();
            }
        });
        
        // Réappliquer certaines optimisations mobiles
        if (window.matchMedia('(max-width: 1024px)').matches) {
            enhanceScrollableTables();
            optimizeFormsForMobile();
        }
    }, 300); // Délai pour laisser le navigateur s'ajuster à la nouvelle orientation
}

/**
 * Enregistre un Service Worker pour les fonctionnalités hors ligne
 */
function registerServiceWorker() {
    if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès:', registration.scope);
            })
            .catch(error => {
                console.error('Échec de l\'enregistrement du Service Worker:', error);
            });
    }
}

// Initialiser les optimisations mobiles au chargement
document.addEventListener('DOMContentLoaded', initMobileOptimizations);