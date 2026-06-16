# TESTING.md — caboodle-site

_Last updated: 2026-05-16_

Honest status: **there is no automated test suite.** This is a hand-authored,
vibe-coded static HTML/CSS/JS marketing site with no framework and no build
step. QA is done by previewing the site locally and clicking through it in a
browser. This document records the workflow that actually exists so it can be
followed consistently — and flags what is missing.

---

## 1. What does NOT exist

- No unit tests, no integration tests, no end-to-end tests.
- No test runner, no `package.json`, no `npm test` script — there are no npm
  dependencies at all.
- No linter or formatter config (no ESLint, Prettier, Stylelint).
- No CI test pipeline. Netlify runs a deploy, not a test stage.
- No accessibility or performance scan automated into the workflow.

Treat any "tests pass" expectation as **manual browser QA**, not a green check.

---

## 2. Local preview workflow (the de facto dev loop)

The site is static, so "running it" means serving the repo root over HTTP and
opening it in a browser. Two equivalent entry points exist:

### Option A — `serve.sh` (the documented script)

`serve.sh` at the repo root is the intended dev server. Run it once at the
start of a session:

```bash
./serve.sh
```

Behavior:
- Prefers `npx --yes live-server --port=8080 --no-browser --wait=200` if Node
  is installed — this gives **auto-reload on save**: edit any HTML/CSS/JS, hit
  save, the browser refreshes itself.
- Falls back to `python3 -m http.server 8080` if Node is absent — works, but
  **no auto-reload** (refresh the browser manually after each save).
- Errors out with install hints if neither Node nor Python 3 is available.
- Stop with `Ctrl+C`.

### Option B — editor launch config (`.claude/launch.json`)

`.claude/launch.json` defines a `caboodle-site` launch configuration that runs
`npx serve .` on port `4322` (`autoPort: true`). This is the one-click preview
used from the editor / Claude Code. It serves static files only — no
auto-reload from `serve` itself.

> Note: `.claude/` is gitignored, so `launch.json` is local-only. `serve.sh` is
> the committed, canonical entry point.

Both options just serve the repo root as static files — exactly what Netlify
does in production (`netlify.toml` -> `publish = "."`).

---

## 3. Manual QA checklist (do this before pushing to `main`)

Because pushing to `main` triggers a paid Netlify deploy, manual QA happens
**before** the push. Suggested pass on a local preview:

- **Visual / layout** — load each changed page; check it against the brand
  (warm `--paper` background, Bauhaus Bool headings, DM Sans body). Watch for
  AI-slop tells the project explicitly rejects (see `PRODUCT.md`
  anti-references): default Inter, purple gradients, glassmorphism, identical
  icon+heading+text card grids.
- **Responsive** — resize the browser. The mobile nav hamburger is JS-injected
  and toggles below the 760px breakpoint; confirm it opens, closes on link
  click / Escape / resize, and locks body scroll.
- **Behavior** — exercise interactive components on the changed page: the
  scroll-driven `.fieldlog` sidebar, reveal-on-scroll animations, the
  `.dfcarousel` design-file carousels (prev/next, dots, Arrow keys), any
  embedded demos.
- **Cross-page nav** — click between pages; View Transitions and hover-prefetch
  should feel seamless. Confirm scroll resets to top on navigation.
- **Console** — open DevTools; there should be no JS errors. `script.js` runs
  on every page and is null-guarded, so a missing component must no-op
  silently rather than throw.
- **Reduced motion** — optionally toggle `prefers-reduced-motion` and confirm
  animations degrade gracefully.
- **Links / assets** — check new images, videos, fonts, and `assets/` demos
  actually load (paths are relative to the repo root).

---

## 4. Deploy-time safety nets (not tests, but the closest thing to a gate)

- **`.githooks/pre-push`** — a manual pre-push hook that guards the `main`
  branch. Before any push to `main` it prints the commits about to deploy and
  prompts `Deploy now? (y/N)`; answering anything but `y` cancels the push.
  Its purpose is Netlify credit control, not correctness — but it is the one
  enforced human checkpoint between local work and production. Add
  `[skip netlify]` to a commit message to push without triggering a deploy;
  bypass the hook entirely with `git push --no-verify`.
  - This hook lives in `.githooks/` and must be wired up with
    `git config core.hooksPath .githooks` for it to run.
- **Netlify deploy previews** — Netlify builds and serves the site on deploy.
  Netlify also minifies CSS/JS/HTML and compresses images at deploy time
  (`netlify.toml [build.processing]`). Visually checking the deployed preview
  URL is the final QA step before considering a change live.
- **`_headers`** — security and cache-control headers are validated only by
  observing the live site (e.g. checking response headers in DevTools).

---

## 5. If automated testing is added later

This site does not need a heavy test stack, but if regression coverage becomes
worthwhile, the lowest-friction additions would be:

- A link checker (e.g. `lychee` or `linkinator`) run against the local server
  to catch broken internal links and missing assets.
- HTML validation (`html-validate` or the W3C validator) on the page files.
- A Lighthouse / `pa11y` pass for performance and accessibility budgets.
- Optionally a Playwright smoke test that loads each page and asserts zero
  console errors and that key components mount.

Until then, **manual browser QA on a local preview is the testing process** —
do it deliberately, especially before pushing to `main`.
