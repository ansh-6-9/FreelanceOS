// Expenses Tracker Module for FreelanceOS

class ExpensesTracker {
    constructor() {
        this.expenseDescriptionInput = document.getElementById('expense-description');
        this.expenseAmountInput = document.getElementById('expense-amount');
        this.expenseCategorySelect = document.getElementById('expense-category');
        this.addExpenseButton = document.getElementById('add-expense');
        this.totalExpensesDisplay = document.getElementById('total-expenses');
        this.expensesList = document.getElementById('expenses-list');
        this.expenseChart = document.getElementById('expense-chart');
        
        this.expenses = [];
        
        this.init();
    }

    init() {
        this.loadExpenses();
        this.bindEvents();
        this.updateTotalExpenses();
        this.renderExpensesList();
        this.renderExpenseChart();
    }

    bindEvents() {
        this.addExpenseButton.addEventListener('click', () => this.addExpense());
        
        // Enter key to add expense
        [this.expenseDescriptionInput, this.expenseAmountInput, this.expenseCategorySelect].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addExpense();
                }
            });
        });
    }

    addExpense() {
        const description = this.expenseDescriptionInput.value.trim();
        const amount = parseFloat(this.expenseAmountInput.value) || 0;
        const category = this.expenseCategorySelect.value;
        
        if (!description) {
            this.showMessage('Please enter an expense description', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }
        
        const expense = {
            id: Date.now(),
            description,
            amount,
            category,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        this.expenses.unshift(expense);
        this.saveExpenses();
        this.updateTotalExpenses();
        this.renderExpensesList();
        this.renderExpenseChart();
        
        // Clear form
        this.clearForm();
        
        this.showMessage('Expense added successfully!', 'success');
    }

    clearForm() {
        this.expenseDescriptionInput.value = '';
        this.expenseAmountInput.value = '';
        this.expenseCategorySelect.value = 'business';
    }

    deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
            this.saveExpenses();
            this.updateTotalExpenses();
            this.renderExpensesList();
            this.renderExpenseChart();
            
            this.showMessage('Expense deleted successfully!', 'success');
        }
    }

    updateTotalExpenses() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        this.totalExpensesDisplay.textContent = Format.currency(total);
    }

    renderExpensesList() {
        this.expensesList.innerHTML = '';
        
        const recentExpenses = this.expenses.slice(0, 10); // Show last 10 entries
        
        if (recentExpenses.length === 0) {
            this.expensesList.innerHTML = '<li>No expenses recorded yet</li>';
            return;
        }
        
        recentExpenses.forEach(expense => {
            const li = DOM.createElement('li', {
                className: 'expense-entry'
            });
            
            const date = new Date(expense.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            li.innerHTML = `
                <div class="expense-info">
                    <span class="expense-description">${expense.description}</span>
                    <span class="expense-date">${date}</span>
                </div>
                <div class="expense-details">
                    <span class="expense-category ${expense.category}">${expense.category}</span>
                    <span class="expense-amount">${Format.currency(expense.amount)}</span>
                </div>
                <button class="expense-delete" title="Delete expense">×</button>
            `;
            
            // Add delete event listener
            const deleteBtn = li.querySelector('.expense-delete');
            deleteBtn.addEventListener('click', () => this.deleteExpense(expense.id));
            
            this.expensesList.appendChild(li);
        });
    }

    renderExpenseChart() {
        if (!this.expenseChart) return;
        
        // Clear previous chart
        this.expenseChart.innerHTML = '';
        
        // Get expenses by category for current month
        const currentMonth = DateTime.getCurrentMonthYear();
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth.month && 
                   expenseDate.getFullYear() === currentMonth.year;
        });
        
        const categoryTotals = {};
        monthlyExpenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        if (Object.keys(categoryTotals).length === 0) {
            this.expenseChart.innerHTML = '<p class="no-data">No expenses this month</p>';
            return;
        }
        
        // Create pie chart using CSS
        const chartContainer = DOM.createElement('div', {
            className: 'expense-chart-container'
        });
        
        const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const categories = Object.keys(categoryTotals);
        
        // Create chart legend
        const legend = DOM.createElement('div', {
            className: 'chart-legend'
        });
        
        categories.forEach((category, index) => {
            const percentage = (categoryTotals[category] / total) * 100;
            const color = this.getCategoryColor(category);
            
            const legendItem = DOM.createElement('div', {
                className: 'legend-item'
            });
            
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-label">${category}</span>
                <span class="legend-amount">${Format.currency(categoryTotals[category])}</span>
                <span class="legend-percentage">(${percentage.toFixed(1)}%)</span>
            `;
            
            legend.appendChild(legendItem);
        });
        
        chartContainer.appendChild(legend);
        this.expenseChart.appendChild(chartContainer);
        
        // Add chart styles
        const chartStyles = document.createElement('style');
        chartStyles.textContent = `
            .expense-chart-container {
                padding: 20px 0;
            }
            
            .chart-legend {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px;
                border-radius: 6px;
                background-color: var(--surface-color);
            }
            
            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            
            .legend-label {
                font-weight: 500;
                text-transform: capitalize;
                flex: 1;
            }
            
            .legend-amount {
                font-weight: 600;
                color: var(--error-color);
            }
            
            .legend-percentage {
                font-size: 12px;
                color: var(--text-muted);
            }
            
            .no-data {
                text-align: center;
                color: var(--text-muted);
                font-style: italic;
                padding: 40px 0;
            }
        `;
        
        if (!document.querySelector('#expense-chart-styles')) {
            chartStyles.id = 'expense-chart-styles';
            document.head.appendChild(chartStyles);
        }
    }

    getCategoryColor(category) {
        const colors = {
            business: '#3b82f6',
            personal: '#f59e0b',
            equipment: '#10b981',
            software: '#8b5cf6',
            other: '#6b7280'
        };
        
        return colors[category] || colors.other;
    }

    loadExpenses() {
        this.expenses = Storage.load('freelanceos_expenses', []);
    }

    saveExpenses() {
        Storage.save('freelanceos_expenses', this.expenses);
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `expense-message expense-message-${type}`,
            textContent: message
        });
        
        // Add styles
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        if (type === 'success') {
            messageEl.style.backgroundColor = 'var(--success-color)';
        } else if (type === 'error') {
            messageEl.style.backgroundColor = 'var(--error-color)';
        } else if (type === 'info') {
            messageEl.style.backgroundColor = 'var(--primary-color)';
        }
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // Get expense statistics
    getExpenseStats() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const averagePerExpense = this.expenses.length > 0 ? totalExpenses / this.expenses.length : 0;
        
        // Get current month expenses
        const currentMonth = DateTime.getCurrentMonthYear();
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth.month && 
                   expenseDate.getFullYear() === currentMonth.year;
        });
        
        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Get expenses by category
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        return {
            totalExpenses,
            averagePerExpense,
            monthlyTotal,
            totalExpenses: this.expenses.length,
            categoryTotals
        };
    }

    // Export expenses data
    exportExpenses() {
        const expensesData = {
            exportDate: new Date().toISOString(),
            totalExpenses: this.expenses.length,
            totalAmount: this.expenses.reduce((sum, expense) => sum + expense.amount, 0),
            expenses: this.expenses.map(expense => ({
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                date: expense.date
            }))
        };
        
        const dataStr = JSON.stringify(expensesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-expenses-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Expenses data exported successfully!', 'success');
    }

    // Get expenses by category
    getExpensesByCategory(category) {
        return this.expenses.filter(expense => expense.category === category);
    }

    // Get expenses by date range
    getExpensesByDateRange(startDate, endDate) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }

    // Get monthly expense trend
    getMonthlyExpenseTrend() {
        const months = [];
        const totals = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthlyExpenses = this.expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
            });
            
            const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            months.push(DateTime.getMonthName(date));
            totals.push(total);
        }
        
        return { months, totals };
    }
}

// Initialize expenses tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expensesTracker = new ExpensesTracker();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.expensesTracker) {
        // Ctrl+Enter to add expense
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            window.expensesTracker.addExpense();
        }
    }
});