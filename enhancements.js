/**
 * Améliorations et fonctionnalités supplémentaires pour l'application financière
 */

// Extension de la classe FinancialApp avec des méthodes supplémentaires
if (typeof FinancialApp !== 'undefined') {
    
    /**
     * Calcul des tendances et prévisions automatiques
     */
    FinancialApp.prototype.calculateTrends = function() {
        const yearData = this.data[this.currentYear];
        if (!yearData || yearData.length < 3) return null;
        
        const monthlyRevenues = yearData.map(month => month.revenue);
        const monthlyProfits = yearData.map(month => {
            const gross = month.revenue - month.losses - month.purchases;
            return gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        });
        
        // Calcul de la tendance linéaire simple
        const calculateTrend = (values) => {
            const n = values.length;
            const sumX = (n * (n - 1)) / 2;
            const sumY = values.reduce((a, b) => a + b, 0);
            const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
            const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            return { slope, intercept };
        };
        
        return {
            revenue: calculateTrend(monthlyRevenues),
            profit: calculateTrend(monthlyProfits)
        };
    };
    
    /**
     * Validation des données saisies
     */
    FinancialApp.prototype.validateData = function(monthIndex, field, value) {
        const errors = [];
        
        // Validation basique
        if (value < 0) {
            errors.push(`La valeur ne peut pas être négative`);
        }
        
        if (value > 1000000) {
            errors.push(`La valeur semble anormalement élevée`);
        }
        
        // Validation spécifique par champ
        if (field === 'revenue' && value === 0) {
            const monthName = this.months[monthIndex];
            if (monthIndex > 0 && this.data[this.currentYear][monthIndex - 1].revenue > 0) {
                errors.push(`Pas de revenus en ${monthName} alors qu'il y en avait le mois précédent`);
            }
        }
        
        return errors;
    };
    
    /**
     * Calcul d'indicateurs de performance
     */
    FinancialApp.prototype.calculateKPIs = function() {
        const yearData = this.data[this.currentYear];
        if (!yearData) return null;
        
        const totals = yearData.reduce((acc, month) => {
            const gross = month.revenue - month.losses - month.purchases;
            const net = gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
            
            acc.revenue += month.revenue;
            acc.losses += month.losses;
            acc.purchases += month.purchases;
            acc.grossProfit += gross;
            acc.netProfit += net;
            
            if (month.revenue > 0) acc.activeMonths++;
            
            return acc;
        }, { revenue: 0, losses: 0, purchases: 0, grossProfit: 0, netProfit: 0, activeMonths: 0 });
        
        return {
            averageMonthlyRevenue: totals.activeMonths > 0 ? totals.revenue / totals.activeMonths : 0,
            profitMargin: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0,
            activeMonthsPercent: (totals.activeMonths / 12) * 100,
            breakEvenPoint: totals.netProfit >= 0,
            monthlyGrowthRate: this.calculateMonthlyGrowthRate()
        };
    };
    
    /**
     * Calcul du taux de croissance mensuel
     */
    FinancialApp.prototype.calculateMonthlyGrowthRate = function() {
        const yearData = this.data[this.currentYear];
        if (!yearData || yearData.length < 2) return 0;
        
        const revenues = yearData.map(m => m.revenue).filter(r => r > 0);
        if (revenues.length < 2) return 0;
        
        let totalGrowth = 0;
        let periods = 0;
        
        for (let i = 1; i < revenues.length; i++) {
            if (revenues[i - 1] > 0) {
                totalGrowth += ((revenues[i] - revenues[i - 1]) / revenues[i - 1]) * 100;
                periods++;
            }
        }
        
        return periods > 0 ? totalGrowth / periods : 0;
    };
    
    /**
     * Export des données en format JSON pour sauvegarde
     */
    FinancialApp.prototype.exportToJSON = function() {
        const exportData = {
            data: this.data,
            config: this.config,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestion_financiere_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Sauvegarde JSON créée!', 'success');
    };
    
    /**
     * Recherche et filtrage des données
     */
    FinancialApp.prototype.searchData = function(query, field = 'all') {
        const results = [];
        
        Object.keys(this.data).forEach(year => {
            this.data[year].forEach((month, index) => {
                let match = false;
                
                if (field === 'all' || field === 'month') {
                    if (month.month.toLowerCase().includes(query.toLowerCase())) {
                        match = true;
                    }
                }
                
                if (field === 'all' || field === 'revenue') {
                    if (month.revenue.toString().includes(query)) {
                        match = true;
                    }
                }
                
                if (match) {
                    results.push({
                        year: parseInt(year),
                        monthIndex: index,
                        month: month.month,
                        data: month
                    });
                }
            });
        });
        
        return results;
    };
    
    /**
     * Génération de rapports automatiques
     */
    FinancialApp.prototype.generateReport = function(type = 'annual') {
        const yearData = this.data[this.currentYear];
        if (!yearData) return null;
        
        const kpis = this.calculateKPIs();
        const trends = this.calculateTrends();
        
        const report = {
            year: this.currentYear,
            generatedAt: new Date().toISOString(),
            type: type,
            summary: {
                totalRevenue: yearData.reduce((sum, m) => sum + m.revenue, 0),
                totalExpenses: yearData.reduce((sum, m) => sum + m.losses + m.purchases, 0),
                netProfit: kpis.netProfit,
                profitMargin: kpis.profitMargin
            },
            trends: trends,
            recommendations: this.generateRecommendations(kpis, trends)
        };
        
        return report;
    };
    
    /**
     * Génération de recommandations automatiques
     */
    FinancialApp.prototype.generateRecommendations = function(kpis, trends) {
        const recommendations = [];
        
        if (kpis.profitMargin < 10) {
            recommendations.push({
                type: 'warning',
                title: 'Marge bénéficiaire faible',
                description: 'Votre marge bénéficiaire est inférieure à 10%. Considérez réduire les coûts ou augmenter les prix.',
                priority: 'high'
            });
        }
        
        if (trends.revenue.slope < 0) {
            recommendations.push({
                type: 'danger',
                title: 'Tendance des revenus à la baisse',
                description: 'Vos revenus montrent une tendance décroissante. Il est urgent de revoir votre stratégie commerciale.',
                priority: 'critical'
            });
        }
        
        if (kpis.activeMonthsPercent < 80) {
            recommendations.push({
                type: 'info',
                title: 'Activité irrégulière',
                description: 'Vous avez des mois sans activité. Envisagez de diversifier vos sources de revenus.',
                priority: 'medium'
            });
        }
        
        if (trends.revenue.slope > 1000) {
            recommendations.push({
                type: 'success',
                title: 'Croissance excellente',
                description: 'Votre croissance est remarquable. Maintenez cette dynamique et préparez-vous à gérer l\'expansion.',
                priority: 'low'
            });
        }
        
        return recommendations;
    };
    
    /**
     * Sauvegarde automatique avec versioning
     */
    FinancialApp.prototype.autoBackup = function() {
        if (!this.config.autoBackup) return;
        
        const backupKey = `financialApp_backup_${Date.now()}`;
        const backupData = {
            data: this.data,
            config: this.config,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Nettoyer les anciennes sauvegardes (garder seulement les 5 dernières)
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('financialApp_backup_'))
                .sort()
                .reverse();
            
            if (backupKeys.length > 5) {
                for (let i = 5; i < backupKeys.length; i++) {
                    localStorage.removeItem(backupKeys[i]);
                }
            }
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde automatique:', error);
        }
    };
    
    /**
     * Restauration depuis une sauvegarde
     */
    FinancialApp.prototype.restoreFromBackup = function() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('financialApp_backup_'))
            .sort()
            .reverse();
        
        if (backupKeys.length === 0) {
            this.showNotification('Aucune sauvegarde trouvée', 'warning');
            return;
        }
        
        const backupKey = backupKeys[0]; // Prendre la plus récente
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            
            if (confirm('Restaurer depuis la dernière sauvegarde automatique ?')) {
                this.data = backupData.data;
                this.config = backupData.config;
                this.populateYearSelector();
                this.generateTable();
                this.applyTheme();
                this.saveToStorage();
                this.showNotification('Données restaurées avec succès', 'success');
            }
        } catch (error) {
            this.showNotification('Erreur lors de la restauration', 'danger');
        }
    };
    
    /**
     * Mode sombre/clair
     */
    FinancialApp.prototype.toggleTheme = function() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            this.config.darkMode = false;
        } else {
            body.classList.add('dark-theme');
            this.config.darkMode = true;
        }
        
        this.saveToStorage();
        this.showNotification(`Mode ${isDark ? 'clair' : 'sombre'} activé`, 'info');
    };
    
    /**
     * Raccourcis clavier
     */
    FinancialApp.prototype.setupKeyboardShortcuts = function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S pour sauvegarder
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveToStorage();
                this.showNotification('Données sauvegardées', 'success');
            }
            
            // Ctrl+E pour exporter
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportToExcel();
            }
            
            // Ctrl+D pour dupliquer l'année
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.duplicateYear();
            }
            
            // Ctrl+B pour sauvegarde JSON
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.exportToJSON();
            }
            
            // Échap pour fermer les modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.settings-panel:not(.hidden)');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        });
    };
}

