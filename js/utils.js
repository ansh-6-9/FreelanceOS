// Utility Functions for FreelanceOS

// LocalStorage Utilities
const Storage = {
    // Save data to localStorage
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // Load data from localStorage
    load: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    },

    // Remove data from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all data
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Date and Time Utilities
const DateTime = {
    // Get current date and time
    now: () => new Date(),

    // Format date as string
    formatDate: (date = new Date()) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format time as string
    formatTime: (date = new Date()) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    // Get greeting based on time of day
    getGreeting: () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning!';
        if (hour < 17) return 'Good Afternoon!';
        return 'Good Evening!';
    },

    // Format duration in minutes to MM:SS
    formatDuration: (minutes) => {
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes - mins) * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Get month name
    getMonthName: (date = new Date()) => {
        return date.toLocaleDateString('en-US', { month: 'long' });
    },

    // Get current month and year
    getCurrentMonthYear: () => {
        const now = new Date();
        return {
            month: now.getMonth(),
            year: now.getFullYear()
        };
    },

    // Check if date is today
    isToday: (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
};

// Validation Utilities
const Validation = {
    // Validate email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate URL
    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validate number
    isValidNumber: (value) => {
        return !isNaN(value) && isFinite(value) && value >= 0;
    },

    // Validate required field
    isRequired: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
};

// Formatting Utilities
const Format = {
    // Format currency
    currency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format percentage
    percentage: (value, decimals = 1) => {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    // Format file size
    fileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Truncate text
    truncate: (text, length = 50) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};

// DOM Utilities
const DOM = {
    // Create element with attributes
    createElement: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Show element
    show: (element) => {
        if (element) element.style.display = 'block';
    },

    // Hide element
    hide: (element) => {
        if (element) element.style.display = 'none';
    },

    // Toggle element visibility
    toggle: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },

    // Add class
    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },

    // Remove class
    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },

    // Toggle class
    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    }
};

// Event Utilities
const Events = {
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export utilities for use in other modules
window.Storage = Storage;
window.DateTime = DateTime;
window.Validation = Validation;
window.Format = Format;
window.DOM = DOM;
window.Events = Events;