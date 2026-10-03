import { loadPart, setCount, setSlice } from '../lib/puzzles.js'
import { useAsync } from '../lib/useAsync.js'
import { Spinner, ErrorNote } from '../components/ui.jsx'
import PuzzleRunner from './PuzzleRunner.jsx'

export default function SetPage({ part, index }) {
  const { loading, data, error } = useAsync(() => loadPart(part.id), part.id)
  const sets = setCount(part.total)

  if (loading) return <main className="page page-narrow"><Spinner /></main>
  if (error) return <main className="page page-narrow"><ErrorNote error={error} /></main>

  const puzzles = setSlice(data, index)
  if (puzzles.length === 0) {
    return (
      <main className="page page-narrow">
        <ErrorNote error={`Set ${index + 1} is not part of ${part.title}.`} />
      </main>
    )
  }

  return (
    <PuzzleRunner
      key={`${part.id}/${index}`}
      puzzles={puzzles}
      partId={part.id}
      partAccent={part.accent}
      title={`Set ${index + 1}`}
      subtitle={`Part ${part.number} · ${part.title}`}
      backHref={`#/part/${part.id}`}
      setIndex={index}
      runKey={`${part.id}/${index}`}
      onNextSet={
        index + 1 < sets
          ? () => {
              window.location.hash = `#/part/${part.id}/set/${index + 1}`
            }
          : null
      }
    />
  )
}