// Ajouter des styles pour le mode sombre
const darkModeStyles = `
.dark-theme {
    --background-color: #1a1a1a;
    --surface-color: #2d2d2d;
    --text-primary: #e4e4e7;
    --text-secondary: #a1a1aa;
    --border-color: #404040;
}

.dark-theme body {
    background-color: var(--background-color);
    color: var(--text-primary);
}

.dark-theme .financial-table th {
    background: #374151;
}

.dark-theme .financial-table tbody tr:hover {
    background-color: #374151;
}
`;

// Ajouter les styles au document
if (!document.getElementById('dark-mode-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'dark-mode-styles';
    styleElement.textContent = darkModeStyles;
    document.head.appendChild(styleElement);
}

// Extension des fonctionnalités lors du chargement
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof app !== 'undefined' && app) {
            // Activer les raccourcis clavier
            app.setupKeyboardShortcuts();
            
            // Programmer une sauvegarde automatique toutes les 5 minutes
            setInterval(() => {
                app.autoBackup();
            }, 5 * 60 * 1000);
            
            // Ajouter le bouton de mode sombre si il n'existe pas
            if (!document.getElementById('themeToggle')) {
                const themeButton = document.createElement('button');
                themeButton.id = 'themeToggle';
                themeButton.className = 'btn btn-secondary';
                themeButton.innerHTML = '🌓 Theme';
                themeButton.onclick = () => app.toggleTheme();
                
                const headerControls = document.querySelector('.header-controls');
                if (headerControls) {
                    headerControls.appendChild(themeButton);
                }
            }
            
            // Ajouter le bouton de sauvegarde JSON
            if (!document.getElementById('jsonExportBtn')) {
                const jsonButton = document.createElement('button');
                jsonButton.id = 'jsonExportBtn';
                jsonButton.className = 'btn btn-info';
                jsonButton.innerHTML = '💾 Backup JSON';
                jsonButton.onclick = () => app.exportToJSON();
                
                const headerControls = document.querySelector('.header-controls');
                if (headerControls) {
                    headerControls.appendChild(jsonButton);
                }
            }
            
            // Appliquer le mode sombre si configuré
            if (app.config.darkMode) {
                document.body.classList.add('dark-theme');
            }
        }
    }, 1000);
});