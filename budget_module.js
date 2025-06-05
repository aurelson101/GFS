/**
 * Module de Gestion de Budget
 * Permet de créer et gérer des budgets prévisionnels
 */

// Vérifier si le module existe déjà pour éviter les redéclarations
if (typeof BudgetModule === 'undefined') {

const BudgetModule = {
    modals: [],
    charts: {},

    /**
     * Afficher le module de budget
     */
    showBudget(data, currentYear, config) {
        // Fermer les modals existants
        this.closeAllModals();

        console.log('💰 Affichage du module Budget');
        
        const budgetData = this.generateBudgetData(data, currentYear, config);
        
        const content = `
            <div class="budget-container">
                <h3>💰 Budget Prévisionnel ${currentYear + 1}</h3>
                
                <div class="budget-overview">
                    <div class="budget-card">
                        <h4>📊 Budget Total</h4>
                        <div class="budget-value">${this.formatCurrency(budgetData.totalBudget)}</div>
                        <small>Basé sur les données de ${currentYear}</small>
                    </div>
                    
                    <div class="budget-card">
                        <h4>🎯 Objectif de CA</h4>
                        <div class="budget-value positive">${this.formatCurrency(budgetData.revenueTarget)}</div>
                        <small>+${budgetData.growthTarget}% vs année précédente</small>
                    </div>
                    
                    <div class="budget-card">
                        <h4>💸 Limite de Dépenses</h4>
                        <div class="budget-value">${this.formatCurrency(budgetData.expenseLimit)}</div>
                        <small>${budgetData.expenseRatio}% du budget total</small>
                    </div>
                </div>
                
                <div class="budget-tabs">
                    <button class="tab-btn active" onclick="BudgetModule.showBudgetTab('monthly')">Budget Mensuel</button>
                    <button class="tab-btn" onclick="BudgetModule.showBudgetTab('categories')">Catégories</button>
                    <button class="tab-btn" onclick="BudgetModule.showBudgetTab('planning')">Planification</button>
                </div>
                
                <div id="monthly-budget" class="budget-tab active">
                    <h4>📅 Répartition Mensuelle du Budget</h4>
                    <div class="budget-chart-container">
                        <canvas id="budgetChart"></canvas>
                    </div>
                    
                    <div class="budget-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>Budget CA</th>
                                    <th>Budget Dépenses</th>
                                    <th>Budget Net</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${budgetData.monthlyBudgets.map((month, index) => `
                                    <tr>
                                        <td><strong>${month.month}</strong></td>
                                        <td class="positive">${this.formatCurrency(month.revenue)}</td>
                                        <td>${this.formatCurrency(month.expenses)}</td>
                                        <td class="${month.net >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.net)}</td>
                                        <td>
                                            <button class="action-btn edit-budget" data-index="${index}">✏️</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div id="categories-budget" class="budget-tab">
                    <h4>🏷️ Budget par Catégories</h4>
                    <div class="budget-chart-container">
                        <canvas id="categoryBudgetChart"></canvas>
                    </div>
                    
                    <div class="budget-categories">
                        <div class="budget-category">
                            <h5>🏭 Production</h5>
                            <div class="budget-category-value">${this.formatCurrency(budgetData.categories.production)}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${budgetData.categoryPercentages.production}%"></div>
                            </div>
                            <small>${budgetData.categoryPercentages.production}% des dépenses</small>
                        </div>
                        
                        <div class="budget-category">
                            <h5>🏢 Administration</h5>
                            <div class="budget-category-value">${this.formatCurrency(budgetData.categories.administration)}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${budgetData.categoryPercentages.administration}%"></div>
                            </div>
                            <small>${budgetData.categoryPercentages.administration}% des dépenses</small>
                        </div>
                        
                        <div class="budget-category">
                            <h5>📣 Marketing</h5>
                            <div class="budget-category-value">${this.formatCurrency(budgetData.categories.marketing)}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${budgetData.categoryPercentages.marketing}%"></div>
                            </div>
                            <small>${budgetData.categoryPercentages.marketing}% des dépenses</small>
                        </div>
                        
                        <div class="budget-category">
                            <h5>💻 Informatique</h5>
                            <div class="budget-category-value">${this.formatCurrency(budgetData.categories.it)}</div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${budgetData.categoryPercentages.it}%"></div>
                            </div>
                            <small>${budgetData.categoryPercentages.it}% des dépenses</small>
                        </div>
                    </div>
                </div>
                
                <div id="planning-budget" class="budget-tab">
                    <h4>📝 Planification Budgétaire</h4>
                    
                    <div class="planning-grid">
                        <div class="planning-section">
                            <h5>📈 Objectifs Stratégiques</h5>
                            <ul class="planning-list">
                                <li>Augmentation du CA: <strong>+${budgetData.growthTarget}%</strong></li>
                                <li>Amélioration de la rentabilité: <strong>${budgetData.profitabilityTarget}%</strong></li>
                                <li>Réduction des pertes: <strong>-${budgetData.lossReductionTarget}%</strong></li>
                            </ul>
                        </div>
                        
                        <div class="planning-section">
                            <h5>⚠️ Alertes Budgétaires</h5>
                            <ul class="planning-list alerts">
                                <li class="alert-item">Alerte si dépenses <strong>&gt; ${budgetData.alerts.expenses}% du budget</strong></li>
                                <li class="alert-item">Alerte si CA <strong>&lt; ${budgetData.alerts.revenue}% de l'objectif</strong></li>
                                <li class="alert-item">Alerte si rentabilité <strong>&lt; ${budgetData.alerts.profitability}%</strong></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="planning-actions">
                        <button class="btn btn-primary" id="generateCustomBudgetBtn">📊 Générer Budget Personnalisé</button>
                    </div>
                    
                    <div id="customBudgetResult" class="custom-budget-result"></div>
                </div>
                  <div class="budget-actions">
                    <button class="btn btn-primary" id="saveBudgetBtn">💾 Enregistrer Budget</button>
                </div>
            </div>
            
            <style>
                .budget-container { max-height: 70vh; overflow-y: auto; }
                .budget-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .budget-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
                .budget-card h4 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
                .budget-value { font-size: 1.8em; font-weight: bold; margin: 10px 0; }
                .budget-value.positive { color: #10b981; }
                .budget-value.negative { color: #ef4444; }
                .budget-tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #e5e7eb; }
                .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .tab-btn.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
                .budget-tab { display: none; padding: 20px 0; }
                .budget-tab.active { display: block; }
                .budget-chart-container { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; height: 300px; }
                .budget-table { margin: 20px 0; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .table th { background: #f8fafc; font-weight: bold; }
                .positive { color: #10b981; }
                .negative { color: #ef4444; }
                .action-btn { padding: 4px 8px; background: #f3f4f6; border: none; border-radius: 4px; cursor: pointer; }
                .action-btn:hover { background: #e5e7eb; }
                .budget-categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
                .budget-category { background: #f8fafc; padding: 15px; border-radius: 8px; }
                .budget-category h5 { margin: 0 0 10px 0; font-size: 15px; color: #4b5563; }
                .budget-category-value { font-size: 1.4em; font-weight: bold; margin: 5px 0; }
                .progress-bar { height: 10px; background: #e5e7eb; border-radius: 5px; margin: 10px 0; }
                .progress { height: 100%; background: #3b82f6; border-radius: 5px; }
                .planning-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
                .planning-section { background: #f8fafc; padding: 15px; border-radius: 8px; }
                .planning-list { list-style: none; padding: 0; margin: 10px 0; }
                .planning-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                .alert-item { color: #b45309; }
                .planning-actions { text-align: center; margin: 20px 0; }
                .budget-actions { text-align: center; margin: 20px 0; }
                .budget-actions .btn { margin: 0 10px; }
                .custom-budget-result { margin: 20px 0; padding: 15px; border-radius: 8px; background: #f0f9ff; border-left: 4px solid #3b82f6; display: none; }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .budget-overview { grid-template-columns: 1fr; }
                    .budget-categories { grid-template-columns: 1fr; }
                    .planning-grid { grid-template-columns: 1fr; }
                    .budget-tabs { flex-wrap: wrap; }
                    .tab-btn { flex-basis: 100%; text-align: center; }
                }
            </style>
        `;
        
        const modal = this.createModal('💰 Budget Prévisionnel', content, 'large');
        this.modals.push(modal);
        
        // Initialiser les graphiques après que le modal soit affiché
        setTimeout(() => {
            this.initializeBudgetCharts(budgetData);
            this.setupBudgetEventListeners(budgetData);
        }, 100);
    },
    
    /**
     * Générer les données de budget
     */
    generateBudgetData(data, currentYear, config) {
        const currentYearData = data[currentYear] || [];
        const totalRevenue = currentYearData.reduce((sum, m) => sum + m.revenue, 0);
        const totalExpenses = currentYearData.reduce((sum, m) => sum + m.losses + m.purchases, 0);
        
        // Objectifs pour l'année prochaine
        const growthTarget = 10; // 10% de croissance
        const revenueTarget = Math.round(totalRevenue * (1 + growthTarget / 100));
        const expenseRatio = Math.round((totalExpenses / totalRevenue) * 100);
        const expenseLimit = Math.round(revenueTarget * (expenseRatio - 2) / 100); // 2% de réduction du ratio
        const totalBudget = revenueTarget;
        
        // Répartition mensuelle
        const monthlyBudgets = currentYearData.map((month, index) => {
            const seasonalFactor = this.getSeasonalFactor(index);
            const revenue = Math.round(revenueTarget / 12 * seasonalFactor);
            const expenses = Math.round(expenseLimit / 12 * seasonalFactor);
            
            return {
                month: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][index],
                revenue: revenue,
                expenses: expenses,
                net: revenue - expenses
            };
        });
        
        // Répartition par catégories
        const totalExpenseLimit = expenseLimit;
        const categories = {
            production: Math.round(totalExpenseLimit * 0.4),
            administration: Math.round(totalExpenseLimit * 0.2),
            marketing: Math.round(totalExpenseLimit * 0.25),
            it: Math.round(totalExpenseLimit * 0.15)
        };
        
        const categoryPercentages = {
            production: 40,
            administration: 20,
            marketing: 25,
            it: 15
        };
        
        return {
            totalBudget,
            revenueTarget,
            expenseLimit,
            expenseRatio,
            growthTarget,
            profitabilityTarget: 25, // objectif de marge
            lossReductionTarget: 15, // objectif de réduction des pertes
            monthlyBudgets,
            categories,
            categoryPercentages,
            alerts: {
                expenses: 110, // alerte si > 110% du budget
                revenue: 80, // alerte si < 80% de l'objectif
                profitability: 20 // alerte si < 20% de rentabilité
            }
        };
    },
    
    /**
     * Initialiser les graphiques
     */
    initializeBudgetCharts(budgetData) {
        // Graphique du budget mensuel
        this.createBudgetChart('budgetChart', {
            labels: budgetData.monthlyBudgets.map(m => m.month.substring(0, 3)),
            datasets: [
                {
                    label: 'Budget CA',
                    data: budgetData.monthlyBudgets.map(m => m.revenue),
                    borderColor: '#10b981',
                    backgroundColor: '#10b98120',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Budget Dépenses',
                    data: budgetData.monthlyBudgets.map(m => m.expenses),
                    borderColor: '#ef4444',
                    backgroundColor: '#ef444420',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Budget Net',
                    data: budgetData.monthlyBudgets.map(m => m.net),
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
                    text: 'Budget Mensuel Prévisionnel'
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
        
        // Graphique des catégories
        this.createBudgetChart('categoryBudgetChart', {
            labels: ['Production', 'Administration', 'Marketing', 'Informatique'],
            datasets: [{
                data: [
                    budgetData.categories.production,
                    budgetData.categories.administration,
                    budgetData.categories.marketing,
                    budgetData.categories.it
                ],
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
                    text: 'Budget par Catégories'
                }
            }
        });
    },
    
    /**
     * Configurer les écouteurs d'événements
     */
    setupBudgetEventListeners(budgetData) {
        // Bouton de génération de budget personnalisé
        const generateBtn = document.getElementById('generateCustomBudgetBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateCustomBudget(budgetData);
            });
        }
          // Bouton d'enregistrement du budget
        const saveBtn = document.getElementById('saveBudgetBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveBudget(budgetData);
            });
        }
        
        // Boutons d'édition de budget
        document.querySelectorAll('.edit-budget').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.editMonthlyBudget(index, budgetData);
            });
        });
    },
    
    /**
     * Changer d'onglet dans le budget
     */
    showBudgetTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.budget-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Masquer tous les boutons actifs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        const selectedTab = document.getElementById(`${tabName}-budget`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Activer le bouton correspondant
        event.target.classList.add('active');
    },
    
    /**
     * Générer un budget personnalisé
     */
    generateCustomBudget(budgetData) {
        console.log('🔧 Génération du budget personnalisé');
        
        // Ajustement du budget avec des variations aléatoires
        const customFactor = 1 + (Math.random() * 0.2 - 0.1); // ±10%
        const customRevenue = Math.round(budgetData.revenueTarget * customFactor);
        const customExpenses = Math.round(budgetData.expenseLimit * (customFactor * 0.9)); // 10% plus efficace
        const customNet = customRevenue - customExpenses;
        const customMargin = Math.round((customNet / customRevenue) * 100);
        
        // Afficher le résultat
        const resultDiv = document.getElementById('customBudgetResult');
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h4>🎯 Budget Personnalisé</h4>
                <div class="custom-budget-grid">
                    <div>
                        <p><strong>Objectif de CA:</strong> ${this.formatCurrency(customRevenue)}</p>
                        <p><strong>Limite de dépenses:</strong> ${this.formatCurrency(customExpenses)}</p>
                    </div>
                    <div>
                        <p><strong>Bénéfice prévisionnel:</strong> ${this.formatCurrency(customNet)}</p>
                        <p><strong>Marge bénéficiaire:</strong> ${customMargin}%</p>
                    </div>
                </div>
                <p class="custom-budget-note">Budget généré avec des paramètres optimisés pour votre activité</p>
                
                <style>
                    .custom-budget-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .custom-budget-note {
                        font-style: italic;
                        color: #6b7280;
                        margin-top: 15px;
                        font-size: 0.9em;
                    }
                    @media (max-width: 768px) {
                        .custom-budget-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            `;
        }
    },
    
    /**
     * Éditer le budget mensuel
     */
    editMonthlyBudget(index, budgetData) {
        const month = budgetData.monthlyBudgets[index];
        
        // Créer un formulaire d'édition
        const editForm = document.createElement('div');
        editForm.className = 'edit-budget-form';
        editForm.innerHTML = `
            <h4>Éditer le budget - ${month.month}</h4>
            <form>
                <div class="form-group">
                    <label for="editRevenue">Budget CA:</label>
                    <input type="number" id="editRevenue" value="${month.revenue}" class="form-control">
                </div>
                <div class="form-group">
                    <label for="editExpenses">Budget Dépenses:</label>
                    <input type="number" id="editExpenses" value="${month.expenses}" class="form-control">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.edit-budget-form').remove()">Annuler</button>
                    <button type="button" class="btn btn-primary" id="saveEditBtn">Enregistrer</button>
                </div>
            </form>
            <style>
                .edit-budget-form {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 1000;
                    width: 90%;
                    max-width: 400px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                .form-control {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
            </style>
        `;
        
        document.body.appendChild(editForm);
        
        // Gérer l'enregistrement des modifications
        const saveEditBtn = document.getElementById('saveEditBtn');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
                const newRevenue = parseInt(document.getElementById('editRevenue').value) || 0;
                const newExpenses = parseInt(document.getElementById('editExpenses').value) || 0;
                
                // Mettre à jour les données
                budgetData.monthlyBudgets[index].revenue = newRevenue;
                budgetData.monthlyBudgets[index].expenses = newExpenses;
                budgetData.monthlyBudgets[index].net = newRevenue - newExpenses;
                
                // Mettre à jour le tableau
                this.updateBudgetTable(budgetData);
                
                // Mettre à jour le graphique
                this.updateBudgetCharts(budgetData);
                
                // Fermer le formulaire
                editForm.remove();
            });
        }
    },
    
    /**
     * Mettre à jour le tableau du budget
     */
    updateBudgetTable(budgetData) {
        const tableBody = document.querySelector('.budget-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = budgetData.monthlyBudgets.map((month, index) => `
            <tr>
                <td><strong>${month.month}</strong></td>
                <td class="positive">${this.formatCurrency(month.revenue)}</td>
                <td>${this.formatCurrency(month.expenses)}</td>
                <td class="${month.net >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(month.net)}</td>
                <td>
                    <button class="action-btn edit-budget" data-index="${index}">✏️</button>
                </td>
            </tr>
        `).join('');
        
        // Réattacher les écouteurs d'événements
        document.querySelectorAll('.edit-budget').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.editMonthlyBudget(index, budgetData);
            });
        });
    },
    
    /**
     * Mettre à jour les graphiques
     */
    updateBudgetCharts(budgetData) {
        if (this.charts.budgetChart) {
            this.charts.budgetChart.data.datasets[0].data = budgetData.monthlyBudgets.map(m => m.revenue);
            this.charts.budgetChart.data.datasets[1].data = budgetData.monthlyBudgets.map(m => m.expenses);
            this.charts.budgetChart.data.datasets[2].data = budgetData.monthlyBudgets.map(m => m.net);
            this.charts.budgetChart.update();
        }
    },
    
    /**
     * Exporter le budget
     */
    exportBudget(budgetData) {
        try {
            const canvas = document.getElementById('budgetChart');
            if (!canvas) {
                console.error('Canvas pour le graphique de budget introuvable.');
                return;
            }

            // Vérifier si jsPDF est disponible
            if (typeof jsPDF === 'undefined' && window.jspdf && window.jspdf.jsPDF) {
                // Si jsPDF est disponible via window.jspdf, l'utiliser
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                // Titre
                pdf.setFontSize(16);
                pdf.setTextColor(44, 62, 80);
                pdf.text('Budget Prévisionnel', 105, 15, { align: 'center' });
                
                // Date
                pdf.setFontSize(12);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 22, { align: 'center' });
                
                // Image du graphique
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, 30, 180, 80);
                
                // Résumé du budget
                pdf.setFontSize(14);
                pdf.setTextColor(44, 62, 80);
                pdf.text('Résumé du Budget', 15, 120);
                
                pdf.setFontSize(12);
                pdf.text(`Objectif de CA: ${this.formatCurrency(budgetData.revenueTarget)}`, 25, 130);
                pdf.text(`Limite de dépenses: ${this.formatCurrency(budgetData.expenseLimit)}`, 25, 140);
                pdf.text(`Budget total: ${this.formatCurrency(budgetData.totalBudget)}`, 25, 150);
                pdf.text(`Croissance ciblée: +${budgetData.growthTarget}%`, 25, 160);
                
                // Tableau mensuel
                pdf.setFontSize(14);
                pdf.text('Budget Mensuel', 15, 180);
                
                // En-têtes du tableau
                const tableHeaders = [['Mois', 'Budget CA', 'Budget Dépenses', 'Budget Net']];
                
                // Données du tableau
                const tableData = budgetData.monthlyBudgets.map(month => [
                    month.month,
                    this.formatCurrency(month.revenue),
                    this.formatCurrency(month.expenses),
                    this.formatCurrency(month.net)
                ]);
                
                pdf.autoTable({
                    startY: 185,
                    head: tableHeaders,
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246] }
                });
                
                // Sauvegarder le PDF
                pdf.save('budget_previsionnel.pdf');
                
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Budget exporté en PDF avec succès', 'success');
                }
            } else {
                // Sinon, exporter simplement en PNG
                const link = document.createElement('a');
                link.download = 'budget_previsionnel.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                if (typeof app !== 'undefined' && app.showNotification) {
                    app.showNotification('Budget exporté en PNG (PDF non disponible)', 'info');
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation:', error);
            if (typeof app !== 'undefined' && app.showNotification) {
                app.showNotification('Erreur lors de l\'exportation du budget', 'error');
            }
        }
    },
    
    /**
     * Enregistrer le budget
     */
    saveBudget(budgetData) {
        // Simuler l'enregistrement
        console.log('💾 Sauvegarde du budget:', budgetData);
        
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification('Budget enregistré avec succès', 'success');
        }
    },
    
    /**
     * Créer un graphique de budget
     */
    createBudgetChart(canvasId, data, options) {
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
            type: canvasId === 'categoryBudgetChart' ? 'doughnut' : 'line',
            data: data,
            options: options
        });
    },
    
    /**
     * Obtenir le facteur saisonnier
     */
    getSeasonalFactor(monthIndex) {
        // Facteurs saisonniers approximatifs (basés sur des moyennes sectorielles)
        const factors = [0.9, 0.85, 1.1, 1.05, 1.1, 1.0, 0.95, 0.8, 1.15, 1.2, 1.1, 0.8];
        return factors[monthIndex] || 1.0;
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
    module.exports = BudgetModule;
}

// Ajouter le module à la portée globale
window.BudgetModule = BudgetModule;

}