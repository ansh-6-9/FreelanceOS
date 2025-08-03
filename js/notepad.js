// Digital Notepad Module for FreelanceOS

class DigitalNotepad {
    constructor() {
        this.notepadContent = document.getElementById('notepad-content');
        this.saveButton = document.getElementById('save-notepad');
        this.exportButton = document.getElementById('export-notepad');
        this.clearButton = document.getElementById('clear-notepad');
        
        this.content = '';
        this.lastSaved = null;
        this.autoSaveInterval = null;
        
        this.init();
    }

    init() {
        this.loadContent();
        this.bindEvents();
        this.startAutoSave();
    }

    bindEvents() {
        this.saveButton.addEventListener('click', () => this.saveContent());
        this.exportButton.addEventListener('click', () => this.exportContent());
        this.clearButton.addEventListener('click', () => this.clearContent());
        
        // Auto-save on input
        this.notepadContent.addEventListener('input', () => {
            this.content = this.notepadContent.value;
            this.updateLastSaved();
        });
        
        // Keyboard shortcuts
        this.notepadContent.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveContent();
            }
            
            // Ctrl+E to export
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportContent();
            }
            
            // Ctrl+L to clear
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearContent();
            }
        });
    }

    saveContent() {
        this.content = this.notepadContent.value;
        Storage.save('freelanceos_notepad_content', this.content);
        this.lastSaved = new Date();
        this.updateLastSaved();
        this.showMessage('Content saved successfully!', 'success');
    }

    exportContent() {
        const content = this.notepadContent.value;
        
        if (!content.trim()) {
            this.showMessage('No content to export', 'error');
            return;
        }
        
        // Create text file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `freelanceos-notepad-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.showMessage('Content exported successfully!', 'success');
    }

    exportAsPDF() {
        const content = this.notepadContent.value;
        
        if (!content.trim()) {
            this.showMessage('No content to export', 'error');
            return;
        }
        
        // Simple PDF generation using jsPDF (if available)
        if (typeof window.jsPDF !== 'undefined') {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            const lines = doc.splitTextToSize(content, 180);
            doc.text(lines, 15, 15);
            
            doc.save(`freelanceos-notepad-${new Date().toISOString().split('T')[0]}.pdf`);
            this.showMessage('PDF exported successfully!', 'success');
        } else {
            // Fallback to text export
            this.exportContent();
        }
    }

    clearContent() {
        if (this.notepadContent.value.trim()) {
            if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
                this.notepadContent.value = '';
                this.content = '';
                this.saveContent();
                this.showMessage('Content cleared successfully!', 'success');
            }
        } else {
            this.showMessage('No content to clear', 'info');
        }
    }

    loadContent() {
        this.content = Storage.load('freelanceos_notepad_content', '');
        this.notepadContent.value = this.content;
        this.lastSaved = Storage.load('freelanceos_notepad_last_saved', null);
        this.updateLastSaved();
    }

    updateLastSaved() {
        const lastSavedElement = document.querySelector('.notepad-last-saved');
        if (lastSavedElement) {
            if (this.lastSaved) {
                const timeAgo = this.getTimeAgo(this.lastSaved);
                lastSavedElement.textContent = `Last saved: ${timeAgo}`;
            } else {
                lastSavedElement.textContent = 'Not saved yet';
            }
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days} day(s) ago`;
        if (hours > 0) return `${hours} hour(s) ago`;
        if (minutes > 0) return `${minutes} minute(s) ago`;
        return 'Just now';
    }

    startAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.content !== this.notepadContent.value) {
                this.saveContent();
            }
        }, 30000);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `notepad-message notepad-message-${type}`,
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

    // Get notepad statistics
    getNotepadStats() {
        const content = this.notepadContent.value;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const characters = content.length;
        const charactersNoSpaces = content.replace(/\s/g, '').length;
        const lines = content.split('\n').length;
        
        return {
            words,
            characters,
            charactersNoSpaces,
            lines,
            lastSaved: this.lastSaved
        };
    }

    // Search in notepad
    searchInNotepad(query) {
        if (!query) return;
        
        const content = this.notepadContent.value;
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        
        if (index !== -1) {
            // Highlight the found text
            this.notepadContent.focus();
            this.notepadContent.setSelectionRange(index, index + query.length);
            
            // Scroll to the found text
            const textBeforeMatch = content.substring(0, index);
            const linesBeforeMatch = textBeforeMatch.split('\n').length - 1;
            const lineHeight = 20; // Approximate line height
            this.notepadContent.scrollTop = linesBeforeMatch * lineHeight;
            
            this.showMessage(`Found "${query}" at position ${index}`, 'success');
        } else {
            this.showMessage(`No matches found for "${query}"`, 'error');
        }
    }

    // Format text (basic formatting)
    formatText(command) {
        const textarea = this.notepadContent;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let replacement = '';
        
        switch (command) {
            case 'bold':
                replacement = `**${selectedText}**`;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                break;
            case 'underline':
                replacement = `__${selectedText}__`;
                break;
            case 'code':
                replacement = `\`${selectedText}\``;
                break;
            case 'list':
                replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
                break;
            case 'numbered':
                replacement = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
                break;
            case 'quote':
                replacement = selectedText.split('\n').map(line => `> ${line}`).join('\n');
                break;
        }
        
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
        
        this.content = textarea.value;
        this.saveContent();
    }

    // Insert template
    insertTemplate(templateName) {
        const templates = {
            'meeting': `Meeting Notes
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Attendees: 
Agenda:
- 
- 
- 
Action Items:
- 
- 
- 
Next Meeting: `,
            
            'project': `Project Notes
Project: 
Start Date: ${new Date().toLocaleDateString()}
Description: 
Tasks:
- [ ] 
- [ ] 
- [ ] 
Notes:
`,
            
            'daily': `Daily Log - ${new Date().toLocaleDateString()}
Goals for today:
- 
- 
- 
Completed:
- 
- 
- 
Notes:
`,
            
            'ideas': `Ideas & Brainstorming
Date: ${new Date().toLocaleDateString()}
Topic: 
Ideas:
- 
- 
- 
Next Steps:
`
        };
        
        const template = templates[templateName];
        if (template) {
            const currentContent = this.notepadContent.value;
            const newContent = currentContent + (currentContent ? '\n\n' : '') + template;
            this.notepadContent.value = newContent;
            this.content = newContent;
            this.saveContent();
            this.showMessage(`Template "${templateName}" inserted!`, 'success');
        }
    }
}

// Initialize digital notepad when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.digitalNotepad = new DigitalNotepad();
});

// Add global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.digitalNotepad) {
        // Ctrl+Shift+S to save
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            window.digitalNotepad.saveContent();
        }
        
        // Ctrl+Shift+E to export
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            window.digitalNotepad.exportContent();
        }
    }
});