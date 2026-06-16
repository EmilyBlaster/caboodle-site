# Architecture — caboodle-site

_Last mapped: 2026-05-16_

## Pattern: multi-page static site, no build step

`caboodle-site` is a hand-authored static HTML/CSS/JS marketing site. There is
no framework, no bundler, no component system. Each page is a standalone
`.html` file that links the same two shared assets:

- `styles.css` — one ~7,300-line stylesheet loaded on every page
- `script.js` — one ~1,420-line behavior file loaded on every page

Netlify (`netlify.toml`) deploys the repo root as-is (`publish = "."`),
minifying CSS/JS/HTML and compressing images at deploy time. There is no
local build — `serve.sh` just runs a static dev server.

## Entry points & wiring

Every page `<head>` follows the same pattern (see `index.html`, `about.html`):

1. Google Analytics (`gtag.js`, `G-404B8P6ZLK`)
2. `preconnect` to Google Fonts, then DM Sans + JetBrains Mono import
3. `<link rel="stylesheet" href="styles.css">`
4. `assets/favicon.svg`
5. At end of `<body>`: `<script src="script.js?v=20260516" defer></script>`

The `?v=` query string is a manual cache-buster. `_headers` sets `script.js`
and `styles.css` to `max-age=0, must-revalidate` so edits go live immediately;
`/fonts/*` and `/assets/*` are cached one year as `immutable`.

## Self-injecting IIFE pattern (the core idea)

`script.js` is a flat sequence of IIFEs (immediately-invoked function
expressions). It runs once on every page, so each feature is **defensive**:
it first checks whether its target element/condition exists, and if a feature
needs DOM that isn't in the page's hardcoded HTML, **the IIFE injects that DOM
itself**. This means a single script file works across ~30 pages without any
per-page configuration.

Clearest example — the field guide bot (`script.js` ~909):
```
if (!document.getElementById('guideTrigger')) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<button class="guide-btn" ...>...';
  document.body.appendChild(wrap);
}
```
`index.html` has the widget hardcoded; every other page gets it injected at
runtime. The mobile nav hamburger uses the same trick (`script.js` ~37): the
button is created in JS so page HTML never has to change.

## Major IIFEs / features in `script.js`

| Lines  | Feature          | What it does |
|--------|------------------|--------------|
| 20–377 | Nav + field log  | Sticky nav scroll state, injected mobile hamburger, time ticker, scroll-revealed "field log" panel, reveal-on-scroll typography, link prefetch on hover |
| 385–524| Dossier previews | Per-card mini-browser iframes on the homepage; lazy-loaded via `IntersectionObserver`, each auto-scrolls its own case study page |
| 532–706| Work peek        | One shared live-scrolling case study preview iframe (same-origin, controlled via `contentWindow`) |
| 715–901| Labs stage       | Hover-to-switch shared preview above the labs grid; crossfades between experiments on `.lab[data-lab-src]` hover |
| 909–1273| Field guide bot | Rule-based chip-navigation Q&A widget; self-injects markup; responses live in a local `NODES` graph, no backend |
| 1280–1399| Comet cursor   | Lime→magenta trailing-dot cursor; desktop only (`hover: hover`), respects reduced-motion |
| 1405–1421| Touch ripple   | Expanding lime circle on touch; touch devices only (mutually exclusive with comet) |

## Data flow

There is no shared state or data layer. Each IIFE owns its own closure-scoped
state. Static content lives directly in the HTML; the field guide bot's
"knowledge base" is a hardcoded `NODES` object inside its IIFE. The only data
file is `data/tiktok-posts.json`, populated by `scripts/fetch-thumbnail.py`
(a standalone utility, not part of the runtime).

## iframe-preview transform technique

The preview features (dossier, work peek, labs stage) all show a real page
auto-scrolling inside a small viewport. Rather than calling `scrollTo()` on the
iframe — which fights the iframe's own `scroll-behavior: smooth` — the iframe
is sized to a fixed 1440px design width and moved with a single CSS transform:

```
frame.style.transform = `scale(${scale}) translateY(${-scrollY}px)`;
```

`scale` shrinks the 1440px page to fit the viewport; `translateY` advances the
scroll position. `findArtifactOffset()` walks the `offsetParent` chain inside
the iframe document to start scrolling at a meaningful section (e.g. the
interactive demo) rather than page top. Previews are skipped on small screens
and lazy-loaded so iframes are only fetched when on screen.

## Conventions

- Plain ES (no modules), wrapped in IIFEs, `'use strict'` where added later
- View transitions: `history.scrollRestoration = 'manual'` + `pagereveal`
  listener force every navigation to start at the top
- Performance: scroll handlers throttled through a single `requestAnimationFrame`
  gate; layout reads (`getBoundingClientRect`/`offsetTop`) cached, not re-run
- All motion features check `prefers-reduced-motion` / pointer capability
