# FreelanceOS - Complete Freelance Workspace

A comprehensive, responsive web application designed for freelancers and solo creators to manage their entire workflow. Built with vanilla HTML, CSS, and JavaScript - no frameworks required.

## 🌟 Features

### 📊 Dashboard
- **Welcome Greeting**: Dynamic greeting based on time of day
- **Real-time Clock**: Current date and time display
- **Motivational Quotes**: Fetched from API with fallback to local quotes
- **Quick Actions**: Direct links to all major features

### ⚡ Productivity Tools
- **Pomodoro Timer**: 
  - Customizable work/break intervals
  - Session logging and statistics
  - Desktop notifications
  - Keyboard shortcuts (Space to start/pause, R to reset)
- **Task Planner**: 
  - Add, edit, delete, and mark tasks complete
  - Export tasks to JSON
  - Clear completed tasks
  - Persistent storage
- **Sticky Notes**: 
  - Draggable, editable notes
  - Color customization (6 colors)
  - Auto-save functionality
  - Touch-friendly for mobile
- **Digital Notepad**: 
  - Rich text editor
  - Auto-save every 30 seconds
  - Export to TXT format
  - Clear all content option

### 💰 Financial Management
- **Earnings Calculator**: 
  - Calculate gross and net earnings
  - Track client projects
  - Save calculations to income tracker
- **Income Tracker**: 
  - Monthly income visualization
  - Historical data charts
  - Recent entries list
- **Expense Tracker**: 
  - Categorize expenses (Business, Personal, Equipment, Software, Other)
  - Visual expense breakdown
  - Monthly expense trends

### 📁 Portfolio Management
- **Resume Upload**: 
  - PDF upload and storage
  - Download functionality
  - File size validation
- **Project Showcase**: 
  - Add/edit/delete projects
  - Optional project links and images
  - Default sample projects included

### 🎨 Design & UX
- **Light/Dark Mode**: Toggle between themes
- **Fully Responsive**: Works on mobile, tablet, and desktop
- **Modern UI**: Clean, professional design
- **Smooth Animations**: Subtle transitions and effects
- **Keyboard Shortcuts**: Power user features

### 🔐 Security & Data
- **Local Authentication**: Simple passcode protection (default: 1234)
- **Local Storage**: All data stored in browser
- **Data Export**: Backup all data to JSON
- **No External Dependencies**: Works offline

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required

### Installation
1. Download or clone the repository
2. Open `index.html` in your web browser
3. Enter the default passcode: `1234`
4. Start using FreelanceOS!

### File Structure
```
freelanceos/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Base styles and variables
│   ├── components.css     # Component-specific styles
│   └── responsive.css     # Responsive design
├── js/
│   ├── utils.js           # Utility functions
│   ├── auth.js            # Authentication
│   ├── theme.js           # Theme management
│   ├── dashboard.js       # Dashboard functionality
│   ├── pomodoro.js        # Pomodoro timer
│   ├── tasks.js           # Task planner
│   ├── notes.js           # Sticky notes
│   ├── notepad.js         # Digital notepad
│   ├── earnings.js        # Earnings calculator
│   ├── expenses.js        # Expense tracker
│   ├── portfolio.js       # Portfolio management
│   ├── navigation.js      # Navigation system
│   └── app.js             # Main app controller
├── assets/
│   └── favicon.ico        # App icon
└── README.md              # This file
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Navigate to Dashboard |
| `Ctrl+2` | Navigate to Productivity |
| `Ctrl+3` | Navigate to Finances |
| `Ctrl+4` | Navigate to Portfolio |
| `Space` | Start/Pause Pomodoro Timer |
| `R` | Reset Pomodoro Timer |
| `Ctrl+S` | Save notepad content |
| `Ctrl+E` | Export notepad content |
| `Ctrl+N` | Add new sticky note |
| `Ctrl+Enter` | Add task or expense |
| `Ctrl+Shift+E` | Export all data |
| `Ctrl+Shift+C` | Clear all data |
| `F1` | Show help |

## 📱 Responsive Design

FreelanceOS is fully responsive and optimized for:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎯 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔧 Customization

### Changing the Default Passcode
1. Open browser developer tools (F12)
2. In the console, run: `localStorage.setItem('freelanceos_passcode', 'your-new-passcode')`
3. Refresh the page

### Adding Custom Quotes
Edit the `quotes` array in `js/dashboard.js` to add your own motivational quotes.

### Modifying Colors
Update CSS variables in `styles/main.css` to customize the color scheme.

## 📊 Data Management

### Exporting Data
- **Individual exports**: Each module has its own export function
- **Complete backup**: Use `Ctrl+Shift+E` to export all data
- **Format**: JSON files for easy import/backup

### Importing Data
- Use the import functions in each module
- Or restore from a complete backup file

### Clearing Data
- **Module-specific**: Clear data within each module
- **Complete reset**: Use `Ctrl+Shift+C` to clear all data

## 🛠️ Development

### Adding New Features
1. Create new JavaScript module in `js/` directory
2. Add corresponding HTML structure
3. Include CSS styles in appropriate files
4. Register module in `js/app.js`

### Code Structure
- **Modular Design**: Each feature is a separate module
- **Event-Driven**: Uses custom events for communication
- **Local Storage**: All data persisted in browser
- **No Dependencies**: Pure vanilla JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Fonts**: Inter font family
- **Quotable API**: Motivational quotes
- **CSS Grid & Flexbox**: Modern layout techniques
- **Local Storage API**: Data persistence

## 📞 Support

For issues, questions, or feature requests:
1. Check the help section (F1)
2. Review browser console for errors
3. Ensure browser supports required APIs
4. Try clearing browser cache

---

**FreelanceOS** - Your complete freelance workspace, built for productivity and simplicity.