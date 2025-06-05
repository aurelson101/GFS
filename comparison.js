/**
 * Module de Comparaison d'Années - Version Complète et Fonctionnelle
 * Analyses comparatives et visualisations avancées
 */

const ComparisonModule = {
    allData: null,
    config: null,
    comparisonChart: null,

    /**
     * Afficher le panneau de comparaison
     */
    showComparison: function(data, config) {
        console.log('🔍 Ouverture du module de comparaison');
        
        const availableYears = Object.keys(data).map(y => parseInt(y)).sort();
        
        if (availableYears.length < 2) {
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Au moins 2 années sont nécessaires pour la comparaison', 'warning');
            }
            return;
        }

        // Sauvegarder les données pour les mises à jour
        this.allData = data;
        this.config = config;

        const content = this.generateComparisonContent(availableYears);
        
        const modal = this.createComparisonModal('🔍 Comparaison d\'Années', content);
        
        // Initialiser les graphiques après un délai
        setTimeout(() => {
            this.updateComparison();
        }, 300);
    },

    /**
     * Créer le modal de comparaison
     */
    createComparisonModal: function(title, content) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal comparison-modal';
        modal.innerHTML = `
            <div class="modal-content modal-comparison">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success export-comparison-btn">📊 Export Rapport</button>
                    <button class="btn btn-secondary close-modal">Fermer</button>
                </div>
            </div>
        `;

        // Ajouter les styles CSS
        this.addComparisonStyles(modal);

        // Gestionnaires d'événements
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.comparisonChart) {
                    this.comparisonChart.destroy();
                    this.comparisonChart = null;
                }
                modal.remove();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (this.comparisonChart) {
                    this.comparisonChart.destroy();
                    this.comparisonChart = null;
                }
                modal.remove();
            }
        });

        // Export
        const exportBtn = modal.querySelector('.export-comparison-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportComparison());
        }

        document.body.appendChild(modal);
        return modal;
    },

    /**
     * Générer le contenu de comparaison
     */
    generateComparisonContent: function(availableYears) {
        const year1 = availableYears[availableYears.length - 2] || availableYears[0];
        const year2 = availableYears[availableYears.length - 1];

        return `
            <div class="comparison-dashboard">
                <div class="comparison-controls">
                    <div class="year-selector">
                        <div class="selector-group">
                            <label for="year1Select">Année 1:</label>
                            <select id="year1Select">
                                ${availableYears.map(year => 
                                    `<option value="${year}" ${year === year1 ? 'selected' : ''}>${year}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="selector-group">
                            <label for="year2Select">Année 2:</label>
                            <select id="year2Select">
                                ${availableYears.map(year => 
                                    `<option value="${year}" ${year === year2 ? 'selected' : ''}>${year}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <button id="updateComparisonBtn" class="btn btn-primary">🔄 Comparer</button>
                    </div>
                </div>
                
                <div id="comparison-content">
                    <div class="loading-message">
                        <div class="spinner"></div>
                        <p>Chargement de la comparaison...</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Mettre à jour la comparaison
     */
    updateComparison: function() {
        const year1Select = document.getElementById('year1Select');
        const year2Select = document.getElementById('year2Select');
        
        if (!year1Select || !year2Select) {
            console.error('Sélecteurs d\'années non trouvés');
            return;
        }

        const year1 = parseInt(year1Select.value);
        const year2 = parseInt(year2Select.value);
        
        if (year1 === year2) {
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Veuillez sélectionner deux années différentes', 'warning');
            }
            return;
        }

        console.log(`🔄 Comparaison ${year1} vs ${year2}`);
        
        const content = this.renderComparison(year1, year2);
        document.getElementById('comparison-content').innerHTML = content;
        
        // Configurer le bouton de mise à jour
        const updateBtn = document.getElementById('updateComparisonBtn');
        if (updateBtn) {
            updateBtn.onclick = () => this.updateComparison();
        }
        
        // Initialiser les graphiques après un délai
        setTimeout(() => {
            this.initComparisonCharts(year1, year2);
        }, 100);
    },

    /**
     * Rendu de la comparaison
     */
    renderComparison: function(year1, year2) {
        const data1 = this.allData[year1] || [];
        const data2 = this.allData[year2] || [];
        
        const stats1 = this.calculateYearStats(data1);
        const stats2 = this.calculateYearStats(data2);
        
        const comparison = this.compareYears(stats1, stats2);

        return `
            <div class="comparison-results">
                <!-- Résumé comparatif -->
                <div class="comparison-summary">
                    <h4>📊 Résumé Comparatif: ${year1} vs ${year2}</h4>
                    <div class="summary-grid">
                        ${this.renderSummaryCard('💰', 'Revenus', stats1.totalRevenue, stats2.totalRevenue, comparison.revenue)}
                        ${this.renderSummaryCard('📈', 'Bénéfices Net', stats1.totalNetProfit, stats2.totalNetProfit, comparison.profit)}
                        ${this.renderSummaryCard('📊', 'Marge (%)', stats1.profitMargin, stats2.profitMargin, comparison.margin, true)}
                        ${this.renderSummaryCard('💸', 'Dépenses', stats1.totalExpenses, stats2.totalExpenses, comparison.expenses)}
                    </div>
                </div>
                
                <!-- Graphique de comparaison -->
                <div class="comparison-chart-container">
                    <h4>📊 Comparaison Visuelle</h4>
                    <canvas id="comparisonChart" width="800" height="400"></canvas>
                </div>
                
                <!-- Analyse mensuelle -->
                <div class="monthly-comparison">
                    <h4>📅 Comparaison Mensuelle</h4>
                    <div class="monthly-table-container">
                        <table class="monthly-comparison-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>${year1} - Revenus</th>
                                    <th>${year2} - Revenus</th>
                                    <th>Évolution</th>
                                    <th>${year1} - Bénéfices</th>
                                    <th>${year2} - Bénéfices</th>
                                    <th>Évolution</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderMonthlyComparison(data1, data2, year1, year2)}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Insights comparatifs -->
                <div class="comparison-insights">
                    <h4>💡 Insights Comparatifs</h4>
                    ${this.generateComparisonInsights(comparison, stats1, stats2, year1, year2)}
                </div>
            </div>
        `;
    },

    /**
     * Rendu d'une carte de résumé
     */
    renderSummaryCard: function(icon, title, value1, value2, change, isPercentage = false) {
        const formatValue = (val) => {
            if (isPercentage) {
                return val.toFixed(1) + '%';
            }
            return this.formatCurrency(val);
        };

        return `
            <div class="summary-card">
                <h5>${icon} ${title}</h5>
                <div class="comparison-values">
                    <div class="year-value">
                        <span class="year-label">Année 1:</span>
                        <span class="value ${!isPercentage && value1 >= 0 ? 'positive' : !isPercentage && value1 < 0 ? 'negative' : ''}">${formatValue(value1)}</span>
                    </div>
                    <div class="year-value">
                        <span class="year-label">Année 2:</span>
                        <span class="value ${!isPercentage && value2 >= 0 ? 'positive' : !isPercentage && value2 < 0 ? 'negative' : ''}">${formatValue(value2)}</span>
                    </div>
                    <div class="change-indicator ${change.type}">
                        ${change.icon} ${change.text}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Calculer les statistiques d'une année
     */
    calculateYearStats: function(yearData) {
        const monthlyStats = yearData.map(month => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * this.config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            return {
                month: month.month,
                revenue: month.revenue,
                losses: month.losses,
                purchases: month.purchases,
                grossProfit,
                taxes,
                netProfit,
                totalExpenses: month.losses + month.purchases
            };
        });
        
        const totals = monthlyStats.reduce((acc, month) => ({
            revenue: acc.revenue + month.revenue,
            losses: acc.losses + month.losses,
            purchases: acc.purchases + month.purchases,
            grossProfit: acc.grossProfit + month.grossProfit,
            taxes: acc.taxes + month.taxes,
            netProfit: acc.netProfit + month.netProfit,
            totalExpenses: acc.totalExpenses + month.totalExpenses
        }), { revenue: 0, losses: 0, purchases: 0, grossProfit: 0, taxes: 0, netProfit: 0, totalExpenses: 0 });
        
        return {
            monthlyStats,
            totalRevenue: totals.revenue,
            totalLosses: totals.losses,
            totalPurchases: totals.purchases,
            totalGrossProfit: totals.grossProfit,
            totalTaxes: totals.taxes,
            totalNetProfit: totals.netProfit,
            totalExpenses: totals.totalExpenses,
            profitMargin: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0,
            expenseRatio: totals.revenue > 0 ? (totals.totalExpenses / totals.revenue) * 100 : 0
        };
    },

    /**
     * Comparer deux années
     */
    compareYears: function(stats1, stats2) {
        const calculateChange = (val1, val2) => {
            if (val1 === 0) return val2 > 0 ? { percentage: 100, type: 'positive' } : { percentage: 0, type: 'neutral' };
            const change = ((val2 - val1) / Math.abs(val1)) * 100;
            return {
                percentage: Math.abs(change),
                type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
            };
        };
        
        const formatChange = (change) => {
            const icon = change.type === 'positive' ? '📈' : change.type === 'negative' ? '📉' : '➡️';
            const sign = change.type === 'positive' ? '+' : change.type === 'negative' ? '-' : '';
            return {
                icon,
                text: `${sign}${change.percentage.toFixed(1)}%`,
                type: change.type
            };
        };
        
        return {
            revenue: formatChange(calculateChange(stats1.totalRevenue, stats2.totalRevenue)),
            profit: formatChange(calculateChange(stats1.totalNetProfit, stats2.totalNetProfit)),
            margin: formatChange(calculateChange(stats1.profitMargin, stats2.profitMargin)),
            expenses: formatChange(calculateChange(stats1.totalExpenses, stats2.totalExpenses))
        };
    },

    /**
     * Rendu de la comparaison mensuelle
     */
    renderMonthlyComparison: function(data1, data2, year1, year2) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        return months.map((month, index) => {
            const month1 = data1[index] || { revenue: 0, losses: 0, purchases: 0 };
            const month2 = data2[index] || { revenue: 0, losses: 0, purchases: 0 };
            
            const profit1 = month1.revenue - month1.losses - month1.purchases;
            const netProfit1 = profit1 - (profit1 > 0 ? profit1 * this.config.taxRate / 100 : 0);
            
            const profit2 = month2.revenue - month2.losses - month2.purchases;
            const netProfit2 = profit2 - (profit2 > 0 ? profit2 * this.config.taxRate / 100 : 0);
            
            const revenueEvolution = month1.revenue > 0 ? ((month2.revenue - month1.revenue) / month1.revenue) * 100 : 0;
            const profitEvolution = Math.abs(netProfit1) > 0 ? ((netProfit2 - netProfit1) / Math.abs(netProfit1)) * 100 : 0;
            
            return `
                <tr>
                    <td><strong>${month}</strong></td>
                    <td>${this.formatCurrency(month1.revenue)}</td>
                    <td>${this.formatCurrency(month2.revenue)}</td>
                    <td class="${revenueEvolution >= 0 ? 'positive' : 'negative'}">
                        ${revenueEvolution >= 0 ? '+' : ''}${revenueEvolution.toFixed(1)}%
                    </td>
                    <td class="${netProfit1 >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit1)}</td>
                    <td class="${netProfit2 >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit2)}</td>
                    <td class="${profitEvolution >= 0 ? 'positive' : 'negative'}">
                        ${profitEvolution >= 0 ? '+' : ''}${profitEvolution.toFixed(1)}%
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Générer des insights comparatifs
     */
    generateComparisonInsights: function(comparison, stats1, stats2, year1, year2) {
        const insights = [];
        
        // Analyse des revenus
        if (comparison.revenue.type === 'positive') {
            insights.push({
                type: 'success',
                icon: '💰',
                message: `Excellente progression ! Vos revenus ont augmenté de ${comparison.revenue.text.replace('+', '')} par rapport à ${year1}.`
            });
        } else if (comparison.revenue.type === 'negative') {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: `Attention : vos revenus ont diminué de ${comparison.revenue.text.replace('-', '')} par rapport à ${year1}.`
            });
        }
        
        // Analyse des bénéfices
        if (comparison.profit.type === 'positive') {
            insights.push({
                type: 'success',
                icon: '📈',
                message: `Rentabilité en hausse ! Vos bénéfices nets ont progressé de ${comparison.profit.text.replace('+', '')}.`
            });
        } else if (comparison.profit.type === 'negative') {
            insights.push({
                type: 'danger',
                icon: '📉',
                message: `Baisse de rentabilité : vos bénéfices ont chuté de ${comparison.profit.text.replace('-', '')}.`
            });
        }
        
        // Générer des recommandations
        const recommendations = [];
        
        if (stats2.profitMargin < 10) {
            recommendations.push('Améliorer la marge en optimisant les prix ou réduisant les coûts');
        }
        
        if (stats2.expenseRatio > 70) {
            recommendations.push('Réduire le ratio de dépenses qui est élevé');
        }
        
        if (comparison.revenue.type === 'negative') {
            recommendations.push('Développer de nouvelles sources de revenus');
        }

        return `
            <div class="insights-grid">
                ${insights.map(insight => `
                    <div class="insight-item ${insight.type}">
                        <span class="insight-icon">${insight.icon}</span>
                        <span class="insight-text">${insight.message}</span>
                    </div>
                `).join('')}
            </div>
            
            ${recommendations.length > 0 ? `
                <div class="recommendations">
                    <h5>🎯 Recommandations Stratégiques</h5>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    },

    /**
     * Initialiser les graphiques de comparaison
     */
    initComparisonCharts: function(year1, year2) {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas || typeof Chart === 'undefined') {
            console.warn('Canvas ou Chart.js non disponible');
            return;
        }
        
        // Détruire le graphique existant
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }
        
        const data1 = this.allData[year1] || [];
        const data2 = this.allData[year2] || [];
        
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        const revenues1 = months.map((_, index) => data1[index]?.revenue || 0);
        const revenues2 = months.map((_, index) => data2[index]?.revenue || 0);
        
        const profits1 = months.map((_, index) => {
            const month = data1[index] || { revenue: 0, losses: 0, purchases: 0 };
            const gross = month.revenue - month.losses - month.purchases;
            return gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        });
        
        const profits2 = months.map((_, index) => {
            const month = data2[index] || { revenue: 0, losses: 0, purchases: 0 };
            const gross = month.revenue - month.losses - month.purchases;
            return gross - (gross > 0 ? gross * this.config.taxRate / 100 : 0);
        });
        
        try {
            const ctx = canvas.getContext('2d');
            this.comparisonChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: `Revenus ${year1}`,
                            data: revenues1,
                            borderColor: '#3b82f6',
                            backgroundColor: '#3b82f620',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: `Revenus ${year2}`,
                            data: revenues2,
                            borderColor: '#10b981',
                            backgroundColor: '#10b98120',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: `Bénéfices ${year1}`,
                            data: profits1,
                            borderColor: '#f59e0b',
                            backgroundColor: '#f59e0b20',
                            tension: 0.4,
                            fill: false,
                            borderDash: [5, 5]
                        },
                        {
                            label: `Bénéfices ${year2}`,
                            data: profits2,
                            borderColor: '#ef4444',
                            backgroundColor: '#ef444420',
                            tension: 0.4,
                            fill: false,
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Comparaison ${year1} vs ${year2}`,
                            font: { size: 16 }
                        },
                        legend: {
                            display: true,
                            position: 'top'
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
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            console.log('✅ Graphique de comparaison initialisé');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du graphique:', error);
        }
    },

    /**
     * Exporter le rapport de comparaison
     */
    exportComparison: function() {
        const year1Select = document.getElementById('year1Select');
        const year2Select = document.getElementById('year2Select');
        
        if (!year1Select || !year2Select) return;

        const year1 = parseInt(year1Select.value);
        const year2 = parseInt(year2Select.value);
        
        const stats1 = this.calculateYearStats(this.allData[year1] || []);
        const stats2 = this.calculateYearStats(this.allData[year2] || []);
        const comparison = this.compareYears(stats1, stats2);
        
        const reportData = {
            title: `Rapport de Comparaison ${year1} vs ${year2}`,
            date: new Date().toLocaleDateString('fr-FR'),
            years: { year1, year2 },
            summary: {
                [year1]: {
                    revenue: stats1.totalRevenue,
                    profit: stats1.totalNetProfit,
                    margin: stats1.profitMargin,
                    expenses: stats1.totalExpenses
                },
                [year2]: {
                    revenue: stats2.totalRevenue,
                    profit: stats2.totalNetProfit,
                    margin: stats2.profitMargin,
                    expenses: stats2.totalExpenses
                }
            },
            changes: comparison,
            monthlyData: {
                [year1]: stats1.monthlyStats,
                [year2]: stats2.monthlyStats
            }
        };
        
        // Export JSON
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparaison_${year1}_vs_${year2}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification('Rapport de comparaison exporté', 'success');
        }
    },

    /**
     * Formatage des devises
     */
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Ajouter les styles CSS
     */
    addComparisonStyles: function(modal) {
        const style = document.createElement('style');
        style.textContent = `
            .comparison-modal .modal-content {
                width: 95%;
                max-width: 1400px;
                height: 90vh;
                max-height: 90vh;
                margin: 5vh auto;
            }

            .comparison-dashboard {
                min-height: 600px;
            }
            
            .comparison-controls {
                margin-bottom: 30px;
            }
            
            .year-selector {
                display: flex;
                gap: 20px;
                align-items: end;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .selector-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
                min-width: 120px;
            }
            
            .selector-group label {
                font-weight: 500;
                color: #374151;
            }
            
            .selector-group select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
            }
            
            .comparison-summary {
                margin-bottom: 30px;
            }
            
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 15px;
            }
            
            .summary-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #3b82f6;
            }
            
            .summary-card h5 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-weight: 600;
            }
            
            .comparison-values {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .year-value {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .year-label {
                font-weight: 500;
                color: #6b7280;
            }
            
            .value {
                font-weight: bold;
                color: #1f2937;
            }
            
            .value.positive {
                color: #059669;
            }
            
            .value.negative {
                color: #dc2626;
            }
            
            .change-indicator {
                margin-top: 10px;
                padding: 8px 12px;
                border-radius: 6px;
                font-weight: 600;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .change-indicator.positive {
                background: #ecfdf5;
                color: #059669;
            }
            
            .change-indicator.negative {
                background: #fef2f2;
                color: #dc2626;
            }
            
            .change-indicator.neutral {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .comparison-chart-container {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin: 30px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .comparison-chart-container h4 {
                margin: 0 0 20px 0;
                color: #1f2937;
            }
            
            #comparisonChart {
                max-height: 400px;
            }
            
            .monthly-comparison {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin: 30px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .monthly-table-container {
                overflow-x: auto;
                margin-top: 15px;
            }
            
            .monthly-comparison-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }
            
            .monthly-comparison-table th,
            .monthly-comparison-table td {
                padding: 10px;
                text-align: right;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .monthly-comparison-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
                position: sticky;
                top: 0;
            }
            
            .monthly-comparison-table td:first-child,
            .monthly-comparison-table th:first-child {
                text-align: left;
                font-weight: 600;
            }
            
            .comparison-insights {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin: 30px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .insights-grid {
                display: grid;
                gap: 12px;
                margin-top: 15px;
            }
            
            .insight-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                border-radius: 8px;
                font-size: 0.9rem;
            }
            
            .insight-item.success {
                background: #ecfdf5;
                border-left: 4px solid #10b981;
            }
            
            .insight-item.warning {
                background: #fffbeb;
                border-left: 4px solid #f59e0b;
            }
            
            .insight-item.danger {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
            }
            
            .insight-icon {
                font-size: 1.3rem;
            }
            
            .insight-text {
                flex: 1;
                color: #374151;
                line-height: 1.4;
            }
            
            .recommendations {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }
            
            .recommendations h5 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-weight: 600;
            }
            
            .recommendations ul {
                margin: 0;
                padding-left: 20px;
                color: #6b7280;
            }
            
            .recommendations li {
                margin-bottom: 5px;
                line-height: 1.4;
            }

            .loading-message {
                text-align: center;
                padding: 40px;
                color: #6b7280;
            }

            .spinner {
                border: 4px solid #f3f4f6;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .comparison-modal .modal-content {
                    width: 98%;
                    height: 95vh;
                    margin: 2.5vh auto;
                }

                .year-selector {
                    flex-direction: column;
                    gap: 15px;
                    align-items: stretch;
                }
                
                .selector-group {
                    width: 100%;
                }
                
                .selector-group select {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                }
                
                .summary-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .summary-card {
                    padding: 15px;
                }
                
                .comparison-chart-container {
                    padding: 15px;
                }
                
                #comparisonChart {
                    height: 250px;
                }
                
                .monthly-comparison {
                    padding: 15px;
                }
                
                .monthly-comparison-table {
                    font-size: 12px;
                }
                
                .monthly-comparison-table th,
                .monthly-comparison-table td {
                    padding: 6px 4px;
                }
                
                .comparison-insights {
                    padding: 15px;
                }
                
                .insight-item {
                    padding: 12px;
                    flex-direction: column;
                    gap: 8px;
                    text-align: center;
                }
            }
        `;

        modal.appendChild(style);
    }
};

console.log('🔍 Module de comparaison d\'années chargé et fonctionnel');