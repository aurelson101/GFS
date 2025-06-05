// Module de comparaison avancée avec graphiques
class AdvancedComparison {
    constructor() {
        this.comparisonData = [];
        this.charts = {};
        this.benchmarks = {};
    }

    // Comparaison multi-années avec graphiques avancés
    compareMultipleYears(years) {
        const comparisonData = {};
        const metrics = ['revenues', 'expenses', 'profit', 'growth'];
        
        years.forEach(year => {
            const yearData = this.getYearData(year);
            comparisonData[year] = {
                revenues: this.calculateTotalRevenues(yearData),
                expenses: this.calculateTotalExpenses(yearData),
                profit: this.calculateProfit(yearData),
                growth: this.calculateGrowthRate(yearData),
                monthlyData: this.getMonthlyBreakdown(yearData),
                quarterlyData: this.getQuarterlyBreakdown(yearData),
                ratios: this.calculateFinancialRatios(yearData)
            };
        });

        this.createComparisonCharts(comparisonData);
        return comparisonData;
    }

    // Création de graphiques de comparaison avancés
    createComparisonCharts(data) {
        this.createRevenueComparisonChart(data);
        this.createProfitabilityChart(data);
        this.createGrowthTrendChart(data);
        this.createQuarterlyComparisonChart(data);
        this.createRatiosRadarChart(data);
        this.createCashFlowChart(data);
    }

    createRevenueComparisonChart(data) {
        const canvas = document.createElement('canvas');
        canvas.id = 'revenueComparisonChart';
        canvas.width = 800;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        const years = Object.keys(data);
        const revenues = years.map(year => data[year].revenues);
        
        this.charts.revenueComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Chiffre d\'affaires',
                    data: revenues,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparaison du Chiffre d\'Affaires par Année'
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
                                return new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
        
        return canvas;
    }

    createProfitabilityChart(data) {
        const canvas = document.createElement('canvas');
        canvas.id = 'profitabilityChart';
        canvas.width = 800;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        const years = Object.keys(data);
        
        this.charts.profitability = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Revenus',
                        data: years.map(year => data[year].revenues),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false
                    },
                    {
                        label: 'Dépenses',
                        data: years.map(year => data[year].expenses),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false
                    },
                    {
                        label: 'Profit',
                        data: years.map(year => data[year].profit),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution de la Rentabilité'
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
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
        
        return canvas;
    }

