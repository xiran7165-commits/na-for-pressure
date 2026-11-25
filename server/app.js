'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const { handleChat } = require('./chat-handler.js');

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
    return handleChat(request, response);
  }
  if (request.method === 'GET') return serveFile(request, response);
  response.writeHead(405); response.end('Method not allowed');
});

server.listen(port, () => console.log(`N/A for pressure is running at http://localhost:${port}`));
