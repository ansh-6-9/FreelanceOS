/* Digital Notepad */
(() => {
  const area = document.getElementById('notepadArea');
  if (!area) return;
  const saveBtn = document.getElementById('saveNote');
  const exportBtn = document.getElementById('exportNote');
  const key = 'notepadContent';

  // Load existing
  area.value = localStorage.getItem(key) || '';

  saveBtn.addEventListener('click', () => {
    localStorage.setItem(key, area.value);
    alert('Note saved!');
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([area.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
})();