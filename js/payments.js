// Payment Tracking Module for FreelanceOS

class PaymentTracker {
    constructor() {
        this.payments = [];
        this.filteredPayments = [];
        this.storageKey = 'freelanceos_payments';
        
        this.init();
    }

    init() {
        this.loadPayments();
        this.bindEvents();
        this.setDefaultDateTime();
        this.renderPaymentsTable();
        this.updateSummary();
    }

    bindEvents() {
        // Payment form submission
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPayment();
            });
        }

        // Integration buttons (visual only)
        const integrationButtons = document.querySelectorAll('.btn-integration');
        integrationButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.getAttribute('data-platform');
                this.handleIntegrationClick(platform, btn);
            });
        });

        // Filter functionality
        const filterClient = document.getElementById('filter-client');
        const filterDate = document.getElementById('filter-date');
        const clearFilters = document.getElementById('clear-filters');

        if (filterClient) {
            filterClient.addEventListener('input', () => this.applyFilters());
        }
        if (filterDate) {
            filterDate.addEventListener('change', () => this.applyFilters());
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }
    }

    setDefaultDateTime() {
        const dateTimeInput = document.getElementById('payment-date');
        if (dateTimeInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
            dateTimeInput.value = dateTimeString;
        }
    }

    addPayment() {
        const clientName = document.getElementById('client-name-payment').value.trim();
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const dateTime = document.getElementById('payment-date').value;
        const notes = document.getElementById('payment-notes').value.trim();

        if (!clientName || !amount || !dateTime) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const payment = {
            id: Date.now().toString(),
            clientName,
            amount,
            dateTime,
            notes,
            createdAt: new Date().toISOString()
        };

        this.payments.unshift(payment);
        this.savePayments();
        this.renderPaymentsTable();
        this.updateSummary();
        this.clearForm();
        this.showNotification('Payment saved successfully!', 'success');
    }

    deletePayment(paymentId) {
        if (confirm('Are you sure you want to delete this payment?')) {
            this.payments = this.payments.filter(payment => payment.id !== paymentId);
            this.savePayments();
            this.renderPaymentsTable();
            this.updateSummary();
            this.showNotification('Payment deleted successfully!', 'success');
        }
    }

    editPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        // Populate form with existing data
        document.getElementById('client-name-payment').value = payment.clientName;
        document.getElementById('payment-amount').value = payment.amount;
        document.getElementById('payment-date').value = payment.dateTime;
        document.getElementById('payment-notes').value = payment.notes || '';

        // Remove the payment temporarily
        this.payments = this.payments.filter(p => p.id !== paymentId);
        this.savePayments();
        this.renderPaymentsTable();
        this.updateSummary();

        // Scroll to form
        document.getElementById('payment-form').scrollIntoView({ behavior: 'smooth' });
        this.showNotification('Payment loaded for editing', 'info');
    }

    applyFilters() {
        const clientFilter = document.getElementById('filter-client').value.toLowerCase().trim();
        const dateFilter = document.getElementById('filter-date').value;

        this.filteredPayments = this.payments.filter(payment => {
            const matchesClient = !clientFilter || 
                payment.clientName.toLowerCase().includes(clientFilter);
            
            const matchesDate = !dateFilter || 
                payment.dateTime.startsWith(dateFilter);

            return matchesClient && matchesDate;
        });

        this.renderPaymentsTable(this.filteredPayments);
        this.updateSummary(this.filteredPayments);
    }

    clearFilters() {
        document.getElementById('filter-client').value = '';
        document.getElementById('filter-date').value = '';
        this.filteredPayments = [];
        this.renderPaymentsTable();
        this.updateSummary();
    }

    renderPaymentsTable(paymentsToRender = null) {
        const tableBody = document.getElementById('payments-table-body');
        if (!tableBody) return;

        const payments = paymentsToRender || this.payments;

        if (payments.length === 0) {
            tableBody.innerHTML = `
                <tr class="no-payments">
                    <td colspan="5">${paymentsToRender ? 'No payments match your filters.' : 'No payments recorded yet. Add your first payment above!'}</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = payments.map(payment => {
            const formattedDate = this.formatDateTime(payment.dateTime);
            const formattedAmount = this.formatCurrency(payment.amount);
            
            return `
                <tr class="payment-row" data-payment-id="${payment.id}">
                    <td class="client-name">${this.escapeHtml(payment.clientName)}</td>
                    <td class="payment-amount">${formattedAmount}</td>
                    <td class="payment-date">${formattedDate}</td>
                    <td class="payment-notes">${this.escapeHtml(payment.notes || '-')}</td>
                    <td class="payment-actions">
                        <button class="btn btn-sm btn-ghost edit-payment" data-payment-id="${payment.id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-ghost delete-payment" data-payment-id="${payment.id}" title="Delete">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Bind action buttons
        this.bindTableActions();
    }

    bindTableActions() {
        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-payment');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const paymentId = btn.getAttribute('data-payment-id');
                this.editPayment(paymentId);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-payment');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const paymentId = btn.getAttribute('data-payment-id');
                this.deletePayment(paymentId);
            });
        });
    }

    updateSummary(paymentsToSummarize = null) {
        const payments = paymentsToSummarize || this.payments;
        const totalCount = payments.length;
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        const countElement = document.getElementById('total-payments-count');
        const amountElement = document.getElementById('total-payments-amount');

        if (countElement) countElement.textContent = totalCount;
        if (amountElement) amountElement.textContent = this.formatCurrency(totalAmount);
    }

    handleIntegrationClick(platform, button) {
        // Visual feedback for integration buttons
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="integration-icon">⏳</span>Connecting...`;
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = `<span class="integration-icon">❌</span>Coming Soon`;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }, 1500);

        this.showNotification(`${this.capitalizeFirst(platform)} integration is coming soon!`, 'info');
    }

    clearForm() {
        document.getElementById('client-name-payment').value = '';
        document.getElementById('payment-amount').value = '';
        document.getElementById('payment-notes').value = '';
        this.setDefaultDateTime();
    }

    loadPayments() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.payments = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading payments:', error);
            this.payments = [];
        }
    }

    savePayments() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.payments));
        } catch (error) {
            console.error('Error saving payments:', error);
            this.showNotification('Error saving payment data', 'error');
        }
    }

    formatDateTime(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Export payments to CSV
    exportPayments() {
        if (this.payments.length === 0) {
            this.showNotification('No payments to export', 'warning');
            return;
        }

        const headers = ['Client Name', 'Amount', 'Date & Time', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...this.payments.map(payment => [
                `"${payment.clientName}"`,
                payment.amount,
                `"${payment.dateTime}"`,
                `"${payment.notes || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Payments exported successfully!', 'success');
    }

    // Get payments summary for dashboard or other modules
    getPaymentsSummary() {
        const thisMonth = new Date();
        const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
        
        const thisMonthPayments = this.payments.filter(payment => {
            const paymentDate = new Date(payment.dateTime);
            return paymentDate.getMonth() === thisMonth.getMonth() && 
                   paymentDate.getFullYear() === thisMonth.getFullYear();
        });

        const lastMonthPayments = this.payments.filter(payment => {
            const paymentDate = new Date(payment.dateTime);
            return paymentDate.getMonth() === lastMonth.getMonth() && 
                   paymentDate.getFullYear() === lastMonth.getFullYear();
        });

        return {
            total: this.payments.length,
            totalAmount: this.payments.reduce((sum, p) => sum + p.amount, 0),
            thisMonth: {
                count: thisMonthPayments.length,
                amount: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0)
            },
            lastMonth: {
                count: lastMonthPayments.length,
                amount: lastMonthPayments.reduce((sum, p) => sum + p.amount, 0)
            }
        };
    }
}

// Initialize payment tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('payments')) {
        window.paymentTracker = new PaymentTracker();
    }
});

// Make it available globally
window.PaymentTracker = PaymentTracker;