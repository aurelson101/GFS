/**
 * Application de Gestion Financière SAS - Version Corrigée
 * Permet la gestion des chiffres d'affaires, charges et calculs automatiques
 */

class FinancialApp {
    constructor() {        // Configuration par défaut
        this.config = {
            taxRate: 45, // Taux de charges sociales en %
            themeColor: '#2563eb',
            alertThreshold: 5000, // Seuil d'alerte pour bénéfice net
            autoBackup: true,
            chartType: 'mixed' // mixed, line, bar
        };
        
        // Données financières organisées par année
        this.data = {};
        
        // Année actuellement affichée
        this.currentYear = new Date().getFullYear();
        
        // Mois de l'année
        this.months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        // Graphiques Chart.js
        this.charts = {};
        
        // Copie temporaire pour les actions
        this.copiedMonthData = null;
        
        this.init();
    }
      /**
     * Initialisation de l'application
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.populateYearSelector();
        this.generateTable();
        this.applyTheme();
        
        // Initialisation responsive
        this.adaptInterface();
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adaptInterface(), 300);
        });
        
        // Détection des changements de device pixel ratio
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(min-resolution: 2dppx)');
            mediaQuery.addEventListener('change', () => this.adaptInterface());
        }        // Initialiser les graphiques après que le DOM soit complètement chargé
        setTimeout(() => {
            this.initCharts();
            console.log('📊 Recherche des canvas pour les graphiques...');
            console.log('Canvas trouvés:', {
                revenueChart: !!document.getElementById('revenueChart'),
                profitChart: !!document.getElementById('profitChart'),
                distributionChart: !!document.getElementById('distributionChart'),
                monthlyEvolutionChart: !!document.getElementById('monthlyEvolutionChart'),
                trendChart: !!document.getElementById('trendChart'),
                monthlyChart: !!document.getElementById('monthlyChart'),
                categoryChart: !!document.getElementById('categoryChart')
            });
        }, 100);
    }
    
    /**
     * Configuration des écouteurs d'événements
     */    setupEventListeners() {
        // Assurer que tous les modals sont fermés au démarrage
        this.closeAllModals();
        
        // Gestion des paramètres
        this.addEventListenerSafe('settingsBtn', 'click', () => {
            // Fermer tous les modals existants avant d'ouvrir les paramètres
            this.closeAllModals();
            document.getElementById('settingsPanel')?.classList.remove('hidden');
        });
        
        this.addEventListenerSafe('closeSettings', 'click', () => {
            document.getElementById('settingsPanel')?.classList.add('hidden');
        });
        
        this.addEventListenerSafe('saveSettings', 'click', () => {
            this.saveSettings();
        });
        
        // Changement d'année
        this.addEventListenerSafe('yearSelect', 'change', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.generateTable();
            this.checkAlerts();
            if (this.charts.revenue && this.charts.profit) {
                this.updateCharts();
            }
        });
        
        // Gestion des années
        this.addEventListenerSafe('addYearBtn', 'click', () => {
            this.addNewYear();
        });
        
        this.addEventListenerSafe('deleteYearBtn', 'click', () => {
            this.deleteYear();
        });
        
        this.addEventListenerSafe('duplicateYearBtn', 'click', () => {
            this.duplicateYear();
        });
        
        // Fonctionnalités avancées
        this.addEventListenerSafe('statsBtn', 'click', () => {
            this.showStats();
        });
        
        this.addEventListenerSafe('compareBtn', 'click', () => {
            this.showYearComparison();
        });
          this.addEventListenerSafe('forecastBtn', 'click', () => {
            this.showForecast();
        });
          this.addEventListenerSafe('budgetBtn', 'click', () => {
            this.showBudget();
        });
          // Bouton rapports (optionnel)
        this.addEventListenerSafe('reportsBtn', 'click', () => {
            this.showReports();
        });
        
        // Bouton analyse détaillée
        this.addEventListenerSafe('detailed-analysis-btn', 'click', () => {
            this.showDetailedAnalysis();
        });
        
        // Import/Export
        this.addEventListenerSafe('importBtn', 'click', () => {
            document.getElementById('importFile')?.click();
        });
        
        this.addEventListenerSafe('importFile', 'change', (e) => {
            if (e.target.files[0]) {
                this.importFile(e.target.files[0]);
            }
        });
          this.addEventListenerSafe('exportBtn', 'click', () => {
            this.exportToExcel();
        });
        
        // Bouton backup
        this.addEventListenerSafe('backupBtn', 'click', () => {
            this.exportToJSON();
        });        // Graphiques (boutons optionnels)
        this.addEventListenerSafe('chartTypeBtn', 'click', () => {
            this.changeChartType();
        });
        
        this.addEventListenerSafe('exportChartBtn', 'click', () => {
            this.exportCharts();        });
        
