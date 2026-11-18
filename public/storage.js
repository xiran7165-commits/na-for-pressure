'use strict';

const STORAGE_KEY = 'na-for-pressure-items-v1';
const samples = [
  { topic: 'Test stress', message: 'I keep thinking I will fail my math test.', keywords: ['test', 'fear of failure'], reply: 'It makes sense to feel nervous when a test matters to you. You could choose one small topic to review for ten minutes and ask your teacher one question tomorrow.', sample: true },
  { topic: 'Friendship', message: 'My friend has been leaving me out.', keywords: ['friendship', 'left out'], reply: 'Being left out can hurt, and your feelings matter. You could calmly tell your friend how it felt and ask if you can talk for a few minutes.', sample: true }
];

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : samples;
  } catch {
    return samples;
  }
}

function saveItem(item) {
  const items = [item, ...loadItems().filter(existing => !existing.sample)].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

function renderSavedItems(container, items) {
  container.innerHTML = '';
  items.slice(0, 4).forEach(item => {
    const row = document.createElement('article');
    row.className = 'saved-item';
    row.innerHTML = `<span>${item.sample ? 'Example' : 'Saved'}</span><p>${escapeHtml(item.message)}</p>`;
    container.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

window.naStorage = { loadItems, saveItem, renderSavedItems };
