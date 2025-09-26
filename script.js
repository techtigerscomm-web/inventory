const defaultItems = [
  { sno: 1, name: 'AC Voltmeter (0-300 V)', stock: 1, page: '1', notes: '', history: [] },
  { sno: 2, name: 'Aerial Lifter Pole', stock: 0, page: '2', notes: '', history: [] },
  { sno: 3, name: 'Almirah Steel', stock: 0, page: '3', notes: '', history: [] },
  { sno: 4, name: 'Almirah Wooden', stock: 0, page: '4', notes: '', history: [] },
  { sno: 5, name: 'AP Police Manual for Communication', stock: 1, page: '5', notes: '', history: [] },
  { sno: 6, name: 'Aviation Lamp', stock: 0, page: '6', notes: '', history: [] },
  { sno: 7, name: 'Battery clips for HD Charger 50 Amps', stock: 12, page: '12', notes: '', history: [] },
  { sno: 8, name: 'Belt clips for Kenwood NX-3220/TK-2170 H/H Set', stock: 4, page: '13', notes: '', history: [] },
  { sno: 9, name: 'Bench  Asstd', stock: 0, page: '14', notes: '', history: [] },
  { sno: 10, name: 'Brass Seal', stock: 0, page: '15', notes: '', history: [] },
  // Add all 133 items here exactly in the same format
  { sno: 133, name: 'Yeasu Triband set Headphones', stock: 0, page: '244', notes: '', history: [] }
];

let items = JSON.parse(localStorage.getItem('stockItems')) || defaultItems;
let currentItem = null;

const searchBar = document.getElementById('searchBar');
const suggestionsDiv = document.getElementById('suggestions');
const dropdown = document.getElementById('dropdown');
const itemTable = document.getElementById('itemTable');
const downloadBtn = document.getElementById('downloadBtn');

function saveToStorage() {
  localStorage.setItem('stockItems', JSON.stringify(items));
}

function populateDropdown() {
  dropdown.innerHTML = '<option value="">Select stock item...</option>';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.sno;
    opt.textContent = item.name;
    dropdown.appendChild(opt);
  });
}
populateDropdown();

searchBar.addEventListener('input', () => {
  const val = searchBar.value.trim().toLowerCase();
  suggestionsDiv.innerHTML = '';
  if (!val) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  const filtered = items.filter(i => i.name.toLowerCase().includes(val));
  if (!filtered.length) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  filtered.forEach(i => {
    const div = document.createElement('div');
    div.className = 'suggestion';
    div.textContent = `${i.name} (Stock: ${i.stock}, Pg: ${i.page})`;
    div.onclick = () => {
      showItem(i);
      searchBar.value = i.name;
      suggestionsDiv.style.display = 'none';
      dropdown.value = i.sno;
    };
    suggestionsDiv.appendChild(div);
  });
  suggestionsDiv.style.display = 'block';
});

document.addEventListener('click', e => {
  if (!suggestionsDiv.contains(e.target) && e.target !== searchBar) {
    suggestionsDiv.style.display = 'none';
  }
});

dropdown.addEventListener('change', () => {
  const sno = parseInt(dropdown.value, 10);
  if (!sno) return;
  const item = items.find(i => i.sno === sno);
  if (item) {
    showItem(item);
    searchBar.value = item.name;
  }
});

function isValidPageString(str) {
  if (!str) return false;
  const cleanStr = str.replace(/\s/g, '');
  return /^(\d+(-\d+)?)(,(\d+(-\d+)?))*$/.test(cleanStr);
}

