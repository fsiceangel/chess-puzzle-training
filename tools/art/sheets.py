# -*- coding: utf-8 -*-
# Contact sheet per piece type so the candidates can be compared side by side.
#   python sheets.py
import glob, os
from PIL import Image, ImageDraw

import sys
ROOT = os.path.dirname(os.path.abspath(__file__))
STYLE = sys.argv[1] if len(sys.argv) > 1 else None
SRC = os.path.join(ROOT, 'out', STYLE) if STYLE else os.path.join(ROOT, 'out')
CELL = 300

for side in 'wb':
    tiles = []
    for kind in 'prnbqk':
        for cand in range(3):
            f = os.path.join(SRC, f'{kind}{side}_c{cand}.png')
            if os.path.exists(f):
                tiles.append((f'{kind}{cand}', Image.open(f).resize((CELL, CELL))))
    if not tiles:
        continue
    cols = 3
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new('RGB', (CELL * cols, CELL * rows), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    for i, (label, im) in enumerate(tiles):
        x, y = (i % cols) * CELL, (i // cols) * CELL
        sheet.paste(im, (x, y))
        d.rectangle([x + 4, y + 4, x + 62, y + 34], fill=(0, 0, 0))
        d.text((x + 12, y + 12), label, fill=(255, 255, 255))
    sheet.save(os.path.join(ROOT, f'sheet_{STYLE + "_" if STYLE else ""}{side}.png'))
    print('sheet_' + side, len(tiles), 'tiles')
