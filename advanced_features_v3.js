/**
 * Module Fonctionnalités Avancées v3.0
 * Nouvelles fonctionnalités et améliorations
 */

// Module d'export PDF amélioré
const PDFExportModule = {
    async generatePDF(data, config, year) {
        try {
            // Créer le contenu HTML pour le PDF
            const htmlContent = this.generateHTMLContent(data, config, year);
            
            // Utiliser html2canvas et jsPDF si disponibles
            if (typeof html2canvas !== 'undefined' && typeof jsPDF !== 'undefined') {
                return await this.generateWithLibraries(htmlContent);
            } else {
                // Fallback: ouvrir dans une nouvelle fenêtre pour impression
                return this.openPrintWindow(htmlContent);
            }
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            throw new Error('Impossible de générer le PDF');
        }
    },
    
    generateHTMLContent(data, config, year) {
        const yearData = data[year] || [];
        const totals = this.calculateTotals(yearData, config.taxRate);
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Financier ${year}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .table th { background-color: #f8f9fa; font-weight: bold; }
                    .totals { background-color: #e3f2fd; font-weight: bold; }
                    .charts { page-break-before: always; }
                    .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Rapport Financier ${year}</h1>
                    <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                
                <div class="summary">
                    <h2>Résumé Annuel</h2>
                    <p><strong>Chiffre d'affaires total :</strong> ${this.formatCurrency(totals.revenue)}</p>
                    <p><strong>Pertes totales :</strong> ${this.formatCurrency(totals.losses)}</p>
                    <p><strong>Achats professionnels :</strong> ${this.formatCurrency(totals.purchases)}</p>
                    <p><strong>Bénéfice net :</strong> ${this.formatCurrency(totals.netProfit)}</p>
                    <p><strong>Taux de charges sociales :</strong> ${config.taxRate}%</p>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mois</th>
                            <th>Chiffre d'affaires</th>
                            <th>Pertes</th>
                            <th>Achats professionnels</th>
                            <th>Bénéfice brut</th>
                            <th>Charges sociales</th>
                            <th>Bénéfice net</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${yearData.map(month => {
                            const grossProfit = month.revenue - month.losses - month.purchases;
                            const taxes = grossProfit > 0 ? grossProfit * config.taxRate / 100 : 0;
                            const netProfit = grossProfit - taxes;
                            
                            return `
                                <tr>
                                    <td>${month.month}</td>
                                    <td>${this.formatCurrency(month.revenue)}</td>
                                    <td>${this.formatCurrency(month.losses)}</td>
                                    <td>${this.formatCurrency(month.purchases)}</td>
                                    <td>${this.formatCurrency(grossProfit)}</td>
                                    <td>${this.formatCurrency(taxes)}</td>
                                    <td>${this.formatCurrency(netProfit)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="totals">
                            <td><strong>TOTAL</strong></td>
                            <td><strong>${this.formatCurrency(totals.revenue)}</strong></td>
                            <td><strong>${this.formatCurrency(totals.losses)}</strong></td>
                            <td><strong>${this.formatCurrency(totals.purchases)}</strong></td>
                            <td><strong>${this.formatCurrency(totals.grossProfit)}</strong></td>
                            <td><strong>${this.formatCurrency(totals.taxes)}</strong></td>
                            <td><strong>${this.formatCurrency(totals.netProfit)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </body>
            </html>
        `;
    },
    
    calculateTotals(yearData, taxRate) {
        return yearData.reduce((acc, month) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? grossProfit * taxRate / 100 : 0;
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
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    openPrintWindow(htmlContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
            printWindow.print();
        };
        
        return Promise.resolve();
    }
};

// Module de prévisions financières
const ForecastModule = {
    generateForecast(data, year, periods = 12) {
        const yearData = data[year] || [];
        
        if (yearData.length < 3) {
            throw new Error('Pas assez de données pour générer des prévisions (minimum 3 mois)');
        }
        
        const forecasts = {
            linear: this.linearForecast(yearData, periods),
            exponential: this.exponentialForecast(yearData, periods),
            seasonal: this.seasonalForecast(yearData, periods),
            trends: this.analyzetrends(yearData)
        };
        
        return forecasts;
    },
    
    linearForecast(yearData, periods) {
        const revenue = yearData.map(m => m.revenue);
        const losses = yearData.map(m => m.losses);
        const purchases = yearData.map(m => m.purchases);
        
        const revenueSlope = this.calculateSlope(revenue);
        const lossesSlope = this.calculateSlope(losses);
        const purchasesSlope = this.calculateSlope(purchases);
        
        const forecast = [];
        const lastRevenue = revenue[revenue.length - 1];
        const lastLosses = losses[losses.length - 1];
        const lastPurchases = purchases[purchases.length - 1];
        
        for (let i = 1; i <= periods; i++) {
            forecast.push({
                period: i,
                revenue: Math.max(0, lastRevenue + (revenueSlope * i)),
                losses: Math.max(0, lastLosses + (lossesSlope * i)),
                purchases: Math.max(0, lastPurchases + (purchasesSlope * i))
            });
        }
        
        return forecast;
    },
    
    exponentialForecast(yearData, periods) {
        const revenue = yearData.map(m => m.revenue).filter(v => v > 0);
        
        if (revenue.length < 2) return [];
        
        const growthRate = this.calculateGrowthRate(revenue);
        const forecast = [];
        const lastRevenue = revenue[revenue.length - 1];
        
        for (let i = 1; i <= periods; i++) {
            forecast.push({
                period: i,
                revenue: lastRevenue * Math.pow(1 + growthRate, i),
                confidence: Math.max(0.5, 1 - (i * 0.1)) // Confiance décroissante
            });
        }
        
        return forecast;
    },
    
    seasonalForecast(yearData, periods) {
        if (yearData.length < 12) return [];
        
        // Calculer les indices saisonniers
        const monthlyAverages = this.calculateMonthlyAverages(yearData);
        const overallAverage = monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length;
        const seasonalIndices = monthlyAverages.map(avg => avg / overallAverage);
        
        const forecast = [];
        const trend = this.calculateSlope(yearData.map(m => m.revenue));
        const lastRevenue = yearData[yearData.length - 1].revenue;
        
        for (let i = 1; i <= periods; i++) {
            const monthIndex = (yearData.length + i - 1) % 12;
            const trendValue = lastRevenue + (trend * i);
            const seasonalValue = trendValue * seasonalIndices[monthIndex];
            
            forecast.push({
                period: i,
                month: this.getMonthName(monthIndex),
                revenue: Math.max(0, seasonalValue),
                seasonalIndex: seasonalIndices[monthIndex]
            });
        }
        
        return forecast;
    },
    
    analyzetrends(yearData) {
        const revenue = yearData.map(m => m.revenue);
        const losses = yearData.map(m => m.losses);
        const netProfit = yearData.map((m, i) => {
            const gross = m.revenue - m.losses - m.purchases;
            return gross - (gross > 0 ? gross * 0.25 : 0); // Assuming 25% tax
        });
        
        return {
            revenueGrowth: this.calculateGrowthRate(revenue),
            lossesGrowth: this.calculateGrowthRate(losses),
            profitabilityTrend: this.calculateSlope(netProfit),
            volatility: this.calculateVolatility(revenue),
            bestMonth: Math.max(...revenue),
            worstMonth: Math.min(...revenue),
            consistency: this.calculateConsistency(revenue)
        };
    },
    
    calculateSlope(data) {
        const n = data.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * data[i], 0);
        const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    },
    
    calculateGrowthRate(data) {
        if (data.length < 2) return 0;
        
        const validData = data.filter(v => v > 0);
        if (validData.length < 2) return 0;
        
        const firstValue = validData[0];
        const lastValue = validData[validData.length - 1];
        
        return Math.pow(lastValue / firstValue, 1 / (validData.length - 1)) - 1;
    },
    
    calculateMonthlyAverages(yearData) {
        const monthlyData = Array(12).fill().map(() => []);
        
        yearData.forEach((month, index) => {
            monthlyData[index % 12].push(month.revenue);
        });
        
        return monthlyData.map(monthData => {
            return monthData.length > 0 ? monthData.reduce((a, b) => a + b, 0) / monthData.length : 0;
        });
    },
    
    calculateVolatility(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / data.length;
        return Math.sqrt(variance) / mean; // Coefficient de variation
    },
    
    calculateConsistency(data) {
        const changes = [];
        for (let i = 1; i < data.length; i++) {
            if (data[i-1] !== 0) {
                changes.push(Math.abs((data[i] - data[i-1]) / data[i-1]));
            }
        }
        
        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        return 1 - Math.min(avgChange, 1); // 1 = très consistant, 0 = très variable
    },
    
    getMonthName(index) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[index];
    },
    
    showForecastModal(forecasts, year) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>🔮 Prévisions Financières pour ${parseInt(year) + 1}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="forecast-tabs">
                        <button class="tab-btn active" data-tab="linear">Prévision Linéaire</button>
                        <button class="tab-btn" data-tab="seasonal">Prévision Saisonnière</button>
                        <button class="tab-btn" data-tab="trends">Analyse des Tendances</button>
                    </div>
                    
                    <div class="tab-content active" id="linear-tab">
                        <div class="forecast-chart">
                            <canvas id="forecastChart" width="400" height="200"></canvas>
                        </div>
                        <div class="forecast-summary">
                            <h3>Prévisions pour les 12 prochains mois</h3>
                            <div class="forecast-cards">
                                ${forecasts.linear.slice(0, 12).map((f, i) => `
                                    <div class="forecast-card">
                                        <div class="forecast-month">Mois ${f.period}</div>
                                        <div class="forecast-value">${this.formatCurrency(f.revenue)}</div>
                                        <div class="forecast-change">
                                            ${f.revenue > (forecasts.linear[i-1]?.revenue || 0) ? '📈' : '📉'}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="seasonal-tab">
                        <div class="seasonal-analysis">
                            <h3>Analyse Saisonnière</h3>
                            <div class="seasonal-grid">
                                ${forecasts.seasonal.slice(0, 12).map(f => `
                                    <div class="seasonal-item">
                                        <div class="seasonal-month">${f.month}</div>
                                        <div class="seasonal-revenue">${this.formatCurrency(f.revenue)}</div>
                                        <div class="seasonal-index">
                                            Index: ${(f.seasonalIndex * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="trends-tab">
                        <div class="trends-analysis">
                            <h3>Analyse des Tendances</h3>
                            <div class="trends-grid">
                                <div class="trend-item">
                                    <div class="trend-label">Croissance du CA</div>
                                    <div class="trend-value ${forecasts.trends.revenueGrowth >= 0 ? 'positive' : 'negative'}">
                                        ${(forecasts.trends.revenueGrowth * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div class="trend-item">
                                    <div class="trend-label">Volatilité</div>
                                    <div class="trend-value">${(forecasts.trends.volatility * 100).toFixed(1)}%</div>
                                </div>
                                <div class="trend-item">
                                    <div class="trend-label">Consistance</div>
                                    <div class="trend-value">${(forecasts.trends.consistency * 100).toFixed(0)}%</div>
                                </div>
                                <div class="trend-item">
                                    <div class="trend-label">Meilleur mois</div>
                                    <div class="trend-value">${this.formatCurrency(forecasts.trends.bestMonth)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.custom-modal').remove()">Fermer</button>
                    <button class="btn btn-primary" onclick="ForecastModule.exportForecast()">📤 Exporter</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gestion des onglets
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                modal.querySelector(`#${btn.dataset.tab}-tab`).classList.add('active');
            });
        });
        
        // Fermer modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Créer le graphique de prévisions
        setTimeout(() => {
            this.createForecastChart(forecasts.linear);
        }, 100);
    },
    
    createForecastChart(forecastData) {
        const canvas = document.getElementById('forecastChart');
        if (!canvas || typeof Chart === 'undefined') return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecastData.map(f => `Mois ${f.period}`),
                datasets: [{
                    label: 'Prévision CA',
                    data: forecastData.map(f => f.revenue),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Prévisions de Chiffre d\'Affaires'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' €';
                            }
                        }
                    }
                }
            }
        });
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    exportForecast() {
        // Export des prévisions en CSV
        console.log('Export des prévisions demandé');
    }
};

// Module de sauvegarde dans le cloud
const CloudBackupModule = {
    async saveToCloud(data, apiKey) {
        // Simulation d'une sauvegarde cloud
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                data: data,
                checksum: this.generateChecksum(JSON.stringify(data))
            };
            
            // Simulation d'API call
            await this.simulateApiCall(backupData);
            return { success: true, backupId: this.generateBackupId() };
        } catch (error) {
            throw new Error('Erreur lors de la sauvegarde cloud: ' + error.message);
        }
    },
    
    async loadFromCloud(backupId, apiKey) {
        // Simulation de chargement depuis le cloud
        try {
            const backupData = await this.simulateApiCall(null, 'GET');
            
            if (this.verifyChecksum(backupData)) {
                return backupData.data;
            } else {
                throw new Error('Données corrompues');
            }
        } catch (error) {
            throw new Error('Erreur lors du chargement cloud: ' + error.message);
        }
    },
    
    generateChecksum(data) {
        // Simple checksum pour vérifier l'intégrité
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    },
    
    verifyChecksum(backupData) {
        const expectedChecksum = this.generateChecksum(JSON.stringify(backupData.data));
        return expectedChecksum === backupData.checksum;
    },
    
    generateBackupId() {
        return 'backup_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    },
    
    simulateApiCall(data, method = 'POST') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de succès
                    if (method === 'GET') {
                        resolve({
                            data: { test: 'data' },
                            checksum: 'abc123'
                        });
                    } else {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error('Erreur réseau simulée'));
                }
            }, 1000 + Math.random() * 2000); // 1-3 secondes
        });
    }
};

// Export des modules
if (typeof window !== 'undefined') {
    window.PDFExportModule = PDFExportModule;
    window.ForecastModule = ForecastModule;
    window.CloudBackupModule = CloudBackupModule;
}

console.log('🔧 Module de fonctionnalités avancées v3.0 chargé');