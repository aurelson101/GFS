// Fonctionnalités additionnelles pour l'application de gestion financière
console.log('🚀 Chargement des fonctionnalités additionnelles...');

// Module de gestion des notifications améliorées
const NotificationSystem = {
    notifications: [],
    
    create(message, type = 'info', duration = 4000, actions = []) {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date(),
            actions
        };
        
        this.notifications.push(notification);
        this.render(notification);
        
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
        
        return id;
    },
    
    render(notification) {
        const container = this.getContainer();
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('data-id', notification.id);
        
        const timeStr = notification.timestamp.toLocaleTimeString();
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-icon">${this.getIcon(notification.type)}</span>
                    <span class="notification-time">${timeStr}</span>
                    <button class="notification-close" onclick="NotificationSystem.remove(${notification.id})">×</button>
                </div>
                <div class="notification-message">${notification.message}</div>
                ${notification.actions.length > 0 ? `
                    <div class="notification-actions">
                        ${notification.actions.map(action => `
                            <button class="btn btn-sm btn-${action.type || 'primary'}" 
                                    onclick="${action.onclick}; NotificationSystem.remove(${notification.id})">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(element);
        
        // Animation d'entrée
        setTimeout(() => element.classList.add('show'), 10);
    },
    
    getContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    },
    
    getIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    },
    
    remove(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('hide');
            setTimeout(() => element.remove(), 300);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
    },
    
    clear() {
        this.notifications.forEach(n => this.remove(n.id));
    }
};

// Module de gestion des tâches et rappels
const TaskManager = {
    tasks: [],
    
    init() {
        this.loadTasks();
        this.checkDueTasks();
        setInterval(() => this.checkDueTasks(), 60000); // Vérifier toutes les minutes
    },
    
    addTask(title, description, dueDate, priority = 'medium') {
        const task = {
            id: Date.now(),
            title,
            description,
            dueDate: new Date(dueDate),
            priority,
            completed: false,
            createdAt: new Date()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        return task;
    },
    
    completeTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = true;
            task.completedAt = new Date();
            this.saveTasks();
        }
    },
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
    },
    
    checkDueTasks() {
        const now = new Date();
        const dueTasks = this.tasks.filter(task => 
            !task.completed && 
            task.dueDate <= now &&
            !task.notified
        );
        
        dueTasks.forEach(task => {
            NotificationSystem.create(
                `Tâche en retard: ${task.title}`,
                'warning',
                0,
                [
                    {
                        text: 'Marquer terminé',
                        type: 'success',
                        onclick: `TaskManager.completeTask(${task.id})`
                    },
                    {
                        text: 'Reporter',
                        type: 'secondary',
                        onclick: `TaskManager.postponeTask(${task.id})`
                    }
                ]
            );
            task.notified = true;
        });
        
        this.saveTasks();
    },
    
    postponeTask(id, days = 1) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.dueDate.setDate(task.dueDate.getDate() + days);
            task.notified = false;
            this.saveTasks();
        }
    },
    
    saveTasks() {
        localStorage.setItem('financialApp_tasks', JSON.stringify(this.tasks));
    },
    
    loadTasks() {
        const saved = localStorage.getItem('financialApp_tasks');
        if (saved) {
            this.tasks = JSON.parse(saved).map(task => ({
                ...task,
                dueDate: new Date(task.dueDate),
                createdAt: new Date(task.createdAt),
                completedAt: task.completedAt ? new Date(task.completedAt) : null
            }));
        }
    }
};

