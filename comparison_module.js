/**
 * Module de Comparaison d'Années - Application Financière SAS
 */

const ComparisonModule = {
    /**
     * Afficher la comparaison d'années
     */
    showComparison(data, config) {
        console.log('📊 Ouverture du module Comparaison d\'années');
        
        const availableYears = Object.keys(data).map(y => parseInt(y)).sort();
        
        if (availableYears.length < 2) {
            app.showNotification('Au moins 2 années sont nécessaires pour la comparaison', 'warning');
            return;
        }

        const content = this.generateComparisonContent(data, config, availableYears);
        
        const modal = app.createModal('📊 Comparaison d\'Années', content, 'large');
        
        // Initialiser les événements après la création du modal
        setTimeout(() => {
            this.initComparisonEvents(data, config, availableYears);
        }, 100);
    },

    /**
     * Générer le contenu de la comparaison
     */
    generateComparisonContent(data, config, availableYears) {
        const currentYear = new Date().getFullYear();
        const defaultYear1 = availableYears.includes(currentYear) ? currentYear : availableYears[availableYears.length - 1];
        const defaultYear2 = availableYears.includes(currentYear - 1) ? currentYear - 1 : availableYears[0];

        return `
            <div class="comparison-container">
                <!-- Sélecteurs d'années -->
                <div class="year-selectors">
                    <div class="selector-group">
                        <label for="compYear1">Première année :</label>
                        <select id="compYear1" class="year-select">
                            ${availableYears.map(year => 
                                `<option value="${year}" ${year === defaultYear1 ? 'selected' : ''}>${year}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="selector-group">
                        <label for="compYear2">Deuxième année :</label>
                        <select id="compYear2" class="year-select">
                            ${availableYears.map(year => 
                                `<option value="${year}" ${year === defaultYear2 ? 'selected' : ''}>${year}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button id="compareBtn" class="btn btn-primary">Comparer</button>
                </div>

                <!-- Résultats de la comparaison -->
                <div id="comparisonResults" class="comparison-results">
                    ${this.generateComparisonResults(data, config, defaultYear1, defaultYear2)}
                </div>
            </div>
        `;
    },

    /**
     * Générer les résultats de comparaison
     */
    generateComparisonResults(data, config, year1, year2) {
        const year1Data = data[year1] || [];
        const year2Data = data[year2] || [];

        const stats1 = this.calculateYearStats(year1Data, config);
        const stats2 = this.calculateYearStats(year2Data, config);

        const comparison = this.compareStats(stats1, stats2);

        return `
            <!-- Résumé de comparaison -->
            <div class="comparison-summary">
                <h4>📊 Résumé de la Comparaison ${year1} vs ${year2}</h4>
                <div class="summary-cards">
                    ${this.generateSummaryCards(comparison, year1, year2)}
                </div>
            </div>

            <!-- Tableaux de comparaison -->
            <div class="comparison-tables">
                <div class="table-section">
                    <h5>💰 Comparaison Financière</h5>
                    <div class="table-container">
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th>Indicateur</th>
                                    <th>${year1}</th>
                                    <th>${year2}</th>
                                    <th>Évolution</th>
                                    <th>% Variation</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateComparisonTableRows(stats1, stats2)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="table-section">
                    <h5>📈 Comparaison Mensuelle</h5>
                    <div class="table-container">
                        <table class="monthly-comparison-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>CA ${year1}</th>
                                    <th>CA ${year2}</th>
                                    <th>Évolution CA</th>
                                    <th>Profit ${year1}</th>
                                    <th>Profit ${year2}</th>
                                    <th>Évolution Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateMonthlyComparisonRows(year1Data, year2Data, config)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Graphiques de comparaison -->
            <div class="comparison-charts">
                <div class="chart-row">
                    <div class="chart-container">
                        <h5>📊 Comparaison des Revenus</h5>
                        <canvas id="revenueComparisonChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h5>💰 Comparaison des Bénéfices</h5>
                        <canvas id="profitComparisonChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="chart-row">
                    <div class="chart-container">
                        <h5>📈 Évolution Cumulative</h5>
                        <canvas id="cumulativeComparisonChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h5>📊 Performance Relative</h5>
                        <canvas id="performanceComparisonChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Analyse et recommandations -->
            <div class="comparison-analysis">
                <h4>🔍 Analyse Comparative</h4>
                ${this.generateComparisonAnalysis(comparison, year1, year2)}
            </div>
        `;
    },

    /**
     * Calculer les statistiques d'une année
     */
    calculateYearStats(yearData, config) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        // Assurer que nous avons 12 mois de données
        const fullYearData = months.map(month => {
            const existing = yearData.find(m => m.month === month);
            return existing || { month, revenue: 0, losses: 0, purchases: 0 };
        });

        const totals = fullYearData.reduce((acc, month) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
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

        const averages = {
            monthlyRevenue: totals.revenue / 12,
            monthlyNetProfit: totals.netProfit / 12
        };

        const margins = {
            grossMargin: totals.revenue > 0 ? (totals.grossProfit / totals.revenue) * 100 : 0,
            netMargin: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0
        };

        const profitableMonths = fullYearData.filter(month => {
            const gross = month.revenue - month.losses - month.purchases;
            const net = gross - (gross > 0 ? gross * config.taxRate / 100 : 0);
            return net > 0;
        }).length;

        return {
            totals,
            averages,
            margins,
            profitableMonths,
            monthlyData: fullYearData
        };
    },

    /**
     * Comparer les statistiques
     */
    compareStats(stats1, stats2) {
        const calculateChange = (val1, val2) => {
            if (val1 === 0) return val2 > 0 ? 100 : 0;
            return ((val2 - val1) / val1) * 100;
        };

        return {
            revenue: {
                change: calculateChange(stats1.totals.revenue, stats2.totals.revenue),
                absolute: stats2.totals.revenue - stats1.totals.revenue
            },
            netProfit: {
                change: calculateChange(stats1.totals.netProfit, stats2.totals.netProfit),
                absolute: stats2.totals.netProfit - stats1.totals.netProfit
            },
            grossMargin: {
                change: stats2.margins.grossMargin - stats1.margins.grossMargin,
                absolute: stats2.margins.grossMargin - stats1.margins.grossMargin
            },
            netMargin: {
                change: stats2.margins.netMargin - stats1.margins.netMargin,
                absolute: stats2.margins.netMargin - stats1.margins.netMargin
            },
            profitableMonths: {
                change: stats2.profitableMonths - stats1.profitableMonths,
                absolute: stats2.profitableMonths - stats1.profitableMonths
            }
        };
    },

    /**
     * Générer les cartes de résumé
     */
    generateSummaryCards(comparison, year1, year2) {
        const cards = [
            {
                title: '💰 Évolution CA',
                value: `${comparison.revenue.change >= 0 ? '+' : ''}${comparison.revenue.change.toFixed(1)}%`,
                subtitle: `${app.formatCurrency(comparison.revenue.absolute)}`,
                color: comparison.revenue.change >= 0 ? 'green' : 'red',
                icon: comparison.revenue.change >= 0 ? '📈' : '📉'
            },
            {
                title: '💵 Évolution Bénéfices',
                value: `${comparison.netProfit.change >= 0 ? '+' : ''}${comparison.netProfit.change.toFixed(1)}%`,
                subtitle: `${app.formatCurrency(comparison.netProfit.absolute)}`,
                color: comparison.netProfit.change >= 0 ? 'green' : 'red',
                icon: comparison.netProfit.change >= 0 ? '🚀' : '📉'
            },
            {
                title: '📊 Marge Nette',
                value: `${comparison.netMargin.change >= 0 ? '+' : ''}${comparison.netMargin.change.toFixed(1)}%`,
                subtitle: `Points de pourcentage`,
                color: comparison.netMargin.change >= 0 ? 'green' : 'red',
                icon: comparison.netMargin.change >= 0 ? '⬆️' : '⬇️'
            },
            {
                title: '📅 Mois Rentables',
                value: `${comparison.profitableMonths.change >= 0 ? '+' : ''}${comparison.profitableMonths.change}`,
                subtitle: `mois`,
                color: comparison.profitableMonths.change >= 0 ? 'green' : 'red',
                icon: comparison.profitableMonths.change >= 0 ? '✅' : '❌'
            }
        ];

        return cards.map(card => `
            <div class="summary-card ${card.color}">
                <div class="card-header">
                    <span class="card-icon">${card.icon}</span>
                    <span class="card-title">${card.title}</span>
                </div>
                <div class="card-value">${card.value}</div>
                <div class="card-subtitle">${card.subtitle}</div>
            </div>
        `).join('');
    },

    /**
     * Générer les lignes du tableau de comparaison
     */
    generateComparisonTableRows(stats1, stats2) {
        const rows = [
            {
                label: 'Chiffre d\'affaires',
                val1: stats1.totals.revenue,
                val2: stats2.totals.revenue,
                format: 'currency'
            },
            {
                label: 'Bénéfice brut',
                val1: stats1.totals.grossProfit,
                val2: stats2.totals.grossProfit,
                format: 'currency'
            },
            {
                label: 'Bénéfice net',
                val1: stats1.totals.netProfit,
                val2: stats2.totals.netProfit,
                format: 'currency'
            },
            {
                label: 'Marge brute',
                val1: stats1.margins.grossMargin,
                val2: stats2.margins.grossMargin,
                format: 'percentage'
            },
            {
                label: 'Marge nette',
                val1: stats1.margins.netMargin,
                val2: stats2.margins.netMargin,
                format: 'percentage'
            },
            {
                label: 'CA moyen/mois',
                val1: stats1.averages.monthlyRevenue,
                val2: stats2.averages.monthlyRevenue,
                format: 'currency'
            },
            {
                label: 'Bénéfice moyen/mois',
                val1: stats1.averages.monthlyNetProfit,
                val2: stats2.averages.monthlyNetProfit,
                format: 'currency'
            },
            {
                label: 'Mois rentables',
                val1: stats1.profitableMonths,
                val2: stats2.profitableMonths,
                format: 'number'
            }
        ];

        return rows.map(row => {
            const difference = row.val2 - row.val1;
            const percentChange = row.val1 !== 0 ? (difference / row.val1) * 100 : (row.val2 > 0 ? 100 : 0);

            let formattedVal1, formattedVal2, formattedDiff;
            
            if (row.format === 'currency') {
                formattedVal1 = app.formatCurrency(row.val1);
                formattedVal2 = app.formatCurrency(row.val2);
                formattedDiff = app.formatCurrency(difference);
            } else if (row.format === 'percentage') {
                formattedVal1 = `${row.val1.toFixed(1)}%`;
                formattedVal2 = `${row.val2.toFixed(1)}%`;
                formattedDiff = `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%`;
            } else {
                formattedVal1 = row.val1.toString();
                formattedVal2 = row.val2.toString();
                formattedDiff = `${difference >= 0 ? '+' : ''}${difference}`;
            }

            const changeClass = difference >= 0 ? 'positive' : 'negative';
            const changeIcon = difference >= 0 ? '📈' : '📉';

            return `
                <tr>
                    <td><strong>${row.label}</strong></td>
                    <td>${formattedVal1}</td>
                    <td>${formattedVal2}</td>
                    <td class="${changeClass}">
                        ${changeIcon} ${formattedDiff}
                    </td>
                    <td class="${changeClass}">
                        ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Générer les lignes de comparaison mensuelle
     */
    generateMonthlyComparisonRows(year1Data, year2Data, config) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        return months.map(month => {
            const month1 = year1Data.find(m => m.month === month) || { month, revenue: 0, losses: 0, purchases: 0 };
            const month2 = year2Data.find(m => m.month === month) || { month, revenue: 0, losses: 0, purchases: 0 };

            const profit1 = this.calculateNetProfit(month1, config);
            const profit2 = this.calculateNetProfit(month2, config);

            const revenueChange = month1.revenue !== 0 ? ((month2.revenue - month1.revenue) / month1.revenue) * 100 : (month2.revenue > 0 ? 100 : 0);
            const profitChange = profit1 !== 0 ? ((profit2 - profit1) / profit1) * 100 : (profit2 > 0 ? 100 : 0);

            return `
                <tr>
                    <td><strong>${month.substring(0, 3)}</strong></td>
                    <td>${app.formatCurrency(month1.revenue)}</td>
                    <td>${app.formatCurrency(month2.revenue)}</td>
                    <td class="${revenueChange >= 0 ? 'positive' : 'negative'}">
                        ${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%
                    </td>
                    <td class="${profit1 >= 0 ? 'positive' : 'negative'}">
                        ${app.formatCurrency(profit1)}
                    </td>
                    <td class="${profit2 >= 0 ? 'positive' : 'negative'}">
                        ${app.formatCurrency(profit2)}
                    </td>
                    <td class="${profitChange >= 0 ? 'positive' : 'negative'}">
                        ${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}%
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Calculer le bénéfice net d'un mois
     */
    calculateNetProfit(monthData, config) {
        const grossProfit = monthData.revenue - monthData.losses - monthData.purchases;
        const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
        return grossProfit - taxes;
    },

    /**
     * Générer l'analyse comparative
     */
    generateComparisonAnalysis(comparison, year1, year2) {
        const insights = [];

        // Analyse du CA
        if (comparison.revenue.change > 10) {
            insights.push({
                type: 'success',
                icon: '🎉',
                title: 'Croissance Excellente',
                text: `Le chiffre d'affaires a augmenté de ${comparison.revenue.change.toFixed(1)}% entre ${year1} et ${year2}. C'est une performance remarquable !`
            });
        } else if (comparison.revenue.change > 0) {
            insights.push({
                type: 'info',
                icon: '📈',
                title: 'Croissance Positive',
                text: `Le chiffre d'affaires a progressé de ${comparison.revenue.change.toFixed(1)}%. Continuez sur cette lancée !`
            });
        } else {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Baisse du CA',
                text: `Le chiffre d'affaires a diminué de ${Math.abs(comparison.revenue.change).toFixed(1)}%. Il est important d'analyser les causes.`
            });
        }

        // Analyse de la rentabilité
        if (comparison.netMargin.change > 2) {
            insights.push({
                type: 'success',
                icon: '💰',
                title: 'Amélioration de la Rentabilité',
                text: `La marge nette s'est améliorée de ${comparison.netMargin.change.toFixed(1)} points. Excellente optimisation !`
            });
        } else if (comparison.netMargin.change < -2) {
            insights.push({
                type: 'danger',
                icon: '📉',
                title: 'Détérioration de la Marge',
                text: `La marge nette a diminué de ${Math.abs(comparison.netMargin.change).toFixed(1)} points. Vérifiez vos coûts.`
            });
        }

        // Analyse de la régularité
        if (comparison.profitableMonths.change > 0) {
            insights.push({
                type: 'success',
                icon: '📅',
                title: 'Plus de Mois Rentables',
                text: `${comparison.profitableMonths.change} mois rentable(s) en plus. Votre régularité s'améliore !`
            });
        } else if (comparison.profitableMonths.change < 0) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Moins de Mois Rentables',
                text: `${Math.abs(comparison.profitableMonths.change)} mois rentable(s) en moins. Travaillez sur la régularité.`
            });
        }

        return `
            <div class="analysis-insights">
                ${insights.map(insight => `
                    <div class="insight-card ${insight.type}">
                        <div class="insight-header">
                            <span class="insight-icon">${insight.icon}</span>
                            <h6>${insight.title}</h6>
                        </div>
                        <p>${insight.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Initialiser les événements de comparaison
     */
    initComparisonEvents(data, config, availableYears) {
        const compareBtn = document.getElementById('compareBtn');
        const year1Select = document.getElementById('compYear1');
        const year2Select = document.getElementById('compYear2');
        const resultsContainer = document.getElementById('comparisonResults');

        if (compareBtn && year1Select && year2Select && resultsContainer) {
            compareBtn.addEventListener('click', () => {
                const year1 = parseInt(year1Select.value);
                const year2 = parseInt(year2Select.value);

                if (year1 === year2) {
                    app.showNotification('Veuillez sélectionner deux années différentes', 'warning');
                    return;
                }

                resultsContainer.innerHTML = this.generateComparisonResults(data, config, year1, year2);
                
                // Initialiser les graphiques après mise à jour
                setTimeout(() => {
                    this.initComparisonCharts(data, config, year1, year2);
                }, 100);
            });

            // Initialiser les graphiques pour la sélection par défaut
            setTimeout(() => {
                const year1 = parseInt(year1Select.value);
                const year2 = parseInt(year2Select.value);
                this.initComparisonCharts(data, config, year1, year2);
            }, 200);
        }
    },

    /**
     * Initialiser les graphiques de comparaison
     */
    initComparisonCharts(data, config, year1, year2) {
        if (typeof Chart === 'undefined') return;

        const year1Data = data[year1] || [];
        const year2Data = data[year2] || [];

        // Graphique de comparaison des revenus
        this.createRevenueComparisonChart(year1Data, year2Data, year1, year2);
        
        // Graphique de comparaison des bénéfices
        this.createProfitComparisonChart(year1Data, year2Data, year1, year2, config);
        
        // Graphique d'évolution cumulative
        this.createCumulativeChart(year1Data, year2Data, year1, year2, config);
        
        // Graphique de performance relative
        this.createPerformanceChart(year1Data, year2Data, year1, year2, config);
    },

    /**
     * Créer le graphique de comparaison des revenus
     */
    createRevenueComparisonChart(year1Data, year2Data, year1, year2) {
        const canvas = document.getElementById('revenueComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        const revenues1 = this.getMonthlyData(year1Data, 'revenue');
        const revenues2 = this.getMonthlyData(year2Data, 'revenue');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: year1.toString(),
                        data: revenues1,
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    },
                    {
                        label: year2.toString(),
                        data: revenues2,
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
                                return value.toLocaleString('fr-FR') + ' €';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')} €`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Créer le graphique de comparaison des bénéfices
     */
    createProfitComparisonChart(year1Data, year2Data, year1, year2, config) {
        const canvas = document.getElementById('profitComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        const profits1 = this.getMonthlyNetProfits(year1Data, config);
        const profits2 = this.getMonthlyNetProfits(year2Data, config);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: `Bénéfices ${year1}`,
                        data: profits1,
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444420',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: `Bénéfices ${year2}`,
                        data: profits2,
                        borderColor: '#8b5cf6',
                        backgroundColor: '#8b5cf620',
                        tension: 0.4,
                        fill: false
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
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')} €`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Créer le graphique d'évolution cumulative
     */
    createCumulativeChart(year1Data, year2Data, year1, year2, config) {
        const canvas = document.getElementById('cumulativeComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        const revenues1 = this.getMonthlyData(year1Data, 'revenue');
        const revenues2 = this.getMonthlyData(year2Data, 'revenue');

        // Calcul cumulatif
        const cumulative1 = revenues1.reduce((acc, val, index) => {
            acc.push((acc[index - 1] || 0) + val);
            return acc;
        }, []);

        const cumulative2 = revenues2.reduce((acc, val, index) => {
            acc.push((acc[index - 1] || 0) + val);
            return acc;
        }, []);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: `CA Cumulé ${year1}`,
                        data: cumulative1,
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b20',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: `CA Cumulé ${year2}`,
                        data: cumulative2,
                        borderColor: '#06b6d4',
                        backgroundColor: '#06b6d420',
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
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')} €`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Créer le graphique de performance relative
     */
    createPerformanceChart(year1Data, year2Data, year1, year2, config) {
        const canvas = document.getElementById('performanceComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        const margins1 = this.getMonthlyMargins(year1Data, config);
        const margins2 = this.getMonthlyMargins(year2Data, config);

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: `Marge ${year1}`,
                        data: margins1,
                        borderColor: '#ec4899',
                        backgroundColor: '#ec489920',
                        pointBackgroundColor: '#ec4899'
                    },
                    {
                        label: `Marge ${year2}`,
                        data: margins2,
                        borderColor: '#14b8a6',
                        backgroundColor: '#14b8a620',
                        pointBackgroundColor: '#14b8a6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Obtenir les données mensuelles pour un indicateur
     */
    getMonthlyData(yearData, field) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        return months.map(month => {
            const monthData = yearData.find(m => m.month === month);
            return monthData ? monthData[field] : 0;
        });
    },

    /**
     * Obtenir les bénéfices nets mensuels
     */
    getMonthlyNetProfits(yearData, config) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        return months.map(month => {
            const monthData = yearData.find(m => m.month === month);
            if (!monthData) return 0;
            
            return this.calculateNetProfit(monthData, config);
        });
    },

    /**
     * Obtenir les marges mensuelles
     */
    getMonthlyMargins(yearData, config) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        return months.map(month => {
            const monthData = yearData.find(m => m.month === month);
            if (!monthData || monthData.revenue === 0) return 0;
            
            const netProfit = this.calculateNetProfit(monthData, config);
            return (netProfit / monthData.revenue) * 100;
        });
    }
};

// Styles CSS pour le module de comparaison
const comparisonStyles = document.createElement('style');
comparisonStyles.textContent = `
    /* Styles pour le module de comparaison */
    .comparison-container {
        max-width: 100%;
        margin: 0 auto;
    }

    .year-selectors {
        display: flex;
        gap: 20px;
        align-items: end;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 10px;
        flex-wrap: wrap;
    }

    .selector-group {
        display: flex;
        flex-direction: column;
        min-width: 150px;
    }

    .selector-group label {
        font-weight: 600;
        margin-bottom: 5px;
        color: #374151;
    }

    .year-select {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        background: white;
    }

    .comparison-results {
        margin-top: 20px;
    }

    .comparison-summary {
        margin-bottom: 30px;
    }

    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 15px;
    }

    .summary-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-left: 4px solid;
        transition: transform 0.2s;
    }

    .summary-card:hover {
        transform: translateY(-2px);
    }

    .summary-card.green { border-left-color: #10b981; }
    .summary-card.red { border-left-color: #ef4444; }
    .summary-card.blue { border-left-color: #3b82f6; }

    .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }

    .card-icon {
        font-size: 1.3rem;
    }

    .card-title {
        font-weight: 600;
        color: #374151;
        font-size: 0.9rem;
    }

    .card-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 5px;
    }

    .card-subtitle {
        font-size: 0.9rem;
        color: #6b7280;
    }

    .comparison-tables {
        margin: 30px 0;
    }

    .table-section {
        margin-bottom: 30px;
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .table-section h5 {
        margin: 0 0 15px 0;
        color: #1f2937;
        font-weight: 600;
    }

    .table-container {
        overflow-x: auto;
    }

    .comparison-table,
    .monthly-comparison-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    .comparison-table th,
    .comparison-table td,
    .monthly-comparison-table th,
    .monthly-comparison-table td {
        padding: 12px;
        text-align: right;
        border-bottom: 1px solid #e5e7eb;
    }

    .comparison-table th,
    .monthly-comparison-table th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        position: sticky;
        top: 0;
    }

    .comparison-table td:first-child,
    .comparison-table th:first-child,
    .monthly-comparison-table td:first-child,
    .monthly-comparison-table th:first-child {
        text-align: left;
        font-weight: 600;
    }

    .comparison-charts {
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
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .chart-container h5 {
        margin: 0 0 15px 0;
        color: #1f2937;
        font-weight: 600;
    }

    .chart-container canvas {
        max-height: 300px !important;
    }

    .comparison-analysis {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-top: 30px;
    }

    .analysis-insights {
        display: grid;
        gap: 15px;
        margin-top: 15px;
    }

    .insight-card {
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid;
    }

    .insight-card.success {
        background: #f0fdf4;
        border-left-color: #10b981;
    }

    .insight-card.info {
        background: #f0f9ff;
        border-left-color: #3b82f6;
    }

    .insight-card.warning {
        background: #fffbeb;
        border-left-color: #f59e0b;
    }

    .insight-card.danger {
        background: #fef2f2;
        border-left-color: #ef4444;
    }

    .insight-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }

    .insight-icon {
        font-size: 1.2rem;
    }

    .insight-header h6 {
        margin: 0;
        color: #1f2937;
        font-weight: 600;
    }

    .insight-card p {
        margin: 0;
        color: #6b7280;
        line-height: 1.4;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .year-selectors {
            flex-direction: column;
            align-items: stretch;
        }
        
        .chart-row {
            grid-template-columns: 1fr;
        }
        
        .summary-cards {
            grid-template-columns: 1fr;
        }
        
        .comparison-table,
        .monthly-comparison-table {
            font-size: 12px;
        }
        
        .comparison-table th,
        .comparison-table td,
        .monthly-comparison-table th,
        .monthly-comparison-table td {
            padding: 8px 4px;
        }
        
        .chart-container canvas {
            max-height: 200px !important;
        }
    }
`;

document.head.appendChild(comparisonStyles);