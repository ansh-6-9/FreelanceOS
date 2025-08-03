// Portfolio Module for FreelanceOS

class Portfolio {
    constructor() {
        this.uploadResumeButton = document.getElementById('upload-resume');
        this.downloadResumeButton = document.getElementById('download-resume');
        this.resumeUploadInput = document.getElementById('resume-upload');
        this.resumeStatus = document.getElementById('resume-status');
        this.addProjectButton = document.getElementById('add-project');
        this.projectsContainer = document.getElementById('projects-container');
        this.projectModal = document.getElementById('project-modal');
        this.projectForm = document.getElementById('project-form');
        this.projectModalTitle = document.getElementById('project-modal-title');
        
        this.projects = [];
        this.currentProjectId = null;
        this.resumeFile = null;
        
        this.init();
    }

    init() {
        this.loadProjects();
        this.bindEvents();
        this.renderProjects();
        this.checkResumeStatus();
    }

    bindEvents() {
        this.uploadResumeButton.addEventListener('click', () => this.resumeUploadInput.click());
        this.downloadResumeButton.addEventListener('click', () => this.downloadResume());
        this.resumeUploadInput.addEventListener('change', (e) => this.handleResumeUpload(e));
        this.addProjectButton.addEventListener('click', () => this.showProjectModal());
        
        // Project modal events
        this.projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('cancel-project').addEventListener('click', () => this.hideProjectModal());
        
        // Close modal on outside click
        this.projectModal.addEventListener('click', (e) => {
            if (e.target === this.projectModal) {
                this.hideProjectModal();
            }
        });
    }

    handleResumeUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            this.showMessage('Please select a PDF file', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showMessage('File size must be less than 10MB', 'error');
            return;
        }
        