// Module d'analyse de tendances
const TrendAnalysis = {
    analyzeRevenueTrend(data, months = 12) {
        const recentData = this.getRecentMonths(data, months);
        if (recentData.length < 3) return null;
        
        const values = recentData.map(d => d.revenue);
        const trend = this.calculateTrend(values);
        const volatility = this.calculateVolatility(values);
        
        return {
            trend: trend > 0.1 ? 'hausse' : trend < -0.1 ? 'baisse' : 'stable',
            percentage: Math.abs(trend * 100),
            volatility: volatility < 0.2 ? 'faible' : volatility < 0.5 ? 'modérée' : 'élevée',
            prediction: this.predictNextMonth(values)
        };
    },
    
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    },
    
    calculateVolatility(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return Math.sqrt(variance) / mean;
    },
    
    predictNextMonth(values) {
        if (values.length < 3) return values[values.length - 1] || 0;
        
        const trend = this.calculateTrend(values);
        const lastValue = values[values.length - 1];
        return Math.max(0, lastValue + trend * values.length);
    },
    
    getRecentMonths(data, count) {
        const allMonths = [];
        Object.keys(data).forEach(year => {
            data[year].forEach((month, index) => {
                allMonths.push({
                    ...month,
                    year: parseInt(year),
                    month: index
                });
            });
        });
        
        return allMonths
            .sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month))
            .slice(-count);
    }
};

// Module de backup et synchronisation cloud
const CloudSync = {
    providers: {
        localStorage: true,
        googleDrive: false,
        dropbox: false
    },
    
    init() {
        this.setupAutoBackup();
    },
    
    setupAutoBackup() {
        // Backup automatique toutes les 30 minutes
        setInterval(() => {
            if (window.app && window.app.config?.autoBackup) {
                this.createBackup();
            }
        }, 30 * 60 * 1000);
    },
    
    createBackup() {
        try {
            const timestamp = new Date().toISOString();
            const backupData = {
                version: '2.1',
                timestamp,
                data: window.app?.data || {},
                config: window.app?.config || {},
                tasks: TaskManager.tasks || []
            };
            
            // Backup local
            localStorage.setItem('financialApp_backup_latest', JSON.stringify(backupData));
            
            // Garder les 5 derniers backups
            this.rotateBackups(backupData);
            
            console.log('💾 Backup automatique créé:', timestamp);
            return backupData;
        } catch (error) {
            console.error('❌ Erreur lors du backup:', error);
            return null;
        }
    },
    
    rotateBackups(newBackup) {
        const maxBackups = 5;
        let backups = [];
        
        try {
            const saved = localStorage.getItem('financialApp_backups');
            backups = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Erreur lecture backups existants:', error);
            backups = [];
        }
        
        backups.unshift(newBackup);
        backups = backups.slice(0, maxBackups);
        
        localStorage.setItem('financialApp_backups', JSON.stringify(backups));
    },
    
    getBackups() {
        try {
            const saved = localStorage.getItem('financialApp_backups');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erreur lecture backups:', error);
            return [];
        }
    },
    
    restoreBackup(backup) {
        try {
            if (window.app) {
                window.app.data = backup.data || {};
                window.app.config = { ...window.app.config, ...(backup.config || {}) };
                
                if (backup.tasks) {
                    TaskManager.tasks = backup.tasks;
                    TaskManager.saveTasks();
                }
                
                window.app.generateTable();
                window.app.saveToStorage();
                
                NotificationSystem.create('Backup restauré avec succès', 'success');
                return true;
            }
        } catch (error) {
            console.error('Erreur restauration backup:', error);
            NotificationSystem.create('Erreur lors de la restauration', 'error');
            return false;
        }
    }
};

