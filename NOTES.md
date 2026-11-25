# N/A for pressure notes

## Run it

From this folder, run:

```bash
/Users/xiranguo/Documents/Codex/.local/node/bin/node server/app.js
```

Then open http://localhost:3000.

## Done

- Version 1 web app built for test stress and friendship feelings.
- Students can choose a topic, write what happened, and press Enter or the arrow button.
- The server asks the OpenAI model `gpt-5.6-luna` for kind words and key words.
- The AI connects through `getKey()` in `server/keygen.js`.
- The OpenAI key and MindDo token stay on the server and are never sent to the page.
- The button shows “Thinking…” and is disabled while the AI is answering.
- Danger words stop the AI request and direct the student to a trusted adult and help.
- Saves on this computer only for now. Browser saving is kept in `public/storage.js`.
- `.env` is ignored and must never be committed.
- After each save point, push it to GitHub.
- Vercel setup: the page is served from `public/`, and `api/chat.js` is the server function. In Vercel Project Settings → Environment Variables, add `KEYGEN_URL` and `KEYGEN_TOKEN` for the Production, Preview, and Development environments. Do not upload `.env`.
- To deploy, connect the GitHub repository to Vercel and use the project root. No extra build command is needed; Vercel uses `vercel.json`.

## MVP checks

1. Write a test or friendship problem and send it: the app shows a kind 2–3 sentence suggestion.
2. Look below the suggestion: key words appear as small tags.
3. Choose “Test stress” or “Friendship” before writing: the selected topic is used in the request.
4. Ask a normal school question: the server returns a safe AI answer; try a danger phrase to see the safety message.

## Maybe Later

- Trusted-adult and helpline message when danger words appear
- Ask for a different suggestion
- Practice saying the line with gentle feedback
- Short calming breathing exercise
- Save favorite phrases
- Clear the conversation
- Rate whether a suggestion helped
- Tips for handling test pressure
