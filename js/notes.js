// Sticky Notes Module for FreelanceOS

class StickyNotes {
    constructor() {
        this.notesContainer = document.getElementById('notes-container');
        this.addNoteButton = document.getElementById('add-note');
        this.notes = [];
        this.draggedNote = null;
        this.offset = { x: 0, y: 0 };
        
        this.colors = [
            { name: 'yellow', bg: '#fef3c7', border: '#f59e0b' },
            { name: 'green', bg: '#dcfce7', border: '#16a34a' },
            { name: 'blue', bg: '#dbeafe', border: '#2563eb' },
            { name: 'pink', bg: '#fce7f3', border: '#db2777' },
            { name: 'purple', bg: '#f3e8ff', border: '#9333ea' },
            { name: 'orange', bg: '#fed7aa', border: '#ea580c' }
        ];
        
        this.init();
    }

    init() {
        this.loadNotes();
        this.bindEvents();
        this.renderNotes();
    }

    bindEvents() {
        this.addNoteButton.addEventListener('click', () => this.addNote());
        
        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        // Touch events for mobile
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', () => this.onTouchEnd());
    }

    addNote() {
        const note = {
            id: Date.now(),
            content: '',
            color: 'yellow',
            position: { x: 20, y: 20 },
            createdAt: new Date().toISOString()
        };
        
        this.notes.push(note);
        this.saveNotes();
        this.renderNotes();
        
        // Focus on the new note
        setTimeout(() => {
            const newNoteElement = document.querySelector(`[data-note-id="${note.id}"]`);
            if (newNoteElement) {
                const textarea = newNoteElement.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                }
            }
        }, 100);
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
        }
    }

    updateNoteContent(noteId, content) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.content = content;
            note.updatedAt = new Date().toISOString();
            this.saveNotes();
        }
    }

    changeNoteColor(noteId, color) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.color = color;
            this.saveNotes();
            this.renderNotes();
        }
    }

    renderNotes() {
        this.notesContainer.innerHTML = '';
        
        if (this.notes.length === 0) {
            this.notesContainer.innerHTML = '<p class="no-notes">No notes yet. Click "Add Note" to create one!</p>';
            return;
        }
        
        this.notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesContainer.appendChild(noteElement);
        });
    }

    createNoteElement(note) {
        const noteEl = DOM.createElement('div', {
            className: 'sticky-note',
            'data-note-id': note.id
        });
        
        const colorConfig = this.colors.find(c => c.name === note.color) || this.colors[0];
        
        noteEl.style.cssText = `
            background-color: ${colorConfig.bg};
            border: 1px solid ${colorConfig.border};
            left: ${note.position.x}px;
            top: ${note.position.y}px;
        `;
        
        noteEl.innerHTML = `
            <div class="note-header">
                <div class="note-colors">
                    ${this.colors.map(color => `
                        <div class="note-color ${color.name === note.color ? 'active' : ''}" 
                             data-color="${color.name}" 
                             style="background-color: ${color.bg}; border: 2px solid ${color.border};">
                        </div>
                    `).join('')}
                </div>
                <button class="note-delete" title="Delete note">×</button>
            </div>
            <textarea placeholder="Write your note here..." class="note-content">${note.content}</textarea>
        `;
        
        // Add event listeners
        const textarea = noteEl.querySelector('.note-content');
        const deleteBtn = noteEl.querySelector('.note-delete');
        const colorBtns = noteEl.querySelectorAll('.note-color');
        
        // Content update
        textarea.addEventListener('input', (e) => {
            this.updateNoteContent(note.id, e.target.value);
        });
        
        // Delete note
        deleteBtn.addEventListener('click', () => this.deleteNote(note.id));
        
        // Color change
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.getAttribute('data-color');
                this.changeNoteColor(note.id, color);
            });
        });
        
        // Drag functionality
        this.addDragListeners(noteEl, note);
        
        return noteEl;
    }

    addDragListeners(noteElement, note) {
        const header = noteElement.querySelector('.note-header');
        
        // Mouse events
        header.addEventListener('mousedown', (e) => this.onMouseDown(e, noteElement, note));
        
        // Touch events for mobile
        header.addEventListener('touchstart', (e) => this.onTouchStart(e, noteElement, note));
        
        // Prevent text selection while dragging
        header.addEventListener('selectstart', (e) => e.preventDefault());
    }

    onMouseDown(e, noteElement, note) {
        e.preventDefault();
        this.draggedNote = { element: noteElement, note: note };
        
        const rect = noteElement.getBoundingClientRect();
        this.offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        noteElement.style.zIndex = '1000';
        noteElement.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.draggedNote) return;
        
        e.preventDefault();
        
        const containerRect = this.notesContainer.getBoundingClientRect();
        const newX = e.clientX - containerRect.left - this.offset.x;
        const newY = e.clientY - containerRect.top - this.offset.y;
        
        // Constrain to container bounds
        const maxX = containerRect.width - this.draggedNote.element.offsetWidth;
        const maxY = containerRect.height - this.draggedNote.element.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        this.draggedNote.element.style.left = `${constrainedX}px`;
        this.draggedNote.element.style.top = `${constrainedY}px`;
    }

    onMouseUp() {
        if (!this.draggedNote) return;
        
        // Update note position
        const rect = this.draggedNote.element.getBoundingClientRect();
        const containerRect = this.notesContainer.getBoundingClientRect();
        
        this.draggedNote.note.position = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
        };
        
        this.saveNotes();
        
        this.draggedNote.element.style.zIndex = '';
        this.draggedNote.element.style.cursor = '';
        this.draggedNote = null;
    }

    onTouchStart(e, noteElement, note) {
        e.preventDefault();
        const touch = e.touches[0];
        this.draggedNote = { element: noteElement, note: note };
        
        const rect = noteElement.getBoundingClientRect();
        this.offset = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        noteElement.style.zIndex = '1000';
    }

    onTouchMove(e) {
        if (!this.draggedNote) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        const containerRect = this.notesContainer.getBoundingClientRect();
        const newX = touch.clientX - containerRect.left - this.offset.x;
        const newY = touch.clientY - containerRect.top - this.offset.y;
        
        // Constrain to container bounds
        const maxX = containerRect.width - this.draggedNote.element.offsetWidth;
        const maxY = containerRect.height - this.draggedNote.element.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        this.draggedNote.element.style.left = `${constrainedX}px`;
        this.draggedNote.element.style.top = `${constrainedY}px`;
    }

    onTouchEnd() {
        if (!this.draggedNote) return;
        
        // Update note position
        const rect = this.draggedNote.element.getBoundingClientRect();
        const containerRect = this.notesContainer.getBoundingClientRect();
        
        this.draggedNote.note.position = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
        };
        
        this.saveNotes();
        
        this.draggedNote.element.style.zIndex = '';
        this.draggedNote = null;
    }

    loadNotes() {
        this.notes = Storage.load('freelanceos_notes', []);
    }

    saveNotes() {
        Storage.save('freelanceos_notes', this.notes);
    }

    // Export notes
    exportNotes() {
        const notesData = {
            exportDate: new Date().toISOString(),
            totalNotes: this.notes.length,
            notes: this.notes.map(note => ({
                content: note.content,
                color: note.color,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }))
        };
        
        const dataStr = JSON.stringify(notesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-notes-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Get note statistics
    getNoteStats() {
        const totalNotes = this.notes.length;
        const totalCharacters = this.notes.reduce((sum, note) => sum + note.content.length, 0);
        const averageLength = totalNotes > 0 ? Math.round(totalCharacters / totalNotes) : 0;
        
        return {
            totalNotes,
            totalCharacters,
            averageLength
        };
    }

    // Search notes
    searchNotes(query) {
        if (!query) {
            this.renderNotes();
            return;
        }
        
        const filteredNotes = this.notes.filter(note => 
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredNotes(filteredNotes);
    }

    renderFilteredNotes(filteredNotes) {
        this.notesContainer.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            this.notesContainer.innerHTML = '<p class="no-notes">No notes found matching your search.</p>';
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesContainer.appendChild(noteElement);
        });
    }
}

// Initialize sticky notes when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stickyNotes = new StickyNotes();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.stickyNotes) {
        // Ctrl+N to add new note
        if (e.ctrlKey && e.key === 'n' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            window.stickyNotes.addNote();
        }
    }
});