// Authentication Module for FreelanceOS

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.defaultPasscode = '1234';
        this.authModal = document.getElementById('auth-modal');
        this.passcodeInput = document.getElementById('passcode-input');
        this.authSubmit = document.getElementById('auth-submit');
        this.authLogout = document.getElementById('auth-logout');
        this.app = document.getElementById('app');
        this.splashLoader = document.getElementById('splash-loader');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Submit passcode
        this.authSubmit.addEventListener('click', () => this.authenticate());
        
        // Enter key on passcode input
        this.passcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticate();
            }
        });

        // Logout
        this.authLogout.addEventListener('click', () => this.logout());

        // Focus on passcode input when modal opens
        this.authModal.addEventListener('shown', () => {
            this.passcodeInput.focus();
        });
    }

    checkAuthStatus() {
        const savedPasscode = Storage.load('freelanceos_passcode', this.defaultPasscode);
        const isAuthenticated = Storage.load('freelanceos_authenticated', false);
        
        if (isAuthenticated) {
            this.login();
        } else {
            this.showAuthModal();
        }
    }

    authenticate() {
        const enteredPasscode = this.passcodeInput.value;
        const savedPasscode = Storage.load('freelanceos_passcode', this.defaultPasscode);

        if (enteredPasscode === savedPasscode) {
            this.login();
            this.hideAuthModal();
            this.showSuccessMessage('Welcome to FreelanceOS!');
        } else {
            this.showErrorMessage('Incorrect passcode. Please try again.');
            this.passcodeInput.value = '';
            this.passcodeInput.focus();
        }
    }

    login() {
        this.isAuthenticated = true;
        Storage.save('freelanceos_authenticated', true);
        this.showApp();
    }

    logout() {
        this.isAuthenticated = false;
        Storage.save('freelanceos_authenticated', false);
        this.hideApp();
        this.showAuthModal();
        this.passcodeInput.value = '';
    }

    showAuthModal() {
        this.authModal.classList.add('active');
        this.passcodeInput.focus();
    }

    hideAuthModal() {
        this.authModal.classList.remove('active');
    }

    showApp() {
        DOM.hide(this.splashLoader);
        DOM.show(this.app);
        this.hideAuthModal();
    }

    hideApp() {
        DOM.hide(this.app);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = DOM.createElement('div', {
            className: `auth-message auth-message-${type}`,
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
        } else {
            messageEl.style.backgroundColor = 'var(--primary-color)';
        }

        // Add to document
        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // Change passcode functionality
    changePasscode(newPasscode) {
        if (newPasscode && newPasscode.length >= 4) {
            Storage.save('freelanceos_passcode', newPasscode);
            this.showSuccessMessage('Passcode updated successfully!');
            return true;
        } else {
            this.showErrorMessage('Passcode must be at least 4 characters long.');
            return false;
        }
    }

    // Get authentication status
    getAuthStatus() {
        return this.isAuthenticated;
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});

// Add slideIn animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);