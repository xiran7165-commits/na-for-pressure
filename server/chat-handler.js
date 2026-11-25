'use strict';

const { askOpenAI } = require('./openai.js');
const { keyErrorReply } = require('./keygen.js');

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function safeErrorResponse(error) {
  if (error?.fix) return keyErrorReply(error, fix => console.error(`[server fix] ${fix}`));
  const fallback = {
    message: 'I couldn’t get an answer right now. Please check the internet and try again.',
    fix: 'Check the internet and the server logs, then try again.'
  };
  console.error(`[server fix] ${fallback.fix}`);
  return { error: fallback };
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body);
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 20000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Request was not valid JSON.')); }
    });
    request.on('error', reject);
  });
}

async function handleChat(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: { message: 'Only POST requests are allowed.', fix: 'Send the message to the /api/chat endpoint with POST.' } });
  try {
    const input = await readBody(request);
    const message = String(input.message || '').trim();
    if (!message) return sendJson(response, 400, { error: { message: 'Tell me what happened first.', fix: 'Enter a sentence before sending.' } });
    if (message.length > 2000) return sendJson(response, 400, { error: { message: 'That message is too long.', fix: 'Keep the message under 2,000 characters.' } });
    return sendJson(response, 200, await askOpenAI({ message, topic: input.topic, mode: input.mode }));
  } catch (error) {
    return sendJson(response, 500, safeErrorResponse(error));
  }
}

module.exports = { handleChat };
