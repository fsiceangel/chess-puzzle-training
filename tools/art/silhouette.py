# -*- coding: utf-8 -*-
# Init images for img2img. Classic chess forms -- horse-head knight, crenellated
# rook, mitred bishop -- drawn big and blunt so the defining feature of each
# piece survives being repainted.
#
# They are drawn already cel-shaded: a dark side, a highlight band and an ink
# outline. A flat silhouette gives the model nothing to work with, so at low
# strength the result stays flat and at high strength the model invents its own
# shape. Shading in the init lets a moderate strength keep both.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
B = 940                      # every piece stands on this line
BACKDROP = (172, 168, 160)

PALETTES = {
    'ivory': {
        'w': dict(body=(250, 238, 200), shadow=(214, 188, 136), light=(255, 251, 232),
                  trim=(236, 200, 110), trim_shadow=(196, 152, 70), ink=(118, 92, 56)),
        'b': dict(body=(98, 80, 66), shadow=(58, 46, 40), light=(134, 112, 94),
                  trim=(158, 116, 72), trim_shadow=(110, 78, 46), ink=(34, 26, 22)),
    },
    'rose': {
        'w': dict(body=(252, 224, 230), shadow=(226, 170, 186), light=(255, 246, 248),
                  trim=(240, 190, 120), trim_shadow=(200, 140, 80), ink=(140, 70, 96)),
        'b': dict(body=(120, 60, 90), shadow=(76, 34, 58), light=(160, 96, 128),
                  trim=(220, 170, 100), trim_shadow=(170, 120, 60), ink=(48, 18, 36)),
    },
    'jade': {
        'w': dict(body=(232, 244, 226), shadow=(178, 208, 170), light=(248, 252, 244),
                  trim=(214, 196, 120), trim_shadow=(170, 150, 80), ink=(60, 96, 70)),
        'b': dict(body=(46, 96, 82), shadow=(24, 58, 50), light=(80, 132, 116),
                  trim=(200, 176, 96), trim_shadow=(150, 128, 60), ink=(16, 36, 30)),
    },
    'midnight': {
        'w': dict(body=(226, 232, 246), shadow=(160, 176, 214), light=(246, 248, 255),
                  trim=(220, 224, 236), trim_shadow=(150, 160, 190), ink=(70, 80, 120)),
        'b': dict(body=(46, 54, 110), shadow=(24, 30, 70), light=(84, 96, 160),
                  trim=(200, 206, 228), trim_shadow=(130, 140, 180), ink=(14, 18, 44)),
    },
    'candy': {
        'w': dict(body=(255, 240, 200), shadow=(250, 196, 140), light=(255, 252, 236),
                  trim=(255, 150, 170), trim_shadow=(220, 100, 130), ink=(150, 80, 60)),
        'b': dict(body=(120, 200, 210), shadow=(60, 140, 160), light=(170, 230, 236),
                  trim=(255, 150, 170), trim_shadow=(220, 100, 130), ink=(30, 80, 100)),
    },
}
PALETTE = PALETTES['ivory']


class Sheet:
    """Two masks (body, trim) that the piece drawers paint into."""

    def __init__(self):
        self.body = Image.new('L', (SIZE, SIZE), 0)
        self.trim = Image.new('L', (SIZE, SIZE), 0)
        self.db = ImageDraw.Draw(self.body)
        self.dt = ImageDraw.Draw(self.trim)
        self.cuts = []   # shapes to carve out afterwards (the bishop's slit)


def _base(s, cx, w):
    s.dt.polygon([(cx - w, B - 30), (cx - w * 0.66, B - 120), (cx + w * 0.66, B - 120), (cx + w, B - 30)], fill=255)
    s.dt.ellipse([cx - w, B - 70, cx + w, B + 20], fill=255)
    s.db.rounded_rectangle([cx - w * 0.62, B - 175, cx + w * 0.62, B - 105], 26, fill=255)


