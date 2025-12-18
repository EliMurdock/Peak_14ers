// mountains.js — concise loader + wiki fetch + minimal rendering
import { getEntry, addOrUpdateEntry, setComment } from './user-data.js';
const MOUNTAINS_URL = 'data/fourteeners.json';

async function fetchWiki(endpoint, title) {
  try {
    if (endpoint) {
      const url = endpoint.includes('origin=') ? endpoint : endpoint + '&origin=*';
      const r = await fetch(url); if (!r.ok) return {};
      const j = await r.json(); const p = j?.query?.pages && j.query.pages[Object.keys(j.query.pages)[0]];
      const extract = p?.extract || '';
      return { text: extract, first: extract.split('\n\n')[0] || extract.split('\n')[0] || '', image: p?.original?.source || p?.thumbnail?.source || '' };
    }
    const s = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g,'_')));
    if (!s.ok) return {}; const sj = await s.json(); return { text: sj.extract || '', first: (sj.extract || '').split('\n\n')[0] || '', image: sj?.originalimage?.source || sj?.thumbnail?.source || '' };
  } catch (e) { console.warn('wiki fetch failed', e); return {}; }
}

async function loadMountainDetails() {
  const params = new URLSearchParams(location.search); const nameParam = params.get('mountain-name');
  const el = document.getElementById('mountain-details'); if (!nameParam) return el && (el.innerHTML = '<p>Mountain name not found in URL.</p>');
  const wanted = decodeURIComponent(nameParam).toLowerCase();
  try {
    const r = await fetch(MOUNTAINS_URL); if (!r.ok) throw new Error('missing local data');
    const list = await r.json(); const local = list.find(m => (m.mountain_peak || m.name || '').toLowerCase() === wanted);
    if (!local) return el && (el.innerHTML = '<p>Mountain not found.</p>');
    const wiki = await fetchWiki(local.wikipedia_api_endpoint, local.mountain_peak || local.name);
    const mountain = {
      name: local.mountain_peak,
      state: local.state,
      elevation: local.elevation,
      prominence: local.prominence,
      headerImage: local.full_image_url || local.thumbnail_image_url || '',
      mountain_range: local.mountain_range || '',
      description: wiki.first || wiki.text || local.summary || local.description || ''
    };
    render(mountain);
  } catch (err) { console.error(err); el && (el.innerHTML = `<p>Error loading data: ${err.message}</p>`); }
}

function render(m) {
  const c = document.getElementById('mountain-details'); if (!c) return; const stored = getEntry(m.name);
  c.innerHTML = `
    <div class="mountain-header">${m.headerImage ? `<img src="${m.headerImage}" alt="${m.name}" class="mountain-banner">` : ''}
      <div class="mountain-subheader">
        <div class="return-link-grid"><a href="explore.html" class="btn">← Back to Explore</a></div>
          <div class="mountain-title"><h1>${m.name}</h1><p>${m.state || 'Unknown location'}</p></div>
          <button id="hike-btn" class="hike-btn"><span class="label">${stored ? `<a href="my-hikes.html">Added to my hikes</a>` : 'Hike it!'}</span><img src="data/hiker.gif" class="hiker-gif" alt="hiker"></button>
      </div>
    </div>
    <div class="mountain-info-section"><div class="info-box"><h3>Elevation</h3><p>${m.elevation || 'N/A'}</p></div><div class="info-box"><h3>Prominence</h3><p>${m.prominence || 'N/A'}</p></div><div class="info-box"><h3>Mountain Range</h3><p>${m.mountain_range || 'N/A'}</p></div></div>
    <div class="mountain-description"><h2>About ${m.name}</h2><p>${m.description || 'No description available for this mountain.'}</p>${stored && stored.comment ? `<div class="my-comment"><h3 class="my-note">My note <a href="#" class="edit-note-link">Edit note</a></h3><p>${stored.comment}</p></div>` : ''}</div>`;

  const btn = document.getElementById('hike-btn'); if (btn && !getEntry(m.name)) btn.addEventListener('click', () => { const ex = getEntry(m.name); addOrUpdateEntry(m.name, ex ? ex.status : 'planned', ex ? ex.comment : ''); const label = btn.querySelector('.label'); label.innerHTML = `<a href="my-hikes.html">Added to my hikes</a>`; btn.classList.add('added'); });
  // Note: add/edit note button removed per request; saved comment is displayed below if present
  // attach handler for inline edit link (if present)
  const editLink = document.querySelector('.my-comment .edit-note-link');
  if (editLink) {
    editLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (typeof window.openCommentModal === 'function') return window.openCommentModal(m.name, stored ? stored.comment : '');
      const mm = document.getElementById('mountain-comment-modal'); if (!mm) return; const ta = document.getElementById('mountain-modal-comment'); const save = document.getElementById('mountain-modal-save'); mm.classList.remove('hidden'); mm.setAttribute('aria-hidden','false'); ta.value = stored ? stored.comment : ''; save.dataset.name = m.name;
    });
  }
}

document.addEventListener('DOMContentLoaded', loadMountainDetails);

// compact modal handling (keeps prior behavior)
const mountModal = document.getElementById('mountain-comment-modal');
if (mountModal) {
  const ta = document.getElementById('mountain-modal-comment'); const save = document.getElementById('mountain-modal-save'); const cancel = document.getElementById('mountain-modal-cancel'); const backdrop = mountModal.querySelector('.modal-backdrop');
  function openCommentModal(name, prefill) { mountModal.classList.remove('hidden'); mountModal.setAttribute('aria-hidden','false'); ta.value = prefill || ''; save.dataset.name = name; }
  function closeCommentModal() { mountModal.classList.add('hidden'); mountModal.setAttribute('aria-hidden','true'); save.dataset.name = ''; }
  // expose for inline edit link handlers
  window.openCommentModal = openCommentModal;
  save.addEventListener('click', () => {
    const name = save.dataset.name; if (!name) return closeCommentModal(); setComment(name, ta.value); closeCommentModal();
    const area = document.querySelector('.mountain-description .my-comment');
    if (ta.value) {
      if (area) {
        area.innerHTML = `<h3>My note <a href="#" class="edit-note-link">Edit note</a></h3><p>${ta.value}</p>`;
      } else {
        const d = document.querySelector('.mountain-description'); const div = document.createElement('div'); div.className = 'my-comment'; div.innerHTML = `<h3>My note <a href="#" class="edit-note-link">Edit note</a></h3><p>${ta.value}</p>`; d.appendChild(div);
      }
      // reattach inline edit handler
      const link = document.querySelector('.my-comment .edit-note-link');
      if (link) link.addEventListener('click', (ev) => { ev.preventDefault(); if (typeof window.openCommentModal === 'function') return window.openCommentModal(name, ta.value); const mm = document.getElementById('mountain-comment-modal'); if (!mm) return; const t = document.getElementById('mountain-modal-comment'); const s = document.getElementById('mountain-modal-save'); mm.classList.remove('hidden'); mm.setAttribute('aria-hidden','false'); t.value = ta.value; s.dataset.name = name; });
    } else area && area.remove();
  });
  cancel.addEventListener('click', closeCommentModal); if (backdrop) backdrop.addEventListener('click', closeCommentModal);
}
