# CONCERNS — caboodle-site

Technical debt, bugs, fragile areas, dead code, accessibility gaps, and performance
issues found while mapping the codebase.

_Last reviewed: 2026-05-16_

---

## 1. Dead code

### 1.1 WORK PEEK IIFE is fully dead — `script.js:526-696`

`script.js` contains a large IIFE labeled `WORK PEEK — live-scrolling case study
preview` (header comment at `script.js:526-531`, IIFE body starting `script.js:532`).

It immediately queries four element IDs / one class:

- `peekFrame`   — `script.js:533`
- `peekUrl`     — `script.js:534`
- `peekNav`     — `script.js:535`
- `.peek__viewport` — `script.js:536`
- `workPeek`    — `script.js:537`

A grep across every HTML file in the repo (`index.html`, `about.html`,
`approach.html`, `work.html`, `work-preview.html`, `labs.html`, `resources.html`,
`contact*.html`, `field-notes.html`, all of `work/*.html`, all of `labs/*.html`)
finds **zero** occurrences of `peekFrame` or `workPeek`. No element with those IDs
exists anywhere.

The IIFE has an early-return guard at `script.js:539`
(`if (!frame || !viewport || !wrapper) return;`), so it bails out harmlessly at
runtime — but the entire block (roughly `script.js:526` through the close of the
IIFE near line 696, including the `PAGES` array, scaling, rAF scroll tick, nav
dots, and `switchTo`) is unreachable code shipped to every visitor on every page.

This appears to be a superseded earlier version of the homepage preview feature.
The live feature is the per-card `dossier--withpreview` iframe logic
(`script.js:381-524`), which uses different element classes
(`.dossier__preview-iframe`, `.dossier__preview-viewport`) that **do** exist in
`index.html` (e.g. `index.html:168`, `:203`, `:238`, `:273`, `:308`).

**Recommendation:** delete the WORK PEEK IIFE (`script.js:526` to its closing
`})();`). Removes ~170 lines of dead JS and any associated `.peek__*` CSS rules in
`styles.css` if present.

---

## 2. Performance — `script.js` runs inside preview iframes

The homepage (`index.html`) embeds six case-study pages inside lazy-loaded
preview iframes — `index.html:168` (peoples-professors), `:203` (gitlab),
`:238` (intuit), `:273` (apple), `:308` (tmobile), and the trust20 card around
`:339`.

Each of those embedded pages (`work/apple.html:1561`, `work/gitlab.html:966`,
etc.) loads the **same full `script.js`** via `<script src="../script.js?v=20260516" defer>`.

Consequence: `script.js` is parsed and executed a **second time inside every
preview iframe**. The 59 KB file (`script.js`, 1421 lines, 7 IIFEs) runs in each
iframe context — comet cursor, touch ripple, nav toggle, field-log scroll
listeners, reveal-on-scroll observers, and the dossier-preview iframe code all
boot up inside a frame where most of their target elements either do not exist
or are not user-visible.

Specific waste:

- `approach.html` similarly embeds two ~1.8 MB pages (`engagement-arc.html` at
  `approach.html:106`, `fig-02-ladder.html` at `approach.html:217`) via iframe
  `data-src`. `engagement-arc.html` is 1,889,761 bytes and `fig-02-ladder.html`
  is 1,884,000 bytes — both single-file animated canvases. They are referenced
  only from `approach.html`. If they also pull in `script.js`, the same
  double-execution applies; either way these two files are the heaviest assets
  in the repo and load inside iframes.
- The comet-cursor IIFE (`script.js:1280`) appends `#cursorDot` + 16
  `.cursor-trail` divs to `document.body`. Inside a preview iframe it adds 17
  DOM nodes and a `mousemove`-driven rAF loop per iframe. Its only guard against
  duplication is `if (document.getElementById('cursorDot')) return;`
  (`script.js:1286`) — that dedupes within a single document, not across the
  parent + N iframes, so each iframe still spawns its own comet.

**Recommendation:** the case-study pages do not need `script.js` when rendered
as a preview. Options: (a) a top-level guard `if (window.self !== window.top) return;`
near the start of `script.js` to no-op inside any iframe; or (b) drop the
`<script>` tag from `work/*.html` if those pages have no standalone behavior;
or (c) split a small `case-study.js` for the few behaviors those pages truly
need standalone. Option (a) is the lowest-risk single change.

---

## 3. Maintainability — oversized single files

- `styles.css` — **7,297 lines / ~188 KB**. One monolithic stylesheet for the
  entire multi-page site (homepage dossiers, work pages, labs, resources,
  contact, field guide panel, comet cursor, carousels). No partials, no build
  step. Editing one section risks specificity collisions elsewhere; there is no
  way to scope or tree-shake per-page CSS.
