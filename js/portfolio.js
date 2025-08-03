/* Portfolio & Resume */
(() => {
  // Resume
  const input = document.getElementById('resumeInput');
  if (input) {
    const statusP = document.getElementById('resumeStatus');
    const dl = document.getElementById('resumeDownload');
    const key = 'resumePDF';

    const load = () => {
      const data = localStorage.getItem(key);
      if (data) {
        statusP.textContent = 'Resume uploaded';
        dl.href = data;
        dl.style.display = 'inline-block';
      }
    };

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(key, reader.result);
        load();
      };
      reader.readAsDataURL(file);
    });
    load();
  }

  // Projects
  const form = document.getElementById('projectForm');
  if (form) {
    const list = document.getElementById('projectList');
    const key = 'projects';

    const render = () => {
      list.innerHTML = '';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p>${p.link ? `<a href='${p.link}' target='_blank'>View</a>`:''}`;
        const del = document.createElement('button');
        del.textContent = 'Delete';
        del.addEventListener('click', () => { arr.splice(idx,1); save(arr); });
        card.appendChild(del);
        list.appendChild(card);
      });
    };
    const save = arr => { localStorage.setItem(key, JSON.stringify(arr)); render(); };

    form.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('projectTitle').value.trim();
      const desc = document.getElementById('projectDesc').value.trim();
      const link = document.getElementById('projectLink').value.trim();
      if (!title || !desc) return;
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push({ title, desc, link });
      save(arr);
      form.reset();
    });
    render();
  }
})();