// Main App Module for FreelanceOS

class FreelanceOS {
    constructor() {
        this.splashLoader = document.getElementById('splash-loader');
        this.app = document.getElementById('app');
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.showSplashLoader();
        this.initializeApp();
    }

    showSplashLoader() {
        this.splashLoader.style.display = 'flex';
        this.app.style.display = 'none';
    }

    hideSplashLoader() {
        this.splashLoader.style.display = 'none';
        this.app.style.display = 'flex';
    }

    async initializeApp() {
        try {
            // Simulate loading time for better UX
            await this.simulateLoading();
            
            // Initialize all modules
            await this.initializeModules();
            
            // Hide splash loader and show app
            this.hideSplashLoader();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Trigger app ready event
            window.dispatchEvent(new CustomEvent('appReady'));
            
            console.log('FreelanceOS initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing FreelanceOS:', error);
            this.showErrorMessage('Failed to initialize app. Please refresh the page.');
        }
    }

    async simulateLoading() {
        return new Promise(resolve => {
            // Simulate 2 seconds of loading
            setTimeout(resolve, 2000);
        });
    }

    async initializeModules() {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // Initialize all modules in parallel
        const modulePromises = [
            this.initializeAuth(),
            this.initializeTheme(),
            this.initializeDashboard(),
            this.initializeProductivity(),
            this.initializeFinances(),
            this.initializePortfolio(),
            this.initializeNavigation()
        ];
        
        await Promise.all(modulePromises);
    }

