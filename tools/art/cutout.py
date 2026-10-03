# -*- coding: utf-8 -*-
# Turns a generated square PNG into a chess-piece sprite:
#   1. floods the flat background away from the four corners -> alpha
#   2. crops to what is left
#   3. rescales to a fixed height per piece type and sits it on a common
#      baseline, so a king and a pawn line up on the board no matter how the
#      model framed them
#
#   python cutout.py <in.png> <out.webp> <type k|q|r|b|n|p>
import sys
import numpy as np
from PIL import Image, ImageFilter

CANVAS = 256
BASELINE = 0.975  # where the foot of every piece sits, as a fraction of canvas
# Relative heights, so the set keeps a chess set's own hierarchy.
HEIGHTS = {'k': 0.95, 'q': 0.90, 'b': 0.86, 'n': 0.83, 'r': 0.78, 'p': 0.66}
TOLERANCE = 48


def flood_background(rgb):
    """Everything reachable from the image edge that matches the colour of the
    edge it was reached from. Seeding each corner with its own colour (rather
    than one average) handles backdrops the model split into two flat tones."""
    h, w, _ = rgb.shape
    bg = np.zeros((h, w), dtype=bool)
    seen = np.zeros((h, w), dtype=bool)
    img = rgb.astype(np.int16)
    seeds = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    seeds += [(y, x) for y in (0, h - 1) for x in range(0, w, 32)]
    seeds += [(y, x) for x in (0, w - 1) for y in range(0, h, 32)]
    for sy, sx in seeds:
        if seen[sy, sx]:
            continue
        ref = img[sy, sx]
        close = np.abs(img - ref).sum(axis=2) < TOLERANCE
        if not close[sy, sx]:
            continue
        stack = [(sy, sx)]
        while stack:
            y, x = stack.pop()
            if seen[y, x] or not close[y, x]:
                continue
            seen[y, x] = True
            bg[y, x] = True
            if y > 0:
                stack.append((y - 1, x))
            if y < h - 1:
                stack.append((y + 1, x))
            if x > 0:
                stack.append((y, x - 1))
            if x < w - 1:
                stack.append((y, x + 1))
    return bg


def main():
    src, dst, kind = sys.argv[1], sys.argv[2], sys.argv[3]
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im)
    bg = flood_background(rgb)
    alpha = np.where(bg, 0, 255).astype(np.uint8)

    out = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')
    # soften the cut so the edge does not look stamped out
    a = out.getchannel('A').filter(ImageFilter.GaussianBlur(1.1))
    out.putalpha(a)

    box = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        raise SystemExit(f'{src}: nothing left after keying the background')
    out = out.crop(box)

    target_h = int(CANVAS * HEIGHTS[kind])
    scale = target_h / out.height
    if out.width * scale > CANVAS:  # very wide piece: fit the width instead
        scale = CANVAS / out.width
    out = out.resize((max(1, round(out.width * scale)), max(1, round(out.height * scale))), Image.LANCZOS)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(out, ((CANVAS - out.width) // 2, int(CANVAS * BASELINE) - out.height))
    canvas.save(dst, 'WEBP', quality=90, method=6)
    print(f'{dst}  {out.width}x{out.height} on {CANVAS}px')


if __name__ == '__main__':
    main()
