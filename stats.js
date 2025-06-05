/**
 * Module Statistiques - Version Corrigée
 * Fournit des analyses détaillées des données financières
 */

const StatsModule = {
    charts: {}, // Stockage des instances de graphiques
    
    /**
     * Détruire tous les graphiques existants pour éviter les conflits
     */
    destroyAllCharts: function() {
        Object.keys(this.charts).forEach(chartId => {
            if (this.charts[chartId] && typeof this.charts[chartId].destroy === 'function') {
                this.charts[chartId].destroy();
                delete this.charts[chartId];
            }
        });
    },
    /**
     * Afficher les statistiques complètes
     */
    showStats: function(data, currentYear, config) {
        console.log('📊 Ouverture du module Statistiques');
        
        if (!data[currentYear]) {
            this.showError('Aucune donnée disponible pour cette année');
            return;
        }
        
        const stats = this.calculateDetailedStats(data, currentYear, config);
        const modalContent = this.createStatsModal(stats, currentYear);
        
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = modalContent;
        
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
            align-items: flex-start;
            z-index: 1000;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
        `;
          // Gestionnaire de fermeture
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                // Détruire les graphiques avant de fermer le modal
                this.destroyAllCharts();
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
        
        // Initialiser les graphiques après ajout au DOM
        setTimeout(() => {
            this.initStatsCharts(stats);
        }, 100);
    },
    
    /**
     * Calculer les statistiques détaillées
     */
    calculateDetailedStats: function(data, currentYear, config) {
        const yearData = data[currentYear];
        const previousYear = currentYear - 1;
        const previousYearData = data[previousYear] || [];
        
        // Calculs de base pour l'année courante
        let totalRevenue = 0;
        let totalLosses = 0;
        let totalPurchases = 0;
        let totalGrossProfit = 0;
        let totalTaxes = 0;
        let totalNetProfit = 0;
        
        const monthlyData = [];
        
        yearData.forEach((month, index) => {
            const revenue = month.revenue || 0;
            const losses = month.losses || 0;
            const purchases = month.purchases || 0;
            const grossProfit = revenue - losses - purchases;
            const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            totalRevenue += revenue;
            totalLosses += losses;
            totalPurchases += purchases;
            totalGrossProfit += grossProfit;
            totalTaxes += taxes;
            totalNetProfit += netProfit;
            
            monthlyData.push({
                month: month.month,
                revenue: revenue,
                losses: losses,
                purchases: purchases,
                grossProfit: grossProfit,
                taxes: taxes,
                netProfit: netProfit
            });
        });
        
        // Calculs pour l'année précédente
        let previousTotalRevenue = 0;
        let previousTotalNetProfit = 0;
        
        if (previousYearData.length > 0) {
            previousYearData.forEach(month => {
                const revenue = month.revenue || 0;
                const losses = month.losses || 0;
                const purchases = month.purchases || 0;
                const grossProfit = revenue - losses - purchases;
                const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
                const netProfit = grossProfit - taxes;
                
                previousTotalRevenue += revenue;
                previousTotalNetProfit += netProfit;
            });
        }
        
        // Moyennes mensuelles
        const avgMonthlyRevenue = totalRevenue / 12;
        const avgMonthlyNetProfit = totalNetProfit / 12;
        const avgMonthlyCharges = (totalLosses + totalPurchases) / 12;
        
        // Comparaisons avec l'année précédente
        const revenueGrowth = previousTotalRevenue > 0 ? 
            ((totalRevenue - previousTotalRevenue) / previousTotalRevenue * 100) : 0;
        const profitGrowth = previousTotalNetProfit > 0 ? 
            ((totalNetProfit - previousTotalNetProfit) / previousTotalNetProfit * 100) : 0;
        
        // Meilleur et pire mois
        const sortedByProfit = [...monthlyData].sort((a, b) => b.netProfit - a.netProfit);
        const bestMonth = sortedByProfit[0];
        const worstMonth = sortedByProfit[sortedByProfit.length - 1];
        
        // Pourcentages
        const chargesPercentage = totalRevenue > 0 ? ((totalLosses + totalPurchases) / totalRevenue * 100) : 0;
        const taxesPercentage = totalRevenue > 0 ? (totalTaxes / totalRevenue * 100) : 0;
        const netMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue * 100) : 0;
        
        // Prévisions pour les mois restants
        const currentMonth = new Date().getMonth();
        const monthsRemaining = Math.max(0, 12 - currentMonth - 1);
        const projectedYearRevenue = monthsRemaining > 0 ? 
            totalRevenue + (avgMonthlyRevenue * monthsRemaining) : totalRevenue;
        const projectedYearProfit = monthsRemaining > 0 ? 
            totalNetProfit + (avgMonthlyNetProfit * monthsRemaining) : totalNetProfit;
        
        return {
            // Totaux actuels
            totalRevenue,
            totalLosses,
            totalPurchases,
            totalGrossProfit,
            totalTaxes,
            totalNetProfit,
            
            // Moyennes
            avgMonthlyRevenue,
            avgMonthlyNetProfit,
            avgMonthlyCharges,
            
            // Comparaisons
            revenueGrowth,
            profitGrowth,
            previousTotalRevenue,
            previousTotalNetProfit,
            
            // Extrêmes
            bestMonth,
            worstMonth,
            
            // Pourcentages
            chargesPercentage,
            taxesPercentage,
            netMargin,
            
            // Prévisions
            projectedYearRevenue,
            projectedYearProfit,
            monthsRemaining,
            
            // Données détaillées
            monthlyData,
            currentYear,
            previousYear
        };
    },
    
    /**
     * Créer le contenu du modal des statistiques
     */
    createStatsModal: function(stats, currentYear) {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };
        
        const formatPercentage = (value) => {
            return value.toFixed(1) + '%';
        };
        
        const getGrowthIcon = (value) => {
            if (value > 0) return '📈';
            if (value < 0) return '📉';
            return '➡️';
        };
        
        const getGrowthClass = (value) => {
            if (value > 0) return 'positive';
            if (value < 0) return 'negative';
            return 'neutral';
        };
        
        return `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📊 Statistiques Détaillées - ${currentYear}</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Vue d'ensemble -->
                    <div class="stats-section">
                        <h3>📈 Vue d'ensemble</h3>
                        <div class="stats-grid">
                            <div class="stat-card highlight">
                                <div class="stat-icon">💰</div>
                                <div class="stat-info">
                                    <div class="stat-label">Chiffre d'affaires total</div>
                                    <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                                    <div class="stat-growth ${getGrowthClass(stats.revenueGrowth)}">
                                        ${getGrowthIcon(stats.revenueGrowth)} ${formatPercentage(stats.revenueGrowth)} vs ${stats.previousYear}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stat-card highlight">
                                <div class="stat-icon">🎯</div>
                                <div class="stat-info">
                                    <div class="stat-label">Bénéfice net total</div>
                                    <div class="stat-value ${stats.totalNetProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(stats.totalNetProfit)}</div>
                                    <div class="stat-growth ${getGrowthClass(stats.profitGrowth)}">
                                        ${getGrowthIcon(stats.profitGrowth)} ${formatPercentage(stats.profitGrowth)} vs ${stats.previousYear}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-info">
                                    <div class="stat-label">Marge nette</div>
                                    <div class="stat-value">${formatPercentage(stats.netMargin)}</div>
                                    <div class="stat-subtitle">du chiffre d'affaires</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">💳</div>
                                <div class="stat-info">
                                    <div class="stat-label">Charges sociales</div>
                                    <div class="stat-value">${formatCurrency(stats.totalTaxes)}</div>
                                    <div class="stat-subtitle">${formatPercentage(stats.taxesPercentage)} du CA</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Moyennes mensuelles -->
                    <div class="stats-section">
                        <h3>📅 Moyennes mensuelles</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">💵</div>
                                <div class="stat-info">
                                    <div class="stat-label">CA moyen/mois</div>
                                    <div class="stat-value">${formatCurrency(stats.avgMonthlyRevenue)}</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">✨</div>
                                <div class="stat-info">
                                    <div class="stat-label">Bénéfice moyen/mois</div>
                                    <div class="stat-value ${stats.avgMonthlyNetProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(stats.avgMonthlyNetProfit)}</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">📉</div>
                                <div class="stat-info">
                                    <div class="stat-label">Charges moyennes/mois</div>
                                    <div class="stat-value">${formatCurrency(stats.avgMonthlyCharges)}</div>
                                    <div class="stat-subtitle">${formatPercentage(stats.chargesPercentage)} du CA</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Performances extrêmes -->
                    <div class="stats-section">
                        <h3>🏆 Performances extrêmes</h3>
                        <div class="stats-grid">
                            <div class="stat-card success">
                                <div class="stat-icon">🥇</div>
                                <div class="stat-info">
                                    <div class="stat-label">Meilleur mois</div>
                                    <div class="stat-value">${stats.bestMonth.month}</div>
                                    <div class="stat-subtitle">${formatCurrency(stats.bestMonth.netProfit)} de bénéfice</div>
                                </div>
                            </div>
                            
                            <div class="stat-card ${stats.worstMonth.netProfit < 0 ? 'danger' : 'warning'}">
                                <div class="stat-icon">⚠️</div>
                                <div class="stat-info">
                                    <div class="stat-label">Mois le plus difficile</div>
                                    <div class="stat-value">${stats.worstMonth.month}</div>
                                    <div class="stat-subtitle">${formatCurrency(stats.worstMonth.netProfit)} de bénéfice</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Prévisions -->
                    ${stats.monthsRemaining > 0 ? `
                    <div class="stats-section">
                        <h3>🔮 Prévisions fin d'année</h3>
                        <div class="stats-grid">
                            <div class="stat-card info">
                                <div class="stat-icon">🎯</div>
                                <div class="stat-info">
                                    <div class="stat-label">CA projeté</div>
                                    <div class="stat-value">${formatCurrency(stats.projectedYearRevenue)}</div>
                                    <div class="stat-subtitle">Basé sur ${stats.monthsRemaining} mois restants</div>
                                </div>
                            </div>
                            
                            <div class="stat-card info">
                                <div class="stat-icon">💎</div>
                                <div class="stat-info">
                                    <div class="stat-label">Bénéfice projeté</div>
                                    <div class="stat-value">${formatCurrency(stats.projectedYearProfit)}</div>
                                    <div class="stat-subtitle">Si tendance maintenue</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Graphiques -->
                    <div class="stats-section">
                        <h3>📊 Analyses visuelles</h3>
                        <div class="charts-container">
                            <div class="chart-item">
                                <h4>Répartition des revenus/charges</h4>
                                <canvas id="statsDistributionChart" width="400" height="300"></canvas>
                            </div>
                            <div class="chart-item">
                                <h4>Évolution mensuelle</h4>
                                <canvas id="statsEvolutionChart" width="400" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Détails mensuels -->
                    <div class="stats-section">
                        <h3>📋 Détail par mois</h3>
                        <div class="monthly-details">
                            <table class="stats-table">
                                <thead>
                                    <tr>
                                        <th>Mois</th>
                                        <th>CA</th>
                                        <th>Charges</th>
                                        <th>Bénéfice brut</th>
                                        <th>Charges sociales</th>
                                        <th>Bénéfice net</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.monthlyData.map(month => `
                                        <tr>
                                            <td><strong>${month.month}</strong></td>
                                            <td>${formatCurrency(month.revenue)}</td>
                                            <td>${formatCurrency(month.losses + month.purchases)}</td>
                                            <td class="${month.grossProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(month.grossProfit)}</td>
                                            <td>${formatCurrency(month.taxes)}</td>
                                            <td class="${month.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(month.netProfit)}</td>
                                            <td class="performance-indicator">
                                                ${month.netProfit > stats.avgMonthlyNetProfit ? '🟢' : month.netProfit > 0 ? '🟡' : '🔴'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="StatsModule.exportStats()">📄 Exporter le rapport</button>
                    <button class="btn btn-secondary close-modal">Fermer</button>
                </div>
            </div>
            
            <style>
                .stats-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color, #2563eb);
                }
                
                .stats-section h3 {
                    margin: 0 0 20px 0;
                    color: #1f2937;
                    font-size: 1.25rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                
                .stat-card.highlight {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                }
                
                .stat-card.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                }
                
                .stat-card.danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                }
                
                .stat-card.warning {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                }
                
                .stat-card.info {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                }
                
                .stat-icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                }
                
                .stat-info {
                    flex: 1;
                }
                
                .stat-label {
                    font-size: 0.875rem;
                    opacity: 0.9;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .stat-subtitle, .stat-growth {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }
                
                .stat-growth.positive {
                    color: #10b981;
                }
                
                .stat-growth.negative {
                    color: #ef4444;
                }
                
                .stat-growth.neutral {
                    color: #6b7280;
                }
                
                .charts-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 30px;
                    margin-top: 20px;
                }
                
                .chart-item {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .chart-item h4 {
                    margin: 0 0 15px 0;
                    text-align: center;
                    color: #374151;
                }
                
                .stats-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .stats-table th,
                .stats-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .stats-table th {
                    background: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                }
                
                .stats-table tr:hover {
                    background: #f9fafb;
                }
                
                .positive {
                    color: #059669;
                    font-weight: 600;
                }
                
                .negative {
                    color: #dc2626;
                    font-weight: 600;
                }
                
                .performance-indicator {
                    text-align: center;
                    font-size: 1.2rem;
                }
                
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .charts-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .chart-item {
                        min-width: 100%;
                    }
                    
                    .stats-table {
                        font-size: 0.8rem;
                    }
                    
                    .stats-table th,
                    .stats-table td {
                        padding: 8px 10px;
                    }
                }
            </style>
        `;
    },
      /**
     * Initialiser les graphiques du module stats
     */
    initStatsCharts: function(stats) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js non disponible pour les statistiques');
            return;
        }
        
        try {
            // Détruire les graphiques existants avant d'en créer de nouveaux
            this.destroyAllCharts();
            
            // Graphique de distribution (camembert)
            const distributionCanvas = document.getElementById('statsDistributionChart');
            if (distributionCanvas) {
                const distributionCtx = distributionCanvas.getContext('2d');
                this.charts.distributionChart = new Chart(distributionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Bénéfice net', 'Charges sociales', 'Pertes & Achats'],
                        datasets: [{
                            data: [
                                Math.max(0, stats.totalNetProfit),
                                stats.totalTaxes,
                                stats.totalLosses + stats.totalPurchases
                            ],
                            backgroundColor: [
                                '#10b981',
                                '#f59e0b',
                                '#ef4444'
                            ],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.parsed;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return context.label + ': ' + value.toLocaleString('fr-FR') + '€ (' + percentage + '%)';
                                    }
                                }
                            }
                        }
                    }
                });
            }
              // Graphique d'évolution mensuelle
            const evolutionCanvas = document.getElementById('statsEvolutionChart');
            if (evolutionCanvas) {
                const evolutionCtx = evolutionCanvas.getContext('2d');
                this.charts.evolutionChart = new Chart(evolutionCtx, {
                    type: 'line',
                    data: {
                        labels: stats.monthlyData.map(m => m.month.substring(0, 3)),
                        datasets: [
                            {
                                label: 'Chiffre d\'affaires',
                                data: stats.monthlyData.map(m => m.revenue),
                                borderColor: '#3b82f6',
                                backgroundColor: '#3b82f620',
                                tension: 0.4,
                                fill: false
                            },
                            {
                                label: 'Bénéfice net',
                                data: stats.monthlyData.map(m => m.netProfit),
                                borderColor: '#10b981',
                                backgroundColor: '#10b98120',
                                tension: 0.4,
                                fill: false
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('fr-FR') + '€';
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
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des graphiques statistiques:', error);
        }
    },
    
    /**
     * Exporter le rapport de statistiques
     */
    exportStats: function() {
        if (typeof app !== 'undefined') {
            app.showNotification('Export du rapport en cours de développement', 'info');
        } else {
            alert('Export du rapport en cours de développement');
        }
    },
    
    /**
     * Afficher une erreur
     */
    showError: function(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'danger');
        } else {
            alert('Erreur: ' + message);
        }
    }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsModule;
}

console.log('📊 Module de statistiques détaillées chargé et prêt');