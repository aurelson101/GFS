/**
 * Module de Prévisions
 * Génère des prévisions basées sur les données historiques
 */

const ForecastModule = {
    /**
     * Affiche les prévisions
     */
    showForecast(data, currentYear, config) {
        const modal = this.createForecastModal();
        const yearData = data[currentYear];
        
        if (!yearData) {
            modal.remove();
            alert('Aucune donnée disponible pour cette année!');
            return;
        }
        
        const forecast = this.calculateForecast(yearData, config);
        this.renderForecast(modal, forecast, currentYear);
        
        document.body.appendChild(modal);
    },
    
    /**
     * Création du modal de prévisions
     */
    createForecastModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
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
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeBtn.onclick = () => modal.remove();
        
        content.appendChild(closeBtn);
        modal.appendChild(content);
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        return modal;
    },
    
    /**
     * Calcul des prévisions
     */
    calculateForecast(yearData, config) {
        const currentMonth = new Date().getMonth();
        const monthsWithData = yearData.slice(0, currentMonth + 1).filter(m => m.revenue > 0);
        
        if (monthsWithData.length < 2) {
            return {
                error: 'Pas assez de données pour établir des prévisions (minimum 2 mois avec des données)'
            };
        }
        
        // Calcul des moyennes
        const avgRevenue = monthsWithData.reduce((sum, m) => sum + m.revenue, 0) / monthsWithData.length;
        const avgLosses = monthsWithData.reduce((sum, m) => sum + m.losses, 0) / monthsWithData.length;
        const avgPurchases = monthsWithData.reduce((sum, m) => sum + m.purchases, 0) / monthsWithData.length;
        
        // Calcul de la tendance
        const revenues = monthsWithData.map(m => m.revenue);
        const trend = this.calculateTrend(revenues);
        
        // Prévisions pour les mois restants
        const remainingMonths = 12 - (currentMonth + 1);
        const forecasts = [];
        
        for (let i = 0; i < remainingMonths; i++) {
            const monthIndex = currentMonth + 1 + i;
            const trendAdjustment = trend * (i + 1);
            
            const forecastRevenue = Math.max(0, avgRevenue + trendAdjustment);
            const forecastLosses = avgLosses;
            const forecastPurchases = avgPurchases;
            const forecastGrossProfit = forecastRevenue - forecastLosses - forecastPurchases;
            const forecastTaxes = forecastGrossProfit > 0 ? (forecastGrossProfit * config.taxRate / 100) : 0;
            const forecastNetProfit = forecastGrossProfit - forecastTaxes;
            
            forecasts.push({
                month: this.getMonthName(monthIndex),
                revenue: forecastRevenue,
                losses: forecastLosses,
                purchases: forecastPurchases,
                grossProfit: forecastGrossProfit,
                netProfit: forecastNetProfit
            });
        }
        
        // Calcul des totaux prévisionnels
        const actualTotal = this.calculateActualTotal(yearData.slice(0, currentMonth + 1), config);
        const forecastTotal = this.calculateForecastTotal(forecasts);
        
        return {
            currentMonthIndex: currentMonth,
            actualTotal,
            forecastTotal,
            projectedTotal: {
                revenue: actualTotal.revenue + forecastTotal.revenue,
                grossProfit: actualTotal.grossProfit + forecastTotal.grossProfit,
                netProfit: actualTotal.netProfit + forecastTotal.netProfit
            },
            forecasts,
            trend: trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'stable',
            trendValue: trend,
            confidence: this.calculateConfidence(monthsWithData)
        };
    },
    
    /**
     * Calcul de la tendance
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, y, x) => sum + y * (x + 1), 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope || 0;
    },
    
    /**
     * Obtenir le nom du mois
     */
    getMonthName(monthIndex) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[monthIndex % 12];
    },
    
    /**
     * Calcul du total actuel
     */
    calculateActualTotal(actualData, config) {
        return actualData.reduce((total, month) => {
            const grossProfit = month.revenue - month.losses - month.purchases;
            const taxes = grossProfit > 0 ? (grossProfit * config.taxRate / 100) : 0;
            const netProfit = grossProfit - taxes;
            
            return {
                revenue: total.revenue + month.revenue,
                grossProfit: total.grossProfit + grossProfit,
                netProfit: total.netProfit + netProfit
            };
        }, { revenue: 0, grossProfit: 0, netProfit: 0 });
    },
    
    /**
     * Calcul du total prévisionnel
     */
    calculateForecastTotal(forecasts) {
        return forecasts.reduce((total, forecast) => ({
            revenue: total.revenue + forecast.revenue,
            grossProfit: total.grossProfit + forecast.grossProfit,
            netProfit: total.netProfit + forecast.netProfit
        }), { revenue: 0, grossProfit: 0, netProfit: 0 });
    },
    
    /**
     * Calcul du niveau de confiance
     */
    calculateConfidence(monthsWithData) {
        const length = monthsWithData.length;
        if (length >= 6) return 'élevé';
        if (length >= 3) return 'moyen';
        return 'faible';
    },
    
    /**
     * Rendu des prévisions
     */
    renderForecast(modal, forecast, year) {
        const content = modal.querySelector('.modal-content');
        const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
        
        if (forecast.error) {
            content.innerHTML += `
                <h2>🔮 Prévisions ${year}</h2>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="color: #dc2626; margin: 0;">⚠️ ${forecast.error}</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                        Fermer
                    </button>
                </div>
            `;
            return;
        }
        
        const getTrendIcon = () => {
            switch (forecast.trend) {
                case 'positive': return '📈';
                case 'negative': return '📉';
                default: return '➡️';
            }
        };
        
        const getTrendColor = () => {
            switch (forecast.trend) {
                case 'positive': return '#059669';
                case 'negative': return '#dc2626';
                default: return '#6b7280';
            }
        };
        
        content.innerHTML += `
            <h2>🔮 Prévisions ${year}</h2>
            
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 24px; margin-right: 10px;">${getTrendIcon()}</span>
                    <h3 style="margin: 0; color: ${getTrendColor()};">
                        Tendance ${forecast.trend === 'positive' ? 'positive' : forecast.trend === 'negative' ? 'négative' : 'stable'}
                    </h3>
                </div>
                <p style="margin: 5px 0;">
                    <strong>Niveau de confiance:</strong> ${forecast.confidence}
                    ${forecast.confidence === 'faible' ? ' (plus de données nécessaires pour améliorer la précision)' : ''}
                </p>
                <p style="margin: 5px 0;">
                    <strong>Variation mensuelle moyenne:</strong> 
                    <span style="color: ${getTrendColor()};">
                        ${forecast.trendValue >= 0 ? '+' : ''}${formatCurrency(forecast.trendValue)}
                    </span>
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af;">📊 Réalisé (à ce jour)</h3>
                    <p><strong>Chiffre d'affaires:</strong> ${formatCurrency(forecast.actualTotal.revenue)}</p>
                    <p><strong>Bénéfice brut:</strong> ${formatCurrency(forecast.actualTotal.grossProfit)}</p>
                    <p><strong>Bénéfice net:</strong> 
                       <span style="color: ${forecast.actualTotal.netProfit >= 0 ? '#059669' : '#dc2626'};">
                           ${formatCurrency(forecast.actualTotal.netProfit)}
                       </span>
                    </p>
                </div>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h3 style="margin: 0 0 10px 0; color: #059669;">🎯 Prévisions (fin d'année)</h3>
                    <p><strong>CA prévisionnel:</strong> ${formatCurrency(forecast.forecastTotal.revenue)}</p>
                    <p><strong>Bénéfice brut prévu:</strong> ${formatCurrency(forecast.forecastTotal.grossProfit)}</p>
                    <p><strong>Bénéfice net prévu:</strong> 
                       <span style="color: ${forecast.forecastTotal.netProfit >= 0 ? '#059669' : '#dc2626'};">
                           ${formatCurrency(forecast.forecastTotal.netProfit)}
                       </span>
                    </p>
                </div>
                
                <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308;">
                    <h3 style="margin: 0 0 10px 0; color: #a16207;">🏁 Total Projeté</h3>
                    <p><strong>CA total:</strong> ${formatCurrency(forecast.projectedTotal.revenue)}</p>
                    <p><strong>Bénéfice brut total:</strong> ${formatCurrency(forecast.projectedTotal.grossProfit)}</p>
                    <p><strong>Bénéfice net total:</strong> 
                       <span style="color: ${forecast.projectedTotal.netProfit >= 0 ? '#059669' : '#dc2626'};">
                           ${formatCurrency(forecast.projectedTotal.netProfit)}
                       </span>
                    </p>
                </div>
            </div>
            
            ${forecast.forecasts.length > 0 ? `
                <div style="margin-top: 30px;">
                    <h3>📅 Détail des prévisions mensuelles</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Mois</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">CA prévu</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Bénéfice brut</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Bénéfice net</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${forecast.forecasts.map(month => `
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${month.month}</td>
                                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f3f4f6;">${formatCurrency(month.revenue)}</td>
                                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: ${month.grossProfit >= 0 ? '#059669' : '#dc2626'};">
                                            ${formatCurrency(month.grossProfit)}
                                        </td>
                                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f3f4f6; color: ${month.netProfit >= 0 ? '#059669' : '#dc2626'};">
                                            ${formatCurrency(month.netProfit)}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
            
            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ Avertissement:</strong> Ces prévisions sont basées sur les données historiques et les tendances actuelles. 
                    Les résultats réels peuvent varier en fonction des conditions de marché, des événements imprévisibles et d'autres facteurs.
                </p>
            </div>
        `;
        
        // Ajouter le bouton de fermeture en bas
        content.innerHTML += `
            <div style="margin-top: 30px; text-align: center;">
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        `;
    }
};