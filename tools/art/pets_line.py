# -*- coding: utf-8 -*-
# A companion's whole evolution line in one batch, the way the adventurer
# game's character sheets are made: one style prefix for everything, one
# identity line per animal (species, colours, eyes), and a bold description of
# what each stage IS. Consistency comes from the shared prefix and identity,
# not from timid changes -- so stage 3 can be a nine-tailed spirit fox and
# still be the same fox in the same style.
#
#   python pets_line.py            4 candidates x 3 stages x 4 pets -> out_stickers/<pet>[stage]_g<i>.png
import os, sys, torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

MODEL = os.environ.get('SDXL_MODEL')
if not MODEL or not os.path.exists(MODEL):
    raise SystemExit('set SDXL_MODEL to an SDXL .safetensors checkpoint')
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out_stickers')

Q = 'masterpiece, best quality, very aesthetic, absurdres'
# CLIP reads only the first 77 tokens, so this stays short: identity + stage
# + style + background must all fit, and the background words go early.
STYLE = 'plain flat pastel background, ghibli anime style, cel shaded, bold lineart, flat colors, cute, full body, centered'
NEG = ('extra limbs, extra legs, six legs, extra arms, malformed limbs, '
       '1girl, 1boy, human, humanoid, person, catgirl, personification, hair, dress, clothes on a person, '
       'different animal, different fur color, realistic, photo, 3d render, text, letters, watermark, '
       'multiple characters, duplicate, scenery, cluttered background, gradient background, circle background, '
       'badge, halo, blurry, lowres, worst quality, low quality')

WHO = {
    'cat': 'an orange and cream chubby cat with green eyes',
    'fox': 'a white fox with orange-tipped ears and tail and green eyes',
    'owl': 'a brown and cream owl with big round eyes',
    'dragon': 'a green dragon with red eyes',
}
STAGES = {
    'cat': {
        1: 'as a tiny kitten with oversized ears, sitting, curious',
        2: 'as a young knight cat wearing a red scarf and a small silver breastplate, sitting proudly, confident',
        3: 'as the Cat King: majestic, golden crown with a red gem, flowing red royal cape, golden armor, golden aura',
    },
    'fox': {
        1: 'as a tiny fluffy fox kit, sitting, playful',
        2: 'as a ranger fox on all fours, sitting like a fox, a dark green hooded cloak draped over its back, leather satchel, alert',
        3: 'as a nine-tailed spirit fox: nine huge fluffy tails fanned out, pale blue spirit flames, glowing eyes, majestic',
    },
    'owl': {
        1: 'as a fluffy round owlet with oversized eyes, perched on a branch',
        2: 'as a scholar owl: round spectacles, blue scarf, a small book under one wing, perched on a branch',
        3: 'as a great archmage owl, brown and cream feathers, huge wings spread wide, tall starry wizard hat, starry cloak, glowing magic staff, floating runes, majestic',
    },
    'dragon': {
        1: 'as a tiny round baby dragon hatchling with stubby leaf-shaped wings, sitting',
        2: 'as a young dragon standing tall with green wings spread wide, small golden horns, a puff of smoke',
        3: 'as a huge towering elder dragon standing on all four legs, two enormous wings filling the frame, long golden horns, golden chest scales, head raised roaring a great flame, epic',
    },
}
CANDS = 4

pipe = StableDiffusionXLPipeline.from_single_file(MODEL, torch_dtype=torch.float16, use_safetensors=True)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.enable_model_cpu_offload()
pipe.enable_vae_slicing()
pipe.enable_attention_slicing()

# "fox" does every stage of the fox; "fox:2" just that stage
only = sys.argv[1].split(',') if len(sys.argv) > 1 else list(STAGES)
for spec in only:
    pet, _, st = spec.partition(':')
    for stage, what in STAGES[pet].items():
        if st and stage != int(st):
            continue
        tag = f'{pet}{"" if stage == 1 else stage}'
        have = [int(f[len(tag) + 2:-4]) for f in os.listdir(OUT) if f.startswith(tag + '_g') and f.endswith('.png')]
        start = (max(have) + 1) if (st and have) else 0
        for cand in range(start, start + CANDS):
            path = os.path.join(OUT, f'{tag}_g{cand}.png')
            if os.path.exists(path):
                continue
            g = torch.Generator('cuda').manual_seed(2025 + stage * 101 + cand * 13 + len(pet) * 7)
            prompt = f'{WHO[pet]} {what}, {STYLE}'
            img = pipe(prompt=prompt, negative_prompt=NEG, width=1024, height=1024,
                       num_inference_steps=30, guidance_scale=7.0, generator=g).images[0]
            img.save(path)
            print('saved', os.path.basename(path), flush=True)
print('DONE')
