# -*- coding: utf-8 -*-
# Companion sprites cut from a hand-supplied evolution sheet (tools/art/ref/*.png,
# one panel per stage). The panels have painted backgrounds, so this uses a
# segmentation model rather than colour keying.
#   python ref_cutout.py            -> public/pets/<pet>[stage].webp
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'ref')
DEST = os.path.normpath(os.path.join(ROOT, '..', '..', 'public', 'pets'))
CANVAS = 320
# isnet-anime keeps whole characters best; on the two panels whose background
# is as dark as the character (spirit fox, ancient dragon) the general model
# separates them more cleanly
MODEL = {}  # flat-background sheet: isnet-anime handles every panel
sessions = {}


def session_for(name):
    m = MODEL.get(name, 'isnet-anime')
    if m not in sessions:
        sessions[m] = new_session(m)
    return sessions[m]

sys.path.insert(0, ROOT)
from stickers_finish import largest_blob  # noqa: E402


def cut(name):
    src = Image.open(os.path.join(SRC, f'{name}.png')).convert('RGB')
    out = remove(src, session=session_for(name), alpha_matting=False).convert('RGBA')
    a = np.asarray(out.getchannel('A'))
    keep = largest_blob(a > 96)
    alpha = np.where(keep, a, 0).astype(np.uint8)
    out.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    box = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    out = out.crop(box)
    scale = min(CANVAS / out.width, CANVAS / out.height)
    out = out.resize((max(1, round(out.width * scale)), max(1, round(out.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(out, ((CANVAS - out.width) // 2, CANVAS - out.height))
    canvas.save(os.path.join(DEST, f'{name}.webp'), 'WEBP', quality=90, method=6)
    return out.size


if __name__ == '__main__':
    names = sys.argv[1].split(',') if len(sys.argv) > 1 else [p + s for p in ('cat', 'fox', 'owl', 'dragon') for s in ('', '2', '3')]
    for n in names:
        print(n, cut(n), flush=True)
    print('done ->', DEST)
