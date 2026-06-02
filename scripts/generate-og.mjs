/*
 * generate-og.mjs
 *
 * Auto-generates Open Graph preview images by screenshotting the live
 * homepage and about page at the LinkedIn-standard 1200x630 viewport.
 *
 * Runs as part of the Netlify build, so every deploy refreshes the OG
 * images and they stay in sync with whatever the hero currently says.
 * Can also be run locally with `node scripts/generate-og.mjs` to
 * preview the images before pushing.
 *
 * The script:
 *   1. Spawns a tiny static http-server on a local port.
 *   2. Launches a headless Chromium via Playwright.
 *   3. Loads each page, waits for fonts to settle, screenshots.
 *   4. Saves to assets/og/og-{name}.png.
 *   5. Tears the server down on success or failure.
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OG_DIR = path.join(PROJECT_ROOT, 'assets', 'og');
const PORT = 8765;

// Each entry produces one OG image at assets/og/<output>.
// Sources are the bespoke 1200x630 HTML templates at assets/og/og-*.html.
// Those templates are pre-composed for the OG canvas — full claim
// fits cleanly, branded chrome, no live-page cropping. Update the
// copy inside the templates when positioning changes.
const PAGES = [
  { url: '/assets/og/og-home.html',        output: 'og-home.png' },
  { url: '/assets/og/og-about.html',       output: 'og-about.png' },
  { url: '/assets/og/og-field-notes.html', output: 'og-field-notes.png' },
];

const OG_VIEWPORT = { width: 1200, height: 630 };

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'npx',
      ['http-server', PROJECT_ROOT, '-p', String(PORT), '-c-1', '--silent', '-a', '127.0.0.1'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let settled = false;
    const finish = (fn, arg) => { if (!settled) { settled = true; fn(arg); } };

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      if (text.toLowerCase().includes('available on')) finish(resolve, proc);
    });
    proc.stderr.on('data', (chunk) => {
      // http-server prints startup info to stdout, errors to stderr.
      // We don't want to fail on warnings; only log.
      console.error('[server]', chunk.toString().trim());
    });
    proc.on('error', (err) => finish(reject, err));

    // Belt-and-suspenders: if no banner after 4s, assume it's ready.
    setTimeout(() => finish(resolve, proc), 4000);
  });
}

async function captureOgImages() {
  if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

  console.log('[og] Starting local server on port', PORT);
  const server = await startServer();

  try {
    console.log('[og] Launching Chromium');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: OG_VIEWPORT,
      deviceScaleFactor: 1, // 1200x630 native — social platforms downscale to
                            // ~600x315 anyway, so 2x retina is wasted bandwidth.
    });
    const page = await context.newPage();

    for (const { url, output } of PAGES) {
      const targetUrl = `http://127.0.0.1:${PORT}${url}`;
      console.log(`[og] Capturing ${url}`);

      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait for web fonts (Bauhaus Bool / DM Sans / JetBrains Mono) to settle
      await page.evaluate(() => document.fonts.ready);

      // Hide interactive UI chrome that shouldn't appear in a static social
      // preview: the floating field-guide chat button, the settings cog,
      // any fixed-position widgets. The OG image is meant to show the page
      // content, not the affordances around it.
      await page.addStyleTag({
        content: `
          .guide-wrap,
          #guideTrigger,
          #guidePanel,
          .field-guide,
          [class*="settings"],
          [id*="settings"],
          [class*="cog"],
          [class*="theme-toggle"] {
            display: none !important;
          }
        `,
      });

      // Small extra beat for any post-load layout shifts after hiding chrome
      await page.waitForTimeout(600);

      const outputPath = path.join(OG_DIR, output);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false, // viewport only — that's the OG canvas
      });
      console.log(`[og] Saved assets/og/${output}`);
    }

    await browser.close();
    console.log('[og] Done.');
  } finally {
    server.kill();
  }
}

captureOgImages().catch((err) => {
  console.error('[og] FAILED:', err);
  process.exit(1);
});
