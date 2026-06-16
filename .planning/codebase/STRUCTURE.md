# Structure — caboodle-site

_Last mapped: 2026-05-16_

## Top-level layout

```
caboodle-site/
├── index.html              Homepage
├── about.html              About / founder
├── approach.html           Methodology
├── work.html               Work index (case study grid)
├── labs.html               Labs index (experiments grid)
├── contact.html            Contact form
├── contact-thanks.html     Form success page
├── field-notes.html        Field notes / writing
├── resources.html          Resources index
├── work-preview.html        Work-page preview/staging variant
├── engagement-arc.html      Standalone interactive figure
├── fig-02-ladder.html       Standalone interactive figure
├── styles.css               Shared stylesheet (all pages)
├── script.js                Shared behavior file (all pages)
├── netlify.toml             Deploy config (publish = repo root)
├── _headers                 CDN cache-control + security headers
├── serve.sh                 Local static dev server
├── work/                    Case study pages
├── labs/                    Lab experiment pages
├── resources/               Standalone resource microsites
├── fonts/                   Bauhaus Bool web fonts
├── assets/                  Images, video, 3D, OG cards
├── data/                    tiktok-posts.json
└── scripts/                 fetch-thumbnail.py (build-time utility)
```

## Page inventory

**Top-level pages (12):** `index.html`, `about.html`, `approach.html`,
`work.html`, `labs.html`, `contact.html`, `contact-thanks.html`,
`field-notes.html`, `resources.html`, `work-preview.html`,
`engagement-arc.html`, `fig-02-ladder.html`.

**Case studies — `work/` (7):** `apple.html`, `gitlab.html`, `intuit.html`,
`tmobile.html`, `trust20.html`, `peoples-professors.html`,
`spot-the-strategy.html`. Linked from `work.html` and previewed in the
homepage dossier iframes.

**Lab experiments — `labs/` (6):** `behavior-design.html`,
`content-ops-dashboard.html`, `emotion-feedback.html`, `microlearning.html`,
`stakeholder-review.html`, `video-automation.html`. Linked from `labs.html`
via `data-lab-src` attributes that drive the hover-to-switch labs stage.

**Resource microsites — `resources/`:** self-contained subsites with their own
CSS/fonts/assets, e.g. `resources/job-search-system/index.html` (+ `print.html`,
`colors_and_type.css`, local `fonts/`) and `resources/claude-ecosystem/`.

## Assets — `assets/`

- `assets/favicon.svg` — site favicon
- `assets/caboodle-logo-magenta.png` — logo (place on Deep Blue background)
- `assets/EmilyGreenPortrait.png`, `assets/emily-green-resume.pdf`
- `assets/cs/` — case study media (hero images, MP4 + VTT, diagrams)
- `assets/CasestudyCovers/` — case study cover art (+ `grabs/` thumbnails)
- `assets/3d/` — `fire_extinguisher.glb`, `fire-extinguisher.html` (3D demo)
- `assets/og/` — Open Graph card HTML templates (`og-home.html`, etc.)
- `assets/demos/`, `assets/labs/`, `assets/tiktok/` — feature-specific media
- `assets/pp-*.png/jpg/gif` — People's Professors case study assets

## Fonts — `fonts/`

Bauhaus Bool display family as local `.woff` files (custom font, not on Google
Fonts): `BauhausBoolDisplay-Bold.woff`, `-ExtraBold.woff`, `-Medium.woff`.
Body/UI fonts (DM Sans, JetBrains Mono) are imported from Google Fonts in each
page `<head>`. `resources/job-search-system/fonts/` carries its own fuller
Bauhaus Bool weight set for that standalone microsite.

## Naming conventions

- Pages: lowercase, hyphenated (`field-notes.html`, `contact-thanks.html`)
- Sub-pages grouped by section folder: `work/`, `labs/`, `resources/`
- Case studies named by client/project (`apple.html`, `trust20.html`)
- Assets prefixed by feature/case (`apple-*`, `gitlab-*`, `pp-*` for
  People's Professors); OG templates prefixed `og-`
- Cache-bust query strings use a date stamp (`script.js?v=20260516`)
- Reference/archive/WIP folders are gitignored by pattern (`*_Reference/`,
  `*_archive/`, `*_wip.*`) so they never ship to Netlify

## Not deployed / tooling

`scripts/fetch-thumbnail.py` and `data/tiktok-posts.json` support content
workflows but are not part of the runtime site. `.planning/`, `.claude/`,
`.netlify/`, `audit-logs/`, and `*.md` docs (`PRODUCT.md`,
`CONTENT_INVENTORY.md`) are project/working files, not published pages.
