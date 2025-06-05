/**
 * Module de Rapports
 * Permet de générer et exporter des rapports financiers complets
 */

// Vérifier si le module existe déjà pour éviter les redéclarations
if (typeof ReportsModule === 'undefined') {

const ReportsModule = {
    charts: {},
    modals: [],
    
    /**
     * Afficher le module de rapports
     */
    showReports(data, currentYear, config) {
        // Fermer les modals existants
        this.closeAllModals();
        
        console.log('📊 Affichage du module de rapports');
        
        const reportsData = this.generateReportsData(data, currentYear, config);
        
        const content = `
            <div class="reports-container">
                <h3>📊 Rapports Financiers ${currentYear}</h3>
                
                <div class="reports-summary">
                    <div class="report-card">
                        <h4>💰 Revenus Annuels</h4>
                        <div class="report-value positive">${this.formatCurrency(reportsData.totalRevenue)}</div>
                        <small>Évolution: ${reportsData.revenueGrowth >= 0 ? '+' : ''}${reportsData.revenueGrowth}%</small>
                    </div>
                    
                    <div class="report-card">
                        <h4>📈 Bénéfice Net</h4>
                        <div class="report-value ${reportsData.netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(reportsData.netProfit)}</div>
                        <small>Marge: ${reportsData.profitMargin}%</small>
                    </div>
                    
                    <div class="report-card">
                        <h4>💸 Charges Totales</h4>
                        <div class="report-value">${this.formatCurrency(reportsData.totalExpenses)}</div>
                        <small>${reportsData.expenseRatio}% des revenus</small>
                    </div>
                </div>
                
                <div class="reports-tabs">
                    <button class="tab-btn active" onclick="ReportsModule.showReportTab('annual', event)">Rapport Annuel</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('quarterly', event)">Rapports Trimestriels</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('performance', event)">Performance</button>
                </div>
                
                <div id="annual-report" class="report-tab active">
                    <h4>📅 Rapport Annuel ${currentYear}</h4>
                    <div class="report-chart-container">
                        <canvas id="annualReportChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="report-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>CA</th>
                                    <th>Charges</th>
                                    <th>Bénéfice</th>
                                    <th>Marge</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportsData.monthlyData.map(month => `
                                    <tr>
                                        <td><strong>${month.name}</strong></td>
                                        <td class="positive">${this.formatCurrency(month.revenue)}</td>
                                        <td>${this.formatCurrency(month.expenses)}</td>
                                        <td class="${month.profit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.profit)}</td>
                                        <td>${month.margin}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Total</th>
                                    <th class="positive">${this.formatCurrency(reportsData.totalRevenue)}</th>
                                    <th>${this.formatCurrency(reportsData.totalExpenses)}</th>
                                    <th class="${reportsData.netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(reportsData.netProfit)}</th>
                                    <th>${reportsData.profitMargin}%</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                <div id="quarterly-report" class="report-tab">
                    <h4>🗓️ Rapports Trimestriels ${currentYear}</h4>
                    <div class="report-chart-container">
                        <canvas id="quarterlyReportChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="quarterly-grid">
                        ${reportsData.quarterlyData.map((quarter, index) => `
                            <div class="quarterly-card">
                                <h5>T${index + 1} ${currentYear}</h5>
                                <div class="quarterly-value ${quarter.profit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(quarter.profit)}</div>
                                <div class="quarterly-details">
                                    <p>CA: ${this.formatCurrency(quarter.revenue)}</p>
                                    <p>Charges: ${this.formatCurrency(quarter.expenses)}</p>
                                    <p>Marge: ${quarter.margin}%</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div id="performance-report" class="report-tab">
                    <h4>📊 Analyse de Performance</h4>
                    <div class="report-chart-container">
                        <canvas id="performanceChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="performance-metrics">
                        <div class="metric-card">
                            <h5>📈 Croissance du CA</h5>
                            <div class="metric-value ${reportsData.revenueGrowth >= 0 ? 'positive' : 'negative'}">
                                ${reportsData.revenueGrowth >= 0 ? '+' : ''}${reportsData.revenueGrowth}%
                            </div>
                            <p>${this.getPerformanceComment(reportsData.revenueGrowth, 5, 10)}</p>
                        </div>
                        
                        <div class="metric-card">
                            <h5>💰 Rentabilité</h5>
                            <div class="metric-value ${reportsData.profitMargin >= 15 ? 'positive' : reportsData.profitMargin >= 0 ? 'neutral' : 'negative'}">
                                ${reportsData.profitMargin}%
                            </div>
                            <p>${this.getPerformanceComment(reportsData.profitMargin, 15, 25)}</p>
                        </div>
                        
                        <div class="metric-card">
                            <h5>🔄 Stabilité</h5>
                            <div class="metric-value ${reportsData.stability >= 70 ? 'positive' : reportsData.stability >= 40 ? 'neutral' : 'negative'}">
                                ${reportsData.stability}%
                            </div>
                            <p>${this.getPerformanceComment(reportsData.stability, 40, 70)}</p>
                        </div>
                    </div>
                </div>
                
                <div class="report-actions">
                    <button id="exportReportPdfBtn" class="btn btn-primary">📄 Exporter le Rapport</button>
                    <button id="exportReportExcelBtn" class="btn btn-success">📊 Exporter en Excel</button>
                </div>
            </div>
            
            <style>
                .reports-container { max-height: 70vh; overflow-y: auto; padding: 10px; }
                .reports-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .report-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
                .report-card h4 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
                .report-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; }
                .report-value.positive { color: #10b981; }
                .report-value.negative { color: #ef4444; }
                .report-value.neutral { color: #f59e0b; }
                .reports-tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #e5e7eb; }
                .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .tab-btn.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
                .report-tab { display: none; padding: 20px 0; }
                .report-tab.active { display: block; }
                .report-chart-container { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; height: 300px; }
                .report-table { margin: 20px 0; overflow-x: auto; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .table th { background: #f8fafc; font-weight: bold; }
                .table tfoot th { border-top: 2px solid #e5e7eb; }
                .positive { color: #10b981; }
                .negative { color: #ef4444; }
                .quarterly-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin: 20px 0; }
                .quarterly-card { background: #f8fafc; padding: 15px; border-radius: 8px; }
                .quarterly-card h5 { margin: 0 0 10px 0; color: #4b5563; text-align: center; }
                .quarterly-value { font-size: 1.6em; font-weight: bold; margin: 10px 0; text-align: center; }
                .quarterly-details { font-size: 0.9em; color: #6b7280; }
                .quarterly-details p { margin: 5px 0; }
                .performance-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .metric-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
                .metric-card h5 { margin: 0 0 10px 0; color: #4b5563; }
                .metric-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; }
                .metric-card p { margin: 10px 0 0 0; font-size: 0.9em; color: #6b7280; font-style: italic; }
                .report-actions { text-align: center; margin: 20px 0; }
                .report-actions .btn { margin: 0 10px; }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .reports-summary,
                    .quarterly-grid,
                    .performance-metrics { grid-template-columns: 1fr; }
                    .reports-tabs { flex-wrap: wrap; }
                    .tab-btn { flex-basis: 100%; text-align: center; }
                }
            </style>
        `;
        
        const modal = this.createModal('📊 Rapports Financiers', content, 'large');
        this.modals.push(modal);
        
        // Initialiser les graphiques après que le modal soit affiché
        setTimeout(() => {
            this.initializeReportCharts(reportsData);
            this.setupReportEventListeners(reportsData);
        }, 100);
    },
    
    /**
     * Générer les données pour les rapports
     */
    generateReportsData(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        const previousYearData = data[currentYear - 1] || [];
        
        // Données mensuelles
        const monthlyData = currentYearData.map((month, index) => {
            const revenue = month.revenue || 0;
            const expenses = (month.losses || 0) + (month.purchases || 0);
            const profit = revenue - expenses;
            const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
            
            return {
                name: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][index],
                revenue,
                expenses,
                profit,
                margin
            };
        });
        
        // Données trimestrielles
        const quarterlyData = [];
        for (let i = 0; i < 4; i++) {
            const quarterMonths = monthlyData.slice(i * 3, (i + 1) * 3);
            const revenue = quarterMonths.reduce((sum, month) => sum + month.revenue, 0);
            const expenses = quarterMonths.reduce((sum, month) => sum + month.expenses, 0);
            const profit = revenue - expenses;
            const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
            
            quarterlyData.push({ revenue, expenses, profit, margin });
        }
        
        // Calcul des totaux
        const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
        const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
        const expenseRatio = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;
        
        // Calcul de la croissance (année sur année)
        const previousYearRevenue = previousYearData.reduce((sum, month) => sum + (month.revenue || 0), 0);
        const revenueGrowth = previousYearRevenue > 0 
            ? Math.round(((totalRevenue - previousYearRevenue) / previousYearRevenue) * 100) 
            : 0;
        
        // Calcul de la stabilité (variation mensuelle)
        const monthlyVariations = [];
        for (let i = 1; i < monthlyData.length; i++) {
            if (monthlyData[i-1].revenue > 0) {
                const variation = Math.abs((monthlyData[i].revenue - monthlyData[i-1].revenue) / monthlyData[i-1].revenue);
                monthlyVariations.push(variation);
            }
        }
        
        const averageVariation = monthlyVariations.length > 0 
            ? monthlyVariations.reduce((sum, var_) => sum + var_, 0) / monthlyVariations.length 
            : 0;
        const stability = Math.round((1 - Math.min(1, averageVariation)) * 100);
        
        return {
            monthlyData,
            quarterlyData,
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            expenseRatio,
            revenueGrowth,
            stability
        };
    },
    
    /**
     * Initialiser les graphiques des rapports
     */
    initializeReportCharts(reportsData) {
        // Graphique du rapport annuel
        this.createReportChart('annualReportChart', {
            labels: reportsData.monthlyData.map(m => m.name.substring(0, 3)),
            datasets: [
                {
                    label: 'CA',
                    data: reportsData.monthlyData.map(m => m.revenue),
                    borderColor: '#10b981',
                    backgroundColor: '#10b98120',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Charges',
                    data: reportsData.monthlyData.map(m => m.expenses),
                    borderColor: '#ef4444',
                    backgroundColor: '#ef444420',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Bénéfice',
                    data: reportsData.monthlyData.map(m => m.profit),
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
                    text: 'Rapport Financier Annuel'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            }
        });
        
        // Graphique des rapports trimestriels
        this.createReportChart('quarterlyReportChart', {
            labels: ['T1', 'T2', 'T3', 'T4'],
            datasets: [
                {
                    label: 'CA',
                    data: reportsData.quarterlyData.map(q => q.revenue),
                    backgroundColor: '#10b981',
                    borderWidth: 1,
                    borderColor: '#0d9488'
                },
                {
                    label: 'Charges',
                    data: reportsData.quarterlyData.map(q => q.expenses),
                    backgroundColor: '#ef4444',
                    borderWidth: 1,
                    borderColor: '#dc2626'
                },
                {
                    label: 'Bénéfice',
                    data: reportsData.quarterlyData.map(q => q.profit),
                    backgroundColor: '#3b82f6',
                    borderWidth: 1,
                    borderColor: '#2563eb'
                }
            ]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Rapports Financiers Trimestriels'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            }
        }, 'bar');
        
        // Graphique de performance
        this.createReportChart('performanceChart', {
            labels: reportsData.monthlyData.map(m => m.name.substring(0, 3)),
            datasets: [
                {
                    label: 'Marge Bénéficiaire (%)',
                    data: reportsData.monthlyData.map(m => m.margin),
                    borderColor: '#8b5cf6',
                    backgroundColor: '#8b5cf620',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Évolution CA (base 100)',
                    data: this.calculateCumulativeGrowth(reportsData.monthlyData.map(m => m.revenue)),
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b20',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Analyse de Performance'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Marge (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Indice (base 100)'
                    },
                    min: 70,
                    max: 130
                }
            }
        });
    },
    
    /**
     * Configurer les écouteurs d'événements
     */
    setupReportEventListeners(reportsData) {
        // Bouton d'exportation PDF
        const exportPdfBtn = document.getElementById('exportReportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportReportToPDF(reportsData);
            });
        }
        
        // Bouton d'exportation Excel
        const exportExcelBtn = document.getElementById('exportReportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => {
                this.exportReportToExcel(reportsData);
            });
        }
    },
    
    /**
     * Exporter le rapport en PDF
     */
    exportReportToPDF(reportsData) {
        try {
            // Vérifier si jsPDF est disponible
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('La bibliothèque jsPDF n\'est pas chargée.');
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Erreur: jsPDF non disponible. Vérifiez votre connexion internet.', 'error');
                }
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Titre principal
            pdf.setFontSize(20);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Rapport Financier Annuel', 105, 15, { align: 'center' });
            
            // Date
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 22, { align: 'center' });
            
            // Résumé
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Résumé Financier', 15, 35);
            
            // Rectangle de résumé
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(248, 250, 252);
            pdf.rect(15, 40, 180, 30, 'FD');
            
            // Données de résumé
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Revenus Totaux: ${this.formatCurrency(reportsData.totalRevenue)}`, 20, 50);
            pdf.text(`Charges Totales: ${this.formatCurrency(reportsData.totalExpenses)}`, 20, 60);
            
            pdf.text(`Bénéfice Net: ${this.formatCurrency(reportsData.netProfit)}`, 120, 50);
            pdf.text(`Marge Bénéficiaire: ${reportsData.profitMargin}%`, 120, 60);
            
            // Graphique annuel
            const annualCanvas = document.getElementById('annualReportChart');
            if (annualCanvas) {
                pdf.setFontSize(16);
                pdf.setTextColor(44, 62, 80);
                pdf.text('Évolution Annuelle', 15, 80);
                
                const annualImg = annualCanvas.toDataURL('image/png');
                pdf.addImage(annualImg, 'PNG', 15, 85, 180, 70);
            }
            
            // Tableau des données mensuelles
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Données Mensuelles', 15, 165);
            
            // En-têtes du tableau
            const tableHeaders = [['Mois', 'CA', 'Charges', 'Bénéfice', 'Marge']];
            
            // Données du tableau
            const tableData = reportsData.monthlyData.map(month => [
                month.name,
                this.formatCurrency(month.revenue),
                this.formatCurrency(month.expenses),
                this.formatCurrency(month.profit),
                `${month.margin}%`
            ]);
            
            // Ajouter le total
            tableData.push([
                'Total',
                this.formatCurrency(reportsData.totalRevenue),
                this.formatCurrency(reportsData.totalExpenses),
                this.formatCurrency(reportsData.netProfit),
                `${reportsData.profitMargin}%`
            ]);
            
            pdf.autoTable({
                startY: 170,
                head: tableHeaders,
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246], textColor: 255 },
                foot: [tableData[tableData.length - 1]],
                footStyles: { fillColor: [219, 234, 254], textColor: 0, fontStyle: 'bold' },
                didDrawPage: function(data) {
                    // Ajouter un pied de page sur chaque page
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text('SAS Financial Manager - Rapport Confidentiel', 105, 285, { align: 'center' });
                }
            });
            
            // Nouvelle page pour les données trimestrielles
            pdf.addPage();
            
            // Titre pour la page des données trimestrielles
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Rapports Trimestriels', 15, 15);
            
            // Graphique trimestriel
            const quarterlyCanvas = document.getElementById('quarterlyReportChart');
            if (quarterlyCanvas) {
                const quarterlyImg = quarterlyCanvas.toDataURL('image/png');
                pdf.addImage(quarterlyImg, 'PNG', 15, 20, 180, 70);
            }
            
            // Tableau des données trimestrielles
            pdf.setFontSize(14);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Détails Trimestriels', 15, 100);
            
            // En-têtes du tableau trimestriel
            const quarterlyHeaders = [['Trimestre', 'CA', 'Charges', 'Bénéfice', 'Marge']];
            
            // Données du tableau trimestriel
            const quarterlyTableData = reportsData.quarterlyData.map((quarter, index) => [
                `T${index + 1}`,
                this.formatCurrency(quarter.revenue),
                this.formatCurrency(quarter.expenses),
                this.formatCurrency(quarter.profit),
                `${quarter.margin}%`
            ]);
            
            pdf.autoTable({
                startY: 105,
                head: quarterlyHeaders,
                body: quarterlyTableData,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229], textColor: 255 }
            });
            
            // Graphique de performance
            const performanceCanvas = document.getElementById('performanceChart');
            if (performanceCanvas) {
                pdf.setFontSize(16);
                pdf.setTextColor(44, 62, 80);
                pdf.text('Analyse de Performance', 15, 170);
                
                const performanceImg = performanceCanvas.toDataURL('image/png');
                pdf.addImage(performanceImg, 'PNG', 15, 175, 180, 70);
            }
            
            // Enregistrer le PDF
            pdf.save('rapport_financier.pdf');
            
            console.log('📤 Rapport financier exporté en PDF avec succès');
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport exporté en PDF avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation en PDF:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de la génération du PDF', 'error');
            }
        }
    },
    
    /**
     * Exporter le rapport en Excel (CSV)
     */
    exportReportToExcel(reportsData) {
        try {
            // Préparer les données CSV pour le rapport annuel
            let csvContent = "Rapport Financier Annuel\r\n\r\n";
            
            // Résumé
            csvContent += "Résumé:\r\n";
            csvContent += `Revenus Totaux;${this.formatCurrency(reportsData.totalRevenue)}\r\n`;
            csvContent += `Charges Totales;${this.formatCurrency(reportsData.totalExpenses)}\r\n`;
            csvContent += `Bénéfice Net;${this.formatCurrency(reportsData.netProfit)}\r\n`;
            csvContent += `Marge Bénéficiaire;${reportsData.profitMargin}%\r\n\r\n`;
            
            // Données mensuelles
            csvContent += "Données Mensuelles:\r\n";
            csvContent += "Mois;CA;Charges;Bénéfice;Marge\r\n";
            
            reportsData.monthlyData.forEach(month => {
                csvContent += `${month.name};${this.formatCurrency(month.revenue)};${this.formatCurrency(month.expenses)};${this.formatCurrency(month.profit)};${month.margin}%\r\n`;
            });
            
            // Total
            csvContent += `Total;${this.formatCurrency(reportsData.totalRevenue)};${this.formatCurrency(reportsData.totalExpenses)};${this.formatCurrency(reportsData.netProfit)};${reportsData.profitMargin}%\r\n\r\n`;
            
            // Données trimestrielles
            csvContent += "Données Trimestrielles:\r\n";
            csvContent += "Trimestre;CA;Charges;Bénéfice;Marge\r\n";
            
            reportsData.quarterlyData.forEach((quarter, index) => {
                csvContent += `T${index + 1};${this.formatCurrency(quarter.revenue)};${this.formatCurrency(quarter.expenses)};${this.formatCurrency(quarter.profit)};${quarter.margin}%\r\n`;
            });
            
            // Créer le fichier CSV et le télécharger
            const BOM = "\uFEFF"; // BOM pour l'encodage UTF-8 (pour Excel)
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'rapport_financier.csv';
            link.click();
            
            console.log('📤 Rapport financier exporté en Excel avec succès');
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport exporté en Excel avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation en Excel:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation en Excel', 'error');
            }
        }
    },
    
    /**
     * Changer d'onglet dans les rapports
     */
    showReportTab(tabName, e) {
        // Masquer tous les onglets
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Masquer tous les boutons actifs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        const selectedTab = document.getElementById(`${tabName}-report`);
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
     * Calculer la croissance cumulative (base 100)
     */
    calculateCumulativeGrowth(values) {
        if (!values || values.length === 0 || values[0] === 0) return values.map(() => 100);
        
        const baseValue = values[0];
        return values.map(value => Math.round((value / baseValue) * 100));
    },
    
    /**
     * Obtenir un commentaire sur la performance
     */
    getPerformanceComment(value, mediumThreshold, goodThreshold) {
        if (value >= goodThreshold) {
            return 'Performance excellente';
        } else if (value >= mediumThreshold) {
            return 'Performance satisfaisante';
        } else if (value >= 0) {
            return 'Performance à améliorer';
        } else {
            return 'Performance insuffisante';
        }
    },
    
    /**
     * Créer le graphique du rapport
     */
    createReportChart(canvasId, data, options, type = 'line') {
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
            type: type,
            data: data,
            options: options
        });
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
    },
    
    /**
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
        });

        document.body.appendChild(modal);
        return modal;
    }
};

// Export du module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsModule;
}

// Ajouter le module à la portée globale
window.ReportsModule = ReportsModule;

}