function renderHistoryTable(item) {
  if (!item.history || !item.history.length) {
    return '<div>No stock change history.</div>';
  }
  let html = `<div class="history-title">Stock Change History</div><table class="history-table"><thead><tr><th>#</th><th>Date & Time</th><th>Old Stock</th><th>New Stock</th><th>Received/Sent</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>`;
  item.history.forEach((entry, i) => {
    const diff = entry.new - entry.old;
    const diffClass = diff > 0 ? 'received' : (diff < 0 ? 'sent' : '');
    const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
    html += `<tr data-idx="${i}">
      <td>${i + 1}</td>
      <td>${entry.date}</td>
      <td>${entry.old}</td>
      <td>${entry.new}</td>
      <td class="${diffClass}"><strong>${sign}${Math.abs(diff)}</strong></td>
      <td>
        <textarea class="history-remark-edit" data-idx="${i}" style="width: 85%; height: 40px;">${entry.remark || ''}</textarea>
        <button class="history-remark-save" data-idx="${i}" style="margin-left: 5px;">Save</button>
      </td>
      <td>
        <button class="history-delete" data-idx="${i}" style="background:#e35b5b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function showItem(item) {
  currentItem = item;
  itemTable.innerHTML = `<table>
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Name</th>
        <th>Stock</th>
        <th>Page Number(s)</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${item.sno}</td>
        <td style="position: relative;">
          <span id="nameDisplay">${item.name}</span>
          <input type="text" id="nameEdit" class="editable-name-input" value="${item.name}" style="display:none;"/>
          <button id="nameEditBtn" class="edit-name-btn btn-inline" title="Edit Name">✎</button>
          <button id="nameSaveBtn" class="save-name-btn btn-inline" title="Save Name" style="display:none;">✓</button>
        </td>
        <td><input type="number" min="0" id="stockEdit" class="editable" value="${item.stock}"/></td>
        <td><input type="text" id="pageEdit" class="editable" value="${item.page}"/></td>
        <td>
          <button class="save-btn" id="itemSaveBtn">Save</button>
          <button class="delete-btn" id="itemDelBtn">Delete</button>
        </td>
      </tr>
      <tr>
        <td colspan="5">
          <label for="notesEdit" style="font-weight:bold;">Additional Notes:</label>
          <textarea id="notesEdit" class="textarea-editable" placeholder="Additional notes">${item.notes || ''}</textarea>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="history-container">${renderHistoryTable(item)}</div>`;

  const nameDisplay = document.getElementById('nameDisplay');
  const nameEditInput = document.getElementById('nameEdit');
  const nameEditBtn = document.getElementById('nameEditBtn');
  const nameSaveBtn = document.getElementById('nameSaveBtn');

  nameEditBtn.onclick = () => {
    nameDisplay.style.display = 'none';
    nameEditInput.style.display = 'inline-block';
    nameEditBtn.style.display = 'none';
    nameSaveBtn.style.display = 'inline-block';
    nameEditInput.focus();
  };

  nameSaveBtn.onclick = () => {
    const newName = nameEditInput.value.trim();
    if (newName) {
      nameDisplay.textContent = newName;
      currentItem.name = newName;
      saveToStorage();
      populateDropdown();
    }
    nameDisplay.style.display = 'inline';
    nameEditInput.style.display = 'none';
    nameEditBtn.style.display = 'inline-block';
    nameSaveBtn.style.display = 'none';
  };

  document.getElementById('itemSaveBtn').onclick = () => saveEdits(item.sno);
  document.getElementById('itemDelBtn').onclick = () => {
    if (confirm('Are you sure you want to delete this stock item?')) deleteItem(item.sno);
  };

  itemTable.querySelectorAll('.history-remark-save').forEach(button => {
    button.onclick = e => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      const textarea = itemTable.querySelector(`textarea.history-remark-edit[data-idx='${idx}']`);
      if (textarea) {
        currentItem.history[idx].remark = textarea.value.trim();
        saveToStorage();
        alert('Remark saved.');
      }
    };
  });

  itemTable.querySelectorAll('.history-delete').forEach(button => {
    button.onclick = e => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      if (confirm('Are you sure you want to delete this stock change history?')) {
        deleteHistoryEntry(currentItem.sno, idx);
      }
    };
  });
}

function saveEdits(sno) {
  const stockInput = document.getElementById('stockEdit');
  const pageInput = document.getElementById('pageEdit');
  const notesInput = document.getElementById('notesEdit');

  const stockVal = parseInt(stockInput.value, 10);
  const pageVal = pageInput.value.trim();
  const notesVal = notesInput.value.trim();

  if (isNaN(stockVal) || stockVal < 0) {
    alert('Stock must be a non-negative integer.');
    return;
  }
  if (!isValidPageString(pageVal)) {
    alert('Invalid page numbers. Example: 1,3-5,8');
    return;
  }

  const idx = items.findIndex(i => i.sno === sno);
  if (idx === -1) {
    alert('Item not found.');
    return;
  }
  const item = items[idx];

  if (item.stock !== stockVal) {
    const now = new Date().toLocaleString();
    if (!Array.isArray(item.history)) item.history = [];

    item.history.push({ date: now, old: item.stock, new: stockVal, remark: '' });
    item.stock = stockVal;
  }

  item.page = pageVal;
  item.notes = notesVal;

  saveToStorage();
  alert(`Saved changes for "${item.name}".`);
  populateDropdown();
  showItem(item);
}

function deleteHistoryEntry(sno, histIdx) {
  const idx = items.findIndex(i => i.sno === sno);
  if (idx === -1) {
    alert('Item not found.');
    return;
  }
  const item = items[idx];
  if (!item.history || !item.history[histIdx]) return;

  const removed = item.history.splice(histIdx, 1)[0];

  // If latest history deleted (last element), revert stock accordingly
  if (histIdx === item.history.length) {
    if (item.history.length) {
      item.stock = item.history[item.history.length - 1].new;
    } else {
      item.stock = removed.old;
    }
    if (document.getElementById('stockEdit')) {
      document.getElementById('stockEdit').value = item.stock;
    }
  }

  saveToStorage();
  alert('Stock change history entry deleted.');
  showItem(item);
}

function deleteItem(sno) {
  if (!confirm('Are you sure you want to delete this stock item?')) return;
  const idx = items.findIndex(i => i.sno === sno);
  if (idx === -1) {
    alert('Item not found.');
    return;
  }
  items.splice(idx, 1);
  saveToStorage();
  alert('Stock item deleted.');
  populateDropdown();
  itemTable.innerHTML = '';
  searchBar.value = '';
}

function downloadExcel() {
  const data = [['S.No.', 'Name of the Item', 'Stock', 'Page Number(s)', 'Stock Notes']];
  items.forEach(item => {
    data.push([item.sno, item.name, item.stock, item.page, item.notes]);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Data');
  XLSX.writeFile(wb, 'e-ledger-kakinada-stock.xlsx');
}

downloadBtn.addEventListener('click', downloadExcel);