// Module d'optimisation des performances
const PerformanceOptimizer = {
    init() {
        this.optimizeEventListeners();
        this.setupLazyLoading();
        this.monitorPerformance();
    },
    
    optimizeEventListeners() {
        // Debounce pour les inputs
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        
        // Appliquer debounce aux inputs de calcul
        document.querySelectorAll('input[type="number"]').forEach(input => {
            const originalOnInput = input.oninput;
            if (originalOnInput) {
                input.oninput = debounce(originalOnInput, 300);
            }
        });
    },
    
    setupLazyLoading() {
        // Chargement paresseux des graphiques
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.loaded) {
                    this.loadChart(entry.target);
                    entry.target.dataset.loaded = 'true';
                }
            });
        });
        
        document.querySelectorAll('canvas').forEach(canvas => {
            chartObserver.observe(canvas);
        });
    },
    
    loadChart(canvas) {
        // Charger le graphique seulement quand il devient visible
        if (window.app && typeof window.app.updateCharts === 'function') {
            window.app.updateCharts();
        }
    },
    
    monitorPerformance() {
        // Surveillance des performances
        setInterval(() => {
            if (performance.memory) {
                const memory = performance.memory;
                const memoryUsage = memory.usedJSHeapSize / 1048576; // MB
                
                if (memoryUsage > 100) {
                    console.warn('⚠️ Utilisation mémoire élevée:', memoryUsage.toFixed(1), 'MB');
                    this.optimizeMemory();
                }
            }
        }, 30000); // Vérifier toutes les 30 secondes
    },
    
    optimizeMemory() {
        // Nettoyer les anciens listeners
        this.cleanupEventListeners();
        
        // Nettoyer les anciennes notifications
        if (NotificationSystem.notifications.length > 10) {
            const toRemove = NotificationSystem.notifications.slice(0, -5);
            toRemove.forEach(n => NotificationSystem.remove(n.id));
        }
        
        // Forcer la collecte des déchets si possible
        if (window.gc) {
            window.gc();
        }
    },
    
    cleanupEventListeners() {
        // Supprimer les listeners orphelins
        document.querySelectorAll('[data-listener-cleanup]').forEach(element => {
            element.remove();
        });
    }
};

// Styles pour les nouvelles fonctionnalités
const additionalStyles = `
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.notification {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    border-left: 4px solid;
}

.notification.show {
    opacity: 1;
    transform: translateX(0);
}

.notification.hide {
    opacity: 0;
    transform: translateX(100%);
}

.notification-info { border-left-color: #3b82f6; }
.notification-success { border-left-color: #10b981; }
.notification-warning { border-left-color: #f59e0b; }
.notification-error { border-left-color: #ef4444; }

.notification-content {
    padding: 12px 16px;
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
}

.notification-icon {
    font-size: 16px;
}

.notification-time {
    font-size: 12px;
    color: #666;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 20px;
    height: 20px;
}

.notification-close:hover {
    color: #666;
}

.notification-message {
    margin: 5px 0;
    font-size: 14px;
    line-height: 1.4;
}

.notification-actions {
    margin-top: 8px;
    display: flex;
    gap: 5px;
}

.btn-sm {
    padding: 3px 8px;
    font-size: 12px;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.trend-indicator {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 5px;
}

.trend-up {
    background-color: #dcfce7;
    color: #166534;
}

.trend-down {
    background-color: #fee2e2;
    color: #991b1b;
}

.trend-stable {
    background-color: #f3f4f6;
    color: #374151;
}

.performance-badge {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 11px;
    z-index: 1000;
}

@media (max-width: 768px) {
    .notification-container {
        left: 20px;
        right: 20px;
        max-width: none;
    }
    
    .notification {
        transform: translateY(-100%);
    }
    
    .notification.show {
        transform: translateY(0);
    }
    
    .notification.hide {
        transform: translateY(-100%);
    }
}
`;

// Ajouter les styles
if (!document.getElementById('additionalStyles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'additionalStyles';
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}

// Initialiser les modules quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initialisation des fonctionnalités additionnelles...');
    
    TaskManager.init();
    CloudSync.init();
    PerformanceOptimizer.init();
    
    // Connecter le nouveau système de notifications à l'app principale
    setTimeout(() => {
        if (window.app) {
            const originalShowNotification = window.app.showNotification;
            window.app.showNotification = function(message, type = 'info', duration = 4000) {
                NotificationSystem.create(message, type, duration);
            };
        }
    }, 1000);
    
    console.log('✅ Fonctionnalités additionnelles chargées');
});

// Export des modules pour utilisation externe
window.NotificationSystem = NotificationSystem;
window.TaskManager = TaskManager;
window.TrendAnalysis = TrendAnalysis;
window.CloudSync = CloudSync;
window.PerformanceOptimizer = PerformanceOptimizer;