def _shapes(kind, s):
    cx = SIZE // 2
    if kind == 'p':
        _base(s, cx, 175)
        s.db.polygon([(cx - 105, B - 170), (cx - 72, B - 380), (cx + 72, B - 380), (cx + 105, B - 170)], fill=255)
        s.dt.ellipse([cx - 118, B - 425, cx + 118, B - 345], fill=255)
        s.db.ellipse([cx - 150, B - 700, cx + 150, B - 400], fill=255)

    elif kind == 'r':
        _base(s, cx, 205)
        s.db.polygon([(cx - 148, B - 170), (cx - 138, B - 520), (cx + 138, B - 520), (cx + 148, B - 170)], fill=255)
        s.dt.rounded_rectangle([cx - 205, B - 610, cx + 205, B - 500], 16, fill=255)
        for k in (-1, 0, 1):
            s.db.rectangle([cx + k * 145 - 62, B - 760, cx + k * 145 + 62, B - 600], fill=255)
        s.db.rectangle([cx - 205, B - 660, cx + 205, B - 600], fill=255)

    elif kind == 'n':
        _base(s, cx, 200)
        s.db.polygon([(cx - 120, B - 170), (cx - 95, B - 350), (cx + 155, B - 350), (cx + 185, B - 170)], fill=255)
        s.db.polygon([
            (cx - 95, B - 330), (cx + 160, B - 330), (cx + 180, B - 540), (cx + 125, B - 700),
            (cx + 62, B - 812), (cx + 30, B - 690), (cx - 12, B - 786), (cx - 72, B - 662),
            (cx - 205, B - 622), (cx - 285, B - 556), (cx - 300, B - 492), (cx - 232, B - 452),
            (cx - 148, B - 476), (cx - 118, B - 408),
        ], fill=255)
        s.dt.ellipse([cx - 262, B - 528, cx - 226, B - 496], fill=255)     # nostril
        s.dt.ellipse([cx - 118, B - 604, cx - 74, B - 562], fill=255)      # eye
        s.dt.polygon([(cx + 100, B - 690), (cx + 175, B - 560), (cx + 150, B - 360), (cx + 95, B - 380),
                      (cx + 120, B - 540)], fill=255)                      # mane

    elif kind == 'b':
        _base(s, cx, 180)
        s.db.polygon([(cx - 108, B - 170), (cx - 84, B - 330), (cx + 84, B - 330), (cx + 108, B - 170)], fill=255)
        s.dt.ellipse([cx - 128, B - 378, cx + 128, B - 302], fill=255)
        s.db.polygon([(cx, B - 790), (cx + 128, B - 560), (cx + 138, B - 400), (cx - 138, B - 400), (cx - 128, B - 560)], fill=255)
        s.cuts.append([(cx + 42, B - 730), (cx - 40, B - 560)])            # the bishop's slit
        s.dt.ellipse([cx - 46, B - 862, cx + 46, B - 770], fill=255)

    elif kind == 'q':
        _base(s, cx, 205)
        s.db.polygon([(cx - 125, B - 170), (cx - 92, B - 430), (cx + 92, B - 430), (cx + 125, B - 170)], fill=255)
        s.dt.ellipse([cx - 150, B - 486, cx + 150, B - 396], fill=255)
        s.db.polygon([
            (cx - 175, B - 520), (cx + 175, B - 520), (cx + 205, B - 760), (cx + 105, B - 665),
            (cx + 55, B - 800), (cx, B - 690), (cx - 55, B - 800), (cx - 105, B - 665), (cx - 205, B - 760),
        ], fill=255)
        for dx, dy in ((-205, -760), (-55, -800), (55, -800), (205, -760)):
            s.dt.ellipse([cx + dx - 40, B + dy - 40, cx + dx + 40, B + dy + 40], fill=255)

    elif kind == 'k':
        _base(s, cx, 215)
        s.db.polygon([(cx - 132, B - 170), (cx - 98, B - 450), (cx + 98, B - 450), (cx + 132, B - 170)], fill=255)
        s.dt.ellipse([cx - 158, B - 508, cx + 158, B - 414], fill=255)
        s.db.polygon([
            (cx - 180, B - 540), (cx + 180, B - 540), (cx + 200, B - 730), (cx + 78, B - 668),
            (cx, B - 760), (cx - 78, B - 668), (cx - 200, B - 730),
        ], fill=255)
        s.dt.rectangle([cx - 34, B - 930, cx + 34, B - 730], fill=255)
        s.dt.rectangle([cx - 108, B - 878, cx + 108, B - 812], fill=255)


