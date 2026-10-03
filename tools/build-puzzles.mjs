// Builds the puzzle set for the site from the Lichess puzzle database (CC0).
//
//   node tools/build-puzzles.mjs <path-to-lichess_db_puzzle.csv.zst>
//
// The source file is a ~300 MB stream of ~5 million puzzles mined from real
// games. We keep 5334 of them, split into the six parts below in the same
// proportions the classic training book uses, sorted easy-to-hard so a set
// ramps up instead of jumping around.
//
// CSV columns: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,
//              Themes,GameUrl,OpeningTags
//
// A Lichess FEN is the position *before* the opponent's mistake, and Moves[0]
// is that mistake. We keep both, so the board can play the blunder as an
// opening animation and the solver answers from move 1.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'puzzles')

// Quality bar. Popularity is a -100..100 up/down score from solvers, so a high
// floor throws out puzzles people found broken or dull. A tight rating
// deviation means the difficulty number has actually settled.
const MIN_POPULARITY = 92
const MIN_PLAYS = 500
const MAX_RD = 85

const has = (themes, t) => themes.includes(t)

// Motifs we surface as an on-demand hint, in the order we prefer to name them.
const MOTIFS = [
  ['backRankMate', 'Back-rank mate'],
  ['smotheredMate', 'Smothered mate'],
  ['anastasiaMate', 'Anastasia mate'],
  ['arabianMate', 'Arabian mate'],
  ['bodenMate', 'Boden mate'],
  ['doubleBishopMate', 'Two bishops mate'],
  ['hookMate', 'Hook mate'],
  ['dovetailMate', 'Dovetail mate'],
  ['killBoxMate', 'Kill box mate'],
  ['vukovicMate', 'Vukovic mate'],
  ['doubleCheck', 'Double check'],
  ['sacrifice', 'Sacrifice'],
  ['fork', 'Fork'],
  ['pin', 'Pin'],
  ['skewer', 'Skewer'],
  ['discoveredAttack', 'Discovered attack'],
  ['deflection', 'Deflection'],
  ['attraction', 'Attraction'],
  ['clearance', 'Clearance'],
  ['interference', 'Interference'],
  ['xRayAttack', 'X-ray attack'],
  ['zugzwang', 'Zugzwang'],
  ['trappedPiece', 'Trapped piece'],
  ['hangingPiece', 'Hanging piece'],
  ['capturingDefender', 'Remove the defender'],
  ['quietMove', 'Quiet move'],
  ['promotion', 'Promotion'],
  ['advancedPawn', 'Advanced pawn'],
  ['underPromotion', 'Underpromotion'],
  ['enPassant', 'En passant'],
  ['intermezzo', 'In-between move'],
  ['attackingF2F7', 'Attack on f2 or f7'],
  ['exposedKing', 'Exposed king'],
  ['kingsideAttack', 'Kingside attack'],
  ['queensideAttack', 'Queenside attack'],
]

const ENDGAME_KINDS = [
  'pawnEndgame',
  'rookEndgame',
  'queenEndgame',
  'bishopEndgame',
  'knightEndgame',
  'queenRookEndgame',
]

// Each puzzle takes the first part that matches, so it lands in exactly one
// place. Ratings are Lichess numbers; the windows keep each part inside the
// range a junior can actually work through.
const PARTS = [
  {
    id: 'mate-in-one',
    count: 306,
    rating: [400, 1150],
    match: (t) => has(t, 'mateIn1'),
  },
  {
    id: 'mate-in-two',
    count: 3412,
    rating: [700, 1650],
    match: (t) => has(t, 'mateIn2'),
  },
  {
    id: 'mate-in-three',
    count: 744,
    rating: [1000, 1950],
    match: (t) => has(t, 'mateIn3'),
  },
  {
    id: 'mating-attacks',
    count: 600,
    rating: [1200, 2150],
    match: (t) => has(t, 'mateIn4') || has(t, 'mateIn5'),
  },
  {
    id: 'endgames',
    count: 144,
    rating: [700, 1700],
    match: (t) => ENDGAME_KINDS.some((k) => has(t, k)),
  },
  {
    id: 'combinations',
    count: 128,
    rating: [800, 1750],
    match: (t) =>
      (has(t, 'fork') ||
        has(t, 'pin') ||
        has(t, 'skewer') ||
        has(t, 'discoveredAttack') ||
        has(t, 'deflection') ||
        has(t, 'capturingDefender') ||
        has(t, 'trappedPiece')) &&
      (has(t, 'crushing') || has(t, 'advantage')),
  },
]

