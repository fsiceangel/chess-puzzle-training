# -*- coding: utf-8 -*-
# Room art from the hand-supplied sheet (tools/art/ref_room.png, tiles mapped
# in ref_room_tiles.json): furniture and decorations are segmented out of their
# cards; the seven room backgrounds are cropped to 16:9 and, because the sheet
# only holds small thumbnails, sharpened with a light img2img pass.
#
#   python ref_room_cut.py objects      -> public/furniture/*.webp, public/room/*.webp
#   python ref_room_cut.py backgrounds [bg,bg_night]  -> public/room/bg*.webp (needs SDXL_MODEL)
import os, sys, json
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(ROOT, '..', '..', 'public'))
SHEET = Image.open(os.path.join(ROOT, 'ref_room.png')).convert('RGB')
TILES = json.load(open(os.path.join(ROOT, 'ref_room_tiles.json')))
CANVAS = 320

FURNITURE = ['rug', 'armchair', 'bookshelf', 'desk', 'bed', 'chesstable', 'fireplace', 'beanbag', 'piano',
             'aquarium', 'wardrobe', 'mirror', 'floorlamp', 'shelf', 'hangingshelf', 'windowseat']
DECOR = ['plant', 'books', 'lamp', 'cactus', 'flowers', 'teapot', 'clock', 'bunting', 'radio', 'kite', 'lantern',
         'sailboat', 'cushion', 'poster', 'globe', 'telescope',
         'campfire', 'tent', 'outdoortable', 'backpack', 'hangingplant', 'booksbundle', 'cattower', 'catbed',
         'raftingboat', 'fishart', 'chessboard', 'map']
BACKGROUNDS = ['bg', 'bg_sakura', 'bg_sunset', 'bg_snow', 'bg_day', 'bg_night', 'bg_moon']


def blobs_keep(fg, min_ratio=0.08):
    """Keep every connected piece at least min_ratio the size of the biggest,
    so a string of bunting or a hanging shelf survives as a whole."""
    h, w = fg.shape
    seen = np.zeros_like(fg)
    comps = []
    ys, xs = np.nonzero(fg)
    for y0, x0 in zip(ys[::5], xs[::5]):
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
        comps.append((n, comp))
    if not comps:
        return fg
    biggest = max(n for n, _ in comps)
    out = np.zeros_like(fg)
    for n, comp in comps:
        if n >= biggest * min_ratio:
            out |= comp
    return out


def soft_key(rgb, card):
    """Alpha from distance to the card colour: a narrow ramp so the object's
    ink edge is solid and the card is gone, with the soft drop shadow under
    each object fading out instead of leaving a beige block."""
    dist = np.abs(rgb.astype(int) - card).sum(axis=2)
    alpha = np.clip((dist - 22) / 30.0, 0, 1)
    # the drop shadow is the card colour, only darker and just as unsaturated;
    # wood, paper and cloth are all more saturated than that
    hsv = np.asarray(Image.fromarray(rgb.astype(np.uint8)).convert('HSV')).astype(int)
    ch, cs, cv = np.asarray(Image.new('RGB', (1, 1), tuple(int(c) for c in card)).convert('HSV')).reshape(3).astype(int)
    hue_close = np.minimum(np.abs(hsv[..., 0] - ch), 255 - np.abs(hsv[..., 0] - ch)) < 14
    shadow = hue_close & (hsv[..., 1] < min(cs + 22, 60)) & (hsv[..., 2] < cv - 6) & (hsv[..., 2] > cv - 75)
    alpha[shadow] = 0
    return alpha


def cut_objects():
    from cutout import flood_background
    for name in FURNITURE + DECOR:
        x0, y0, x1, y1 = TILES[name]
        tile = SHEET.crop((x0 + 3, y0 + 3, x1 - 3, y1 - 24))   # drop the caption strip
        rgb = np.asarray(tile)
        card = np.median(np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3)]), axis=0)
        alpha = soft_key(rgb, card)
        # only what is connected to the object: kills text fragments and arrow tips
        fg = blobs_keep(alpha > 0.5)
        reach = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
        alpha = np.where(reach, alpha, 0)
        m = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))   # shave the fringe
        out = Image.fromarray(np.dstack([rgb, np.asarray(m)]), 'RGBA')
        out.putalpha(out.getchannel('A').filter(ImageFilter.GaussianBlur(0.6)))
        box = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        if not box:
            print(name, 'EMPTY', flush=True)
            continue
        out = out.crop(box)
        scale = min(CANVAS / out.width, CANVAS / out.height)
        out = out.resize((max(1, round(out.width * scale)), max(1, round(out.height * scale))), Image.LANCZOS)
        canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
        canvas.alpha_composite(out, ((CANVAS - out.width) // 2, CANVAS - out.height))
        folder = 'furniture' if name in FURNITURE else 'room'
        canvas.save(os.path.join(PUB, folder, f'{name}.webp'), 'WEBP', quality=90, method=6)
        print(name, out.size, flush=True)


def crop_16x9(im):
    w, h = im.size
    target = 16 / 9
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im.resize((1344, 768), Image.LANCZOS)


def trim_caption(im):
    """The sheet's thumbnails sit on a pale caption band that survives the
    crop; cut any bright band off the bottom and stretch back to 16:9."""
    a = np.asarray(im.convert('RGB')).astype(int)
    rows = a.mean(axis=(1, 2))
    h = len(rows)
    cut = 0
    for y in range(h - 1, int(h * 0.85), -1):
        if rows[y] > 200 and rows[y] - rows[max(0, y - 30)] > 40:
            cut = h - y
    if not cut:
        return im
    return im.crop((0, 0, im.width, im.height - cut - 2)).resize((1344, 768), Image.LANCZOS)


def backgrounds(only=None):
    import torch
    from diffusers import StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler
    model = os.environ.get('SDXL_MODEL')
    pipe = StableDiffusionXLImg2ImgPipeline.from_single_file(model, torch_dtype=torch.float16, use_safetensors=True)
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.enable_model_cpu_offload()
    pipe.enable_vae_slicing()
    pipe.enable_attention_slicing()
    prompt = ('cozy wooden study room interior with a big window, anime background art, cel shaded, clean lineart, '
              'flat colors, soft light, empty floor, no people, no furniture')
    neg = 'people, characters, text, watermark, blurry, lowres, photo'
    for name in (only or BACKGROUNDS):
        x0, y0, x1, y1 = TILES[name]
        init = crop_16x9(SHEET.crop((x0 + 2, y0 + 2, x1 - 2, y1 - 2)))
        init.save(os.path.join(ROOT, 'ref', f'{name}_raw.png'))
        # small thumbnails need more help than the large main panel
        strength = 0.28 if name == 'bg' else 0.42
        g = torch.Generator('cuda').manual_seed(99)
        img = pipe(prompt=prompt, negative_prompt=neg, image=init, strength=strength,
                   num_inference_steps=30, guidance_scale=6.0, generator=g).images[0]
        img = trim_caption(img)
        img.save(os.path.join(PUB, 'room', f'{name}.webp'), 'WEBP', quality=86, method=6)
        print(name, 'ok', flush=True)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'objects'
    if mode == 'objects':
        cut_objects()
    else:
        backgrounds(sys.argv[2].split(',') if len(sys.argv) > 2 else None)
    print('DONE')
