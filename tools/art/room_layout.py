# -*- coding: utf-8 -*-
# Sizes and spots for everything in the room, derived from what each sprite
# actually contains. Every sprite is a square canvas with the object bottom-
# aligned, so the object's height on screen is  w% * 16/9 * (content height /
# canvas). Give each item the height it should have in the room and the width
# follows; give it a foot line and the y follows.
#
#   python room_layout.py            rewrites x/y/w in src/data/shop.js and renders room_layout.png
import os, re, io
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(ROOT, '..', '..', 'public'))
SHOP = os.path.normpath(os.path.join(ROOT, '..', '..', 'src', 'data', 'shop.js'))
ASPECT = 16 / 9

WALL, SILL, MID, FLOOR, FRONT = 84, 57, 91, 94, 97   # foot lines, % of room height

# item: (height % of room, foot line, x % of room width)
FURNITURE = {
    'rug': (10, 98, 34), 'armchair': (30, FRONT, 6), 'bookshelf': (52, WALL, 87), 'desk': (34, WALL, 64),
    'bed': (30, MID, 2), 'chesstable': (24, MID, 60), 'fireplace': (44, WALL, 13), 'beanbag': (18, FRONT, 88),
    'piano': (32, FRONT, 70), 'aquarium': (26, MID, 27), 'wardrobe': (56, WALL, 0), 'mirror': (42, WALL, 31),
    'floorlamp': (46, FRONT, 24), 'shelf': (16, 30, 3), 'hangingshelf': (22, 34, 81), 'windowseat': (34, 62, 33),
}
DECOR = {
    'plant': (20, FLOOR, 22), 'books': (7, SILL, 14), 'lamp': (11, SILL, 62), 'cactus': (8, SILL, 23),
    'flowers': (10, SILL, 66), 'teapot': (7, SILL, 37), 'clock': (10, 18, 6), 'bunting': (9, 12, 24),
    'radio': (9, SILL, 8), 'kite': (16, 40, 57), 'lantern': (13, 18, 92), 'sailboat': (9, SILL, 4),
    'cushion': (11, FRONT, 86), 'poster': (14, 26, 38), 'globe': (12, FLOOR, 8), 'telescope': (26, FLOOR, 72),
    'campfire': (13, FRONT, 4), 'tent': (26, MID, 84), 'outdoortable': (20, FLOOR, 56), 'backpack': (14, FLOOR, 20),
    'hangingplant': (16, 20, 70), 'booksbundle': (7, SILL, 7), 'cattower': (34, MID, 88), 'catbed': (11, FLOOR, 30),
    'raftingboat': (15, FRONT, 44), 'fishart': (12, 24, 22), 'chessboard': (6, SILL, 66), 'map': (13, 22, 50),
    'medal': (8, 24, 54), 'trophy': (9, SILL, 29),
}


def content_height(path):
    a = np.asarray(Image.open(path).convert('RGBA').getchannel('A'))
    ys = np.nonzero(a.max(axis=1) > 24)[0]
    return (ys.max() - ys.min() + 1) / a.shape[0] if len(ys) else 1.0


def spot(name, folder, spec):
    height, foot, x = spec
    hf = content_height(os.path.join(PUB, folder, f'{name}.webp'))
    w = height / (ASPECT * hf)                       # canvas width that makes the content this tall
    y = foot - w * ASPECT                           # canvas bottom on the foot line
    return round(x, 1), round(y, 1), round(w, 1)


def main():
    s = io.open(SHOP, encoding='utf-8').read()
    spots = {}
    for name, spec in FURNITURE.items():
        spots[name] = spot(name, 'furniture', spec)
    for name, spec in DECOR.items():
        spots[name] = spot(name, 'room', spec)
    n = 0
    for name, (x, y, w) in spots.items():
        s, k = re.subn(rf"(\{{ id: '{name}', name: [^,]+, price: \d+,) x: [-\d.]+, y: [-\d.]+, w: [\d.]+,",
                       rf"\1 x: {x}, y: {y}, w: {w},", s)
        n += k
    io.open(SHOP, 'w', encoding='utf-8', newline='\n').write(s)
    print(f'{n} spots written')

    # a mock-up with everything placed, to judge scale without the browser
    W, H = 1344, 756
    room = Image.open(os.path.join(PUB, 'room', 'bg.webp')).convert('RGBA').resize((W, H))
    order = sorted(spots.items(), key=lambda kv: kv[1][1] + kv[1][2] * ASPECT)   # painter's order by foot
    order = [kv for kv in order if kv[0] == 'rug'] + [kv for kv in order if kv[0] != 'rug']
    for name, (x, y, w) in order:
        folder = 'furniture' if name in FURNITURE else 'room'
        im = Image.open(os.path.join(PUB, folder, f'{name}.webp')).convert('RGBA')
        pw = int(W * w / 100)
        im = im.resize((pw, pw), Image.LANCZOS)
        room.alpha_composite(im, (int(W * x / 100), int(H * y / 100)))
    room.convert('RGB').save(os.path.join(ROOT, 'room_layout.png'))
    print('room_layout.png')


if __name__ == '__main__':
    main()
