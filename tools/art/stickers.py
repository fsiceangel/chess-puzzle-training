# -*- coding: utf-8 -*-
# Room decorations and companion animals as stickers, in the same cel-shaded
# style as the pieces. Unlike the pieces these do not have to match each other
# in scale or camera, so plain text-to-image is fine here.
#
#   python stickers.py            2 candidates per item into out_stickers/
import os, sys, torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

MODEL = os.environ.get('SDXL_MODEL')
if not MODEL or not os.path.exists(MODEL):
    raise SystemExit('set SDXL_MODEL to an SDXL .safetensors checkpoint')
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out_stickers')
os.makedirs(OUT, exist_ok=True)

Q = 'masterpiece, best quality, very aesthetic, absurdres'
STYLE = ('studio ghibli anime style, cel shaded, clean bold lineart, flat colors with soft two-tone '
         'shadows and crisp highlights, hand-drawn animation, warm vibrant colors, cute, '
         'single isolated object centered, whole object in frame with margin, '
         'plain flat solid light grey background, nothing behind the object, ' + Q)
NEG = ('circle background, round badge, sticker border, halo, emblem, frame, confetti, sparkles, '
       'pattern background, colorful background, rainbow, '
       '1girl, 1boy, human, person, hands, text, letters, watermark, signature, logo, '
       'multiple objects, duplicate, scenery, room, cluttered background, gradient background, '
       'photo, 3d render, watercolor, washed out, faded, desaturated, low contrast, '
       'lowres, worst quality, low quality, jpeg artifacts, blurry, cropped')

# id -> subject. Ids are what the shop catalogue and the room refer to.
DECOR = {
    'plant':     'a leafy potted fern in a terracotta pot',
    'trophy':    'one small golden trophy cup on a wooden base, plain',
    'lamp':      'a cozy green desk lamp, switched on',
    'books':     'a tidy stack of four old hardcover books',
    'globe':     'a small antique globe on a brass stand',
    'teapot':    'a round ceramic teapot with a teacup beside it',
    'clock':     'a round wooden wall clock',
    'poster':    'a small framed picture of a white horse head, wooden frame, hanging on a wall',
    'cushion':   'a plump round floor cushion with tassels',
    'telescope': 'a brass telescope on a wooden tripod, plain',
    'kite':      'a classic red and white diamond shaped kite with a bow tail, hanging on a wall',
    'radio':     'a small vintage wooden radio',
    'cactus':    'a small round cactus with a pink flower in a pot',
    'bunting':   'a string of colorful triangle bunting flags hanging in a gentle curve, flags only',
    'lantern':   'a round orange paper lantern hanging from a string, softly glowing',
    'sailboat':  'a small wooden toy sailboat with a white sail',
    'flowers':   'a jar of wildflowers',
    'medal':     'one round gold medal on a red and blue striped neck ribbon, hanging straight down, isolated',
}
# Bigger pieces. Asked for straight on so they sit flat against the back wall
# and the floor line the way the decorations do.
FURNITURE = {
    'rug':       'a flat oval woven rug with red and cream stripes lying on the floor, seen from the front at a low angle, isolated',
    'armchair':  'a cozy green armchair with a cushion, front view',
    'bookshelf': 'a tall wooden bookshelf filled with colorful books, front view',
    'desk':      'a small wooden writing desk with a wooden chair, front view',
    'bed':       'a small wooden single bed with a headboard, a patchwork quilt and one pillow, whole bed visible, side view, isolated',
    'chesstable':'a small round wooden side table, a tiny chessboard with little pieces sitting on top of it, whole table visible, front view, isolated',
    'fireplace': 'a brick fireplace with a warm fire and a wooden mantel, front view',
    'beanbag':   'a big soft orange beanbag chair, front view',
    'piano':     'a small upright piano with a stool, front view',
    'aquarium':  'a fish tank on a wooden stand with two goldfish and a plant, front view',
    'wardrobe':  'a tall wooden wardrobe with two doors, front view',
    'mirror':    'a tall oval standing mirror on two wooden legs, plain silver glass, front view, isolated',
    'floorlamp': 'a tall standing floor lamp with a cream shade, switched on, front view',
}
# Evolution stages: 2 = grown a little and dressed up, 3 = fully grown.
PET_STAGES = {
    'cat2':    'a fluffy young cream and orange cat sitting proudly, wearing a small red scarf, big eyes, plain',
    'cat3':    'a big majestic cream and orange cat sitting like a king, wearing a tiny golden crown and a red cape, big calm eyes, plain',
    'fox2':    'a young fox sitting up alert, wearing a green bandana, bushy tail, big eyes, plain',
    'fox3':    'a grand elegant fox with a huge fluffy tail, wearing a green cloak with a gold clasp, wise eyes, plain',
    'owl2':    'a young brown owl perched on a branch wearing tiny round spectacles, big eyes, plain',
    'owl3':    'a great horned owl perched on a branch, wearing spectacles and a small graduation cap, wise, plain',
    'dragon2': 'a young green dragon sitting, proper wings spread a little, a puff of smoke from its nose, big eyes, plain',
    'dragon3': 'a grown green dragon sitting tall, large wings spread, breathing a small friendly flame, golden chest scales, plain',
}
PETS = {
    'cat':    'a chubby cream and orange cat sitting and looking at the viewer, big eyes, tail curled, plain',
    'fox':    'a fluffy young fox sitting and looking at the viewer, big eyes, bushy tail',
    'dragon': 'a small round green baby dragon sitting and looking at the viewer, tiny wings, big eyes, plain',
    'owl':    'a round little brown owl perched on a branch, big eyes',
}

pipe = StableDiffusionXLPipeline.from_single_file(MODEL, torch_dtype=torch.float16, use_safetensors=True)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.enable_model_cpu_offload()
pipe.enable_vae_slicing()
pipe.enable_attention_slicing()

items = ([(k, v, 'decor') for k, v in DECOR.items()] + [(k, v, 'furniture') for k, v in FURNITURE.items()]
         + [(k, v, 'pet') for k, v in PETS.items()] + [(k, v, 'pet') for k, v in PET_STAGES.items()])
only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
for i, (name, subject, kind) in enumerate(items):
    if only and name not in only:
        continue
    for cand in range(2):
        path = os.path.join(OUT, f'{name}_c{cand}.png')
        if os.path.exists(path):
            continue
        extra = 'full body, ' if kind == 'pet' else ''
        g = torch.Generator('cuda').manual_seed(6161 + i * 43 + cand)
        img = pipe(prompt=f'{subject}, {extra}{STYLE}', negative_prompt=NEG, width=1024, height=1024,
                   num_inference_steps=30, guidance_scale=7.0, generator=g).images[0]
        img.save(path)
        print('saved', os.path.basename(path), flush=True)
print('DONE')
