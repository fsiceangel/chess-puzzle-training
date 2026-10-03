import { loadPart } from '../lib/puzzles.js'
import { reviewQueue } from '../lib/storage.js'
import { useAsync } from '../lib/useAsync.js'
import { Spinner, ErrorNote } from '../components/ui.jsx'
import { Refresh } from '../components/icons.jsx'
import PuzzleRunner from './PuzzleRunner.jsx'

const MAX = 12

// Anything solved with a slip goes on a list; this replays the newest of them.
// Getting one right first time here takes it off the list.
export default function ReviewPage() {
  const queue = reviewQueue().slice(0, MAX)
  const partIds = [...new Set(queue.map((q) => q.partId))].filter((id) => id && id !== 'daily')
  const { loading, data, error } = useAsync(
    () => Promise.all(partIds.map((id) => loadPart(id))),
    partIds.join(','),
  )

  if (queue.length === 0) {
    return (
      <main className="page page-narrow">
        <div className="page-head">
          <p className="eyebrow">Second look</p>
          <h1>Nothing to review</h1>
          <p className="lede">
            Puzzles you solve after a wrong turn land here so you can meet them again a bit later. Solve one first time
            and it comes straight off the list.
          </p>
        </div>
        <a className="btn btn-accent btn-lg" href="#/">
          <Refresh size={16} /> Back to the course
        </a>
      </main>
    )
  }

  if (loading) return <main className="page page-narrow"><Spinner label="Finding those puzzles…" /></main>
  if (error) return <main className="page page-narrow"><ErrorNote error={error} /></main>

  const byId = new Map()
  partIds.forEach((id, i) => data[i].forEach((p) => byId.set(p.id, { ...p, partId: id })))
  const puzzles = queue.map((q) => byId.get(q.id)).filter(Boolean)

  if (puzzles.length === 0) {
    return (
      <main className="page page-narrow">
        <ErrorNote error="Those puzzles are no longer in the set." />
      </main>
    )
  }

  return (
    <PuzzleRunner
      key={puzzles.map((p) => p.id).join('')}
      puzzles={puzzles}
      partId="review"
      partAccent="violet"
      title="Second look"
      subtitle={`${puzzles.length} puzzle${puzzles.length === 1 ? '' : 's'} worth another try`}
      backHref="#/"
      runKey="review"
    />
  )
}
