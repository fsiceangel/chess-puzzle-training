import { parts } from '../data/parts.js'
import { BookCourse } from './BookPage.jsx'
import { setCount } from '../lib/puzzles.js'
import { getCoins, getSettings, nextSetIndex, partProgress, resetRoom, reviewQueue, streak, todayStats, totals } from '../lib/storage.js'
import { useState } from 'react'
import Room from '../components/Room.jsx'
import StoragePanel from '../components/StoragePanel.jsx'
import { Bar, StarBar, ProgressRing, useProgressTick } from '../components/ui.jsx'
import { ArrowRight, Flame, Refresh, Swords, Target } from '../components/icons.jsx'

function PartCard({ part }) {
  const sets = setCount(part.total)
  const p = partProgress(part.id, sets)
  const pct = Math.round((p.setsDone / sets) * 100)
  const next = nextSetIndex(part.id, sets)
  return (
    <a className={`part-card accent-${part.accent}`} href={`#/part/${part.id}`}>
      <div className="part-num">{part.number}</div>
      <div className="part-body">
        <h3>{part.title}</h3>
        <p className="part-sub">{part.subtitle}</p>
        <p className="part-meta">
          {part.total.toLocaleString()} puzzles · {sets} sets
        </p>
        <Bar pct={pct} label={`${p.setsDone} of ${sets} sets done`} />
        <p className="part-foot">
          {p.setsDone === 0 ? (
            <span className="part-go">
              Start part {part.number} <ArrowRight size={15} />
            </span>
          ) : (
            <>
              <StarBar stars={Math.min(3, Math.round(p.stars / Math.max(1, p.setsDone)))} size={14} />
              <span className="part-go">
                Set {next + 1} <ArrowRight size={15} />
              </span>
            </>
          )}
        </p>
      </div>
    </a>
  )
}

export default function Home() {
  useProgressTick()
  const t = todayStats()
  const goal = getSettings().goal
  const all = totals()
  const days = streak()
  const review = reviewQueue().length
  const coins = getCoins()
  const [storage, setStorage] = useState(false)

  const resume = parts.find((p) => partProgress(p.id, setCount(p.total)).setsDone < setCount(p.total)) ?? parts[0]
  const resumeSet = nextSetIndex(resume.id, setCount(resume.total))

  const mood = t.done >= goal ? 'proud' : all.done === 0 ? 'idle' : 'idle'

  return (
    <main className="page">
      <section className="home-room">
        <Room mood={mood} />
        <div className="home-room-bar">
          <span className="coin-pill">
            <i className="coin" /> {coins}
          </span>
          <span className="home-room-actions">
            <button className="btn btn-ghost" onClick={() => setStorage((s) => !s)} aria-expanded={storage}>
              {storage ? 'Close' : 'Show / hide'}
            </button>
            <button className="btn btn-ghost" onClick={resetRoom} title="Put everything back where it started">
              Tidy up
            </button>
            <a className="btn btn-accent" href="#/shop">
              Shop <ArrowRight size={15} />
            </a>
          </span>
        </div>
        {storage && <StoragePanel onClose={() => setStorage(false)} />}
      </section>

      <section className="today-card">
        <ProgressRing pct={(t.done / goal) * 100} size={104} stroke={9}>
          <strong>{t.done}</strong>
          <span>of {goal}</span>
        </ProgressRing>
        <div className="today-body">
          <p className="today-title">
            {t.done === 0
              ? 'Nothing solved yet today.'
              : t.done >= goal
                ? 'Daily goal done. Anything more is a bonus!'
                : `${goal - t.done} more to hit today's goal.`}
          </p>
          <div className="today-stats">
            <span>
              <Flame size={16} /> <strong>{days}</strong> day streak
            </span>
            <span>
              <Target size={16} /> <strong>{t.clean}</strong> first-time today
            </span>
            <span>
              <Swords size={16} /> <strong>{all.done.toLocaleString()}</strong> all time
            </span>
          </div>
        </div>
      </section>

      <BookCourse />

    </main>
  )
}
