#!/usr/bin/env python3
"""
Fetch TikTok thumbnail for a video and save to assets/tiktok/[id].jpeg

Usage:
  python3 scripts/fetch-thumbnail.py 7629484140756274463
  python3 scripts/fetch-thumbnail.py  (fetches all missing thumbnails from data/tiktok-posts.json)
"""

import sys, json, os, urllib.request, urllib.parse

TIKTOK_USER = 'caboodledesign'
OEMBED_BASE = 'https://www.tiktok.com/oembed?url='
ASSETS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'assets', 'tiktok')
POSTS_JSON  = os.path.join(os.path.dirname(__file__), '..', 'data', 'tiktok-posts.json')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

os.makedirs(ASSETS_DIR, exist_ok=True)

def fetch_thumbnail(video_id):
    dest = os.path.join(ASSETS_DIR, f'{video_id}.jpeg')
    if os.path.exists(dest):
        print(f'  SKIP  {video_id}.jpeg (already exists)')
        return True

    url = f'https://www.tiktok.com/@{TIKTOK_USER}/video/{video_id}'
    oembed_url = OEMBED_BASE + urllib.parse.quote(url, safe='')

    try:
        req = urllib.request.Request(oembed_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        thumb_url = data.get('thumbnail_url')
        if not thumb_url:
            print(f'  WARN  {video_id} — no thumbnail_url in oEmbed response')
            return False

        req2 = urllib.request.Request(thumb_url, headers=HEADERS)
        with urllib.request.urlopen(req2, timeout=15) as r:
            with open(dest, 'wb') as f:
                f.write(r.read())
        print(f'  OK    {video_id}.jpeg')
        return True

    except Exception as e:
        print(f'  FAIL  {video_id} — {e}')
        return False

# Run for a single ID passed as argument, or all missing from JSON
if len(sys.argv) > 1:
    fetch_thumbnail(sys.argv[1].strip())
else:
    print('Checking all posts in data/tiktok-posts.json...')
    with open(POSTS_JSON) as f:
        posts = json.load(f)
    for p in posts:
        fetch_thumbnail(p['id'])
    print('Done.')
