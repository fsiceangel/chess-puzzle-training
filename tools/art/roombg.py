# -*- coding: utf-8 -*-
# The study itself, as one painted background the decorations sit on top of.
# Furniture is asked for in fixed places so the decoration spots in
# src/data/shop.js land on a shelf, a desk or the floor.
#   python roombg.py            4 candidates into out_room/
import os, torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

MODEL = os.environ.get('SDXL_MODEL')
if not MODEL or not os.path.exists(MODEL):
    raise SystemExit('set SDXL_MODEL to an SDXL .safetensors checkpoint')
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out_room')
os.makedirs(OUT, exist_ok=True)

Q = 'masterpiece, best quality, very aesthetic, absurdres'
PROMPT = ('interior of a cozy child study room, studio ghibli anime background art, cel shaded, '
          'clean lineart, flat colors with soft shadows, warm afternoon light, '
          'front view, straight on, eye level, '
          'an empty wooden desk in the center of the room, an empty wooden wall shelf on the left wall, '
          'a window with a green hill outside on the right wall, wooden floor, cream wallpaper, '
          'no people, no objects on the desk, no objects on the shelf, tidy, spacious, ' + Q)
NEG = ('1girl, 1boy, human, person, cat, animal, character, text, letters, watermark, signature, '
       'cluttered, many objects, books, plants, toys, lamp, clock, poster, '
       'photo, 3d render, watercolor, washed out, faded, desaturated, low contrast, blurry, '
       'lowres, worst quality, low quality, jpeg artifacts, fisheye, tilted')

pipe = StableDiffusionXLPipeline.from_single_file(MODEL, torch_dtype=torch.float16, use_safetensors=True)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.enable_model_cpu_offload()
pipe.enable_vae_slicing()
pipe.enable_attention_slicing()

for cand in range(4):
    path = os.path.join(OUT, f'room_c{cand}.png')
    if os.path.exists(path):
        continue
    g = torch.Generator('cuda').manual_seed(2468 + cand * 101)
    img = pipe(prompt=PROMPT, negative_prompt=NEG, width=1344, height=768,
               num_inference_steps=32, guidance_scale=7.0, generator=g).images[0]
    img.save(path)
    print('saved', os.path.basename(path), flush=True)
print('DONE')
