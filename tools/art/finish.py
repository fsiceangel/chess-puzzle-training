# -*- coding: utf-8 -*-
# Chosen candidate per piece -> keyed, trimmed, baseline-aligned webp sprites.
#
#   python finish.py            the default (cartoon) set, straight into public/pieces/
#   python finish.py <style>    out/<style>/ into public/pieces/<style>/
import os, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
STYLE = sys.argv[1] if len(sys.argv) > 1 else None
SRC = os.path.join(ROOT, 'out', STYLE) if STYLE else os.path.join(ROOT, 'out')
DEST = os.path.normpath(os.path.join(ROOT, '..', '..', 'public', 'pieces', STYLE or ''))
os.makedirs(DEST, exist_ok=True)

# picked off the contact sheets: cleanest silhouette, no stray artefacts,
# palette consistent with the rest of its side
PICKS = {
    'pw': 0, 'rw': 1, 'nw': 1, 'bw': 0, 'qw': 2, 'kw': 1,
    'pb': 0, 'rb': 1, 'nb': 0, 'bb': 1, 'qb': 2, 'kb': 1,
}
# Other styles: candidate per piece, chosen off sheets.py; missing means 0.
STYLE_PICKS = {
    'gummy': {'bw': 1, 'qw': 1, 'nb': 1, 'bb': 1, 'qb': 1, 'kb': 1},
    'felt': {'nb': 2, 'bb': 3},
    'wood': {'qb': 2},
    'manga': {'nw': 1},
    'comic': {'bb': 1, 'nb': 2},
    'crystal': {'nb': 2},
    'ink': {'qw': 2},
    'chibi': {'pw': 0, 'rw': 2, 'nw': 0, 'bw': 0, 'qw': 0, 'kw': 0, 'pb': 0, 'rb': 2, 'nb': 1, 'bb': 1, 'qb': 1, 'kb': 0},
    'pixel': {'pw': 1, 'rw': 0, 'nw': 1, 'bw': 0, 'qw': 1, 'kw': 1, 'pb': 0, 'rb': 0, 'nb': 2, 'bb': 1, 'qb': 1, 'kb': 1},
}
if STYLE:
    PICKS = {k: STYLE_PICKS.get(STYLE, {}).get(k, 0) for k in PICKS}

for name, cand in PICKS.items():
    kind = name[0]
    src = os.path.join(SRC, f'{name}_c{cand}.png')
    dst = os.path.join(DEST, f'{kind}{name[1]}.webp')
    subprocess.run([sys.executable, os.path.join(ROOT, 'cutout.py'), src, dst, kind], check=True)

# proof sheet on a checkerboard, so a bad key shows up immediately
CELL = 128
sheet = Image.new('RGB', (CELL * 6, CELL * 2))
for r, side in enumerate('wb'):
    for c, kind in enumerate('prnbqk'):
        light = (r + c) % 2 == 0
        tile = Image.new('RGB', (CELL, CELL), (239, 227, 200) if light else (154, 168, 133))
        pc = Image.open(os.path.join(DEST, f'{kind}{side}.webp')).resize((CELL, CELL))
        tile.paste(pc, (0, 0), pc)
        sheet.paste(tile, (c * CELL, r * CELL))
sheet.save(os.path.join(ROOT, 'proof.png'))
print('proof.png written')
