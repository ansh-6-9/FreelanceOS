// Theme Management Module for FreelanceOS

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        this.currentTheme = 'light';
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.updateThemeIcon();
    }

    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!Storage.load('freelanceos_theme_manual', false)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    loadTheme() {
        // Check for saved theme preference
        const savedTheme = Storage.load('freelanceos_theme', null);
        const manualOverride = Storage.load('freelanceos_theme_manual', false);
        
        if (savedTheme && manualOverride) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            this.setSystemTheme();
        }
    }

    setSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        Storage.save('freelanceos_theme', theme);
        this.updateThemeIcon();
        
        // Trigger custom event for other modules
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        Storage.save('freelanceos_theme_manual', true);
        
        // Add subtle animation
        this.themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    }

    updateThemeIcon() {
        if (this.currentTheme === 'dark') {
            this.themeIcon.textContent = '☀️';
            this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            this.themeIcon.textContent = '🌙';
            this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    // Method to check if dark mode is active
    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    // Method to get theme-aware colors
    getThemeColors() {
        const colors = {
            light: {
                primary: '#6366f1',
                background: '#ffffff',
                surface: '#f8fafc',
                text: '#1e293b',
                textSecondary: '#64748b',
                border: '#e2e8f0'
            },
            dark: {
                primary: '#6366f1',
                background: '#0f172a',
                surface: '#1e293b',
                text: '#f1f5f9',
                textSecondary: '#cbd5e1',
                border: '#475569'
            }
        };
        
        return colors[this.currentTheme];
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Add theme transition styles
const themeTransitionStyle = document.createElement('style');
themeTransitionStyle.textContent = `
    * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    .theme-toggle {
        transition: transform 0.3s ease;
    }
    
    /* Smooth theme transitions for specific elements */
    .card,
    .btn,
    input,
    textarea,
    select {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
`;
document.head.appendChild(themeTransitionStyle);