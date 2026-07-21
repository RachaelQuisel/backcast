#!/usr/bin/env python3
"""
Build the exercise banner GIFs in assets/exercises/.

Sources:
- Free Exercise DB (github.com/yuhonas/free-exercise-db, MIT license):
  2-frame JPGs per exercise. Composed into an animated GIF at 500ms/frame.
- Wikimedia Commons (public domain U.S. military photos): still images
  converted to single-frame GIFs for format consistency with the animated
  banners.

Requires ImageMagick (`magick`) on PATH.

Usage:
    python3 scripts/build-exercise-images.py [--force]

By default, skips files that already exist. --force regenerates all.

To swap a Free Exercise DB variant, change the value in FREE_EXERCISE_DB
(browse candidates at github.com/yuhonas/free-exercise-db/tree/main/exercises).
"""
import argparse
import pathlib
import subprocess
import sys
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / 'assets' / 'exercises'
CACHE = REPO_ROOT / '.cache' / 'exercise-source-frames'

# Free Exercise DB — animated 2-frame GIFs
FREE_EXERCISE_DB = {
    'ohp':          'Standing_Military_Press',
    'farmers-walk': 'Farmers_Walk',
    'deadlift':     'Barbell_Deadlift',
    'tgu':          'Kettlebell_Turkish_Get-Up_Squat_style',
    'front-squat':  'Front_Squat_Clean_Grip',
}
FEDB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

# Wikimedia Commons — public domain, still images.
# Fetched via the Commons file-info API; artist attribution surfaces in
# src/app/about.tsx's Image credits section.
WIKIMEDIA = {
    'swim': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/U.S._Navy_and_Coast_Guard_athletes_tread_water_while_getting_swim_instruction_from_Sherry_Coglin%2C_a_U.S._Paralympics_swim_coach%2C_during_Wounded_Warriors_swim_practice_at_Scott_Pool_121114-F-ZB240-0295.jpg',
        'artist': 'Staff Sgt. Mike Meares (U.S. Air Force, 2012)',
    },
    'vo2max': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/U.S._Army_Spc._Alejandra_Herrera%2C_left%2C_a_mechanic_with_the_7th_Squadron%2C_10th_Cavalry_Regiment%2C_1st_Brigade_Combat_Team%2C_4th_Infantry_Division%2C_runs_on_a_treadmill_during_the_VO2_Max_competition%2C_which_130306-A-UK001-036.jpg',
        'artist': 'Cpl. William Smith (U.S. Army, 2013)',
    },
}

# Output: 480px wide, 128 colors, optimized. ~90-115 KB per file.
OUTPUT_WIDTH = 480
OUTPUT_COLORS = 128


def fetch(url: str, dst: pathlib.Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'backcast-build/0.1'})
    with urllib.request.urlopen(req) as r, open(dst, 'wb') as f:
        f.write(r.read())


def build_animated(app_id: str, source_id: str, force: bool) -> None:
    out = ASSETS / f'{app_id}.gif'
    if out.exists() and not force:
        print(f'  skip  {app_id}.gif (exists)')
        return
    frames = []
    for i in (0, 1):
        frame = CACHE / f'{app_id}_{i}.jpg'
        if not frame.exists() or force:
            fetch(f'{FEDB_BASE}/{source_id}/{i}.jpg', frame)
        frames.append(str(frame))
    subprocess.run([
        'magick', '-delay', '50', '-loop', '0',
        *frames,
        '-resize', f'{OUTPUT_WIDTH}x',
        '-colors', str(OUTPUT_COLORS),
        '-layers', 'Optimize',
        str(out),
    ], check=True)
    print(f'  built {app_id}.gif  ({out.stat().st_size:,} bytes)  from {source_id}')


def build_static(app_id: str, url: str, artist: str, force: bool) -> None:
    out = ASSETS / f'{app_id}.gif'
    if out.exists() and not force:
        print(f'  skip  {app_id}.gif (exists)')
        return
    src = CACHE / f'{app_id}_src.jpg'
    if not src.exists() or force:
        fetch(url, src)
    subprocess.run([
        'magick', str(src),
        '-resize', f'{OUTPUT_WIDTH}x',
        '-colors', str(OUTPUT_COLORS),
        '-layers', 'Optimize',
        str(out),
    ], check=True)
    print(f'  built {app_id}.gif  ({out.stat().st_size:,} bytes)  attr: {artist}')


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--force', action='store_true', help='regenerate even if outputs exist')
    args = p.parse_args()
    ASSETS.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    print('Free Exercise DB (MIT) — animated:')
    for app_id, source_id in FREE_EXERCISE_DB.items():
        build_animated(app_id, source_id, args.force)
    print('\nWikimedia Commons (public domain) — still:')
    for app_id, info in WIKIMEDIA.items():
        build_static(app_id, info['url'], info['artist'], args.force)
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
