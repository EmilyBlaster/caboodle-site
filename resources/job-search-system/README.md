# Job Search System — deploy bundle

Drop this entire folder into your site at the route:

```
caboodledesign.info/resources/job-search-system/
```

So your repo path becomes something like `public/resources/job-search-system/` (or `static/resources/...` — whatever your project uses for static files).

## Files

| File | Purpose |
|---|---|
| `index.html` | The live, interactive page. Cover has a "Download as PDF" button that opens `print.html`. |
| `print.html` | Auto-fires the browser print dialog so visitors can save the doc as a PDF. |
| `colors_and_type.css` | Design tokens + @font-face rules. |
| `assets/favicon.svg` | Page favicon. |
| `assets/logomark-magenta-transparent.png` | Cover logomark. |
| `fonts/*.woff` | Bauhaus Bool Display, 9 weights. |

## Live URL

Once deployed:

- **Resource page** → `https://caboodledesign.info/resources/job-search-system/`
- **Direct PDF link** → `https://caboodledesign.info/resources/job-search-system/print.html`

The first URL is what goes in your TikTok bio.

## Resource index card (optional)

If you have a `/resources` index page, add a card pointing to `/resources/job-search-system/`. Suggested copy:

> **An automated job search system.**
> A walkthrough for setting up a Cowork system that scans job boards every morning and tailors application materials per role. 10 min read.

## Updating later

If you tweak the source in the design system project, re-export the deploy folder and replace this directory in the repo. Don't hand-edit `index.html` or `print.html` — they get regenerated.

## Hosting notes

- Built for Netlify; nothing server-side, just static files.
- Fonts are loaded relatively from `fonts/`, so the folder must stay intact.
- `print.html` is a sibling, not a child — keep them at the same level.
