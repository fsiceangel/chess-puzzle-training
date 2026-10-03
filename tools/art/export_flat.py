# -*- coding: utf-8 -*-
# The drawn cel-shaded pieces as finished sprites -- no model involved. A
# fallback and a way to eyeball the silhouettes; the shop sells the repainted
# styles from styles.py. One fixed crop for every piece keeps the drawn size
# hierarchy (short pawn, tall king) exactly as designed.
#   python export_flat.py            -> out/drawn/<palette>/
#   python export_flat.py --install  -> public/pieces/ (the ivory palette, as the default set)
import os
from PIL import Image
import silhouette

ROOT = os.path.dirname(os.path.abspath(__file__))
import sys
INSTALL = '--install' in sys.argv
DEST = os.path.normpath(os.path.join(ROOT, '..', '..', 'public', 'pieces')) if INSTALL else os.path.join(ROOT, 'out', 'drawn')
os.makedirs(DEST, exist_ok=True)

CANVAS = 256
S, B = silhouette.SIZE, silhouette.B
BOX = (S // 2 - 480, B - 930, S // 2 + 480, B + 30)   # 960x960, room for the king's cross

for palette in (['ivory'] if INSTALL else silhouette.PALETTES):
    d = DEST if INSTALL else os.path.join(DEST, palette)
    os.makedirs(d, exist_ok=True)
    for kind in 'prnbqk':
        for side in 'wb':
            im = silhouette.draw_sprite(kind, side, palette).crop(BOX).resize((CANVAS, CANVAS), Image.LANCZOS)
            im.save(os.path.join(d, f'{kind}{side}.webp'), 'WEBP', quality=92, method=6)
    print(palette, 'x12')
print('done ->', DEST)
