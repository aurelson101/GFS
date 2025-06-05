/**
 * Module de Prévisions Financières
 * Génère des prévisions basées sur les données historiques
 */

// Vérifier si le module existe déjà pour éviter les redéclarations
if (typeof ForecastModule === 'undefined') {

const ForecastModule = {
    charts: {}, // Stocker les instances des graphiques
    modals: [], // Stocker les références des modals ouverts

    /**
     * Afficher le module de prévisions
     */
    showForecast(data, currentYear, config) {
        // Fermer les modals existants
        this.closeAllModals();

        console.log('🔮 Affichage des prévisions');
        
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
                                        <td><strong>${month.month}</strong></td>
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
    
    /**
     * Calculer les prévisions
     */
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
    
    /**
     * Calculer la moyenne
     */
    calculateAverage(array) {
        const validValues = array.filter(val => !isNaN(val) && val > 0);
        return validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : 0;
    },
    
    /**
     * Facteur saisonnier simplifié
     */
    getSeasonalFactor(monthIndex) {
        // Facteurs saisonniers approximatifs (basés sur des moyennes sectorielles)
        const factors = [0.9, 0.85, 1.1, 1.05, 1.1, 1.0, 0.95, 0.8, 1.15, 1.2, 1.1, 1.0];
        return factors[monthIndex] || 1.0;
    },
    
    /**
     * Calculer la confiance de la prévision
     */
    calculateConfidence(monthIndex, currentYearData) {
        // Plus on a de données historiques, plus la confiance est élevée
        const completedMonths = currentYearData.filter(m => m.revenue > 0).length;
        const baseConfidence = Math.min(80, completedMonths * 8);
        
        // Réduire la confiance pour les mois plus éloignés
        const distancePenalty = Math.max(0, (monthIndex - completedMonths) * 5);
        
        return Math.max(30, baseConfidence - distancePenalty);
    },
    
    /**
     * Identifier les meilleurs mois
     */
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
    
    /**
     * Créer le graphique de prévisions
     */
    createForecastChart(canvasId, data, options) {
        // Vérifier si un graphique existe déjà pour ce canvas et le détruire
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
      /**
     * Changer d'onglet dans les prévisions
     */
    showForecastTab(tabName, e) {
        // Masquer tous les onglets
        document.querySelectorAll('.forecast-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Masquer tous les boutons actifs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        const selectedTab = document.getElementById(`${tabName}-forecast`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Activer le bouton correspondant
        if (e && e.target) {
            e.target.classList.add('active');
        } else {
            // Sélectionner le bouton manuellement si aucun événement n'est fourni
            const button = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
            if (button) button.classList.add('active');
        }
    },
      /**
     * Exporter les prévisions
     */    exportForecast() {
        try {
            const canvas = document.getElementById('forecastChart');
            if (!canvas) {
                console.error('Canvas pour le graphique de prévisions introuvable.');
                return;
            }

            if (window.jspdf && window.jspdf.jsPDF) {
                // Si jsPDF est disponible via window.jspdf, l'utiliser
                const pdf = new window.jspdf.jsPDF();
                pdf.setFontSize(16);
                pdf.text('Prévisions Financières', 15, 20);
                
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, 30, 180, 100);
                
                pdf.save('previsions_financieres.pdf');
                
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Prévisions exportées en PDF avec succès', 'success');
                }
            } else {
                // Sinon, exporter simplement en PNG
                const link = document.createElement('a');
                link.download = 'previsions_financieres.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Prévisions exportées en PNG (PDF non disponible)', 'info');
                }
            }
        } catch (error) {
            console.error('Erreur d\'exportation:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation', 'error');
            }
        }
    },
    
    /**
     * Créer un budget à partir des prévisions
     */
    createBudgetFromForecast() {
        app.showNotification('💰 Création du budget à partir des prévisions...', 'info');
        // Déclencher le module budget
        if (typeof BudgetModule !== 'undefined') {
            app.closeModal();
            setTimeout(() => {
                BudgetModule.showBudget(app.data, app.currentYear, app.config);
            }, 300);
        }
    },
    
    /**
     * Formater la devise
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Fermer tous les modals
     */
    closeAllModals() {
        this.modals.forEach(modal => modal.remove());
        this.modals = [];
    },    /**
     * Créer un modal
     */
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

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
                this.modals = this.modals.filter(m => m !== modal);
            });
        });        document.body.appendChild(modal);
        return modal;
    },

    /**
     * Exporter le graphique de prévisions
     */
    exportForecastChart() {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) {
            console.error('Canvas pour le graphique de prévisions introuvable.');
            return;
        }

        const link = document.createElement('a');
        link.download = 'previsions_revenus.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        console.log('📤 Graphique de prévisions exporté avec succès.');
    },

    /**
     * Exporter les prévisions en PDF
     */    exportForecastToPDF() {
        try {
            const canvas = document.getElementById('forecastChart');
            if (!canvas) {
                console.error('Canvas pour le graphique de prévisions introuvable.');
                return;
            }

            // Vérifier si jsPDF est disponible
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('La bibliothèque jsPDF n\'est pas chargée.');
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Erreur: jsPDF non disponible. Vérifiez votre connexion internet.', 'error');
                }
                return;
            }

            // Utiliser jsPDF avec autoTable
            const { jsPDF } = window.jspdf;
            
            // Créer un nouveau document PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Titre principal
            pdf.setFontSize(20);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Rapport de Prévisions Financières', 105, 15, { align: 'center' });
            
            // Sous-titre avec la date
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 22, { align: 'center' });
            
            // Graphique
            const canvasDataURL = canvas.toDataURL('image/png');
            pdf.addImage(canvasDataURL, 'PNG', 15, 30, 180, 80);
            
            // Informations résumées
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Résumé des Prévisions', 15, 120);
            
            // Récupérer les données actuelles
            const currentData = document.querySelector('.forecast-summary');
            const cards = currentData ? Array.from(currentData.querySelectorAll('.forecast-card')) : [];
            
            // Y position pour le prochain élément
            let yPos = 130;
            
            // Dessiner le cadre de résumé
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(248, 250, 252);
            pdf.rect(15, 125, 180, 35, 'FD');
            
            if (cards.length >= 3) {
                const caCard = cards[0];
                const beneficeCard = cards[1];
                const chargesCard = cards[2];
                
                const caValue = caCard.querySelector('.forecast-value').textContent;
                const caGrowth = caCard.querySelector('small').textContent;
                
                const beneficeValue = beneficeCard.querySelector('.forecast-value').textContent;
                const beneficeMargin = beneficeCard.querySelector('small').textContent;
                
                const chargesValue = chargesCard.querySelector('.forecast-value').textContent;
                const chargesEvolution = chargesCard.querySelector('small').textContent;
                
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                
                // Revenus
                pdf.text('Chiffre d\'Affaires Prévu:', 25, yPos);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(16, 185, 129); // Vert
                pdf.text(caValue, 120, yPos);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(caGrowth, 160, yPos);
                
                // Bénéfice
                pdf.setTextColor(0, 0, 0);
                pdf.text('Bénéfice Net Prévu:', 25, yPos + 10);
                pdf.setFont('helvetica', 'bold');
                const beneficeColor = beneficeValue.includes('-') ? [239, 68, 68] : [16, 185, 129]; // Rouge ou vert
                pdf.setTextColor(...beneficeColor);
                pdf.text(beneficeValue, 120, yPos + 10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(beneficeMargin, 160, yPos + 10);
                
                // Charges
                pdf.setTextColor(0, 0, 0);
                pdf.text('Charges Prévues:', 25, yPos + 20);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(59, 130, 246); // Bleu
                pdf.text(chargesValue, 120, yPos + 20);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(chargesEvolution, 160, yPos + 20);
            }
            
            // Tableau des prévisions mensuelles
            yPos = 170;
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Prévisions Mensuelles Détaillées', 15, yPos);
            
            const tableRows = [];
            const tableData = document.querySelector('.forecast-table');
            if (tableData) {
                const rows = tableData.querySelectorAll('tbody tr');
                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        const month = cells[0].textContent.trim();
                        const revenue = cells[1].textContent.trim();
                        const expenses = cells[2].textContent.trim();
                        const netProfit = cells[3].textContent.trim();
                        tableRows.push([month, revenue, expenses, netProfit]);
                    }
                });
            }
            
            // Créer le tableau dans le PDF
            pdf.autoTable({
                startY: yPos + 5,
                head: [['Mois', 'CA Prévu', 'Charges Prévues', 'Bénéfice Net']],
                body: tableRows,
                theme: 'striped',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 40, halign: 'right' },
                    2: { cellWidth: 40, halign: 'right' },
                    3: { cellWidth: 40, halign: 'right' }
                },
                alternateRowStyles: {
                    fillColor: [245, 250, 255]
                }
            });
            
            // Ajouter les scénarios sur une nouvelle page
            pdf.addPage();
            pdf.setFontSize(20);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Analyse de Scénarios', 105, 15, { align: 'center' });
            
            // Récupérer les scénarios
            const scenariosData = document.querySelector('.scenarios-grid');
            if (scenariosData) {
                const scenarioCards = scenariosData.querySelectorAll('.scenario-card');
                let yScenario = 30;
                
                // Dessiner les trois scénarios
                if (scenarioCards.length >= 3) {
                    const scenarioColors = [
                        [16, 185, 129],  // Vert pour optimiste
                        [59, 130, 246],  // Bleu pour réaliste
                        [239, 68, 68]    // Rouge pour pessimiste
                    ];
                    
                    scenarioCards.forEach((card, index) => {
                        const title = card.querySelector('h5').textContent.trim();
                        const value = card.querySelector('.scenario-value').textContent.trim();
                        const netProfit = card.querySelector('p').textContent.trim();
                        
                        // Cadre du scénario
                        pdf.setDrawColor(200, 200, 200);
                        pdf.setFillColor(248, 250, 252);
                        pdf.rect(15, yScenario, 180, 30, 'FD');
                        
                        // Titre avec une barre de couleur
                        pdf.setDrawColor(...scenarioColors[index]);
                        pdf.setLineWidth(1.5);
                        pdf.line(15, yScenario, 15, yScenario + 30);
                        
                        // Texte du scénario
                        pdf.setFontSize(14);
                        pdf.setTextColor(44, 62, 80);
                        pdf.text(title, 20, yScenario + 10);
                        
                        pdf.setFontSize(12);
                        pdf.text('Revenus:', 25, yScenario + 20);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(...scenarioColors[index]);
                        pdf.text(value, 70, yScenario + 20);
                        
                        pdf.setFont('helvetica', 'normal');
                        pdf.setTextColor(44, 62, 80);
                        pdf.text(netProfit, 125, yScenario + 20);
                        
                        yScenario += 40;
                    });
                }
            }
            
            // Analyse des tendances
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Analyse des Tendances', 15, yScenario + 10);
            
            const trendsData = document.querySelector('.trends-analysis');
            if (trendsData) {
                const trendItems = trendsData.querySelectorAll('.trend-item');
                let yTrends = yScenario + 20;
                
                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(248, 250, 252);
                pdf.rect(15, yTrends, 180, trendItems.length * 15 + 10, 'FD');
                
                yTrends += 10;
                
                trendItems.forEach((item) => {
                    const title = item.querySelector('h5').textContent.trim();
                    const value = item.querySelector('div:not(h5)').textContent.trim();
                    
                    pdf.setFontSize(11);
                    pdf.setTextColor(44, 62, 80);
                    pdf.text(title + ':', 25, yTrends);
                    
                    const isPositive = value.includes('+') || !value.includes('-');
                    pdf.setTextColor(isPositive ? 16 : 239, isPositive ? 185 : 68, isPositive ? 129 : 68);
                    pdf.text(value, 120, yTrends);
                    
                    yTrends += 15;
                });
            }
            
            // Pied de page sur toutes les pages
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Page ${i} sur ${totalPages} - SAS Financial Manager`, 105, 285, { align: 'center' });
            }
            
            // Sauvegarder le PDF
            pdf.save('rapport_previsions_financieres.pdf');
            
            console.log('📤 Rapport de prévisions complet exporté en PDF avec succès.');
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport PDF généré avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation en PDF:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de la génération du PDF', 'error');
            }
        }
    },
    /**
     * Exporter les prévisions au format JSON/Excel
     */
    exportForecastToJSON() {
        try {
            // Récupérer les données de prévision
            const forecastTable = document.querySelector('.forecast-table');
            if (!forecastTable) {
                console.error('Table de prévisions introuvable.');
                return;
            }

            const headers = [];
            const headerCells = forecastTable.querySelectorAll('thead th');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });

            const rows = [];
            const tableRows = forecastTable.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                const rowData = {};
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    // Nettoyer les valeurs (enlever le symbole € et les espaces)
                    let value = cell.textContent.trim();
                    if (index > 0 && index < 4) { // Colonnes numériques (CA, Charges, Bénéfice)
                        value = value.replace(/[^0-9,-]/g, '').replace(',', '.');
                        value = parseFloat(value) || 0;
                    }
                    rowData[headers[index] || `Column${index}`] = value;
                });
                rows.push(rowData);
            });

            // Créer un objet avec toutes les données
            const exportData = {
                title: "Prévisions Financières",
                generatedAt: new Date().toISOString(),
                forecasts: rows
            };

            // Convertir en JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Créer un blob et télécharger
            const blob = new Blob([jsonData], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'previsions_financieres.json';
            link.click();
            
            console.log('📤 Données de prévisions exportées en JSON avec succès');
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Données exportées en JSON avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation en JSON:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation en JSON', 'error');
            }
        }
    },
    /**
     * Exporter les prévisions au format Excel (CSV)
     */
    exportForecastToExcel() {
        try {
            // Récupérer les données de prévision
            const forecastTable = document.querySelector('.forecast-table');
            if (!forecastTable) {
                console.error('Table de prévisions introuvable.');
                return;
            }

            // Récupérer les en-têtes
            const headers = [];
            const headerCells = forecastTable.querySelectorAll('thead th');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });

            // Préparer les lignes du CSV
            let csvContent = headers.join(';') + '\r\n';

            // Récupérer les données des lignes
            const tableRows = forecastTable.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('td');
                
                cells.forEach((cell, index) => {
                    // Nettoyer les valeurs (adapter pour Excel format français)
                    let value = cell.textContent.trim();
                    if (index > 0 && index < 4) { // Colonnes numériques (CA, Charges, Bénéfice)
                        // Garder le format français pour Excel FR (virgule comme séparateur décimal)
                        value = value.replace('€', '').trim();
                    }
                    // Échapper les guillemets pour CSV
                    value = value.replace(/"/g, '""');
                    // Entourer de guillemets si besoin
                    if (value.includes(';') || value.includes('\n') || value.includes('"')) {
                        value = `"${value}"`;
                    }
                    rowData.push(value);
                });
                
                csvContent += rowData.join(';') + '\r\n';
            });

            // Ajouter un résumé en bas du fichier
            csvContent += '\r\n';
            
            // Récupérer les données de résumé
            const summaryData = document.querySelector('.forecast-summary');
            if (summaryData) {
                const cards = summaryData.querySelectorAll('.forecast-card');
                cards.forEach(card => {
                    const title = card.querySelector('h4').textContent.trim();
                    const value = card.querySelector('.forecast-value').textContent.trim();
                    const info = card.querySelector('small').textContent.trim();
                    csvContent += `"${title}";"${value}";"${info}"\r\n`;
                });
            }

            // Utiliser BOM (Byte Order Mark) pour indiquer que c'est de l'UTF-8
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'previsions_financieres.csv';
            link.click();
            
            console.log('📤 Données de prévisions exportées en Excel/CSV avec succès');
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Données exportées en format Excel avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation en Excel:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation en Excel', 'error');
            }
        }
    },
};

// Export du module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForecastModule;
}

// Ajouter le module à la portée globale
window.ForecastModule = ForecastModule;

}