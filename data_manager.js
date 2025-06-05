// Module de gestion des données optimisé
class DataManager {
    constructor() {
        this.cache = new Map();
        this.observers = [];
        this.validationRules = this.initValidationRules();
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    initValidationRules() {
        return {
            amount: {
                required: true,
                type: 'number',
                min: 0,
                max: 1000000
            },
            date: {
                required: true,
                type: 'date',
                maxAge: 365 * 5 // 5 ans maximum
            },
            type: {
                required: true,
                enum: ['revenue', 'expense']
            },
            category: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 50
            },
            description: {
                type: 'string',
                maxLength: 200
            }
        };
    }

    // Validation avancée des données
    validateData(data) {
        const errors = [];
        
        Object.keys(this.validationRules).forEach(field => {
            const rule = this.validationRules[field];
            const value = data[field];
            
            // Champ requis
            if (rule.required && (!value && value !== 0)) {
                errors.push(`Le champ ${field} est requis`);
                return;
            }
            
            if (value !== undefined && value !== null) {
                // Type de données
                if (rule.type === 'number' && (isNaN(value) || typeof value !== 'number')) {
                    errors.push(`${field} doit être un nombre`);
                }
                
                if (rule.type === 'date' && !this.isValidDate(value)) {
                    errors.push(`${field} doit être une date valide`);
                }
                
                if (rule.type === 'string' && typeof value !== 'string') {
                    errors.push(`${field} doit être une chaîne de caractères`);
                }
                
                // Contraintes numériques
                if (rule.type === 'number') {
                    if (rule.min !== undefined && value < rule.min) {
                        errors.push(`${field} doit être supérieur ou égal à ${rule.min}`);
                    }
                    if (rule.max !== undefined && value > rule.max) {
                        errors.push(`${field} doit être inférieur ou égal à ${rule.max}`);
                    }
                }
                
                // Contraintes de chaîne
                if (rule.type === 'string') {
                    if (rule.minLength && value.length < rule.minLength) {
                        errors.push(`${field} doit contenir au moins ${rule.minLength} caractères`);
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        errors.push(`${field} doit contenir au maximum ${rule.maxLength} caractères`);
                    }
                }
                
                // Énumération
                if (rule.enum && !rule.enum.includes(value)) {
                    errors.push(`${field} doit être l'une des valeurs: ${rule.enum.join(', ')}`);
                }
                
                // Âge maximum pour les dates
                if (rule.type === 'date' && rule.maxAge) {
                    const date = new Date(value);
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() - rule.maxAge);
                    
                    if (date < maxDate) {
                        errors.push(`${field} ne peut pas être antérieur à ${rule.maxAge} jours`);
                    }
                }
            }
        });
        
        // Validations métier personnalisées
        errors.push(...this.customValidations(data));
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    customValidations(data) {
        const errors = [];
        
        // Vérification de cohérence des montants
        if (data.type === 'expense' && data.amount > 50000) {
            errors.push('Dépense exceptionnellement élevée - vérification recommandée');
        }
        
        // Vérification de doublons potentiels
        const existingData = this.getAllData();
        const potential = existingData.find(item => 
            item.date === data.date && 
            item.amount === data.amount && 
            item.type === data.type
        );
        
        if (potential) {
            errors.push('Entrée potentiellement dupliquée détectée');
        }
        
        // Vérification de la cohérence temporelle
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        
        if (new Date(data.date) > futureDate) {
            errors.push('La date ne peut pas être trop éloignée dans le futur');
        }
        
        return errors;
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString !== '';
    }

    // Sauvegarde avec gestion d'erreurs et backup
    saveData(data) {
        try {
            // Validation
            const validation = this.validateData(data);
            if (!validation.isValid) {
                throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
            }
            
            // Ajout d'un ID unique si nécessaire
            if (!data.id) {
                data.id = this.generateUniqueId();
            }
            
            // Horodatage
            data.createdAt = data.createdAt || new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            
            // Sauvegarde principale
            const allData = this.getAllData();
            const existingIndex = allData.findIndex(item => item.id === data.id);
            
            if (existingIndex >= 0) {
                allData[existingIndex] = data;
            } else {
                allData.push(data);
            }
            
            // Sauvegarde avec backup
            this.saveWithBackup(allData);
            
            // Mise à jour du cache
            this.updateCache();
            
            // Notification des observateurs
            this.notifyObservers('dataUpdated', data);
            
            // Synchronisation en ligne si possible
            if (this.isOnline) {
                this.syncToCloud(data);
            } else {
                this.addToSyncQueue(data);
            }
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.notifyObservers('saveError', error);
            return { success: false, error: error.message };
        }
    }

