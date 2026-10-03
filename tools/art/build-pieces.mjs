// Deterministic chess artwork. One coordinate system, shared pedestal and
// distinct Staunton silhouettes across every material. No bounding-box scaling.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pieceSets } from '../../src/data/shop.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'public/pieces/studio')
export const shapes = {
  p: 'M39 66 Q44 55 43 49 C29 43 34 25 46 25 C60 25 65 43 52 49 Q51 55 58 66 Z',
  r: 'M32 66 L35 37 L28 33 L28 17 L37 17 L37 25 L43 25 L43 17 L52 17 L52 25 L58 25 L58 17 L67 17 L67 33 L60 37 L63 66 Z',
  n: 'M29 66 Q36 57 41 46 L31 48 L24 43 L26 35 L35 29 L41 17 L47 22 L53 12 L58 25 Q73 39 65 65 L62 68 Z',
  b: 'M34 66 Q43 54 40 46 Q28 42 35 29 Q39 21 48 14 Q58 24 62 33 Q68 43 54 47 Q53 54 62 66 Z',
  q: 'M32 66 Q40 52 38 41 L29 22 L40 29 L48 16 L56 29 L68 22 L59 41 Q56 52 65 66 Z',
  k: 'M33 66 Q42 53 38 39 Q27 33 35 26 L43 28 L43 19 L36 19 L36 12 L43 12 L43 5 L52 5 L52 12 L59 12 L59 19 L52 19 L52 28 L61 26 Q70 33 59 39 Q55 53 63 66 Z',
}
const palettes = {
  cartoon: [['#fff7dc','#ead3a5','#b29869','#695439'],['#80968a','#435a50','#26392f','#17271f']],
  wood: [['#f1cf8c','#c8914c','#8b552b','#53321c'],['#b18a59','#67472f','#392a20','#211c17']],
  marble: [['#ffffff','#e4e4d9','#a6b5a6','#526559'],['#71877d','#3c554a','#1e332a','#17261f']],
  crystal: [['#f4ffff','#bae3e7','#74a9b8','#405d76'],['#a4b4dd','#666eaa','#3c416f','#272d51']],
  ink: [['#fffdf1','#e7dfc7','#aaa18c','#393b33'],['#7e8175','#42473e','#262a25','#191e19']],
  felt: [['#fff0cf','#dbc6a2','#ad8e70','#76604b'],['#a7b8a5','#688777','#415e4e','#2c4337']],
  gummy: [['#fff3b8','#f6c968','#ce8944','#84502e'],['#f8b4a0','#c77468','#884a46','#592f30']],
  chibi: [['#fff5e7','#ecc9c4','#c39191','#87696c'],['#a8bcb9','#6b8987','#466462','#304a47']],
  manga: [['#ffffff','#ece9e0','#b2b0a9','#343831'],['#878d84','#444c43','#252c25','#171d18']],
  comic: [['#fff1c6','#ecc477','#c18f42','#584732'],['#849aab','#476779','#294252','#192d37']],
  pixel: [['#fff0b6','#d4b779','#9d7b42','#58472b'],['#8b9f8c','#4d6b53','#2c4435','#1e3025']],
  retro: [['#fff5df','#ddc59b','#a28965','#544939'],['#b8a48a','#766650','#494133','#2d2a22']],
  letters: [['#fff8dc','#e9d3a6','#b59765','#675036'],['#8b9b84','#526b50','#30462f','#21351f']],
  buttons: [['#fff2c8','#e1c493','#ad8551','#624c31'],['#96a28a','#5c7157','#384e34','#243520']],
  neon: [['#f1fff3','#c1e4cf','#7aa88c','#395b48'],['#b8d9cb','#62877e','#36584f','#203d35']],
}