def _shade(mask, base, shadow, light, cx):
    """Flat colour, a darker right-hand side and a thin highlight band on the
    left: the three tones of a painted animation cel."""
    h, w = mask.shape
    xs = np.arange(w)[None, :]
    out = np.zeros((h, w, 3), dtype=np.uint8)
    out[mask] = base
    shade = mask & (xs > cx + 28)
    out[shade] = shadow
    hi = mask & (xs > cx - 128) & (xs < cx - 82)
    out[hi] = light
    return out


def _paint(kind, side, palette='ivory'):
    """Returns (rgb, whole_mask, ground_alpha) for a shaded piece."""
    s = Sheet()
    _shapes(kind, s)
    for a, b in s.cuts:
        for m in (s.body, s.trim):
            ImageDraw.Draw(m).line([a, b], fill=0, width=26)

    pal = PALETTES[palette][side]
    cx = SIZE // 2
    body = np.asarray(s.body) > 127
    trim = np.asarray(s.trim) > 127
    trim_only = trim & ~body
    whole = body | trim

    ground = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(ground).ellipse([cx - 260, B - 30, cx + 260, B + 50], fill=110)
    ground = np.asarray(ground.filter(ImageFilter.GaussianBlur(18))) / 255.0

    img = np.zeros((SIZE, SIZE, 3), dtype=np.uint8)
    layer = _shade(body, pal['body'], pal['shadow'], pal['light'], cx)
    img[body] = layer[body]
    layer = _shade(trim_only, pal['trim'], pal['trim_shadow'], pal['light'], cx)
    img[trim_only] = layer[trim_only]

    # ink outline: the silhouette minus itself eroded a few pixels
    m = Image.fromarray((whole * 255).astype(np.uint8))
    inner = np.asarray(m.filter(ImageFilter.MinFilter(9))) > 127
    edge = whole & ~inner
    img[edge] = pal['ink']
    # a lighter inner line between body and trim so the collar reads as a part
    tm = Image.fromarray((trim_only * 255).astype(np.uint8))
    tin = np.asarray(tm.filter(ImageFilter.MinFilter(5))) > 127
    img[trim_only & ~tin] = pal['ink']
    return img, whole, ground


def draw(kind, side):
    """Shaded piece on a flat backdrop: the img2img init image."""
    rgb, whole, ground = _paint(kind, side)
    out = np.zeros((SIZE, SIZE, 3), dtype=np.uint8)
    out[:, :] = BACKDROP
    out = (out * (1 - ground[..., None] * 0.5)).astype(np.uint8)
    out[whole] = rgb[whole]
    return Image.fromarray(out, 'RGB')


def draw_sprite(kind, side, palette='ivory'):
    """Shaded piece on transparency, ground shadow kept as soft alpha: a
    finished sprite in its own right."""
    rgb, whole, ground = _paint(kind, side, palette)
    alpha = (ground * 0.45 * 255).astype(np.uint8)
    alpha[whole] = 255
    rgba = np.dstack([rgb, alpha])
    rgba[~whole, :3] = (20, 14, 10)   # shadow colour under the soft alpha
    return Image.fromarray(rgba, 'RGBA')


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    for kind in 'prnbqk':
        for side in 'wb':
            draw(kind, side).save(f'{out}/sil_{kind}{side}.png')
    print('silhouettes written')
