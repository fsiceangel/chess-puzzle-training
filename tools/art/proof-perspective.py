"""Render runtime projection on the real room; no player save is read."""
from pathlib import Path
import json, subprocess
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[2]
js="""import {wallProjection} from './src/lib/roomPerspective.js';
console.log(JSON.stringify([['bookshelf','left',{x:2,y:30},28],['fireplace','right',{x:77,y:49},20]].map(([id,d,p,w])=>({id,d,p,w,m:wallProjection(id,d,p,w)}))))"""
items=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root))
room=Image.open(root/'public/room/studio/afternoon.png').convert('RGBA')
for item in items:
    # The sprite is rendered into a larger local canvas so projected edges
    # are not clipped by the original transparent square.
    im=Image.open(root/f"public/furniture/directions/{item['id']}-{item['d']}.png")
    m=np.array(item['m']).reshape(3,3)
    inv=np.linalg.inv(m)
    inv/=inv[2,2]
    im=im.transform((640,640),Image.Transform.PERSPECTIVE,inv.flatten()[:8],Image.Resampling.BICUBIC)
    scale=room.width*item['w']/100/512
    im=im.resize((round(640*scale),round(640*scale)),Image.Resampling.LANCZOS)
    room.alpha_composite(im,(round(room.width*item['p']['x']/100),round(room.height*item['p']['y']/100)))
room.save(root/'tools/art/studio-source/perspective-proof.png')
