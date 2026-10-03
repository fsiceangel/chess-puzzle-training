import { parts } from '../data/parts.js'
import { loadPart, setCount, SET_SIZE } from '../lib/puzzles.js'
import { nextSetIndex, today } from '../lib/storage.js'
import { mulberry32, seedFrom, useAsync } from '../lib/useAsync.js'
import { Spinner, ErrorNote } from '../components/ui.jsx'
import PuzzleRunner from './PuzzleRunner.jsx'

// The daily ten: mostly mates in one and two, with a taste of the harder parts.
// Puzzles are drawn from around where she has got to in each part, so the mix
// gets harder as the course does.
const RECIPE = [
  ['mate-in-one', 2],
  ['mate-in-two', 4],
  ['mate-in-three', 2],
  ['endgames', 1],
  ['combinations', 1],
]

function pickFor(partId, n, pool, random) {
  const part = parts.find((p) => p.id === partId)
  const frontier = (nextSetIndex(partId, setCount(part.total)) + 2) * SET_SIZE
  const ceiling = Math.min(pool.length, Math.max(SET_SIZE * 3, frontier))
  const chosen = new Set()
  let guard = 0
  while (chosen.size < n && guard++ < 200) chosen.add(Math.floor(random() * ceiling))
  return [...chosen].map((i) => ({ ...pool[i], partId }))
}

export default function DailyPage() {
  const date = today()
  const { loading, data, error } = useAsync(
    () => Promise.all(RECIPE.map(([id]) => loadPart(id))),
    date,
  )

  if (loading) return <main className="page page-narrow"><Spinner label="Building today's mix…" /></main>
  if (error) return <main className="page page-narrow"><ErrorNote error={error} /></main>

  const random = mulberry32(seedFrom(date))
  const puzzles = RECIPE.flatMap(([id, n], i) => pickFor(id, n, data[i], random)).filter((p) => p.id)

  return (
    <PuzzleRunner
      key={date}
      puzzles={puzzles}
      partId="daily"
      partAccent="amber"
      title="Daily mix"
      subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      backHref="#/"
      runKey={`daily/${date}`}
    />
  )
}
