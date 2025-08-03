/* FreelanceOS – common utilities */
(() => {
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    // Splash fade out
    const splash = qs('#splash');
    if (splash) setTimeout(() => splash.classList.add('hide'), 1200);

    // Footer year
    const yr = qs('#year');
    if (yr) yr.textContent = new Date().getFullYear();

    // Time & date update (Dashboard)
    const timeEl = qs('#time-date');
    if (timeEl) {
      const updateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const dateStr = now.toLocaleDateString(undefined, options);
        const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        timeEl.textContent = `${dateStr} · ${timeStr}`;
      };
      updateTime();
      setInterval(updateTime, 60000);
    }

    // Quote
    const quoteEl = qs('#quote');
    if (quoteEl) {
      fetch('https://type.fit/api/quotes').then(r => r.json()).then(arr => {
        const q = arr[Math.floor(Math.random()*arr.length)];
        quoteEl.textContent = q.text + (q.author ? ` — ${q.author}` : '');
      }).catch(() => {
        const staticQuotes = [
          'Keep pushing forward.',
          'Small steps every day.',
          'Dream big. Work hard.',
          'Create. Innovate. Elevate.'
        ];
        quoteEl.textContent = staticQuotes[Math.floor(Math.random()*staticQuotes.length)];
      });
    }

    // Dark mode toggle
    const darkBtn = qs('#darkToggle');
    const setThemeClass = () => {
      if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        if (darkBtn) darkBtn.textContent = '☀️';
      } else {
        document.body.classList.remove('dark');
        if (darkBtn) darkBtn.textContent = '🌙';
      }
    };
    setThemeClass();
    if (darkBtn) {
      darkBtn.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        setThemeClass();
      });
    }

    // Optional simple passcode auth
    const passcode = localStorage.getItem('passcode');
    if (passcode) {
      let entered = prompt('Enter your FreelanceOS passcode');
      if (entered !== passcode) {
        alert('Incorrect passcode. Reload to try again.');
        document.body.innerHTML = '<h2 style="text-align:center;margin-top:2rem;">Access Denied</h2>';
        return;
      }
    } else if (confirm('Would you like to set a passcode for FreelanceOS?')) {
      const newPass = prompt('Set a passcode (numbers or letters)');
      if (newPass) localStorage.setItem('passcode', newPass);
    }
  });
})();