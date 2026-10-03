from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

root = Path(__file__).resolve().parents[2]
dest = root / 'public/pets/clean'
dest.mkdir(exist_ok=True)
generated = Path(r'C:/Users/Administrator/.codex/generated_images/01a07cdb-8dd6-7681-acc3-3f86263ba8c1')
edits = {'owl3': ('exec-76933a2f-e885-4bff-8e22-7e962cb3a794.png', 230),
         'fox3': ('exec-ee0d8138-d985-4da5-9a0f-9fd9c395343b.png', 236)}
for pet in ['cat', 'fox', 'owl', 'dragon']:
    for stage in range(1, 4):
        key = pet + (str(stage) if stage > 1 else '')
        source = root / 'public/pets' / (('cat3-scepter' if key == 'cat3' else key) + '.webp')
        if key in edits:
            source = generated / edits[key][0]
        a = np.array(Image.open(source).convert('RGBA'))
        rgb = a[:, :, :3].astype(int)
        if key in edits:
            candidate = rgb.max(2) < 45
        else:
            edge = ndi.distance_transform_edt(a[:, :, 3] >= 12) <= 2
            candidate = (a[:, :, 3] < 12) | (edge & (np.ptp(rgb, axis=2) < 18) & (rgb.min(2) > 60))
        seed = np.zeros(candidate.shape, bool)
        seed[0] = candidate[0]; seed[-1] = candidate[-1]
        seed[:, 0] = candidate[:, 0]; seed[:, -1] = candidate[:, -1]
        bg = ndi.binary_propagation(seed, mask=candidate)
        a[bg, 3] = 0
        if key == 'owl3':
            # Remove bright red/white extraction fringe outside the dark ink outline.
            edge = ndi.distance_transform_edt(a[:, :, 3] > 0) <= 7
            fringe = ((rgb[:, :, 0] > rgb[:, :, 1]*1.6) & (rgb[:, :, 0] > rgb[:, :, 2]*1.5) & (rgb[:, :, 0] > 130)) | (rgb.min(2) > 210)
            a[edge & fringe, 3] = 0
        labels, count = ndi.label(a[:, :, 3] > 0)
        sizes = np.bincount(labels.ravel())
        a[(labels > 0) & (sizes[labels] < (30 if key in edits else 5)), 3] = 0
        im = Image.fromarray(a)
        if key in edits:
            im = im.crop(im.getbbox())
            h = min(edits[key][1], round(318 * im.height / im.width))
            w = round(im.width * h / im.height)
            sprite = im.resize((w, h), Image.Resampling.LANCZOS)
            im = Image.new('RGBA', (320, 320))
            im.alpha_composite(sprite, ((320-w)//2, 320-h))
        im.save(dest / (key + '.webp'), lossless=True)
        print(key, im.getbbox())

# Inspection sheet on a warm room-like background, never used as game art.
sheet = Image.new('RGB', (320*3, 320*4), '#85765e')
for row, pet in enumerate(['cat','fox','owl','dragon']):
    for col in range(3):
        key = pet + (str(col+1) if col else '')
        im = Image.open(dest / (key+'.webp')).convert('RGBA')
        sheet.paste(im, (col*320, row*320), im)
sheet.save(root / 'tools/art/companion-review-clean.png')
