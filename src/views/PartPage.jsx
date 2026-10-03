import { setCount, SET_SIZE } from '../lib/puzzles.js'
import { nextSetIndex, partProgress, runInProgress, setResult, starsFor } from '../lib/storage.js'
import { BackLink, Bar, StarBar, useProgressTick } from '../components/ui.jsx'
import { ArrowRight, Bulb } from '../components/icons.jsx'

const GROUP = 25

function SetTile({ partId, index, isNext, size=SET_SIZE }) {
  const result = setResult(partId, index)
  const stars = starsFor(result)
  // A set left half-done shows how far in she got, so it reads as "carry on"
  // rather than "start over".
  const run = runInProgress(`${partId}/${index}`)
  const partial = run?.idx ?? 0
  return (
    <a
      className={
        `set-tile${result ? ' set-tile-done' : ''}${isNext ? ' set-tile-next' : ''}` +
        (partial ? ' set-tile-part' : '')
      }
      href={`#/part/${partId}/set/${index}`}
      title={
        partial
          ? `Half done — carry on at puzzle ${partial + 1}`
          : result
            ? `${result.clean} of ${result.total} solved first time`
            : 'Not started'
      }
    >
      <span className="set-n">{index + 1}</span>
      {partial ? (
        <span className="set-part" aria-label={`${partial} of ${size} done`}>
          <i style={{ width: `${(partial / size) * 100}%` }} />
        </span>
      ) : (
        <span className="set-stars">
          {[0, 1, 2].map((i) => (
            <i key={i} className={i < stars ? 'sd sd-on' : 'sd'} />
          ))}
        </span>
      )}
    </a>
  )
}

export default function PartPage({ part }) {
  useProgressTick()
  const size=part.setSize??SET_SIZE
  const sets = Math.ceil(part.total/size)
  const p = partProgress(part.id, sets)
  const next = nextSetIndex(part.id, sets)
  const groups = []
  for (let start = 0; start < sets; start += GROUP) groups.push([start, Math.min(sets, start + GROUP)])

  return (
    <main className={`page accent-${part.accent}`}>
      <BackLink href="#/">All parts</BackLink>
      <div className="page-head">
        <p className="eyebrow">Part {part.number}</p>
        <h1>{part.title}</h1>
        <p className="lede">{part.blurb}</p>
      </div>

      <div className="part-summary">
        <div>
          <p className="summary-big">
            {p.setsDone} <span>/ {sets} sets</span>
          </p>
          <Bar pct={(p.setsDone / sets) * 100} label={`${p.setsDone} of ${sets} sets`} />
          <p className="summary-sub">
            {part.total.toLocaleString()} puzzles, {size} to a set · {p.stars} stars earned
          </p>
        </div>
        <a className="btn btn-accent btn-lg" href={`#/part/${part.id}/set/${next}`}>
          {p.setsDone === 0 ? 'Start set 1' : `Set ${next + 1}`} <ArrowRight size={16} />
        </a>
      </div>

      <div className="tips-card">
        <p className="side-label">
          <Bulb size={16} /> How to crack these
        </p>
        <ul>
          {part.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      {groups.map(([start, end]) => (
        <section key={start} className="set-group">
          {groups.length > 1 && (
            <h2 className="set-group-head">
              Sets {start + 1}–{end}
            </h2>
          )}
          <div className="set-grid">
            {Array.from({ length: end - start }, (_, i) => (
              <SetTile key={start + i} partId={part.id} index={start + i} isNext={start + i === next} size={size} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
