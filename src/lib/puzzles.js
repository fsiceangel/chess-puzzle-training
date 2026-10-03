// Puzzle loading. Each part is one JSON file under public/puzzles/, fetched the
// first time that part is opened and then kept in memory for the session.
export const SET_SIZE = 12

const cache = new Map()

export function loadPart(partId) {
  if (!cache.has(partId)) {
    const url = `${import.meta.env.BASE_URL}puzzles/${partId}.json`
    cache.set(
      partId,
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`Could not load ${partId} (${r.status})`)
          return r.json()
        })
        .then((d) => d.puzzles)
        .catch((e) => {
          cache.delete(partId)
          throw e
        }),
    )
  }
  return cache.get(partId)
}

export const setCount = (total) => Math.ceil(total / SET_SIZE)

export const setSlice = (puzzles, index) => puzzles.slice(index * SET_SIZE, index * SET_SIZE + SET_SIZE)

// The side to move once the opponent's blunder has been played is the side the
// solver plays, and the board is shown from that side.
export function solverColor(puzzle) {
  const turn = puzzle.fen.split(' ')[1]
  if(puzzle.intro === false) return turn
  return turn === 'w' ? 'b' : 'w'
}
