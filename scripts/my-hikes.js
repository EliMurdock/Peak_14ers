// my-hikes.js
// This page reads the `my-hikes` cookie (list of mountain names) and displays them in a table.

const MOUNTAINS_URL = 'data/fourteeners.json';

document.addEventListener('DOMContentLoaded', loadMyHikes);

function getMyHikesNames() {
  const cookie = document.cookie.split('; ').find(r => r.startsWith('my-hikes='));
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch (e) {
    return [];
  }
}



async function loadMyHikes() {
  const names = getMyHikesNames();
  const emptySection = document.getElementById('empty-hikes');
  const listSection = document.getElementById('hike-list-section');
  const listContainer = document.getElementById('hike-list');

  // If we have no `my-hikes` cookie
  if (!names || names.length === 0) {
    emptySection.classList.remove('hidden');
    listSection.classList.add('hidden');
    return;
  }

  // We have `my-hikes` (array of mountain names). Load full mountain data and render table.
  try {
    const resp = await fetch(MOUNTAINS_URL);
    if (!resp.ok) throw new Error('Could not fetch mountain data');
    const mountains = await resp.json();

    const selected = mountains.filter(m => names.includes(m.name));

    if (!selected || selected.length === 0) {
      emptySection.classList.remove('hidden');
      listSection.classList.add('hidden');
      return;
    }

    emptySection.classList.add('hidden');
    listSection.classList.remove('hidden');

    // Build table
    listContainer.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('hikes-table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Mountain</th>
          <th>Name</th>
          <th>State</th>
          <th>Elevation</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    selected.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="icon-cell">${m.image ? `<img src="${m.image}" alt="${m.name}" class="tiny-icon">` : ''}</td>
        <td><a href="mountains.html?mountain-name=${encodeURIComponent(m.name)}">${m.name}</a></td>
        <td>${m.state || ''}</td>
        <td>${m.elevation ? m.elevation + ' ft' : ''}</td>
      `;
      tbody.appendChild(tr);
    });

    listContainer.appendChild(table);
  } catch (err) {
    console.error('Error loading hikes:', err);
    emptySection.classList.remove('hidden');
    listSection.classList.add('hidden');
  }
}
