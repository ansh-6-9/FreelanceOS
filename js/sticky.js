/* Sticky Notes */
(() => {
  const btn = document.getElementById('addSticky');
  if (!btn) return;
  const container = document.getElementById('stickyContainer');
  const key = 'stickies';
  let notes = JSON.parse(localStorage.getItem(key) || '[]');

  const save = () => localStorage.setItem(key, JSON.stringify(notes));

  const createNoteEl = note => {
    const div = document.createElement('div');
    div.className = 'sticky';
    div.contentEditable = true;
    div.style.top = note.top + 'px';
    div.style.left = note.left + 'px';
    div.textContent = note.text;

    div.addEventListener('input', () => {
      note.text = div.textContent;
      save();
    });

    // Dragging
    let offsetX, offsetY;
    div.addEventListener('mousedown', e => {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      const move = ev => {
        note.left = ev.pageX - offsetX;
        note.top = ev.pageY - offsetY;
        div.style.left = note.left + 'px';
        div.style.top = note.top + 'px';
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', move);
        save();
      }, { once: true });
    });

    container.appendChild(div);
  };

  notes.forEach(createNoteEl);

  btn.addEventListener('click', () => {
    const note = { text: 'New note', top: 10, left: 10 };
    notes.push(note);
    save();
    createNoteEl(note);
  });
})();