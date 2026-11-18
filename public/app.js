'use strict';

const form = document.querySelector('#support-form');
const messageInput = document.querySelector('#message');
const topicInput = document.querySelector('#topic');
const sendButton = document.querySelector('#send-button');
const status = document.querySelector('#status');
const answer = document.querySelector('#answer');
const keywords = document.querySelector('#keywords');
const savedItems = document.querySelector('#saved-items');

function showAnswer(data) {
  answer.textContent = data.reply;
  keywords.innerHTML = data.keywords.map(word => `<span>${window.naStorage.renderSavedItems ? escapeHtml(word) : word}</span>`).join('');
  answer.closest('.answer-card').hidden = false;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function setBusy(busy) {
  sendButton.disabled = busy;
  sendButton.textContent = busy ? 'Thinking…' : 'Suggest kind words  ↑';
  status.textContent = busy ? 'Thinking…' : '';
}

document.querySelectorAll('[data-topic]').forEach(button => {
  button.addEventListener('click', () => {
    topicInput.value = button.dataset.topic;
    document.querySelectorAll('[data-topic]').forEach(item => item.classList.toggle('selected', item === button));
    messageInput.focus();
  });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) {
    status.textContent = 'Write one sentence first.';
    messageInput.focus();
    return;
  }
  setBusy(true);
  answer.closest('.answer-card').hidden = true;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic: topicInput.value })
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error?.message || 'I couldn’t get an answer right now. Please check the internet and try again.');
    showAnswer(data);
    window.naStorage.renderSavedItems(savedItems, window.naStorage.saveItem({ topic: topicInput.value, message, ...data, createdAt: Date.now() }));
  } catch (error) {
    status.textContent = error.message;
  } finally {
    setBusy(false);
  }
});

messageInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

window.naStorage.renderSavedItems(savedItems, window.naStorage.loadItems());
