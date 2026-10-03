# -*- coding: utf-8 -*-
# Contact sheet of sticker candidates: one row per item, candidates across.
#   python stickers_sheet.py
import glob, os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'out_stickers')
CELL = 200

names = sorted({os.path.basename(f).rsplit('_c', 1)[0] for f in glob.glob(os.path.join(SRC, '*.png'))})
cols = 2
sheet = Image.new('RGB', (CELL * cols + 120, CELL * len(names)), (255, 255, 255))
d = ImageDraw.Draw(sheet)
for row, name in enumerate(names):
    d.text((8, row * CELL + 8), name, fill=(0, 0, 0))
    for cand in range(cols):
        f = os.path.join(SRC, f'{name}_c{cand}.png')
        if os.path.exists(f):
            sheet.paste(Image.open(f).resize((CELL, CELL)), (120 + cand * CELL, row * CELL))
sheet.save(os.path.join(ROOT, 'stickers_sheet.png'))
print(len(names), 'items')