- `script.js` — **1,421 lines / ~59 KB**, 7 IIFEs in one file (nav, field log,
  dossier previews, dead WORK PEEK, labs stage, comet cursor, touch ripple).
  Every page downloads all of it even though, e.g., the dossier-preview and
  field-log code only matter on `index.html`, and the labs-stage code only
  matters on `labs.html`.

Both files are loaded with `Cache-Control: public, max-age=0, must-revalidate`
(`_headers`), so every page load revalidates them. They are large enough that
splitting per-page bundles (or at least gating IIFEs behind a
`document.querySelector` presence check before doing any work) would meaningfully
reduce parse cost — especially given the iframe double-execution in section 2.

**Recommendation:** at minimum, ensure every IIFE early-returns when its anchor
element is absent (most already do — nav, field log, dossier, labs all guard;
the comet/ripple are global by design). Longer term, consider per-page script
splitting or a simple concatenation build so iframe-embedded pages can omit
homepage-only logic.

---

## 4. Accessibility gaps

### 4.1 No global focus-visible style; form inputs strip the outline

`styles.css` has **no global `:focus` or `:focus-visible` rule**. The only
focus-related rules are:

- `.fieldlog:focus-within` decorative states (`styles.css:182`, `:204`, `:230`, `:248`)
- `.subscribe__form input:focus { border-color: var(--lime); }` (`styles.css:3864`)
- `.intake__row input:focus, .intake__row textarea:focus` (`styles.css:5516-5517`)
- `.carousel:focus-visible .carousel__frame` (`styles.css:6064`)

Meanwhile four rules set `outline: none` outright:

- `.subscribe__form input` — `styles.css:3860`
- `.intake__row input / textarea` — `styles.css:5509`
- `.carousel` — `styles.css:6062`
- `.guide-panel__input` — `styles.css:7204`

The subscribe and intake inputs replace the outline with only a border-color
shift to `--lime` (`#96E650`) on `--paper` (`#f2efe8`) — a very low-contrast
indicator (see 4.3) and easy to miss. `.guide-panel__input` strips the outline
with no replacement focus style at all.

Critically, **links and buttons** (nav links, dossier cards, CTAs, carousel
controls, field-guide buttons) have no explicit focus style, so keyboard users
rely entirely on the browser default outline. That default outline is then
**suppressed by the comet-cursor rule** (see 4.2) which sets
`cursor: none !important` — that only hides the cursor, not focus rings, but the
combination of no custom focus style + a hidden mouse cursor makes the site hard
to operate non-visually.

**Recommendation:** add a single global
`:focus-visible { outline: 2px solid var(--magenta); outline-offset: 2px; }`
rule and give the four `outline: none` inputs a real `:focus-visible` treatment.

### 4.2 Comet cursor hides the native cursor site-wide

`styles.css:7239-7242`:

```
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  *, *::before, *::after { cursor: none !important; }
  input, textarea, select { cursor: text !important; }
}
```

On every pointer device that has not opted into reduced motion, the **native
cursor is removed entirely** and replaced by the JS-drawn comet
(`#cursorDot` + 16 `.cursor-trail` dots, `script.js:1280-1399`).

Risks:

- If `script.js` fails to load, errors before the comet IIFE runs, is blocked,
  or runs late, the user is left with **no cursor at all** on interactive pages.
  The reduced-motion gate in the media query is the only fallback, and it only
  helps reduced-motion users.
- The comet does not change shape over interactive vs. text vs. disabled
  elements (only `input/textarea/select` get `cursor: text`), so the normal
  affordance of a pointer cursor over links/buttons is lost. Users cannot tell
  what is clickable from cursor shape.
- Inside preview iframes the comet runs again (section 2.2), so a fast pointer
  over the homepage can momentarily render multiple comet chains.
- Comet trail dots are `z-index: 9999/9998` (`styles.css:7252`, `:7267`) and
  `position: fixed` — they sit above all content; `pointer-events: none` is set
  so they do not block clicks, which is correct, but verify no modal/overlay
  needs to sit above them.

The reduced-motion handling itself is **correct**: the comet IIFE bails at
`script.js:1285` for reduced-motion users, and the CSS gate ensures those users
keep the native cursor. The concern is purely the no-fallback-if-JS-fails case
and the loss of cursor-shape affordance.

**Recommendation:** consider keeping the native cursor visible (drop the
`cursor: none` rule, or scope it tightly) and letting the comet be purely
additive, so a JS failure never strands the user without a cursor.

### 4.3 Color-contrast risks — lime text and muted text on paper

