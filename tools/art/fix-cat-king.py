from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

root = Path(__file__).resolve().parents[2]
source = Path(r'C:\Users\Administrator\.codex\generated_images\01a07cdb-8dd6-7681-acc3-3f86263ba8c1\exec-87639ad8-60ac-460d-8ddd-9c9a5d1cf055.png')
im = Image.open(source).convert('RGBA')
a = np.array(im)
rgb = a[:, :, :3].astype(int)
# Only neutral pixels connected to the outside belong to the generated checkerboard.
neutral = (rgb.max(2) - rgb.min(2) < 18) & (rgb.min(2) > 65)
seed = np.zeros(neutral.shape, bool)
seed[0, :] = neutral[0, :]
seed[-1, :] = neutral[-1, :]
seed[:, 0] = neutral[:, 0]
seed[:, -1] = neutral[:, -1]
bg = ndimage.binary_propagation(seed, mask=neutral)
a[bg, 3] = 0
clean = Image.fromarray(a)
box = clean.getbbox()
sprite = clean.crop(box)
# Match the existing sprite's 275px visible height and bottom baseline.
height = 275
width = round(sprite.width * height / sprite.height)
sprite = sprite.resize((width, height), Image.Resampling.LANCZOS)
out = Image.new('RGBA', (320, 320))
out.alpha_composite(sprite, ((320-width)//2, 320-height))
out.save(root / 'public/pets/cat3-scepter.webp', lossless=True)
print('Saved', out.size, out.getbbox())
