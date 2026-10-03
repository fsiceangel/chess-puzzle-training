// Everything the shop sells. Ids are stable: they are what gets written into
// the saved game as "owned" and "equipped", so renaming one orphans a purchase.

// ---- boards: square colours plus a frame the board sits in ----
export const boards = [
  { id: 'sand', name: 'Meadow', price: 0, blurb: 'Sand and sage — the one you start with.' },
  { id: 'wood', name: 'Old Oak', price: 40, blurb: 'A proper wooden board, worn smooth.' },
  { id: 'night', name: 'Night Sky', price: 80, blurb: 'Deep blue with a scatter of stars.' },
  { id: 'ocean', name: 'Tide Pool', price: 80, blurb: 'Sea-green and foam.' },
  { id: 'candy', name: 'Candy Shop', price: 120, blurb: 'Strawberry and mint. Not edible.' },
  { id: 'marble', name: 'Marble Hall', price: 160, blurb: 'White and grey stone, very grand.' },
  { id: 'sakura', name: 'Blossom', price: 200, blurb: 'Pink petals on pale wood.' },
]

// ---- piece sets ----
export const pieceSets = [
  { id: 'cartoon', name: 'Atelier', price: 0, blurb: 'Warm ivory and deep jade, with a hand-finished glow.' },
  // illustration styles
  { id: 'chibi', name: 'Sakura Glaze', price: 100, blurb: 'Soft rose porcelain paired with deep celadon.' },
  { id: 'manga', name: 'Manga', price: 120, blurb: 'Black ink and screentone, straight off the page.' },
  { id: 'comic', name: 'Animation Ink', price: 140, blurb: 'Bold ink, honey gold and quiet blue shadows.' },
  { id: 'pixel', name: 'Pixel Inlay', price: 140, blurb: 'Little stepped highlights in gold and forest green.' },
  { id: 'retro', name: 'Heirloom', price: 160, blurb: 'Cream and aged walnut, kept for generations.' },
  // drawn in code
  { id: 'letters', name: 'Letters', price: 60, blurb: 'K, Q, R, B, N, P. The names, in big type.' },
  { id: 'buttons', name: 'Buttonwork', price: 90, blurb: 'Turned pieces with tiny buttons set into each base.' },
  { id: 'neon', name: 'Spirit Glass', price: 220, blurb: 'Pale luminous edges around deep green glass.' },
  // materials
  { id: 'wood', name: 'Carved Wood', price: 120, blurb: 'Boxwood and ebony, turned on a lathe.' },
  { id: 'ink', name: 'Ink & Ivory', price: 140, blurb: 'Warm paper-white and charcoal, simply drawn.' },
  { id: 'felt', name: 'Stitched Felt', price: 150, blurb: 'Soft cream and sage wool with a hand-sewn seam.' },
  { id: 'gummy', name: 'Amber Candy', price: 180, blurb: 'Translucent honey and rose, polished like sweets.' },
  { id: 'marble', name: 'Marble', price: 200, blurb: 'Carrara white against green serpentine.' },
  { id: 'crystal', name: 'Crystal', price: 260, blurb: 'Ice and amethyst, catching the light.' },
]

// ---- room decorations: each has a home in the room and just appears once bought ----
// x/y/w are percentages of the room. Sprites are square with the object at the
// bottom, so an item's foot lands at y + w * 16/9: on the sill (57%) or the floor (92%).
export const decorations = [
  { id: 'plant', name: 'Fern', price: 30, x: 6, y: 67.1, w: 14, blurb: 'Every room needs one.' },
  { id: 'books', name: 'Book Stack', price: 30, x: 38, y: 41.0, w: 9, blurb: 'Openings, endings, and a comic.' },
  { id: 'lamp', name: 'Desk Lamp', price: 45, x: 84, y: 42.8, w: 8, blurb: 'For late puzzles.' },
  { id: 'cactus', name: 'Cactus', price: 45, x: 47, y: 46.3, w: 6, blurb: 'Low maintenance. Like a good pawn.' },
  { id: 'flowers', name: 'Wildflowers', price: 50, x: 60, y: 46.3, w: 6, blurb: 'Picked on the way home.' },
  { id: 'teapot', name: 'Teapot', price: 60, x: 31, y: 48.1, w: 5, blurb: 'Think better with tea.' },
  { id: 'clock', name: 'Wall Clock', price: 70, x: 8, y: 12, w: 9, blurb: 'Tick, tock, mate in two.' },
  { id: 'bunting', name: 'Bunting', price: 70, x: 30, y: -60, w: 40, blurb: 'Party in the study.' },
  { id: 'radio', name: 'Radio', price: 80, x: 53, y: 44.6, w: 7, blurb: 'Plays old songs, mostly.' },
  { id: 'kite', name: 'Kite', price: 90, x: 70, y: 12, w: 9, blurb: 'Hung up for the winter.' },
  { id: 'lantern', name: 'Lantern', price: 90, x: 88, y: 8, w: 6, blurb: 'A warm glow in the corner.' },
  { id: 'sailboat', name: 'Toy Boat', price: 100, x: 58, y: 53.8, w: 8, blurb: 'Sails the shelf.' },
  { id: 'cushion', name: 'Cushion', price: 110, x: 60, y: 78.2, w: 10, blurb: 'For thinking on the floor.' },
  { id: 'poster', name: 'Knight Portrait', price: 130, x: 20, y: 14, w: 10, blurb: 'A very serious horse.' },
  { id: 'globe', name: 'Globe', price: 150, x: 92, y: 42.8, w: 8, blurb: 'Spin it, pick a country.' },
  { id: 'telescope', name: 'Telescope', price: 200, x: 0, y: 74.7, w: 12, blurb: 'For the night sky board.' },
  { id: 'medal', name: 'Gold Medal', price: 0, x: 31, y: 14, w: 5, blurb: 'Earned, not bought.', reward: true },
  { id: 'trophy', name: 'Trophy', price: 0, x: 77, y: 46.3, w: 6, blurb: 'Earned, not bought.', reward: true },
]

