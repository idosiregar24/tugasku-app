---
name: run-tugasku
description: Launch and drive the Tugasku app locally (Vite dev server + the /api assistant function) and verify UI changes with screenshots at iPhone and desktop sizes using mocked Supabase and AI, without touching the real database. Use when asked to run, start, screenshot, or test the app.
---

# Running Tugasku

React 19 + Vite 8 SPA, Supabase for auth/data, one serverless function (`api/assistant.js`) deployed on Vercel. Windows dev box (Laragon folder, but this is **not** a PHP app).

## Environment

`.env` (gitignored; template in `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...      # server-only, no VITE_ prefix; only needed for the AI assistant
```

Vite reads env **only at startup** — restart the dev server after editing `.env`. A missing Supabase var shows a black screen with "Missing Supabase env vars" in the console. `/api/assistant` answers 503 `not_configured` without `GEMINI_API_KEY`; the rest of the app works.

## Start

```bash
npm run dev          # http://localhost:5173 ; also serves /api/assistant via the devApi plugin in vite.config.js
```

Run it in the background, then wait for the ready line instead of sleeping:

```bash
until grep -qE "ready in|Local:" <output-file>; do sleep 1; done
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
```

**Stale servers:** background Vite processes survive between sessions and grab 5173/5174/…; a new one silently moves to the next port and old ones keep serving old env/config. Check and kill before starting:

```powershell
Get-NetTCPConnection -State Listen | ? { $_.LocalPort -ge 5173 -and $_.LocalPort -le 5180 } | select LocalPort, OwningProcess
Stop-Process -Id <pid> -Force
```

`npm run build` must pass; `npx eslint .` has known false positives (`'motion' / 'Icon' is defined but never used` — the config lacks JSX-usage detection). Don't count those as regressions.

## Drive it (mocked, safe)

`e2e-mock.mjs` in this folder logs in with a fake Supabase session, serves tasks/profiles from memory, mocks `/api/assistant` with a scripted tool-use conversation, and screenshots every main screen at 390×844 (touch) and 1440×900. Nothing reaches the real Supabase project or the Anthropic API.

```bash
# once, in a scratch dir (uses the system Microsoft Edge — no browser download)
npm init -y && npm i playwright-core
cp <repo>/.claude/skills/run-tugasku/e2e-mock.mjs .
node e2e-mock.mjs ./shots        # dev server must be running on 5173
```

It prints what it verified (status PATCH, assistant tool round-trip, echoed thinking blocks, deep-link cleanup, horizontal overflow) and **CONSOLE ERRORS** — must be `(none)`. Then open the PNGs and actually look at them.

Adapting it: the Supabase project ref and localStorage key (`sb-<ref>-auth-token`) are at the top; add routes for new tables in `setup()`; add steps using role/label selectors (`getByRole('button', { name: … })`), which also keeps aria-labels honest.

## Real end-to-end

Needs a real account on the Supabase project and `ANTHROPIC_API_KEY`. Ask the user before creating accounts or data in their Supabase project.
