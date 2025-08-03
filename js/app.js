/**
 * FreelanceOS - Main Application
 * A comprehensive freelance workflow management application
 */

class FreelanceOS {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentTab = {};
        this.timer = null;
        this.timerState = {
            isRunning: false,
            currentTime: 25 * 60, // 25 minutes in seconds
            currentSession: 'work',
            sessionCount: 0
        };
        this.data = {
            tasks: [],
            stickyNotes: [],
            savedNotes: [],
            incomeRecords: [],
            expenseRecords: [],
            projects: [],
            pomodoroSessions: [],
            resume: null
        };
        this.motivationalQuotes = [
            { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
            { quote: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
            { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { quote: "If you really look closely, most overnight successes took a long time.", author: "Steve Jobs" },
            { quote: "The real test is not whether you avoid this failure, because you won't. It's whether you let it harden or shame you into inaction, or whether you learn from it; whether you choose to persevere.", author: "Barack Obama" }
        ];
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.showSplashLoader();
        this.loadData();
        this.setupEventListeners();
        this.initTheme();
        this.checkAuthentication();
    }

    /**
     * Show splash loader
     */
    showSplashLoader() {
        setTimeout(() => {
            document.getElementById('splash-loader').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('splash-loader').style.display = 'none';
            }, 500);
        }, 2000);
    }

