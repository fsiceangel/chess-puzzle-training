# -*- coding: utf-8 -*-
# Piece sets in different styles, all img2img over the same shaded silhouettes
# (silhouette.py), which is what keeps a rook a rook whatever it is made of.
#
#   python styles.py <style> probe     knight + rook, both sides
#   python styles.py <style> white     every piece, white side (plus the black knight)
#   python styles.py <style> redo nb,qb  two more candidates for the pieces listed
#   python styles.py <style> all       2 candidates x 12 pieces into out/<style>/
#   python styles.py list
import os, sys, torch
from diffusers import StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler
import silhouette

MODEL = os.environ.get('SDXL_MODEL')
if not MODEL or not os.path.exists(MODEL):
    raise SystemExit('set SDXL_MODEL to an SDXL .safetensors checkpoint')
ROOT = os.path.dirname(os.path.abspath(__file__))

Q = 'masterpiece, best quality, very aesthetic, absurdres'

FRAME = 'a single chess piece standing upright, whole piece in frame, centered, front view, plain flat background, '

SUBJECT = {
    'k': 'a chess KING: a tall column topped with a crown and a cross',
    'q': 'a chess QUEEN: a tall column topped with a pointed coronet of small spheres',
    'b': 'a chess BISHOP: a column topped with a tall pointed mitre with a diagonal slit and a small ball on top',
    'n': 'a chess KNIGHT: a horse head in side profile facing left, mane and pointed ears, on a short column',
    'r': 'a chess ROOK: a squat castle tower with four square battlements and deep notches cut into its flat top, crenellated',
    'p': 'a chess PAWN: a small column topped with a round sphere',
}

NEG_BASE = ('smooth rounded top, plain cylinder, dome, spire, '
            '1girl, 1boy, human, person, character, face of a person, hair, dress, clothes, arms, hands, legs, '
            'two objects, multiple objects, extra object, duplicate, chessboard, board game, other pieces, '
            'text, watermark, signature, logo, lowres, worst quality, low quality, jpeg artifacts, blurry, cropped')

