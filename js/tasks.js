// Task Planner Module for FreelanceOS

class TaskPlanner {
    constructor() {
        this.taskInput = document.getElementById('task-input');
        this.addTaskButton = document.getElementById('add-task');
        this.tasksList = document.getElementById('tasks-list');
        this.exportTasksButton = document.getElementById('export-tasks');
        this.clearCompletedButton = document.getElementById('clear-completed');
        
        this.tasks = [];
        this.editingTaskId = null;
        
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
    }

    bindEvents() {
        this.addTaskButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        this.exportTasksButton.addEventListener('click', () => this.exportTasks());
        this.clearCompletedButton.addEventListener('click', () => this.clearCompleted());
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showMessage('Please enter a task description', 'error');
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskText);
        } else {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            
            this.tasks.unshift(task);
            this.saveTasks();
            this.renderTasks();
            this.taskInput.value = '';
            
            this.showMessage('Task added successfully!', 'success');
        }
    }

    updateTask(taskId, newText) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = newText;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            
            this.saveTasks();
            this.renderTasks();
            this.taskInput.value = '';
            this.editingTaskId = null;
            this.addTaskButton.textContent = 'Add';
            
            this.showMessage('Task updated successfully!', 'success');
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            this.taskInput.value = task.text;
            this.taskInput.focus();
            this.editingTaskId = taskId;
            this.addTaskButton.textContent = 'Update';
            
            // Scroll to input
            this.taskInput.scrollIntoView({ behavior: 'smooth' });
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            
            this.showMessage('Task deleted successfully!', 'success');
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showMessage('No completed tasks to clear', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            
            this.showMessage(`${completedCount} completed task(s) cleared!`, 'success');
        }
    }

    renderTasks() {
        this.tasksList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            this.tasksList.innerHTML = '<li class="no-tasks">No tasks yet. Add one above!</li>';
            return;
        }
        
        this.tasks.forEach(task => {
            const li = DOM.createElement('li', {
                className: `task-item ${task.completed ? 'completed' : ''}`
            });
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-edit" title="Edit task">✏️</button>
                    <button class="task-delete" title="Delete task">🗑️</button>
                </div>
            `;
            
            // Add event listeners
            const checkbox = li.querySelector('.task-checkbox');
            const editBtn = li.querySelector('.task-edit');
            const deleteBtn = li.querySelector('.task-delete');
            
            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            editBtn.addEventListener('click', () => this.editTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.tasksList.appendChild(li);
        });
        
        this.updateTaskStats();
    }

    updateTaskStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        // Update any stats display if needed
        const statsElement = document.querySelector('.task-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span>Total: ${totalTasks}</span>
                <span>Completed: ${completedTasks}</span>
                <span>Pending: ${pendingTasks}</span>
            `;
        }
    }

    exportTasks() {
        const tasksData = {
            exportDate: new Date().toISOString(),
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(t => t.completed).length,
            pendingTasks: this.tasks.filter(t => !t.completed).length,
            tasks: this.tasks.map(task => ({
                text: task.text,
                completed: task.completed,
                createdAt: task.createdAt,
                completedAt: task.completedAt
            }))
        };
        
        const dataStr = JSON.stringify(tasksData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Tasks exported successfully!', 'success');
    }

    loadTasks() {
        this.tasks = Storage.load('freelanceos_tasks', []);
    }

    saveTasks() {
        Storage.save('freelanceos_tasks', this.tasks);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `task-message task-message-${type}`,
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

    // Get task statistics
    getTaskStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            completionRate: Math.round(completionRate)
        };
    }

    // Search tasks
    searchTasks(query) {
        if (!query) {
            this.renderTasks();
            return;
        }
        
        const filteredTasks = this.tasks.filter(task => 
            task.text.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredTasks(filteredTasks);
    }

    renderFilteredTasks(filteredTasks) {
        this.tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = '<li class="no-tasks">No tasks found matching your search.</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = DOM.createElement('li', {
                className: `task-item ${task.completed ? 'completed' : ''}`
            });
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-edit" title="Edit task">✏️</button>
                    <button class="task-delete" title="Delete task">🗑️</button>
                </div>
            `;
            
            // Add event listeners
            const checkbox = li.querySelector('.task-checkbox');
            const editBtn = li.querySelector('.task-edit');
            const deleteBtn = li.querySelector('.task-delete');
            
            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            editBtn.addEventListener('click', () => this.editTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.tasksList.appendChild(li);
        });
    }
}

// Initialize task planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskPlanner = new TaskPlanner();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.taskPlanner) {
        // Ctrl+Enter to add task
        if (e.ctrlKey && e.key === 'Enter' && e.target === window.taskPlanner.taskInput) {
            e.preventDefault();
            window.taskPlanner.addTask();
        }
        
        // Escape to cancel editing
        if (e.key === 'Escape' && window.taskPlanner.editingTaskId) {
            window.taskPlanner.taskInput.value = '';
            window.taskPlanner.editingTaskId = null;
            window.taskPlanner.addTaskButton.textContent = 'Add';
        }
    }
});