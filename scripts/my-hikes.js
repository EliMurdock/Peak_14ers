// Simple and clear version of My Hikes page (junior-friendly)
import { getAllEntries, removeEntry, setComment, setStatus } from './user-data.js';
const MOUNTAINS_URL = 'data/fourteeners.json';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('comment-modal');
  const textarea = document.getElementById('modal-comment');
  const saveBtn = document.getElementById('modal-save');
  const cancelBtn = document.getElementById('modal-cancel');

  let editingName = null;

  saveBtn.addEventListener('click', () => {
    if (!editingName) return;
    setComment(editingName, textarea.value);
    modal.classList.add('hidden');
    render();
  });
  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  render();

  async function render() {
    const entries = getAllEntries();
    const empty = document.getElementById('empty-hikes');
    const section = document.getElementById('hike-list-section');
    const container = document.getElementById('hike-list');

    if (!entries || entries.length === 0) {
      empty.classList.remove('hidden');
      section.classList.add('hidden');
      return;
    }

    empty.classList.add('hidden');
    section.classList.remove('hidden');
    container.innerHTML = '';

    const resp = await fetch(MOUNTAINS_URL);
    const mountains = await resp.json();

    const table = document.createElement('table');
    table.className = 'hikes-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Picture</th>
          <th>Name</th>
          <th>State</th>
          <th>Elevation</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    entries.forEach(entry => {
      const m = mountains.find(x => x.mountain_peak === entry.name) || {};
      const tr = document.createElement('tr');

      // Picture
      const picTd = document.createElement('td');
      picTd.className = 'icon-cell';
      if (m.thumbnail_image_url) picTd.innerHTML = `<img src="${m.thumbnail_image_url}" alt="${entry.name}" class="tiny-icon">`
      else picTd.innerHTML = `<img src="data/placeholder.jpg" alt="No image" class="tiny-icon">`;

      // Name (link)
      const nameTd = document.createElement('td');
      nameTd.innerHTML = `<a href="mountains.html?mountain-name=${encodeURIComponent(entry.name)}">${entry.name}</a>`;

      // State
      const stateTd = document.createElement('td');
      stateTd.textContent = m.state || '';

      // Elevation
      const elevTd = document.createElement('td');
      elevTd.textContent = m.elevation ? `${m.elevation}` : '';

      // Status select
      const statusTd = document.createElement('td');
      const select = document.createElement('select');
      const optPlanned = new Option('Planned', 'planned');
      const optCompleted = new Option('Completed', 'completed');
      select.add(optPlanned);
      select.add(optCompleted);
      select.value = entry.status || 'planned';
      select.addEventListener('change', (e) => { e.stopPropagation(); setStatus(entry.name, select.value); });
      statusTd.appendChild(select);

      // Actions
      const actionsTd = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'btn small';
      removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeEntry(entry.name); tr.remove(); render(); });

      const commentBtn = document.createElement('button');
      commentBtn.textContent = entry.comment ? 'Edit Comment' : 'Add Comment';
      commentBtn.className = 'btn small';
      commentBtn.addEventListener('click', (e) => { e.stopPropagation(); editingName = entry.name; textarea.value = entry.comment || ''; modal.classList.remove('hidden'); });

      actionsTd.appendChild(removeBtn);
      actionsTd.appendChild(commentBtn);

      tr.appendChild(picTd);
      tr.appendChild(nameTd);
      tr.appendChild(stateTd);
      tr.appendChild(elevTd);
      tr.appendChild(statusTd);
      tr.appendChild(actionsTd);

      tr.addEventListener('click', (e) => { if (e.target.closest('button, select, a')) return; window.location = `mountains.html?mountain-name=${encodeURIComponent(entry.name)}`; });

      tbody.appendChild(tr);
    });

    container.appendChild(table);
  }
});
