// Pomodoro Timer Module for FreelanceOS

class PomodoroTimer {
    constructor() {
        this.timerDisplay = {
            minutes: document.getElementById('timer-minutes'),
            seconds: document.getElementById('timer-seconds')
        };
        this.startButton = document.getElementById('timer-start');
        this.pauseButton = document.getElementById('timer-pause');
        this.resetButton = document.getElementById('timer-reset');
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.sessionList = document.getElementById('session-list');
        
        this.timer = null;
        this.isRunning = false;
        this.isBreak = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.workTime = 25;
        this.breakTime = 5;
        this.sessions = [];
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadSessions();
        this.bindEvents();
        this.updateDisplay();
        this.renderSessions();
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.pauseButton.addEventListener('click', () => this.pauseTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        
        this.workTimeInput.addEventListener('change', () => {
            this.workTime = parseInt(this.workTimeInput.value);
            this.saveSettings();
            if (!this.isRunning) {
                this.timeLeft = this.workTime * 60;
                this.updateDisplay();
            }
        });
        
        this.breakTimeInput.addEventListener('change', () => {
            this.breakTime = parseInt(this.breakTimeInput.value);
            this.saveSettings();
        });
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.completeSession();
                }
            }, 1000);
            
            // Add visual feedback
            this.startButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.startButton.style.transform = 'scale(1)';
            }, 150);
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;
            
            clearInterval(this.timer);
            
            // Add visual feedback
            this.pauseButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.pauseButton.style.transform = 'scale(1)';
            }, 150);
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.isBreak = false;
        this.timeLeft = this.workTime * 60;
        this.updateDisplay();
        
        // Add visual feedback
        this.resetButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.resetButton.style.transform = 'scale(1)';
        }, 150);
    }

    completeSession() {
        this.pauseTimer();
        
        const sessionType = this.isBreak ? 'Break' : 'Work';
        const duration = this.isBreak ? this.breakTime : this.workTime;
        
        // Add session to log
        this.addSession(sessionType, duration);
        
        // Show notification
        this.showNotification(sessionType, duration);
        
        // Switch to break or work
        this.isBreak = !this.isBreak;
        this.timeLeft = this.isBreak ? this.breakTime * 60 : this.workTime * 60;
        this.updateDisplay();
        
        // Auto-start next session if it's a work session
        if (!this.isBreak) {
            setTimeout(() => {
                this.startTimer();
            }, 1000);
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timerDisplay.minutes.textContent = minutes.toString().padStart(2, '0');
        this.timerDisplay.seconds.textContent = seconds.toString().padStart(2, '0');
        
        // Add visual feedback for low time
        if (this.timeLeft <= 60) {
            this.timerDisplay.minutes.style.color = 'var(--error-color)';
            this.timerDisplay.seconds.style.color = 'var(--error-color)';
        } else {
            this.timerDisplay.minutes.style.color = 'var(--primary-color)';
            this.timerDisplay.seconds.style.color = 'var(--primary-color)';
        }
    }

    addSession(type, duration) {
        const session = {
            id: Date.now(),
            type: type,
            duration: duration,
            timestamp: new Date().toISOString(),
            date: DateTime.formatDate(new Date())
        };
        
        this.sessions.unshift(session);
        
        // Keep only last 50 sessions
        if (this.sessions.length > 50) {
            this.sessions = this.sessions.slice(0, 50);
        }
        
        this.saveSessions();
        this.renderSessions();
    }

    renderSessions() {
        this.sessionList.innerHTML = '';
        
        const todaySessions = this.sessions.filter(session => 
            DateTime.isToday(new Date(session.timestamp))
        );
        
        if (todaySessions.length === 0) {
            this.sessionList.innerHTML = '<li>No sessions today</li>';
            return;
        }
        
        todaySessions.forEach(session => {
            const li = DOM.createElement('li', {
                className: 'session-item'
            });
            
            const time = new Date(session.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            li.innerHTML = `
                <span class="session-time">${time}</span>
                <span class="session-type ${session.type.toLowerCase()}">${session.type}</span>
                <span class="session-duration">${session.duration}min</span>
            `;
            
            this.sessionList.appendChild(li);
        });
    }

    showNotification(type, duration) {
        const title = `${type} Session Complete!`;
        const body = `You completed a ${duration}-minute ${type.toLowerCase()} session.`;
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
        
        // In-app notification
        this.showInAppNotification(title, body, type);
    }

    showInAppNotification(title, body, type) {
        const notification = DOM.createElement('div', {
            className: 'timer-notification'
        });
        
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${body}</div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px var(--shadow-color);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add border color based on type
        if (type === 'Work') {
            notification.style.borderLeft = '4px solid var(--primary-color)';
        } else {
            notification.style.borderLeft = '4px solid var(--success-color)';
        }
        
        document.body.appendChild(notification);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    loadSettings() {
        const settings = Storage.load('freelanceos_pomodoro_settings', {
            workTime: 25,
            breakTime: 5
        });
        
        this.workTime = settings.workTime;
        this.breakTime = settings.breakTime;
        this.workTimeInput.value = this.workTime;
        this.breakTimeInput.value = this.breakTime;
        this.timeLeft = this.workTime * 60;
    }

    saveSettings() {
        Storage.save('freelanceos_pomodoro_settings', {
            workTime: this.workTime,
            breakTime: this.breakTime
        });
    }

    loadSessions() {
        this.sessions = Storage.load('freelanceos_pomodoro_sessions', []);
    }

    saveSessions() {
        Storage.save('freelanceos_pomodoro_sessions', this.sessions);
    }

    // Get timer statistics
    getStats() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.timestamp).toDateString() === today
        );
        
        const workSessions = todaySessions.filter(s => s.type === 'Work');
        const breakSessions = todaySessions.filter(s => s.type === 'Break');
        
        return {
            totalSessions: todaySessions.length,
            workSessions: workSessions.length,
            breakSessions: breakSessions.length,
            totalWorkTime: workSessions.reduce((sum, s) => sum + s.duration, 0),
            totalBreakTime: breakSessions.reduce((sum, s) => sum + s.duration, 0)
        };
    }

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize Pomodoro timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
    
    // Request notification permission on first interaction
    document.addEventListener('click', () => {
        if (window.pomodoroTimer) {
            window.pomodoroTimer.requestNotificationPermission();
        }
    }, { once: true });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.pomodoroTimer) {
        // Spacebar to start/pause
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (window.pomodoroTimer.isRunning) {
                window.pomodoroTimer.pauseTimer();
            } else {
                window.pomodoroTimer.startTimer();
            }
        }
        
        // R key to reset
        if (e.code === 'KeyR' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            window.pomodoroTimer.resetTimer();
        }
    }
});