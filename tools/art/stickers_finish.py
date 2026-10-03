# -*- coding: utf-8 -*-
# Chosen sticker candidates -> keyed, trimmed, fitted webp in public/room/ and
# public/pets/. Unlike the pieces there is no shared baseline: each sticker is
# simply fitted into its canvas and the room places it by percentage.
#   python stickers_finish.py
import os, sys
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cutout import flood_background  # noqa: E402

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'out_stickers')
PUBLIC = os.path.normpath(os.path.join(ROOT, '..', '..', 'public'))
CANVAS = 320

# candidate index per item, chosen off the contact sheet
PICKS = {
    'plant': 0, 'trophy': 0, 'lamp': 0, 'books': 1, 'globe': 1, 'teapot': 1, 'clock': 1,
    'poster': 0, 'cushion': 1, 'telescope': 0, 'kite': 1, 'radio': 1, 'cactus': 1,
    'bunting': 0, 'lantern': 1, 'sailboat': 0, 'flowers': 1, 'medal': 1,
    'cat': 'g3', 'fox': 'g1', 'dragon': 'g2', 'owl': 'g2',
    'cat2': 'g1', 'cat3': 'g1', 'fox2': 'g6', 'fox3': 'g1', 'owl2': 'g1', 'owl3': 'g9', 'dragon2': 'g1', 'dragon3': 'g10',
}
PETS = {'cat', 'fox', 'dragon', 'owl', 'cat2', 'cat3', 'fox2', 'fox3', 'owl2', 'owl3', 'dragon2', 'dragon3'}
FURNITURE = {'rug', 'armchair', 'bookshelf', 'desk', 'bed', 'chesstable', 'fireplace', 'beanbag',
             'piano', 'aquarium', 'wardrobe', 'mirror', 'floorlamp'}
PICKS.update({'rug': 0, 'armchair': 0, 'bookshelf': 1, 'desk': 1, 'bed': 0, 'chesstable': 0, 'fireplace': 0,
              'beanbag': 0, 'piano': 1, 'aquarium': 1, 'wardrobe': 1, 'mirror': 0, 'floorlamp': 0})


def largest_blob(fg):
    """Keep only the biggest connected piece of foreground: the model likes to
    drop a stray sparkle or a tiny second object in a corner."""
    h, w = fg.shape
    seen = np.zeros_like(fg)
    best, best_n = None, 0
    ys, xs = np.nonzero(fg)
    for y0, x0 in zip(ys[::7], xs[::7]):
        if seen[y0, x0]:
            continue
        comp = np.zeros_like(fg)
        stack = [(y0, x0)]
        n = 0
        while stack:
            y, x = stack.pop()
            if seen[y, x] or not fg[y, x]:
                continue
            seen[y, x] = True
            comp[y, x] = True
            n += 1
            if y > 0: stack.append((y - 1, x))
            if y < h - 1: stack.append((y + 1, x))
            if x > 0: stack.append((y, x - 1))
            if x < w - 1: stack.append((y, x + 1))
        if n > best_n:
            best, best_n = comp, n
    return best if best is not None else fg


def sticker(src, dst):
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im)
    bg = flood_background(rgb)
    fg = largest_blob(~bg)
    alpha = np.where(fg, 255, 0).astype(np.uint8)
    out = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')
    a = out.getchannel('A').filter(ImageFilter.GaussianBlur(1.0))
    out.putalpha(a)
    box = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        raise SystemExit(f'{src}: nothing left after keying')
    out = out.crop(box)
    scale = min(CANVAS / out.width, CANVAS / out.height)
    out = out.resize((max(1, round(out.width * scale)), max(1, round(out.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(out, ((CANVAS - out.width) // 2, CANVAS - out.height))
    canvas.save(dst, 'WEBP', quality=88, method=6)
    return out.size


def main():
    only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
    for name, cand in PICKS.items():
        if only and name not in only:
            continue
        # a plain number is a txt2img candidate (_c0); a string like 'e1' names an
        # img2img evolution candidate from stickers_evolve.py (_e1)
        src = os.path.join(SRC, f'{name}_{cand if isinstance(cand, str) else f"c{cand}"}.png')
        if not os.path.exists(src):
            print('missing', src)
            continue
        folder = os.path.join(PUBLIC, 'pets' if name in PETS else 'furniture' if name in FURNITURE else 'room')
        os.makedirs(folder, exist_ok=True)
        dst = os.path.join(folder, f'{name}.webp')
        print(name, sticker(src, dst))
    print('done')


if __name__ == '__main__':
    main()
