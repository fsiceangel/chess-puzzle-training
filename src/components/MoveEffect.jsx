import { useEffect, useState } from 'react'
import '../styles/effects.css'

// Finite bursts, created only by an accepted player move or an explicit preview.
// Percentages keep their origin aligned with the board at every viewport size.
export default function MoveEffect({ effect = 'none', event, x = 50, y = 50 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    if (!event || effect === 'none' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 850)
    return () => clearTimeout(timer)
  }, [event, effect])
  if (!visible) return null
  const count = event?.solved ? 16 : 10
  return (
    <span key={event.id} className={`move-effect effect-${effect}`} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      <span className="effect-ring" />
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 22 + (i % 3) * 9
        return <i key={i} style={{ '--dx': `${Math.cos(angle) * radius}px`, '--dy': `${Math.sin(angle) * radius - 12}px`, '--spin': `${i * 57}deg`, '--delay': `${(i % 3) * 22}ms` }} />
      })}
    </span>
  )
}

export function EffectPreview({ id }) {
  const [event, setEvent] = useState(null)
  return (
    <button type="button" className="effect-preview" onClick={() => setEvent({ id: Date.now(), solved: true })} aria-label={`Preview ${id} move effect`}>
      <span className={`effect-emblem effect-emblem-${id}`}>{id === 'none' ? '○' : id === 'petals' ? '❧' : id === 'starlight' ? '✧' : '✦'}</span>
      <MoveEffect effect={id} event={event} x={50} y={43} />
      <small>{id === 'none' ? 'A quiet board' : 'Tap to preview'}</small>
    </button>
  )
}
