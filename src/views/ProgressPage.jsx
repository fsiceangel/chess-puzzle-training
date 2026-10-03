import { useRef, useState } from 'react'
import { parts } from '../data/parts.js'
import { setCount } from '../lib/puzzles.js'
import {
  exportSave,
  parseSave,
  getSettings,
  importAll,
  lastDays,
  partProgress,
  badgeList,
  resetAll,
  setSetting,
  streak,
  todayStats,
  totals,
} from '../lib/storage.js'
import { badges } from '../data/badges.js'
import { Bar, ProgressRing, StarBar, useProgressTick } from '../components/ui.jsx'
import { Flame, Target, Clock, Check } from '../components/icons.jsx'

const WEEKS = 12
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

function heatLevel(done, goal) {
  if (!done) return 0
  if (done >= goal * 2) return 4
  if (done >= goal) return 3
  if (done >= goal / 2) return 2
  return 1
}

function Heatmap({ goal }) {
  // Fill back to the Monday before the window starts so columns are real weeks.
  const days = lastDays(WEEKS * 7)
  const firstDow = (new Date(days[0].date + 'T00:00:00').getDay() + 6) % 7
  const cells = [...Array.from({ length: firstDow }, () => null), ...days]
  const columns = []
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7))
  return (
    <div className="heat">
      <div className="heat-days">
        {DAY_LABELS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="heat-grid">
        {columns.map((col, ci) => (
          <div className="heat-col" key={ci}>
            {Array.from({ length: 7 }, (_, ri) => {
              const c = col[ri]
              if (!c) return <span key={ri} className="heat-cell heat-empty" />
              return (
                <span
                  key={ri}
                  className={`heat-cell heat-${heatLevel(c.done, goal)}`}
                  title={`${c.date}: ${c.done} solved`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Backup() {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  function download() {
    const blob = new Blob([exportSave()], { type: 'application/octet-stream' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `chess-puzzle-training-${new Date().toISOString().replace(/[:.]/g, '-')}.sav`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setMsg('Save file download started.')
  }

  function restore(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) { setMsg('Save file is too large (maximum 10 MB).'); return }
    file
      .text()
      .then((text) => {
        const data = parseSave(text)
        if (!window.confirm(`Import "${file.name}" (${data.coins} coins)? This replaces progress, purchases, companions and room settings in this browser. Export your current save first if you want to keep it.`)) return
        importAll(text)
        setMsg('Save imported. Reloading…')
        window.location.reload()
      })
      .catch((err) => setMsg(err.message))
    e.target.value = ''
  }

  return (
    <div className="settings-row" id="save-files">
      <div>
        <p className="settings-name">Save files</p>
        <p className="settings-hint">
          Export a .sav file to move your progress, coins, companions and room to another browser or the online game. Import replaces this browser’s save. Older .json backups also work.
        </p>
      </div>
      <div className="settings-controls">
        <button className="btn btn-ghost" onClick={download}>
          Export .sav
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
          Import save
        </button>
        <input ref={fileRef} type="file" accept=".sav,.json,application/json,application/octet-stream" aria-label="Choose a save file" hidden onChange={restore} />
        {msg && <span className="settings-msg" role="status">{msg}</span>}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  useProgressTick()
  const t = todayStats()
  const all = totals()
  const s = getSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const week = lastDays(7)
  const weekTotal = week.reduce((n, d) => n + d.done, 0)
  const minutes = Math.round(all.seconds / 60)

  return (
    <main className="page">
      <div className="page-head">
        <p className="eyebrow">Progress</p>
        <h1>How it is going</h1>
      </div>

      <section className="stat-row">
        <div className="stat-card">
          <ProgressRing pct={(t.done / s.goal) * 100} size={92} stroke={8}>
            <strong>{t.done}</strong>
            <span>today</span>
          </ProgressRing>
          <div>
            <p className="stat-big">{t.done}</p>
            <p className="stat-label">solved today</p>
            <p className="stat-sub">{t.clean} of them first time</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon accent-amber">
            <Flame size={22} />
          </span>
          <div>
            <p className="stat-big">{streak()}</p>
            <p className="stat-label">day streak</p>
            <p className="stat-sub">{weekTotal} solved this week</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon accent-teal">
            <Check size={22} />
          </span>
          <div>
            <p className="stat-big">{all.done.toLocaleString()}</p>
            <p className="stat-label">solved all time</p>
            <p className="stat-sub">
              {all.done ? Math.round((all.clean / all.done) * 100) : 0}% first time
            </p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon accent-violet">
            <Clock size={22} />
          </span>
          <div>
            <p className="stat-big">{minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`}</p>
            <p className="stat-label">at the board</p>
            <p className="stat-sub">over {all.days} day{all.days === 1 ? '' : 's'}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-head">Last {WEEKS} weeks</h2>
        <Heatmap goal={s.goal} />
        <div className="heat-key">
          <span>quiet</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`heat-cell heat-${l}`} />
          ))}
          <span>busy</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-head">The course</h2>
        <table className="part-table">
          <thead>
            <tr>
              <th>Part</th>
              <th>Sets</th>
              <th>Puzzles</th>
              <th>Stars</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => {
              const sets = setCount(p.total)
              const pr = partProgress(p.id, sets)
              return (
                <tr key={p.id}>
                  <th scope="row">
                    <a href={`#/part/${p.id}`}>{p.title}</a>
                  </th>
                  <td>
                    {pr.setsDone} / {sets}
                  </td>
                  <td>{pr.puzzles.toLocaleString()}</td>
                  <td>
                    <StarBar stars={Math.min(3, Math.round(pr.stars / Math.max(1, pr.setsDone)))} size={13} />
                  </td>
                  <td className={`accent-${p.accent}`} style={{ width: '30%' }}>
                    <Bar pct={(pr.setsDone / sets) * 100} label={`${pr.setsDone} of ${sets}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2 className="section-head">Badges</h2>
        <div className="badge-grid">
          {badges.map((b) => {
            const at = badgeList()[b.id]
            return (
              <div key={b.id} className={`badge${at ? '' : ' badge-off'}`} title={at ? new Date(at).toLocaleDateString() : 'Not yet'}>
                <span className="badge-icon">{b.icon}</span>
                <strong>{b.name}</strong>
                <span>{b.blurb}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-head">Settings</h2>
        <div className="settings-row">
          <div>
            <p className="settings-name">
              <Target size={16} /> Daily goal
            </p>
            <p className="settings-hint">How many puzzles count as a full day.</p>
          </div>
          <div className="settings-controls">
            {[5, 10, 15, 20, 30].map((n) => (
              <button
                key={n}
                className={`chip-btn${s.goal === n ? ' chip-btn-on' : ''}`}
                onClick={() => setSetting('goal', n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-name">Sound</p>
            <p className="settings-hint">Move clicks and a fanfare when a set is finished.</p>
          </div>
          <div className="settings-controls">
            <button className={`chip-btn${s.sound ? ' chip-btn-on' : ''}`} onClick={() => setSetting('sound', true)}>
              On
            </button>
            <button className={`chip-btn${!s.sound ? ' chip-btn-on' : ''}`} onClick={() => setSetting('sound', false)}>
              Off
            </button>
          </div>
        </div>
        <Backup />
        <div className="settings-row">
          <div>
            <p className="settings-name">Start again</p>
            <p className="settings-hint">Clears every solved puzzle, star and streak on this computer.</p>
          </div>
          <div className="settings-controls">
            {confirmReset ? (
              <>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    resetAll()
                    setConfirmReset(false)
                  }}
                >
                  Yes, erase it all
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
                Reset progress
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
