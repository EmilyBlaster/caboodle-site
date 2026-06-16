# CONVENTIONS.md — caboodle-site

_Last updated: 2026-05-16_

Code style and patterns for the caboodle design marketing site. This is a
hand-authored static HTML/CSS/JS site (no framework, no build step) deployed
on Netlify. Conventions below are descriptive of what already exists in the
repo — follow them so new work stays consistent.

---

## 1. Project shape

- **No framework, no build step.** The repo root is published as-is by Netlify
  (`netlify.toml` -> `publish = "."`). There is no `package.json`, no bundler,
  no transpilation. Author plain HTML, CSS, and JS.
- **Three shared global files** drive the whole site:
  - `styles.css` (~7,300 lines) — every page's styles in one file.
  - `script.js` (~1,420 lines) — every page's behavior in one file.
  - Each `.html` page is standalone and links both globals.
- **One page = one HTML file.** Top-level pages live in the repo root
  (`index.html`, `about.html`, `approach.html`, `work.html`, `labs.html`,
  `contact.html`, etc.). Case-study and lab sub-pages live in `work/` and
  `labs/`. Standalone interactive demos (large self-contained HTML with inline
  CSS/JS) live in `assets/` (e.g. `assets/3d/fire-extinguisher.html`,
  `engagement-arc.html`).

---

## 2. CSS design tokens (`:root` in `styles.css`)

All design tokens are CSS custom properties declared in a single `:root` block
near the top of `styles.css` (under the `/* ---------- Tokens ----------` header).
Use the variables — never hardcode a hex or a font stack that already has a token.

### Brand colors

| Variable        | Value      | Use                                    |
|-----------------|------------|----------------------------------------|
| `--lime`        | `#96E650`  | Primary brand / accent                 |
| `--blue`        | `#03599B`  | Secondary brand                        |
| `--blue-deep`   | `#024378`  | Darker blue for depth                  |
| `--magenta`     | `#EC008C`  | Tertiary accent                        |
| `--ink`         | `#282828`  | Dark body text                         |
| `--ink-2`       | `#686868`  | Mid / muted text                       |
| `--rule`        | `#d6d3cc`  | Hairline rules + borders               |
| `--paper`       | `#f2efe8`  | Warm editorial page background         |
| `--paper-2`     | `#e8e3d8`  | Secondary paper tone                   |
| `--white`       | `#ffffff`  | True white                             |
| `--dark`        | `#141414`  | Dark-section background                |
| `--dark-2`      | `#1e1e1e`  | Dark-section secondary                 |

The palette is warm-paper editorial, not stark white SaaS. `--paper` is the
default `body` background.

### Type tokens

| Variable     | Value                                                       |
|--------------|-------------------------------------------------------------|
| `--display`  | `'Bauhaus Bool', 'Futura', 'Century Gothic', sans-serif`    |
| `--body`     | `'DM Sans', system-ui, sans-serif`                          |
| `--mono`     | `'JetBrains Mono', ui-monospace, monospace`                 |

`--display` is for headings, `--body` for running text/UI, `--mono` for
kickers, labels, counters, and field-log entries.

### Motion + rhythm tokens

| Variable    | Value                                  | Use                          |
|-------------|----------------------------------------|------------------------------|
| `--ease`    | `cubic-bezier(0.16, 1, 0.3, 1)`        | Standard "Apple" easing      |
| `--pad-x`   | `clamp(1.25rem, 5vw, 5rem)`            | Horizontal page gutter       |
| `--maxw`    | `1440px`                               | Max content width            |

Spacing is mostly fluid via `clamp()` rather than a fixed step scale; reuse
`--pad-x` for gutters and `--maxw` for the `.container` width.

---

## 3. Fonts

- **Bauhaus Bool** is a custom display face, loaded via three `@font-face`
  blocks at the very top of `styles.css` from local `.woff` files in `fonts/`:
  - `fonts/BauhausBoolDisplay-Medium.woff` — weight 500
  - `fonts/BauhausBoolDisplay-Bold.woff` — weight 700
  - `fonts/BauhausBoolDisplay-ExtraBold.woff` — weight 800
  - All use `font-display: swap`.
- **DM Sans** and **JetBrains Mono** are loaded from Google Fonts in each
  page's `<head>` (single `<link>` with both families, preceded by
  `preconnect` hints to `fonts.googleapis.com` / `fonts.gstatic.com`).
- Reference fonts only through the `--display` / `--body` / `--mono` tokens,
  which carry the correct fallback stacks.

---

## 4. Class naming — BEM-ish

CSS classes follow a relaxed BEM convention: `block__element--modifier`.

- **Block**: the component root — `.fieldlog`, `.nav`, `.hero`, `.dossier`,
  `.dfcarousel`, `.trustband`.
