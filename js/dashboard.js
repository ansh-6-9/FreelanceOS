// Dashboard Module for FreelanceOS

class Dashboard {
    constructor() {
        this.greetingElement = document.getElementById('greeting');
        this.datetimeElement = document.getElementById('datetime');
        this.quoteElement = document.getElementById('motivational-quote');
        this.quoteAuthorElement = document.getElementById('quote-author');
        this.quickLinks = document.querySelectorAll('.quick-link');
        
        this.quotes = [
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "Don't watch the clock; do what it does. Keep going.",
                author: "Sam Levenson"
            },
            {
                text: "The only limit to our realization of tomorrow is our doubts of today.",
                author: "Franklin D. Roosevelt"
            },
            {
                text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
                author: "Steve Jobs"
            },
            {
                text: "The best way to predict the future is to create it.",
                author: "Peter Drucker"
            },
            {
                text: "Success usually comes to those who are too busy to be looking for it.",
                author: "Henry David Thoreau"
            },
            {
                text: "The difference between ordinary and extraordinary is that little extra.",
                author: "Jimmy Johnson"
            },
            {
                text: "The only person you are destined to become is the person you decide to be.",
                author: "Ralph Waldo Emerson"
            }
        ];
        
        this.init();
    }

    init() {
        this.updateDateTime();
        this.updateGreeting();
        this.loadQuote();
        this.bindEvents();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    bindEvents() {
        // Quick link navigation
        this.quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });
    }

    updateDateTime() {
        const now = new Date();
        const dateString = DateTime.formatDate(now);
        const timeString = DateTime.formatTime(now);
        
        this.datetimeElement.textContent = `${dateString} at ${timeString}`;
    }

    updateGreeting() {
        const greeting = DateTime.getGreeting();
        this.greetingElement.textContent = greeting;
    }

    loadQuote() {
        // Try to load from API first, fallback to local quotes
        this.fetchQuoteFromAPI()
            .then(quote => {
                if (quote) {
                    this.displayQuote(quote.text, quote.author);
                } else {
                    this.displayRandomQuote();
                }
            })
            .catch(() => {
                this.displayRandomQuote();
            });
    }

    async fetchQuoteFromAPI() {
        try {
            const response = await fetch('https://api.quotable.io/random?tags=success|motivation|work');
            if (response.ok) {
                const data = await response.json();
                return {
                    text: data.content,
                    author: data.author
                };
            }
        } catch (error) {
            console.log('Could not fetch quote from API, using local quotes');
        }
        return null;
    }

    displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        this.displayQuote(quote.text, quote.author);
    }

    displayQuote(text, author) {
        this.quoteElement.textContent = text;
        this.quoteAuthorElement.textContent = `- ${author}`;
        
        // Add fade-in animation
        this.quoteElement.style.opacity = '0';
        this.quoteAuthorElement.style.opacity = '0';
        
        setTimeout(() => {
            this.quoteElement.style.transition = 'opacity 0.5s ease';
            this.quoteAuthorElement.style.transition = 'opacity 0.5s ease';
            this.quoteElement.style.opacity = '1';
            this.quoteAuthorElement.style.opacity = '1';
        }, 100);
    }

    navigateToSection(section) {
        // Remove active class from all sections
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to target section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Add active class to corresponding nav link
        const targetNavLink = document.querySelector(`[data-section="${section}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }
        
        // Smooth scroll to section
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Method to refresh dashboard data
    refresh() {
        this.updateDateTime();
        this.updateGreeting();
        this.loadQuote();
    }

    // Method to get current dashboard data
    getDashboardData() {
        return {
            greeting: this.greetingElement.textContent,
            datetime: this.datetimeElement.textContent,
            quote: this.quoteElement.textContent,
            author: this.quoteAuthorElement.textContent
        };
    }

    // Method to change quote manually
    changeQuote() {
        this.loadQuote();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Add quote refresh functionality
document.addEventListener('keydown', (e) => {
    // Press 'Q' key to refresh quote
    if (e.key === 'q' && e.ctrlKey) {
        e.preventDefault();
        if (window.dashboard) {
            window.dashboard.changeQuote();
        }
    }
});