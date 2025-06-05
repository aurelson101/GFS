// Module de statistiques avancées
class AdvancedStats {
    constructor() {
        this.cache = new Map();
        this.trends = [];
        this.anomalies = [];
    }

    // Calcul des statistiques avancées
    calculateAdvancedStats(data) {
        const stats = {
            variance: this.calculateVariance(data),
            standardDeviation: this.calculateStandardDeviation(data),
            skewness: this.calculateSkewness(data),
            kurtosis: this.calculateKurtosis(data),
            percentiles: this.calculatePercentiles(data),
            correlation: this.calculateCorrelation(data),
            regression: this.calculateRegression(data)
        };
        return stats;
    }

    calculateVariance(data) {
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    }

    calculateStandardDeviation(data) {
        return Math.sqrt(this.calculateVariance(data));
    }

    calculateSkewness(data) {
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = this.calculateStandardDeviation(data);
        const n = values.length;
        
        const sum = values.reduce((acc, val) => 
            acc + Math.pow((val - mean) / std, 3), 0);
        
        return (n / ((n - 1) * (n - 2))) * sum;
    }

    calculateKurtosis(data) {
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = this.calculateStandardDeviation(data);
        const n = values.length;
        
        const sum = values.reduce((acc, val) => 
            acc + Math.pow((val - mean) / std, 4), 0);
        
        return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - 
               (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    }

    calculatePercentiles(data) {
        const values = data.map(d => d.value).sort((a, b) => a - b);
        return {
            p25: this.percentile(values, 0.25),
            p50: this.percentile(values, 0.5),
            p75: this.percentile(values, 0.75),
            p90: this.percentile(values, 0.9),
            p95: this.percentile(values, 0.95)
        };
    }

    percentile(values, p) {
        const index = p * (values.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (lower === upper) return values[lower];
        return values[lower] * (1 - weight) + values[upper] * weight;
    }

    // Détection d'anomalies
    detectAnomalies(data) {
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = this.calculateStandardDeviation(data);
        
        const anomalies = [];
        data.forEach((item, index) => {
            const zScore = Math.abs((item.value - mean) / std);
            if (zScore > 2.5) {
                anomalies.push({
                    index,
                    value: item.value,
                    zScore,
                    severity: zScore > 3 ? 'high' : 'medium'
                });
            }
        });
        
        return anomalies;
    }

    // Analyse de tendances
    analyzeTrends(data) {
        const trends = [];
        const windowSize = 12; // 12 mois
        
        for (let i = windowSize; i < data.length; i++) {
            const window = data.slice(i - windowSize, i);
            const slope = this.calculateSlope(window);
            
            trends.push({
                period: data[i].date,
                slope,
                direction: slope > 0 ? 'increase' : 'decrease',
                magnitude: Math.abs(slope)
            });
        }
        
        return trends;
    }

    calculateSlope(data) {
        const n = data.length;
        const x = data.map((_, i) => i);
        const y = data.map(d => d.value);
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
        const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    // Prévisions avec modèle ARIMA simplifié
    forecast(data, periods = 12) {
        const values = data.map(d => d.value);
        const trends = this.analyzeTrends(data);
        const lastTrend = trends[trends.length - 1];
        
        const forecasts = [];
        let lastValue = values[values.length - 1];
        
        for (let i = 1; i <= periods; i++) {
            // Modèle simplifié avec tendance et saisonnalité
            const seasonalIndex = this.calculateSeasonalIndex(data, i);
            const trendValue = lastTrend ? lastTrend.slope * i : 0;
            
            const forecast = lastValue + trendValue + seasonalIndex;
            const confidence = Math.max(0.5, 1 - (i * 0.05)); // Confiance décroissante
            
            forecasts.push({
                period: i,
                value: forecast,
                confidence,
                lower: forecast * (1 - (1 - confidence)),
                upper: forecast * (1 + (1 - confidence))
            });
        }
        
        return forecasts;
    }

    calculateSeasonalIndex(data, futureMonth) {
        const monthlyData = {};
        data.forEach(item => {
            const month = new Date(item.date).getMonth();
            if (!monthlyData[month]) monthlyData[month] = [];
            monthlyData[month].push(item.value);
        });
        
        const monthlyAvgs = {};
        Object.keys(monthlyData).forEach(month => {
            monthlyAvgs[month] = monthlyData[month].reduce((a, b) => a + b, 0) / monthlyData[month].length;
        });
        
        const overallAvg = Object.values(monthlyAvgs).reduce((a, b) => a + b, 0) / Object.values(monthlyAvgs).length;
        
        const targetMonth = (new Date().getMonth() + futureMonth - 1) % 12;
        return monthlyAvgs[targetMonth] ? (monthlyAvgs[targetMonth] - overallAvg) : 0;
    }

    // Génération de rapports détaillés
    generateDetailedReport(data) {
        const stats = this.calculateAdvancedStats(data);
        const anomalies = this.detectAnomalies(data);
        const trends = this.analyzeTrends(data);
        const forecasts = this.forecast(data);
        
        return {
            summary: {
                totalRecords: data.length,
                anomaliesCount: anomalies.length,
                trendsCount: trends.length,
                dataQuality: this.assessDataQuality(data)
            },
            statistics: stats,
            anomalies,
            trends,
            forecasts,
            recommendations: this.generateRecommendations(stats, anomalies, trends)
        };
    }

    assessDataQuality(data) {
        const missingValues = data.filter(d => !d.value || d.value === 0).length;
        const duplicates = this.findDuplicates(data);
        
        return {
            completeness: ((data.length - missingValues) / data.length) * 100,
            duplicatesCount: duplicates.length,
            score: Math.max(0, 100 - (missingValues * 10) - (duplicates.length * 5))
        };
    }

    findDuplicates(data) {
        const seen = new Set();
        const duplicates = [];
        
        data.forEach((item, index) => {
            const key = `${item.date}-${item.value}`;
            if (seen.has(key)) {
                duplicates.push(index);
            } else {
                seen.add(key);
            }
        });
        
        return duplicates;
    }

    generateRecommendations(stats, anomalies, trends) {
        const recommendations = [];
        
        // Recommandations basées sur les anomalies
        if (anomalies.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Anomalies détectées',
                message: `${anomalies.length} valeurs aberrantes détectées. Vérifiez la qualité des données.`
            });
        }
        
        // Recommandations basées sur les tendances
        const lastTrend = trends[trends.length - 1];
        if (lastTrend && lastTrend.magnitude > 0.1) {
            recommendations.push({
                type: lastTrend.direction === 'increase' ? 'success' : 'warning',
                title: 'Tendance significative',
                message: `Tendance ${lastTrend.direction === 'increase' ? 'positive' : 'négative'} détectée. Planifiez en conséquence.`
            });
        }
        
        // Recommandations basées sur la volatilité
        if (stats.standardDeviation > stats.variance * 0.5) {
            recommendations.push({
                type: 'info',
                title: 'Volatilité élevée',
                message: 'Les données présentent une forte variabilité. Considérez des stratégies de lissage.'
            });
        }
        
        return recommendations;
    }
}

// Initialisation du module
const advancedStats = new AdvancedStats();