// ---- furniture: the big pieces. Bought, it appears; it can be dragged. Defaults sit in
// three depth rows — against the wall (foot 84%), mid-floor (91%), front (96%) — so a full
// room overlaps only front-to-back, like perspective, never side by side ----
export const furniture = [
  { id: 'rug', name: 'Round Rug', price: 80, x: 30, y: 26.9, w: 40, blurb: 'Soft underfoot. Goes under everything.' },
  { id: 'armchair', name: 'Armchair', price: 150, x: 8, y: 64.0, w: 18, blurb: 'For reading openings in.' },
  { id: 'bookshelf', name: 'Bookshelf', price: 200, x: 82, y: 52.0, w: 18, blurb: 'Full of books nobody has finished.' },
  { id: 'desk', name: 'Writing Desk', price: 180, x: 38, y: 51.9, w: 22, blurb: 'Homework on one side, chess on the other.' },
  { id: 'chesstable', name: 'Chess Table', price: 220, x: 70, y: 71.1, w: 14, blurb: 'A real board, for real games.' },
  { id: 'floorlamp', name: 'Floor Lamp', price: 120, x: 27, y: 71.1, w: 14, blurb: 'Tall and warm.' },
  { id: 'beanbag', name: 'Beanbag', price: 140, x: 85, y: 69.3, w: 15, blurb: 'Sinks. Comfy. Hard to leave.' },
  { id: 'aquarium', name: 'Fish Tank', price: 260, x: 66, y: 39.2, w: 10, blurb: 'Two goldfish. They are called Rook and Bishop.' },
  { id: 'fireplace', name: 'Fireplace', price: 320, x: 14, y: 55.6, w: 16, blurb: 'Crackles. Good for winter puzzles.' },
  { id: 'mirror', name: 'Standing Mirror', price: 160, x: 88, y: 71.4, w: 11, blurb: 'Check your posture. Then check the king.' },
  { id: 'piano', name: 'Piano', price: 380, x: 62, y: 48.3, w: 24, blurb: 'Plays the checkmate fanfare, if you can.' },
  { id: 'wardrobe', name: 'Wardrobe', price: 240, x: 0, y: 59.1, w: 14, blurb: 'Where the extra boards live.' },
  { id: 'bed', name: 'Bed', price: 300, x: 2, y: 37.7, w: 30, blurb: 'Every good player sleeps on it.' },
]

// ---- room themes: the view from the window ----
export const rooms = [
  { id: 'bg', name: 'Afternoon', price: 0, blurb: 'Blue sky and green hills. Home.' },
  { id: 'bg_day', name: 'Clear Day', price: 90, blurb: 'Bright and wide awake.' },
  { id: 'bg_sakura', name: 'Blossom', price: 140, blurb: 'Petals drifting past the window.' },
  { id: 'bg_sunset', name: 'Sunset', price: 140, blurb: 'Gold light on the floorboards.' },
  { id: 'bg_snow', name: 'Snow Day', price: 160, blurb: 'Quiet, white, cold outside only.' },
  { id: 'bg_night', name: 'Starry Night', price: 180, blurb: 'The room glows; the sky does too.' },
  { id: 'bg_moon', name: 'Moonlight', price: 200, blurb: 'One lamp, one moon.' },
]

// ---- companions: the first is free, the rest are goals ----
// XP needed to reach stage 2 and stage 3. A pet earns XP only from puzzles
// solved while it is the companion, so each one is raised on its own.
export const STAGE_XP = [0, 100, 400]

export const pets = [
  { id: 'cat', name: 'Cat', price: 0, blurb: 'A tiny travelling friend, with the heart of a king.', stages: ['Scarf Kitten', 'Wayfarer Cat', 'Crowned Cat'] },
  { id: 'fox', name: 'Fox', price: 150, blurb: 'Raise a little fox into a many-tailed forest spirit.', stages: ['Fox Kit', 'Charm Fox', 'Spirit Fox'] },
  { id: 'owl', name: 'Owl', price: 150, blurb: 'Every puzzle brings a young apprentice closer to the stars.', stages: ['Owlet', 'Apprentice Owl', 'Star Sage'] },
  { id: 'dragon', name: 'Dragon', price: 300, blurb: 'From a pocket-sized hatchling to your emerald guardian.', stages: ['Hatchling', 'Young Drake', 'Jade Guardian'] },
]

export function stageFor(xp) {
  return xp >= STAGE_XP[2] ? 3 : xp >= STAGE_XP[1] ? 2 : 1
}

export function petSprite(petId, stage) {
  if (petId === 'owl' && stage === 3) return 'clean/owl3.webp?v=grip2'
  return `clean/${petId}${stage > 1 ? stage : ''}.webp`
}

export const effects = [
  { id: 'none', name: 'Quiet', price: 0, blurb: 'Just the pieces and your next idea.' },
  { id: 'fireflies', name: 'Fireflies', price: 60, blurb: 'A little golden light with every correct move.' },
  { id: 'petals', name: 'Garden Petals', price: 110, blurb: 'Soft petals and sage leaves drift from your move.' },
  { id: 'starlight', name: 'Starlight', price: 180, blurb: 'Tiny stars celebrate a bright idea.' },
]

export const catalogue = { boards, pieceSets, decorations, furniture, rooms, pets, effects }

export function findItem(kind, id) {
  return catalogue[kind]?.find((i) => i.id === id) ?? null
}