    async initializeAuth() {
        return new Promise(resolve => {
            if (window.auth) {
                resolve();
            } else {
                const checkAuth = setInterval(() => {
                    if (window.auth) {
                        clearInterval(checkAuth);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    async initializeTheme() {
        return new Promise(resolve => {
            if (window.themeManager) {
                resolve();
            } else {
                const checkTheme = setInterval(() => {
                    if (window.themeManager) {
                        clearInterval(checkTheme);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    async initializeDashboard() {
        return new Promise(resolve => {
            if (window.dashboard) {
                resolve();
            } else {
                const checkDashboard = setInterval(() => {
                    if (window.dashboard) {
                        clearInterval(checkDashboard);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    async initializeProductivity() {
        return new Promise(resolve => {
            const modules = ['pomodoroTimer', 'taskPlanner', 'stickyNotes', 'digitalNotepad'];
            const checkModules = setInterval(() => {
                const allLoaded = modules.every(module => window[module]);
                if (allLoaded) {
                    clearInterval(checkModules);
                    resolve();
                }
            }, 100);
        });
    }

    async initializeFinances() {
        return new Promise(resolve => {
            const modules = ['earningsCalculator', 'expensesTracker'];
            const checkModules = setInterval(() => {
                const allLoaded = modules.every(module => window[module]);
                if (allLoaded) {
                    clearInterval(checkModules);
                    resolve();
                }
            }, 100);
        });
    }

    async initializePortfolio() {
        return new Promise(resolve => {
            if (window.portfolio) {
                resolve();
            } else {
                const checkPortfolio = setInterval(() => {
                    if (window.portfolio) {
                        clearInterval(checkPortfolio);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    async initializeNavigation() {
        return new Promise(resolve => {
            if (window.navigation) {
                resolve();
            } else {
                const checkNavigation = setInterval(() => {
                    if (window.navigation) {
                        clearInterval(checkNavigation);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    showErrorMessage(message) {
        const errorDiv = DOM.createElement('div', {
            className: 'app-error',
            textContent: message
        });
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--error-color);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Get app statistics
    getAppStats() {
        const stats = {
            initialized: this.isInitialized,
            modules: {
                auth: !!window.auth,
                theme: !!window.themeManager,
                dashboard: !!window.dashboard,
                pomodoro: !!window.pomodoroTimer,
                tasks: !!window.taskPlanner,
                notes: !!window.stickyNotes,
                notepad: !!window.digitalNotepad,
                earnings: !!window.earningsCalculator,
                expenses: !!window.expensesTracker,
                portfolio: !!window.portfolio,
                navigation: !!window.navigation
            },
            storage: {
                available: this.checkStorageAvailability(),
                used: this.getStorageUsage()
            }
        };
        
        return stats;
    }

    checkStorageAvailability() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        } catch (e) {
            return 0;
        }
    }

    // Export all app data
    exportAllData() {
        const allData = {
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0',
            data: {
                tasks: Storage.load('freelanceos_tasks', []),
                notes: Storage.load('freelanceos_notes', []),
                notepad: Storage.load('freelanceos_notepad_content', ''),
                earnings: Storage.load('freelanceos_earnings', []),
                expenses: Storage.load('freelanceos_expenses', []),
                projects: Storage.load('freelanceos_projects', []),
                pomodoroSessions: Storage.load('freelanceos_pomodoro_sessions', []),
                settings: {
                    theme: Storage.load('freelanceos_theme', 'light'),
                    pomodoro: Storage.load('freelanceos_pomodoro_settings', {}),
                    navigation: Storage.load('freelanceos_navigation_history', [])
                }
            }
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('All data exported successfully!', 'success');
    }

    // Import app data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.data) {
                    // Import all data
                    Object.entries(data.data).forEach(([key, value]) => {
                        if (key === 'settings') {
                            Object.entries(value).forEach(([settingKey, settingValue]) => {
                                Storage.save(`freelanceos_${settingKey}`, settingValue);
                            });
                        } else {
                            Storage.save(`freelanceos_${key}`, value);
                        }
                    });
                    
                    // Reload modules
                    this.reloadModules();
                    
                    this.showMessage('Data imported successfully! Please refresh the page.', 'success');
                } else {
                    this.showMessage('Invalid data format', 'error');
                }
            } catch (error) {
                this.showMessage('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    reloadModules() {
        // Reload all modules that depend on localStorage
        if (window.taskPlanner) window.taskPlanner.loadTasks();
        if (window.stickyNotes) window.stickyNotes.loadNotes();
        if (window.digitalNotepad) window.digitalNotepad.loadContent();
        if (window.earningsCalculator) window.earningsCalculator.loadEarnings();
        if (window.expensesTracker) window.expensesTracker.loadExpenses();
        if (window.portfolio) window.portfolio.loadProjects();
        if (window.pomodoroTimer) window.pomodoroTimer.loadSessions();
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `app-message app-message-${type}`,
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

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            this.showMessage('All data cleared successfully!', 'success');
            
            // Reload page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

// Initialize FreelanceOS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.freelanceOS = new FreelanceOS();
});

// Add global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.freelanceOS && window.freelanceOS.isInitialized) {
        // Ctrl+Shift+E to export all data
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            window.freelanceOS.exportAllData();
        }
        
        // Ctrl+Shift+C to clear all data
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            window.freelanceOS.clearAllData();
        }
        
        // F1 to show help
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    }
});

// Add help function
function showHelp() {
    const helpContent = `
        <div class="help-modal">
            <h2>FreelanceOS Help</h2>
            <div class="help-content">
                <h3>Keyboard Shortcuts:</h3>
                <ul>
                    <li><strong>Ctrl+1-4:</strong> Navigate to sections</li>
                    <li><strong>Space:</strong> Start/Pause Pomodoro timer</li>
                    <li><strong>R:</strong> Reset Pomodoro timer</li>
                    <li><strong>Ctrl+S:</strong> Save notepad content</li>
                    <li><strong>Ctrl+E:</strong> Export notepad content</li>
                    <li><strong>Ctrl+N:</strong> Add new note</li>
                    <li><strong>Ctrl+Enter:</strong> Add task/expense</li>
                    <li><strong>Ctrl+Shift+E:</strong> Export all data</li>
                    <li><strong>Ctrl+Shift+C:</strong> Clear all data</li>
                </ul>
                
                <h3>Features:</h3>
                <ul>
                    <li><strong>Dashboard:</strong> Welcome screen with motivational quotes</li>
                    <li><strong>Productivity:</strong> Pomodoro timer, task planner, sticky notes, digital notepad</li>
                    <li><strong>Finances:</strong> Earnings calculator, income tracker, expense tracker</li>
                    <li><strong>Portfolio:</strong> Resume upload, project showcase</li>
                </ul>
                
                <h3>Data Storage:</h3>
                <p>All your data is stored locally in your browser. No data is sent to external servers.</p>
            </div>
        </div>
    `;
    
    const helpModal = DOM.createElement('div', {
        className: 'help-overlay'
    });
    
    helpModal.innerHTML = helpContent;
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(helpModal);
    
    // Close on click
    helpModal.addEventListener('click', () => {
        helpModal.remove();
    });
}