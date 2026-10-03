# -*- coding: utf-8 -*-
# Every finished piece set on a strip of board squares, one row per style, so
# the sets can be compared at the size the app actually shows them.
#   python proof_styles.py
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.abspath(__file__))
PIECES = os.path.normpath(os.path.join(ROOT, '..', '..', 'public', 'pieces'))
LIGHT, DARK = (221, 201, 162), (147, 161, 125)
CELL = 96

styles = ['cartoon'] + sorted(d for d in os.listdir(PIECES) if os.path.isdir(os.path.join(PIECES, d)))
cols = [k + s for s in 'wb' for k in 'prnbqk']
sheet = Image.new('RGB', (CELL * len(cols) + 90, CELL * len(styles)), (255, 255, 255))
d = ImageDraw.Draw(sheet)
for r, style in enumerate(styles):
    folder = PIECES if style == 'cartoon' else os.path.join(PIECES, style)
    d.text((8, r * CELL + 8), style, fill=(0, 0, 0))
    for c, name in enumerate(cols):
        tile = Image.new('RGB', (CELL, CELL), LIGHT if (r + c) % 2 == 0 else DARK)
        f = os.path.join(folder, f'{name}.webp')
        if os.path.exists(f):
            im = Image.open(f).resize((CELL, CELL))
            tile.paste(im, (0, 0), im)
        sheet.paste(tile, (90 + c * CELL, r * CELL))
sheet.save(os.path.join(ROOT, 'proof_styles.png'))
print(len(styles), 'styles ->', 'proof_styles.png')