    createGrowthTrendChart(data) {
        const canvas = document.createElement('canvas');
        canvas.id = 'growthTrendChart';
        canvas.width = 800;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        const years = Object.keys(data);
        const growthRates = years.map(year => data[year].growth);
        
        this.charts.growthTrend = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: years.map(year => `${year} (${data[year].growth.toFixed(1)}%)`),
                datasets: [{
                    data: growthRates.map(rate => Math.abs(rate)),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Taux de Croissance par Année'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        return canvas;
    }

    createQuarterlyComparisonChart(data) {
        const canvas = document.createElement('canvas');
        canvas.id = 'quarterlyChart';
        canvas.width = 800;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        const years = Object.keys(data);
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        
        const datasets = years.map((year, index) => ({
            label: year,
            data: quarters.map(q => {
                const quarterData = data[year].quarterlyData[q];
                return quarterData ? quarterData.revenues : 0;
            }),
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.8)`,
            borderColor: `hsla(${index * 60}, 70%, 40%, 1)`,
            borderWidth: 1
        }));
        
        this.charts.quarterly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: quarters,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparaison Trimestrielle'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Trimestres'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenus (€)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
        
        return canvas;
    }

    createRatiosRadarChart(data) {
        const canvas = document.createElement('canvas');
        canvas.id = 'ratiosRadarChart';
        canvas.width = 600;
        canvas.height = 600;
        
        const ctx = canvas.getContext('2d');
        const years = Object.keys(data);
        const ratioLabels = ['Marge Brute', 'ROI', 'Liquidité', 'Croissance', 'Efficacité'];
        
        const datasets = years.map((year, index) => ({
            label: year,
            data: [
                data[year].ratios.grossMargin,
                data[year].ratios.roi,
                data[year].ratios.liquidity,
                Math.abs(data[year].growth),
                data[year].ratios.efficiency
            ],
            borderColor: `hsla(${index * 72}, 70%, 50%, 1)`,
            backgroundColor: `hsla(${index * 72}, 70%, 50%, 0.3)`,
            pointBackgroundColor: `hsla(${index * 72}, 70%, 50%, 1)`,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: `hsla(${index * 72}, 70%, 50%, 1)`
        }));
        
        this.charts.ratiosRadar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ratioLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparaison des Ratios Financiers'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        return canvas;
    }

    // Analyse comparative approfondie
    performDeepComparison(yearA, yearB) {
        const dataA = this.getYearData(yearA);
        const dataB = this.getYearData(yearB);
        
        return {
            revenue: {
                change: ((dataB.revenues - dataA.revenues) / dataA.revenues) * 100,
                absolute: dataB.revenues - dataA.revenues,
                trend: dataB.revenues > dataA.revenues ? 'positive' : 'negative'
            },
            expenses: {
                change: ((dataB.expenses - dataA.expenses) / dataA.expenses) * 100,
                absolute: dataB.expenses - dataA.expenses,
                trend: dataB.expenses < dataA.expenses ? 'positive' : 'negative'
            },
            profit: {
                change: ((dataB.profit - dataA.profit) / dataA.profit) * 100,
                absolute: dataB.profit - dataA.profit,
                trend: dataB.profit > dataA.profit ? 'positive' : 'negative'
            },
            efficiency: {
                costRatio: dataB.expenses / dataB.revenues,
                profitMargin: dataB.profit / dataB.revenues,
                improvement: this.calculateEfficiencyImprovement(dataA, dataB)
            },
            recommendations: this.generateComparisonRecommendations(dataA, dataB)
        };
    }

    // Méthodes utilitaires
    getYearData(year) {
        const allData = JSON.parse(localStorage.getItem('sasFinancialData') || '[]');
        return allData.filter(item => new Date(item.date).getFullYear() === year);
    }

    calculateTotalRevenues(data) {
        return data.filter(item => item.type === 'revenue')
                  .reduce((sum, item) => sum + item.amount, 0);
    }

    calculateTotalExpenses(data) {
        return data.filter(item => item.type === 'expense')
                  .reduce((sum, item) => sum + item.amount, 0);
    }

    calculateProfit(data) {
        return this.calculateTotalRevenues(data) - this.calculateTotalExpenses(data);
    }

    calculateGrowthRate(data) {
        const currentYear = this.calculateTotalRevenues(data);
        const previousYear = this.getPreviousYearRevenues(data[0]?.date);
        
        if (previousYear === 0) return 0;
        return ((currentYear - previousYear) / previousYear) * 100;
    }

    getMonthlyBreakdown(data) {
        const monthly = {};
        for (let month = 0; month < 12; month++) {
            const monthData = data.filter(item => new Date(item.date).getMonth() === month);
            monthly[month] = {
                revenues: this.calculateTotalRevenues(monthData),
                expenses: this.calculateTotalExpenses(monthData)
            };
        }
        return monthly;
    }

    getQuarterlyBreakdown(data) {
        const quarterly = {};
        const quarters = {
            'Q1': [0, 1, 2], 'Q2': [3, 4, 5],
            'Q3': [6, 7, 8], 'Q4': [9, 10, 11]
        };
        
        Object.keys(quarters).forEach(quarter => {
            const quarterData = data.filter(item => 
                quarters[quarter].includes(new Date(item.date).getMonth())
            );
            quarterly[quarter] = {
                revenues: this.calculateTotalRevenues(quarterData),
                expenses: this.calculateTotalExpenses(quarterData),
                profit: this.calculateProfit(quarterData)
            };
        });
        
        return quarterly;
    }

    calculateFinancialRatios(data) {
        const revenues = this.calculateTotalRevenues(data);
        const expenses = this.calculateTotalExpenses(data);
        const profit = revenues - expenses;
        
        return {
            grossMargin: revenues ? (profit / revenues) * 100 : 0,
            roi: expenses ? (profit / expenses) * 100 : 0,
            liquidity: this.calculateLiquidityRatio(data),
            efficiency: revenues ? (revenues / expenses) * 100 : 0
        };
    }

    calculateLiquidityRatio(data) {
        // Simulation d'un ratio de liquidité basé sur les flux de trésorerie
        const monthlyFlows = this.getMonthlyBreakdown(data);
        const positiveMonths = Object.values(monthlyFlows)
            .filter(month => month.revenues > month.expenses).length;
        
        return (positiveMonths / 12) * 100;
    }

    generateComparisonRecommendations(dataA, dataB) {
        const recommendations = [];
        
        const revenueChangePercent = ((this.calculateTotalRevenues(dataB) - this.calculateTotalRevenues(dataA)) / this.calculateTotalRevenues(dataA)) * 100;
        
        if (revenueChangePercent > 10) {
            recommendations.push({
                type: 'success',
                title: 'Croissance excellente',
                message: `Augmentation des revenus de ${revenueChangePercent.toFixed(1)}%. Maintenez cette dynamique.`
            });
        } else if (revenueChangePercent < -5) {
            recommendations.push({
                type: 'warning',
                title: 'Baisse des revenus',
                message: `Diminution de ${Math.abs(revenueChangePercent).toFixed(1)}%. Analysez les causes et ajustez la stratégie.`
            });
        }
        
        return recommendations;
    }
}

// Initialisation du module
const advancedComparison = new AdvancedComparison();