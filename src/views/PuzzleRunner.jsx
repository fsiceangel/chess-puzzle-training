import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board.jsx'
import { BackLink, Confetti, ProgressRing, StarBar } from '../components/ui.jsx'
import { Bulb, Check, Cross, Eye, Refresh, ArrowRight } from '../components/icons.jsx'
import {
  clearRun,
  loadRun,
  recordPuzzle,
  recordSet,
  runSignature,
  saveRun,
  starsFor,
  todayStats,
  getEquipped,
  petStage,
} from '../lib/storage.js'
import { solverColor } from '../lib/puzzles.js'
import { check as checkBadges } from '../data/badges.js'
import { toast } from '../lib/toast.js'
import { pets, petSprite } from '../data/shop.js'
import { say } from '../data/voices.js'
import { sfx } from '../lib/sound.js'

const MATE_PARTS = new Set(['mate-in-one', 'mate-in-two', 'mate-in-three', 'mating-attacks'])

const uci = (m) => ({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] })

function goalLabel(partId, puzzle) {
  if(puzzle.source?.startsWith('polgar-'))return `Book #${puzzle.number} · ${puzzle.upstreamType ?? 'Follow the printed solution'}`
  const plies = puzzle.moves.length - 1
  const mine = Math.ceil(plies / 2)
  if (MATE_PARTS.has(partId)) return mine === 1 ? 'Checkmate in one move' : `Checkmate in ${mine} moves`
  if (partId === 'endgames') return 'Find the winning move'
  return mine === 1 ? 'Win material in one move' : `Win material in ${mine} moves`
}

const END_MESSAGES = {
  3: 'Perfect set. Not a single slip!',
  2: 'Strong work — nearly all of them first time.',
  1: 'Good going. Run it again and beat your score.',
  0: 'Tricky set. Try it once more, the patterns will start to show.',
}

function Results({ tally, total, onRetry, backHref, onNextSet }) {
  const clean = tally.filter((t) => t.clean).length
  const stars = starsFor({ clean, total, done: tally.length })
  const pct = Math.round((clean / total) * 100)
  return (
    <div className="results">
      {stars >= 2 && <Confetti />}
      <ProgressRing pct={pct}>
        <strong>{clean}</strong>
        <span>of {total} clean</span>
      </ProgressRing>
      <StarBar stars={stars} size={30} />
      <p className="results-msg">{END_MESSAGES[stars]}</p>
      <p className="results-note">
        Solved today: <strong>{todayStats().done}</strong>
      </p>
      <div className="results-actions">
        {onNextSet && (
          <button className="btn btn-accent btn-lg" onClick={onNextSet}>
            Next set <ArrowRight size={16} />
          </button>
        )}
        <button className="btn btn-ghost btn-lg" onClick={onRetry}>
          <Refresh size={16} /> Try again
        </button>
        <a className="btn btn-ghost btn-lg" href={backHref}>
          Back
        </a>
      </div>
    </div>
  )
}

