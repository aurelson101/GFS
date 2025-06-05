/**
 * Fonctionnalités Avancées pour l'Application Financière
 * Module d'extension avec de nouvelles capacités
 */

// Extension des fonctionnalités de base
if (typeof FinancialApp !== 'undefined') {
    
    /**
     * Système de templates et modèles prédéfinis
     */
    FinancialApp.prototype.templates = {
        startup: {
            name: "Entreprise en démarrage",
            data: [
                { month: "Janvier", revenue: 5000, losses: 2000, purchases: 1500 },
                { month: "Février", revenue: 7500, losses: 2500, purchases: 2000 },
                { month: "Mars", revenue: 10000, losses: 3000, purchases: 2500 },
                { month: "Avril", revenue: 12500, losses: 3500, purchases: 3000 },
                { month: "Mai", revenue: 15000, losses: 4000, purchases: 3500 },
                { month: "Juin", revenue: 17500, losses: 4500, purchases: 4000 }
            ]
        },
        seasonal: {
            name: "Activité saisonnière",
            data: [
                { month: "Janvier", revenue: 3000, losses: 1000, purchases: 800 },
                { month: "Février", revenue: 3500, losses: 1200, purchases: 900 },
                { month: "Mars", revenue: 5000, losses: 1500, purchases: 1200 },
                { month: "Avril", revenue: 8000, losses: 2000, purchases: 1800 },
                { month: "Mai", revenue: 12000, losses: 3000, purchases: 2500 },
                { month: "Juin", revenue: 18000, losses: 4000, purchases: 3500 }
            ]
        },
        stable: {
            name: "Entreprise stable",
            data: [
                { month: "Janvier", revenue: 25000, losses: 5000, purchases: 8000 },
                { month: "Février", revenue: 24000, losses: 4800, purchases: 7500 },
                { month: "Mars", revenue: 26000, losses: 5200, purchases: 8200 },
                { month: "Avril", revenue: 25500, losses: 5100, purchases: 8000 },
                { month: "Mai", revenue: 27000, losses: 5400, purchases: 8500 },
                { month: "Juin", revenue: 26500, losses: 5300, purchases: 8300 }
            ]
        }
    };
    
    /**
     * Appliquer un template
     */
    FinancialApp.prototype.applyTemplate = function(templateName) {
        if (!this.templates[templateName]) {
            this.showNotification('Template non trouvé', 'danger');
            return;
        }
        
        const template = this.templates[templateName];
        if (confirm(`Appliquer le template "${template.name}" ? Cela remplacera les données existantes.`)) {
            // Créer les données pour toute l'année
            this.data[this.currentYear] = this.months.map((month, index) => {
                const templateData = template.data[index] || { revenue: 0, losses: 0, purchases: 0 };
                return {
                    month: month,
                    revenue: templateData.revenue || 0,
                    losses: templateData.losses || 0,
                    purchases: templateData.purchases || 0
                };
            });
            
            this.generateTable();
            this.saveToStorage();
            this.showNotification(`Template "${template.name}" appliqué`, 'success');
        }
    };
    
    /**
     * Système de budgets et objectifs
     */
    FinancialApp.prototype.setBudgetGoals = function() {
        const modal = this.createModal('Budget et Objectifs', `
            <div class="budget-form">
                <div class="form-group">
                    <label>Objectif CA annuel (€):</label>
                    <input type="number" id="revenueGoal" value="${this.config.revenueGoal || 0}" min="0" step="1000">
                </div>
                <div class="form-group">
                    <label>Budget pertes max (€):</label>
                    <input type="number" id="lossesGoal" value="${this.config.lossesGoal || 0}" min="0" step="1000">
                </div>
                <div class="form-group">
                    <label>Budget achats max (€):</label>
                    <input type="number" id="purchasesGoal" value="${this.config.purchasesGoal || 0}" min="0" step="1000">
                </div>
                <div class="form-group">
                    <label>Objectif bénéfice net (€):</label>
                    <input type="number" id="profitGoal" value="${this.config.profitGoal || 0}" min="0" step="1000">
                </div>
                <div class="form-actions">
                    <button onclick="app.saveBudgetGoals()" class="btn btn-primary">💾 Sauvegarder</button>
                    <button onclick="app.closeModal()" class="btn btn-secondary">❌ Annuler</button>
                </div>
            </div>
        `);
    };
    
    /**
     * Sauvegarder les objectifs budgétaires
     */
    FinancialApp.prototype.saveBudgetGoals = function() {
        this.config.revenueGoal = parseFloat(document.getElementById('revenueGoal').value) || 0;
        this.config.lossesGoal = parseFloat(document.getElementById('lossesGoal').value) || 0;
        this.config.purchasesGoal = parseFloat(document.getElementById('purchasesGoal').value) || 0;
        this.config.profitGoal = parseFloat(document.getElementById('profitGoal').value) || 0;
        
        this.saveToStorage();
        this.closeModal();
        this.updateBudgetProgress();
        this.showNotification('Objectifs sauvegardés', 'success');
    };
    
    /**
     * Mise à jour du progrès budgétaire
     */
    FinancialApp.prototype.updateBudgetProgress = function() {
        if (!this.config.revenueGoal && !this.config.profitGoal) return;
        
        const yearData = this.data[this.currentYear];
        const totals = yearData.reduce((acc, month) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const netProfit = grossProfit - (grossProfit > 0 ? grossProfit * this.config.taxRate / 100 : 0);
            
            return {
                revenue: acc.revenue + month.revenue,
                losses: acc.losses + month.losses,
                purchases: acc.purchases + month.purchases,
                netProfit: acc.netProfit + netProfit
            };
        }, { revenue: 0, losses: 0, purchases: 0, netProfit: 0 });
        
        // Créer ou mettre à jour l'affichage du progrès
        let progressContainer = document.getElementById('budgetProgress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'budgetProgress';
            progressContainer.className = 'budget-progress';
            document.querySelector('.table-container').insertBefore(progressContainer, document.querySelector('.financial-table'));
        }
        
        let progressHTML = '<h3>📊 Progrès des Objectifs</h3><div class="progress-bars">';
        
        if (this.config.revenueGoal > 0) {
            const revenueProgress = (totals.revenue / this.config.revenueGoal) * 100;
            progressHTML += `
                <div class="progress-item">
                    <label>Chiffre d'affaires: ${this.formatCurrency(totals.revenue)} / ${this.formatCurrency(this.config.revenueGoal)} (${Math.round(revenueProgress)}%)</label>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(revenueProgress, 100)}%; background-color: ${revenueProgress >= 100 ? '#10b981' : '#3b82f6'}"></div>
                    </div>
                </div>
            `;
        }
        
        if (this.config.profitGoal > 0) {
            const profitProgress = (totals.netProfit / this.config.profitGoal) * 100;
            progressHTML += `
                <div class="progress-item">
                    <label>Bénéfice net: ${this.formatCurrency(totals.netProfit)} / ${this.formatCurrency(this.config.profitGoal)} (${Math.round(profitProgress)}%)</label>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(profitProgress, 100)}%; background-color: ${profitProgress >= 100 ? '#10b981' : totals.netProfit < 0 ? '#ef4444' : '#3b82f6'}"></div>
                    </div>
                </div>
            `;
        }
        
        progressHTML += '</div>';
        progressContainer.innerHTML = progressHTML;
    };
    
    /**
     * Système de catégories et étiquettes
     */
    FinancialApp.prototype.addCategorySystem = function() {
        if (!this.categories) {
            this.categories = {
                revenue: ['Ventes', 'Services', 'Consulting', 'Formations', 'Autres'],
                expenses: ['Marketing', 'Personnel', 'Équipement', 'Loyer', 'Autres']
            };
        }
        
        this.config.useCategories = true;
        this.generateTable();
        this.showNotification('Système de catégories activé', 'success');
    };
    
    /**
     * Calcul des métriques avancées
     */
    FinancialApp.prototype.calculateAdvancedMetrics = function() {
        const yearData = this.data[this.currentYear];
        if (!yearData) return null;
        
        const monthlyData = yearData.map(month => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const netProfit = grossProfit - (grossProfit > 0 ? grossProfit * this.config.taxRate / 100 : 0);
            return { ...month, grossProfit, netProfit };
        });
        
        // Calculs avancés
        const metrics = {
            // Moyennes mobiles
            movingAverages: {
                revenue3: this.calculateMovingAverage(monthlyData.map(m => m.revenue), 3),
                revenue6: this.calculateMovingAverage(monthlyData.map(m => m.revenue), 6),
                profit3: this.calculateMovingAverage(monthlyData.map(m => m.netProfit), 3)
            },
            
            // Volatilité
            volatility: {
                revenue: this.calculateVolatility(monthlyData.map(m => m.revenue)),
                profit: this.calculateVolatility(monthlyData.map(m => m.netProfit))
            },
            
            // Ratios financiers
            ratios: {
                profitMargin: this.calculateProfitMargin(monthlyData),
                expenseRatio: this.calculateExpenseRatio(monthlyData),
                growthRate: this.calculateGrowthRate(monthlyData)
            },
            
            // Prédictions
            predictions: {
                nextMonth: this.predictNextMonth(monthlyData),
                yearEnd: this.predictYearEnd(monthlyData)
            }
        };
        
        return metrics;
    };
    
    /**
     * Calcul de moyenne mobile
     */
    FinancialApp.prototype.calculateMovingAverage = function(data, periods) {
        if (data.length < periods) return [];
        
        const result = [];
        for (let i = periods - 1; i < data.length; i++) {
            const sum = data.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / periods);
        }
        return result;
    };
    
    /**
     * Calcul de volatilité
     */
    FinancialApp.prototype.calculateVolatility = function(data) {
        if (data.length < 2) return 0;
        
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    };
    
    /**
     * Calcul de marge bénéficiaire
     */
    FinancialApp.prototype.calculateProfitMargin = function(monthlyData) {
        const totalRevenue = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
        const totalProfit = monthlyData.reduce((acc, m) => acc + m.netProfit, 0);
        return totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    };
    
    /**
     * Calcul du ratio de dépenses
     */
    FinancialApp.prototype.calculateExpenseRatio = function(monthlyData) {
        const totalRevenue = monthlyData.reduce((acc, m) => acc + m.revenue, 0);
        const totalExpenses = monthlyData.reduce((acc, m) => acc + m.losses + m.purchases, 0);
        return totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    };
    
    /**
     * Calcul du taux de croissance
     */
    FinancialApp.prototype.calculateGrowthRate = function(monthlyData) {
        const revenues = monthlyData.map(m => m.revenue).filter(r => r > 0);
        if (revenues.length < 2) return 0;
        
        const firstRevenue = revenues[0];
        const lastRevenue = revenues[revenues.length - 1];
        return ((lastRevenue - firstRevenue) / firstRevenue) * 100;
    };
    
    /**
     * Prédiction du mois suivant
     */
    FinancialApp.prototype.predictNextMonth = function(monthlyData) {
        const revenues = monthlyData.map(m => m.revenue);
        const trend = this.calculateTrend(revenues);
        const lastTrend = trend[trend.length - 1];
        const growth = trend.length > 1 ? lastTrend - trend[trend.length - 2] : 0;
        
        return {
            revenue: Math.max(0, lastTrend + growth),
            confidence: Math.min(100, revenues.length * 15) // Plus de données = plus de confiance
        };
    };
    
    /**
     * Prédiction de fin d'année
     */
    FinancialApp.prototype.predictYearEnd = function(monthlyData) {
        const currentMonth = new Date().getMonth();
        const remainingMonths = 12 - monthlyData.filter(m => m.revenue > 0).length;
        
        if (remainingMonths <= 0) return null;
        
        const avgRevenue = monthlyData.reduce((acc, m) => acc + m.revenue, 0) / Math.max(1, monthlyData.filter(m => m.revenue > 0).length);
        const avgExpenses = monthlyData.reduce((acc, m) => acc + m.losses + m.purchases, 0) / Math.max(1, monthlyData.filter(m => m.revenue > 0).length);
        
        const predictedRevenue = avgRevenue * remainingMonths;
        const predictedExpenses = avgExpenses * remainingMonths;
        const predictedGrossProfit = predictedRevenue - predictedExpenses;
        const predictedNetProfit = predictedGrossProfit - (predictedGrossProfit > 0 ? predictedGrossProfit * this.config.taxRate / 100 : 0);
        
        return {
            revenue: predictedRevenue,
            expenses: predictedExpenses,
            netProfit: predictedNetProfit,
            remainingMonths: remainingMonths
        };
    };
    
    /**
     * Système d'export avancé
     */
    FinancialApp.prototype.advancedExport = function() {
        const modal = this.createModal('Export Avancé', `
            <div class="export-options">
                <h4>Options d'export:</h4>
                <div class="export-formats">
                    <label><input type="checkbox" id="exportExcel" checked> Excel (.xlsx)</label>
                    <label><input type="checkbox" id="exportCSV"> CSV</label>
                    <label><input type="checkbox" id="exportPDF"> PDF</label>
                    <label><input type="checkbox" id="exportJSON"> JSON complet</label>
                </div>
                
                <h4>Données à inclure:</h4>
                <div class="export-data">
                    <label><input type="checkbox" id="includeCharts" checked> Graphiques</label>
                    <label><input type="checkbox" id="includeMetrics" checked> Métriques avancées</label>
                    <label><input type="checkbox" id="includePredictions"> Prédictions</label>
                    <label><input type="checkbox" id="includeComparisons"> Comparaisons d'années</label>
                </div>
                
                <div class="form-actions">
                    <button onclick="app.executeAdvancedExport()" class="btn btn-primary">📤 Exporter</button>
                    <button onclick="app.closeModal()" class="btn btn-secondary">❌ Annuler</button>
                </div>
            </div>
        `);
    };
    
    /**
     * Exécution de l'export avancé
     */
    FinancialApp.prototype.executeAdvancedExport = function() {
        const options = {
            excel: document.getElementById('exportExcel')?.checked,
            csv: document.getElementById('exportCSV')?.checked,
            pdf: document.getElementById('exportPDF')?.checked,
            json: document.getElementById('exportJSON')?.checked,
            includeCharts: document.getElementById('includeCharts')?.checked,
            includeMetrics: document.getElementById('includeMetrics')?.checked,
            includePredictions: document.getElementById('includePredictions')?.checked,
            includeComparisons: document.getElementById('includeComparisons')?.checked
        };
        
        if (options.excel) this.exportToExcel();
        if (options.csv) this.exportToCSV();
        if (options.json) this.exportToJSON();
        if (options.pdf) this.exportToPDF();
        
        this.closeModal();
        this.showNotification('Export(s) terminé(s)', 'success');
    };
    
    /**
     * Export CSV
     */
    FinancialApp.prototype.exportToCSV = function() {
        const yearData = this.data[this.currentYear];
        let csvContent = "Mois,Chiffre d'affaires,Pertes,Achats,Bénéfice brut,Charges sociales,Bénéfice net\n";
        
        yearData.forEach(month => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            csvContent += `${month.month},${month.revenue},${month.losses},${month.purchases},${grossProfit},${taxes},${netProfit}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestion_financiere_${this.currentYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    /**
     * Export JSON complet
     */
    FinancialApp.prototype.exportToJSON = function() {
        const exportData = {
            data: this.data,
            config: this.config,
            metrics: this.calculateAdvancedMetrics(),
            exportDate: new Date().toISOString(),
            version: '3.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestion_financiere_complete_${this.currentYear}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    /**
     * Export PDF (nécessite une librairie comme jsPDF)
     */
    FinancialApp.prototype.exportToPDF = function() {
        // Implémentation basique avec impression
        const printWindow = window.open('', '_blank');
        const yearData = this.data[this.currentYear];
        
        let htmlContent = `
            <html>
            <head>
                <title>Rapport Financier ${this.currentYear}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f5f5f5; }
                    .positive { color: green; }
                    .negative { color: red; }
                    h1 { text-align: center; color: #333; }
                </style>
            </head>
            <body>
                <h1>Rapport Financier ${this.currentYear}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Mois</th>
                            <th>Chiffre d'affaires</th>
                            <th>Pertes</th>
                            <th>Achats</th>
                            <th>Bénéfice brut</th>
                            <th>Charges sociales</th>
                            <th>Bénéfice net</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        yearData.forEach(month => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            htmlContent += `
                <tr>
                    <td style="text-align: left;">${month.month}</td>
                    <td>${this.formatCurrency(month.revenue)}</td>
                    <td>${this.formatCurrency(month.losses)}</td>
                    <td>${this.formatCurrency(month.purchases)}</td>
                    <td class="${grossProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(grossProfit)}</td>
                    <td>${this.formatCurrency(taxes)}</td>
                    <td class="${netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit)}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                    </tbody>
                </table>
                <p style="text-align: center; margin-top: 40px;">
                    Généré le ${new Date().toLocaleDateString('fr-FR')} par Gestion Financière SAS
                </p>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };
    
    /**
     * Créer une modal générique
     */
    FinancialApp.prototype.createModal = function(title, content) {
        // Supprimer modal existante
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="app.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button onclick="app.closeModal()" class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    };
    
    /**
     * Fermer la modal
     */
    FinancialApp.prototype.closeModal = function() {
        const modal = document.querySelector('.custom-modal');
        if (modal) modal.remove();
    };
    
    /**
     * Système de plugins
     */
    FinancialApp.prototype.loadPlugin = function(pluginName) {
        const plugins = {
            'crypto-tracker': () => {
                this.showNotification('Plugin Crypto Tracker chargé', 'info');
                // Ajouter fonctionnalité de suivi des cryptomonnaies
            },
            'multi-currency': () => {
                this.showNotification('Plugin Multi-devises chargé', 'info');
                // Ajouter support multi-devises
            },
            'advanced-charts': () => {
                this.showNotification('Plugin Graphiques Avancés chargé', 'info');
                // Ajouter types de graphiques supplémentaires
            }
        };
        
        if (plugins[pluginName]) {
            plugins[pluginName]();
        } else {
            this.showNotification('Plugin non trouvé', 'warning');
        }
    };
}

// Styles CSS pour les nouvelles fonctionnalités
const advancedStyles = `
    .budget-progress {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .progress-bars {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .progress-item label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #374151;
    }
    
    .progress-bar {
        width: 100%;
        height: 20px;
        background-color: #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 10px;
    }
    
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        z-index: 1001;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1f2937;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-close:hover {
        color: #ef4444;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #374151;
    }
    
    .form-group input[type="number"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .export-options, .export-formats, .export-data {
        margin-bottom: 20px;
    }
    
    .export-formats label, .export-data label {
        display: block;
        margin-bottom: 8px;
        font-weight: normal;
    }
    
    .export-formats input[type="checkbox"], .export-data input[type="checkbox"] {
        margin-right: 8px;
    }
    
    .budget-form .form-group input {
        width: 100%;
        padding: 10px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s;
    }
    
    .budget-form .form-group input:focus {
        outline: none;
        border-color: #3b82f6;
    }
`;

// Ajouter les styles au document
if (!document.getElementById('advanced-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'advanced-styles';
    styleElement.textContent = advancedStyles;
    document.head.appendChild(styleElement);
}

// Ajout des boutons pour les nouvelles fonctionnalités
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof app !== 'undefined' && app) {
            // Ajouter bouton templates
            const templatesBtn = document.createElement('button');
            templatesBtn.className = 'btn btn-info';
            templatesBtn.innerHTML = '📋 Templates';
            templatesBtn.title = 'Modèles prédéfinis';
            templatesBtn.onclick = () => {
                const modal = app.createModal('Templates', `
                    <div class="templates-list">
                        <h4>Choisissez un modèle :</h4>
                        <div class="template-options">
                            <button onclick="app.applyTemplate('startup')" class="btn btn-primary btn-block">🚀 Entreprise en démarrage</button>
                            <button onclick="app.applyTemplate('seasonal')" class="btn btn-primary btn-block">🌊 Activité saisonnière</button>
                            <button onclick="app.applyTemplate('stable')" class="btn btn-primary btn-block">📈 Entreprise stable</button>
                        </div>
                        <button onclick="app.closeModal()" class="btn btn-secondary" style="margin-top: 20px;">❌ Annuler</button>
                    </div>
                `);
            };
            
            // Ajouter bouton budget
            const budgetBtn = document.createElement('button');
            budgetBtn.className = 'btn btn-warning';
            budgetBtn.innerHTML = '🎯 Objectifs';
            budgetBtn.title = 'Définir des objectifs';
            budgetBtn.onclick = () => app.setBudgetGoals();
            
            // Ajouter bouton export avancé
            const advExportBtn = document.createElement('button');
            advExportBtn.className = 'btn btn-success';
            advExportBtn.innerHTML = '📤 Export+';
            advExportBtn.title = 'Export avancé';
            advExportBtn.onclick = () => app.advancedExport();
            
            // Ajouter bouton métriques
            const metricsBtn = document.createElement('button');
            metricsBtn.className = 'btn btn-info';
            metricsBtn.innerHTML = '📊 Métriques';
            metricsBtn.title = 'Métriques avancées';
            metricsBtn.onclick = () => {
                const metrics = app.calculateAdvancedMetrics();
                if (metrics) {
                    const modal = app.createModal('Métriques Avancées', `
                        <div class="metrics-display">
                            <h4>📈 Ratios Financiers</h4>
                            <p><strong>Marge bénéficiaire:</strong> ${metrics.ratios.profitMargin.toFixed(2)}%</p>
                            <p><strong>Ratio de dépenses:</strong> ${metrics.ratios.expenseRatio.toFixed(2)}%</p>
                            <p><strong>Taux de croissance:</strong> ${metrics.ratios.growthRate.toFixed(2)}%</p>
                            
                            <h4>📊 Volatilité</h4>
                            <p><strong>Volatilité des revenus:</strong> ${app.formatCurrency(metrics.volatility.revenue)}</p>
                            <p><strong>Volatilité des bénéfices:</strong> ${app.formatCurrency(metrics.volatility.profit)}</p>
                            
                            ${metrics.predictions.nextMonth ? `
                                <h4>🔮 Prédictions</h4>
                                <p><strong>Revenus prochains:</strong> ${app.formatCurrency(metrics.predictions.nextMonth.revenue)} (confiance: ${metrics.predictions.nextMonth.confidence}%)</p>
                            ` : ''}
                            
                            <button onclick="app.closeModal()" class="btn btn-primary" style="margin-top: 20px;">✅ OK</button>
                        </div>
                    `);
                }
            };
            
            // Insérer les boutons dans l'interface
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) {
                const newControlsDiv = document.createElement('div');
                newControlsDiv.className = 'advanced-controls';
                newControlsDiv.style.cssText = 'display: flex; gap: 5px; margin-left: 10px;';
                
                newControlsDiv.appendChild(templatesBtn);
                newControlsDiv.appendChild(budgetBtn);
                newControlsDiv.appendChild(metricsBtn);
                newControlsDiv.appendChild(advExportBtn);
                
                headerControls.appendChild(newControlsDiv);
            }
            
            // Actualiser le progrès budgétaire si configuré
            if (app.config.revenueGoal || app.config.profitGoal) {
                app.updateBudgetProgress();
            }
        }
    }, 1500);
});

console.log('📊 Module de fonctionnalités avancées chargé');