- **Element**: a child, joined with double underscore — `.fieldlog__head`,
  `.nav__links`, `.hero__headline`, `.dossier__preview-iframe`,
  `.dfcarousel__track`, `.cd-logo__mark`.
- **Modifier**: a variant, joined with double hyphen — `.dossier--link`,
  `.dossier--accent-magenta`, `.dossier--withpreview`, `.carousel__nav--next`.
  Multiple modifiers stack as space-separated classes on one element.
- **State classes** use an `is-` prefix and are toggled by JS, never styled
  alone — always scoped to a block (e.g. `.dossier.is-active`). The full set
  in use: `is-active`, `is-docked`, `is-hidden`, `is-in`, `is-live`,
  `is-loaded`, `is-open`, `is-past`, `is-scrolled`, `is-selected`,
  `is-switching`, `is-visible`, `is-wrong`.
- Page-scoped blocks are prefixed with the page (`.about__*`, `.aboutpage__*`,
  `.apphero__*`, `.approach__*`) so one global stylesheet can hold every page
  without collisions.

---

## 5. JavaScript conventions (`script.js`)

- **Vanilla JS only.** No framework, no libraries, no npm dependencies. DOM
  APIs directly.
- **IIFE module pattern.** Each independent feature is wrapped in its own
  immediately-invoked arrow function `(() => { ... })();` to keep its scope
  private. `script.js` is a stack of ~7 such IIFEs (nav + field log, reveal
  animations, carousels, page-specific behaviors, etc.). New behavior should
  be added as a new IIFE rather than leaking variables into global scope.
- **One top-of-file side effect** sits outside the IIFEs: the
  `history.scrollRestoration = 'manual'` + `pagereveal` handler that resets
  scroll on cross-document View Transitions.
- **Defensive DOM access.** Every `querySelector` result is null-checked
  before use (`if (!track) return;`, `dots && dots.appendChild(...)`,
  `prev && prev.addEventListener(...)`). Scripts run on every page, so a
  feature must no-op cleanly when its markup is absent.
- **Hooks via classes and `data-` attributes.** JS targets elements through
  block/state classes (`.nav`, `.dfcarousel`) and `data-*` attributes for
  configuration and sub-controls — e.g. `data-df-prev`, `data-df-next`,
  `data-df-dots`, `data-df-caption`, `data-log`, `data-src`, `data-lab-src`,
  `data-lab-name`. Slide content is read from `dataset` (`s.dataset.label`,
  `s.dataset.title`, `s.dataset.desc`).
- **Progressive enhancement.** JS injects controls the HTML doesn't ship with
  (e.g. the mobile nav hamburger button, carousel dots) so markup stays lean.
- **Accessibility is wired in JS.** Injected controls set `aria-label`,
  `aria-expanded`, `aria-controls`; keyboard handlers cover Arrow keys and
  Escape.
- **Respect `prefers-reduced-motion`.** Motion features check the media query
  and degrade (there is a dedicated reduced-motion IIFE section).

---

## 6. Comment style

Comments are deliberate and heavy — this is a vibe-coded site and the comments
carry the reasoning.

- **File banner**: every shared file opens with a boxed banner using a full
  line of `=` characters, the file name, and a short purpose summary.
- **Section headers**: inside files, sections are marked with
  `/* ---------- Section name ---------------- */` — a label padded out with
  hyphens. These appear in both `styles.css` and `script.js`.
- **Rationale comments**: non-obvious code gets a multi-line comment
  explaining _why_, not just _what_ (e.g. the `pagereveal` belt-and-suspenders
  note, the `_headers` cache-strategy explanation, the pre-push hook's
  `/dev/tty` redirect warning).
- Keep this style. New sections get a hyphen-padded header; non-obvious
  decisions get a "why" comment.

---

## 7. HTML conventions

- `<!doctype html>`, `<html lang="en">`, UTF-8, responsive viewport.
- Each page's `<head>` carries a full SEO/social block: `<title>`,
  `meta description`, Open Graph tags, and Twitter card tags. OG images are
  generated from the templates in `assets/og/*.html`.
- Google Analytics (`gtag.js`, ID `G-404B8P6ZLK`) is inlined at the top of
  `<head>` on each page.
- Pages share visual structure: a `.fieldlog` aside, a `.nav`, page sections,
  and a footer. New pages should mirror an existing page's skeleton.
- Cross-page navigation uses the native View Transitions API
  (`@view-transition { navigation: auto; }` in CSS) plus hover-prefetch of
  same-origin links in JS — no SPA router.

---

## 8. Voice in copy (applies to any text written into pages)

- `caboodle design` is always lowercase in running text.
- No em dashes anywhere except the official tagline
  ("Strategy, media, and behavioral science — it's the whole caboodle").
- Direct, confident, short active sentences. No corporate filler.
- Public-facing contact email is always `hello@caboodledesign.info`.