export default function PuzzleRunner({
  puzzles,
  partId,
  partAccent,
  title,
  subtitle,
  backHref,
  setIndex,
  runKey,
  onNextSet,
  notice,
}) {
  // Pick up a set that was left half-done. The signature guards against the
  // list having changed since (a new daily mix, a shifted review queue).
  const signature = runSignature(puzzles)
  const resumed = useRef(runKey ? loadRun(runKey, signature) : null)
  const [idx, setIdx] = useState(() => Math.min(resumed.current?.idx ?? 0, puzzles.length - 1))
  const [tally, setTally] = useState(() => resumed.current?.tally ?? [])
  const [done, setDone] = useState(false)
  const [runId, setRunId] = useState(0)

  const puzzle = puzzles[idx]

  const gameRef = useRef(null)
  const timers = useRef([])
  const started = useRef(Date.now())
  const [, force] = useReducer((x) => x + 1, 0)
  const [phase, setPhase] = useState('intro')
  const [step, setStep] = useState(1)
  const [mistakes, setMistakes] = useState(0)
  const [hint, setHint] = useState(0)
  const [lastMove, setLastMove] = useState(null)
  const [flash, setFlash] = useState(null)
  const [coinPop, setCoinPop] = useState(null)
  const [petMood, setPetMood] = useState('idle')
  const [petLine, setPetLine] = useState(null)
  const [effectEvent, setEffectEvent] = useState(null)
  const effectId = useRef(0)

  const after = useCallback((ms, fn) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const playMove = useCallback((move) => {
    const res = gameRef.current.move(move)
    if (!res) return null
    setLastMove({ from: res.from, to: res.to })
    if (res.captured) sfx.capture()
    else sfx.move()
    force()
    return res
  }, [])

  // Set up a puzzle: show the position for a beat, play the opponent's mistake,
  // then hand the board over.
  useEffect(() => {
    if (!puzzle || done) return undefined
    clearTimers()
    gameRef.current = new Chess(puzzle.fen)
    setPhase('intro')
    setStep(puzzle.intro === false ? 0 : 1)
    setMistakes(0)
    setHint(0)
    setLastMove(null)
    setFlash(null)
    setEffectEvent(null)
    setPetMood('idle')
    setPetLine(null)
    started.current = Date.now()
    force()
    if(puzzle.intro === false){setPhase('solve');return clearTimers}
    after(700, () => {
      playMove(uci(puzzle.moves[0]))
      setPhase('solve')
    })
    return clearTimers
  }, [puzzle?.id, done, runId, after, clearTimers, playMove])

  const game = gameRef.current
  const solver = puzzle ? solverColor(puzzle) : 'w'
  // A mixed run (daily, review) tags each puzzle with the part it came from, so
  // the goal line and the record both follow the puzzle rather than the run.
  const homePart = puzzle?.partId ?? partId
  const pet = pets.find((p) => p.id === getEquipped().pet) ?? pets[0]

  // Coins flying up, the companion cheering, any badge that just tipped over.
  function celebrate(earned) {
    setCoinPop(earned.coins)
    after(1400, () => setCoinPop(null))
    setPetMood('happy')
    setPetLine(say(pet.id, 'happy', idx))
    if (earned.goalHit) toast({ icon: '🎯', title: 'Daily goal!', text: 'Bonus coins for finishing today.' })
    if (earned.evolved) {
      const name = pet.stages?.[earned.evolved - 1] ?? pet.name
      toast({ icon: '✨', title: `${pet.name} evolved!`, text: `Now a ${name}. Go and see it in your room.` })
      sfx.finish()
    }
    checkBadges().forEach((b) => toast({ icon: b.icon, title: b.name, text: b.blurb }))
  }

  // Move to the next puzzle, saving the spot so leaving mid-set costs nothing.
  function advance(nextTally) {
    if (idx + 1 < puzzles.length) {
      if (runKey) saveRun(runKey, { idx: idx + 1, tally: nextTally, sig: signature })
      setIdx(idx + 1)
    } else {
      if (runKey) clearRun(runKey)
      setDone(true)
      sfx.finish()
    }
  }

  function finishPuzzle(clean) {
    const seconds = (Date.now() - started.current) / 1000
    const earned = recordPuzzle({ partId: homePart, puzzleId: puzzle.id, clean, seconds })
    celebrate(earned)
    const nextTally = [...tally, { id: puzzle.id, clean }]
    setTally(nextTally)
    after(clean ? 1200 : 1500, () => advance(nextTally))
  }

  function onMove(from, to, promotion) {
    if (phase !== 'solve') return
    const g = gameRef.current
    const expected = puzzle.moves[step]
    const res = g.move({ from, to, promotion: promotion ?? 'q' })
    if (!res) return
    const played = res.from + res.to + (res.promotion ?? '')
    const mated = g.isCheckmate()

    if (played !== expected && !mated) {
      // Wrong turning: put the piece back and let her try again.
      g.undo()
      setMistakes((m) => m + 1)
      setFlash({ square: to, kind: 'bad' })
      setPetMood('oops')
      setPetLine(say(pet.id, 'oops', mistakes))
      sfx.wrong()
      after(600, () => setFlash(null))
      after(1400, () => setPetMood('idle'))
      force()
      return
    }

    setLastMove({ from: res.from, to: res.to })
    if (res.captured) sfx.capture()
    else sfx.move()
    force()

    const isLast = step >= puzzle.moves.length - 1
    setEffectEvent({ id: ++effectId.current, to, solved: mated || isLast })
    if (mated || isLast) {
      setPhase('solved')
      setFlash({ square: to, kind: 'good' })
      sfx.solved()
      finishPuzzle(mistakes === 0 && hint === 0)
      return
    }
    // Opponent's reply, then it is her turn again.
    setPhase('reply')
    after(450, () => {
      playMove(uci(puzzle.moves[step + 1]))
      if(step+1>=puzzle.moves.length-1){
        setPhase('solved')
        finishPuzzle(mistakes === 0 && hint === 0)
        return
      }
      setStep(step + 2)
      setPhase('solve')
    })
  }

  function reveal() {
    if (phase !== 'solve') return
    clearTimers()
    setPhase('shown')
    const rest = puzzle.moves.slice(step)
    rest.forEach((m, i) => {
      after(i * 550, () => {
        playMove(uci(m))
        if (i === rest.length - 1) {
          const seconds = (Date.now() - started.current) / 1000
          const earned = recordPuzzle({ partId: homePart, puzzleId: puzzle.id, clean: false, seconds })
          celebrate(earned)
          const nextTally = [...tally, { id: puzzle.id, clean: false }]
          setTally(nextTally)
          after(1200, () => advance(nextTally))
        }
      })
    })
  }

  function retryRun() {
    clearTimers()
    if (runKey) clearRun(runKey)
    resumed.current = null
    setIdx(0)
    setTally([])
    setDone(false)
    setRunId((r) => r + 1)
  }

  // Record the set result once, when the run ends.
  useEffect(() => {
    if (!done || setIndex == null) return
    const r = recordSet(partId, setIndex, {
      done: tally.length,
      clean: tally.filter((t) => t.clean).length,
      total: puzzles.length,
    })
    if (r.coins) toast({ icon: '🪙', title: `+${r.coins} coins`, text: 'Set finished.' })
    checkBadges().forEach((b) => toast({ icon: b.icon, title: b.name, text: b.blurb }))
  }, [done, setIndex, partId, tally, puzzles.length])

  if (!puzzle) return null

  const pieces = game
    ? game
        .board()
        .flat()
        .filter(Boolean)
        .map((p) => ({ square: p.square, type: p.type, color: p.color }))
    : []

  const legalTargets = (square) =>
    phase === 'solve' ? gameRef.current.moves({ square, verbose: true }).map((m) => m.to) : []

  const promotionFor = (from, to) => {
    const p = gameRef.current.get(from)
    if (!p || p.type !== 'p') return null
    if ((p.color === 'w' && to[1] === '8') || (p.color === 'b' && to[1] === '1')) return p.color
    return null
  }

  const checkSquare = (() => {
    if (!game || !game.inCheck()) return null
    const t = game.turn()
    const king = game.board().flat().find((p) => p && p.type === 'k' && p.color === t)
    return king?.square ?? null
  })()

  const marks = {}
  if (flash) marks[flash.square] = flash.kind
  if (hint >= 1 && phase === 'solve') marks[puzzle.moves[step].slice(0, 2)] = 'hint'
  if (hint >= 2 && phase === 'solve') marks[puzzle.moves[step].slice(2, 4)] = 'hint'

  const toMove = solver === 'w' ? 'White' : 'Black'
  const cleanSoFar = tally.filter((t) => t.clean).length

  if (done) {
    return (
      <main className={`page page-narrow accent-${partAccent}`}>
        <div className="runner-top">
          <BackLink href={backHref}>Back</BackLink>
          <div className="quiz-title">
            <p className="eyebrow">{subtitle}</p>
            <h1>{title}</h1>
          </div>
        </div>
        <Results
          tally={tally}
          total={puzzles.length}
          onRetry={retryRun}
          backHref={backHref}
          onNextSet={onNextSet}
        />
      </main>
    )
  }

  return (
    <main className={`page accent-${partAccent}`}>
      <div className="runner-top">
        <BackLink href={backHref}>Back</BackLink>
        <div className="quiz-title">
          <p className="eyebrow">{subtitle}</p>
          <h1>{title}</h1>
        </div>
        {resumed.current && idx === resumed.current.idx && (
          <p className="resume-note">
            Picking up where you left off — puzzle {idx + 1} of {puzzles.length}.
          </p>
        )}
        <div className="quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={puzzles.length} aria-valuenow={idx}>
          {puzzles.map((_, i) => (
            <span
              key={i}
              className={'seg' + (tally[i] ? (tally[i].clean ? ' seg-clean' : ' seg-done') : i === idx ? ' seg-now' : '')}
            />
          ))}
        </div>
      </div>

      {notice&&<p role="status">{notice}</p>}
      <div className="runner">
        {coinPop != null && (
          <span className="coin-pop" aria-live="polite">
            <i className="coin" /> +{coinPop}
          </span>
        )}
        <Board
          pieces={pieces}
          positionKey={game?.fen()}
          orientation={solver}
          interactive={phase === 'solve'}
          movableColor={solver}
          legalTargets={legalTargets}
          onMove={onMove}
          promotionFor={promotionFor}
          lastMove={lastMove}
          checkSquare={checkSquare}
          markSquares={marks}
          effectEvent={effectEvent}
          className={phase === 'solved' ? 'board-won' : ''}
        />

        <div className="runner-brief">
          <div className="side-card">
            <p className="chip">
              Puzzle {idx + 1} of {puzzles.length}{puzzle.number ? ` · Book #${puzzle.number}` : ''}
            </p>
            <p className={`turn turn-${solver}`}>
              <span className="turn-dot" /> {toMove} to play
            </p>
            <h2 className="goal">{goalLabel(homePart, puzzle)}</h2>
            {phase === 'intro' && <p className="side-note">Watch the last move…</p>}
            {phase === 'reply' && <p className="side-note">Your opponent is replying…</p>}
            {phase === 'solve' && mistakes > 0 && (
              <p className="side-note side-note-bad">
                <Cross size={15} /> Not that one — look again.
              </p>
            )}
            {phase === 'solve' && step > 1 && mistakes === 0 && (
              <p className="side-note side-note-good">
                <Check size={15} /> Right so far. Now finish it.
              </p>
            )}
            {phase === 'solved' && (
              <p className="side-note side-note-good">
                <Check size={15} /> {mistakes === 0 && hint === 0 ? 'Solved, first time!' : 'Solved.'}
              </p>
            )}
            {phase === 'shown' && <p className="side-note">Here is how it goes.</p>}
          </div>
        </div>

        <aside className="runner-side">
          <div className={`side-pet side-pet-${petMood}`}>
            <img src={`${import.meta.env.BASE_URL}pets/${petSprite(pet.id, petStage(pet.id))}`} alt={pet.name} draggable="false" />
            <p>{petLine ?? say(pet.id, 'idle', idx)}</p>
          </div>
          {puzzle.motifs?.length > 0 && hint >= 1 && (
            <div className="side-card side-card-quiet">
              <p className="side-label">The idea</p>
              <p className="motifs">{puzzle.motifs.join(' · ')}</p>
            </div>
          )}

          <div className="runner-actions">
            <button className="btn btn-ghost" onClick={() => setHint((h) => Math.min(2, h + 1))} disabled={phase !== 'solve'}>
              <Bulb size={16} /> {hint === 0 ? 'Hint' : hint === 1 ? 'Bigger hint' : 'Hint shown'}
            </button>
            <button className="btn btn-ghost" onClick={reveal} disabled={phase !== 'solve'}>
              <Eye size={16} /> Show me
            </button>
          </div>

          <div className="run-tally">
            <span>
              <strong>{cleanSoFar}</strong> clean
            </span>
            <span>
              <strong>{todayStats().done}</strong> today
            </span>
            <span className="run-rating">Level {puzzle.rating}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}
