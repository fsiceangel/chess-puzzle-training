import { useEffect, useMemo, useRef, useState } from 'react'
import { roomEvolutionScale } from '../data/companionLayout.js'
import { decorations, furniture, pets, petSprite, STAGE_XP } from '../data/shop.js'
import { chatter, newPokeState, poke as pokePet, say } from '../data/voices.js'
import {
  getDecorPos,
  getDecorWidth,
  getEquipped,
  getPetPos,
  getPetWidth,
  isOwned,
  isStored,
  petStage,
  petXp,
  setDecorPos,
  setDecorWidth,
  setPetPos,
  setPetWidth,
  SIZE_LIMITS,
  totals,
} from '../lib/storage.js'
import { sfx } from '../lib/sound.js'
import { furnitureSprite, hasDirectionArt, roomSprite } from '../data/furnitureLayout.js'
import { getDecorDirection, setDecorDirection } from '../lib/storage.js'
import { useProgressTick } from './ui.jsx'
import RoomFurniture from './RoomFurniture.jsx'

const base = import.meta.env.BASE_URL
const PET_W = 18 // percent of room width
const ASPECT = 16 / 9 // sprites are square, so height in % = width in % * this

// The study: one painted background, with everything on it movable and
// resizable — bought decorations and the companion can be dragged anywhere,
// tapped to pick up a size handle, and the companion talks back.
export default function Room({ mood = 'idle', line }) {
  useProgressTick()
  const eq = getEquipped()
  const pet = pets.find((p) => p.id === eq.pet) ?? pets[0]
  const placed = [
    ...furniture.filter((f) => isOwned('furniture', f.id) && !isStored(f.id)).map((f) => ({ ...f, dir: 'furniture' })),
    ...decorations.filter((d) => isOwned('decorations', d.id) && !isStored(d.id)).map((d) => ({ ...d, dir: 'room' })),
  ]
  const solved = totals().done
  const stage = petStage(pet.id)
  const xp = petXp(pet.id)
  const nextAt = STAGE_XP[stage] ?? null
  const prevAt = STAGE_XP[stage - 1] ?? 0
  const stageName = pet.stages?.[stage - 1] ?? pet.name

  const roomRef = useRef(null)
  const [petPos, setPetPosState] = useState(() => getPetPos())
  const [petW, setPetWState] = useState(() => getPetWidth(PET_W))
  const [decorPos, setDecorPosState] = useState(() => Object.fromEntries(placed.map((d) => [d.id, getDecorPos(d)])))
  const [decorW, setDecorWState] = useState(() => Object.fromEntries(placed.map((d) => [d.id, getDecorWidth(d)])))
  const [drag, setDrag] = useState(null) // { id, mode: 'move' | 'size', ... }
  const [selected, setSelected] = useState(null) // id whose size handle is showing
  const [poke, setPoke] = useState(null) // { mood, line, n }
  const [wiggle, setWiggle] = useState(null) // decoration id
  const pokeState = useRef(newPokeState())
  const timer = useRef(null)

  // Idle chatter rotates while she is looking at the room. It is a resettable
  // timer rather than an interval, so a tap restarts the count: whatever the
  // companion just said gets its full time before the chatter moves on.
  const [tick, setTick] = useState(0)
  const idleTimer = useRef(null)
  const armIdle = (delay = 9000) => {
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      setTick((n) => n + 1)
      armIdle()
    }, delay)
  }
  useEffect(() => {
    if (mood !== 'idle') return undefined
    armIdle()
    return () => clearTimeout(idleTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood])
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(idleTimer.current)
    },
    [],
  )

  const shownMood = poke?.mood ?? mood
  const said = useMemo(() => {
    if (poke) return poke.line
    if (line) return line
    if (mood === 'idle') return chatter(pet.id, tick, solved, stage)
    return say(pet.id, mood, tick)
  }, [mood, line, tick, poke, pet.id, solved, stage])

  function toPercent(clientX, clientY) {
    const r = roomRef.current.getBoundingClientRect()
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 }
  }

  const catalogue = [...furniture, ...decorations]
  const posOf = (id) => (id === 'pet' ? petPos : (decorPos[id] ?? getDecorPos(catalogue.find((d) => d.id === id))))
  const widthOf = (id) =>
    id === 'pet' ? petW : (decorW[id] ?? getDecorWidth(catalogue.find((d) => d.id === id)))

  // "Tidy up", a purchase, or a restored backup changes positions and sizes
  // underneath us; pick them up again whenever nothing is mid-drag.
  useEffect(() => {
    const sync = () => {
      if (drag) return
      setPetPosState(getPetPos())
      setPetWState(getPetWidth(PET_W))
      setDecorPosState(Object.fromEntries(catalogue.map((d) => [d.id, getDecorPos(d)])))
      setDecorWState(Object.fromEntries(catalogue.map((d) => [d.id, getDecorWidth(d)])))
    }
    window.addEventListener('t5334-progress', sync)
    return () => window.removeEventListener('t5334-progress', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag])

  function maxWidth(id) {
    const pos = posOf(id)
    return Math.max(SIZE_LIMITS.min, Math.min(SIZE_LIMITS.max, 100 - pos.x, (100 - pos.y) / ASPECT))
  }

  function applyWidth(id, w) {
    // keep it on the board and inside the size range
    const capped = Math.min(maxWidth(id), Math.max(SIZE_LIMITS.min, w))
    if (id === 'pet') setPetWState(capped)
    else setDecorWState((s) => ({ ...s, [id]: capped }))
    return capped
  }

  function saveWidth(id, w) {
    if (id === 'pet') setPetWidth(w)
    else setDecorWidth(id, w)
  }

  function onDown(e, id) {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const p = toPercent(e.clientX, e.clientY)
    const cur = posOf(id)
    setDrag({ id, mode: 'move', w: widthOf(id), dx: p.x - cur.x, dy: p.y - cur.y, startX: e.clientX, startY: e.clientY, moved: false })
  }

  // The corner grip: dragging it changes the width only, so the sprite keeps
  // its shape no matter how far she pulls.
  function onGripDown(e, id) {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ id, mode: 'size', startX: e.clientX, startY: e.clientY, startW: widthOf(id), moved: true })
  }

  function onMove(e) {
    if (!drag) return
    if (drag.mode === 'size') {
      const r = roomRef.current.getBoundingClientRect()
      const delta = ((e.clientX - drag.startX) + (e.clientY - drag.startY)) / 2
      applyWidth(drag.id, drag.startW + (delta / r.width) * 100)
      return
    }
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6
    if (!moved) return
    const p = toPercent(e.clientX, e.clientY)
    const next = {
      x: Math.min(100 - drag.w, Math.max(0, p.x - drag.dx)),
      y: Math.min(100 - drag.w * ASPECT, Math.max(-drag.w * ASPECT * 0.6, p.y - drag.dy)),
    }
    if (drag.id === 'pet') setPetPosState(next)
    else setDecorPosState((d) => ({ ...d, [drag.id]: next }))
    if (!drag.moved) setDrag({ ...drag, moved: true })
  }

  // A tap on the companion: it reacts, and keeps reacting differently the more
  // she taps.
  function pokeNow() {
    const r = pokePet(pet.id, pokeState.current)
    pokeState.current = r.state
    setPoke({ mood: r.anim, line: r.line, n: r.state.total })
    if (r.anim === 'faint') sfx.wrong()
    else if (r.anim === 'dizzy') sfx.capture()
    else sfx.right()
    clearTimeout(timer.current)
    clearTimeout(idleTimer.current)
    timer.current = setTimeout(() => {
      setPoke(null)
      if (mood === 'idle') armIdle()
    }, r.hold)
  }

  function onUp() {
    if (!drag) return
    if (drag.mode === 'size') {
      saveWidth(drag.id, widthOf(drag.id))
      sfx.move()
    } else if (drag.moved) {
      if (drag.id === 'pet') setPetPos(petPos)
      else setDecorPos(drag.id, decorPos[drag.id])
      sfx.move()
    } else {
      // a tap: pick this thing up for resizing, and let the companion answer
      setSelected(drag.id)
      if (drag.id === 'pet') {
        pokeNow()
      } else {
        setWiggle(drag.id)
        sfx.move()
        setTimeout(() => setWiggle(null), 600)
      }
    }
    setDrag(null)
  }

  // The size control that follows whatever is selected. Built inline rather
  // than as a nested component: a component declared inside this one is a new
  // type on every render, so React would remount the grip mid-drag and drop
  // the pointer capture.
  function stepSize(id, by) {
    const next = applyWidth(id, widthOf(id) + by)
    saveWidth(id, next)
    sfx.move()
  }

  return (
    <div className="room-editor">
    <div className="room" aria-label="Your room" ref={roomRef}>
      <img
        className="room-bg"
        src={`${base}${roomSprite(eq.room ?? 'bg')}`}
        alt=""
        draggable="false"
        onPointerDown={() => setSelected(null)}
      />
      {placed
        // Draw back to front: whatever stands lower on the floor is nearer the
        // viewer and paints over what is behind it. The rug is always the floor.
        .map((d) => ({ d, p: decorPos[d.id] ?? getDecorPos(d), w: decorW[d.id] ?? getDecorWidth(d) }))
        .sort((a, b) => (a.d.id === 'rug' ? -1 : b.d.id === 'rug' ? 1 : a.p.y + a.w * ASPECT - (b.p.y + b.w * ASPECT)))
        .map(({ d, p, w }) => {
          const dragging = drag?.id === d.id && drag.moved
          return (
            <RoomFurniture
              key={d.id}
              id={d.id} direction={getDecorDirection(d.id)} pos={p} width={w} room={eq.room ?? 'bg'}
              className={
                `room-item${dragging ? ' room-item-drag' : ''}${wiggle === d.id ? ' room-item-wiggle' : ''}` +
                (selected === d.id ? ' room-item-sel' : '')
              }
              src={`${base}${d.dir === 'furniture' ? furnitureSprite(d.id, getDecorDirection(d.id)) : `${d.dir}/${d.id}.webp`}`}
              alt={d.name}
              title={d.name}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${w}%` }}
              draggable="false"
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(d.id) } }}
              onPointerDown={(e) => onDown(e, d.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => setDrag(null)}
            />
          )
        })}
      <div
        className={`room-pet room-pet-${shownMood}${drag?.id === 'pet' && drag.moved ? ' room-pet-drag' : ''}${selected === 'pet' ? ' room-pet-sel' : ''}`}
        style={{ left: `${petPos.x}%`, top: `${petPos.y}%`, width: `${petW}%` }}
        onPointerDown={(e) => onDown(e, 'pet')}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
        role="button"
        tabIndex={0}
        aria-label={`${pet.name}. Tap to say hello, drag to move.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            pokeNow()
          }
        }}
      >
        <img style={{ width: `${roomEvolutionScale(pet.id, stage)*100}%`, marginLeft: `${(1-roomEvolutionScale(pet.id, stage))*50}%`, marginTop: `${(1-roomEvolutionScale(pet.id, stage))*100}%` }} key={`${stage}-${poke?.n ?? 'idle'}`} src={`${base}pets/${petSprite(pet.id, stage)}`} alt="" draggable="false" />
        {said && <span className="room-bubble">{said}</span>}
        <span className="pet-xp" title={nextAt ? `${xp} / ${nextAt} XP` : `${xp} XP · fully grown`}>
          <em>{stageName}</em>
          <i>
            <b style={{ width: nextAt ? `${Math.min(100, ((xp - prevAt) / (nextAt - prevAt)) * 100)}%` : '100%' }} />
          </i>
        </span>
      </div>
      {selected && (() => {
        const pos = posOf(selected)
        const w = widthOf(selected)
        return (
          <div className="room-size-corner" style={{ left: `clamp(18px, ${pos.x + w}%, calc(100% - 18px))`, top: `clamp(18px, ${pos.y + w * ASPECT}%, calc(100% - 18px))` }}>
            <span
              className="room-size-grip"
              role="slider"
              tabIndex={0}
              aria-label="Size"
              aria-valuenow={Math.round(w)}
              aria-valuemin={SIZE_LIMITS.min}
              aria-valuemax={maxWidth(selected)}
              title="Drag to resize"
              onPointerDown={(e) => onGripDown(e, selected)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => {
                if (['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key)) e.preventDefault()
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') stepSize(selected, 1)
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') stepSize(selected, -1)
              }}
            >
              ↘
            </span>
          </div>
        )
      })()}
    </div>
    {selected && (() => {
      const w = widthOf(selected)
      const item = catalogue.find(d => d.id === selected)
      const original = selected === 'pet' ? PET_W : item.w
      const percent = Math.round(w / original * 100)
      return <div className="room-size-toolbar" role="group" aria-label="Resize selected item" onKeyDown={e => { if (e.key === 'Escape') setSelected(null) }}>
        <div className="room-size-label"><strong>{selected === 'pet' ? stageName : item.name}</strong><span>Size <output>{percent}%</output></span></div>
        {hasDirectionArt(selected) && <div className="room-direction" role="group" aria-label="Furniture direction">
          <span>Facing</span>
          {['left', 'right'].map(direction => <button key={direction} className="btn btn-ghost" aria-pressed={getDecorDirection(selected) === direction} onClick={() => setDecorDirection(selected, direction)}>{direction === 'left' ? '↗ Rightward' : '↖ Leftward'}</button>)}
        </div>}
        <div className="room-size-adjust">
          <button className="room-size-btn" aria-label="Smaller" disabled={w <= SIZE_LIMITS.min} onClick={() => stepSize(selected, -1)}>−</button>
          <input type="range" aria-label="Item size" aria-valuetext={`${percent}% of original size`} min={SIZE_LIMITS.min} max={maxWidth(selected)} step="0.1" value={w} onChange={e => { const next = applyWidth(selected, Number(e.target.value)); saveWidth(selected, next) }}/>
          <button className="room-size-btn" aria-label="Bigger" disabled={w >= maxWidth(selected) - .05} onClick={() => stepSize(selected, 1)}>+</button>
        </div>
        <button className="btn btn-ghost" onClick={() => { const next = applyWidth(selected, original); saveWidth(selected, next) }}>Reset size</button>
        <button className="btn btn-accent" onClick={() => setSelected(null)}>Done</button>
      </div>
    })()}
    </div>
  )
}
