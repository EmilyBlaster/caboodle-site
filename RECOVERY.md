# caboodle-site, recovery runbook

Everything needed to run, deploy, or rebuild **caboodledesign.info** if something happens to the site, the host, the laptop, or the tools. Last updated 2026-06-17.

## The 30-second version

- The full website source is in this repo. It is plain HTML, CSS, and JS with **no build step**. If you have this repo, you have the whole site.
- It deploys automatically to **Netlify** on every push to `main`.
- The custom **Bauhaus Bool** font is committed here in `fonts/`. It is not on Google Fonts, so this repo is the only copy you control.

## Repos

- **Website:** `github.com/EmilyBlaster/caboodle-site` (this repo). The live site.
- **Field reel (Remotion video):** `github.com/EmilyBlaster/caboodle-videos` (PRIVATE, it contains client and NDA footage). The source you re-render the homepage reel from. The finished `.mp4`s also live in this repo under `assets/`.

## Run it locally

No build step. From the repo root:

```
npx serve .
```

Open the printed localhost URL. Any static file server works (`python3 -m http.server`, VS Code Live Server, etc.).

## Deploy

- Host: **Netlify**, connected to this GitHub repo.
- It **auto-deploys on every push to `main`**. No build command, no publish subfolder: it serves the repo root as-is.
- Push command used here: `git push --no-verify origin main` (the `--no-verify` skips local git hooks).
- Roll back: in the Netlify dashboard go to Deploys, pick a previous deploy, and "Publish deploy." Or `git revert` the bad commit and push.

## Cache versioning (important)

Browsers and the CDN cache `styles.css` and `script.js` by a `?v=` query string. **When you edit either file, bump that token everywhere, or visitors see stale assets.** Convention: `?v=YYYYMMDD` plus a letter, for example `?v=20260617l`. HTML pages are served fresh and need no token. Current tokens: `styles.css?v=20260903a`, `script.js?v=20260903a`.

Bump across every page at once (replace OLD and NEW):

```
find . -name '*.html' -exec sed -i '' 's/styles\.css?v=OLD/styles.css?v=NEW/g; s/script\.js?v=OLD/script.js?v=NEW/g' {} +
```

## Fonts

- **Display:** Bauhaus Bool, custom, loaded from `fonts/BauhausBoolDisplay-*.woff` via `@font-face` in `styles.css`. NOT on Google Fonts, so this repo is the canonical copy. Do not delete `fonts/`.
- **Body and mono:** DM Sans plus JetBrains Mono, loaded from Google Fonts (one `<link>` in each page `<head>`).

## The field reel (homepage motion)

- Source: the `caboodle-videos` private repo, built with **Remotion**.
- Render the desktop and mobile cuts:

```
npx remotion render FieldReelEmbed-Landscape out/field-reel.mp4        --timeout=120000 --concurrency=2
npx remotion render FieldReelMobile-Portrait  out/field-reel-mobile.mp4 --timeout=120000 --concurrency=2
```

- **iOS gotcha:** Remotion renders full-range `yuvj420p`, which iPhones refuse to play (it looks fine on desktop, frozen on a phone). Re-encode the mobile cut before shipping:

```
ffmpeg -i out/field-reel-mobile.mp4 -vf "scale=864:1080:flags=lanczos:in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -color_range tv -crf 26 -movflags +faststart -an assets/field-reel-mobile.mp4
```

- Then copy the renders into this repo's `assets/`, bump the `?v=` on those asset references, commit, push. The desktop cut goes to `assets/field-reel.mp4`, the mobile cut to `assets/field-reel-mobile.mp4`.

## Domain

- **caboodledesign.info**, DNS pointed at Netlify.
- TODO (only you have this): record your **domain registrar** and its login below, and the **Netlify account** email. Without those you cannot move the domain or the host.

## Accounts you need (fill these in, this repo cannot hold them)

Write down where each lives and which login it uses:

- [ ] **GitHub:** `EmilyBlaster` (keep 2FA backup codes somewhere safe)
- [ ] **Netlify:** which email / account owns the site
- [ ] **Domain registrar** for caboodledesign.info: which company plus login
- [ ] **Email of record:** account and system mail is `egreen@emilygreendesign.com`; public contact is `hello@caboodledesign.info`

## If you had to hand this to another developer

Point them at this file and a `git clone` of both repos. The site is standard static HTML, CSS, and JS: no framework, no build. The reel is a standard Remotion project (`npm install`, then the render commands above). Nothing here is locked to any one AI tool, any developer can pick it up.

## Field-notes subscribe form

The subscribe form on `field-notes.html` is a Netlify Form named `field-notes-subscribe`. Submissions live in the Netlify dashboard under Forms (CSV export there). Form detection has to be switched on once per site: Netlify > Site configuration > Forms > Enable form detection. Without that, submissions 404. The contact form still uses FormSubmit.
