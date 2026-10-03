# -*- coding: utf-8 -*-
# Evolution stages that are the same animal, drawn the same way, but visibly
# cooler each time. What worked, after trying the gentle settings first:
#   - img2img from the stage-1 sticker at strength 0.93 with the animal and its
#     colours spelled out in the prompt: same body, big costume change
#     (cat 2/3, fox 2, owl 3, dragon 2);
#   - pure text-to-image (strength 1.0 from a flat card) with the same identity
#     line, for the stages that need a new silhouette (nine tails, huge wings);
#     colour and style hold, the face drifts a little.
#   Anything below 0.9 only added a small accessory; the old "stage from the
#   previous stage" ladder is kept as stage2/stage3 but was not what shipped.
#
#   python stickers_evolve.py strong                 the two dials above, both stages, 4 pets
#   python stickers_evolve.py stage2                 4 candidates per pet from stage 1 at 0.8
#   python stickers_evolve.py stage3 cat=f1,fox=f0   4 candidates per pet from the chosen stage-2
import os, sys, torch
from diffusers import StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler
from PIL import Image

MODEL = os.environ.get('SDXL_MODEL')
if not MODEL or not os.path.exists(MODEL):
    raise SystemExit('set SDXL_MODEL to an SDXL .safetensors checkpoint')
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out_stickers')

Q = 'masterpiece, best quality, very aesthetic, absurdres'
STYLE = ('studio ghibli anime style, cel shaded, clean bold lineart, flat colors with soft two-tone shadows, '
         'single character centered, whole body in frame, plain flat background, ' + Q)
NEG = ('different animal, different species, different fur color, recolored, realistic, human, person, '
       'text, watermark, multiple characters, scenery, cluttered background, photo, 3d render, blurry, '
       'lowres, worst quality, low quality')

# the stage-1 sticker each line starts from (stickers_finish.PICKS)
BASE = {'cat': 0, 'fox': 0, 'owl': 0, 'dragon': 1}

# who the animal is (locks colour and species) and what each stage becomes
WHO = {
    'cat': 'a chubby orange and cream cat with green eyes',
    'fox': 'a white fox with orange-tipped ears and tail and green eyes',
    'owl': 'a brown and cream owl with big eyes, perched on a branch',
    'dragon': 'a small round green dragon with red eyes and leaf-shaped wings',
}
STAGES = {
    'cat':    {2: 'now a brave knight cat: wearing a red scarf and a small silver breastplate, sitting up proudly, confident',
               3: 'now the Cat King: wearing a large golden crown with a red gem, a flowing red royal cape with white trim and golden armor, majestic, glowing golden aura'},
    'fox':    {2: 'now a ranger fox: wearing a dark green hooded cloak and a leather satchel, alert and clever',
               3: 'now a legendary nine-tailed spirit fox: many big fluffy tails fanned out behind it, pale blue magical flames floating around, glowing eyes, majestic'},
    'owl':    {2: 'now a scholar owl: wearing round spectacles and a blue scarf, a small book tucked under one wing, wise',
               3: 'now an archmage owl: wearing a tall dark blue wizard hat with stars and a starry cloak, wings spread wide, holding a glowing magic staff, powerful aura'},
    'dragon': {2: 'now a young dragon: proper green wings spread wide, small golden horns, a puff of smoke, standing tall',
               3: 'now an elder dragon: huge spread wings, long golden horns, armored golden chest scales, breathing a bright orange flame, glowing aura, mighty'},
}
STRENGTH = {2: 0.8, 3: 0.8}
CANDS = 4


def build():
    pipe = StableDiffusionXLImg2ImgPipeline.from_single_file(MODEL, torch_dtype=torch.float16, use_safetensors=True)
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.enable_model_cpu_offload()
    pipe.enable_vae_slicing()
    pipe.enable_attention_slicing()
    return pipe


def make(pipe, pet, stage, init_path, cands=range(CANDS), strength=None):
    init = Image.open(init_path).convert('RGB')
    for cand in cands:
        path = os.path.join(OUT, f'{pet}{stage}_f{cand}.png')
        if os.path.exists(path):
            continue
        prompt = f'{WHO[pet]}, {STAGES[pet][stage]}, {STYLE}'
        g = torch.Generator('cuda').manual_seed(777 + stage * 31 + cand * 7 + len(pet))
        img = pipe(prompt=prompt, negative_prompt=NEG, image=init, strength=strength or STRENGTH[stage],
                   num_inference_steps=36, guidance_scale=7.5, generator=g).images[0]
        img.save(path)
        print('saved', os.path.basename(path), flush=True)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'stage2'
    pipe = build()
    if mode == 'stage2':
        for pet in STAGES:
            make(pipe, pet, 2, os.path.join(OUT, f'{pet}_c{BASE[pet]}.png'))
    elif mode == 'strong':
        # Two more dials for both stages: 0.93 keeps the composition and leans on
        # the prompt for identity; 1.0 from a flat grey card is pure text-to-image
        # with the same identity line -- to see which gives a real transformation
        # while staying the same animal.
        blank = os.path.join(OUT, '_blank.png')
        Image.new('RGB', (1024, 1024), (172, 168, 160)).save(blank)
        for pet in STAGES:
            for stage in (2, 3):
                make(pipe, pet, stage, os.path.join(OUT, f'{pet}_c{BASE[pet]}.png'), cands=(4, 5), strength=0.93)
                make(pipe, pet, stage, blank, cands=(6, 7), strength=1.0)
    elif mode == 'stage3':
        # stage3 cat=f1,fox=f0,...  -> build stage 3 from that stage-2 candidate
        picks = dict(kv.split('=') for kv in sys.argv[2].split(','))
        for pet, cand in picks.items():
            make(pipe, pet, 3, os.path.join(OUT, f'{pet}2_{cand}.png'))
    print('DONE')


if __name__ == '__main__':
    main()
