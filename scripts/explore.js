// explore.js

const MOUNTAINS_URL = 'data/fourteeners.json';
let mountainsCache = [];
let sortDirection = 'desc'; // 'desc' or 'asc'

function parseNumberFromString(s) {
  if (!s) return NaN;
  const m = String(s).match(/[\d,]+(?:\.\d+)?/);
  if (!m) return NaN;
  return Number(m[0].replace(/,/g, ''));
}

function sortMountains(list, by, direction = 'desc') {
  const copy = Array.from(list);
  const multiplier = direction === 'asc' ? 1 : -1; // multiply compare result to flip
  switch (by) {
    case 'prominence':
      return copy.sort((a, b) => multiplier * ((parseNumberFromString(a.prominence) || -Infinity) - (parseNumberFromString(b.prominence) || -Infinity)));
    case 'name':
      return copy.sort((a, b) => multiplier * ((a.mountain_peak || '').localeCompare(b.mountain_peak || '')));
    case 'state':
      return copy.sort((a, b) => multiplier * ((a.state || '').localeCompare(b.state || '')));
    case 'elevation':
    default:
      return copy.sort((a, b) => multiplier * ((parseNumberFromString(a.elevation) || -Infinity) - (parseNumberFromString(b.elevation) || -Infinity)));
  }
}

function displayMountains(mountains) {
  const listContainer = document.getElementById('mountain-list');
  listContainer.innerHTML = '';

  mountains.forEach(mountain => {
    const mountainLink = document.createElement('a');
    mountainLink.href = `mountains.html?mountain-name=${encodeURIComponent(mountain.mountain_peak)}`;
    mountainLink.classList.add('mountain-item');

    const elevation = mountain.elevation || 'Unknown';
    const state = mountain.state || 'Unknown';

    mountainLink.innerHTML = `
      <div class="mountain-card">
        <img src="${mountain.thumbnail_image_url || 'data/placeholder.jpg'}" alt="${mountain.mountain_peak}" class="mountain-thumb" />
        <div class="mountain-info">
          <h3>${mountain.mountain_peak}</h3>
          <p><strong>Elevation:</strong> ${elevation}</p>
          <p><strong>State:</strong> ${state}</p>
        </div>
      </div>
    `;

    listContainer.appendChild(mountainLink);
  });
}

function applySortAndRender(by) {
  const sorted = sortMountains(mountainsCache, by, sortDirection);
  displayMountains(sorted);
}

async function loadMountains() {
  try {
    const response = await fetch(MOUNTAINS_URL);
    if (!response.ok) throw new Error('Failed to load');
    mountainsCache = await response.json();
    const select = document.getElementById('sort-select');
    const dirBtn = document.getElementById('sort-direction');
    const initial = select && select.value ? select.value : 'elevation';
    applySortAndRender(initial);
    if (select) select.addEventListener('change', () => applySortAndRender(select.value));
    if (dirBtn) {
      dirBtn.addEventListener('click', () => {
        sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
        dirBtn.textContent = sortDirection === 'desc' ? '↓' : '↑';
        dirBtn.setAttribute('aria-pressed', sortDirection === 'asc' ? 'true' : 'false');
        const current = select && select.value ? select.value : 'elevation';
        applySortAndRender(current);
      });
    }
  } catch (error) {
    console.error('Error loading mountain data:', error);
    const listContainer = document.getElementById('mountain-list');
    listContainer.innerHTML = '<p>Failed to load mountain data. Please try again later.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadMountains);