export function renderPiece(type, color, material) {
  const [light, mid, dark, ink] = (palettes[material] ?? palettes.cartoon)[color === 'w' ? 0 : 1]
  const grain = material === 'wood' || material === 'cartoon' || material === 'retro'
  const dots = ['felt','comic','manga'].includes(material)
  const faceted = material === 'crystal'
  const main = shapes[type]
  const outline = material === 'comic' || material === 'manga' ? 2 : 1.45
  const pedestal = 'M31 66 Q48 63 65 66 L65 71 L71 79 L71 85 Q48 91 25 85 L25 79 L31 71 Z'
  const symbol = {p:'P',r:'R',n:'N',b:'B',q:'Q',k:'K'}[type]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
<title>${color === 'w' ? 'White' : 'Black'} ${type} · ${material}</title>
<defs>
 <linearGradient id="body" x1="28" y1="25" x2="67" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="${mid}"/><stop offset=".22" stop-color="${light}"/><stop offset=".47" stop-color="${mid}"/><stop offset=".77" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
 <linearGradient id="rim" x2="0" y2="1"><stop stop-color="${light}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
 <clipPath id="shape"><path d="${main}"/><path d="${pedestal}"/></clipPath>
 <pattern id="grain" width="15" height="32" patternUnits="userSpaceOnUse"><path d="M2-5 Q11 9 4 19 T7 40 M10-5 Q17 9 11 25" stroke="${ink}" stroke-width=".65" opacity=".18" fill="none"/></pattern>
 <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="${ink}" opacity=".18"/></pattern>
</defs>
<ellipse cx="48" cy="88" rx="25" ry="4" fill="#30291f" opacity=".16"/>
<g stroke="${ink}" stroke-width="${outline}" stroke-linejoin="round">
 <path d="${main}" fill="url(#body)"/>
 ${type === 'q' ? '<g fill="url(#rim)"><circle cx="29" cy="21" r="3.2"/><circle cx="48" cy="15" r="3.4"/><circle cx="68" cy="21" r="3.2"/></g>' : ''}
 ${type === 'n' ? `<path d="M54 27 Q64 40 58 55 M29 41 L35 41" opacity=".75"/><circle cx="42" cy="32" r="1.8" fill="${ink}" stroke="none"/>` : ''}
 ${type === 'b' ? `<path d="M54 23 L44 36" stroke="${ink}" stroke-width="3.6"/><path d="M55 24 L46 36" stroke="${light}" stroke-width="1.1"/>` : ''}
 ${type === 'r' ? `<path d="M34 36 L61 36 M39 41 L38 59 M57 41 L58 59" stroke-width="1" opacity=".55"/>` : ''}
 ${['q','k','b','p'].includes(type) ? '<path d="M37 62 Q48 65 60 62" stroke-width="1" opacity=".55"/>' : ''}
 <path d="${pedestal}" fill="url(#body)"/>
 <path d="M31 67 Q48 70 65 67 M28 78 Q48 83 68 78 M27 84 Q48 88 69 84" stroke="${ink}" stroke-width="1.2" opacity=".75"/>
 <path d="M32 71 Q48 75 64 71 M29 79 Q44 82 56 81" stroke="${light}" stroke-width="1.4" opacity=".85"/>
</g>
<g clip-path="url(#shape)">
 ${grain ? '<rect width="96" height="96" fill="url(#grain)"/>' : ''}
 ${dots ? '<rect width="96" height="96" fill="url(#dots)"/>' : ''}
 ${material === 'marble' ? `<path d="M21 4 Q61 20 43 39 T73 81 M26 18 Q61 42 39 54 T67 91" stroke="${ink}" stroke-width=".8" opacity=".25"/>` : ''}
 ${faceted ? `<path d="M48 5 L33 45 L50 60 L70 28 Z M50 60 L28 82 L65 74 Z" fill="${light}" opacity=".48"/><path d="M48 5 L50 60 L68 86 L65 30 Z" fill="${dark}" opacity=".24"/>` : ''}
 ${material === 'gummy' ? `<ellipse cx="40" cy="35" rx="4" ry="10" fill="${light}" opacity=".7"/>` : ''}
 ${material === 'felt' ? `<path d="M47 5 Q54 35 47 63 L48 85" stroke="${light}" stroke-width="1.4" stroke-dasharray="2 2" opacity=".8"/>` : ''}
 ${material === 'pixel' ? `<path d="M34 25 H40 V34 H36 V43 H40 V60" stroke="${light}" stroke-width="3" opacity=".65"/>` : ''}
</g>
${material === 'letters' ? `<text x="48" y="61" fill="${ink}" font-family="Georgia,serif" font-weight="bold" font-size="16" text-anchor="middle">${symbol}</text>` : ''}
${material === 'buttons' ? `<circle cx="48" cy="78" r="4.5" fill="${dark}"/><circle cx="47" cy="77" r="1" fill="${light}"/><circle cx="49" cy="79" r="1" fill="${light}"/>` : ''}
${material === 'neon' ? `<path d="${main}" stroke="${light}" stroke-width="1.7" opacity=".95"/><path d="M28 84 Q48 88 68 84" stroke="${light}" stroke-width="1.7"/>` : ''}
</svg>`
}

for (const { id } of pieceSets) {
  const dir = path.join(out, id)
  fs.mkdirSync(dir, { recursive: true })
  for (const color of ['w','b']) for (const type of Object.keys(shapes)) {
    fs.writeFileSync(path.join(dir, `${type}${color}.svg`), renderPiece(type, color, id))
  }
}
console.log(`Built ${pieceSets.length * 12} studio pieces; viewBox 96×96, center x=48, shared base y=88.`)