# Each style: the look, what to push away, the two sides' materials, and how
# much freedom the model gets per piece (rook and bishop lowest — their
# defining feature smooths away first; knight highest — it has to become a horse).
STYLES = {
    'cartoon': dict(
        name='Storybook',
        style='studio ghibli anime style, cel shaded, clean bold lineart, flat colors with soft two-tone shadows and crisp '
              'highlights, hand-drawn 1990s animation film still, warm vibrant saturated colors, charming storybook chess piece, ',
        neg='photo, 3d render, plastic, glossy, watercolor, gouache, washed out, faded, desaturated, grainy, sketch, pencil, ',
        w='painted warm cream and ivory with golden yellow accents and soft peach shadows',
        b='painted deep walnut brown and forest green with warm amber accents',
        strength={'k': 0.78, 'q': 0.78, 'b': 0.74, 'n': 0.94, 'r': 0.66, 'p': 0.78},
    ),
    'felt': dict(
        name='Plush',
        style='chess piece made entirely of needle felted wool, fuzzy fibrous felt surface all over, no outlines, '
              'soft plush handmade toy, macro photo of wool fibres, soft studio lighting, product photo, ',
        neg='cel shaded, lineart, outlines, flat colors, anime, drawing, sketch, glossy, smooth, plastic, metal, ',
        w='cream and blush pink wool felt with dusty rose trim',
        b='periwinkle blue and indigo wool felt with soft violet trim',
        strength={'k': 0.90, 'q': 0.90, 'b': 0.86, 'n': 0.94, 'r': 0.74, 'p': 0.90},
    ),
    'wood': dict(
        name='Carved Wood',
        style='hand carved wooden chess piece, polished, visible wood grain, turned on a lathe, '
              'warm soft light, product photo, ',
        neg='cel shaded, lineart, flat colors, anime, drawing, sketch, plastic, painted, ',
        w='pale boxwood, honey coloured, satin finish',
        b='dark ebony wood, nearly black with warm brown grain',
        strength={'k': 0.84, 'q': 0.84, 'b': 0.80, 'n': 0.92, 'r': 0.7, 'p': 0.84},
    ),
    'marble': dict(
        name='Marble',
        style='carved marble chess piece, polished stone with subtle veins, museum lighting, product photo, ',
        neg='cel shaded, lineart, flat colors, anime, drawing, sketch, plastic, wood, ',
        w='white carrara marble with faint grey veins',
        b='dark green serpentine marble with thin gold veins',
        strength={'k': 0.84, 'q': 0.84, 'b': 0.80, 'n': 0.92, 'r': 0.7, 'p': 0.84},
    ),
    'gummy': dict(
        name='Gummy',
        style='translucent gummy candy chess piece, glossy sugar coating, jelly, bright and fun, '
              'soft studio lighting, product photo, ',
        neg='cel shaded, lineart, flat colors, anime, drawing, sketch, wood, stone, metal, matte, ',
        w='lemon yellow translucent gummy',
        b='grape purple translucent gummy',
        strength={'k': 0.84, 'q': 0.84, 'b': 0.80, 'n': 0.92, 'r': 0.7, 'p': 0.84},
    ),
    'crystal': dict(
        name='Crystal',
        style='crystal glass chess piece, translucent, refracting light, sparkling facets, '
              'dark velvet backdrop, dramatic studio light, product photo, ',
        neg='cel shaded, lineart, flat colors, anime, drawing, sketch, wood, matte, opaque, ',
        w='clear ice crystal with a pale blue glow',
        b='deep amethyst purple crystal',
        strength={'k': 0.84, 'q': 0.84, 'b': 0.80, 'n': 0.92, 'r': 0.7, 'p': 0.84},
    ),
    'ink': dict(
        name='Ink & Wash',
        b_scale=0.7,  # the black init is nearly black already: less freedom, or it paints a silhouette
        style='hand drawn pen and ink illustration of a chess piece with a loose watercolour wash, '
              'visible brush strokes, cross hatching, on textured paper, ',
        neg='cel shaded, 3d render, photo, plastic, glossy, flat colors, vector, ',
        w='ivory paper with a warm sepia wash',
        b='dark indigo ink with white highlight lines and cross hatching, visible pen strokes',
        strength={'k': 0.82, 'q': 0.82, 'b': 0.78, 'n': 0.90, 'r': 0.72, 'p': 0.82},
    ),
    'manga': dict(
        name='Manga',
        post='mono',
        style='black and white manga illustration, clean confident ink lines, screentone dot shading, '
              'high contrast, printed on white paper, shonen manga panel art, ',
        neg='color, colorful, photo, 3d render, painterly, blurry, gradient, ',
        w='white with light grey screentone shading and crisp black outlines',
        b='a BLACK piece: solid black ink fill with thin white highlight lines',
        strength={'k': 0.86, 'q': 0.86, 'b': 0.82, 'n': 0.94, 'r': 0.72, 'p': 0.86},
    ),
    'comic': dict(
        name='Comic Book',
        style='american comic book art style, thick black outlines, halftone Ben-Day dots, bold flat primary colors, '
              'dramatic cel shading, vintage comic print, ',
        neg='photo, 3d render, painterly, soft, blurry, pastel, watercolor, ',
        w='bright yellow and cream with red accents',
        b='deep blue and black with red accents',
        strength={'k': 0.86, 'q': 0.86, 'b': 0.82, 'n': 0.94, 'r': 0.72, 'p': 0.86},
    ),
    'chibi': dict(
        name='Kawaii',
        style='kawaii chibi sticker art, super cute, rounded chubby shapes, big glossy shine highlights, a tiny happy face '
              'drawn on the piece, pastel colors, thick soft outlines, ',
        neg='photo, 3d render, realistic, scary, dark, gritty, sketch, ',
        w='pastel pink and cream',
        b='pastel lavender and mint',
        strength={'k': 0.82, 'q': 0.82, 'b': 0.78, 'n': 0.92, 'r': 0.70, 'p': 0.82},
    ),
    'pixel': dict(
        name='Pixel',
        style='pixel art game sprite, 16-bit retro video game, crisp square pixels, limited color palette, '
              'dithering, no anti-aliasing, ',
        neg='photo, 3d render, smooth, blurry, painterly, gradient, vector, ',
        w='cream and gold pixels',
        b='dark navy and steel blue pixels',
        pixelate=48,
        strength={'k': 0.80, 'q': 0.80, 'b': 0.76, 'n': 0.94, 'r': 0.68, 'p': 0.80},
    ),
    'ukiyoe': dict(
        name='Woodblock',
        style='japanese ukiyo-e woodblock print, completely flat solid colors with no gradients, thick uneven carved '
              'black outlines, visible washi paper grain and wood texture, muted indigo vermilion and ochre palette, '
              'hokusai style print, ',
        neg='photo, 3d render, glossy, gradient, shading, highlights, anime, modern, smooth, ',
        w='cream paper with faint vermilion and gold',
        b='deep indigo and black ink',
        strength={'k': 0.86, 'q': 0.86, 'b': 0.82, 'n': 0.94, 'r': 0.72, 'p': 0.86},
    ),
    'retro': dict(
        name='Rubber Hose',
        post='sepia',
        b_scale=0.8,  # keep the dark side dark under the sepia map
        style='1930s rubber hose cartoon style, vintage animation, thick black outlines, black white and grey with '
              'a sepia tint, film grain, pie-cut eyes drawn on the piece, bouncy cheerful, ',
        neg='color, colorful, photo, 3d render, modern anime, gradient, ',
        w='white with grey shading on sepia',
        b='a BLACK piece: solid black with white rim highlights',
        strength={'k': 0.86, 'q': 0.86, 'b': 0.82, 'n': 0.94, 'r': 0.72, 'p': 0.86},
    ),
}


