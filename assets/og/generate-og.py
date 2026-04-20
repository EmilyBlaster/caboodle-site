#!/usr/bin/env python3
"""
Generate OG preview images for each site page.
One template HTML + per-page content substitutions → rendered PNGs.
Run from this folder: python3 generate-og.py
"""
import subprocess
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

TEMPLATE = (HERE / "og-home.html").read_text()

# Each page: (slug, headline_html, meta_html, bottom_tag)
PAGES = [
    (
        "approach",
        "i observe<br>before i<br><em>design.</em>",
        "CHAPTER <b>I</b> · METHODOLOGY",
        "ACTION MAPPING · KIRKPATRICK · ETHNOGRAPHY",
    ),
    (
        "about",
        "meet<br><em>emily.</em>",
        "SUBJECT <b>001</b> · EMILY GREEN",
        "14+ YEARS · BYRON CENTER, MI",
    ),
    (
        "labs",
        "behavior<br>meets <em>ai.</em>",
        "LAB NOTEBOOK <b>005</b> · ACTIVE",
        "CABOODLE LABS · 2026",
    ),
    (
        "field-notes",
        "notes from<br>the <em>field.</em>",
        "NOTEBOOK · <b>ONGOING</b>",
        "OBSERVATIONS · ANALYSIS · DESIGN PATTERNS",
    ),
    (
        "resources",
        "the supply<br><em>cabinet.</em>",
        "SUPPLY CABINET · <b>003</b>",
        "FREE · OPEN SOURCE · DOWNLOADABLE",
    ),
    (
        "trust20",
        "five weeks.<br>state<br><em>accredited.</em>",
        "CASE STUDY · <b>ENG-TRUST20</b>",
        "GORDON FOOD SERVICES · MULTI-STATE",
    ),
]

# Original home page text (so we can replace it)
HOME_HEADLINE = "learning that<br>changes what<br>people <em>do.</em>"
HOME_META = "FIELD NOTE <b>001</b> · BYRON CENTER, MI"
HOME_TAG = "STRATEGY · MEDIA · BEHAVIORAL SCIENCE"


def render(html_path: Path, png_path: Path) -> None:
    """Render HTML via headless Chrome at 800px tall, crop to 1200x630."""
    tall_tmp = Path("/tmp/og-tall.png")
    subprocess.run(
        [
            CHROME,
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--window-size=1200,800",
            "--virtual-time-budget=3000",
            f"--screenshot={tall_tmp}",
            f"file://{html_path}",
        ],
        check=True,
        capture_output=True,
    )
    img = Image.open(tall_tmp)
    cropped = img.crop((0, 0, 1200, 630))
    cropped.save(png_path)


def main() -> None:
    for slug, headline, meta, tag in PAGES:
        html = TEMPLATE \
            .replace(HOME_HEADLINE, headline) \
            .replace(HOME_META, meta) \
            .replace(HOME_TAG, tag)
        html_path = HERE / f"og-{slug}.html"
        png_path = HERE / f"og-{slug}.png"
        html_path.write_text(html)
        render(html_path, png_path)
        print(f"✓ og-{slug}.png")

    # Re-render home (in case template changed)
    render(HERE / "og-home.html", HERE / "og-home.png")
    print("✓ og-home.png")


if __name__ == "__main__":
    main()
