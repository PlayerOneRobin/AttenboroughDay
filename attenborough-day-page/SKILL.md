---
name: attenborough-day-page
description: Understand, explain, restyle, and modify the International Attenborough Day landing page in this workspace. Use when Codex needs to work on the page structure, documentary-style scrolling, hero media, full-screen scene sections, sharing behavior, counters, or the relationship between index.html, styles.css, and script.js.
---

# Attenborough Day Page

## Overview

Use this skill to work on the single-page International Attenborough Day site in this workspace.
Read it before explaining how the page works, changing the cinematic layout, replacing hero media, or debugging scene/video behavior.

## Workflow

1. Read [references/page-architecture.md](references/page-architecture.md) for the current structure and behavior map.
2. Open only the relevant file for the requested change:
   `index.html` for content and section order,
   `styles.css` for layout, video framing, overlays, and responsive behavior,
   `script.js` for lazy-loading, scene activation, counters, and share actions.
3. Preserve the documentary-scroll structure unless the user explicitly asks to remove it.
4. Treat the hero differently from the scene sections:
   the hero may use YouTube plus a local/file fallback,
   the scene sections use deferred MP4 backgrounds.
5. Keep edits visually intentional:
   large type, sparse copy, strong overlays, cinematic full-screen sections, and calm motion.

## Change Rules

- Keep scene sections full-height unless the user explicitly asks for shorter panels.
- Preserve readability over video by keeping overlays or equivalent contrast treatment.
- If the page is previewed from `file://`, expect the hero to fall back away from YouTube.
- When changing remote video sources, prefer sources that can autoplay muted and loop cleanly.
- Keep text edits concise and high-signal; the page works best with short copy blocks.

## Common Tasks

- Replace hero media:
  update the hero block in `index.html` and the hero-specific framing rules in `styles.css`.
- Add or remove story chapters:
  update the scene section markup, the chapter rail, and any scene activation assumptions in `script.js`.
- Restyle the page:
  start in `styles.css`; keep the HTML structure stable unless the requested design requires a content rewrite.
- Debug scroll or video behavior:
  inspect `script.js` first, then confirm the relevant selectors still match the markup.

## References

- Read [references/page-architecture.md](references/page-architecture.md) for the page map, section inventory, media strategy, and file responsibilities.
