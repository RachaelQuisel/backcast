#!/usr/bin/env python3
"""
Build the exercise banner GIFs in assets/exercises/.

Source: Wikimedia Commons photographs of women performing each exercise
(public domain U.S. military photos, or CC BY 2.0 where noted). Each photo
is converted to a single-frame GIF for format consistency. Artist
attribution surfaces in src/app/about.tsx's Image credits section and in
LICENSES-thirdparty.md.

Swim (tread water) and VO2 max intentionally have no image (decided
2026-07-23) — their cards render without a thumbnail.

Requires ImageMagick (`magick`) on PATH.

Usage:
    python3 scripts/build-exercise-images.py [--force]

By default, skips files that already exist. --force regenerates all.
"""
import argparse
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / 'assets' / 'exercises'
CACHE = REPO_ROOT / '.cache' / 'exercise-source-frames'

WIKIMEDIA = {
    'ohp': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Watch_me_lift_%285048014%29.jpg',
        'artist': 'Airman 1st Class Jovante Johnson (U.S. Air Force)',
        'license': 'public domain',
    },
    'farmers-walk': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/2-8_hosts_Jane_Wayne_Day_140930-M-SD875-583.jpg',
        'artist': 'Lance Cpl. David N. Hersey (U.S. Marine Corps)',
        'license': 'public domain',
    },
    'deadlift': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Kathy_Nguyen_performing_a_deadlift.jpg',
        'artist': 'mark sebastian',
        'license': 'CC BY-SA 2.0',
    },
    'tgu': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Young_blonde_woman_working_out_in_the_gym_while_holding_kettlebell.jpg',
        'artist': 'Nenad Stojkovic',
        'license': 'CC BY 2.0',
    },
    'front-squat': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Olympics_2012_Women%27s_75kg_Weightlifting.jpg',
        'artist': 'Simon Q',
        'license': 'CC BY 2.0',
    },
}

# Output: 960px wide, 256 colors, optimized.
OUTPUT_WIDTH = 960
OUTPUT_COLORS = 256

# Fetch via the Commons thumbnail service, not the original file. Wikimedia's
# 429 response asks for exactly this — thumbs are CDN-cached and far less
# rate-limited. 1280px comfortably covers the 960px output.
THUMB_WIDTH = 1280


def thumb_url(original_url: str) -> str:
    prefix = 'https://upload.wikimedia.org/wikipedia/commons/'
    path = original_url[len(prefix):]          # e.g. '3/36/Watch_me_lift...jpg'
    filename = path.rsplit('/', 1)[1]
    return f'{prefix}thumb/{path}/{THUMB_WIDTH}px-{filename}'


def fetch(url: str, dst: pathlib.Path, attempts: int = 5) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'backcast-build/0.2'})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req) as r, open(dst, 'wb') as f:
                f.write(r.read())
            return
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < attempts - 1:
                wait = 15 * (attempt + 1)
                print(f'  429 rate-limited fetching {dst.name}; retrying in {wait}s')
                time.sleep(wait)
            else:
                raise


def build_static(app_id: str, url: str, artist: str, license_name: str, force: bool) -> None:
    out = ASSETS / f'{app_id}.gif'
    if out.exists() and not force:
        print(f'  skip  {app_id}.gif (exists)')
        return
    src = CACHE / f'{app_id}_src.jpg'
    if not src.exists() or force:
        fetch(thumb_url(url), src)
    subprocess.run([
        'magick', str(src),
        '-resize', f'{OUTPUT_WIDTH}x',
        '-colors', str(OUTPUT_COLORS),
        '-layers', 'Optimize',
        str(out),
    ], check=True)
    print(f'  built {app_id}.gif  ({out.stat().st_size:,} bytes)  attr: {artist} ({license_name})')


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--force', action='store_true', help='regenerate even if outputs exist')
    args = p.parse_args()
    ASSETS.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    print('Wikimedia Commons — women performing each exercise:')
    for app_id, info in WIKIMEDIA.items():
        build_static(app_id, info['url'], info['artist'], info['license'], args.force)
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
