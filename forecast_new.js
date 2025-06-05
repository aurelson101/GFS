/**
 * Module de Prévisions Financières - Version Corrigée
 */

const ForecastModule = {
    charts: {},
    modals: [],
    
    showForecast(data, currentYear, config) {
        // Fermer les modals existants
        this.closeAllModals();
        
        console.log('🔮 Affichage du module de prévisions');
        
        const forecastData = this.calculateForecasts(data, currentYear, config);
        
        const content = `
            <div class="forecast-container">
                <h3>🔮 Prévisions Financières ${currentYear + 1}</h3>
                
                <div class="forecast-summary">
                    <div class="forecast-card">
                        <h4>📈 Chiffre d'Affaires Prévu</h4>
                        <div class="forecast-value positive">${this.formatCurrency(forecastData.totalRevenue)}</div>
                        <small>Croissance estimée: ${forecastData.revenueGrowth >= 0 ? '+' : ''}${forecastData.revenueGrowth}%</small>
                    </div>
                    
                    <div class="forecast-card">
                        <h4>💰 Bénéfice Net Prévu</h4>
                        <div class="forecast-value ${forecastData.totalNetProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(forecastData.totalNetProfit)}</div>
                        <small>Marge prévue: ${forecastData.profitMargin}%</small>
                    </div>
                    
                    <div class="forecast-card">
                        <h4>💸 Charges Prévues</h4>
                        <div class="forecast-value">${this.formatCurrency(forecastData.totalExpenses)}</div>
                        <small>Évolution: ${forecastData.expenseGrowth >= 0 ? '+' : ''}${forecastData.expenseGrowth}%</small>
                    </div>
                </div>
                
                <div class="forecast-tabs">
                    <button class="tab-btn active" onclick="ForecastModule.showForecastTab('monthly', event)">Prévisions Mensuelles</button>
                    <button class="tab-btn" onclick="ForecastModule.showForecastTab('scenarios', event)">Scénarios</button>
                    <button class="tab-btn" onclick="ForecastModule.showForecastTab('trends', event)">Analyse de Tendances</button>
                </div>
                
                <div id="monthly-forecast" class="forecast-tab active">
                    <h4>📊 Prévisions Mensuelles Détaillées</h4>
                    <div class="forecast-chart-container">
                        <canvas id="forecastChart" width="400" height="300"></canvas>
                    </div>
                    
                    <div class="forecast-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>CA Prévu</th>
                                    <th>Charges Prévues</th>
                                    <th>Bénéfice Net Prévu</th>
                                    <th>Confiance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${forecastData.monthlyForecasts.map((month, index) => `
                                    <tr>
                                        <td><strong>${month.month}</td>
                                        <td class="positive">${this.formatCurrency(month.revenue)}</td>
                                        <td>${this.formatCurrency(month.expenses)}</td>
                                        <td class="${month.netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.netProfit)}</td>
                                        <td><span class="confidence-badge confidence-${month.confidence}">${month.confidence}%</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div id="scenarios-forecast" class="forecast-tab">
                    <h4>🎯 Analyse de Scénarios</h4>
                    <div class="scenarios-grid">
                        <div class="scenario-card optimistic">
                            <h5>📈 Scénario Optimiste (+20%)</h5>
                            <div class="scenario-value">${this.formatCurrency(forecastData.scenarios.optimistic.revenue)}</div>
                            <p>Bénéfice net: ${this.formatCurrency(forecastData.scenarios.optimistic.netProfit)}</p>
                        </div>
                        
                        <div class="scenario-card realistic">
                            <h5>📊 Scénario Réaliste</h5>
                            <div class="scenario-value">${this.formatCurrency(forecastData.scenarios.realistic.revenue)}</div>
                            <p>Bénéfice net: ${this.formatCurrency(forecastData.scenarios.realistic.netProfit)}</p>
                        </div>
                        
                        <div class="scenario-card pessimistic">
                            <h5>📉 Scénario Pessimiste (-15%)</h5>
                            <div class="scenario-value">${this.formatCurrency(forecastData.scenarios.pessimistic.revenue)}</div>
                            <p>Bénéfice net: ${this.formatCurrency(forecastData.scenarios.pessimistic.netProfit)}</p>
                        </div>
                    </div>
                </div>
                
                <div id="trends-forecast" class="forecast-tab">
                    <h4>📈 Analyse de Tendances</h4>
                    <div class="trends-analysis">
                        <div class="trend-item">
                            <h5>Tendance des Revenus</h5>
                            <div class="trend-indicator ${forecastData.trends.revenue >= 0 ? 'positive' : 'negative'}">
                                ${forecastData.trends.revenue >= 0 ? '📈' : '📉'} ${forecastData.trends.revenue >= 0 ? '+' : ''}${forecastData.trends.revenue}% par mois
                            </div>
                        </div>
                        
                        <div class="trend-item">
                            <h5>Tendance des Charges</h5>
                            <div class="trend-indicator ${forecastData.trends.expenses <= 0 ? 'positive' : 'negative'}">
                                ${forecastData.trends.expenses >= 0 ? '📈' : '📉'} ${forecastData.trends.expenses >= 0 ? '+' : ''}${forecastData.trends.expenses}% par mois
                            </div>
                        </div>
                        
                        <div class="trend-item">
                            <h5>Saisonnalité</h5>
                            <div class="seasonality-info">
                                Meilleurs mois: ${forecastData.seasonality.bestMonths.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="forecast-actions">
                    <button class="btn btn-success" onclick="ForecastModule.createBudgetFromForecast()">💰 Créer Budget</button>
                </div>
            </div>
            
            <style>
                .forecast-container { max-height: 70vh; overflow-y: auto; }
                .forecast-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .forecast-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
                .forecast-card h4 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
                .forecast-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; }
                .forecast-value.positive { color: #10b981; }
                .forecast-value.negative { color: #ef4444; }
                .forecast-tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #e5e7eb; }
                .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .tab-btn.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
                .forecast-tab { display: none; padding: 20px 0; }
                .forecast-tab.active { display: block; }
                .forecast-chart-container { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                .forecast-table { margin: 20px 0; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .table th { background: #f8fafc; font-weight: bold; }
                .confidence-badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .confidence-high { background: #d1fae5; color: #065f46; }
                .confidence-medium { background: #fef3c7; color: #92400e; }
                .confidence-low { background: #fee2e2; color: #991b1b; }
                .scenarios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
                .scenario-card { padding: 20px; border-radius: 8px; text-align: center; }
                .scenario-card.optimistic { background: #d1fae5; border-left: 4px solid #10b981; }
                .scenario-card.realistic { background: #dbeafe; border-left: 4px solid #3b82f6; }
                .scenario-card.pessimistic { background: #fee2e2; border-left: 4px solid #ef4444; }
                .scenario-value { font-size: 1.5em; font-weight: bold; margin: 10px 0; }
                .trends-analysis { display: grid; gap: 15px; margin: 20px 0; }
                .trend-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
                .trend-indicator { font-size: 1.2em; margin: 10px 0; }
                .trend-indicator.positive { color: #10b981; }
                .trend-indicator.negative { color: #ef4444; }
                .forecast-actions { text-align: center; margin: 20px 0; }
                .forecast-actions .btn { margin: 0 10px; }
            </style>
        `;
        
        const modal = this.createModal('🔮 Prévisions Financières', content, 'large');
        this.modals.push(modal);
        
        // Créer le graphique après que le modal soit affiché
        setTimeout(() => {
            this.createForecastChart('forecastChart', {
                labels: forecastData.monthlyForecasts.map(m => m.month),
                datasets: [
                    {
                        label: 'Revenus Prévus',
                        data: forecastData.monthlyForecasts.map(m => m.revenue),
                        borderColor: '#10b981',
                        backgroundColor: '#10b98120',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Charges Prévues',
                        data: forecastData.monthlyForecasts.map(m => m.expenses),
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444420',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Bénéfice Net Prévu',
                        data: forecastData.monthlyForecasts.map(m => m.netProfit),
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f620',
                        tension: 0.4,
                        fill: true
                    }
                ]
            }, {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Prévisions Financières Mensuelles'
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
            });
        }, 100);
    },
    
    calculateForecasts(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        const previousYearData = data[currentYear - 1] || [];
        
        // Calculer les moyennes et tendances
        const avgRevenue = this.calculateAverage(currentYearData.map(m => m.revenue));
        const avgExpenses = this.calculateAverage(currentYearData.map(m => m.losses + m.purchases));
        
        // Calculer la croissance année sur année
        const currentTotal = currentYearData.reduce((sum, m) => sum + m.revenue, 0);
        const previousTotal = previousYearData.reduce((sum, m) => sum + m.revenue, 0);
        const revenueGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 5;
        
        // Calculer les prévisions mensuelles
        const monthlyForecasts = currentYearData.map((_, index) => {
            const seasonalFactor = this.getSeasonalFactor(index);
            const trendFactor = 1 + (revenueGrowth / 100);
            
            const revenue = avgRevenue * seasonalFactor * trendFactor;
            const expenses = avgExpenses * seasonalFactor;
            const grossProfit = revenue - expenses;
            const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            return {
                month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][index],
                revenue: Math.round(revenue),
                expenses: Math.round(expenses),
                netProfit: Math.round(netProfit),
                confidence: this.calculateConfidence(index, currentYearData)
            };
        });
        
        // Calculer les totaux
        const totalRevenue = monthlyForecasts.reduce((sum, m) => sum + m.revenue, 0);
        const totalExpenses = monthlyForecasts.reduce((sum, m) => sum + m.expenses, 0);
        const totalNetProfit = monthlyForecasts.reduce((sum, m) => sum + m.netProfit, 0);
        
        // Scénarios
        const scenarios = {
            optimistic: {
                revenue: Math.round(totalRevenue * 1.2),
                netProfit: Math.round(totalNetProfit * 1.25)
            },
            realistic: {
                revenue: totalRevenue,
                netProfit: totalNetProfit
            },
            pessimistic: {
                revenue: Math.round(totalRevenue * 0.85),
                netProfit: Math.round(totalNetProfit * 0.7)
            }
        };
        
        return {
            totalRevenue,
            totalExpenses,
            totalNetProfit,
            revenueGrowth: Math.round(revenueGrowth * 10) / 10,
            expenseGrowth: Math.round((avgExpenses / (previousYearData.reduce((sum, m) => sum + m.losses + m.purchases, 0) / 12 || avgExpenses) - 1) * 100 * 10) / 10,
            profitMargin: totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue * 100) * 10) / 10 : 0,
            monthlyForecasts,
            scenarios,
            trends: {
                revenue: Math.round(revenueGrowth / 12 * 10) / 10,
                expenses: Math.round((avgExpenses - (previousYearData.reduce((sum, m) => sum + m.losses + m.purchases, 0) / 12 || avgExpenses)) / avgExpenses * 100 * 10) / 10
            },
            seasonality: {
                bestMonths: this.getBestMonths(currentYearData)
            }
        };
    },
    
    calculateAverage(array) {
        const validValues = array.filter(val => !isNaN(val) && val > 0);
        return validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : 0;
    },
    
    getSeasonalFactor(monthIndex) {
        const factors = [0.9, 0.85, 1.1, 1.05, 1.1, 1.0, 0.95, 0.8, 1.15, 1.2, 1.1, 1.0];
        return factors[monthIndex] || 1.0;
    },
    
    calculateConfidence(monthIndex, currentYearData) {
        const completedMonths = currentYearData.filter(m => m.revenue > 0).length;
        const baseConfidence = Math.min(80, completedMonths * 8);
        const distancePenalty = Math.max(0, (monthIndex - completedMonths) * 5);
        return Math.max(30, baseConfidence - distancePenalty);
    },
    
    getBestMonths(yearData) {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        const monthsWithProfits = yearData.map((month, index) => ({
            name: monthNames[index],
            profit: month.revenue - month.losses - month.purchases
        }))
        .filter(m => m.profit > 0)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 3)
        .map(m => m.name);
        
        return monthsWithProfits.length > 0 ? monthsWithProfits : ['Données insuffisantes'];
    },
    
    createForecastChart(canvasId, data, options) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas avec l'ID '${canvasId}' introuvable.`);
            return;
        }

        const ctx = canvas.getContext('2d');
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    },
    
    showForecastTab(tabName, e) {
        document.querySelectorAll('.forecast-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedTab = document.getElementById(`${tabName}-forecast`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (e && e.target) {
            e.target.classList.add('active');
        }
    },
    
    createBudgetFromForecast() {
        if (typeof app !== 'undefined') {
            app.showNotification('💰 Création du budget à partir des prévisions...', 'info');
            if (typeof BudgetModule !== 'undefined') {
                this.closeAllModals();
                setTimeout(() => {
                    BudgetModule.showBudget(app.data, app.currentYear, app.config);
                }, 300);
            }
        }
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    closeAllModals() {
        this.modals.forEach(modal => modal.remove());
        this.modals = [];
    },
    
    createModal(title, content, size = '') {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content ${size ? 'modal-' + size : ''}">
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

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }
};

// Ajouter à la portée globale
window.ForecastModule = ForecastModule;

/**
 * Module Budget - Ajout pour corriger le chargement
 */
const BudgetModule = {
    charts: {},
    modals: [],
    
    showBudget(data, currentYear, config) {
        console.log('💰 Affichage du module Budget');
        
        // Fermer les modals existants
        this.closeAllModals();
        
        const budgetData = this.calculateBudget(data, currentYear, config);
        
        const content = `
            <div class="budget-container">
                <h3>💰 Gestion Budget ${currentYear + 1}</h3>
                
                <div class="budget-overview">
                    <div class="budget-card">
                        <h4>📊 Budget Total</h4>
                        <div class="budget-value">${this.formatCurrency(budgetData.totalBudget)}</div>
                        <small>Basé sur les prévisions</small>
                    </div>
                    
                    <div class="budget-card">
                        <h4>💸 Dépenses Prévues</h4>
                        <div class="budget-value expenses">${this.formatCurrency(budgetData.totalExpenses)}</div>
                        <small>${budgetData.expenseRatio}% du budget</small>
                    </div>
                    
                    <div class="budget-card">
                        <h4>💰 Marge Disponible</h4>
                        <div class="budget-value ${budgetData.availableMargin >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(budgetData.availableMargin)}</div>
                        <small>Après toutes charges</small>
                    </div>
                </div>
                
                <div class="budget-categories">
                    <h4>📋 Répartition par Catégorie</h4>
                    <div class="categories-grid">
                        ${budgetData.categories.map(cat => `
                            <div class="category-card">
                                <h5>${cat.icon} ${cat.name}</h5>
                                <div class="category-amount">${this.formatCurrency(cat.amount)}</div>
                                <div class="category-percentage">${cat.percentage}% du budget</div>
                                <div class="category-bar">
                                    <div class="category-fill" style="width: ${cat.percentage}%; background-color: ${cat.color};"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="budget-alerts">
                    <h4>⚠️ Alertes Budget</h4>
                    <div class="alerts-list">
                        ${budgetData.alerts.map(alert => `
                            <div class="alert-item ${alert.type}">
                                <span class="alert-icon">${alert.icon}</span>
                                <span class="alert-message">${alert.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <style>
                .budget-container { max-height: 70vh; overflow-y: auto; padding: 20px; }
                .budget-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .budget-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
                .budget-card h4 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
                .budget-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; color: #1f2937; }
                .budget-value.positive { color: #10b981; }
                .budget-value.negative { color: #ef4444; }
                .budget-value.expenses { color: #f59e0b; }
                .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
                .category-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .category-card h5 { margin: 0 0 10px 0; color: #1f2937; }
                .category-amount { font-size: 1.4em; font-weight: bold; margin: 8px 0; }
                .category-percentage { font-size: 0.9em; color: #6b7280; margin-bottom: 10px; }
                .category-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; }
                .category-fill { height: 100%; transition: width 0.3s ease; }
                .alerts-list { margin: 15px 0; }
                .alert-item { display: flex; align-items: center; gap: 10px; padding: 10px; margin: 8px 0; border-radius: 6px; }
                .alert-item.warning { background: #fef3c7; color: #92400e; }
                .alert-item.danger { background: #fee2e2; color: #991b1b; }
                .alert-item.info { background: #dbeafe; color: #1e40af; }
                .alert-icon { font-size: 1.2em; }
            </style>
        `;
        
        const modal = this.createModal('💰 Gestion Budget', content, 'large');
        this.modals.push(modal);
    },
    
    calculateBudget(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        
        // Calculer les totaux actuels
        const totalRevenue = currentYearData.reduce((sum, m) => sum + (m.revenue || 0), 0);
        const totalLosses = currentYearData.reduce((sum, m) => sum + (m.losses || 0), 0);
        const totalPurchases = currentYearData.reduce((sum, m) => sum + (m.purchases || 0), 0);
        const totalExpenses = totalLosses + totalPurchases;
        
        // Budget projeté basé sur les revenus actuels + 10%
        const totalBudget = Math.round(totalRevenue * 1.1);
        const availableMargin = totalBudget - totalExpenses;
        const expenseRatio = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
        
        // Catégories de budget
        const categories = [
            {
                name: 'Pertes',
                icon: '📉',
                amount: totalLosses,
                percentage: totalBudget > 0 ? Math.round((totalLosses / totalBudget) * 100) : 0,
                color: '#ef4444'
            },
            {
                name: 'Achats Professionnels',
                icon: '🛒',
                amount: totalPurchases,
                percentage: totalBudget > 0 ? Math.round((totalPurchases / totalBudget) * 100) : 0,
                color: '#f59e0b'
            },
            {
                name: 'Charges Sociales',
                icon: '🏛️',
                amount: Math.round(totalRevenue * config.taxRate / 100),
                percentage: Math.round(config.taxRate),
                color: '#8b5cf6'
            },
            {
                name: 'Marge Libre',
                icon: '💰',
                amount: Math.max(0, availableMargin),
                percentage: totalBudget > 0 ? Math.max(0, Math.round((availableMargin / totalBudget) * 100)) : 0,
                color: '#10b981'
            }
        ];
        
        // Alertes budget
        const alerts = [];
        
        if (expenseRatio > 80) {
            alerts.push({
                type: 'danger',
                icon: '🚨',
                message: `Dépenses élevées: ${expenseRatio}% du budget utilisé`
            });
        } else if (expenseRatio > 60) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                message: `Attention: ${expenseRatio}% du budget utilisé`
            });
        }
        
        if (availableMargin < 0) {
            alerts.push({
                type: 'danger',
                icon: '💸',
                message: 'Budget dépassé! Réduisez les dépenses.'
            });
        }
        
        if (alerts.length === 0) {
            alerts.push({
                type: 'info',
                icon: '✅',
                message: 'Budget sous contrôle'
            });
        }
        
        return {
            totalBudget,
            totalExpenses,
            availableMargin,
            expenseRatio,
            categories,
            alerts
        };
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    closeAllModals() {
        this.modals.forEach(modal => modal.remove());
        this.modals = [];
    },
    
    createModal(title, content, size = '') {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content ${size ? 'modal-' + size : ''}">
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

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }
};

// Module Reports - Version Complète
const ReportsModule = {
    charts: {},
    modals: [],
    
    showReports(data, currentYear, config) {
        console.log('📋 Affichage du module Rapports');
        
        // Fermer les modals existants
        this.closeAllModals();
        
        const reportData = this.generateReportData(data, currentYear, config);
        
        const content = `
            <div class="reports-container">
                <h3>📋 Rapports Détaillés ${currentYear}</h3>
                
                <div class="report-tabs">
                    <button class="tab-btn active" onclick="ReportsModule.showReportTab('summary', event)">Résumé Exécutif</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('monthly', event)">Rapport Mensuel</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('financial', event)">États Financiers</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('analytics', event)">Analyse Avancée</button>
                </div>
                
                <!-- Résumé Exécutif -->
                <div id="summary-report" class="report-tab active">
                    <h4>📊 Résumé Exécutif ${currentYear}</h4>
                    
                    <div class="executive-summary">
                        <div class="summary-grid">
                            <div class="summary-card revenue">
                                <div class="card-header">
                                    <h5>💰 Chiffre d'Affaires</h5>
                                    <span class="trend-icon">${reportData.summary.revenueTrend >= 0 ? '📈' : '📉'}</span>
                                </div>
                                <div class="card-value">${this.formatCurrency(reportData.summary.totalRevenue)}</div>
                                <div class="card-change ${reportData.summary.revenueTrend >= 0 ? 'positive' : 'negative'}">
                                    ${reportData.summary.revenueTrend >= 0 ? '+' : ''}${reportData.summary.revenueTrend.toFixed(1)}% vs année précédente
                                </div>
                            </div>
                            
                            <div class="summary-card profit">
                                <div class="card-header">
                                    <h5>💎 Bénéfice Net</h5>
                                    <span class="trend-icon">${reportData.summary.profitTrend >= 0 ? '📈' : '📉'}</span>
                                </div>
                                <div class="card-value ${reportData.summary.totalProfit >= 0 ? 'positive' : 'negative'}">
                                    ${this.formatCurrency(reportData.summary.totalProfit)}
                                </div>
                                <div class="card-change ${reportData.summary.profitTrend >= 0 ? 'positive' : 'negative'}">
                                    ${reportData.summary.profitTrend >= 0 ? '+' : ''}${reportData.summary.profitTrend.toFixed(1)}% vs année précédente
                                </div>
                            </div>
                            
                            <div class="summary-card margin">
                                <div class="card-header">
                                    <h5>📈 Marge Nette</h5>
                                    <span class="trend-icon">${reportData.summary.marginTrend >= 0 ? '📈' : '📉'}</span>
                                </div>
                                <div class="card-value">${reportData.summary.netMargin.toFixed(1)}%</div>
                                <div class="card-change ${reportData.summary.marginTrend >= 0 ? 'positive' : 'negative'}">
                                    ${reportData.summary.marginTrend >= 0 ? '+' : ''}${reportData.summary.marginTrend.toFixed(1)} points
                                </div>
                            </div>
                            
                            <div class="summary-card efficiency">
                                <div class="card-header">
                                    <h5>⚡ Efficacité</h5>
                                    <span class="trend-icon">📊</span>
                                </div>
                                <div class="card-value">${reportData.summary.efficiency}/10</div>
                                <div class="card-change">
                                    Score basé sur la rentabilité
                                </div>
                            </div>
                        </div>
                        
                        <div class="key-insights">
                            <h5>🔍 Points Clés</h5>
                            <ul class="insights-list">
                                ${reportData.insights.map(insight => `
                                    <li class="insight-item ${insight.type}">
                                        <span class="insight-icon">${insight.icon}</span>
                                        <span class="insight-text">${insight.message}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Rapport Mensuel -->
                <div id="monthly-report" class="report-tab">
                    <h4>📅 Rapport Mensuel Détaillé</h4>
                    
                    <div class="monthly-chart-container">
                        <canvas id="monthlyReportChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="monthly-table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>CA</th>
                                    <th>Charges</th>
                                    <th>Bénéfice Brut</th>
                                    <th>Charges Sociales</th>
                                    <th>Bénéfice Net</th>
                                    <th>Marge %</th>
                                    <th>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.monthlyData.map(month => `
                                    <tr>
                                        <td><strong>${month.name}</strong></td>
                                        <td>${this.formatCurrency(month.revenue)}</td>
                                        <td>${this.formatCurrency(month.expenses)}</td>
                                        <td class="${month.grossProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.grossProfit)}</td>
                                        <td>${this.formatCurrency(month.taxes)}</td>
                                        <td class="${month.netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.netProfit)}</td>
                                        <td class="${month.margin >= 0 ? 'positive' : 'negative'}">${month.margin.toFixed(1)}%</td>
                                        <td><span class="performance-badge performance-${month.performance.level}">${month.performance.label}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- États Financiers -->
                <div id="financial-report" class="report-tab">
                    <h4>📊 États Financiers</h4>
                    
                    <div class="financial-statements">
                        <div class="statement-section">
                            <h5>💰 Compte de Résultat</h5>
                            <table class="financial-table">
                                <tbody>
                                    <tr class="section-header">
                                        <td><strong>PRODUITS</strong></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Chiffre d'Affaires</td>
                                        <td class="amount">${this.formatCurrency(reportData.financial.revenue)}</td>
                                    </tr>
                                    <tr class="section-header">
                                        <td><strong>CHARGES</strong></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Pertes et Charges</td>
                                        <td class="amount">${this.formatCurrency(reportData.financial.losses)}</td>
                                    </tr>
                                    <tr>
                                        <td>Achats Professionnels</td>
                                        <td class="amount">${this.formatCurrency(reportData.financial.purchases)}</td>
                                    </tr>
                                    <tr class="subtotal">
                                        <td><strong>Résultat Avant Charges Sociales</strong></td>
                                        <td class="amount"><strong>${this.formatCurrency(reportData.financial.grossProfit)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td>Charges Sociales (${config.taxRate}%)</td>
                                        <td class="amount">${this.formatCurrency(reportData.financial.taxes)}</td>
                                    </tr>
                                    <tr class="total">
                                        <td><strong>RÉSULTAT NET</strong></td>
                                        <td class="amount ${reportData.financial.netProfit >= 0 ? 'positive' : 'negative'}">
                                            <strong>${this.formatCurrency(reportData.financial.netProfit)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="ratios-section">
                            <h5>📈 Ratios Financiers</h5>
                            <div class="ratios-grid">
                                <div class="ratio-card">
                                    <div class="ratio-label">Marge Brute</div>
                                    <div class="ratio-value">${reportData.ratios.grossMargin.toFixed(1)}%</div>
                                </div>
                                <div class="ratio-card">
                                    <div class="ratio-label">Marge Nette</div>
                                    <div class="ratio-value">${reportData.ratios.netMargin.toFixed(1)}%</div>
                                </div>
                                <div class="ratio-card">
                                    <div class="ratio-label">Taux de Charges</div>
                                    <div class="ratio-value">${reportData.ratios.expenseRatio.toFixed(1)}%</div>
                                </div>
                                <div class="ratio-card">
                                    <div class="ratio-label">ROI Mensuel Moyen</div>
                                    <div class="ratio-value">${reportData.ratios.avgMonthlyROI.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Analyse Avancée -->
                <div id="analytics-report" class="report-tab">
                    <h4>🔬 Analyse Avancée</h4>
                    
                    <div class="analytics-content">
                        <div class="trend-analysis">
                            <h5>📈 Analyse des Tendances</h5>
                            <div class="trend-charts">
                                <canvas id="trendAnalysisChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                        
                        <div class="seasonality-analysis">
                            <h5>🌊 Analyse de Saisonnalité</h5>
                            <div class="season-grid">
                                ${reportData.seasonality.map(season => `
                                    <div class="season-card">
                                        <h6>${season.name}</h6>
                                        <div class="season-value">${this.formatCurrency(season.avgRevenue)}</div>
                                        <div class="season-trend ${season.trend >= 0 ? 'positive' : 'negative'}">
                                            ${season.trend >= 0 ? '+' : ''}${season.trend.toFixed(1)}%
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendations">
                            <h5>💡 Recommandations</h5>
                            <div class="recommendations-list">
                                ${reportData.recommendations.map(rec => `
                                    <div class="recommendation-item ${rec.priority}">
                                        <div class="rec-header">
                                            <span class="rec-icon">${rec.icon}</span>
                                            <strong>${rec.title}</strong>
                                        </div>
                                        <p>${rec.description}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                  <div class="report-actions">
                    <button class="btn btn-success" onclick="ReportsModule.exportToExcel()">📊 Exporter Excel</button>
                    <button class="btn btn-info" onclick="ReportsModule.printReport()">🖨️ Imprimer</button>
                </div>
            </div>
            
            <style>
                .reports-container { max-height: 80vh; overflow-y: auto; padding: 20px; }
                .report-tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #e5e7eb; flex-wrap: wrap; }
                .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .tab-btn.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
                .report-tab { display: none; padding: 20px 0; }
                .report-tab.active { display: block; }
                
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
                .summary-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .summary-card.revenue { border-left: 4px solid #10b981; }
                .summary-card.profit { border-left: 4px solid #3b82f6; }
                .summary-card.margin { border-left: 4px solid #f59e0b; }
                .summary-card.efficiency { border-left: 4px solid #8b5cf6; }
                
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .card-header h5 { margin: 0; color: #374151; font-size: 14px; }
                .trend-icon { font-size: 18px; }
                .card-value { font-size: 2em; font-weight: bold; color: #1f2937; margin: 10px 0; }
                .card-change { font-size: 12px; font-weight: 600; }
                .card-change.positive { color: #10b981; }
                .card-change.negative { color: #ef4444; }
                
                .key-insights { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
                .insights-list { list-style: none; padding: 0; margin: 15px 0; }
                .insight-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
                .insight-item.positive { color: #10b981; }
                .insight-item.negative { color: #ef4444; }
                .insight-item.warning { color: #f59e0b; }
                .insight-icon { font-size: 16px; }
                
                .monthly-chart-container { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .monthly-table-wrapper { overflow-x: auto; margin: 20px 0; }
                .report-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
                .report-table th, .report-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .report-table th { background: #f8fafc; font-weight: 600; color: #374151; }
                .performance-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
                .performance-excellent { background: #d1fae5; color: #065f46; }
                .performance-good { background: #dbeafe; color: #1e40af; }
                .performance-average { background: #fef3c7; color: #92400e; }
                .performance-poor { background: #fee2e2; color: #991b1b; }
                
                .financial-statements { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
                .financial-table { width: 100%; border-collapse: collapse; }
                .financial-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
                .financial-table .section-header td { background: #f8fafc; font-weight: 600; color: #374151; }
                .financial-table .subtotal td { border-top: 2px solid #d1d5db; font-weight: 600; }
                .financial-table .total td { background: #f8fafc; border-top: 2px solid #374151; font-weight: bold; }
                .financial-table .amount { text-align: right; font-family: monospace; }
                
                .ratios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
                .ratio-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .ratio-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
                .ratio-value { font-size: 1.5em; font-weight: bold; color: #1f2937; }
                
                .season-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
                .season-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .season-value { font-size: 1.3em; font-weight: bold; margin: 8px 0; }
                .season-trend { font-size: 12px; font-weight: 600; }
                
                .recommendations-list { margin: 15px 0; }
                .recommendation-item { margin: 15px 0; padding: 15px; border-radius: 8px; }
                .recommendation-item.high { background: #fee2e2; border-left: 4px solid #ef4444; }
                .recommendation-item.medium { background: #fef3c7; border-left: 4px solid #f59e0b; }
                .recommendation-item.low { background: #dbeafe; border-left: 4px solid #3b82f6; }
                .rec-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
                .rec-icon { font-size: 18px; }
                
                .report-actions { text-align: center; margin: 30px 0; padding: 20px; border-top: 2px solid #e5e7eb; }
                .report-actions .btn { margin: 0 10px; }
                
                .positive { color: #10b981; }
                .negative { color: #ef4444; }                @media (max-width: 768px) {
                    .summary-grid { grid-template-columns: 1fr; }
                    .financial-statements { grid-template-columns: 1fr; }
                    .report-tabs { flex-direction: column; }
                    .tab-btn { border-bottom: none; border-left: 2px solid transparent; padding: 8px 15px; }
                    .tab-btn.active { border-left-color: #3b82f6; border-bottom: none; }
                    
                    /* Responsive tables */
                    .monthly-table-wrapper { overflow-x: auto; }
                    .report-table { min-width: 800px; }
                    .financial-table { font-size: 14px; }
                    
                    /* Responsive cards */
                    .summary-card { margin-bottom: 15px; }
                    .card-value { font-size: 1.5em; }
                    .card-header { flex-direction: column; align-items: flex-start; gap: 5px; }
                    .trend-icon { align-self: flex-end; }
                    
                    /* Responsive ratios grid */
                    .ratios-grid { grid-template-columns: repeat(2, 1fr); }
                    .season-grid { grid-template-columns: 1fr; }
                    
                    /* Responsive recommendations */
                    .recommendation-item { margin: 10px 0; padding: 10px; }
                    .rec-header { flex-direction: column; align-items: flex-start; gap: 5px; }
                    
                    /* Responsive pour analytics */
                    .analytics-content { padding: 15px; }
                    .seasonality-analysis { margin: 20px 0; }
                    .season-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
                    
                    /* Responsive pour insights */
                    .key-insights { margin: 20px 0; padding: 15px; }
                    .insight-item { flex-direction: row; align-items: center; }
                }
                
                @media (max-width: 600px) {
                    /* Breakpoint intermédiaire pour tablettes en portrait */
                    .reports-container { padding: 15px; }
                    .report-tabs { gap: 5px; }
                    .tab-btn { padding: 8px 12px; font-size: 14px; }
                    
                    .summary-card { padding: 18px; }
                    .card-value { font-size: 1.4em; }
                    .card-header h5 { font-size: 13px; }
                    
                    .ratios-grid { grid-template-columns: 1fr; gap: 12px; }
                    .ratio-card { padding: 12px; }
                    .ratio-value { font-size: 1.3em; }
                    
                    .season-grid { grid-template-columns: 1fr; gap: 12px; }
                    .season-card { padding: 12px; }
                    .season-value { font-size: 1.2em; }
                    
                    .financial-table td { padding: 7px 10px; font-size: 13px; }
                    .amount { font-size: 12px; }
                    
                    .recommendation-item { padding: 12px; font-size: 14px; }
                    .rec-icon { font-size: 17px; }
                }
                  @media (max-width: 480px) {
                    .reports-container { padding: 10px; }
                    .summary-grid { gap: 10px; }
                    .summary-card { padding: 15px; }
                    .card-value { font-size: 1.3em; }
                    .report-table th, .report-table td { padding: 8px; font-size: 12px; }
                    .ratios-grid { grid-template-columns: 1fr; }
                    .report-actions .btn { display: block; width: 100%; margin: 5px 0; }
                    
                    /* Responsive pour les analyses avancées */
                    .analytics-content { padding: 10px; }
                    .trend-analysis { margin: 15px 0; }
                    .trend-charts { height: 250px; }
                    .season-grid { grid-template-columns: 1fr; gap: 10px; }
                    .season-card { padding: 12px; }
                    .season-value { font-size: 1.1em; }
                    
                    /* Responsive pour les recommandations */
                    .recommendations-list { margin: 10px 0; }
                    .recommendation-item { 
                        margin: 8px 0; 
                        padding: 12px; 
                        font-size: 14px;
                    }
                    .rec-header { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        gap: 5px; 
                        margin-bottom: 6px;
                    }
                    .rec-icon { font-size: 16px; }
                    
                    /* Responsive pour les états financiers */
                    .financial-statements { 
                        grid-template-columns: 1fr; 
                        gap: 20px; 
                    }
                    .statement-section { margin-bottom: 20px; }
                    .financial-table { font-size: 12px; }
                    .financial-table td { padding: 6px 8px; }
                    .amount { font-size: 11px; }
                    
                    /* Responsive pour les insights */
                    .key-insights { 
                        margin: 15px 0; 
                        padding: 15px; 
                    }
                    .insights-list { margin: 10px 0; }
                    .insight-item { 
                        padding: 6px 0; 
                        flex-direction: column; 
                        align-items: flex-start; 
                        gap: 5px;
                    }
                    .insight-text { font-size: 13px; }
                    
                    /* Responsive pour les graphiques */
                    .monthly-chart-container { 
                        padding: 10px; 
                        margin: 10px 0; 
                    }
                    .trend-charts canvas { height: 200px !important; }
                }
            </style>
        `;
        
        const modal = this.createModal('📋 Rapports Financiers', content, 'large');
        this.modals.push(modal);
        
        // Créer les graphiques après l'affichage du modal
        setTimeout(() => {
            this.createMonthlyReportChart(reportData.monthlyData);
            this.createTrendAnalysisChart(reportData.trendData);
        }, 100);
    },
    
    generateReportData(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        const previousYearData = data[currentYear - 1] || [];
        
        // Calculer les données mensuelles
        const monthlyData = currentYearData.map((month, index) => {
            const revenue = month.revenue || 0;
            const losses = month.losses || 0;
            const purchases = month.purchases || 0;
            const expenses = losses + purchases;
            const grossProfit = revenue - expenses;
            const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            const margin = revenue > 0 ? (netProfit / revenue * 100) : 0;
            
            // Évaluation de la performance
            let performance = { level: 'poor', label: 'Faible' };
            if (margin >= 20) performance = { level: 'excellent', label: 'Excellent' };
            else if (margin >= 10) performance = { level: 'good', label: 'Bon' };
            else if (margin >= 0) performance = { level: 'average', label: 'Moyen' };
            
            return {
                name: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][index],
                revenue, losses, purchases, expenses, grossProfit, taxes, netProfit, margin, performance
            };
        });
        
        // Calculer les totaux et tendances
        const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
        const totalProfit = monthlyData.reduce((sum, m) => sum + m.netProfit, 0);
        const prevTotalRevenue = previousYearData.reduce((sum, m) => sum + (m.revenue || 0), 0);
        const prevTotalProfit = previousYearData.reduce((sum, m) => {
            const gross = (m.revenue || 0) - (m.losses || 0) - (m.purchases || 0);
            return sum + gross - (gross > 0 ? gross * config.taxRate / 100 : 0);
        }, 0);
        
        const revenueTrend = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100) : 0;
        const profitTrend = prevTotalProfit !== 0 ? ((totalProfit - prevTotalProfit) / Math.abs(prevTotalProfit) * 100) : 0;
        const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
        const prevNetMargin = prevTotalRevenue > 0 ? (prevTotalProfit / prevTotalRevenue * 100) : 0;
        const marginTrend = netMargin - prevNetMargin;
        
        // Score d'efficacité
        const efficiency = Math.min(10, Math.max(0, Math.round(netMargin / 2)));
        
        // Générer des insights
        const insights = this.generateInsights(monthlyData, { revenueTrend, profitTrend, netMargin });
        
        return {
            summary: {
                totalRevenue,
                totalProfit,
                netMargin,
                efficiency,
                revenueTrend,
                profitTrend,
                marginTrend
            },
            monthlyData,
            financial: {
                revenue: totalRevenue,
                losses: monthlyData.reduce((sum, m) => sum + m.losses, 0),
                purchases: monthlyData.reduce((sum, m) => sum + m.purchases, 0),
                grossProfit: monthlyData.reduce((sum, m) => sum + m.grossProfit, 0),
                taxes: monthlyData.reduce((sum, m) => sum + m.taxes, 0),
                netProfit: totalProfit
            },
            ratios: {
                grossMargin: totalRevenue > 0 ? (monthlyData.reduce((sum, m) => sum + m.grossProfit, 0) / totalRevenue * 100) : 0,
                netMargin,
                expenseRatio: totalRevenue > 0 ? (monthlyData.reduce((sum, m) => sum + m.expenses, 0) / totalRevenue * 100) : 0,
                avgMonthlyROI: monthlyData.reduce((sum, m) => sum + m.margin, 0) / 12
            },
            seasonality: this.calculateSeasonality(monthlyData),
            recommendations: this.generateRecommendations(monthlyData, { netMargin, revenueTrend }),
            insights,
            trendData: monthlyData.map(m => ({ month: m.name, revenue: m.revenue, profit: m.netProfit }))
        };
    },
    
    generateInsights(monthlyData, trends) {
        const insights = [];
        
        if (trends.revenueTrend > 10) {
            insights.push({ type: 'positive', icon: '🚀', message: 'Excellente croissance du chiffre d\'affaires (+' + trends.revenueTrend.toFixed(1) + '%)' });
        } else if (trends.revenueTrend < -5) {
            insights.push({ type: 'negative', icon: '⚠️', message: 'Baisse du chiffre d\'affaires (' + trends.revenueTrend.toFixed(1) + '%)' });
        }
        
        if (trends.netMargin > 15) {
            insights.push({ type: 'positive', icon: '💎', message: 'Marge nette excellente (' + trends.netMargin.toFixed(1) + '%)' });
        } else if (trends.netMargin < 5) {
            insights.push({ type: 'warning', icon: '📊', message: 'Marge nette faible, optimisation possible' });
        }
        
        const profitableMonths = monthlyData.filter(m => m.netProfit > 0).length;
        if (profitableMonths >= 10) {
            insights.push({ type: 'positive', icon: '📈', message: profitableMonths + ' mois rentables sur 12' });
        } else if (profitableMonths < 6) {
            insights.push({ type: 'negative', icon: '📉', message: 'Seulement ' + profitableMonths + ' mois rentables' });
        }
        
        return insights;
    },
    
    calculateSeasonality(monthlyData) {
        const quarters = [
            { name: 'T1 (Jan-Mar)', months: [0, 1, 2] },
            { name: 'T2 (Avr-Jun)', months: [3, 4, 5] },
            { name: 'T3 (Jul-Sep)', months: [6, 7, 8] },
            { name: 'T4 (Oct-Déc)', months: [9, 10, 11] }
        ];
        
        return quarters.map(quarter => {
            const quarterData = quarter.months.map(i => monthlyData[i] || { revenue: 0 });
            const avgRevenue = quarterData.reduce((sum, m) => sum + m.revenue, 0) / 3;
            const totalAvg = monthlyData.reduce((sum, m) => sum + m.revenue, 0) / 12;
            const trend = totalAvg > 0 ? ((avgRevenue - totalAvg) / totalAvg * 100) : 0;
            
            return { ...quarter, avgRevenue, trend };
        });
    },
    
    generateRecommendations(monthlyData, metrics) {
        const recommendations = [];
        
        if (metrics.netMargin < 10) {
            recommendations.push({
                priority: 'high',
                icon: '🎯',
                title: 'Optimiser la Rentabilité',
                description: 'Votre marge nette est inférieure à 10%. Considérez une révision des prix ou une réduction des coûts.'
            });
        }
        
        if (metrics.revenueTrend < 0) {
            recommendations.push({
                priority: 'high',
                icon: '📈',
                title: 'Stimuler la Croissance',
                description: 'Le chiffre d\'affaires est en baisse. Renforcez vos actions commerciales et marketing.'
            });
        }
        
        const volatility = this.calculateVolatility(monthlyData.map(m => m.revenue));
        if (volatility > 0.3) {
            recommendations.push({
                priority: 'medium',
                icon: '📊',
                title: 'Stabiliser les Revenus',
                description: 'Vos revenus sont volatils. Diversifiez vos sources de revenus pour plus de stabilité.'
            });
        }
        
        recommendations.push({
            priority: 'low',
            icon: '🔍',
            title: 'Analyse Continue',
            description: 'Continuez à surveiller vos indicateurs clés et ajustez votre stratégie en conséquence.'
        });
        
        return recommendations;
    },
    
    calculateVolatility(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return mean > 0 ? Math.sqrt(variance) / mean : 0;
    },
    
    showReportTab(tabName, e) {
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedTab = document.getElementById(`${tabName}-report`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (e && e.target) {
            e.target.classList.add('active');
        }
    },
    
    createMonthlyReportChart(monthlyData) {
        if (typeof Chart === 'undefined') return;
        
        const canvas = document.getElementById('monthlyReportChart');
        if (!canvas) return;
        
        if (this.charts.monthlyReport) {
            this.charts.monthlyReport.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.monthlyReport = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(m => m.name.substring(0, 3)),
                datasets: [
                    {
                        label: 'Chiffre d\'Affaires',
                        data: monthlyData.map(m => m.revenue),
                        borderColor: '#10b981',
                        backgroundColor: '#10b98120',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Bénéfice Net',
                        data: monthlyData.map(m => m.netProfit),
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
    },
    
    createTrendAnalysisChart(trendData) {
        if (typeof Chart === 'undefined') return;
        
        const canvas = document.getElementById('trendAnalysisChart');
        if (!canvas) return;
        
        if (this.charts.trendAnalysis) {
            this.charts.trendAnalysis.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.trendAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: trendData.map(m => m.month.substring(0, 3)),
                datasets: [
                    {
                        label: 'Marge Mensuelle (%)',
                        data: trendData.map(m => m.revenue > 0 ? (m.profit / m.revenue * 100) : 0),
                        backgroundColor: '#8b5cf6',
                        borderColor: '#7c3aed',
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
                        text: 'Évolution de la Marge Nette'
                    }
                },
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
    },    exportToExcel() {
        // Fonction d'export Excel améliorée
        const generateExcel = () => {
            try {
                const wb = XLSX.utils.book_new();
                const reportData = this.getCurrentReportData();
                
                // Feuille 1: Résumé Exécutif
                if (reportData.summary) {
                    const summaryData = [
                        ['📊 RÉSUMÉ EXÉCUTIF', '', ''],
                        ['Rapport généré le:', new Date().toLocaleDateString('fr-FR'), ''],
                        ['', '', ''],
                        ['Indicateur', 'Valeur', 'Évolution'],
                        ...Object.entries(reportData.summary).map(([key, value]) => [
                            key, 
                            value, 
                            reportData.trends && reportData.trends[key] ? reportData.trends[key] : ''
                        ])
                    ];
                    
                    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
                    
                    // Appliquer un style basique
                    summaryWS['!cols'] = [
                        { width: 25 },
                        { width: 20 },
                        { width: 15 }
                    ];
                    
                    XLSX.utils.book_append_sheet(wb, summaryWS, 'Résumé Exécutif');
                }
                
                // Feuille 2: Données Mensuelles
                if (reportData.monthly && reportData.monthly.length > 0) {
                    const monthlyData = [
                        ['📅 DONNÉES MENSUELLES'],
                        [''],
                        ['Mois', 'Chiffre d\'Affaires', 'Charges', 'Bénéfice Brut', 'Charges Sociales', 'Bénéfice Net', 'Marge %', 'Performance'],
                        ...reportData.monthly
                    ];
                    
                    const monthlyWS = XLSX.utils.aoa_to_sheet(monthlyData);
                    monthlyWS['!cols'] = [
                        { width: 12 },
                        { width: 15 },
                        { width: 12 },
                        { width: 15 },
                        { width: 15 },
                        { width: 15 },
                        { width: 10 },
                        { width: 12 }
                    ];
                    
                    XLSX.utils.book_append_sheet(wb, monthlyWS, 'Données Mensuelles');
                }
                
                // Feuille 3: Ratios Financiers
                if (reportData.ratios) {
                    const ratiosData = [
                        ['📈 RATIOS FINANCIERS'],
                        [''],
                        ['Ratio', 'Valeur', 'Interprétation'],
                        ...Object.entries(reportData.ratios).map(([key, value]) => [
                            key,
                            typeof value === 'number' ? value.toFixed(2) + '%' : value,
                            this.interpretRatio(key, value)
                        ])
                    ];
                    
                    const ratiosWS = XLSX.utils.aoa_to_sheet(ratiosData);
                    ratiosWS['!cols'] = [
                        { width: 20 },
                        { width: 12 },
                        { width: 25 }
                    ];
                    
                    XLSX.utils.book_append_sheet(wb, ratiosWS, 'Ratios Financiers');
                }
                
                // Télécharger le fichier Excel
                const fileName = `rapport-financier-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                // Notification de succès
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('📊 Rapport Excel généré avec succès!', 'success');
                }
                
            } catch (error) {
                console.error('Erreur génération Excel:', error);
                this.fallbackExcelExport();
            }
        };
        
        // Vérifier si XLSX est disponible
        if (typeof XLSX !== 'undefined') {
            generateExcel();
        } else {
            // Charger XLSX dynamiquement
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('📊 Chargement de la bibliothèque Excel...', 'info');
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = generateExcel;
            script.onerror = () => this.fallbackExcelExport();
            document.head.appendChild(script);
        }
    },
    
    fallbackExcelExport() {
        // Fallback : export CSV
        try {
            const csvContent = this.generateAdvancedCSV();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `rapport-financier-${new Date().getFullYear()}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('📄 Rapport CSV généré (Excel non disponible)', 'info');
                }
            } else {
                throw new Error('Téléchargement non supporté');
            }
        } catch (error) {
            console.error('Erreur export CSV:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('❌ Erreur lors de l\'export', 'error');
            }
        }
    },
    
    getCurrentReportData() {
        // Extraire les données actuelles du rapport affiché
        const modal = document.querySelector('.reports-container');
        if (!modal) return {};
        
        const data = { summary: {}, monthly: [], ratios: {} };
        
        // Extraire les données du résumé
        const summaryCards = modal.querySelectorAll('.summary-card');
        summaryCards.forEach(card => {
            const title = card.querySelector('h5')?.textContent?.replace(/[📊💰📈⚡]/g, '').trim() || '';
            const value = card.querySelector('.card-value')?.textContent?.trim() || '';
            const change = card.querySelector('.card-change')?.textContent?.trim() || '';
            
            if (title && value) {
                data.summary[title] = value + (change ? ` (${change})` : '');
            }
        });
        
        // Extraire les données mensuelles
        const monthlyTable = modal.querySelector('.report-table');
        if (monthlyTable) {
            const rows = monthlyTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    const rowData = Array.from(cells).map(cell => {
                        // Nettoyer le texte et enlever les badges HTML
                        let text = cell.textContent.trim();
                        // Enlever les badges de performance
                        text = text.replace(/ExcellentBonMoyenFaible/g, '');
                        return text;
                    });
                    data.monthly.push(rowData);
                }
            });
        }
        
        // Extraire les ratios
        const ratioCards = modal.querySelectorAll('.ratio-card');
        ratioCards.forEach(card => {
            const label = card.querySelector('.ratio-label')?.textContent?.trim() || '';
            const value = card.querySelector('.ratio-value')?.textContent?.trim() || '';
            
            if (label && value) {
                data.ratios[label] = value;
            }
        });
        
        return data;
    },
      generateAdvancedCSV() {
        const data = this.getCurrentReportData();
        const BOM = '\uFEFF'; // UTF-8 BOM pour Excel
        let csv = BOM + `Rapport Financier - ${new Date().getFullYear()}\n`;
        csv += `Généré le,${new Date().toLocaleDateString('fr-FR')}\n\n`;
        
        // Section Résumé
        csv += 'RÉSUMÉ EXÉCUTIF\n';
        csv += 'Indicateur,Valeur\n';
        Object.entries(data.summary).forEach(([key, value]) => {
            csv += `"${key}","${value}"\n`;
        });
        csv += '\n';
        
        // Section Données Mensuelles
        if (data.monthly.length > 0) {
            csv += 'DONNÉES MENSUELLES\n';
            csv += 'Mois,Chiffre d\'Affaires,Charges,Bénéfice Brut,Charges Sociales,Bénéfice Net,Marge %,Performance\n';
            data.monthly.forEach(row => {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });
            csv += '\n';
        }
        
        // Section Ratios
        if (Object.keys(data.ratios).length > 0) {
            csv += 'RATIOS FINANCIERS\n';
            csv += 'Ratio,Valeur,Interprétation\n';
            Object.entries(data.ratios).forEach(([key, value]) => {
                csv += `"${key}","${value}","${this.interpretRatio(key, value)}"\n`;
            });
        }
        
        return csv;
    },
    
    interpretRatio(ratioName, value) {
        const numValue = parseFloat(value);
        
        switch (ratioName.toLowerCase()) {
            case 'marge brute':
                if (numValue > 50) return 'Excellente';
                if (numValue > 30) return 'Bonne';
                if (numValue > 15) return 'Correcte';
                return 'Faible';
                
            case 'marge nette':
                if (numValue > 15) return 'Très rentable';
                if (numValue > 8) return 'Rentable';
                if (numValue > 3) return 'Acceptable';
                return 'Problématique';
                
            case 'taux de charges':
                if (numValue < 30) return 'Maîtrisé';
                if (numValue < 50) return 'Correct';
                if (numValue < 70) return 'Élevé';
                return 'Critique';
                
            default:
                return 'Non évalué';
        }
    },
      printReport() {
        window.print();
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    closeAllModals() {
        this.modals.forEach(modal => modal.remove());
        this.modals = [];
    },
    
    createModal(title, content, size = '') {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content ${size ? 'modal-' + size : ''}">
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

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }
};

// Ajouter tous les modules à la portée globale
window.BudgetModule = BudgetModule;
window.ReportsModule = ReportsModule;

console.log('✅ Modules chargés:', {
    ForecastModule: typeof ForecastModule !== 'undefined',
    BudgetModule: typeof BudgetModule !== 'undefined', 
    ReportsModule: typeof ReportsModule !== 'undefined'
});