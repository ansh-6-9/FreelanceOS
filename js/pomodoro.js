/* Pomodoro Timer */
(() => {
  const display = document.getElementById('timerDisplay');
  if (!display) return; // Only run on Productivity page.

  const startBtn = document.getElementById('startPomodoro');
  const stopBtn = document.getElementById('stopPomodoro');
  const resetBtn = document.getElementById('resetPomodoro');
  const logUl = document.getElementById('pomodoroLogs');

  let duration = 25 * 60; // 25 minutes default
  let remaining = duration;
  let intervalId = null;

  const logsKey = 'pomodoroLogs';

  const loadLogs = () => {
    const arr = JSON.parse(localStorage.getItem(logsKey) || '[]');
    arr.forEach(li => addLogItem(li));
  };

  const addLogItem = text => {
    const li = document.createElement('li');
    li.textContent = text;
    logUl.prepend(li);
  };

  const saveLog = text => {
    const arr = JSON.parse(localStorage.getItem(logsKey) || '[]');
    arr.unshift(text);
    localStorage.setItem(logsKey, JSON.stringify(arr.slice(0, 20))); // keep last 20
  };

  function updateDisplay() {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;
  }

  function tick() {
    if (remaining > 0) {
      remaining--;
      updateDisplay();
    } else {
      clearInterval(intervalId);
      intervalId = null;
      alert('Pomodoro complete!');
      const end = new Date().toLocaleTimeString();
      saveLog(`Session completed at ${end}`);
      addLogItem(`Session completed at ${end}`);
      remaining = duration;
      updateDisplay();
    }
  }

  startBtn.addEventListener('click', () => {
    if (intervalId) return; // already running
    intervalId = setInterval(tick, 1000);
  });
  stopBtn.addEventListener('click', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });
  resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    remaining = duration;
    updateDisplay();
  });

  // Init
  loadLogs();
  updateDisplay();
})();