`color: var(--lime)` (`#96E650`) is used as a text/accent color in ~170 places
in `styles.css` (e.g. emphasis text `styles.css:150-151`, `.nav__cta` text
`:260`). Lime `#96E650` on the `--paper` background `#f2efe8` is well **below**
the WCAG AA 4.5:1 threshold for body text — lime is a near-white-luminance green.
Anywhere lime is used for readable text on a light background it will fail
contrast. It is fine on dark backgrounds (`--ink` `#282828`), e.g. `.dark em`,
`.closing em`.

Also check `--ink-2` (`#686868`, mid-gray) used for secondary/muted text on
`--paper` (`#f2efe8`): `#686868` on `#f2efe8` is roughly 4.5:1 — borderline,
and below AA for small text in some renderings.

`::selection { background: var(--lime); color: var(--ink); }` (`styles.css:137`)
is fine (`#282828` on `#96E650` passes).

**Recommendation:** audit every `color: var(--lime)` on a light background with
a contrast checker; reserve lime for large display type, dark backgrounds, or
non-text accents. Confirm `--ink-2` body usage meets AA or bump it darker.

---

## 5. Cache-busting `?v=` params require manual bumping

`script.js` and `styles.css` are loaded with a hand-maintained query string
that must be updated by hand on every page whenever those files change. Two
distinct version strings are currently in use:

- `?v=20260516` — on the `script.js` / `styles.css` tags:
  `index.html:913`, `about.html:553`, `approach.html:464`, `contact.html:217`,
  `field-notes.html:224`, `labs.html:374`, `resources.html:318`,
  `work.html:339`, `labs/microlearning.html:456`, `work/gitlab.html:966`,
  `work/apple.html:1561`, `work/trust20.html:435`, plus every other
  `work/*.html` and `labs/*.html` page.
- `?v=44iFHmeQ10o` — a different param on a separate asset:
  `about.html:301` and `index.html:780` (likely a font or image).

Concerns:

- The `?v=` value must be bumped **manually in every HTML file** on each CSS/JS
  edit. With 20+ HTML files, it is easy to update some pages and miss others —
  leaving visitors on stale assets per-page. A repo-wide find/replace is the de
  facto release step and is undocumented.
- This is partly belt-and-suspenders: `_headers` already sets
  `Cache-Control: max-age=0, must-revalidate` for `/script.js` and `/styles.css`,
  which forces revalidation anyway. So the `?v=` param is redundant for those
  two files given current headers — but if headers ever change, the manual
  param becomes load-bearing again. The mismatch in versioning strategy (date
  string vs. hash) suggests no single convention.

**Recommendation:** pick one approach. Either (a) rely on the `max-age=0`
headers and drop the `?v=` from script/style tags, or (b) keep `?v=` and
automate the bump (a one-line script that rewrites all HTML on build/deploy).
Document whichever is chosen so releases are repeatable.

---

## 6. Other notes / smaller fragilities

- **Iframe-injected DOM with hardcoded design width.** Both the dossier-preview
  logic (`IFRAME_W = 1440`, `script.js:387`) and the labs-stage logic
  (`script.js:751-760`) scale embedded pages from a fixed 1440px design width
  via `transform: scale()`. If a case-study page is later redesigned at a
  different width, previews will mis-scale silently. The scaling also reads
  `iframe.contentDocument` (`script.js:789`, `:844`) — this works only because
  the iframes are same-origin; any move to a CDN subdomain or cross-origin
  hosting would break preview height measurement with a security exception.
- **`fieldlog` aside is `aria-hidden="true"` on case-study pages**
  (`work/apple.html:976`, `work/gitlab.html:432`) yet `script.js:22-23` still
  queries `.fieldlog` / `#logEntries` and attaches scroll listeners. Confirm
  this is intentional decorative-only behavior and that the scroll listener
  does no measurable work on those pages.
- **No `TODO` / `FIXME` markers** were found in the maintained text files
  (`*.html`, `script.js`, `styles.css`, `work/*`, `labs/*`). Clean on that
  front. (A repo-wide grep produced hits, but only inside the two ~1.8 MB
  base64-heavy files `engagement-arc.html` / `fig-02-ladder.html` — false
  positives from encoded binary data, not real annotations.)
- **Two ~1.8 MB single-file HTML artifacts** (`engagement-arc.html`,
  `fig-02-ladder.html`) sit in the repo root and are embedded only by
  `approach.html`. They are the heaviest things the site can serve. They are
  cache-friendly (rarely change) but worth confirming they are not also pulling
  `script.js` and are gated behind lazy `data-src` loading (they are — see
  `approach.html:106`, `:217`).
- **Worktree duplication.** `.claude/worktrees/serene-hodgkin-099d5b/` contains
  a full second copy of the entire site (every HTML/JS/CSS file). This is a Git
  worktree, not shipped, but it doubles grep noise and repo size on disk. Not a
  production concern; flagging so future audits exclude that path.
