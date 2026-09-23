---
name: tugasku-design
description: Design system and UI conventions for the Tugasku app (React + Tailwind) — the scenic background, liquid-glass surfaces, ink/leaf palette, and type rules. Use before building or restyling any screen, component, dialog, card, or chart in this repo so new UI matches the existing look in day and night mode and on phones.
---

# Tugasku design system — "clear sky"

A landscape sits **fixed behind every page**; the UI floats on top as **liquid glass**. Light theme = day scene, dark theme = night scene (same place). Palette is ink + leaf green; type is Inter with a JetBrains Mono label style and a Newsreader italic accent. Every screen must work at 390px wide and in both themes.

## The background

Two fixed, full-viewport layers behind everything (`src/index.css`):

- `body::before` paints `var(--scene)` — a **landscape photo**, `cover`, centred.
- `body::after` paints the **scrim**, a vertical wash in `--background` (`--scrim-top/mid/bottom`) that keeps text readable over a busy photo. Tune those vars rather than dimming the image itself.

Pages must stay transparent — **never put `bg-background` on a page wrapper**, or the scene disappears.

Four files in `public/backgrounds/` (Pexels photos, see `CREDITS.md`): day/night × wide/tall. The tall crops are swapped in by an `@media (orientation: portrait)` block so phones keep sky at the top instead of a sideways crop.

To change the photos: put new source images in a scratch dir and run

```bash
node .claude/skills/tugasku-design/make-scene-photos.mjs public/backgrounds
```

(edit the `JOBS` table for source paths, crop focus, quality and pre-blur; aim for ~400–600 KB each). Run it with `--inspect <dir>` and look at the 1:1 sky crops before shipping: **dark night skies are the hard case** — under ~q0.78 they band and look low-res, and their sensor grain inflates the file, so night shots get a higher quality plus a 0.3px pre-blur while daylight shots get neither. Resolution matters too: a 3× phone needs ~1240px of width in the tall crop, or the photo looks soft. If the scene file names change, update `index.html`'s preload links and `SHELL_URLS` in `public/sw.js`. `generate-scene.mjs` in this folder still produces the older illustrated SVG version if a flat-vector look is ever wanted back.

**Text directly on the photo needs help.** Large headings are fine; anything smaller sits on glass, in a `glass-chrome` chip, or over a local scrim (see the hero wash in `LandingPage.jsx`).

## Tokens (src/index.css, tailwind.config.js)

| Token | Use |
|---|---|
| `foreground` / `background` | ink text; also the **primary button** fill (`.lg-ink` = ink in day, near-white at night) |
| `muted-foreground` | secondary text |
| `primary` (leaf green) | active state, links, accents, chart bars, status dots |
| `leaf` | **large display text only** (headline accent word); too light for body copy |
| `hairline` | translucent borders/fills that work in both themes: `border-hairline/10`, `bg-hairline/5`. Never `border-white/*` or `bg-white/*` for neutral chrome |
| `card` | solid fills for text-dense pieces over glass (task cards, inputs: `bg-card/70…/90`) |
| `success` / `warning` / `destructive` | done / belum submit & due today / overdue & delete |

`dark:` works and means night mode (`darkMode: ['variant', '&:not(.light *)']`). Use it for raw Tailwind palette colors, which need different shades per theme: `text-red-600 dark:text-red-400`. Theme tokens adapt on their own — don't add `dark:` to them.

## Liquid glass

Four classes, all with a specular rim (`::before` gradient border) and a top sheen:

| Class | What it's for |
|---|---|
| `.surface` | **regular** glass — content panels: stat tiles, toolbars, board columns, sidebar, dialogs' cousins. Readable: muted text keeps ≥ 4.5:1 even over the pine trees |
| `.glass-chrome` (alias `.glass`) | **clear** glass — floating controls: tab bar, header pills, dock buttons, segmented controls |
| `.surface-solid` | near-opaque glass for very dense text |
| `.lg-ink` | glossy ink button (primary CTA, FAB, send button) |
| `.lg-rim` | rim light only, for elements that bring their own fill (`bg-card/80` + `lg-rim`) |