        this.resumeFile = file;
        this.saveResume();
        this.updateResumeStatus();
        this.showMessage('Resume uploaded successfully!', 'success');
    }

    saveResume() {
        if (!this.resumeFile) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const resumeData = {
                name: this.resumeFile.name,
                size: this.resumeFile.size,
                type: this.resumeFile.type,
                data: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            
            Storage.save('freelanceos_resume', resumeData);
        };
        reader.readAsDataURL(this.resumeFile);
    }

    downloadResume() {
        const resumeData = Storage.load('freelanceos_resume', null);
        
        if (!resumeData) {
            this.showMessage('No resume available for download', 'error');
            return;
        }
        
        // Convert base64 to blob
        const byteCharacters = atob(resumeData.data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resumeData.name;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Resume downloaded successfully!', 'success');
    }

    checkResumeStatus() {
        const resumeData = Storage.load('freelanceos_resume', null);
        
        if (resumeData) {
            this.resumeStatus.textContent = `Resume uploaded: ${resumeData.name} (${Format.fileSize(resumeData.size)})`;
            this.downloadResumeButton.disabled = false;
        } else {
            this.resumeStatus.textContent = 'No resume uploaded';
            this.downloadResumeButton.disabled = true;
        }
    }

    updateResumeStatus() {
        this.checkResumeStatus();
    }

    showProjectModal(projectId = null) {
        this.currentProjectId = projectId;
        
        if (projectId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                this.projectModalTitle.textContent = 'Edit Project';
                this.populateProjectForm(project);
            }
        } else {
            this.projectModalTitle.textContent = 'Add New Project';
            this.clearProjectForm();
        }
        
        this.projectModal.classList.add('active');
    }

    hideProjectModal() {
        this.projectModal.classList.remove('active');
        this.currentProjectId = null;
        this.clearProjectForm();
    }

    populateProjectForm(project) {
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-link').value = project.link || '';
        document.getElementById('project-image').value = project.image || '';
    }

    clearProjectForm() {
        document.getElementById('project-title').value = '';
        document.getElementById('project-description').value = '';
        document.getElementById('project-link').value = '';
        document.getElementById('project-image').value = '';
    }

    handleProjectSubmit(event) {
        event.preventDefault();
        
        const title = document.getElementById('project-title').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const link = document.getElementById('project-link').value.trim();
        const image = document.getElementById('project-image').value.trim();
        
        if (!title || !description) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (this.currentProjectId) {
            this.updateProject(this.currentProjectId, { title, description, link, image });
        } else {
            this.addProject({ title, description, link, image });
        }
        
        this.hideProjectModal();
    }

    addProject(projectData) {
        const project = {
            id: Date.now(),
            ...projectData,
            createdAt: new Date().toISOString()
        };
        
        this.projects.unshift(project);
        this.saveProjects();
        this.renderProjects();
        
        this.showMessage('Project added successfully!', 'success');
    }

    updateProject(projectId, projectData) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        
        if (projectIndex !== -1) {
            this.projects[projectIndex] = {
                ...this.projects[projectIndex],
                ...projectData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveProjects();
            this.renderProjects();
            
            this.showMessage('Project updated successfully!', 'success');
        }
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
            
            this.showMessage('Project deleted successfully!', 'success');
        }
    }

    renderProjects() {
        this.projectsContainer.innerHTML = '';
        
        if (this.projects.length === 0) {
            this.projectsContainer.innerHTML = `
                <div class="no-projects">
                    <p>No projects yet. Click "Add New Project" to showcase your work!</p>
                </div>
            `;
            return;
        }
        
        this.projects.forEach(project => {
            const projectElement = this.createProjectElement(project);
            this.projectsContainer.appendChild(projectElement);
        });
    }

    createProjectElement(project) {
        const projectEl = DOM.createElement('div', {
            className: 'project-card'
        });
        
        projectEl.innerHTML = `
            <div class="project-header">
                <h4 class="project-title">${this.escapeHtml(project.title)}</h4>
                <div class="project-actions">
                    <button class="project-edit" title="Edit project">✏️</button>
                    <button class="project-delete" title="Delete project">🗑️</button>
                </div>
            </div>
            ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.style.display='none'">` : ''}
            <p class="project-description">${this.escapeHtml(project.description)}</p>
            ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">🔗 View Project</a>` : ''}
        `;
        
        // Add event listeners
        const editBtn = projectEl.querySelector('.project-edit');
        const deleteBtn = projectEl.querySelector('.project-delete');
        
        editBtn.addEventListener('click', () => this.showProjectModal(project.id));
        deleteBtn.addEventListener('click', () => this.deleteProject(project.id));
        
        return projectEl;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadProjects() {
        this.projects = Storage.load('freelanceos_projects', this.getDefaultProjects());
    }

    saveProjects() {
        Storage.save('freelanceos_projects', this.projects);
    }

    getDefaultProjects() {
        return [
            {
                id: 1,
                title: 'FreelanceOS Web App',
                description: 'A comprehensive web application built with HTML, CSS, and JavaScript for freelancers to manage their workflow, including productivity tools, financial tracking, and portfolio management.',
                link: '',
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'E-commerce Platform',
                description: 'A modern e-commerce platform with responsive design, payment integration, and inventory management system.',
                link: '',
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Task Management App',
                description: 'A collaborative task management application with real-time updates, team collaboration, and progress tracking features.',
                link: '',
                image: '',
                createdAt: new Date().toISOString()
            }
        ];
    }

    showMessage(message, type = 'info') {
        const messageEl = DOM.createElement('div', {
            className: `portfolio-message portfolio-message-${type}`,
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

    // Get portfolio statistics
    getPortfolioStats() {
        const totalProjects = this.projects.length;
        const projectsWithLinks = this.projects.filter(p => p.link).length;
        const projectsWithImages = this.projects.filter(p => p.image).length;
        
        return {
            totalProjects,
            projectsWithLinks,
            projectsWithImages,
            hasResume: !!Storage.load('freelanceos_resume', null)
        };
    }

    // Export portfolio data
    exportPortfolio() {
        const portfolioData = {
            exportDate: new Date().toISOString(),
            totalProjects: this.projects.length,
            projects: this.projects.map(project => ({
                title: project.title,
                description: project.description,
                link: project.link,
                image: project.image,
                createdAt: project.createdAt
            })),
            resume: Storage.load('freelanceos_resume', null)
        };
        
        const dataStr = JSON.stringify(portfolioData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `freelanceos-portfolio-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Portfolio data exported successfully!', 'success');
    }

    // Validate project link
    validateProjectLink(link) {
        if (!link) return true; // Empty links are allowed
        
        try {
            new URL(link);
            return true;
        } catch {
            return false;
        }
    }

    // Validate project image URL
    validateProjectImage(imageUrl) {
        if (!imageUrl) return true; // Empty image URLs are allowed
        
        try {
            new URL(imageUrl);
            return true;
        } catch {
            return false;
        }
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new Portfolio();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (window.portfolio) {
        // Escape to close modal
        if (e.key === 'Escape' && window.portfolio.projectModal.classList.contains('active')) {
            e.preventDefault();
            window.portfolio.hideProjectModal();
        }
    }
});