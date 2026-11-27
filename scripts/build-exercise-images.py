#!/usr/bin/env python3
"""
Build the stock-footage exercise demos in assets/exercises/.

Three of the six demos come from Pexels videos (Pexels License: free to use
and modify, no attribution required; credits are still given in
src/app/about.tsx and LICENSES-thirdparty.md):

- ohp.mp4, deadlift.mp4: short muted MP4 loops of one rep, 640x400,
  24 fps, H.264. About 125 KB each; the same clip as a GIF is about 4.5 MB.
- tgu.gif: kept as a GIF from an earlier build.

Not built here, and never touched by this script:
- farmerswalk.gif, frontsquat.gif: original line drawings.
- swim.mp4: cut from an Instagram reel by @swim_mydream, used with
  permission (see LICENSES-thirdparty.md). Instagram's video links expire,
  so it can't be re-downloaded automatically. It was made from the reel's
  33.0-37.0 s window (the eggbeater kick) with:
    crop=360:442:0:198 (removes the caption text), centered over a blurred
    copy scaled to 640x400, 24 fps, same MP4 settings as below.

VO2 max intentionally has no image (decided 2026-07-23).

Requires ffmpeg on PATH and network access to www.pexels.com and
videos.pexels.com.

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

# Each entry: Pexels video id, the window holding one clean rep (start s,
# duration s), a crop "w:h:x:y" in source pixels, optional extra filters, and
# the output format. Download URL pattern
# https://www.pexels.com/download/video/<id>/ redirects to the best file.
VIDEOS = {
    'deadlift': {
        'pexels_id': 7674502,
        'page': 'https://www.pexels.com/video/a-woman-lifting-a-barbell-7674502/',
        'start': 1.5, 'duration': 4.75, 'crop': '3200:2000:1065:100',
        'filters': None, 'format': 'mp4',
        'shows': 'woman, barbell deadlift, side view, floor to lockout and back',
    },
    'ohp': {
        'pexels_id': 6509537,
        'page': 'https://www.pexels.com/video/female-lifting-weights-6509537/',
        'start': 3.0, 'duration': 7.0, 'crop': '3456:2160:192:0',
        # The source is very dark; lift it without washing out the blacks.
        'filters': 'eq=contrast=1.12:brightness=0.03:gamma=1.18', 'format': 'mp4',
        'shows': 'woman, barbell rack to overhead and back; she dips her knees '
                 '(a push press, not a strict press); the bar touches the top '
                 'edge at lockout in the source footage',
    },
    'tgu': {
        'pexels_id': 4945556,
        'page': 'https://www.pexels.com/video/4945556/',
        'start': 6, 'duration': 5, 'crop': None,
        'filters': None, 'format': 'gif',
        'shows': 'woman pressing a kettlebell from shoulder rack to one-arm '
                 'overhead lockout, the top position of the get-up, not the '
                 'full movement',
    },
}

OUTPUT_WIDTH = 640
GIF_FPS = 10
GIF_PALETTE = 'split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5'
GIF_DENOISE = 'hqdn3d=6:4:8:6'
MP4_FPS = 24
MP4_ARGS = [
    '-c:v', 'libx264', '-profile:v', 'main', '-crf', '27', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart',
]


def fetch(pexels_id: int, dst: pathlib.Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    url = f'https://www.pexels.com/download/video/{pexels_id}/'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r, open(dst, 'wb') as f:
        f.write(r.read())


def build(app_id: str, info: dict, force: bool) -> None:
    out = ASSETS / f'{app_id}.{info["format"]}'
    if out.exists() and not force:
        print(f'  skip  {out.name} (exists)')
        return
    src = CACHE / f'{app_id}.mp4'
    if not src.exists() or force:
        fetch(info['pexels_id'], src)

    vf = []
    if info['crop']:
        vf.append(f'crop={info["crop"]}')
    if info['filters']:
        vf.append(info['filters'])
    if info['format'] == 'mp4':
        vf += [f'fps={MP4_FPS}', f'scale={OUTPUT_WIDTH}:-2:flags=lanczos']
        codec = MP4_ARGS
    else:
        vf = [GIF_DENOISE] + vf + [f'fps={GIF_FPS}', f'scale={OUTPUT_WIDTH}:-2:flags=lanczos', GIF_PALETTE]
        codec = []

    subprocess.run([
        'ffmpeg', '-loglevel', 'error',
        '-ss', str(info['start']), '-t', str(info['duration']),
        '-i', str(src),
        '-vf', ','.join(vf),
        *codec,
        '-y', str(out),
    ], check=True)
    print(f'  built {out.name}  ({out.stat().st_size:,} bytes)  {info["shows"]}')


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--force', action='store_true', help='regenerate even if outputs exist')
    args = p.parse_args()
    ASSETS.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    print('Pexels videos, women performing each exercise:')
    for app_id, info in VIDEOS.items():
        build(app_id, info, args.force)
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