Rules:
- Glass needs something behind it. Text sitting **directly** on the scene must be large or bold; small/muted text belongs on a surface. A loose caption over the meadow or trees is unreadable — wrap it in a `glass-chrome` chip.
- Don't nest blur inside blur. Cards inside a `.surface` column use plain `bg-card/85` (+ `lg-rim`), no backdrop filter. On phones the board wraps the card list in **one** `.surface` instead of blurring each card — cheaper on iPhone.
- A `.surface` containing a dropdown needs `relative z-20` (backdrop-filter creates a stacking context).
- Alphas and the backdrop `brightness()` lift are tuned in the theme blocks; change them there, not per component.

## Shape & type

- Radius: floating panels `rounded-[26px]`/`[28px]`, tiles & cards `rounded-2xl`, controls and pills `rounded-full`, inputs `rounded-xl`. Liquid glass wants generous corners.
- Font: Inter (variable, capped at 700 so `font-black` renders as bold). Headings `font-semibold tracking-[-0.03em]`; big display `tracking-[-0.04em]`.
- `.eyebrow` = the mono label style (11px, uppercase, wide tracking, muted) used for section labels, stat labels, dates, column headers. Often prefixed with a green dot: `<span className="w-1.5 h-1.5 rounded-full bg-primary" />`.
- `.badge-section` = the same style centered for hero eyebrows.
- `font-serif italic` (Newsreader) is the quote/testimonial voice — use sparingly.
- Numbers: `tabular-nums`.

## Status & priority (keep consistent everywhere)

| Status | Label | Color |
|---|---|---|
| `todo` | Perlu Dikerjakan / Dikerjakan | primary |
| `finished` | Belum Submit | warning |
| `done` | Selesai | success |

Priority styles live in `src/lib/constants.js` (`priorityConfig`): High red, Medium amber, Low blue. Reuse them. Status/priority always ship with a text label, never color alone.

## Layout patterns

- Page shell: `h-app` (100dvh with vh fallback). `Sidebar` (floating `.surface` panel) from `md` up; `MobileNav` below `md` is a **floating capsule** tab bar plus a separate round `.lg-ink` add button. Scroll happens inside `<main>`, which needs `pb-nav md:pb-10`.
- Headers get `pt-safe`; bottom-pinned things `pb-safe` or `bottom-nav-offset` (see tugasku-ios-pwa).
- Dialogs (`@/components/ui/dialog`) are a **bottom sheet on phones**, centered modal from `sm`. Pass `sm:rounded-[…]`, never a bare `rounded-[…]`.
- Kanban: desktop (`lg`) = drag-and-drop columns; smaller = capsule status tabs + one-tap status button per card. Anything drag-only needs a tap path.
- Floating tools: desktop `ToolDock` (bottom-right); phones reach them from the "Lainnya" sheet.

## Interaction

- Tailwind `hoverOnlyWhenSupported` is on: `hover:` never fires on touch, so never hide a control behind hover without a touch fallback — pattern: `[@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover:opacity-100`.
- Touch targets ≥ 40px; primary actions ≥ 44px.
- Copy is Indonesian, casual-polite ("kamu", "Tugas Baru", "Simpan"). Dates via date-fns with `locale: id`; local dates via `format(new Date(), 'yyyy-MM-dd')` — never `toISOString().split('T')[0]` (UTC; yesterday before 07:00 WIB).

## Charts

Load the `dataviz` skill first. Precedent: `src/components/insights/WorkloadChart.jsx` — single series in `bg-primary`, bars ≤24px with 4px rounded tops, hairline baseline, tap/hover readout instead of a number on every bar, `sr-only` table. Real data only; never ship placeholder numbers.

## Checklist before calling UI done

1. Screenshot at 390×844 and 1440×900 (see `run-tugasku`), **day and night**.
2. No horizontal scroll on mobile (`document.documentElement.scrollWidth <= innerWidth`).
3. No small text floating directly on the scene; nothing unreadable over the dark pines.
4. Every hover-only affordance has a touch path; every drag has a tap path.
5. Nothing hides under the tab bar, home indicator, or notch.
