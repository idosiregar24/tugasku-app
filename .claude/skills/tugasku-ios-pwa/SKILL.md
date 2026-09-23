---
name: tugasku-ios-pwa
description: iPhone/iPad and home-screen (PWA) rules for Tugasku. Use when touching layout, fixed/sticky elements, inputs, notifications, audio, fullscreen, the service worker, the manifest, or app icons, or when a bug is reported "only on iPhone".
---

# iOS & PWA rules for Tugasku

Tugasku is installed on iPhones via Safari → Share → Add to Home Screen (no App Store app). It runs `standalone` with a `black-translucent` status bar, so the page draws **under the notch and home indicator**.

## Files

- `index.html` — `viewport-fit=cover`, apple-touch-icon, `apple-mobile-web-app-*` meta, single `theme-color` meta (updated by `useTheme`: `#f6f9fc` day / `#070b1c` night; the app defaults to the day theme).
- `public/backgrounds/scene-*.svg` — the fixed page background (see the `tugasku-design` skill). It's painted by `body::before` at `100lvh`, not `background-attachment: fixed`, which iOS ignores.
- `public/manifest.webmanifest` — name, icons, shortcuts. `start_url` is `/dashboard?source=pwa`.
- `public/sw.js` — offline shell (network-first pages, cache-first `/assets/*` + `/icons/*`), never caches `/api/*` or Supabase. Registered as `/sw.js?mode=dev` from Vite dev, which **disables caching** so dev never serves stale modules.
- `public/icons/*` — rendered from `public/favicon.svg` with `render-icons.mjs` (this folder).

## Hard rules

1. **Safe areas.** Top bars: `pt-safe`. Bottom-pinned things: `pb-safe`, or `bottom-nav-offset` when they must sit above the mobile nav. Page containers that aren't under a header use `pt-[calc(3rem+env(safe-area-inset-top))]`.
2. **Heights.** Use `h-app` / `min-h-app` (100dvh with 100vh fallback), not `h-screen` / `min-h-screen` — `100vh` on iOS includes the area behind Safari's toolbars.
3. **Inputs ≥ 16px** or iOS zooms the page on focus. A global `@media (pointer: coarse)` rule in `index.css` enforces this; don't fight it with `!important` font sizes.
4. **Guard browser APIs iOS lacks.** `Notification` only exists in the installed home-screen app (iOS 16.4+) — always `typeof Notification !== 'undefined'` / `'Notification' in window`. An unguarded `Notification.permission` crashes the whole React tree (black screen). Element fullscreen doesn't exist on iPhone: call `el.requestFullscreen?.()` and make the feature work without it.
5. **Audio must start inside the tap handler** (`el.play()` synchronously in `onClick`), not in a `useEffect`. Web Audio contexts need `.resume()` in a gesture first (see `FloatingPomodoro.jsx`). Safari can't play the `.ogg` ambient sounds; failure falls back to muted.
6. **Timers:** iOS suspends backgrounded pages. Count down against an end timestamp (`endAt - Date.now()`), never by decrementing state each second.
7. **No hover-only UI** (Tailwind `hoverOnlyWhenSupported` is on). No drag-only UI.
8. **Don't stack many `backdrop-blur` layers.** The whole UI is liquid glass over a fixed scene, so every blurred panel re-composites while scrolling. One glass layer per region (a list gets a glass container, not glass per row); never blur inside blur.
9. **Persist often.** iOS may kill the home-screen app at any time: save drafts (notes, quote) on change, not on close.

## Home-screen shortcuts

`/dashboard?action=new-task`, `/dashboard?action=assistant`, `/dashboard?tab=schedule|analytics`. `DashboardPage` reads these once as initial state, then clears the query string. Add new shortcuts in both the manifest and that initial-state block.

## Regenerating icons

After editing `public/favicon.svg` (keep its structure: one full-size `rx="116"` rect, one inner rect, one check path — the script string-replaces them for the maskable/apple variants):

```bash
# in a scratch dir with playwright-core installed (uses the system Edge, no browser download)
npm i playwright-core
node <repo>/.claude/skills/tugasku-ios-pwa/render-icons.mjs <repo>/public/icons <repo>/public/favicon.svg
```

`apple-touch-icon.png` is square with no transparency on purpose (iOS masks corners itself and renders transparency as black).

## Testing

Chromium with an iPhone viewport + `isMobile/hasTouch` (see `run-tugasku`) catches layout, but not WebKit-only gaps like #4 and #5. When in doubt about an API, check that it exists on iOS Safari before using it and guard it anyway.
