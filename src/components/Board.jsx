import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ArtPiece from './ArtPieces.jsx'
import MoveEffect from './MoveEffect.jsx'
import { getEquipped } from '../lib/storage.js'
import { useProgressTick } from './ui.jsx'

const FILES = 'abcdefgh'
const RANKS = '87654321'

export function squareToXY(square, orientation) {
  const file = FILES.indexOf(square[0])
  const rank = RANKS.indexOf(square[1])
  return orientation === 'w' ? { x: file, y: rank } : { x: 7 - file, y: 7 - rank }
}

// Pieces keep an identity across positions so React moves the same DOM node and
// the CSS transform transition animates the move instead of teleporting it.
// A piece is the same piece if it stayed put; otherwise the nearest unmatched
// piece of the same type and colour is the one that moved.
function reconcile(prev, next) {
  const out = []
  const free = prev.slice()
  const takeAt = (p) => {
    const i = free.findIndex((q) => q.square === p.square && q.type === p.type && q.color === p.color)
    if (i < 0) return null
    return free.splice(i, 1)[0]
  }
  const pending = []
  for (const p of next) {
    const stayed = takeAt(p)
    if (stayed) out.push({ ...p, id: stayed.id })
    else pending.push(p)
  }
  for (const p of pending) {
    let best = -1
    let bestDist = Infinity
    for (let i = 0; i < free.length; i++) {
      const q = free[i]
      if (q.type !== p.type || q.color !== p.color) continue
      const d =
        Math.abs(FILES.indexOf(q.square[0]) - FILES.indexOf(p.square[0])) +
        Math.abs(+q.square[1] - +p.square[1])
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    if (best >= 0) out.push({ ...p, id: free.splice(best, 1)[0].id })
    else out.push({ ...p, id: `${p.color}${p.type}-${p.square}-${Math.random().toString(36).slice(2, 7)}` })
  }
  return out
}

const PROMOTION_CHOICES = ['q', 'r', 'b', 'n']

export default function Board({
  pieces,
  positionKey,
  orientation = 'w',
  interactive = true,
  movableColor,
  legalTargets,
  onMove,
  promotionFor,
  lastMove,
  checkSquare,
  markSquares,
  effectEvent,
  coordinates = true,
  className = '',
}) {
  // The skin is a saved setting rather than a prop, so every board follows it
  // the moment it changes on the Progress page.
  useProgressTick()
  const equipped = getEquipped()
  const pieceSet = equipped.pieces
  const effectOrigin = effectEvent ? squareToXY(effectEvent.to, orientation) : null

  const ref = useRef(null)
  const tracked = useRef([])
  const [selected, setSelected] = useState(null)
  const [drag, setDrag] = useState(null)
  const [promo, setPromo] = useState(null)

  // Reconcile during render so ids are stable for this paint, not one behind.
  const rendered = reconcile(tracked.current, pieces)
  useLayoutEffect(() => {
    tracked.current = rendered
  })

  const targets = selected && interactive ? legalTargets(selected) : []

  // Clear any half-made move when the position itself changes. Keyed on the
  // FEN rather than the pieces array, which is rebuilt on every render.
  useEffect(() => {
    setSelected(null)
    setDrag(null)
    setPromo(null)
  }, [positionKey, movableColor])

  const squareAt = useCallback(
    (clientX, clientY) => {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return null
      const cx = Math.floor(((clientX - box.left) / box.width) * 8)
      const cy = Math.floor(((clientY - box.top) / box.height) * 8)
      if (cx < 0 || cx > 7 || cy < 0 || cy > 7) return null
      return orientation === 'w' ? FILES[cx] + RANKS[cy] : FILES[7 - cx] + RANKS[7 - cy]
    },
    [orientation],
  )

  const tryMove = useCallback(
    (from, to) => {
      if (from === to) return
      if (!legalTargets(from).includes(to)) return
      const colour = promotionFor?.(from, to)
      if (colour) setPromo({ from, to, color: colour })
      else onMove(from, to)
      setSelected(null)
    },
    [legalTargets, onMove, promotionFor],
  )

  function onPointerDown(e) {
    if (!interactive || promo) return
    const sq = squareAt(e.clientX, e.clientY)
    if (!sq) return
    const piece = pieces.find((p) => p.square === sq)
    if (piece && piece.color === movableColor) {
      e.currentTarget.setPointerCapture?.(e.pointerId)
      setSelected(sq)
      setDrag({ from: sq, x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId })
    } else if (selected) {
      tryMove(selected, sq)
      if (!piece) setSelected(null)
    }
  }

  function onPointerMove(e) {
    if (!drag) return
    const moved = drag.moved || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved })
  }

  function onPointerUp(e) {
    if (!drag) return
    const sq = squareAt(e.clientX, e.clientY)
    const wasDragged = drag.moved
    setDrag(null)
    if (!sq) return
    // A tap selects and waits for a second tap; a drag drops the piece.
    if (wasDragged) tryMove(drag.from, sq)
    else if (sq !== drag.from && selected === drag.from) tryMove(drag.from, sq)
  }

  const squares = []
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = orientation === 'w' ? FILES[x] + RANKS[y] : FILES[7 - x] + RANKS[7 - y]
      const dark = (x + y) % 2 === 1
      const cls = ['sq', dark ? 'sq-dark' : 'sq-light']
      if (square === selected) cls.push('sq-sel')
      if (lastMove && (square === lastMove.from || square === lastMove.to)) cls.push('sq-last')
      if (square === checkSquare) cls.push('sq-check')
      const mark = markSquares?.[square]
      if (mark) cls.push(`sq-${mark}`)
      const target = targets.includes(square)
      squares.push(
        <div key={square} className={cls.join(' ')} style={{ '--x': x, '--y': y }}>
          {target && <span className={pieces.some((p) => p.square === square) ? 'dot dot-capture' : 'dot'} />}
        </div>,
      )
    }
  }

  const box = ref.current?.getBoundingClientRect()
  const cell = box ? box.width / 8 : 0

  return (
    <div className={`board-wrap board-t-${equipped.board} ${className}`}>
      <div
        ref={ref}
        className={
          `board${interactive ? '' : ' board-static'}${drag?.moved ? ' board-dragging' : ''}` +
          ' board-painted'
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="board-squares">{squares}</div>
        {effectOrigin && <MoveEffect effect={equipped.effect} event={effectEvent} x={(effectOrigin.x + .5) * 12.5} y={(effectOrigin.y + .5) * 12.5} />}
        <div className="board-pieces">
          {rendered.map((p) => {
            const { x, y } = squareToXY(p.square, orientation)
            const dragging = drag?.moved && drag.from === p.square
            const style = dragging
              ? {
                  transform: `translate(${drag.x - (box?.left ?? 0) - cell / 2}px, ${
                    drag.y - (box?.top ?? 0) - cell / 2
                  }px)`,
                  transition: 'none',
                }
              : { transform: `translate(${x * 100}%, ${y * 100}%)` }
            return (
              <div key={p.id} className={`pc-slot${dragging ? ' pc-drag' : ''}`} style={style}>
                <ArtPiece type={p.type} color={p.color} set={pieceSet} />
              </div>
            )
          })}
        </div>
        {coordinates && (
          <>
            <div className="board-files" aria-hidden="true">
              {(orientation === 'w' ? FILES : [...FILES].reverse().join('')).split('').map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <div className="board-ranks" aria-hidden="true">
              {(orientation === 'w' ? RANKS : [...RANKS].reverse().join('')).split('').map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </>
        )}
        {promo && (
          <div className="promo-overlay">
            <div className="promo-card">
              <p>Promote to</p>
              <div className="promo-row">
                {PROMOTION_CHOICES.map((t) => (
                  <button
                    key={t}
                    className="promo-btn"
                    onClick={() => {
                      const { from, to } = promo
                      setPromo(null)
                      onMove(from, to, t)
                    }}
                  >
                    <ArtPiece type={t} color={promo.color} set={pieceSet} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