    /**
     * Check authentication status
     */
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('freelanceOS_authenticated');
        if (isAuthenticated) {
            this.showApp();
        } else {
            this.showAuthModal();
        }
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        setTimeout(() => {
            document.getElementById('auth-modal').classList.remove('hidden');
        }, 2500);
    }

    /**
     * Show main application
     */
    showApp() {
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('auth-modal').classList.add('hidden');
        this.updateDashboard();
        this.updateDateTime();
        this.showRandomQuote();
        
        // Update dashboard every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Authentication
        document.getElementById('auth-submit').addEventListener('click', () => this.handleAuth());
        document.getElementById('passcode-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuth();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Quick links
        document.querySelectorAll('.quick-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                const tool = e.currentTarget.dataset.tool;
                this.switchSection(section, tool);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Dashboard
        document.getElementById('new-quote-btn').addEventListener('click', () => this.showRandomQuote());

        // Tabs
        this.setupTabListeners();

        // Productivity tools
        this.setupPomodoroListeners();
        this.setupTaskListeners();
        this.setupStickyNotesListeners();
        this.setupNotepadListeners();

        // Finance tools
        this.setupFinanceListeners();

        // Portfolio
        this.setupPortfolioListeners();
    }

    /**
     * Setup tab listeners
     */
    setupTabListeners() {
        // Productivity tabs
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.closest('section').id;
                const tabName = e.target.dataset.tab;
                this.switchTab(section, tabName);
            });
        });
    }

    /**
     * Handle authentication
     */
    handleAuth() {
        const passcode = document.getElementById('passcode-input').value.trim();
        if (passcode.length >= 4) {
            localStorage.setItem('freelanceOS_authenticated', 'true');
            localStorage.setItem('freelanceOS_passcode', passcode);
            this.showApp();
        } else {
            alert('Passcode must be at least 4 characters long');
        }
    }

    /**
     * Logout user
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('freelanceOS_authenticated');
            location.reload();
        }
    }

    /**
     * Switch between main sections
     */
    switchSection(sectionName, tool = null) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionName).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        // If tool specified, switch to that tab
        if (tool) {
            this.switchTab(sectionName, tool);
        }

        // Update section-specific content
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'finances') {
            this.updateFinancialSummary();
        } else if (sectionName === 'portfolio') {
            this.updatePortfolio();
        }
    }

    /**
     * Switch between tabs within sections
     */
    switchTab(section, tabName) {
        const sectionElement = document.getElementById(section);
        
        // Hide all tab contents in this section
        sectionElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show target tab content
        const targetTab = sectionElement.querySelector(`#${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Update tab buttons
        sectionElement.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = sectionElement.querySelector(`[data-tab="${tabName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        this.currentTab[section] = tabName;

        // Load tab-specific content
        if (tabName === 'tasks') {
            this.renderTasks();
        } else if (tabName === 'sticky-notes') {
            this.renderStickyNotes();
        } else if (tabName === 'notepad') {
            this.renderSavedNotes();
        } else if (tabName === 'income') {
            this.renderIncomeRecords();
        } else if (tabName === 'expenses') {
            this.renderExpenseRecords();
            this.renderExpenseChart();
        } else if (tabName === 'projects') {
            this.renderProjects();
        }
    }

    /**
     * Initialize theme
     */
    initTheme() {
        const savedTheme = localStorage.getItem('freelanceOS_theme') || 'light';
        this.setTheme(savedTheme);
    }

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('freelanceOS_theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    /**
     * Update dashboard with current stats
     */
    updateDashboard() {
        // Update task count
        const todayTasks = this.data.tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === new Date().toDateString();
        });
        document.getElementById('tasks-count').textContent = todayTasks.length;

        // Update pomodoro count
        const todaySessions = this.data.pomodoroSessions.filter(session => {
            const sessionDate = new Date(session.date).toDateString();
            return sessionDate === new Date().toDateString();
        });
        document.getElementById('pomodoro-count').textContent = todaySessions.length;

        // Update monthly income
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyIncome = this.data.incomeRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            })
            .reduce((total, record) => total + record.amount, 0);
        document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
    }

    /**
     * Update date and time display
     */
    updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        document.getElementById('current-time').textContent = timeString;
        document.getElementById('current-date').textContent = dateString;

        // Update greeting based on time
        const hour = now.getHours();
        let greeting;
        if (hour < 12) greeting = 'Good morning!';
        else if (hour < 17) greeting = 'Good afternoon!';
        else greeting = 'Good evening!';
        
        document.getElementById('welcome-greeting').textContent = greeting;
    }

    /**
     * Show random motivational quote
     */
    showRandomQuote() {
        const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        document.getElementById('motivation-quote').textContent = `"${randomQuote.quote}"`;
        document.getElementById('motivation-author').textContent = `- ${randomQuote.author}`;
    }

    /**
     * Setup Pomodoro timer listeners
     */
    setupPomodoroListeners() {
        document.getElementById('timer-start').addEventListener('click', () => this.startTimer());
        document.getElementById('timer-pause').addEventListener('click', () => this.pauseTimer());
        document.getElementById('timer-reset').addEventListener('click', () => this.resetTimer());

        // Settings change listeners
        ['work-duration', 'break-duration', 'long-break-duration'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateTimerSettings());
        });
    }

    /**
     * Start pomodoro timer
     */
    startTimer() {
        if (!this.timerState.isRunning) {
            this.timerState.isRunning = true;
            this.timer = setInterval(() => {
                this.timerState.currentTime--;
                this.updateTimerDisplay();
                
                if (this.timerState.currentTime <= 0) {
                    this.timerComplete();
                }
            }, 1000);
            
            document.getElementById('timer-start').textContent = 'Running...';
            document.getElementById('timer-start').disabled = true;
        }
    }

    /**
     * Pause pomodoro timer
     */
    pauseTimer() {
        if (this.timerState.isRunning) {
            this.timerState.isRunning = false;
            clearInterval(this.timer);
            document.getElementById('timer-start').textContent = 'Resume';
            document.getElementById('timer-start').disabled = false;
        }
    }

    /**
     * Reset pomodoro timer
     */
    resetTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timer);
        this.timerState.currentTime = parseInt(document.getElementById('work-duration').value) * 60;
        this.timerState.currentSession = 'work';
        this.updateTimerDisplay();
        document.getElementById('timer-start').textContent = 'Start';
        document.getElementById('timer-start').disabled = false;
    }

    /**
     * Handle timer completion
     */
    timerComplete() {
        this.timerState.isRunning = false;
        clearInterval(this.timer);
        
        // Log session
        this.logPomodoroSession(this.timerState.currentSession);
        
        // Play notification sound (browser notification)
        if (Notification.permission === 'granted') {
            new Notification(`${this.timerState.currentSession} session complete!`);
        }
        
        // Switch session type
        if (this.timerState.currentSession === 'work') {
            this.timerState.sessionCount++;
            if (this.timerState.sessionCount % 4 === 0) {
                this.timerState.currentSession = 'longBreak';
                this.timerState.currentTime = parseInt(document.getElementById('long-break-duration').value) * 60;
            } else {
                this.timerState.currentSession = 'break';
                this.timerState.currentTime = parseInt(document.getElementById('break-duration').value) * 60;
            }
        } else {
            this.timerState.currentSession = 'work';
            this.timerState.currentTime = parseInt(document.getElementById('work-duration').value) * 60;
        }
        
        this.updateTimerDisplay();
        document.getElementById('timer-start').textContent = 'Start';
        document.getElementById('timer-start').disabled = false;
        
        alert(`${this.timerState.currentSession === 'work' ? 'Break' : 'Work'} time complete! Ready for ${this.timerState.currentSession}?`);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.currentTime / 60);
        const seconds = this.timerState.currentTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timer-time').textContent = timeString;
        
        const labels = {
            work: 'Work Session',
            break: 'Short Break',
            longBreak: 'Long Break'
        };
        document.getElementById('timer-label').textContent = labels[this.timerState.currentSession];
    }

    /**
     * Update timer settings
     */
    updateTimerSettings() {
        if (!this.timerState.isRunning && this.timerState.currentSession === 'work') {
            this.timerState.currentTime = parseInt(document.getElementById('work-duration').value) * 60;
            this.updateTimerDisplay();
        }
    }

    /**
     * Log pomodoro session
     */
    logPomodoroSession(sessionType) {
        const session = {
            id: Date.now(),
            type: sessionType,
            date: new Date().toISOString(),
            duration: sessionType === 'work' ? 
                parseInt(document.getElementById('work-duration').value) : 
                sessionType === 'break' ? 
                    parseInt(document.getElementById('break-duration').value) : 
                    parseInt(document.getElementById('long-break-duration').value)
        };
        
        this.data.pomodoroSessions.push(session);
        this.saveData();
        this.renderPomodoroSessions();
        this.updateDashboard();
    }

    /**
     * Render pomodoro sessions
     */
    renderPomodoroSessions() {
        const sessionList = document.getElementById('session-list');
        const todaySessions = this.data.pomodoroSessions.filter(session => {
            const sessionDate = new Date(session.date).toDateString();
            return sessionDate === new Date().toDateString();
        });

        if (todaySessions.length === 0) {
            sessionList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No sessions today</p>';
            return;
        }

        sessionList.innerHTML = todaySessions.map(session => `
            <div class="session-item">
                <span>${session.type} (${session.duration}min)</span>
                <span>${new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `).join('');
    }

    /**
     * Setup task planner listeners
     */
    setupTaskListeners() {
        document.getElementById('add-task').addEventListener('click', () => this.addTask());
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        document.getElementById('export-tasks').addEventListener('click', () => this.exportTasks());
        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompletedTasks());

        // Filter listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });
    }

    /**
     * Add new task
     */
    addTask() {
        const input = document.getElementById('task-input');
        const text = input.value.trim();
        
        if (text) {
            const task = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.data.tasks.unshift(task);
            input.value = '';
            this.saveData();
            this.renderTasks();
            this.updateDashboard();
        }
    }

    /**
     * Toggle task completion
     */
    toggleTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderTasks();
            this.updateDashboard();
        }
    }

    /**
     * Edit task
     */
    editTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText && newText.trim()) {
                task.text = newText.trim();
                this.saveData();
                this.renderTasks();
            }
        }
    }

    /**
     * Delete task
     */
    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.data.tasks = this.data.tasks.filter(t => t.id !== id);
            this.saveData();
            this.renderTasks();
            this.updateDashboard();
        }
    }

    /**
     * Filter tasks
     */
    filterTasks(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderTasks(filter);
    }

    /**
     * Render tasks
     */
    renderTasks(filter = 'all') {
        const taskList = document.getElementById('task-list');
        let filteredTasks = this.data.tasks;

        if (filter === 'completed') {
            filteredTasks = this.data.tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = this.data.tasks.filter(task => !task.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No tasks found</p>';
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-edit" onclick="app.editTask(${task.id})" title="Edit">✏️</button>
                    <button class="task-delete" onclick="app.deleteTask(${task.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Export tasks to text file
     */
    exportTasks() {
        const tasks = this.data.tasks.map(task => 
            `${task.completed ? '✅' : '❌'} ${task.text} (Created: ${new Date(task.createdAt).toLocaleDateString()})`
        ).join('\n');
        
        const blob = new Blob([tasks], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear completed tasks
     */
    clearCompletedTasks() {
        if (confirm('Delete all completed tasks?')) {
            this.data.tasks = this.data.tasks.filter(task => !task.completed);
            this.saveData();
            this.renderTasks();
            this.updateDashboard();
        }
    }

    /**
     * Setup sticky notes listeners
     */
    setupStickyNotesListeners() {
        document.getElementById('add-sticky').addEventListener('click', () => this.addStickyNote());
        document.getElementById('clear-stickies').addEventListener('click', () => this.clearStickyNotes());
    }

    /**
     * Add new sticky note
     */
    addStickyNote() {
        const note = {
            id: Date.now(),
            content: '',
            x: Math.random() * 300,
            y: Math.random() * 200,
            color: '#ffd700'
        };
        
        this.data.stickyNotes.push(note);
        this.saveData();
        this.renderStickyNotes();
    }

    /**
     * Delete sticky note
     */
    deleteStickyNote(id) {
        this.data.stickyNotes = this.data.stickyNotes.filter(note => note.id !== id);
        this.saveData();
        this.renderStickyNotes();
    }

    /**
     * Update sticky note content
     */
    updateStickyNote(id, content) {
        const note = this.data.stickyNotes.find(n => n.id === id);
        if (note) {
            note.content = content;
            this.saveData();
        }
    }

    /**
     * Update sticky note position
     */
    updateStickyPosition(id, x, y) {
        const note = this.data.stickyNotes.find(n => n.id === id);
        if (note) {
            note.x = x;
            note.y = y;
            this.saveData();
        }
    }

    /**
     * Render sticky notes
     */
    renderStickyNotes() {
        const container = document.getElementById('sticky-container');
        container.innerHTML = this.data.stickyNotes.map(note => `
            <div class="sticky-note" id="sticky-${note.id}" style="left: ${note.x}px; top: ${note.y}px; background: ${note.color}">
                <div class="sticky-header">
                    <span>📌</span>
                    <button class="sticky-close" onclick="app.deleteStickyNote(${note.id})">×</button>
                </div>
                <textarea class="sticky-content" placeholder="Type your note..."
                         onchange="app.updateStickyNote(${note.id}, this.value)"
                         oninput="app.updateStickyNote(${note.id}, this.value)">${note.content}</textarea>
            </div>
        `).join('');

        // Make sticky notes draggable
        this.data.stickyNotes.forEach(note => {
            this.makeDraggable(document.getElementById(`sticky-${note.id}`), note.id);
        });
    }

    /**
     * Make element draggable
     */
    makeDraggable(element, noteId) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const header = element.querySelector('.sticky-header');
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                element.style.left = `${currentX}px`;
                element.style.top = `${currentY}px`;
            }
        }

        function dragEnd() {
            if (isDragging) {
                isDragging = false;
                app.updateStickyPosition(noteId, currentX, currentY);
            }
        }
    }

    /**
     * Clear all sticky notes
     */
    clearStickyNotes() {
        if (confirm('Delete all sticky notes?')) {
            this.data.stickyNotes = [];
            this.saveData();
            this.renderStickyNotes();
        }
    }

    /**
     * Setup notepad listeners
     */
    setupNotepadListeners() {
        document.getElementById('save-note').addEventListener('click', () => this.saveNote());
        document.getElementById('export-txt').addEventListener('click', () => this.exportNoteAsText());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportNoteAsPDF());
        document.getElementById('clear-notepad').addEventListener('click', () => this.clearNotepad());
    }

    /**
     * Save note
     */
    saveNote() {
        const title = document.getElementById('note-title').value.trim() || 'Untitled Note';
        const content = document.getElementById('notepad-content').value.trim();
        
        if (content) {
            const note = {
                id: Date.now(),
                title: title,
                content: content,
                date: new Date().toISOString()
            };
            
            this.data.savedNotes.unshift(note);
            this.saveData();
            this.renderSavedNotes();
            alert('Note saved successfully!');
        } else {
            alert('Please enter some content to save.');
        }
    }

    /**
     * Load saved note
     */
    loadSavedNote(id) {
        const note = this.data.savedNotes.find(n => n.id === id);
        if (note) {
            document.getElementById('note-title').value = note.title;
            document.getElementById('notepad-content').value = note.content;
        }
    }

    /**
     * Delete saved note
     */
    deleteSavedNote(id) {
        if (confirm('Delete this note?')) {
            this.data.savedNotes = this.data.savedNotes.filter(n => n.id !== id);
            this.saveData();
            this.renderSavedNotes();
        }
    }

    /**
     * Export note as text file
     */
    exportNoteAsText() {
        const title = document.getElementById('note-title').value.trim() || 'note';
        const content = document.getElementById('notepad-content').value.trim();
        
        if (content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert('No content to export.');
        }
    }

    /**
     * Export note as PDF (simplified version)
     */
    exportNoteAsPDF() {
        const title = document.getElementById('note-title').value.trim() || 'note';
        const content = document.getElementById('notepad-content').value.trim();
        
        if (content) {
            // Create a simple PDF using window.print
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                        h1 { color: #333; border-bottom: 2px solid #333; }
                        .content { white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div class="content">${content}</div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('No content to export.');
        }
    }

    /**
     * Clear notepad
     */
    clearNotepad() {
        if (confirm('Clear notepad content?')) {
            document.getElementById('note-title').value = '';
            document.getElementById('notepad-content').value = '';
        }
    }

    /**
     * Render saved notes
     */
    renderSavedNotes() {
        const notesList = document.getElementById('saved-notes-list');
        
        if (this.data.savedNotes.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No saved notes</p>';
            return;
        }

        notesList.innerHTML = this.data.savedNotes.map(note => `
            <div class="saved-note-item">
                <div onclick="app.loadSavedNote(${note.id})">
                    <div class="saved-note-title">${note.title}</div>
                    <div class="saved-note-date">${new Date(note.date).toLocaleDateString()}</div>
                </div>
                <div class="saved-note-actions">
                    <button onclick="app.deleteSavedNote(${note.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Setup finance listeners
     */
    setupFinanceListeners() {
        // Calculator
        ['hourly-rate', 'hours-worked'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.calculateEarnings());
        });
        document.getElementById('save-calculation').addEventListener('click', () => this.saveCalculation());

        // Expenses
        document.getElementById('add-expense').addEventListener('click', () => this.addExpense());
    }

    /**
     * Calculate earnings
     */
    calculateEarnings() {
        const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;
        const hours = parseFloat(document.getElementById('hours-worked').value) || 0;
        const total = rate * hours;
        
        document.getElementById('total-earnings').textContent = total.toFixed(2);
    }

    /**
     * Save calculation to income
     */
    saveCalculation() {
        const clientName = document.getElementById('client-name').value.trim();
        const rate = parseFloat(document.getElementById('hourly-rate').value);
        const hours = parseFloat(document.getElementById('hours-worked').value);
        const description = document.getElementById('project-description').value.trim();
        const total = rate * hours;

        if (clientName && rate > 0 && hours > 0 && total > 0) {
            const record = {
                id: Date.now(),
                client: clientName,
                description: description || 'Project work',
                rate: rate,
                hours: hours,
                amount: total,
                date: new Date().toISOString()
            };

            this.data.incomeRecords.unshift(record);
            this.saveData();
            this.updateFinancialSummary();
            this.updateDashboard();
            
            // Clear form
            document.getElementById('client-name').value = '';
            document.getElementById('hourly-rate').value = '';
            document.getElementById('hours-worked').value = '';
            document.getElementById('project-description').value = '';
            document.getElementById('total-earnings').textContent = '0.00';
            
            alert('Income record saved successfully!');
        } else {
            alert('Please fill in all required fields with valid values.');
        }
    }

    /**
     * Add expense
     */
    addExpense() {
        const description = document.getElementById('expense-description').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;

        if (description && amount > 0) {
            const expense = {
                id: Date.now(),
                description: description,
                amount: amount,
                category: category,
                date: new Date().toISOString()
            };

            this.data.expenseRecords.unshift(expense);
            this.saveData();
            this.renderExpenseRecords();
            this.renderExpenseChart();
            this.updateExpenseSummary();
            
            // Clear form
            document.getElementById('expense-description').value = '';
            document.getElementById('expense-amount').value = '';
            
            alert('Expense added successfully!');
        } else {
            alert('Please enter valid description and amount.');
        }
    }

    /**
     * Update financial summary
     */
    updateFinancialSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Current month income
        const currentMonthIncome = this.data.incomeRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            })
            .reduce((total, record) => total + record.amount, 0);
        
        // Last month income
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthIncome = this.data.incomeRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
            })
            .reduce((total, record) => total + record.amount, 0);
        
        // Total income
        const totalIncome = this.data.incomeRecords.reduce((total, record) => total + record.amount, 0);
        
        document.getElementById('current-month-income').textContent = `$${currentMonthIncome.toFixed(2)}`;
        document.getElementById('last-month-income').textContent = `$${lastMonthIncome.toFixed(2)}`;
        document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    }

    /**
     * Update expense summary
     */
    updateExpenseSummary() {
        const totalExpenses = this.data.expenseRecords.reduce((total, record) => total + record.amount, 0);
        document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
    }

    /**
     * Render income records
     */
    renderIncomeRecords() {
        const container = document.getElementById('income-records');
        
        if (this.data.incomeRecords.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No income records</p>';
            return;
        }

        container.innerHTML = this.data.incomeRecords.map(record => `
            <div class="record-item">
                <div class="record-details">
                    <div class="record-title">${record.client}</div>
                    <div class="record-description">${record.description}</div>
                </div>
                <div class="record-amount income">+$${record.amount.toFixed(2)}</div>
                <div class="record-date">${new Date(record.date).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    /**
     * Render expense records
     */
    renderExpenseRecords() {
        const container = document.getElementById('expense-records');
        
        if (this.data.expenseRecords.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No expense records</p>';
            return;
        }

        container.innerHTML = this.data.expenseRecords.slice(0, 10).map(record => `
            <div class="record-item">
                <div class="record-details">
                    <div class="record-title">${record.description}</div>
                    <div class="record-description">${record.category}</div>
                </div>
                <div class="record-amount expense">-$${record.amount.toFixed(2)}</div>
                <div class="record-date">${new Date(record.date).toLocaleDateString()}</div>
            </div>
        `).join('');
        
        this.updateExpenseSummary();
    }

    /**
     * Render expense chart
     */
    renderExpenseChart() {
        const chart = document.getElementById('expense-chart');
        const categories = ['office', 'software', 'equipment', 'marketing', 'travel', 'other'];
        
        const categoryTotals = categories.map(category => {
            return this.data.expenseRecords
                .filter(record => record.category === category)
                .reduce((total, record) => total + record.amount, 0);
        });
        
        const maxAmount = Math.max(...categoryTotals);
        
        chart.innerHTML = categories.map((category, index) => {
            const amount = categoryTotals[index];
            const height = maxAmount > 0 ? (amount / maxAmount) * 150 : 0;
            
            return `
                <div class="chart-bar" style="height: ${height}px" title="${category}: $${amount.toFixed(2)}">
                    <div class="chart-label">${category}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Setup portfolio listeners
     */
    setupPortfolioListeners() {
        document.getElementById('upload-resume-btn').addEventListener('click', () => {
            document.getElementById('resume-upload').click();
        });
        
        document.getElementById('resume-upload').addEventListener('change', (e) => this.handleResumeUpload(e));
        document.getElementById('add-project').addEventListener('click', () => this.addProject());
    }

    /**
     * Handle resume upload
     */
    handleResumeUpload(event) {
        const file = event.target.files[0];
        const statusDiv = document.getElementById('resume-status');
        
        if (file) {
            if (file.type === 'application/pdf') {
                // In a real application, you would upload this to a server
                // For now, we'll just store the file name and show a success message
                this.data.resume = {
                    name: file.name,
                    size: file.size,
                    uploadDate: new Date().toISOString()
                };
                
                this.saveData();
                statusDiv.innerHTML = `
                    <div class="resume-status success">
                        ✅ Resume uploaded successfully: ${file.name}
                        <br>
                        <small>Uploaded on ${new Date().toLocaleDateString()}</small>
                        <br>
                        <button onclick="app.downloadResume()" class="btn-secondary" style="margin-top: 0.5rem;">
                            Download Resume
                        </button>
                    </div>
                `;
            } else {
                statusDiv.innerHTML = '<div class="resume-status error">❌ Please upload a PDF file only.</div>';
            }
        }
    }

    /**
     * Download resume (placeholder)
     */
    downloadResume() {
        if (this.data.resume) {
            alert(`Resume download would start here: ${this.data.resume.name}`);
        }
    }

    /**
     * Add project
     */
    addProject() {
        const title = document.getElementById('project-title').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const link = document.getElementById('project-link').value.trim();
        const technologies = document.getElementById('project-technologies').value.trim();

        if (title && description) {
            const project = {
                id: Date.now(),
                title: title,
                description: description,
                link: link,
                technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
                date: new Date().toISOString()
            };

            this.data.projects.unshift(project);
            this.saveData();
            this.renderProjects();
            
            // Clear form
            document.getElementById('project-title').value = '';
            document.getElementById('project-description').value = '';
            document.getElementById('project-link').value = '';
            document.getElementById('project-technologies').value = '';
            
            alert('Project added successfully!');
        } else {
            alert('Please fill in title and description.');
        }
    }

    /**
     * Edit project
     */
    editProject(id) {
        const project = this.data.projects.find(p => p.id === id);
        if (project) {
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-link').value = project.link || '';
            document.getElementById('project-technologies').value = project.technologies.join(', ');
            
            // Remove the project temporarily for editing
            this.deleteProject(id, false);
        }
    }

    /**
     * Delete project
     */
    deleteProject(id, confirm = true) {
        if (!confirm || window.confirm('Delete this project?')) {
            this.data.projects = this.data.projects.filter(p => p.id !== id);
            this.saveData();
            this.renderProjects();
        }
    }

    /**
     * Render projects
     */
    renderProjects() {
        const container = document.getElementById('projects-grid');
        
        if (this.data.projects.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No projects added yet</p>';
            return;
        }

        container.innerHTML = this.data.projects.map(project => `
            <div class="project-card">
                <div class="project-title">${project.title}</div>
                <div class="project-description">${project.description}</div>
                <div class="project-technologies">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">🔗 View Project</a>` : ''}
                <div class="project-actions">
                    <button class="project-edit" onclick="app.editProject(${project.id})" title="Edit">✏️</button>
                    <button class="project-delete" onclick="app.deleteProject(${project.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update portfolio section
     */
    updatePortfolio() {
        this.renderProjects();
        
        // Show resume status if exists
        if (this.data.resume) {
            const statusDiv = document.getElementById('resume-status');
            statusDiv.innerHTML = `
                <div class="resume-status success">
                    ✅ Resume: ${this.data.resume.name}
                    <br>
                    <small>Uploaded on ${new Date(this.data.resume.uploadDate).toLocaleDateString()}</small>
                    <br>
                    <button onclick="app.downloadResume()" class="btn-secondary" style="margin-top: 0.5rem;">
                        Download Resume
                    </button>
                </div>
            `;
        }
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        const savedData = localStorage.getItem('freelanceOS_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.data, ...parsed };
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        
        // Load initial data for demos
        this.loadInitialData();
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            localStorage.setItem('freelanceOS_data', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    /**
     * Load initial demo data
     */
    loadInitialData() {
        // Only load if no data exists
        if (this.data.tasks.length === 0 && this.data.projects.length === 0) {
            // Add sample tasks
            this.data.tasks = [
                {
                    id: Date.now() - 1000,
                    text: "Complete client website design",
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() - 2000,
                    text: "Send invoice to ABC Corp",
                    completed: true,
                    createdAt: new Date().toISOString()
                }
            ];

            // Add sample project
            this.data.projects = [
                {
                    id: Date.now() - 3000,
                    title: "E-commerce Website",
                    description: "Built a modern e-commerce platform with shopping cart, payment integration, and admin dashboard.",
                    link: "https://example.com",
                    technologies: ["HTML", "CSS", "JavaScript", "Node.js"],
                    date: new Date().toISOString()
                }
            ];

            this.saveData();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Create global app instance
    window.app = new FreelanceOS();
});

// Update todo status
const todo1 = document.querySelector('[data-todo-id="1"]');
if (todo1) {
    todo1.setAttribute('data-status', 'completed');
}