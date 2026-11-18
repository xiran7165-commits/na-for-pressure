'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const { askOpenAI } = require('./openai.js');
const { keyErrorReply } = require('./keygen.js');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);

function loadEnv() {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

loadEnv();

function sendJson(response, status, body) {
  const text = JSON.stringify(body);
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(text);
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

function serveFile(request, response) {
  const requested = new URL(request.url, `http://${request.headers.host}`).pathname;
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\//, '');
  const file = path.resolve(publicDir, relative);
  if (!file.startsWith(`${publicDir}${path.sep}`)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  if (!fs.existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` });
  fs.createReadStream(file).pipe(response);
}

const server = http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/chat') {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 20000) request.destroy();
    });
    request.on('end', async () => {
      try {
        const input = JSON.parse(body || '{}');
        const message = String(input.message || '').trim();
        if (!message) return sendJson(response, 400, { error: { message: 'Tell me what happened first.', fix: 'Enter a sentence before sending.' } });
        if (message.length > 2000) return sendJson(response, 400, { error: { message: 'That message is too long.', fix: 'Keep the message under 2,000 characters.' } });
        return sendJson(response, 200, await askOpenAI({ message, topic: input.topic }));
      } catch (error) {
        return sendJson(response, 500, safeErrorResponse(error));
      }
    });
    return;
  }
  if (request.method === 'GET') return serveFile(request, response);
  response.writeHead(405); response.end('Method not allowed');
});

server.listen(port, () => console.log(`N/A for pressure is running at http://localhost:${port}`));
