'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { getKey } = require('./keygen.js');

const projectRoot = path.join(__dirname, '..');

function readModel() {
  const notes = fs.readFileSync(path.join(projectRoot, 'NOTES.md'), 'utf8');
  const match = notes.match(/OpenAI model\s+`?([A-Za-z0-9._-]+)`?/i);
  if (!match) {
    const error = new Error('The OpenAI model is not configured.');
    error.fix = 'Add the OpenAI model name to NOTES.md, then restart the server.';
    throw error;
  }
  return match[1];
}

function readInstructions() {
  const brief = fs.readFileSync(path.join(projectRoot, 'BRIEF.md'), 'utf8');
  const start = brief.indexOf('## AI instructions');
  if (start === -1) {
    const error = new Error('The AI instructions are missing from BRIEF.md.');
    error.fix = 'Add the AI instructions section to BRIEF.md, then restart the server.';
    throw error;
  }
  return brief.slice(start);
}

function safetyReply(message) {
  const dangerWords = /\b(kill|hurt|harm|suicide|self[- ]harm|die|weapon|attack)\b/i;
  return dangerWords.test(message)
    ? {
        keywords: ['safety concern'],
        reply: 'I’m glad you said something. Please tell a trusted adult right now; if you or someone else may be in immediate danger, call emergency services or call, text, or chat with 988 in the U.S.'
      }
    : null;
}

async function askOpenAI({ message, topic }) {
  const safety = safetyReply(message);
  if (safety) return safety;

  const system = `${readInstructions()}

Return only JSON with this exact shape:
{"keywords":["short keyword"],"reply":"2 or 3 kind, easy-to-read sentences"}

The reply must comfort the student first and then suggest one small next step. Do not include markdown, a diagnosis, or claims that you are a human.`;

  async function request(apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: readModel(),
        max_completion_tokens: 180,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Topic: ${topic || 'not selected'}\nStudent message: ${message}` }
        ]
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(response.status === 401 ? 'The AI key was rejected.' : 'The AI could not answer right now.');
      error.status = response.status;
      error.fix = response.status === 401
        ? 'Refresh the key once through MindDo and try the OpenAI request again.'
        : 'Check the internet and the OpenAI service, then try again.';
      throw error;
    }
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      const error = new Error('The AI returned an empty answer.');
      error.fix = 'Check the OpenAI model response, then try again.';
      throw error;
    }
    try {
      const result = JSON.parse(content);
      return {
        keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 5).map(String) : [],
        reply: String(result.reply || 'I’m listening. Try sharing one more detail about what feels hardest.')
      };
    } catch {
      const error = new Error('The AI returned an answer in an unexpected format.');
      error.fix = 'Check the model response format and try again.';
      throw error;
    }
  }

  let apiKey = await getKey();
  try {
    return await request(apiKey);
  } catch (error) {
    if (error.status !== 401) throw error;
    apiKey = await getKey({ refresh: true });
    return request(apiKey);
  }
}

module.exports = { askOpenAI };
