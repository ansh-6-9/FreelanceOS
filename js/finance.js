/* Finance & Tracking */
(() => {
  // Earnings Calculator
  const form = document.getElementById('earningsForm');
  if (form) {
    const resultP = document.getElementById('calcResult');
    const incomeKey = 'incomeRecords';
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('clientName').value.trim();
      const rate = parseFloat(document.getElementById('hourlyRate').value);
      const hours = parseFloat(document.getElementById('hoursWorked').value);
      if (isNaN(rate) || isNaN(hours)) return;
      const amount = rate * hours;
      resultP.textContent = `Earnings for ${name || 'client'}: $${amount.toFixed(2)}`;
      // Save record
      const arr = JSON.parse(localStorage.getItem(incomeKey) || '[]');
      arr.push({ date: new Date().toISOString(), amount });
      localStorage.setItem(incomeKey, JSON.stringify(arr));
      renderIncomeTable();
      form.reset();
    });

    const renderIncomeTable = () => {
      const tbody = document.querySelector('#incomeTable tbody');
      tbody.innerHTML = '';
      const arr = JSON.parse(localStorage.getItem(incomeKey) || '[]');
      const map = {};
      arr.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${d.getMonth()+1}`;
        map[key] = (map[key] || 0) + r.amount;
      });
      Object.entries(map).forEach(([m, total]) => {
        const tr = document.createElement('tr');
        const [y, mo] = m.split('-');
        const monthName = new Date(y, mo-1).toLocaleString(undefined,{month:'long',year:'numeric'});
        tr.innerHTML = `<td>${monthName}</td><td>$${total.toFixed(2)}</td>`;
        tbody.appendChild(tr);
      });
    };
    renderIncomeTable();
  }

  // Expense Tracker
  const expForm = document.getElementById('expenseForm');
  if (expForm) {
    const list = document.getElementById('expenseList');
    const chart = document.getElementById('expenseChart');
    const expKey = 'expenses';

    const render = () => {
      const arr = JSON.parse(localStorage.getItem(expKey) || '[]');
      list.innerHTML = '';
      const summary = {};
      arr.forEach((ex, idx) => {
        const li = document.createElement('li');
        li.textContent = `${new Date(ex.date).toLocaleDateString()} – $${ex.amount.toFixed(2)} – ${ex.title}`;
        const del = document.createElement('button');
        del.textContent = '✕';
        del.addEventListener('click', () => { arr.splice(idx,1); save(arr); });
        li.appendChild(del);
        list.appendChild(li);
        const month = new Date(ex.date).getMonth();
        summary[month] = (summary[month] || 0) + ex.amount;
      });
      // chart
      chart.innerHTML = '';
      const max = Math.max(...Object.values(summary),0);
      Object.keys(summary).sort().forEach(m => {
        const bar = document.createElement('div');
        bar.className = 'expense-bar';
        bar.style.width = (summary[m]/max*100 || 0) + '%';
        bar.title = `${new Date(2023,m).toLocaleString(undefined,{month:'long'})}: $${summary[m].toFixed(2)}`;
        chart.appendChild(bar);
      });
    };

    const save = arr => { localStorage.setItem(expKey, JSON.stringify(arr)); render(); };

    expForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('expenseTitle').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value);
      const date = document.getElementById('expenseDate').value;
      if (!title || isNaN(amount) || !date) return;
      const arr = JSON.parse(localStorage.getItem(expKey) || '[]');
      arr.push({ title, amount, date });
      save(arr);
      expForm.reset();
    });

    render();
  }
})();