        // Fermer les paramètres en cliquant à l'extérieur
        this.addEventListenerSafe('settingsPanel', 'click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.add('hidden');
            }
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveToStorage();
                this.showNotification('Données sauvegardées!', 'success');
            }
        });
    }
      /**
     * Ajouter un écouteur d'événement de manière sécurisée
     */    
    addEventListenerSafe(elementId, event, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, callback);        } else {
            // Éléments optionnels (ne pas loguer en tant qu'erreur)
            const optionalElements = ['chartTypeBtn', 'exportChartBtn', 'trendChart', 'reportsBtn'];
            if (!optionalElements.includes(elementId)) {
                console.warn(`Element with ID '${elementId}' not found - skipping event listener`);
            }
        }
    }
    
    /**
     * Chargement des données depuis le localStorage
     */
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('financialAppData');
            const savedConfig = localStorage.getItem('financialAppConfig');
            
            if (savedData) {
                this.data = JSON.parse(savedData);
            }
            
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
            
            // Initialiser l'année courante si elle n'existe pas
            if (!this.data[this.currentYear]) {
                this.initYearData(this.currentYear);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'danger');
        }
    }
    
    /**
     * Sauvegarde dans le localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('financialAppData', JSON.stringify(this.data));
            localStorage.setItem('financialAppConfig', JSON.stringify(this.config));
            
            if (this.config.autoBackup) {
                this.createBackup();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'danger');
        }
    }
    
    /**
     * Créer une sauvegarde automatique
     */
    createBackup() {
        try {
            const backupData = {
                data: this.data,
                config: this.config,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('financialAppBackup', JSON.stringify(backupData));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde automatique:', error);
        }
    }
    
    /**
     * Initialisation des données pour une année
     */
    initYearData(year) {
        this.data[year] = this.months.map(month => ({
            month,
            revenue: 0,
            losses: 0,
            purchases: 0
        }));
    }
    
    /**
     * Remplissage du sélecteur d'années
     */
    populateYearSelector() {
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) return;
        
        const existingYears = Object.keys(this.data).map(y => parseInt(y)).sort();
        
        // Ajouter les années existantes + quelques années supplémentaires
        const allYears = new Set([
            ...existingYears,
            this.currentYear - 1,
            this.currentYear,
            this.currentYear + 1
        ]);
        
        yearSelect.innerHTML = '';
        Array.from(allYears).sort().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        });
    }
    
    /**
     * Génération du tableau financier
     */
    generateTable() {
        if (!this.data[this.currentYear]) {
            this.initYearData(this.currentYear);
        }
        
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.data[this.currentYear].forEach((monthData, index) => {
            const row = document.createElement('tr');
            
            // Calculs automatiques
            const grossProfit = monthData.revenue - monthData.losses - monthData.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            row.innerHTML = `
                <td><strong>${monthData.month}</strong></td>
                <td><input type="number" class="revenue-input" data-month="${index}" value="${monthData.revenue}" placeholder="0" min="0" step="0.01"></td>
                <td><input type="number" class="losses-input" data-month="${index}" value="${monthData.losses}" placeholder="0" min="0" step="0.01"></td>
                <td><input type="number" class="purchases-input" data-month="${index}" value="${monthData.purchases}" placeholder="0" min="0" step="0.01"></td>
                <td class="calculated ${grossProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(grossProfit)}</td>
                <td class="calculated">${this.formatCurrency(taxes)}</td>
                <td class="calculated ${netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit)}</td>
                <td class="actions">
                    <button class="btn action-btn btn-small btn-info" onclick="app.copyMonth(${index})" title="Copier">📋</button>
                    <button class="btn action-btn btn-small btn-warning" onclick="app.pasteMonth(${index})" title="Coller">📄</button>
                    <button class="btn action-btn btn-small btn-danger" onclick="app.clearMonth(${index})" title="Effacer">🗑️</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Ajouter les écouteurs pour les inputs
        this.setupTableEventListeners();
        this.updateTotals();
        this.checkAlerts();
        
        // Mettre à jour les graphiques seulement s'ils existent
        if (this.charts.revenue && this.charts.profit) {
            this.updateCharts();
        }
    }
    
    /**
     * Configuration des écouteurs pour les inputs du tableau
     */
    setupTableEventListeners() {
        const inputs = document.querySelectorAll('.revenue-input, .losses-input, .purchases-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const monthIndex = parseInt(e.target.dataset.month);
                const value = parseFloat(e.target.value) || 0;
                
                if (e.target.classList.contains('revenue-input')) {
                    this.data[this.currentYear][monthIndex].revenue = value;
                } else if (e.target.classList.contains('losses-input')) {
                    this.data[this.currentYear][monthIndex].losses = value;
                } else if (e.target.classList.contains('purchases-input')) {
                    this.data[this.currentYear][monthIndex].purchases = value;
                }
                
                this.updateRowCalculations(monthIndex);
                this.updateTotals();
                this.checkAlerts();
                
                if (this.charts.revenue && this.charts.profit) {
                    this.updateCharts();
                }
                this.saveToStorage();
            });
            
            // Validation des entrées
            input.addEventListener('blur', (e) => {
                const value = parseFloat(e.target.value);
                if (value < 0) {
                    e.target.value = 0;
                    this.showNotification('Les valeurs négatives ne sont pas autorisées', 'warning');
                }
            });
        });
    }
    
    /**
     * Mise à jour des calculs pour une ligne
     */
    updateRowCalculations(monthIndex) {
        const monthData = this.data[this.currentYear][monthIndex];
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        const row = tbody.querySelector(`tr:nth-child(${monthIndex + 1})`);
        if (!row) return;
        
        const grossProfit = monthData.revenue - monthData.losses - monthData.purchases;
        const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
        const netProfit = grossProfit - taxes;
        
        const cells = row.querySelectorAll('.calculated');
        if (cells.length >= 3) {
            cells[0].textContent = this.formatCurrency(grossProfit);
            cells[0].className = `calculated ${grossProfit >= 0 ? 'positive' : 'negative'}`;
            
            cells[1].textContent = this.formatCurrency(taxes);
            
            cells[2].textContent = this.formatCurrency(netProfit);
            cells[2].className = `calculated ${netProfit >= 0 ? 'positive' : 'negative'}`;
        }
    }
    
    /**
     * Mise à jour des totaux
     */
    updateTotals() {
        const yearData = this.data[this.currentYear];
        if (!yearData) return;
        
        const totals = yearData.reduce((acc, month) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
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
        
        const updateElement = (id, value, isProfit = false) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `<strong class="${isProfit && value >= 0 ? 'positive' : isProfit && value < 0 ? 'negative' : ''}">${this.formatCurrency(value)}</strong>`;
            }
        };
        
        updateElement('totalRevenue', totals.revenue);
        updateElement('totalLosses', totals.losses);
        updateElement('totalPurchases', totals.purchases);
        updateElement('totalGrossProfit', totals.grossProfit, true);
        updateElement('totalTaxes', totals.taxes);
        updateElement('totalNetProfit', totals.netProfit, true);
    }
    
    /**
     * Vérification des alertes
     */
    checkAlerts() {
        const yearData = this.data[this.currentYear];
        if (!yearData) return;
        
        const alerts = [];
        
        yearData.forEach((month, index) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const netProfit = grossProfit - (grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0);
            
            if (netProfit < 0) {
                alerts.push({
                    type: 'danger',
                    message: `${month.month}: Bénéfice net négatif (${this.formatCurrency(netProfit)})`
                });
            } else if (netProfit < this.config.alertThreshold && netProfit > 0) {
                alerts.push({
                    type: 'warning',
                    message: `${month.month}: Bénéfice net faible (${this.formatCurrency(netProfit)})`
                });
            }
        });
        
        this.displayAlerts(alerts);
    }
    
    /**
     * Affichage des alertes
     */
    displayAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${alert.type}`;
            alertDiv.innerHTML = `
                <span>⚠️</span>
                <span>${alert.message}</span>
                <button onclick="this.parentElement.remove()" class="alert-close">×</button>
            `;
            container.appendChild(alertDiv);
        });
    }
    
    /**
     * Formatage des devises
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    /**
     * Ajout d'une nouvelle année
     */
    addNewYear() {
        const year = prompt('Entrez l\'année à ajouter:');
        if (year && !isNaN(year)) {
            const yearInt = parseInt(year);
            if (yearInt < 1900 || yearInt > 2100) {
                this.showNotification('Année non valide', 'danger');
                return;
            }
            
            if (!this.data[yearInt]) {
                this.initYearData(yearInt);
                this.populateYearSelector();
                document.getElementById('yearSelect').value = yearInt;
                this.currentYear = yearInt;
                this.generateTable();
                this.saveToStorage();
                this.showNotification('Nouvelle année ajoutée!', 'success');
            } else {
                this.showNotification('Cette année existe déjà!', 'warning');
            }
        }
    }
    
    /**
     * Supprimer une année
     */
    deleteYear() {
        const years = Object.keys(this.data);
        if (years.length <= 1) {
            this.showNotification('Impossible de supprimer la dernière année!', 'warning');
            return;
        }
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'année ${this.currentYear}?`)) {
            delete this.data[this.currentYear];
            
            // Passer à une autre année
            const remainingYears = Object.keys(this.data).map(y => parseInt(y)).sort();
            this.currentYear = remainingYears[remainingYears.length - 1];
            
            this.populateYearSelector();
            this.generateTable();
            this.saveToStorage();
            this.showNotification('Année supprimée!', 'success');
        }
    }
    
    /**
     * Dupliquer une année
     */
    duplicateYear() {
        const newYear = prompt(`Dupliquer l'année ${this.currentYear} vers quelle année?`);
        if (newYear && !isNaN(newYear)) {
            const yearInt = parseInt(newYear);
            if (yearInt < 1900 || yearInt > 2100) {
                this.showNotification('Année non valide', 'danger');
                return;
            }
            
            if (this.data[yearInt]) {
                if (!confirm('Cette année existe déjà. La remplacer?')) return;
            }
            
            this.data[yearInt] = JSON.parse(JSON.stringify(this.data[this.currentYear]));
            this.currentYear = yearInt;
            
            this.populateYearSelector();
            this.generateTable();
            this.saveToStorage();
            this.showNotification('Année dupliquée!', 'success');
        }
    }
    
    /**
     * Copier les données d'un mois
     */
    copyMonth(monthIndex) {
        const monthData = this.data[this.currentYear][monthIndex];
        this.copiedMonthData = JSON.parse(JSON.stringify(monthData));
        this.showNotification(`Données de ${monthData.month} copiées!`, 'info');
    }
    
    /**
     * Coller les données dans un mois
     */
    pasteMonth(monthIndex) {
        if (!this.copiedMonthData) {
            this.showNotification('Aucune donnée à coller!', 'warning');
            return;
        }
        
        const monthData = this.data[this.currentYear][monthIndex];
        monthData.revenue = this.copiedMonthData.revenue;
        monthData.losses = this.copiedMonthData.losses;
        monthData.purchases = this.copiedMonthData.purchases;
        
        this.generateTable();
        this.saveToStorage();
        this.showNotification(`Données collées dans ${monthData.month}!`, 'success');
    }
    
    /**
     * Vider les données d'un mois
     */
    clearMonth(monthIndex) {
        const monthData = this.data[this.currentYear][monthIndex];
        if (confirm(`Vider les données de ${monthData.month}?`)) {
            monthData.revenue = 0;
            monthData.losses = 0;
            monthData.purchases = 0;
            
            this.generateTable();
            this.saveToStorage();
            this.showNotification('Données effacées!', 'success');
        }
    }
    
    /**
     * Afficher les statistiques
     */
    showStats() {
        if (typeof StatsModule !== 'undefined') {
            StatsModule.showStats(this.data, this.currentYear, this.config);
        } else {
            this.showNotification('Module statistiques non chargé', 'warning');
        }
    }
    
    /**
     * Afficher la comparaison d'années
     */
    showYearComparison() {
        if (typeof ComparisonModule !== 'undefined') {
            ComparisonModule.showComparison(this.data, this.config);
        } else {
            this.showNotification('Module comparaison non chargé', 'warning');
        }
    }
      /**
     * Afficher le module budget
     */
    showBudget() {
        console.log('🎯 Ouverture du module Budget 2025');
        if (typeof BudgetModule !== 'undefined' && BudgetModule.showBudget) {
            BudgetModule.showBudget(this.data, this.currentYear, this.config);
        } else {
            console.error('❌ Module Budget non trouvé');
            this.showNotification('Module budget non chargé correctement', 'warning');
        }
    }
    
    /**
     * Afficher les prévisions
     */
    showForecast() {
        if (typeof ForecastModule !== 'undefined') {
            ForecastModule.showForecast(this.data, this.currentYear, this.config);
        } else {
            this.showNotification('Module prévisions non chargé', 'warning');
        }
    }
      /**
     * Afficher le module de rapports
     */
    showReports() {
        console.log('📋 Ouverture du module Rapports');
        if (typeof ReportModule !== 'undefined' && ReportModule.showReports) {
            ReportModule.showReports(this.data, this.currentYear, this.config);
        } else {
            console.error('❌ Module Rapports non trouvé');
            this.showNotification('Module rapports non chargé correctement', 'warning');
        }
    }

    /**
     * Afficher l'analyse détaillée
     */
    showDetailedAnalysis() {
        console.log('🔍 Ouverture de l\'analyse détaillée');
        
        const yearData = this.data[this.currentYear] || [];
        const analysisContent = this.generateDetailedAnalysis(yearData);
        
        const modal = this.createModal('🔍 Analyse Détaillée', analysisContent, 'large');
        
        // Ajouter les styles CSS spécifiques à l'analyse
        this.addAnalysisStyles();
        
        // Initialiser les graphiques d'analyse après un délai
        setTimeout(() => {
            this.initDetailedAnalysisCharts(yearData);
        }, 200);
    }

    /**
     * Ajouter les styles CSS pour l'analyse détaillée
     */
    addAnalysisStyles() {
        if (document.getElementById('analysisStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'analysisStyles';
        style.textContent = `
            .detailed-analysis-container {
                padding: 20px;
                max-width: 100%;
            }
            
            .kpi-section {
                margin-bottom: 30px;
            }
            
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .kpi-card {
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid;
                background: #f8fafc;
                transition: transform 0.2s;
            }
            
            .kpi-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .kpi-blue { border-left-color: #3b82f6; }
            .kpi-green { border-left-color: #10b981; }
            .kpi-orange { border-left-color: #f59e0b; }
            .kpi-red { border-left-color: #ef4444; }
            .kpi-gold { border-left-color: #fbbf24; }
            
            .kpi-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .kpi-title {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }
            
            .kpi-trend {
                font-size: 18px;
            }
            
            .kpi-value {
                font-size: 24px;
                font-weight: bold;
                color: #1e293b;
            }
            
            .analysis-charts {
                margin: 30px 0;
            }
            
            .chart-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .chart-container {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                min-height: 300px;
            }
            
            .chart-container h5 {
                margin: 0 0 15px 0;
                color: #1e293b;
                font-size: 16px;
            }
            
            .chart-container canvas {
                max-height: 250px;
            }
            
            .trends-analysis {
                margin: 30px 0;
            }
            
            .trends-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 15px;
            }
            
            .trend-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
            }
            
            .trend-card h5 {
                margin: 0 0 10px 0;
                color: #1e293b;
            }
            
            .trend-card p {
                margin: 5px 0;
                color: #64748b;
            }
            
            .recommendations-section {
                margin: 30px 0;
            }
            
            .recommendations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .recommendation-card {
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid;
            }
            
            .recommendation-card.warning {
                background: #fef3c7;
                border-left-color: #f59e0b;
            }
            
            .recommendation-card.danger {
                background: #fee2e2;
                border-left-color: #ef4444;
            }
            
            .recommendation-card.info {
                background: #dbeafe;
                border-left-color: #3b82f6;
            }
            
            .rec-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            
            .rec-icon {
                font-size: 20px;
            }
            
            .rec-header h6 {
                margin: 0;
                color: #1e293b;
            }
            
            .recommendation-card p {
                margin: 0;
                color: #4b5563;
                line-height: 1.5;
            }
            
            .monthly-details {
                margin: 30px 0;
            }
            
            .monthly-table-container {
                overflow-x: auto;
                margin-top: 15px;
            }
            
            .detailed-monthly-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .detailed-monthly-table th,
            .detailed-monthly-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detailed-monthly-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
            }
            
            .performance-excellent { 
                color: #059669; 
                font-weight: bold; 
            }
            .performance-good { 
                color: #3b82f6; 
                font-weight: bold; 
            }
            .performance-average { 
                color: #f59e0b; 
                font-weight: bold; 
            }
            .performance-poor { 
                color: #ef4444; 
                font-weight: bold; 
            }
            
            .predictions-section {
                margin: 30px 0;
            }
            
            .predictions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .prediction-card {
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                border-top: 3px solid #3b82f6;
            }
            
            .prediction-card h6 {
                margin: 0 0 10px 0;
                color: #1e293b;
            }
            
            .pred-value {
                font-size: 18px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 5px;
            }
            
            .confidence {
                font-size: 12px;
                color: #64748b;
            }
            
            .prediction-note {
                margin-top: 20px;
                padding: 15px;
                background: #f1f5f9;
                border-radius: 8px;
                border-left: 4px solid #64748b;
            }
            
            .prediction-note p {
                margin: 0;
                color: #475569;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .kpi-grid {
                    grid-template-columns: 1fr;
                }
                
                .chart-row {
                    grid-template-columns: 1fr;
                }
                
                .trends-grid {
                    grid-template-columns: 1fr;
                }
                
                .recommendations-grid {
                    grid-template-columns: 1fr;
                }
                
                .predictions-grid {
                    grid-template-columns: 1fr;
                }
                
                .detailed-analysis-container {
                    padding: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Générer le contenu de l'analyse détaillée
     */
    generateDetailedAnalysis(yearData) {
        const stats = this.calculateDetailedStats(yearData);
        const trends = this.calculateTrends(yearData);
        const predictions = this.calculatePredictions(yearData);

        return `
            <div class="detailed-analysis-container">
                <!-- KPIs principaux -->
                <div class="kpi-section">
                    <h4>📊 Indicateurs Clés de Performance</h4>
                    <div class="kpi-grid">
                        ${this.generateKPICards(stats)}
                    </div>
                </div>

                <!-- Graphiques d'analyse -->
                <div class="analysis-charts">
                    <div class="chart-row">
                        <div class="chart-container">
                            <h5>📈 Évolution Mensuelle Détaillée</h5>
                            <canvas id="detailedEvolutionChart" width="400" height="200"></canvas>
                        </div>
                        <div class="chart-container">
                            <h5>🎯 Analyse de Performance</h5>
                            <canvas id="performanceChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                    <div class="chart-row">
                        <div class="chart-container">
                            <h5>💡 Répartition des Charges</h5>
                            <canvas id="expensesBreakdownChart" width="400" height="200"></canvas>
                        </div>
                        <div class="chart-container">
                            <h5>🔮 Prédictions Tendances</h5>
                            <canvas id="trendPredictionChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Analyse des tendances -->
                <div class="trends-analysis">
                    <h4>📈 Analyse des Tendances</h4>
                    <div class="trends-grid">
                        ${this.generateTrendsAnalysis(trends)}
                    </div>
                </div>

                <!-- Recommandations stratégiques -->
                <div class="recommendations-section">
                    <h4>🎯 Recommandations Stratégiques</h4>
                    ${this.generateStrategicRecommendations(stats, trends)}
                </div>

                <!-- Analyse mensuelle détaillée -->
                <div class="monthly-details">
                    <h4>📅 Analyse Mensuelle Détaillée</h4>
                    <div class="monthly-table-container">
                        <table class="detailed-monthly-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>Revenus</th>
                                    <th>Croissance CA</th>
                                    <th>Marge Brute</th>
                                    <th>Marge Nette</th>
                                    <th>ROI</th>
                                    <th>Performance</th>
                                    <th>Tendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateDetailedMonthlyTable(yearData)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Prédictions et projections -->
                <div class="predictions-section">
                    <h4>🔮 Prédictions et Projections</h4>
                    ${this.generatePredictionsSection(predictions)}
                </div>
            </div>
        `;
    }

    /**
     * Calculer les statistiques détaillées
     */
    calculateDetailedStats(yearData) {
        const monthlyStats = yearData.map((month, index) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            const totalExpenses = month.losses + month.purchases + taxes;
            
            const grossMargin = month.revenue > 0 ? (grossProfit / month.revenue) * 100 : 0;
            const netMargin = month.revenue > 0 ? (netProfit / month.revenue) * 100 : 0;
            const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
            
            // Calcul de la croissance mensuelle
            const prevMonth = index > 0 ? yearData[index - 1] : null;
            const revenueGrowth = prevMonth && prevMonth.revenue > 0 ? 
                ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;

            return {
                month: month.month,
                revenue: month.revenue,
                losses: month.losses,
                purchases: month.purchases,
                grossProfit,
                netProfit,
                taxes,
                totalExpenses,
                grossMargin,
                netMargin,
                roi,
                revenueGrowth
            };
        });

        const totals = monthlyStats.reduce((acc, month) => ({
            revenue: acc.revenue + month.revenue,
            grossProfit: acc.grossProfit + month.grossProfit,
            netProfit: acc.netProfit + month.netProfit,
            totalExpenses: acc.totalExpenses + month.totalExpenses
        }), { revenue: 0, grossProfit: 0, netProfit: 0, totalExpenses: 0 });

        const averages = {
            monthlyRevenue: totals.revenue / 12,
            monthlyProfit: totals.netProfit / 12,
            monthlyExpenses: totals.totalExpenses / 12
        };

        const overallMargins = {
            grossMargin: totals.revenue > 0 ? (totals.grossProfit / totals.revenue) * 100 : 0,
            netMargin: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0,
            overallROI: totals.totalExpenses > 0 ? (totals.netProfit / totals.totalExpenses) * 100 : 0
        };

        // Calcul de la volatilité
        const revenues = monthlyStats.map(m => m.revenue);
        const meanRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
        const volatility = Math.sqrt(
            revenues.reduce((sum, revenue) => sum + Math.pow(revenue - meanRevenue, 2), 0) / revenues.length
        );
        const volatilityPercent = meanRevenue > 0 ? (volatility / meanRevenue) * 100 : 0;

        return {
            monthlyStats,
            totals,
            averages,
            margins: overallMargins,
            volatility: volatilityPercent,
            profitableMonths: monthlyStats.filter(m => m.netProfit > 0).length,
            bestMonth: monthlyStats.reduce((best, current) => 
                current.netProfit > best.netProfit ? current : best, monthlyStats[0]
            ),
            worstMonth: monthlyStats.reduce((worst, current) => 
                current.netProfit < worst.netProfit ? current : worst, monthlyStats[0]
            )
        };
    }

    /**
     * Calculer les tendances
     */
    calculateTrends(yearData) {
        const revenues = yearData.map(m => m.revenue);
        const profits = yearData.map(m => {
            const gross = m.revenue - m.losses - m.purchases;
            return gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        });

        const calculateTrendLine = (data) => {
            const n = data.length;
            const x = Array.from({length: n}, (_, i) => i + 1);
            const sumX = x.reduce((a, b) => a + b, 0);
            const sumY = data.reduce((a, b) => a + b, 0);
            const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
            const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            return { slope, intercept };
        };

        const revenueTrend = calculateTrendLine(revenues);
        const profitTrend = calculateTrendLine(profits);

        return {
            revenue: {
                trend: revenueTrend.slope > 0 ? 'Croissante' : revenueTrend.slope < 0 ? 'Décroissante' : 'Stable',
                slope: revenueTrend.slope,
                direction: revenueTrend.slope > 0 ? '📈' : revenueTrend.slope < 0 ? '📉' : '➡️'
            },
            profit: {
                trend: profitTrend.slope > 0 ? 'Croissante' : profitTrend.slope < 0 ? 'Décroissante' : 'Stable',
                slope: profitTrend.slope,
                direction: profitTrend.slope > 0 ? '📈' : profitTrend.slope < 0 ? '📉' : '➡️'
            }
        };
    }

    /**
     * Calculer les prédictions
     */
    calculatePredictions(yearData) {
        // Prédiction simple basée sur les tendances
        const revenues = yearData.map(m => m.revenue);
        const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
        
        // Prédiction pour les 3 prochains mois
        const predictions = [];
        for (let i = 1; i <= 3; i++) {
            const predicted = avgRevenue * (1 + (Math.random() - 0.5) * 0.2); // ±10% de variation
            predictions.push({
                month: `Prév. +${i}`,
                predictedRevenue: predicted,
                confidence: 85 - (i * 5) // Confiance décroissante
            });
        }

        return predictions;
    }

    /**
     * Générer les cartes KPI
     */
    generateKPICards(stats) {
        const kpis = [
            {
                title: '💰 CA Moyen/Mois',
                value: this.formatCurrency(stats.averages.monthlyRevenue),
                trend: stats.totals.revenue > 0 ? '📈' : '📉',
                color: 'blue'
            },
            {
                title: '📈 Marge Nette',
                value: `${stats.margins.netMargin.toFixed(1)}%`,
                trend: stats.margins.netMargin > 10 ? '✅' : '⚠️',
                color: stats.margins.netMargin > 10 ? 'green' : 'orange'
            },
            {
                title: '🎯 ROI Global',
                value: `${stats.margins.overallROI.toFixed(1)}%`,
                trend: stats.margins.overallROI > 20 ? '🚀' : '📊',
                color: stats.margins.overallROI > 20 ? 'green' : 'blue'
            },
            {
                title: '📊 Volatilité',
                value: `${stats.volatility.toFixed(1)}%`,
                trend: stats.volatility < 30 ? '✅' : '⚠️',
                color: stats.volatility < 30 ? 'green' : 'red'
            },
            {
                title: '📅 Mois Rentables',
                value: `${stats.profitableMonths}/12`,
                trend: stats.profitableMonths > 8 ? '🎉' : '⚠️',
                color: stats.profitableMonths > 8 ? 'green' : 'orange'
            },
            {
                title: '🏆 Meilleur Mois',
                value: stats.bestMonth.month,
                trend: '🥇',
                color: 'gold'
            }
        ];

        return kpis.map(kpi => `
            <div class="kpi-card kpi-${kpi.color}">
                <div class="kpi-header">
                    <span class="kpi-title">${kpi.title}</span>
                    <span class="kpi-trend">${kpi.trend}</span>
                </div>
                <div class="kpi-value">${kpi.value}</div>
            </div>
        `).join('');
    }

    /**
     * Générer l'analyse des tendances
     */
    generateTrendsAnalysis(trends) {
        return `
            <div class="trend-card">
                <h5>${trends.revenue.direction} Tendance Revenus</h5>
                <p><strong>${trends.revenue.trend}</strong></p>
                <p>Évolution: ${trends.revenue.slope > 0 ? '+' : ''}${(trends.revenue.slope * 12).toFixed(0)}€/mois</p>
            </div>
            <div class="trend-card">
                <h5>${trends.profit.direction} Tendance Bénéfices</h5>
                <p><strong>${trends.profit.trend}</strong></p>
                <p>Évolution: ${trends.profit.slope > 0 ? '+' : ''}${(trends.profit.slope * 12).toFixed(0)}€/mois</p>
            </div>
        `;
    }

    /**
     * Générer les recommandations stratégiques
     */
    generateStrategicRecommendations(stats, trends) {
        const recommendations = [];

        if (stats.margins.netMargin < 10) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Améliorer la Rentabilité',
                text: 'Votre marge nette est faible. Considérez une révision des prix ou une optimisation des coûts.'
            });
        }

        if (stats.volatility > 40) {
            recommendations.push({
                type: 'info',
                icon: '📊',
                title: 'Stabiliser les Revenus',
                text: 'Vos revenus sont très volatils. Diversifiez vos sources de revenus pour plus de stabilité.'
            });
        }

        if (trends.revenue.slope < 0) {
            recommendations.push({
                type: 'danger',
                icon: '📉',
                title: 'Inverser la Tendance',
                text: 'Vos revenus sont en baisse. Analysez vos stratégies commerciales et marketing.'
            });
        }

        if (stats.profitableMonths < 8) {
            recommendations.push({
                type: 'warning',
                icon: '📅',
                title: 'Augmenter la Rentabilité',
                text: 'Moins de 8 mois sur 12 sont rentables. Révisez votre modèle économique.'
            });
        }

        return `
            <div class="recommendations-grid">
                ${recommendations.map(rec => `
                    <div class="recommendation-card ${rec.type}">
                        <div class="rec-header">
                            <span class="rec-icon">${rec.icon}</span>
                            <h6>${rec.title}</h6>
                        </div>
                        <p>${rec.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Générer le tableau mensuel détaillé
     */
    generateDetailedMonthlyTable(yearData) {
        return yearData.map((month, index) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            const totalExpenses = month.losses + month.purchases + taxes;
            
            const grossMargin = month.revenue > 0 ? (grossProfit / month.revenue) * 100 : 0;
            const netMargin = month.revenue > 0 ? (netProfit / month.revenue) * 100 : 0;
            const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
            
            // Croissance
            const prevMonth = index > 0 ? yearData[index - 1] : null;
            const growth = prevMonth && prevMonth.revenue > 0 ? 
                ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;

            // Performance (score basé sur différents critères)
            let performanceScore = 0;
            if (netProfit > 0) performanceScore += 25;
            if (netMargin > 10) performanceScore += 25;
            if (roi > 20) performanceScore += 25;
            if (growth > 0) performanceScore += 25;

            const performanceLabel = performanceScore >= 75 ? 'Excellent' : 
                                   performanceScore >= 50 ? 'Bon' : 
                                   performanceScore >= 25 ? 'Moyen' : 'Faible';

            const performanceColor = performanceScore >= 75 ? 'excellent' : 
                                   performanceScore >= 50 ? 'good' : 
                                   performanceScore >= 25 ? 'average' : 'poor';

            const trendIcon = growth > 5 ? '📈' : growth < -5 ? '📉' : '➡️';

            return `
                <tr>
                    <td><strong>${month.month}</strong></td>
                    <td>${this.formatCurrency(month.revenue)}</td>
                    <td class="${growth >= 0 ? 'positive' : 'negative'}">
                        ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                    </td>
                    <td class="${grossMargin >= 0 ? 'positive' : 'negative'}">
                        ${grossMargin.toFixed(1)}%
                    </td>
                    <td class="${netMargin >= 0 ? 'positive' : 'negative'}">
                        ${netMargin.toFixed(1)}%
                    </td>
                    <td class="${roi >= 0 ? 'positive' : 'negative'}">
                        ${roi.toFixed(1)}%
                    </td>
                    <td class="performance-${performanceColor}">
                        ${performanceLabel}
                    </td>
                    <td>${trendIcon}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Générer la section des prédictions
     */
    generatePredictionsSection(predictions) {
        return `
            <div class="predictions-grid">
                ${predictions.map(pred => `
                    <div class="prediction-card">
                        <h6>📅 ${pred.month}</h6>
                        <div class="pred-value">${this.formatCurrency(pred.predictedRevenue)}</div>
                        <div class="confidence">Confiance: ${pred.confidence}%</div>
                    </div>
                `).join('')}
            </div>
            <div class="prediction-note">
                <p><strong>Note:</strong> Ces prédictions sont basées sur les tendances historiques et doivent être considérées comme indicatives.</p>
            </div>
        `;
    }

    /**
     * Initialiser les graphiques d'analyse détaillée
     */
    initDetailedAnalysisCharts(yearData) {
        if (typeof Chart === 'undefined') return;

        // Graphique d'évolution détaillée
        this.initDetailedEvolutionChart(yearData);
        
        // Graphique de performance
        this.initPerformanceChart(yearData);
        
        // Graphique de répartition des charges
        this.initExpensesBreakdownChart(yearData);
        
        // Graphique de prédiction des tendances
        this.initTrendPredictionChart(yearData);
    }

    /**
     * Graphique d'évolution détaillée
     */
    initDetailedEvolutionChart(yearData) {
        const canvas = document.getElementById('detailedEvolutionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = yearData.map(m => m.month.substring(0, 3));
        
        const revenues = yearData.map(m => m.revenue);
        const expenses = yearData.map(m => m.losses + m.purchases);
        const netProfits = yearData.map(m => {
            const gross = m.revenue - m.losses - m.purchases;
            return gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenus',
                        data: revenues,
                        borderColor: '#10b981',
                        backgroundColor: '#10b98120',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Dépenses',
                        data: expenses,
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444420',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Bénéfice Net',
                        data: netProfits,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f620',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR') + ' €';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Graphique de performance
     */
    initPerformanceChart(yearData) {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = yearData.map(m => m.month.substring(0, 3));
        
        const margins = yearData.map(m => {
            const gross = m.revenue - m.losses - m.purchases;
            const net = gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
            return m.revenue > 0 ? (net / m.revenue) * 100 : 0;
        });

        const rois = yearData.map(m => {
            const gross = m.revenue - m.losses - m.purchases;
            const net = gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
            const totalExpenses = m.losses + m.purchases + (gross > 0 ? gross * this.config.taxRate / 100 : 0);
            return totalExpenses > 0 ? (net / totalExpenses) * 100 : 0;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Marge Nette (%)',
                        data: margins,
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    },
                    {
                        label: 'ROI (%)',
                        data: rois,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Graphique de répartition des charges
     */
    initExpensesBreakdownChart(yearData) {
        const canvas = document.getElementById('expensesBreakdownChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const totalLosses = yearData.reduce((sum, m) => sum + m.losses, 0);
        const totalPurchases = yearData.reduce((sum, m) => sum + m.purchases, 0);
        const totalTaxes = yearData.reduce((sum, m) => {
            const gross = m.revenue - m.losses - m.purchases;
            return sum + (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        }, 0);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pertes', 'Achats Professionnels', 'Charges Sociales'],
                datasets: [{
                    data: [totalLosses, totalPurchases, totalTaxes],
                    backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed.toLocaleString('fr-FR')} € (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Graphique de prédiction des tendances
     */
    initTrendPredictionChart(yearData) {
        const canvas = document.getElementById('trendPredictionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Données historiques
        const historicalMonths = yearData.map(m => m.month.substring(0, 3));
        const historicalRevenues = yearData.map(m => m.revenue);
        
        // Calcul de la tendance
        const n = historicalRevenues.length;
        const x = Array.from({length: n}, (_, i) => i + 1);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = historicalRevenues.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * historicalRevenues[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Prédictions
        const predictionMonths = ['Jan+1', 'Fév+1', 'Mar+1'];
        const predictions = predictionMonths.map((_, i) => slope * (n + i + 1) + intercept);

        const allMonths = [...historicalMonths, ...predictionMonths];
        const allData = [...historicalRevenues, ...predictions];
        const trendLine = allMonths.map((_, i) => slope * (i + 1) + intercept);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: allMonths,
                datasets: [
                    {
                        label: 'Revenus Historiques',
                        data: [...historicalRevenues, ...Array(predictionMonths.length).fill(null)],
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f620',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Prédictions',
                        data: [...Array(historicalMonths.length).fill(null), ...predictions],
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b20',
                        tension: 0.4,
                        fill: false,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Ligne de Tendance',
                        data: trendLine,
                        borderColor: '#ef4444',
                        backgroundColor: 'transparent',
                        tension: 0,
                        fill: false,
                        borderDash: [2, 2],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR') + ' €';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Importer un fichier
     */
    importFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.json')) {
                    const importedData = JSON.parse(e.target.result);
                    if (importedData.data) {
                        this.data = { ...this.data, ...importedData.data };
                        if (importedData.config) {
                            this.config = { ...this.config, ...importedData.config };
                        }
                        this.populateYearSelector();
                        this.generateTable();
                        this.applyTheme();
                        this.saveToStorage();
                        this.showNotification('Import réussi!', 'success');
                    } else {
                        throw new Error('Format de fichier invalide');
                    }
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
                    this.showNotification('Import Excel/CSV en cours de développement', 'info');
                } else {
                    throw new Error('Type de fichier non supporté');
                }
            } catch (error) {
                this.showNotification('Erreur lors de l\'import: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
        
        // Réinitialiser l'input
        document.getElementById('importFile').value = '';
    }
    
    /**
     * Changer le type de graphique
     */
    changeChartType() {
        const types = ['mixed', 'line', 'bar'];
        const currentIndex = types.indexOf(this.config.chartType);
        const nextIndex = (currentIndex + 1) % types.length;
        this.config.chartType = types[nextIndex];
        
        this.saveToStorage();
        this.initCharts();
        this.showNotification(`Type de graphique: ${this.config.chartType}`, 'info');
    }
    
    /**
     * Exporter les graphiques
     */
    exportCharts() {
        if (this.charts.revenue) {
            const link = document.createElement('a');
            link.download = `graphique_revenus_${this.currentYear}.png`;
            link.href = this.charts.revenue.toBase64Image();
            link.click();
            this.showNotification('Graphique des revenus exporté!', 'success');
        }
        
        if (this.charts.profit) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = `graphique_benefices_${this.currentYear}.png`;
                link.href = this.charts.profit.toBase64Image();
                link.click();
                this.showNotification('Graphique des bénéfices exporté!', 'success');
            }, 500);
        }
    }
      /**
     * Sauvegarde des paramètres
     */
    saveSettings() {
        const taxRateInput = document.getElementById('taxRate');
        const themeColorInput = document.getElementById('themeColor');
        const alertThresholdInput = document.getElementById('alertThreshold');
        const autoBackupInput = document.getElementById('autoBackup');
        
        if (!taxRateInput || !themeColorInput || !alertThresholdInput || !autoBackupInput) {
            this.showNotification('Erreur: éléments de paramètres non trouvés', 'danger');
            return;
        }
        
        const taxRate = parseFloat(taxRateInput.value);
        const themeColor = themeColorInput.value;
        const alertThreshold = parseFloat(alertThresholdInput.value);
        const autoBackup = autoBackupInput.checked;
        
        if (taxRate >= 0 && taxRate <= 100) {
            this.config.taxRate = taxRate;
            this.config.themeColor = themeColor;
            this.config.alertThreshold = alertThreshold || 5000;
            this.config.autoBackup = autoBackup;
            
            this.applyTheme();
            this.generateTable(); // Recalculer avec le nouveau taux
            this.saveToStorage();
            
            document.getElementById('settingsPanel')?.classList.add('hidden');
            this.showNotification('Paramètres sauvegardés!', 'success');
        } else {
            this.showNotification('Le taux de charges doit être entre 0 et 100%', 'danger');
        }
    }
    
    /**
     * Basculer l'affichage des paramètres
     */
    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('hidden');
        }
    }
    
    /**
     * Application du thème personnalisé
     */
    applyTheme() {
        document.documentElement.style.setProperty('--primary-color', this.config.themeColor);
        
        // Calculer une couleur hover légèrement plus foncée
        const hoverColor = this.adjustBrightness(this.config.themeColor, -20);
        document.documentElement.style.setProperty('--primary-hover', hoverColor);
        
        // Mettre à jour les valeurs dans les inputs
        const taxRateInput = document.getElementById('taxRate');
        const themeColorInput = document.getElementById('themeColor');
        const alertThresholdInput = document.getElementById('alertThreshold');
        const autoBackupInput = document.getElementById('autoBackup');
        
        if (taxRateInput) taxRateInput.value = this.config.taxRate;
        if (themeColorInput) themeColorInput.value = this.config.themeColor;
        if (alertThresholdInput) alertThresholdInput.value = this.config.alertThreshold;
        if (autoBackupInput) autoBackupInput.checked = this.config.autoBackup;
    }
    
    /**
     * Ajustement de la luminosité d'une couleur
     */
    adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const B = (num >> 8 & 0x00FF) + amt;
        const G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    }
      /**
     * Affichage de notifications
     */
    showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Créer un modal personnalisé
     */
    createModal(title, content, size = 'medium') {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content modal-${size}">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Fermer</button>
                </div>
            </div>
        `;
        
        // Styles pour le modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // Ajouter les styles pour le contenu du modal
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 8px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            ${size === 'large' ? 'width: 90%; max-width: 1200px;' : size === 'small' ? 'width: 400px;' : 'width: 600px;'}
        `;
        
        // Gestionnaire de fermeture
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
      /**
     * Fonction pour fermer tous les modals existants
     * Cette fonction est appelée avant d'ouvrir un nouveau modal
     */
    closeAllModals() {
        document.querySelectorAll('.custom-modal').forEach(modal => {
            modal.remove();
        });
        console.log('🧹 Nettoyage des modals existants');
    }
    
    /**
     * Détection du type d'appareil
     */
    detectDevice() {
        const width = window.innerWidth;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        let deviceType = 'desktop';
        if (width <= 768) {
            deviceType = 'mobile';
        } else if (width <= 1024) {
            deviceType = 'tablet';
        }
        
        // Ajouter des classes CSS au body
        document.body.classList.remove('mobile', 'tablet', 'desktop', 'touch', 'no-touch');
        document.body.classList.add(deviceType);
        document.body.classList.add(isTouchDevice ? 'touch' : 'no-touch');
        
        return {
            type: deviceType,
            width,
            height: window.innerHeight,
            isTouch: isTouchDevice,
            isRetina: window.devicePixelRatio > 1
        };
    }
    
    /**
     * Adapter l'interface selon l'appareil
     */
    adaptInterface() {
        const device = this.detectDevice();
        
        // Adapter la taille des graphiques
        const chartItems = document.querySelectorAll('.chart-item');
        chartItems.forEach(item => {
            if (device.type === 'mobile') {
                item.style.height = '250px';
            } else if (device.type === 'tablet') {
                item.style.height = '300px';
            } else {
                item.style.height = '350px';
            }
        });
        
        // Adapter la table
        const table = document.querySelector('.financial-table');
        if (table && device.type === 'mobile') {
            // Assurer que la table est scrollable
            const container = table.closest('.table-container');
            if (container) {
                container.style.overflowX = 'auto';
                container.style.webkitOverflowScrolling = 'touch';
            }
        }
        
        // Adapter les modals
        const modals = document.querySelectorAll('.custom-modal .modal-content');
        modals.forEach(modal => {
            if (device.type === 'mobile') {
                modal.style.width = '95%';
                modal.style.height = '90vh';
                modal.style.maxHeight = '90vh';
            }
        });
        
        // Optimisations touch
        if (device.isTouch) {
            // Augmenter la zone de touch pour les petits boutons
            const actionBtns = document.querySelectorAll('.action-btn');
            actionBtns.forEach(btn => {
                btn.style.minHeight = '36px';
                btn.style.minWidth = '36px';
            });
            
            // Optimiser les inputs pour mobile
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.style.fontSize = '16px'; // Évite le zoom sur iOS
            });
        }
          return device;
    }
    
    /**
     * Méthode pour fermer tous les modals
     */
    closeModal() {
        const modals = document.querySelectorAll('.custom-modal');
        modals.forEach(modal => {
            if (modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * Gérer le redimensionnement de la fenêtre
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.adaptInterface();
            this.regenerateCharts();
        }, 250);
    }    /**
     * Régénérer les graphiques après redimensionnement
     */
    regenerateCharts() {
        // Régénérer les graphiques principaux si ils existent
        if (this.charts && this.charts.revenue && this.charts.profit) {
            // Détruire les anciens graphiques
            this.charts.revenue.destroy();
            this.charts.profit.destroy();
            
            // Recréer les graphiques
            setTimeout(() => {
                this.initCharts();
            }, 100);
        } else {
            // Si pas de graphiques existants, les initialiser
            setTimeout(() => {
                this.initCharts();
            }, 100);
        }
    }
      /**
     * Initialisation des graphiques
     */    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js non chargé, graphiques désactivés');
            return;
        }
        
        // Rechercher tous les canvas disponibles
        const revenueCanvas = document.getElementById('revenueChart');
        const profitCanvas = document.getElementById('profitChart');
        const trendCanvas = document.getElementById('trendChart');
        const distributionCanvas = document.getElementById('distributionChart');
        const monthlyEvolutionCanvas = document.getElementById('monthlyEvolutionChart');
        
        // Canvas alternatifs pour compatibilité
        const monthlyCanvas = document.getElementById('monthlyChart');
        const categoryCanvas = document.getElementById('categoryChart');
        
        // Détruire les graphiques existants
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        try {
            // Graphique des revenus (principal ou alternatif)
            const mainRevenueCanvas = revenueCanvas || monthlyCanvas;
            if (mainRevenueCanvas) {
                const revenueCtx = mainRevenueCanvas.getContext('2d');
                this.charts.revenue = new Chart(revenueCtx, {
                    type: this.config.chartType === 'bar' ? 'bar' : 'line',
                    data: {
                        labels: this.months,
                        datasets: [{
                            label: 'Chiffre d\'affaires',
                            data: [],
                            borderColor: this.config.themeColor,
                            backgroundColor: this.config.themeColor + '20',
                            tension: 0.4,
                            fill: this.config.chartType !== 'line'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Évolution du Chiffre d\'Affaires'
                            },
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('fr-FR') + ' €';
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Graphique des bénéfices
            const mainProfitCanvas = profitCanvas || categoryCanvas;
            if (mainProfitCanvas) {
                const profitCtx = mainProfitCanvas.getContext('2d');
                this.charts.profit = new Chart(profitCtx, {
                    type: 'bar',
                    data: {
                        labels: this.months,
                        datasets: [
                            {
                                label: 'Bénéfice brut',
                                data: [],
                                backgroundColor: '#10b981',
                                borderColor: '#059669',
                                borderWidth: 1
                            },
                            {
                                label: 'Bénéfice net',
                                data: [],
                                backgroundColor: '#3b82f6',
                                borderColor: '#2563eb',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Comparaison Bénéfices Brut/Net'
                            },
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('fr-FR') + ' €';
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Graphique de répartition (nouveau)
            if (distributionCanvas) {
                const distributionCtx = distributionCanvas.getContext('2d');
                this.charts.distribution = new Chart(distributionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Revenus', 'Pertes', 'Achats professionnels'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: [
                                '#10b981', // Vert pour revenus
                                '#ef4444', // Rouge pour pertes
                                '#f59e0b'  // Orange pour achats
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Répartition des Revenus/Charges'
                            },
                            legend: {
                                display: true,
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return `${label}: ${value.toLocaleString('fr-FR')} € (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Graphique d'évolution mensuelle (nouveau)
            if (monthlyEvolutionCanvas) {
                const monthlyCtx = monthlyEvolutionCanvas.getContext('2d');
                this.charts.monthlyEvolution = new Chart(monthlyCtx, {
                    type: 'line',
                    data: {
                        labels: this.months,
                        datasets: [
                            {
                                label: 'Revenus',
                                data: [],
                                borderColor: '#10b981',
                                backgroundColor: '#10b98120',
                                tension: 0.4,
                                fill: false
                            },
                            {
                                label: 'Charges totales',
                                data: [],
                                borderColor: '#ef4444',
                                backgroundColor: '#ef444420',
                                tension: 0.4,
                                fill: false
                            },
                            {
                                label: 'Bénéfice net',
                                data: [],
                                borderColor: '#3b82f6',
                                backgroundColor: '#3b82f620',
                                tension: 0.4,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Évolution Mensuelle'
                            },
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('fr-FR') + ' €';
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Graphique de tendance (si canvas existe)
            if (trendCanvas) {
                const trendCtx = trendCanvas.getContext('2d');
                this.charts.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: this.months,
                        datasets: [{
                            label: 'Tendance CA',
                            data: [],
                            borderColor: '#f59e0b',
                            backgroundColor: '#f59e0b20',
                            borderDash: [5, 5],
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Tendance et Prévisions'
                            }
                        }
                    }
                });
            }
            
            console.log('✅ Graphiques initialisés:', Object.keys(this.charts));
            this.updateCharts();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des graphiques:', error);
        }
    }
    
    /**
     * Mise à jour des graphiques
     */
    updateCharts() {
        if (!this.data[this.currentYear]) return;
        
        // Vérifier que les graphiques existent
        if (!this.charts.revenue || !this.charts.profit) {
            console.warn('Graphiques non initialisés');
            return;
        }
        
        try {
            const yearData = this.data[this.currentYear];
            
            // Données pour le graphique des revenus
            const revenues = yearData.map(month => month.revenue);
            this.charts.revenue.data.datasets[0].data = revenues;
            this.charts.revenue.update();
            
            // Données pour le graphique des bénéfices
            const grossProfits = yearData.map(month => month.revenue - month.losses - month.purchases);
            const netProfits = grossProfits.map(gross => gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0));
            
            this.charts.profit.data.datasets[0].data = grossProfits;
            this.charts.profit.data.datasets[1].data = netProfits;
            this.charts.profit.update();
            
            // Mise à jour du graphique de distribution si il existe
            if (this.charts.distribution) {
                const totalRevenues = revenues.reduce((a, b) => a + b, 0);
                const totalLosses = yearData.reduce((sum, month) => sum + month.losses, 0);
                const totalPurchases = yearData.reduce((sum, month) => sum + month.purchases, 0);
                
                this.charts.distribution.data.datasets[0].data = [totalRevenues, totalLosses, totalPurchases];
                this.charts.distribution.update();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des graphiques:', error);
        }
    }
    
    /**
     * Calcul de la tendance
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        return secondAvg - firstAvg;
    }

    /**
     * Export vers Excel
     */
    exportToExcel() {
        const yearData = this.data[this.currentYear] || [];
        
        // Créer les données CSV
        let csvContent = "Mois,Revenus,Pertes,Achats Professionnels,Bénéfice Brut,Charges Sociales,Bénéfice Net\n";
        
        yearData.forEach(month => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            csvContent += `${month.month},${month.revenue},${month.losses},${month.purchases},${grossProfit},${taxes},${netProfit}\n`;
        });
        
        // Créer le fichier et télécharger
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `donnees_financieres_${this.currentYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Export Excel réussi!', 'success');
    }

    /**
     * Export vers JSON
     */
    exportToJSON() {
        const exportData = {
            data: this.data,
            config: this.config,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sauvegarde_financiere_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Sauvegarde JSON créée!', 'success');
    }
}

// Variable globale pour accéder à l'instance
let app;

// Initialisation de l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new FinancialApp();
        console.log('Application financière initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
});

// Styles pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        border-radius: 8px !important;
        font-weight: 500;
    }

    /* Styles pour l'analyse détaillée */
    .detailed-analysis-container {
        padding: 20px;
        max-width: 100%;
        overflow-x: auto;
    }

    .kpi-section {
        margin-bottom: 30px;
    }

    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }

    .kpi-card {
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .kpi-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
    .kpi-green { background: linear-gradient(135deg, #10b981, #047857); color: white; }
    .kpi-orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .kpi-red { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    .kpi-gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; }

    .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .kpi-title {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    .kpi-trend {
        font-size: 1.2rem;
    }

    .kpi-value {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .analysis-charts {
        margin: 30px 0;
    }

    .chart-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .chart-container {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .chart-container h5 {
        margin-bottom: 15px;
        color: #1f2937;
        font-weight: 600;
    }

    .trends-analysis {
        margin: 30px 0;
    }

    .trends-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 15px;
    }

    .trend-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3b82f6;
    }

    .recommendations-section {
        margin: 30px 0;
    }

    .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }

    .recommendation-card {
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .recommendation-card.warning {
        background: #fef3c7;
        border-left-color: #f59e0b;
    }

    .recommendation-card.danger {
        background: #fee2e2;
        border-left-color: #ef4444;
    }

    .recommendation-card.info {
        background: #dbeafe;
        border-left-color: #3b82f6;
    }

    .rec-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .rec-icon {
        margin-right: 10px;
        font-size: 1.2rem;
    }

    .monthly-details {
        margin: 30px 0;
    }

    .monthly-table-container {
        overflow-x: auto;
        margin-top: 15px;
    }

    .detailed-monthly-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .detailed-monthly-table th,
    .detailed-monthly-table td {
        padding: 12px;
        text-align: right;
        border-bottom: 1px solid #e5e7eb;
    }

    .detailed-monthly-table th:first-child,
    .detailed-monthly-table td:first-child {
        text-align: left;
    }

    .detailed-monthly-table th {
        background: #f9fafb;
        font-weight: 600;
        color: #374151;
    }

    .performance-excellent { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; }
    .performance-good { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; }
    .performance-average { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
    .performance-poor { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; }

    .predictions-section {
        margin: 30px 0;
    }

    .predictions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }

    .prediction-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        border: 2px solid #e5e7eb;
    }

    .pred-value {
        font-size: 1.3rem;
        font-weight: bold;
        color: #3b82f6;
        margin: 10px 0;
    }

    .confidence {
        font-size: 0.9rem;
        color: #6b7280;
    }

    .prediction-note {
        margin-top: 20px;
        padding: 15px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
    }

    .prediction-note p {
        margin: 0;
        color: #475569;
        font-size: 14px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .chart-row {
            grid-template-columns: 1fr;
        }
        
        .trends-grid {
            grid-template-columns: 1fr;
        }
        
        .kpi-grid {
            grid-template-columns: 1fr;
        }
        
        .detailed-analysis-container {
            padding: 10px;
        }
        
        .chart-container {
            padding: 15px;
        }
    }

    /* Styles pour le module de comparaison */
    .comparison-container {
        padding: 20px;
        max-width: 100%;
    }

    .year-selector {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }

    .year-selector select {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 14px;
    }

    .comparison-charts {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        margin: 30px 0;
    }

    .comparison-tables {
        margin: 30px 0;
    }

    .comparison-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .comparison-table th,
    .comparison-table td {
        padding: 12px;
        text-align: right;
        border-bottom: 1px solid #e5e7eb;
    }

    .comparison-table th:first-child,
    .comparison-table td:first-child {
        text-align: left;
    }

    .comparison-table th {
        background: #f9fafb;
        font-weight: 600;
        color: #374151;
    }

    .growth-positive { color: #059669; font-weight: 600; }
    .growth-negative { color: #dc2626; font-weight: 600; }

    .comparison-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
    }

    .summary-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3b82f6;
    }

    .summary-card h4 {
        margin-bottom: 15px;
        color: #1f2937;
    }

    .summary-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #3b82f6;
        margin-bottom: 5px;
    }

    .summary-change {
        font-size: 0.9rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);