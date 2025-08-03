/* Daily Task Planner */
(() => {
  const form = document.getElementById('taskForm');
  if (!form) return;
  const input = document.getElementById('taskInput');
  const list = document.getElementById('taskList');
  const key = 'dailyTasks';

  const render = () => {
    list.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem(key) || '[]');
    tasks.forEach(t => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = t.done;
      checkbox.addEventListener('change', () => { t.done = checkbox.checked; save(tasks); });

      const txt = document.createElement('input');
      txt.type = 'text';
      txt.value = t.text;
      txt.addEventListener('change', () => { t.text = txt.value; save(tasks); });

      const del = document.createElement('button');
      del.textContent = '✕';
      del.addEventListener('click', () => { tasks.splice(tasks.indexOf(t),1); save(tasks); });

      li.append(checkbox, txt, del);
      list.appendChild(li);
    });
  };

  const save = tasks => {
    localStorage.setItem(key, JSON.stringify(tasks));
    render();
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;
    const tasks = JSON.parse(localStorage.getItem(key) || '[]');
    tasks.push({ text: txt, done: false });
    save(tasks);
    input.value = '';
  });

  render();
})();