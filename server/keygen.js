'use strict';

let cachedKey = null;
let requestInFlight = null;

class KeygenError extends Error {
  constructor(message, fix) {
    super(message);
    this.name = 'KeygenError';
    this.fix = fix;
  }
}

function readConfig() {
  const url = process.env.KEYGEN_URL?.trim().replace(/\/$/, '');
  const token = process.env.KEYGEN_TOKEN?.trim();

  if (!url || !token || url === 'paste-here' || token === 'paste-here') {
    throw new KeygenError(
      'The AI key service is not configured.',
      'Add KEYGEN_URL and KEYGEN_TOKEN to the server .env file, then restart the server.'
    );
  }

  return { url, token };
}

function isUsableCache() {
  return cachedKey && Date.now() < cachedKey.expiresAt;
}

async function requestNewKey() {
  const { url, token } = readConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${url}/api/lookup-key`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new KeygenError(
        'The AI key service could not provide a key.',
        'Check the MindDo service URL and token, then try again.'
      );
    }

    const data = await response.json();
    const expiresAt = Date.parse(data?.expiresAt);

    if (typeof data?.apiKey !== 'string' || !data.apiKey || !Number.isFinite(expiresAt)) {
      throw new KeygenError(
        'The AI key service returned an invalid response.',
        'Ask the MindDo service owner to return apiKey and expiresAt in JSON.'
      );
    }

    cachedKey = { apiKey: data.apiKey, expiresAt };
    return cachedKey.apiKey;
  } catch (error) {
    if (error instanceof KeygenError) throw error;
    const message = error?.name === 'AbortError'
      ? 'The AI key service took too long to respond.'
      : 'The AI key service request failed.';
    throw new KeygenError(
      message,
      'Check the network and MindDo key service, then try again.'
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get the current server-side AI key. Pass { refresh: true } once after
 * OpenAI reports that the current key is invalid; this avoids retry loops.
 */
async function getKey({ refresh = false } = {}) {
  if (refresh) cachedKey = null;
  if (isUsableCache()) return cachedKey.apiKey;
  if (!requestInFlight) {
    requestInFlight = requestNewKey().finally(() => {
      requestInFlight = null;
    });
  }
  return requestInFlight;
}

/**
 * Use this in a server response handler. Render only reply.error.message to
 * the user and keep reply.error.fix in server logs; neither contains secrets.
 */
function keyErrorReply(error, logger = console.error) {
  const message = error?.message || 'The AI key could not be loaded.';
  const fix = error?.fix || 'Check the server configuration and try again.';
  logger(fix);
  return { error: { message, fix } };
}

module.exports = { getKey, keyErrorReply };
