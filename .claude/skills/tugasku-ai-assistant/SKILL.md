---
name: tugasku-ai-assistant
description: How the Tugasku in-app AI assistant (Google Gemini) is built — server endpoint, client tool loop, tools, safety limits — and how to change the prompt, add a tool, or test it with or without a real API key. Use for any change to api/assistant.js, useAssistant.js, or AssistantPanel.jsx.
---

# Tugasku AI assistant

Chat panel that reads the user's tasks and can create tasks, create schedules, and update tasks. Model: **Google Gemini** (`gemini-3.8-flash`) through the **Interactions API** in `@google/genai`. Key: `GEMINI_API_KEY` (server-only, from aistudio.google.com/apikey; `gemini-3.8-flash` has a free tier).

## Architecture

```
AssistantPanel.jsx ── useAssistant.js ──POST /api/assistant (NDJSON stream)──> api/assistant.js ──> Gemini
   (UI)               (history, tool loop,        {input, context}              (auth, pinned model/prompt/tools,
                       runs tools locally)                                        one model turn per request)
```

- **`api/assistant.js`** (Vercel function; mounted in dev by `devApi()` in `vite.config.js`):
  verifies the Supabase JWT (`Authorization: Bearer <access_token>`) with `supabase.auth.getUser`, validates the history, pins `MODEL`, `SYSTEM_PROMPT`, `TOOLS`, `generation_config` — **the client can't change any of those**. Calls `ai.interactions.create({ stream: true, store: false, … })` and re-emits the stream as NDJSON lines: `{"type":"text"|"tool"|"message"|"error"}`.
- **`src/hooks/useAssistant.js`**: owns the conversation history (Gemini `input` items), runs up to 6 tool rounds per user message, and rolls the history back on any error so a failed turn can't corrupt it. Tools run **in the browser** through the same `addTask` / `updateTask` as the UI, so RLS, optimistic updates, recurring-task logic, and the free-plan limit all apply. Every tool input is re-validated before it touches data.
- **Context** (today's local date, time zone, name, plan, compact task list) is rebuilt per request and appended to the system instruction. The server clips it (120 tasks, 200-char notes). Task text is framed as data, not instructions.

## Streaming quirks that the code depends on

These were verified against the live API — don't "simplify" them away:

1. **`interaction.completed` carries no `steps` while streaming.** The handler rebuilds each step from `step.start` / `step.delta` / `step.stop` events (it still prefers `completed.steps` if a future API version sends them).
2. **Tool arguments stream as chunks of a JSON string** (`delta.type === 'arguments_delta'`), concatenated and parsed at `step.stop`. Unparseable JSON → `arguments: {}`, which the browser's validation then rejects.
3. **Thought steps carry a `signature`** (`delta.type === 'thought_signature'`). They are rebuilt and echoed back in the next turn's `input`; a thinking model expects its own thought steps in history.
4. History items sent back: `user_input`, `thought`, `model_output`, `function_call`, `function_result` — the server rejects anything else.

A real turn looks like: `user_input` → (`thought`, `function_call`) → `function_result` → (`thought`, `model_output`).

## Changing things

- **Prompt / model / limits:** constants at the top of `api/assistant.js`. Output formatting is limited to paragraphs, `- ` / `1. ` lists and `**bold**` because `RichText` in `AssistantPanel.jsx` renders only those (as React nodes, never HTML).
- **Add a tool:** (1) declare it in `TOOLS` (server) as `{ type: 'function', name, description, parameters }` with a JSON-Schema-ish `parameters`; (2) add a branch in `runTool` in `useAssistant.js` that validates every field and returns `{ ok, result, action }`; (3) mention it in the system prompt if the model needs guidance. Destructive tools should confirm in the UI first — there is deliberately no delete tool.
- **UI:** `AssistantPanel.jsx` — fullscreen sheet on phones, right-side panel from `md`. Suggestion chips in `SUGGESTIONS`.

## Testing

```bash
# handler with fake Supabase + fake Gemini stream (no network, no key)
node .claude/skills/tugasku-ai-assistant/api-offline-test.mjs api/assistant.js

# same, but the Gemini call goes to the real API with GEMINI_API_KEY from .env
GEMINI_LIVE=1 node .claude/skills/tugasku-ai-assistant/api-offline-test.mjs api/assistant.js
```

The mock asserts the upstream request (endpoint, `x-goog-api-key`, model, tools, system instruction) and the rebuilt steps. For the browser side, `run-tugasku` → `e2e-mock.mjs` mocks `/api/assistant` and checks the second request carries `user_input, thought, model_output, function_call, function_result`.

## Cost & abuse

`gemini-3.8-flash` has a free tier with rate limits; paid tier is $0.75/1M input and $3.75/1M output tokens (rising Jan 2027). Any logged-in user can call the endpoint and there is no per-user quota yet — if usage grows, add an `assistant_usage` table (user_id, day, count) checked in `api/assistant.js`, or gate the assistant to Pro.