// The download is zstd-compressed as a skippable frame followed by thousands of
// separate frames. Node's own decompressor stops dead at the end of the first
// one — it read 181k of the 6.1M rows and gave no error — so we ask for the
// decompressed CSV instead of quietly building from 3% of the database.
function openStream(file) {
  if (file.endsWith('.zst')) {
    console.error('This tool needs the decompressed CSV, not the .zst download.')
    console.error('Unpack it first with either of:')
    console.error(`  zstd -d ${file}`)
    console.error(
      '  python -c "import zstandard,shutil;' +
        `shutil.copyfileobj(zstandard.ZstdDecompressor().stream_reader(open(r'${file}','rb'),read_across_frames=True),open(r'${file.slice(0, -4)}','wb'),1<<20)"`,
    )
    process.exit(1)
  }
  return fs.createReadStream(file, { encoding: 'utf8', highWaterMark: 1 << 22 })
}

function motifsFor(themes) {
  const out = []
  for (const [key, label] of MOTIFS) {
    if (themes.includes(key)) out.push(label)
    if (out.length === 3) break
  }
  return out
}

// Spread n picks evenly over a pool already sorted by rating, so a part samples
// its whole difficulty window instead of clumping at one rating.
function spread(pool, n) {
  if (pool.length <= n) return pool
  const out = []
  for (let i = 0; i < n; i++) out.push(pool[Math.floor((i * pool.length) / n)])
  return out
}

async function main() {
  const src = process.argv[2]
  if (!src || !fs.existsSync(src)) {
    console.error('usage: node tools/build-puzzles.mjs <lichess_db_puzzle.csv.zst>')
    console.error('get the file from https://database.lichess.org/lichess_db_puzzle.csv.zst')
    process.exit(1)
  }

  const buckets = PARTS.map(() => [])
  let rows = 0
  let kept = 0

  await new Promise((resolve, reject) => {
    const stream = openStream(src)
    let tail = ''
    let header = true
    stream.on('error', reject)
    stream.on('data', (chunk) => {
      const lines = (tail + chunk).split('\n')
      tail = lines.pop()
      for (const line of lines) {
        if (header) {
          header = false
          continue
        }
        if (!line) continue
        rows++
        const f = line.split(',')
        if (f.length < 8) continue
        const rating = +f[3]
        if (+f[4] > MAX_RD || +f[5] < MIN_POPULARITY || +f[6] < MIN_PLAYS) continue
        const themes = f[7]
        for (let p = 0; p < PARTS.length; p++) {
          const part = PARTS[p]
          if (rating < part.rating[0] || rating > part.rating[1]) continue
          if (!part.match(themes)) continue
          buckets[p].push({ id: f[0], fen: f[1], moves: f[2], rating, themes })
          kept++
          break
        }
      }
    })
    stream.on('end', resolve)
  })

  console.log(`scanned ${rows.toLocaleString()} puzzles, ${kept.toLocaleString()} passed the quality bar`)
  if (rows < 4_000_000) {
    console.warn(`  ! only ${rows} rows -- the source file looks truncated, expected 6M+`)
  }

  fs.mkdirSync(OUT, { recursive: true })
  const index = []
  for (let p = 0; p < PARTS.length; p++) {
    const part = PARTS[p]
    const pool = buckets[p].sort((a, b) => a.rating - b.rating || (a.id < b.id ? -1 : 1))
    const picked = spread(pool, part.count)
    if (picked.length < part.count) {
      console.warn(`  ! ${part.id}: only ${picked.length} of ${part.count} available`)
    }
    const puzzles = picked.map((q) => ({
      id: q.id,
      fen: q.fen,
      moves: q.moves.split(' '),
      rating: q.rating,
      motifs: motifsFor(q.themes),
    }))
    fs.writeFileSync(path.join(OUT, `${part.id}.json`), JSON.stringify({ id: part.id, puzzles }))
    index.push({
      id: part.id,
      count: puzzles.length,
      pool: pool.length,
      ratingLow: puzzles[0]?.rating ?? 0,
      ratingHigh: puzzles[puzzles.length - 1]?.rating ?? 0,
    })
    console.log(
      `  ${part.id.padEnd(15)} ${String(puzzles.length).padStart(4)} puzzles  ` +
        `rating ${index[p].ratingLow}-${index[p].ratingHigh}  (pool ${pool.length})`,
    )
  }
  fs.writeFileSync(
    path.join(OUT, 'index.json'),
    JSON.stringify({ builtAt: new Date().toISOString().slice(0, 10), parts: index }, null, 2),
  )
  console.log(`total ${index.reduce((s, i) => s + i.count, 0)} puzzles -> public/puzzles/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
