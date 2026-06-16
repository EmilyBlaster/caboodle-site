# INTEGRATIONS

_Codebase map — generated 2026-05-16_

External services the Caboodle Design site touches. The site has **no backend
of its own** — every integration is either static hosting, a CDN asset, an
embedded iframe, or a third-party form endpoint.

## Hosting — Netlify

- Netlify site **`beamish-naiad-e754b7`**, site ID
  `36c119e8-865e-4eba-8dd1-7f548376db1f` (`.netlify/state.json`).
- Static deploy from repo root, no build step (`netlify.toml`,
  `publish = "."`).
- Netlify-side processing: CSS bundle/minify, JS minify, HTML `pretty_urls`,
  image compression.
- Caching + security headers served from `_headers`.
- No Netlify Functions and no scheduled functions — `.netlify/netlify.toml`
  shows empty `[functions]` blocks.

## Fonts

- **Google Fonts** — loaded via `<link>` to `fonts.googleapis.com` with
  `preconnect` to `fonts.gstatic.com`. Primary import is **DM Sans**
  (`wght 400;500;600;700`) plus **JetBrains Mono** (`400;500`) for the mono
  field-log aesthetic. Some sub-pages also load **Permanent Marker**,
  **Work Sans**, and **Courier Prime**.
- **Bauhaus Bool Display** — the brand display typeface, self-hosted as local
  `.woff` files in `fonts/` (`BauhausBoolDisplay-Medium/-Bold/-ExtraBold`).
  Declared via `@font-face` in `styles.css` (lines 8–26). Not on Google
  Fonts. `resources/job-search-system/fonts/` carries its own larger Bauhaus
  Bool weight set for that standalone sub-page.

## Forms

- **Contact intake — Formsubmit.co.** `contact.html` posts to
  `https://formsubmit.co/hello@caboodledesign.info`. Hidden fields configure
  it: `_next` redirects to `contact-thanks.html`, `_subject`, `_template=table`,
  `_captcha=false`, and a `_honey` honeypot. **Not** Netlify Forms.
- **Field notes subscribe — `mailto:`.** `field-notes.html` uses a plain
  `mailto:hello@caboodledesign.info` form (`enctype="text/plain"`). No service.
- No Netlify Forms anywhere (`data-netlify` is not used).

## Field guide bot — client-side only, no backend

- The "field guide" chat widget is built entirely in `script.js` (the
  `fieldGuide()` IIFE, ~line 909). Mounted on `index.html` and
  `resources.html`.
- It is **purely client-side rule-based keyword matching** — visitors click
  quick-reply chips or type a question, and the script matches against a
  hard-coded set of canned answers. There is **no API call, no LLM, no
  backend**. The single `fetch(`-adjacent code in `script.js` (line 373) is
  unrelated: it injects `<link rel="prefetch">` tags for faster page nav.
- Public contact address used inside the bot copy: `hello@caboodledesign.info`.

## Embedded media (iframes)

- **Vimeo** — case-study video embeds via `player.vimeo.com/video/...`
  (e.g. work pages, Apple/Intuit/GitLab case studies).
- **YouTube** — thumbnails from `img.youtube.com` and watch links.
- **Sketchfab** — referenced as the source of the 3D fire-extinguisher model.
- **GitHub Pages portfolio demos** — `emilyblaster.github.io/PorfolioDemos/*`
  and related repos are linked/embedded from `labs.html` and work pages.

## CDN assets

- **jsDelivr** — `cdn.jsdelivr.net/npm/three@0.167.0/` supplies Three.js for
  `assets/3d/fire-extinguisher.html` (see `STACK.md`).
- **ImgBB** — several diagram images load from `i.ibb.co/...`.
- **pravatar.cc** — placeholder avatar images (`i.pravatar.cc`).

## Analytics

- **Google Analytics 4** — `gtag.js` with measurement ID **`G-404B8P6ZLK`**,
  loaded inline at the top of `index.html` (and other pages).

## Related external apps (linked, not integrated)

- **Caboodle Dashboard** — `caboodledashboard.netlify.app`, a separate
  Vite/React app, linked from the site.
- **TikTok** — `@caboodledesign`. `scripts/fetch-thumbnail.py` pulls
  thumbnails offline via TikTok oEmbed into `assets/tiktok/`; runtime pages
  read the local `data/tiktok-posts.json`.
