# -*- coding: utf-8 -*-
# Three piece sets drawn entirely in code from the silhouette masks — no model.
#   letters  a bold K Q R B N P on a badge (and a quiet way to learn the names)
#   neon     the classic silhouette as a glowing outline
#   buttons  a round checker with the piece pressed into it
#
#   python glyph_sets.py            -> public/pieces/{letters,neon,buttons}/
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import silhouette

ROOT = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.normpath(os.path.join(ROOT, '..', '..', 'public', 'pieces'))
S, B = silhouette.SIZE, silhouette.B
CANVAS = 256
BOX = (S // 2 - 480, B - 930, S // 2 + 480, B + 30)   # same crop as export_flat, so sizes match
LETTER = {'k': 'K', 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N', 'p': 'P'}


def _solid(path, size):
    """Some fonts here come back as .notdef boxes; a real K fills far more of
    its own bounding box than a hollow rectangle does. Tested on a throwaway
    font object -- see font()."""
    f = ImageFont.truetype(path, size)
    im = Image.new('L', (400, 400), 0)
    ImageDraw.Draw(im).text((20, 20), 'K', font=f, fill=255)
    a = np.asarray(im) > 128
    ys, xs = np.nonzero(a)
    if len(xs) == 0:
        return False
    return a.sum() / ((ys.max() - ys.min() + 1) * (xs.max() - xs.min() + 1)) > 0.4


def font(size):
    """A FRESH font object, to be used for exactly one draw call. On this
    machine a FreeTypeFont renders correctly once and every render after that
    (text, textbbox, anything) comes back as a .notdef box."""
    for name in ('comicbd.ttf', 'segoeuib.ttf', 'calibrib.ttf', 'verdanab.ttf', 'DejaVuSans-Bold.ttf'):
        p = os.path.join(os.environ.get('WINDIR', r'C:\Windows'), 'Fonts', name)
        if os.path.exists(p) and _solid(p, size):
            return ImageFont.truetype(p, size)
    raise SystemExit('no usable bold font found')


def mask_of(kind):
    _, whole, _ = silhouette._paint(kind, 'w')
    return whole


def finish(rgba, name, folder):
    os.makedirs(os.path.join(DEST, folder), exist_ok=True)
    out = rgba.crop(BOX).resize((CANVAS, CANVAS), Image.LANCZOS)
    out.save(os.path.join(DEST, folder, f'{name}.webp'), 'WEBP', quality=92, method=6)


# ---- letters ----
def letters(kind, side):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    badge, ink, rim = ((250, 240, 220), (52, 40, 36), (206, 184, 150)) if side == 'w' else ((58, 48, 46), (250, 240, 220), (28, 22, 20))
    # size hierarchy: pawn smallest, king largest, all standing on the baseline
    size = {'p': 500, 'n': 600, 'b': 600, 'r': 580, 'q': 660, 'k': 700}[kind]
    x0, y0 = S // 2 - size // 2, B - 20 - size
    # soft shadow, rim, face
    sh = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sh).rounded_rectangle([x0 + 10, y0 + 26, x0 + size + 10, y0 + size + 26], size // 5, fill=120)
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    im.paste((30, 20, 20, 255), mask=sh)
    d.rounded_rectangle([x0, y0, x0 + size, y0 + size], size // 5, fill=rim)
    d.rounded_rectangle([x0, y0, x0 + size, y0 + size - 22], size // 5, fill=badge)
    # One draw per font object (see font()); crop by pixels, never measure.
    t = LETTER[kind]
    canvas = Image.new('L', (400, 400), 0)
    ImageDraw.Draw(canvas).text((40, 40), t, font=font(160), fill=255)
    glyph = canvas.crop(canvas.getbbox())
    target_h = int((size - 22) * 0.62)
    glyph = glyph.resize((max(1, int(glyph.width * target_h / glyph.height)), target_h), Image.LANCZOS)
    gx = S // 2 - glyph.width // 2
    gy = y0 + (size - 22) // 2 - glyph.height // 2
    im.paste(ink + (255,), (gx, gy), glyph)
    return im


# ---- neon ----
def neon(kind, side):
    whole = mask_of(kind)
    m = Image.fromarray((whole * 255).astype(np.uint8))
    inner = m.filter(ImageFilter.MinFilter(15))
    edge = Image.fromarray(np.clip(np.asarray(m).astype(int) - np.asarray(inner).astype(int), 0, 255).astype(np.uint8))
    col = (90, 235, 255) if side == 'w' else (255, 96, 210)
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # faint dark body so the piece reads on a light square too
    body = Image.new('RGBA', (S, S), (18, 14, 30, 0))
    body.putalpha(m.point(lambda v: int(v * 0.55)))
    im.alpha_composite(body)
    for radius, alpha in ((30, 110), (12, 170)):
        glow = Image.new('RGBA', (S, S), col + (0,))
        glow.putalpha(edge.filter(ImageFilter.GaussianBlur(radius)).point(lambda v, a=alpha: min(255, int(v * a / 90))))
        im.alpha_composite(glow)
    core = Image.new('RGBA', (S, S), (255, 255, 255, 0))
    core.putalpha(edge.filter(ImageFilter.GaussianBlur(1.5)))
    im.alpha_composite(core)
    return im


# ---- buttons ----
def buttons(kind, side):
    whole = mask_of(kind)
    face, rim, press = ((246, 236, 214), (196, 172, 132), (170, 150, 118)) if side == 'w' else ((70, 60, 58), (36, 30, 28), (108, 96, 92))
    r = {'p': 300, 'n': 340, 'b': 340, 'r': 340, 'q': 370, 'k': 380}[kind]
    cx, cy = S // 2, B - 20 - r
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    sh = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sh).ellipse([cx - r, cy - r + 30, cx + r, cy + r + 30], fill=120)
    im.paste((30, 20, 20, 255), mask=sh.filter(ImageFilter.GaussianBlur(18)))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rim)
    d.ellipse([cx - r, cy - r, cx + r, cy + r - 26], fill=face)
    # the piece, pressed into the face
    m = Image.fromarray((whole * 255).astype(np.uint8))
    bbox = m.getbbox()
    piece = m.crop(bbox)
    scale = (r * 1.25) / max(piece.size)
    piece = piece.resize((max(1, int(piece.width * scale)), max(1, int(piece.height * scale))), Image.LANCZOS)
    px, py = cx - piece.width // 2, cy - 13 - piece.height // 2
    stamp = Image.new('RGBA', (S, S), press + (0,))
    stamp.putalpha(Image.new('L', (S, S), 0))
    stamp.paste(press + (255,), (px, py), piece)
    im.alpha_composite(stamp)
    hi = Image.new('RGBA', (S, S), (255, 255, 255, 0))
    hi.putalpha(Image.new('L', (S, S), 0))
    hi.paste((255, 255, 255, 90), (px - 4, py - 4), piece)
    im.alpha_composite(hi)
    im.alpha_composite(stamp)
    return im


if __name__ == '__main__':
    for folder, fn in (('letters', letters), ('neon', neon), ('buttons', buttons)):
        for kind in 'prnbqk':
            for side in 'wb':
                finish(fn(kind, side), kind + side, folder)
        print(folder, 'x12')
    print('done ->', DEST)
