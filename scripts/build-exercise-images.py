#!/usr/bin/env python3
"""
Build the animated exercise GIFs in assets/exercises/.

Source: Pexels stock videos of women performing each exercise (Pexels
license: free to use and modify, no attribution required — credits are
still given in src/app/about.tsx and LICENSES-thirdparty.md). A short
window containing one clean rep is cut from each video and converted to
a looping GIF: 640px wide, 10 fps, 128-color palette, bayer dither,
hqdn3d denoise (halves file size on the dark clips).

Swim (tread water) and VO2 max intentionally have no image (decided
2026-07-23) — their cards render without a banner.

Requires ffmpeg on PATH.

Usage:
    python3 scripts/build-exercise-images.py [--force]

By default, skips files that already exist. --force regenerates all.
"""
import argparse
import pathlib
import subprocess
import sys
import urllib.request

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / 'assets' / 'exercises'
CACHE = REPO_ROOT / '.cache' / 'exercise-source-videos'

# Each entry: Pexels video id, loop window (start s, duration s), and an
# optional pre-scale crop "w:h:x:y" for vertical sources (picks the band
# where the movement happens). Download URL pattern
# https://www.pexels.com/download/video/<id>/ 302s to the best file.
VIDEOS = {
    'ohp': {
        'pexels_id': 6509537,
        'page': 'https://www.pexels.com/video/female-lifting-weights-6509537/',
        'start': 4, 'duration': 5, 'crop': None,
        'shows': 'woman pressing a barbell from front rack to overhead lockout',
    },
    'farmers-walk': {
        'pexels_id': 8026521,
        'page': 'https://www.pexels.com/video/woman-doing-lunges-while-carrying-dumbbells-8026521/',
        'start': 4.5, 'duration': 4, 'crop': None,
        'shows': 'woman picking up a dumbbell in each hand (carry grip); '
                 'closest female match on Pexels — no walking-carry video exists there',
    },
    'deadlift': {
        'pexels_id': 7674502,
        'page': 'https://www.pexels.com/video/a-woman-lifting-a-barbell-7674502/',
        'start': 2, 'duration': 4, 'crop': None,
        'shows': 'woman performing a barbell deadlift, full side view',
    },
    'tgu': {
        'pexels_id': 8893504,
        'page': 'https://www.pexels.com/video/a-woman-lifting-a-kettlebell-8893504/',
        'start': 8, 'duration': 4.5, 'crop': '2160:1215:0:250',
        'shows': 'woman raising a kettlebell to full overhead extension; '
                 'closest female match on Pexels — no Turkish get-up video exists there',
    },
    'front-squat': {
        'pexels_id': 7690493,
        'page': 'https://www.pexels.com/video/a-woman-squatting-while-carrying-a-fitness-ball-7690493/',
        'start': 2, 'duration': 4.5, 'crop': '2160:1620:0:1300',
        'shows': 'woman in a deep squat holding a medicine ball at her chest '
                 '(goblet form; no barbell front squat by a woman exists on Pexels)',
    },
}

OUTPUT_WIDTH = 640
FPS = 10
PALETTE = 'split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5'
DENOISE = 'hqdn3d=6:4:8:6'


def fetch(pexels_id: int, dst: pathlib.Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    url = f'https://www.pexels.com/download/video/{pexels_id}/'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r, open(dst, 'wb') as f:
        f.write(r.read())


def build(app_id: str, info: dict, force: bool) -> None:
    out = ASSETS / f'{app_id}.gif'
    if out.exists() and not force:
        print(f'  skip  {app_id}.gif (exists)')
        return
    src = CACHE / f'{app_id}.mp4'
    if not src.exists() or force:
        fetch(info['pexels_id'], src)
    vf = [DENOISE, f'fps={FPS}', f'scale={OUTPUT_WIDTH}:-2:flags=lanczos', PALETTE]
    if info['crop']:
        vf.insert(0, f'crop={info["crop"]}')
    subprocess.run([
        'ffmpeg', '-loglevel', 'error',
        '-ss', str(info['start']), '-t', str(info['duration']),
        '-i', str(src),
        '-vf', ','.join(vf),
        '-y', str(out),
    ], check=True)
    print(f'  built {app_id}.gif  ({out.stat().st_size:,} bytes)  {info["shows"]}')


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--force', action='store_true', help='regenerate even if outputs exist')
    args = p.parse_args()
    ASSETS.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    print('Pexels videos — women performing each exercise:')
    for app_id, info in VIDEOS.items():
        build(app_id, info, args.force)
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
