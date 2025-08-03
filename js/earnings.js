// Earnings Calculator Module for FreelanceOS

class EarningsCalculator {
    constructor() {
        this.clientNameInput = document.getElementById('client-name');
        this.hourlyRateInput = document.getElementById('hourly-rate');
        this.hoursWorkedInput = document.getElementById('hours-worked');
        this.expensesInput = document.getElementById('expenses');
        this.calculateButton = document.getElementById('calculate-earnings');
        this.saveEarningsButton = document.getElementById('save-earnings');
        this.grossEarningsDisplay = document.getElementById('gross-earnings');
        this.netEarningsDisplay = document.getElementById('net-earnings');
        this.monthlyTotalDisplay = document.getElementById('monthly-total');
        this.lastMonthTotalDisplay = document.getElementById('last-month-total');
        this.incomeList = document.getElementById('income-list');
        this.incomeChart = document.getElementById('income-chart');
        
        this.earnings = [];
        this.currentCalculation = null;
        
        this.init();
    }

    init() {
        this.loadEarnings();
        this.bindEvents();
        this.updateDisplays();
        this.renderIncomeList();
        this.renderIncomeChart();
    }

    bindEvents() {
        this.calculateButton.addEventListener('click', () => this.calculateEarnings());
        this.saveEarningsButton.addEventListener('click', () => this.saveEarnings());
        
        // Auto-calculate on input change
        [this.hourlyRateInput, this.hoursWorkedInput, this.expensesInput].forEach(input => {
            input.addEventListener('input', () => this.autoCalculate());
        });
        
        // Enter key to calculate
        [this.clientNameInput, this.hourlyRateInput, this.hoursWorkedInput, this.expensesInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculateEarnings();
                }
            });
        });
    }

    calculateEarnings() {
        const clientName = this.clientNameInput.value.trim();
        const hourlyRate = parseFloat(this.hourlyRateInput.value) || 0;
        const hoursWorked = parseFloat(this.hoursWorkedInput.value) || 0;
        const expenses = parseFloat(this.expensesInput.value) || 0;
        
        if (!clientName) {
            this.showMessage('Please enter a client name', 'error');
            return;
        }
        
        if (hourlyRate <= 0 || hoursWorked <= 0) {
            this.showMessage('Please enter valid hourly rate and hours worked', 'error');
            return;
        }
        
        const grossEarnings = hourlyRate * hoursWorked;
        const netEarnings = grossEarnings - expenses;
        
        this.currentCalculation = {
            clientName,
            hourlyRate,
            hoursWorked,
            expenses,
            grossEarnings,
            netEarnings,
            date: new Date().toISOString()
        };
        
        this.updateCalculationDisplay();
        this.showMessage('Calculation completed!', 'success');
    }

    autoCalculate() {
        const hourlyRate = parseFloat(this.hourlyRateInput.value) || 0;
        const hoursWorked = parseFloat(this.hoursWorkedInput.value) || 0;
        const expenses = parseFloat(this.expensesInput.value) || 0;
        
        if (hourlyRate > 0 && hoursWorked > 0) {
            const grossEarnings = hourlyRate * hoursWorked;
            const netEarnings = grossEarnings - expenses;
            
            this.grossEarningsDisplay.textContent = Format.currency(grossEarnings);
            this.netEarningsDisplay.textContent = Format.currency(netEarnings);
        }
    }

    updateCalculationDisplay() {
        if (this.currentCalculation) {
            this.grossEarningsDisplay.textContent = Format.currency(this.currentCalculation.grossEarnings);
            this.netEarningsDisplay.textContent = Format.currency(this.currentCalculation.netEarnings);
        }
    }

    saveEarnings() {
        if (!this.currentCalculation) {
            this.showMessage('Please calculate earnings first', 'error');
            return;
        }
        
        const earning = {
            id: Date.now(),
            ...this.currentCalculation,
            savedAt: new Date().toISOString()
        };
        
        this.earnings.unshift(earning);
        this.saveEarningsData();
        this.updateDisplays();
        this.renderIncomeList();
        this.renderIncomeChart();
        
        // Clear form
        this.clearForm();
        this.currentCalculation = null;
        
        this.showMessage('Earnings saved to tracker!', 'success');
    }

    clearForm() {
        this.clientNameInput.value = '';
        this.hourlyRateInput.value = '';
        this.hoursWorkedInput.value = '';
        this.expensesInput.value = '';
        this.grossEarningsDisplay.textContent = '$0.00';
        this.netEarningsDisplay.textContent = '$0.00';
    }

    updateDisplays() {
        const currentMonth = DateTime.getCurrentMonthYear();
        const lastMonth = {
            month: currentMonth.month === 0 ? 11 : currentMonth.month - 1,
            year: currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year
        };
        
        const currentMonthEarnings = this.getMonthlyEarnings(currentMonth.month, currentMonth.year);
        const lastMonthEarnings = this.getMonthlyEarnings(lastMonth.month, lastMonth.year);
        
        this.monthlyTotalDisplay.textContent = Format.currency(currentMonthEarnings);
        this.lastMonthTotalDisplay.textContent = Format.currency(lastMonthEarnings);
    }

    getMonthlyEarnings(month, year) {
        return this.earnings
            .filter(earning => {
                const earningDate = new Date(earning.date);
                return earningDate.getMonth() === month && earningDate.getFullYear() === year;
            })
            .reduce((sum, earning) => sum + earning.netEarnings, 0);
    }

    renderIncomeList() {
        this.incomeList.innerHTML = '';
        
        const recentEarnings = this.earnings.slice(0, 10); // Show last 10 entries
        
        if (recentEarnings.length === 0) {
            this.incomeList.innerHTML = '<li>No earnings recorded yet</li>';
            return;
        }
        
        recentEarnings.forEach(earning => {
            const li = DOM.createElement('li', {
                className: 'income-entry'
            });
            
            const date = new Date(earning.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            li.innerHTML = `
                <div class="income-info">
                    <span class="income-client">${earning.clientName}</span>
                    <span class="income-date">${date}</span>
                </div>
                <span class="income-amount">${Format.currency(earning.netEarnings)}</span>
            `;
            
            this.incomeList.appendChild(li);
        });
    }

    renderIncomeChart() {
        if (!this.incomeChart) return;
        
        // Clear previous chart
        this.incomeChart.innerHTML = '';
        
        // Get last 6 months of data
        const months = [];
        const earnings = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            months.push(DateTime.getMonthName(date));
            earnings.push(this.getMonthlyEarnings(month, year));
        }
        
        // Create simple bar chart using CSS
        const chartContainer = DOM.createElement('div', {
            className: 'chart-container'
        });
        
        const maxEarnings = Math.max(...earnings, 1); // Avoid division by zero
        
        months.forEach((month, index) => {
            const percentage = (earnings[index] / maxEarnings) * 100;
            
            const barContainer = DOM.createElement('div', {
                className: 'chart-bar-container'
            });
            
            barContainer.innerHTML = `
                <div class="chart-bar" style="height: ${percentage}%"></div>
                <div class="chart-label">
                    <span class="chart-month">${month}</span>
                    <span class="chart-amount">${Format.currency(earnings[index])}</span>
                </div>
            `;
            
            chartContainer.appendChild(barContainer);
        });
        
        this.incomeChart.appendChild(chartContainer);
        
        // Add chart styles
        const chartStyles = document.createElement('style');
        chartStyles.textContent = `
            .chart-container {
                display: flex;
                align-items: end;
                justify-content: space-between;
                height: 150px;
                gap: 8px;
                padding: 20px 0;
            }
            
            .chart-bar-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
            }
            
            .chart-bar {
                width: 100%;
                background: linear-gradient(to top, var(--primary-color), var(--primary-hover));
                border-radius: 4px 4px 0 0;
                min-height: 4px;
                transition: height 0.3s ease;
            }
            
            .chart-label {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 8px;
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .chart-month {
                font-weight: 500;
            }
            
            .chart-amount {
                font-size: 10px;
                margin-top: 2px;
            }
        `;
        
        if (!document.querySelector('#income-chart-styles')) {
            chartStyles.id = 'income-chart-styles';
            document.head.appendChild(chartStyles);
        }
    }

    loadEarnings() {
        this.earnings = Storage.load('freelanceos_earnings', []);
    }

    saveEarningsData() {
        Storage.save('freelanceos_earnings', this.earnings);
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `earnings-message earnings-message-${type}`,
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

    // Get earnings statistics
    getEarningsStats() {
        const totalEarnings = this.earnings.reduce((sum, earning) => sum + earning.netEarnings, 0);
        const averagePerProject = this.earnings.length > 0 ? totalEarnings / this.earnings.length : 0;
        const totalHours = this.earnings.reduce((sum, earning) => sum + earning.hoursWorked, 0);
        const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;
        
        return {
            totalEarnings,
            averagePerProject,
            totalHours,
            averageHourlyRate,
            totalProjects: this.earnings.length
        };
    }

    // Export earnings data
    exportEarnings() {
        const earningsData = {
            exportDate: new Date().toISOString(),
            totalEarnings: this.earnings.length,
            totalAmount: this.earnings.reduce((sum, earning) => sum + earning.netEarnings, 0),
            earnings: this.earnings.map(earning => ({
                clientName: earning.clientName,
                hourlyRate: earning.hourlyRate,
                hoursWorked: earning.hoursWorked,
                expenses: earning.expenses,
                grossEarnings: earning.grossEarnings,
                netEarnings: earning.netEarnings,
                date: earning.date
            }))
        };
        
        const dataStr = JSON.stringify(earningsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-earnings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Earnings data exported successfully!', 'success');
    }

    // Delete earning entry
    deleteEarning(earningId) {
        if (confirm('Are you sure you want to delete this earning entry?')) {
            this.earnings = this.earnings.filter(earning => earning.id !== earningId);
            this.saveEarningsData();
            this.updateDisplays();
            this.renderIncomeList();
            this.renderIncomeChart();
            
            this.showMessage('Earning entry deleted successfully!', 'success');
        }
    }
}

// Initialize earnings calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.earningsCalculator = new EarningsCalculator();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.earningsCalculator) {
        // Ctrl+Enter to calculate
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            window.earningsCalculator.calculateEarnings();
        }
        
        // Ctrl+S to save earnings
        if (e.ctrlKey && e.key === 's' && window.earningsCalculator.currentCalculation) {
            e.preventDefault();
            window.earningsCalculator.saveEarnings();
        }
    }
});