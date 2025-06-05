/**
 * Module de Rapports - Version Corrigée avec Exports Fonctionnels
 */

const ReportsModule = {
    charts: {},
    modals: [],
    
    showReports(data, currentYear, config) {
        this.closeAllModals();
        
        console.log('📊 Affichage du module de rapports');
        
        const reportData = this.generateReportData(data, currentYear, config);
        
        const content = `
            <div class="reports-container">
                <h3>📊 Rapports Financiers ${currentYear}</h3>
                
                <div class="reports-overview">
                    <div class="report-card">
                        <h4>📈 Chiffre d'Affaires Total</h4>
                        <div class="report-value positive">${this.formatCurrency(reportData.totalRevenue)}</div>
                        <small>Performance de l'année</small>
                    </div>
                    
                    <div class="report-card">
                        <h4>💰 Bénéfice Net</h4>
                        <div class="report-value ${reportData.totalProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(reportData.totalProfit)}</div>
                        <small>Marge: ${reportData.profitMargin}%</small>
                    </div>
                    
                    <div class="report-card">
                        <h4>💸 Total des Charges</h4>
                        <div class="report-value">${this.formatCurrency(reportData.totalExpenses)}</div>
                        <small>Ratio: ${reportData.expenseRatio}%</small>
                    </div>
                    
                    <div class="report-card">
                        <h4>📊 Moyenne Mensuelle</h4>
                        <div class="report-value">${this.formatCurrency(reportData.monthlyAverage)}</div>
                        <small>CA moyen par mois</small>
                    </div>
                </div>
                
                <div class="reports-tabs">
                    <button class="tab-btn active" onclick="ReportsModule.showReportTab('annual')">Rapport Annuel</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('quarterly')">Rapport Trimestriel</button>
                    <button class="tab-btn" onclick="ReportsModule.showReportTab('performance')">Performance</button>
                </div>
                
                <div id="annual-report" class="report-tab active">
                    <h4>📅 Rapport Annuel Détaillé</h4>
                    <div class="report-chart-container">
                        <canvas id="annualChart"></canvas>
                    </div>
                    
                    <div class="report-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>Chiffre d'Affaires</th>
                                    <th>Charges</th>
                                    <th>Bénéfice Net</th>
                                    <th>Marge (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.monthlyData.map((month, index) => `
                                    <tr>
                                        <td><strong>${month.month}</strong></td>
                                        <td class="positive">${this.formatCurrency(month.revenue)}</td>
                                        <td>${this.formatCurrency(month.expenses)}</td>
                                        <td class="${month.profit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.profit)}</td>
                                        <td>${month.margin}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn btn-primary" onclick="ReportsModule.exportToPDF()">📄 Exporter PDF</button>
                        <button class="btn btn-success" onclick="ReportsModule.exportToExcel()">📊 Exporter Excel</button>
                    </div>
                </div>
                
                <div id="quarterly-report" class="report-tab">
                    <h4>📊 Analyse Trimestrielle</h4>
                    <div class="report-chart-container">
                        <canvas id="quarterlyChart"></canvas>
                    </div>
                    
                    <div class="quarterly-grid">
                        ${reportData.quarterlyData.map((quarter, index) => `
                            <div class="quarter-card">
                                <h5>T${index + 1} ${currentYear}</h5>
                                <div class="quarter-revenue">${this.formatCurrency(quarter.revenue)}</div>
                                <div class="quarter-profit ${quarter.profit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(quarter.profit)}</div>
                                <small>Croissance: ${quarter.growth >= 0 ? '+' : ''}${quarter.growth}%</small>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn btn-primary" onclick="ReportsModule.exportQuarterlyPDF()">📄 Exporter PDF</button>
                        <button class="btn btn-success" onclick="ReportsModule.exportQuarterlyExcel()">📊 Exporter Excel</button>
                    </div>
                </div>
                
                <div id="performance-report" class="report-tab">
                    <h4>🎯 Analyse de Performance</h4>
                    
                    <div class="performance-metrics">
                        <div class="metric-card">
                            <h5>💰 Rentabilité</h5>
                            <div class="metric-value ${reportData.performance.profitability >= 0 ? 'positive' : 'negative'}">${reportData.performance.profitability}%</div>
                            <div class="metric-trend">${reportData.performance.profitabilityTrend >= 0 ? '📈' : '📉'}</div>
                        </div>
                        
                        <div class="metric-card">
                            <h5>📈 Croissance</h5>
                            <div class="metric-value ${reportData.performance.growth >= 0 ? 'positive' : 'negative'}">${reportData.performance.growth >= 0 ? '+' : ''}${reportData.performance.growth}%</div>
                            <div class="metric-trend">${reportData.performance.growthTrend >= 0 ? '📈' : '📉'}</div>
                        </div>
                        
                        <div class="metric-card">
                            <h5>🎯 Efficacité</h5>
                            <div class="metric-value">${reportData.performance.efficiency}%</div>
                            <div class="metric-trend">${reportData.performance.efficiencyTrend >= 0 ? '📈' : '📉'}</div>
                        </div>
                    </div>
                    
                    <div class="performance-chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn btn-primary" onclick="ReportsModule.exportPerformancePDF()">📄 Exporter PDF</button>
                        <button class="btn btn-success" onclick="ReportsModule.exportPerformanceExcel()">📊 Exporter Excel</button>
                    </div>
                </div>
            </div>
            
            <style>
                .reports-container { max-height: 70vh; overflow-y: auto; }
                .reports-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .report-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
                .report-card h4 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
                .report-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; }
                .report-value.positive { color: #10b981; }
                .report-value.negative { color: #ef4444; }
                .reports-tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #e5e7eb; }
                .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .tab-btn.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
                .report-tab { display: none; padding: 20px 0; }
                .report-tab.active { display: block; }
                .report-chart-container { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; height: 300px; }
                .report-table { margin: 20px 0; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .table th { background: #f8fafc; font-weight: bold; }
                .positive { color: #10b981; }
                .negative { color: #ef4444; }
                .quarterly-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .quarter-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
                .quarter-revenue { font-size: 1.4em; font-weight: bold; margin: 10px 0; color: #3b82f6; }
                .quarter-profit { font-size: 1.2em; font-weight: bold; margin: 5px 0; }
                .performance-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .metric-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; position: relative; }
                .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
                .metric-trend { position: absolute; top: 10px; right: 10px; font-size: 1.5em; }
                .performance-chart-container { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; height: 300px; }
                .export-actions { text-align: center; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
                .export-actions .btn { margin: 0 10px; }
            </style>
        `;
        
        const modal = this.createModal('📊 Rapports Financiers', content, 'large');
        this.modals.push(modal);
        
        setTimeout(() => {
            this.initializeReportCharts(reportData);
        }, 100);
    },
    
    generateReportData(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        const previousYearData = data[currentYear - 1] || [];
        
        const totalRevenue = currentYearData.reduce((sum, m) => sum + m.revenue, 0);
        const totalExpenses = currentYearData.reduce((sum, m) => sum + m.losses + m.purchases, 0);
        const totalProfit = totalRevenue - totalExpenses;
        
        const monthlyData = currentYearData.map((month, index) => {
            const revenue = month.revenue;
            const expenses = month.losses + month.purchases;
            const profit = revenue - expenses;
            const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
            
            return {
                month: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][index],
                revenue,
                expenses,
                profit,
                margin
            };
        });
        
        // Données trimestrielles
        const quarterlyData = [];
        for (let q = 0; q < 4; q++) {
            const quarterMonths = currentYearData.slice(q * 3, (q + 1) * 3);
            const revenue = quarterMonths.reduce((sum, m) => sum + m.revenue, 0);
            const expenses = quarterMonths.reduce((sum, m) => sum + m.losses + m.purchases, 0);
            const profit = revenue - expenses;
            
            const prevQuarterMonths = previousYearData.slice(q * 3, (q + 1) * 3);
            const prevRevenue = prevQuarterMonths.reduce((sum, m) => sum + m.revenue, 0);
            const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0;
            
            quarterlyData.push({
                revenue,
                expenses,
                profit,
                growth
            });
        }
        
        // Métriques de performance
        const prevTotalRevenue = previousYearData.reduce((sum, m) => sum + m.revenue, 0);
        const prevTotalExpenses = previousYearData.reduce((sum, m) => sum + m.losses + m.purchases, 0);
        const prevTotalProfit = prevTotalRevenue - prevTotalExpenses;
        
        const performance = {
            profitability: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
            profitabilityTrend: prevTotalRevenue > 0 && totalRevenue > 0 ? ((totalProfit / totalRevenue) - (prevTotalProfit / prevTotalRevenue)) * 100 : 0,
            growth: prevTotalRevenue > 0 ? Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100) : 0,
            growthTrend: 1,
            efficiency: totalRevenue > 0 ? Math.round((1 - (totalExpenses / totalRevenue)) * 100) : 0,
            efficiencyTrend: 1
        };
        
        return {
            totalRevenue,
            totalExpenses,
            totalProfit,
            profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
            expenseRatio: totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0,
            monthlyAverage: Math.round(totalRevenue / 12),
            monthlyData,
            quarterlyData,
            performance
        };
    },
    
    initializeReportCharts(reportData) {
        // Graphique annuel
        this.createReportChart('annualChart', {
            labels: reportData.monthlyData.map(m => m.month.substring(0, 3)),
            datasets: [
                {
                    label: 'Chiffre d\'Affaires',
                    data: reportData.monthlyData.map(m => m.revenue),
                    borderColor: '#10b981',
                    backgroundColor: '#10b98120',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Charges',
                    data: reportData.monthlyData.map(m => m.expenses),
                    borderColor: '#ef4444',
                    backgroundColor: '#ef444420',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Bénéfice',
                    data: reportData.monthlyData.map(m => m.profit),
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
                    text: 'Évolution Financière Annuelle'
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
        
        // Graphique trimestriel
        this.createReportChart('quarterlyChart', {
            labels: ['T1', 'T2', 'T3', 'T4'],
            datasets: [{
                label: 'Revenus par Trimestre',
                data: reportData.quarterlyData.map(q => q.revenue),
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6'
                ]
            }]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Répartition Trimestrielle'
                }
            }
        }, 'doughnut');
        
        // Graphique de performance
        this.createReportChart('performanceChart', {
            labels: ['Rentabilité', 'Croissance', 'Efficacité'],
            datasets: [{
                label: 'Indicateurs de Performance (%)',
                data: [
                    reportData.performance.profitability,
                    reportData.performance.growth,
                    reportData.performance.efficiency
                ],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#f59e0b'
                ],
                borderColor: [
                    '#059669',
                    '#2563eb',
                    '#d97706'
                ],
                borderWidth: 2
            }]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tableau de Bord Performance'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }, 'bar');
    },
    
    showReportTab(tabName) {
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
        
        event.target.classList.add('active');
    },
    
    exportToPDF() {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('jsPDF non disponible');
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Erreur: jsPDF non disponible', 'error');
                }
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Titre
            pdf.setFontSize(20);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Rapport Financier Annuel', 105, 15, { align: 'center' });
            
            // Date
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 22, { align: 'center' });
            
            // Graphique
            const canvas = document.getElementById('annualChart');
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, 30, 180, 80);
            }
            
            // Résumé financier
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Résumé Financier', 15, 120);
            
            // Récupérer les données du résumé
            const summaryCards = document.querySelectorAll('.report-card');
            let yPos = 130;
            
            summaryCards.forEach((card, index) => {
                if (index < 4) {
                    const title = card.querySelector('h4').textContent;
                    const value = card.querySelector('.report-value').textContent;
                    const info = card.querySelector('small').textContent;
                    
                    pdf.setFontSize(12);
                    pdf.setTextColor(44, 62, 80);
                    pdf.text(`${title}:`, 25, yPos);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(value, 120, yPos);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(info, 160, yPos);
                    
                    yPos += 10;
                }
            });
            
            // Tableau des données mensuelles
            yPos += 10;
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Détail Mensuel', 15, yPos);
            
            const tableData = [];
            const tableRows = document.querySelectorAll('.report-table tbody tr');
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    tableData.push([
                        cells[0].textContent.trim(),
                        cells[1].textContent.trim(),
                        cells[2].textContent.trim(),
                        cells[3].textContent.trim(),
                        cells[4].textContent.trim()
                    ]);
                }
            });
            
            pdf.autoTable({
                startY: yPos + 5,
                head: [['Mois', 'CA', 'Charges', 'Bénéfice', 'Marge']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });
            
            pdf.save('rapport_financier_annuel.pdf');
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport PDF généré avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation PDF:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation PDF', 'error');
            }
        }
    },
    
    exportToExcel() {
        try {
            // Créer les données CSV
            let csvContent = 'Mois;Chiffre d\'Affaires;Charges;Bénéfice Net;Marge (%)\r\n';
            
            const tableRows = document.querySelectorAll('.report-table tbody tr');
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    const rowData = [];
                    cells.forEach(cell => {
                        let value = cell.textContent.trim();
                        value = value.replace(/"/g, '""');
                        if (value.includes(';') || value.includes('\n') || value.includes('"')) {
                            value = `"${value}"`;
                        }
                        rowData.push(value);
                    });
                    csvContent += rowData.join(';') + '\r\n';
                }
            });
            
            // Ajouter résumé
            csvContent += '\r\nRésumé Financier\r\n';
            const summaryCards = document.querySelectorAll('.report-card');
            summaryCards.forEach(card => {
                const title = card.querySelector('h4').textContent.trim();
                const value = card.querySelector('.report-value').textContent.trim();
                const info = card.querySelector('small').textContent.trim();
                csvContent += `"${title}";"${value}";"${info}"\r\n`;
            });
            
            // Télécharger
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'rapport_financier_annuel.csv';
            link.click();
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Données exportées en Excel avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation Excel:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation Excel', 'error');
            }
        }
    },
    
    exportQuarterlyPDF() {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('jsPDF non disponible');
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            pdf.setFontSize(20);
            pdf.text('Rapport Trimestriel', 105, 15, { align: 'center' });
            
            const canvas = document.getElementById('quarterlyChart');
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, 30, 180, 80);
            }
            
            pdf.save('rapport_trimestriel.pdf');
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport trimestriel PDF généré', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation PDF trimestriel:', error);
        }
    },
    
    exportQuarterlyExcel() {
        try {
            let csvContent = 'Trimestre;Revenus;Charges;Bénéfice;Croissance (%)\r\n';
            
            const quarterCards = document.querySelectorAll('.quarter-card');
            quarterCards.forEach((card, index) => {
                const quarter = `T${index + 1}`;
                const revenue = card.querySelector('.quarter-revenue').textContent.trim();
                const profit = card.querySelector('.quarter-profit').textContent.trim();
                const growth = card.querySelector('small').textContent.trim();
                
                csvContent += `"${quarter}";"${revenue}";"";"${profit}";"${growth}"\r\n`;
            });
            
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'rapport_trimestriel.csv';
            link.click();
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport trimestriel Excel généré', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation Excel trimestriel:', error);
        }
    },
    
    exportPerformancePDF() {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('jsPDF non disponible');
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            pdf.setFontSize(20);
            pdf.text('Rapport de Performance', 105, 15, { align: 'center' });
            
            const canvas = document.getElementById('performanceChart');
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, 30, 180, 80);
            }
            
            pdf.save('rapport_performance.pdf');
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport de performance PDF généré', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation PDF performance:', error);
        }
    },
    
    exportPerformanceExcel() {
        try {
            let csvContent = 'Métrique;Valeur;Tendance\r\n';
            
            const metricCards = document.querySelectorAll('.metric-card');
            metricCards.forEach(card => {
                const title = card.querySelector('h5').textContent.trim();
                const value = card.querySelector('.metric-value').textContent.trim();
                const trend = card.querySelector('.metric-trend').textContent.trim();
                
                csvContent += `"${title}";"${value}";"${trend}"\r\n`;
            });
            
            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'rapport_performance.csv';
            link.click();
            
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Rapport de performance Excel généré', 'success');
            }
        } catch (error) {
            console.error('Erreur exportation Excel performance:', error);
        }
    },
    
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

// Ajouter à la portée globale
window.ReportsModule = ReportsModule;