    saveWithBackup(data) {
        try {
            // Sauvegarde principale
            localStorage.setItem('sasFinancialData', JSON.stringify(data));
            
            // Backup avec horodatage
            const backupKey = `sasFinancialData_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(data));
            
            // Nettoyage des anciens backups (garder seulement les 5 derniers)
            this.cleanupOldBackups();
            
        } catch (error) {
            // En cas d'erreur (quota dépassé), essayer de nettoyer et réessayer
            this.emergencyCleanup();
            localStorage.setItem('sasFinancialData', JSON.stringify(data));
        }
    }

    cleanupOldBackups() {
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sasFinancialData_backup_')) {
                backupKeys.push(key);
            }
        }
        
        // Trier par timestamp et garder seulement les 5 plus récents
        backupKeys.sort().slice(0, -5).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    emergencyCleanup() {
        // Nettoyage d'urgence en cas de manque d'espace
        const nonEssentialKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('cache_') || key.includes('temp_'))) {
                nonEssentialKeys.push(key);
            }
        }
        
        nonEssentialKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Récupération des données avec cache intelligent
    getAllData() {
        const cacheKey = 'allData';
        
        // Vérifier le cache d'abord
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                return cached.data;
            }
        }
        
        try {
            const data = JSON.parse(localStorage.getItem('sasFinancialData') || '[]');
            
            // Validation et nettoyage des données
            const cleanData = this.sanitizeData(data);
            
            // Mise en cache
            this.cache.set(cacheKey, {
                data: cleanData,
                timestamp: Date.now()
            });
            
            return cleanData;
            
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return this.recoverFromBackup();
        }
    }

    sanitizeData(data) {
        return data.filter(item => {
            // Supprimer les entrées corrompues ou incomplètes
            return item && 
                   typeof item === 'object' && 
                   item.amount !== undefined && 
                   item.date && 
                   item.type;
        }).map(item => {
            // Nettoyer et normaliser les données
            return {
                ...item,
                amount: parseFloat(item.amount) || 0,
                date: this.normalizeDate(item.date),
                type: item.type.toLowerCase(),
                category: item.category || 'Divers',
                description: item.description || '',
                id: item.id || this.generateUniqueId()
            };
        });
    }

    normalizeDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }

    recoverFromBackup() {
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sasFinancialData_backup_')) {
                backupKeys.push(key);
            }
        }
        
        // Essayer le backup le plus récent
        if (backupKeys.length > 0) {
            const latestBackup = backupKeys.sort().pop();
            try {
                const backupData = JSON.parse(localStorage.getItem(latestBackup) || '[]');
                console.log('Données récupérées depuis le backup:', latestBackup);
                return this.sanitizeData(backupData);
            } catch (error) {
                console.error('Erreur lors de la récupération du backup:', error);
            }
        }
        
        return [];
    }

    // Gestion du cache
    updateCache() {
        this.cache.clear(); // Invalider le cache pour forcer un refresh
    }

    clearCache() {
        this.cache.clear();
    }

    // Système d'observation pour les mises à jour en temps réel
    addObserver(callback) {
        this.observers.push(callback);
    }

    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erreur dans un observateur:', error);
            }
        });
    }

    // Synchronisation cloud (simulation)
    syncToCloud(data) {
        // Simulation d'une synchronisation cloud
        console.log('Synchronisation cloud:', data);
        
        // Dans une vraie application, ici vous feriez un appel API
        setTimeout(() => {
            this.notifyObservers('syncComplete', data);
        }, 1000);
    }

    addToSyncQueue(data) {
        this.syncQueue.push({
            data,
            timestamp: Date.now(),
            attempts: 0
        });
    }

    processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        const itemsToSync = [...this.syncQueue];
        this.syncQueue = [];
        
        itemsToSync.forEach(item => {
            if (item.attempts < 3) {
                this.syncToCloud(item.data);
            } else {
                console.warn('Échec de synchronisation après 3 tentatives:', item);
            }
        });
    }

    // Utilitaires
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Méthodes de recherche et filtrage optimisées
    searchData(query, filters = {}) {
        const data = this.getAllData();
        
        return data.filter(item => {
            // Recherche textuelle
            if (query) {
                const searchFields = ['description', 'category'].join(' ').toLowerCase();
                if (!searchFields.includes(query.toLowerCase())) {
                    return false;
                }
            }
            
            // Filtres
            if (filters.type && item.type !== filters.type) return false;
            if (filters.category && item.category !== filters.category) return false;
            if (filters.dateFrom && new Date(item.date) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && new Date(item.date) > new Date(filters.dateTo)) return false;
            if (filters.minAmount && item.amount < filters.minAmount) return false;
            if (filters.maxAmount && item.amount > filters.maxAmount) return false;
            
            return true;
        });
    }

    // Export de données
    exportData(format = 'json') {
        const data = this.getAllData();
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(data);
            case 'excel':
                return this.exportToExcel(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    exportToCSV(data) {
        const headers = ['Date', 'Type', 'Catégorie', 'Montant', 'Description'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.date,
                item.type,
                item.category,
                item.amount,
                `"${item.description}"`
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }

    exportToExcel(data) {
        // Simulation d'export Excel (nécessiterait une bibliothèque comme SheetJS)
        console.log('Export Excel simulé pour', data.length, 'entrées');
        return this.exportToCSV(data); // Fallback vers CSV
    }

    // Import de données avec validation
    importData(fileContent, format = 'json') {
        try {
            let importedData;
            
            switch (format.toLowerCase()) {
                case 'csv':
                    importedData = this.parseCSV(fileContent);
                    break;
                default:
                    importedData = JSON.parse(fileContent);
            }
            
            // Validation de chaque entrée
            const validEntries = [];
            const errors = [];
            
            importedData.forEach((item, index) => {
                const validation = this.validateData(item);
                if (validation.isValid) {
                    validEntries.push(item);
                } else {
                    errors.push(`Ligne ${index + 1}: ${validation.errors.join(', ')}`);
                }
            });
            
            // Sauvegarde des entrées valides
            validEntries.forEach(item => {
                this.saveData(item);
            });
            
            return {
                success: true,
                imported: validEntries.length,
                errors: errors.length,
                errorDetails: errors
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const item = {};
            
            headers.forEach((header, index) => {
                item[header.trim().toLowerCase()] = values[index]?.trim().replace(/"/g, '');
            });
            
            return item;
        }).filter(item => Object.keys(item).length > 0);
    }
}

// Initialisation du gestionnaire de données
const dataManager = new DataManager();