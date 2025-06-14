/**
 * Module de Comparaison d'Années - Version Complète et Fonctionnelle
 * Analyses comparatives et visualisations avancées
 */

const ComparisonModule = {
    allData: null,
    config: null,
    comparisonChart: null,    /**
     * Afficher le panneau de comparaison
     */
    showComparison: function(data, config) {
        console.log('🔍 Ouverture du module de comparaison');
        
        // Fermer tous les modals existants d'abord
        this.closeAllModals();
        
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
                    <button class="btn btn-success export-comparison-btn">📊 Export Excel</button>
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
            if (val1 == null || val2 == null) {
                return { percentage: 0, type: 'neutral' };
            }
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
    },    /**
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
        
        // Formattage monétaire amélioré pour l'export
        const formatMoney = (amount) => {
            return new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };
        
        // Version numérique pure pour les calculs
        const formatMoneyRaw = (amount) => {
            return parseFloat(amount.toFixed(0));
        };
        
        // Formattage pourcentage pour l'export
        const formatPercent = (value) => {
            return new Intl.NumberFormat('fr-FR', { 
                style: 'percent', 
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value / 100);
        };
        
        // Date de génération formatée
        const today = new Date();
        const dateStr = today.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        try {
            // Animation chargement pour l'utilisateur
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('📊 Génération du rapport Excel en cours...', 'info', 3000);
            }

            // Vérifier si XLSX est disponible
            if (typeof XLSX === 'undefined') {
                throw new Error("Bibliothèque XLSX non chargée");
            }
            
            // Créer un nouveau classeur Excel
            const wb = XLSX.utils.book_new();
            
            // Propriétés du document
            wb.Props = {
                Title: `Rapport Comparatif ${year1} vs ${year2}`,
                Subject: "Analyse financière comparative",
                Author: "Gestion Financière SAS",
                CreatedDate: new Date()
            };
            
            // Informations de l'entreprise pour le rapport
            const companyInfo = {
                name: "Gestion Financière SAS",
                period: `Rapport comparatif ${year1} vs ${year2}`,
                date: dateStr
            };
            
            // === FEUILLE 1: TABLEAU DE BORD EXÉCUTIF ===
            const dashboardData = [
                [`TABLEAU DE BORD EXÉCUTIF - COMPARAISON ${year1} VS ${year2}`],
                [`Gestion Financière SAS | Rapport généré le ${dateStr}`],
                [""],
                ["APERÇU SYNTHÉTIQUE"],
                [""],
                ["Principaux indicateurs de performance financière comparés entre les deux exercices"],
                [""],
                ["INDICATEURS CLÉS DE PERFORMANCE", "", "", "", ""],
                [""],
                ["Indicateur", `Année ${year1}`, `Année ${year2}`, "Évolution absolue"],
                ["Chiffre d'affaires", 
                    formatMoneyRaw(stats1.totalRevenue), 
                    formatMoneyRaw(stats2.totalRevenue), 
                    formatMoneyRaw(stats2.totalRevenue - stats1.totalRevenue)
                ],
                ["Bénéfice net", 
                    formatMoneyRaw(stats1.totalNetProfit), 
                    formatMoneyRaw(stats2.totalNetProfit), 
                    formatMoneyRaw(stats2.totalNetProfit - stats1.totalNetProfit)
                ],
                ["Marge bénéficiaire", 
                    parseFloat(stats1.profitMargin.toFixed(1)), 
                    parseFloat(stats2.profitMargin.toFixed(1)), 
                    parseFloat((stats2.profitMargin - stats1.profitMargin).toFixed(1))
                ],
                ["Dépenses totales", 
                    formatMoneyRaw(stats1.totalExpenses), 
                    formatMoneyRaw(stats2.totalExpenses), 
                    formatMoneyRaw(stats2.totalExpenses - stats1.totalExpenses)
                ],
                ["Ratio dépenses/revenus", 
                    parseFloat((stats1.totalExpenses / stats1.totalRevenue * 100).toFixed(1)) + "%", 
                    parseFloat((stats2.totalExpenses / stats2.totalRevenue * 100).toFixed(1)) + "%", 
                    parseFloat(((stats2.totalExpenses / stats2.totalRevenue) - (stats1.totalExpenses / stats1.totalRevenue)) * 100).toFixed(2) + " pts"
                ],
                ["Taux de rentabilité", 
                    parseFloat((stats1.totalNetProfit / stats1.totalRevenue * 100).toFixed(1)) + "%", 
                    parseFloat((stats2.totalNetProfit / stats2.totalRevenue * 100).toFixed(1)) + "%", 
                    parseFloat(((stats2.totalNetProfit / stats2.totalRevenue) - (stats1.totalNetProfit / stats1.totalRevenue)) * 100).toFixed(2) + " pts"
                ],
                [""],
                ["SYNTHÈSE DES PERFORMANCES"],
                [""],
                [`Performance globale: ${this.getPerformanceRating(comparison)}`],
                [""],
                [`Chiffre d'affaires moyen mensuel ${year1}: ${formatMoney(stats1.totalRevenue/12)}`],
                [`Chiffre d'affaires moyen mensuel ${year2}: ${formatMoney(stats2.totalRevenue/12)}`],
                ["Variation du CA moyen mensuel: " + formatPercent((stats2.totalRevenue/12 - stats1.totalRevenue/12) / (stats1.totalRevenue/12))],
                [""],
                [`Mois le plus performant ${year1}: ${stats1.bestMonth.month} (${formatMoney(stats1.bestMonth.value)})`],
                [`Mois le plus performant ${year2}: ${stats2.bestMonth.month} (${formatMoney(stats2.bestMonth.value)})`],
                [`Différence de pic de revenus: ${stats2.bestMonth.month === stats1.bestMonth.month ? "Même mois de pic" : "Changement de saisonnalité"}`],
                [""],
                ["ANALYSE COMPARATIVE DES TRIMESTRES"],
                [""],
                ["Trimestre", `CA ${year1}`, `CA ${year2}`, "Évolution", "Évolution %"],
            ];
            
            // Ajouter les données trimestrielles
            const quarters = this.calculateQuarterlyData(stats1.monthlyStats, stats2.monthlyStats);
            quarters.forEach((quarter, i) => {
                dashboardData.push([
                    `T${i+1}`,
                    formatMoneyRaw(quarter.revenue1),
                    formatMoneyRaw(quarter.revenue2),
                    formatMoneyRaw(quarter.revenueDiff),
                    parseFloat(quarter.revenuePercent.toFixed(1))
                ]);
            });
            
            // Calculer le trimestre à la plus forte croissance / baisse
            const bestQuarter = [...quarters].sort((a, b) => b.revenuePercent - a.revenuePercent)[0];
            const worstQuarter = [...quarters].sort((a, b) => a.revenuePercent - b.revenuePercent)[0];
            
            // Ajouter des métriques avancées
            dashboardData.push(
                [""],
                ["Trimestre avec la plus forte croissance:", `T${quarters.indexOf(bestQuarter) + 1}`, `${bestQuarter.revenuePercent.toFixed(1)}%`, "", ""],
                ["Trimestre avec la plus faible performance:", `T${quarters.indexOf(worstQuarter) + 1}`, `${worstQuarter.revenuePercent.toFixed(1)}%`, "", ""],
                [""],
                ["ÉVALUATION DE L'ÉVOLUTION ET DU MOMENTUM"],
                [""],
                ["Tendance générale:", this.getTrendEvaluation(comparison), "", "", ""],
                ["Momentum actuel:", this.getMomentumEvaluation(stats1, stats2), "", "", ""],
                ["Stabilité des revenus:", this.getStabilityEvaluation(stats2.monthlyStats), "", "", ""],
                [""],
                ["RECOMMANDATIONS PRIORITAIRES"],
                [""],
                ["1. " + this.getKeyRecommendation(comparison, 1)],
                ["2. " + this.getKeyRecommendation(comparison, 2)],
                ["3. " + this.getKeyRecommendation(comparison, 3)]
            );
            
            const dashboardWS = XLSX.utils.aoa_to_sheet(dashboardData);
            
            // Styles de la feuille tableau de bord
            dashboardWS['!cols'] = [
                { width: 30 }, // Colonne A
                { width: 20 }, // Colonne B
                { width: 20 }, // Colonne C
                { width: 20 }, // Colonne D
                { width: 20 }, // Colonne E
            ];
            
            // Mettre en forme le tableau de bord (si la fonction existe)
            if (this.formatExcelWorksheet) {
                this.formatExcelWorksheet(dashboardWS, dashboardData);
            }
            
            // === AJOUT DE GRAPHIQUES ===
            if (this.addExcelCharts) {
                this.addExcelCharts(wb, dashboardWS, dashboardData);
            }

            // === FEUILLE 2: RECOMMANDATIONS DÉTAILLÉES ===
            const recommendationsData = [
                ["RECOMMANDATIONS STRATÉGIQUES"],
                [""],
                ["Priorité", "Recommandation", "Impact attendu"],
                ["1", this.getKeyRecommendation(comparison, 1), "Amélioration des marges"],
                ["2", this.getKeyRecommendation(comparison, 2), "Réduction des coûts"],
                ["3", this.getKeyRecommendation(comparison, 3), "Augmentation des revenus"]
            ];

            const recommendationsWS = XLSX.utils.aoa_to_sheet(recommendationsData);
            recommendationsWS['!cols'] = [
                { width: 15 },
                { width: 50 },
                { width: 30 }
            ];
            XLSX.utils.book_append_sheet(wb, recommendationsWS, "Recommandations");

            // === FEUILLE 3: INDICATEURS AVANCÉS ===
            const advancedMetricsData = [
                ["INDICATEURS AVANCÉS"],
                [""],
                ["Indicateur", "Valeur"],
                ["ROI", `${((stats2.totalNetProfit - stats1.totalNetProfit) / stats1.totalExpenses * 100).toFixed(2)}%`],
                ["CAGR (Taux de croissance annuel moyen)", `${this.calculateCAGR(stats1.totalRevenue, stats2.totalRevenue, 1).toFixed(2)}%`]
            ];

            const advancedMetricsWS = XLSX.utils.aoa_to_sheet(advancedMetricsData);
            advancedMetricsWS['!cols'] = [
                { width: 30 },
                { width: 20 }
            ];
            XLSX.utils.book_append_sheet(wb, advancedMetricsWS, "Indicateurs avancés");

            // === ENREGISTRER LE FICHIER ===
            XLSX.utils.book_append_sheet(wb, dashboardWS, "Tableau de bord");
            XLSX.writeFile(wb, `Rapport_Comparatif_${year1}_vs_${year2}.xlsx`);

            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('✅ Rapport Excel généré avec succès !', 'success', 3000);
            }
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            
            // Solution de repli: exporter en CSV simple
            let csvContent = `COMPARAISON ${year1} VS ${year2}\n\n`;
            csvContent += `,"Année ${year1}","Année ${year2}","Évolution","Évolution %"\n`;
            csvContent += `"Chiffre d'affaires","${stats1.totalRevenue}","${stats2.totalRevenue}","${stats2.totalRevenue - stats1.totalRevenue}","${comparison.revenue.percentText}"\n`;
            csvContent += `"Bénéfice net","${stats1.totalNetProfit}","${stats2.totalNetProfit}","${stats2.totalNetProfit - stats1.totalNetProfit}","${comparison.profit.percentText}"\n`;
            csvContent += `"Marge bénéficiaire","${stats1.profitMargin}%","${stats2.profitMargin}%","${(stats2.profitMargin - stats1.profitMargin).toFixed(1)}pts","${comparison.margin.percentText}"\n`;
            csvContent += `"Dépenses totales","${stats1.totalExpenses}","${stats2.totalExpenses}","${stats2.totalExpenses - stats1.totalExpenses}","${comparison.expenses.percentText}"\n`;
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Comparaison_${year1}_vs_${year2}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport exporté en CSV (Excel non disponible)', 'warning');
            }
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
    },

    /**
     * Ferme tous les modals existants
     */
    closeAllModals: function() {
        document.querySelectorAll('.custom-modal').forEach(modal => {
            modal.remove();
        });
    },

    /**
     * Génère un texte d'analyse pour un indicateur donné
     * @param {string} indicator - L'indicateur à analyser (revenue, profit, expenses, margin)
     * @param {object} comparison - Les données de comparaison pour cet indicateur
     * @return {string} - Le texte d'analyse
     */
    getAnalysisText: function(indicator, comparison) {
        const percentValue = parseFloat(comparison.percentText);
        const isPositive = comparison.percentText.includes('+');
        
        let analysis = '';
        
        switch(indicator) {
            case 'revenue':
                if (isPositive) {
                    if (percentValue > 20) {
                        analysis = `Excellente croissance du chiffre d'affaires (${comparison.percentText}). Cette forte hausse pourrait indiquer le succès d'une nouvelle stratégie commerciale ou l'acquisition de nouveaux clients significatifs.`;
                    } else if (percentValue > 10) {
                        analysis = `Bonne progression du chiffre d'affaires (${comparison.percentText}). Cette évolution est supérieure à la croissance moyenne du secteur.`;
                    } else {
                        analysis = `Légère amélioration du chiffre d'affaires (${comparison.percentText}). Cette évolution positive reste modérée.`;
                    }
                } else {
                    if (percentValue < -20) {
                        analysis = `Forte baisse du chiffre d'affaires (${comparison.percentText}). Cette diminution significative nécessite une analyse approfondie des causes et un plan d'action correctif immédiat.`;
                    } else if (percentValue < -10) {
                        analysis = `Baisse notable du chiffre d'affaires (${comparison.percentText}). Une révision de la stratégie commerciale est recommandée.`;
                    } else {
                        analysis = `Légère baisse du chiffre d'affaires (${comparison.percentText}). Une attention particulière devrait être portée à l'évolution des ventes.`;
                    }
                }
                break;
                
            case 'profit':
                if (isPositive) {
                    if (percentValue > 20) {
                        analysis = `Excellente augmentation du bénéfice net (${comparison.percentText}). Cette progression significative traduit une amélioration de l'efficacité opérationnelle et de la rentabilité globale.`;
                    } else if (percentValue > 10) {
                        analysis = `Bonne évolution du bénéfice net (${comparison.percentText}). Cette progression témoigne d'une meilleure maîtrise des coûts et d'une bonne santé financière.`;
                    } else {
                        analysis = `Légère amélioration du bénéfice net (${comparison.percentText}). La rentabilité progresse modérément.`;
                    }
                } else {
                    if (percentValue < -20) {
                        analysis = `Forte diminution du bénéfice net (${comparison.percentText}). Cette baisse importante peut indiquer des problèmes structurels de rentabilité qui nécessitent des mesures correctives importantes.`;
                    } else if (percentValue < -10) {
                        analysis = `Baisse préoccupante du bénéfice net (${comparison.percentText}). Une analyse des postes de dépenses et une révision de la politique tarifaire sont recommandées.`;
                    } else {
                        analysis = `Légère réduction du bénéfice net (${comparison.percentText}). Cette évolution mérite une attention particulière pour éviter une tendance baissière.`;
                    }
                }
                break;
                
            case 'margin':
                if (isPositive) {
                    if (percentValue > 20) {
                        analysis = `Forte amélioration de la marge (${comparison.percentText}). Cette progression indique une meilleure valorisation de l'offre et/ou une optimisation significative des coûts.`;
                    } else if (percentValue > 10) {
                        analysis = `Bonne progression de la marge (${comparison.percentText}). Cette amélioration montre une meilleure efficacité opérationnelle.`;
                    } else {
                        analysis = `Légère amélioration de la marge (${comparison.percentText}). L'entreprise parvient à augmenter progressivement sa rentabilité.`;
                    }
                } else {
                    if (percentValue < -20) {
                        analysis = `Érosion importante de la marge (${comparison.percentText}). Cette dégradation significative peut être le signe d'une pression concurrentielle accrue ou d'une augmentation des coûts non répercutée sur les prix.`;
                    } else if (percentValue < -10) {
                        analysis = `Baisse préoccupante de la marge (${comparison.percentText}). Une révision de la structure des coûts et de la politique tarifaire est recommandée.`;
                    } else {
                        analysis = `Légère réduction de la marge (${comparison.percentText}). Cette tendance doit être surveillée pour éviter une dégradation progressive de la rentabilité.`;
                    }
                }
                break;
                
            case 'expenses':
                if (!isPositive) {
                    if (percentValue < -20) {
                        analysis = `Forte réduction des dépenses (${comparison.percentText}). Cette baisse significative des charges reflète probablement des mesures d'optimisation importantes.`;
                    } else if (percentValue < -10) {
                        analysis = `Bonne maîtrise des dépenses (${comparison.percentText}). Cette réduction témoigne d'efforts d'optimisation des coûts.`;
                    } else {
                        analysis = `Légère réduction des dépenses (${comparison.percentText}). L'entreprise parvient à contrôler progressivement ses charges.`;
                    }
                } else {
                    if (percentValue > 20) {
                        analysis = `Augmentation importante des dépenses (${comparison.percentText}). Cette hausse significative nécessite une analyse détaillée des postes concernés pour identifier les leviers d'optimisation.`;
                    } else if (percentValue > 10) {
                        analysis = `Hausse notable des dépenses (${comparison.percentText}). Une vigilance accrue sur la structure des coûts est recommandée.`;
                    } else {
                        analysis = `Légère augmentation des dépenses (${comparison.percentText}). Cette évolution reste modérée mais mérite attention.`;
                    }
                }
                break;
                
            default:
                analysis = `Évolution de ${comparison.percentText} par rapport à la période précédente.`;
        }
        
        return analysis;
    },
    
    /**
     * Détermine les mois avec les plus fortes baisses entre deux années
     * @param {Object} stats1 - Statistiques de la première année
     * @param {Object} stats2 - Statistiques de la seconde année
     * @return {string} - Texte des mois problématiques
     */
    getWorstMonthsText: function(stats1, stats2) {
        const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        
        // Trouver les mois où la performance s'est dégradée
        const declines = [];
        
        for (let i = 0; i < 12; i++) {
            const data1 = stats1.monthlyStats[i] || { revenue: 0, netProfit: 0 };
            const data2 = stats2.monthlyStats[i] || { revenue: 0, netProfit: 0 };
            
            const revenueDiff = data2.revenue - data1.revenue;
            const profitDiff = data2.netProfit - data1.netProfit;
            
            // Si le revenu ou le profit a diminué significativement
            if (revenueDiff < 0 || profitDiff < 0) {
                const revenuePercent = data1.revenue ? (revenueDiff / data1.revenue) * 100 : 0;
                const profitPercent = data1.netProfit ? (profitDiff / data1.netProfit) * 100 : 0;
                
                // Si la baisse est significative (plus de 10%)
                if (revenuePercent < -10 || profitPercent < -10) {
                    declines.push({
                        month: months[i],
                        revenuePercent,
                        profitPercent
                    });
                }
            }
        }
        
        // Trier par amplitude de baisse (cumulée revenu+profit)
        declines.sort((a, b) => (a.revenuePercent + a.profitPercent) - (b.revenuePercent + b.profitPercent));
        
        if (declines.length === 0) {
            return "Aucun mois ne présente de baisse significative.";
        }
        
        // Limiter à 3 mois maximum
        const worstMonths = declines.slice(0, 3);
        
        return worstMonths.map(m => 
            `${m.month} (CA: ${m.revenuePercent.toFixed(1)}%, Bénéfice: ${m.profitPercent.toFixed(1)}%)`
        ).join(', ');
    },
    
    /**
     * Génère des recommandations basées sur les données comparées
     * @param {Object} comparison - Données de comparaison entre les années
     * @return {string} - Recommandations textuelles
     */
    getRecommendations: function(comparison) {
        const recommendations = [];
        
        // Recommandations basées sur le chiffre d'affaires
        if (comparison.revenue.percent < -5) {
            recommendations.push("Renforcer les actions commerciales et marketing pour stimuler les ventes");
            recommendations.push("Analyser les segments clients en recul et élaborer un plan de reconquête");
        } else if (comparison.revenue.percent > 10) {
            recommendations.push("Capitaliser sur les facteurs de croissance identifiés et les renforcer");
        }
        
        // Recommandations basées sur les marges
        if (comparison.margin.percent < -5) {
            recommendations.push("Revoir la politique tarifaire et analyser la structure des coûts");
            if (comparison.expenses.percent > 5) {
                recommendations.push("Mettre en place un plan de réduction des charges pour restaurer les marges");
            }
        } else if (comparison.margin.percent > 5) {
            recommendations.push("Documenter les bonnes pratiques qui ont permis d'améliorer la rentabilité");
        }
        
        // Recommandations basées sur la saisonnalité
        recommendations.push("Analyser en détail les mois présentant les écarts les plus importants");
        
        // Si pas assez de recommandations
        if (recommendations.length < 3) {
            recommendations.push("Établir un tableau de bord mensuel pour suivre les indicateurs clés");
        }
        
        return recommendations.join(". ") + ".";
    }
};

console.log('🔍 Module de comparaison d\'années chargé et fonctionnel');