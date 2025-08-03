// Navigation Module for FreelanceOS

class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.currentSection = 'dashboard';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleInitialRoute();
    }

    bindEvents() {
        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section, false);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('payments');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('productivity');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateToSection('finances');
                        break;
                    case '5':
                        e.preventDefault();
                        this.navigateToSection('portfolio');
                        break;
                }
            }
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        const validSections = ['dashboard', 'payments', 'productivity', 'finances', 'portfolio'];
        
        if (hash && validSections.includes(hash)) {
            this.navigateToSection(hash, false);
        } else {
            this.navigateToSection('dashboard', false);
        }
    }

    navigateToSection(section, updateHistory = true) {
        if (updateHistory) {
            const state = { section };
            const url = `#${section}`;
            window.history.pushState(state, '', url);
        }
        
        this.showSection(section);
    }

    showSection(section) {
        // Hide all sections
        this.sections.forEach(s => {
            s.classList.remove('active');
        });
        
        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Activate corresponding nav link
        const targetNavLink = document.querySelector(`[data-section="${section}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }
        
        this.currentSection = section;
        
        // Trigger section-specific events
        this.triggerSectionEvent(section);
    }

    triggerSectionEvent(section) {
        // Dispatch custom event for section changes
        window.dispatchEvent(new CustomEvent('sectionChanged', { 
            detail: { section, previousSection: this.currentSection }
        }));
        
        // Section-specific initialization
        switch (section) {
            case 'dashboard':
                if (window.dashboard) {
                    window.dashboard.refresh();
                }
                break;
            case 'payments':
                if (window.paymentTracker) {
                    window.paymentTracker.renderPaymentsTable();
                    window.paymentTracker.updateSummary();
                }
                break;
            case 'productivity':
                // Initialize productivity tools if needed
                break;
            case 'finances':
                if (window.earningsCalculator) {
                    window.earningsCalculator.updateDisplays();
                    window.earningsCalculator.renderIncomeChart();
                }
                if (window.expensesTracker) {
                    window.expensesTracker.renderExpenseChart();
                }
                break;
            case 'portfolio':
                if (window.portfolio) {
                    window.portfolio.checkResumeStatus();
                }
                break;
        }
    }

    getCurrentSection() {
        return this.currentSection;
    }

    // Method to get section statistics
    getSectionStats() {
        const stats = {
            dashboard: {
                visits: Storage.load('freelanceos_dashboard_visits', 0),
                lastVisit: Storage.load('freelanceos_dashboard_last_visit', null)
            },
            productivity: {
                visits: Storage.load('freelanceos_productivity_visits', 0),
                lastVisit: Storage.load('freelanceos_productivity_last_visit', null)
            },
            finances: {
                visits: Storage.load('freelanceos_finances_visits', 0),
                lastVisit: Storage.load('freelanceos_finances_last_visit', null)
            },
            portfolio: {
                visits: Storage.load('freelanceos_portfolio_visits', 0),
                lastVisit: Storage.load('freelanceos_portfolio_last_visit', null)
            }
        };
        
        return stats;
    }

    // Method to track section visits
    trackSectionVisit(section) {
        const visits = Storage.load(`freelanceos_${section}_visits`, 0);
        Storage.save(`freelanceos_${section}_visits`, visits + 1);
        Storage.save(`freelanceos_${section}_last_visit`, new Date().toISOString());
    }

    // Method to get most visited section
    getMostVisitedSection() {
        const stats = this.getSectionStats();
        let mostVisited = 'dashboard';
        let maxVisits = 0;
        
        Object.entries(stats).forEach(([section, data]) => {
            if (data.visits > maxVisits) {
                maxVisits = data.visits;
                mostVisited = section;
            }
        });
        
        return mostVisited;
    }

    // Method to show breadcrumb navigation
    showBreadcrumb() {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer) return;
        
        const sectionNames = {
            dashboard: 'Dashboard',
            productivity: 'Productivity',
            finances: 'Finances',
            portfolio: 'Portfolio'
        };
        
        breadcrumbContainer.innerHTML = `
            <span class="breadcrumb-item">
                <a href="#dashboard" class="breadcrumb-link">Home</a>
            </span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item current">${sectionNames[this.currentSection]}</span>
        `;
        
        // Add event listener to home link
        const homeLink = breadcrumbContainer.querySelector('.breadcrumb-link');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('dashboard');
            });
        }
    }

    // Method to show section shortcuts
    showSectionShortcuts() {
        const shortcutsContainer = document.querySelector('.section-shortcuts');
        if (!shortcutsContainer) return;
        
        const shortcuts = [
            { key: '1', section: 'dashboard', label: 'Dashboard' },
            { key: '2', section: 'productivity', label: 'Productivity' },
            { key: '3', section: 'finances', label: 'Finances' },
            { key: '4', section: 'portfolio', label: 'Portfolio' }
        ];
        
        shortcutsContainer.innerHTML = shortcuts.map(shortcut => `
            <div class="shortcut-item">
                <span class="shortcut-key">Ctrl+${shortcut.key}</span>
                <span class="shortcut-label">${shortcut.label}</span>
            </div>
        `).join('');
    }

    // Method to handle deep linking
    handleDeepLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        
        if (section && ['dashboard', 'productivity', 'finances', 'portfolio'].includes(section)) {
            this.navigateToSection(section, false);
        }
    }

    // Method to get navigation history
    getNavigationHistory() {
        return Storage.load('freelanceos_navigation_history', []);
    }

    // Method to add to navigation history
    addToHistory(section) {
        const history = this.getNavigationHistory();
        const entry = {
            section,
            timestamp: new Date().toISOString()
        };
        
        history.unshift(entry);
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(50);
        }
        
        Storage.save('freelanceos_navigation_history', history);
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Add navigation tracking
document.addEventListener('sectionChanged', (e) => {
    if (window.navigation) {
        window.navigation.trackSectionVisit(e.detail.section);
        window.navigation.addToHistory(e.detail.section);
    }
});