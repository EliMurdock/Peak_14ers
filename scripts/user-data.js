// user-data.js
// Wrapper around localStorage for storing user hike entries.
// Each entry: { name: string, status: 'planned'|'completed', comment: string }

const STORAGE_KEY = 'my-hikes';

export function getAllEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user data from localStorage', e);
    return [];
  }
}

export function saveAllEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries || []));
}

export function getEntry(name) {
  const entries = getAllEntries();
  return entries.find(e => e.name === name) || null;
}

export function addOrUpdateEntry(name, status = 'planned', comment = '') {
  if (!name) return;
  const entries = getAllEntries();
  const idx = entries.findIndex(e => e.name === name);
  const entry = { name, status, comment };
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...entry };
  } else {
    entries.push(entry);
  }
  saveAllEntries(entries);
}

export function removeEntry(name) {
  if (!name) return;
  const entries = getAllEntries().filter(e => e.name !== name);
  saveAllEntries(entries);
}

export function setComment(name, comment) {
  const entries = getAllEntries();
  const idx = entries.findIndex(e => e.name === name);
  if (idx >= 0) {
    entries[idx].comment = comment || '';
    saveAllEntries(entries);
  } else {
    // create a planned entry with comment
    addOrUpdateEntry(name, 'planned', comment || '');
  }
}

export function setStatus(name, status) {
  const entries = getAllEntries();
  const idx = entries.findIndex(e => e.name === name);
  if (idx >= 0) {
    entries[idx].status = status;
    saveAllEntries(entries);
  } else {
    addOrUpdateEntry(name, status, '');
  }
}
