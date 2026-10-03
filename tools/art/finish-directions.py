"""Run only after user approval for scripted background removal/cropping.

Exports the generated paired views with one shared scale per furniture pair.
Original source is preserved. Review the contact sheet before shipping.
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

def clean_edges(sprite, name):
    a = np.array(sprite)
    rgb = a[:, :, :3].astype(float)
    alpha = a[:, :, 3].astype(float) / 255
    spread = rgb.max(2) - rgb.min(2)
    # Grey baked shadows between cabinet feet survived the original white
    # key. Restrict this extra key to the feet; never key stone or fabric.
    if name in ('bookshelf', 'wardrobe'):
        feet = np.indices(alpha.shape)[0] > 400
        alpha[feet & (spread < 45) & (rgb.min(2) > 35)] = 0
    # Remove detached checker specks, retaining separate intentional details.
    labels, count = ndimage.label(alpha > .2)
    sizes = np.bincount(labels.ravel())
    for component in range(1, count + 1):
        if sizes[component] < 12:
            alpha[labels == component] = 0
    # Decontaminate the pale fringe with colour from the nearest opaque
    # interior pixel; keep the silhouette alpha and all fine protrusions.
    interior = ndimage.binary_erosion(alpha > .95, iterations=2)
    if interior.any():
        _, nearest = ndimage.distance_transform_edt(~interior, return_indices=True)
        edge = (alpha > 0) & ~interior & (spread < 24) & (rgb.min(2) > 100)
        rgb[edge] = rgb[nearest[0][edge], nearest[1][edge]]
    alpha[alpha < .08] = 0
    a[:, :, :3] = np.clip(rgb, 0, 255).astype('uint8')
    a[:, :, 3] = np.round(alpha * 255).astype('uint8')
    return Image.fromarray(a)

ROOT = Path(__file__).resolve().parents[2]
source = Image.open(ROOT / 'tools/art/studio-source/furniture-directions.png').convert('RGBA')
# Measured cells, not an assumed grid: generated beds overlap nominal columns.
boxes = {
    'bookshelf': [(35, 10, 330, 395), (388, 10, 650, 395)],
    'wardrobe': [(730, 10, 1000, 395), (1130, 10, 1400, 395)],
    'fireplace': [(25, 405, 325, 715), (370, 405, 654, 715)],
    'desk': [(680, 400, 1040, 717), (1050, 400, 1420, 717)],
    'armchair': [(30, 718, 305, 1060), (340, 718, 630, 1060)],
    'bed': [(652, 719, 1045, 1065), (1060, 719, 1435, 1065)],
}
out = ROOT / 'public/furniture/directions'
out.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGBA', (512 * 4, 512 * 3), '#92a183')
for index, (name, pair) in enumerate(boxes.items()):
    cuts = []
    for box in pair:
        tile = source.crop(box)
        a = np.array(tile)
        rgb = a[:, :, :3].astype(int)
        # The baked checker is neutral white/light grey. Preserve warm ivory,
        # brass and all dark linework, including interior gaps between legs.
        neutral = rgb.max(2) - rgb.min(2)
        key = (neutral < 18) & (rgb.min(2) > 110)
        a[:, :, 3] = np.where(key, 0, a[:, :, 3])
        tile = Image.fromarray(a)
        bounds = tile.getchannel('A').getbbox()
        if not bounds:
            raise ValueError(f'Empty sprite: {name}')
        cuts.append(tile.crop(bounds))
    scale = min(480 / max(im.width for im in cuts), 480 / max(im.height for im in cuts))
    for column, (direction, cut) in enumerate(zip(('left', 'right'), cuts)):
        cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.Resampling.LANCZOS)
        sprite = Image.new('RGBA', (512, 512))
        sprite.alpha_composite(cut, ((512 - cut.width) // 2, 504 - cut.height))
        sprite = clean_edges(sprite, name)
        sprite.save(out / f'{name}-{direction}.png')
        sheet.alpha_composite(sprite, (((index % 2) * 2 + column) * 512, (index // 2) * 512))
sheet.save(ROOT / 'tools/art/studio-source/directions-proof.png')
print('Exported 12 sprites; inspect directions-proof.png before enabling assets.')