def build():
    pipe = StableDiffusionXLImg2ImgPipeline.from_single_file(MODEL, torch_dtype=torch.float16, use_safetensors=True)
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.enable_model_cpu_offload()
    pipe.enable_vae_slicing()
    pipe.enable_attention_slicing()
    return pipe


def run(pipe, style, kind, side, cand):
    out = os.path.join(ROOT, 'out', style)
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, f'{kind}{side}_c{cand}.png')
    if os.path.exists(path):
        return
    st = STYLES[style]
    init = silhouette.draw(kind, st.get('init_side', side))
    prompt = f'{FRAME}{SUBJECT[kind]}, {st["w"] if side == "w" else st["b"]}, {st["style"]}{Q}'
    g = torch.Generator('cuda').manual_seed(5150 + cand * 977 + ord(kind) + sum(map(ord, style)))
    strength = st['strength'][kind] * (st.get('b_scale', 1.0) if side == 'b' else 1.0)
    img = pipe(prompt=prompt, negative_prompt=st['neg'] + NEG_BASE, image=init, strength=strength,
               num_inference_steps=36, guidance_scale=7.0, generator=g).images[0]
    from PIL import Image, ImageOps
    if st.get('pixelate'):
        n = st['pixelate']
        img = img.resize((n, n), Image.BOX).resize(img.size, Image.NEAREST)
    if st.get('post') == 'mono':
        img = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=1).convert('RGB')
    elif st.get('post') == 'sepia':
        g = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=1)
        if side == 'b':
            # the model paints the dark side mid-grey; pull it down so the two
            # sides stay apart once both are sepia
            g = g.point(lambda v: int((v / 255) ** 1.8 * 255))
        img = ImageOps.colorize(g, (58, 40, 22), (246, 232, 204), (170, 130, 90))
    img.save(path)
    print('saved', style, os.path.basename(path), flush=True)


def main():
    if len(sys.argv) < 2 or sys.argv[1] == 'list':
        for k, v in STYLES.items():
            print(k, '-', v['name'])
        return
    styles = list(STYLES) if sys.argv[1] == 'every' else sys.argv[1].split(',')
    mode = sys.argv[2] if len(sys.argv) > 2 else 'probe'
    pipe = build()
    for style in styles:
        if mode == 'probe':
            for kind in ('n', 'r'):
                for side in 'wb':
                    run(pipe, style, kind, side, 0)
        elif mode == 'rooks':
            for side in 'wb':
                run(pipe, style, 'r', side, 0)
        elif mode == 'redo':
            # extra candidates (c2, c3) for the pieces named after the mode, e.g. "redo nb,qb"
            for name in sys.argv[3].split(','):
                for cand in (2, 3):
                    run(pipe, style, name[0], name[1], cand)
        elif mode == 'black':
            for kind in 'prnbqk':
                run(pipe, style, kind, 'b', 0)
        elif mode == 'white':
            for kind in 'prnbqk':
                run(pipe, style, kind, 'w', 0)
            run(pipe, style, 'n', 'b', 0)
        else:
            for kind in 'prnbqk':
                for side in 'wb':
                    for cand in range(2):
                        run(pipe, style, kind, side, cand)
    print('DONE')


if __name__ == '__main__':
    main()
