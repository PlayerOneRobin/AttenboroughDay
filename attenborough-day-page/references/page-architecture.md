# Page Architecture

## Files

- `index.html`: Defines the full single-page structure, hero media container, chapter rail, full-screen scene sections, practical content sections, and footer.
- `styles.css`: Owns the visual system, hero and scene framing, overlays, typography, section sizing, chapter rail styling, and responsive behavior.
- `script.js`: Handles share buttons, animated counters, scene-link activation, deferred scene-video loading, and local-file hero fallback behavior.

## Section Order

1. Fixed header
2. Fixed chapter rail
3. Hero
4. Manifesto
5. Forest scene
6. Ocean scene
7. Wildlife scene
8. Planet scene
9. How to celebrate
10. Global participation
11. Share the movement
12. Footer

## Hero Strategy

- The hero is special-case media.
- On hosted pages, the hero can use a YouTube iframe background.
- On `file://` previews, `script.js` adds a body class so CSS hides the iframe and shows the MP4 fallback instead.
- Hero framing lives in the `.hero-video-shell`, `.hero-youtube`, and `.hero-fallback-video` rules.

## Scene Strategy

- Each story chapter is a full-screen `.scene` section.
- Scene videos use `<video class="scene-video deferred-video">` with `source[data-src]`.
- `script.js` loads those video URLs only when sections approach the viewport.
- If a scene video changes, update the `data-src` in `index.html`; the lazy-load logic should not need changes unless markup changes.

## Scroll Behavior

- The page uses `scroll-snap-type: y proximity` on desktop for a documentary feel.
- The fixed chapter rail links to each scene and highlights the active scene via `data-scene` and `data-scene-link`.
- Mobile disables scroll snap for a looser, easier scroll.

## Styling Principles

- Keep dark, cinematic full-screen story sections.
- Keep practical sections lighter so the page has visual breathing room after the film-like sequence.
- Keep headings large and sparse; the page relies on atmosphere more than dense copy.
- Maintain strong contrast overlays over moving backgrounds.

## JavaScript Responsibilities

- Share buttons:
  open X/Twitter, Reddit, and Facebook share URLs; copy the page URL to clipboard.
- Counters:
  animate once when the counter cards enter view.
- Scene activation:
  update the chapter rail active state based on the visible `.scene`.
- Deferred videos:
  swap `source[data-src]` into `src`, call `load()`, then attempt `play()`.
- Local fallback:
  detect `window.location.protocol === "file:"` and add `body.hero-file-fallback`.

## Safe Edit Patterns

- Change copy or section order:
  edit `index.html`.
- Change framing, spacing, or mood:
  edit `styles.css`.
- Change behavior:
  edit `script.js`.
- Change selectors:
  update both markup and JS together so observers and active-state logic keep working.
