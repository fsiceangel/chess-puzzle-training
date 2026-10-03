// Replays every puzzle through a real chess engine and checks the shape the app
// relies on. Run after rebuilding the puzzle files.
//
//   npm run validate
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Chess } from 'chess.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'public', 'puzzles')

const MATE_PARTS = new Set(['mate-in-one', 'mate-in-two', 'mate-in-three', 'mating-attacks'])
const EXPECTED = {
  'mate-in-one': 306,
  'mate-in-two': 3412,
  'mate-in-three': 744,
  'mating-attacks': 600,
  endgames: 144,
  combinations: 128,
}

let failures = 0
let checked = 0
const fail = (id, msg) => {
  failures++
  if (failures <= 20) console.error(`  x ${id}: ${msg}`)
}

const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'))
const seen = new Set()

for (const [partId, expectedCount] of Object.entries(EXPECTED)) {
  const file = path.join(DIR, `${partId}.json`)
  if (!fs.existsSync(file)) {
    console.error(`  x ${partId}.json is missing — run: npm run puzzles <csv>`)
    failures++
    continue
  }
  const { puzzles } = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (puzzles.length !== expectedCount) {
    fail(partId, `has ${puzzles.length} puzzles, expected ${expectedCount}`)
  }

  for (const p of puzzles) {
    checked++
    if (seen.has(p.id)) fail(p.id, 'appears in more than one part')
    seen.add(p.id)

    let game
    try {
      game = new Chess(p.fen)
    } catch (e) {
      fail(p.id, `bad FEN: ${e.message}`)
      continue
    }

    // The solver answers the opponent's first move, so the line must have an
    // even number of plies and end on the solver's move.
    if (p.moves.length < 2 || p.moves.length % 2 !== 0) {
      fail(p.id, `line has ${p.moves.length} plies, expected an even number of at least 2`)
      continue
    }

    const solver = game.turn() === 'w' ? 'b' : 'w'
    let broke = false
    for (let i = 0; i < p.moves.length; i++) {
      const m = p.moves[i]
      const expectMover = i % 2 === 0 ? (solver === 'w' ? 'b' : 'w') : solver
      if (game.turn() !== expectMover) {
        fail(p.id, `ply ${i}: ${game.turn()} to move, expected ${expectMover}`)
        broke = true
        break
      }
      const res = game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] })
      if (!res) {
        fail(p.id, `ply ${i} (${m}) is not legal`)
        broke = true
        break
      }
    }
    if (broke) continue

    if (MATE_PARTS.has(partId) && !game.isCheckmate()) {
      fail(p.id, `${partId} line does not end in checkmate`)
    }
    if (!Number.isFinite(p.rating)) fail(p.id, 'missing rating')
    if (!Array.isArray(p.motifs)) fail(p.id, 'missing motifs array')
  }

  const meta = index.parts.find((x) => x.id === partId)
  if (!meta) fail(partId, 'not listed in index.json')
  else if (meta.count !== puzzles.length) fail(partId, `index.json says ${meta.count}, file has ${puzzles.length}`)

  console.log(`  ${partId.padEnd(15)} ${String(puzzles.length).padStart(4)} puzzles ok`)
}

console.log(`\nchecked ${checked} puzzles, ${failures} problem${failures === 1 ? '' : 's'}`)
if (failures > 20) console.error(`(${failures - 20} more not shown)`)
process.exit(failures ? 1 : 0)
