import { decorations, furniture } from '../data/shop.js'
import { furnitureSprite } from '../data/furnitureLayout.js'
import { getDecorDirection } from '../lib/storage.js'
import { isOwned, isStored, toggleStored } from '../lib/storage.js'
import { sfx } from '../lib/sound.js'
import { useProgressTick } from './ui.jsx'

const base = import.meta.env.BASE_URL

// Everything she owns for the room, as tiles: tap one to put it away or bring
// it back out. Nothing is lost either way.
export default function StoragePanel({ onClose }) {
  useProgressTick()
  const owned = [
    ...furniture.filter((f) => isOwned('furniture', f.id)).map((f) => ({ ...f, dir: 'furniture' })),
    ...decorations.filter((d) => isOwned('decorations', d.id)).map((d) => ({ ...d, dir: 'room' })),
  ]
  const out = owned.filter((i) => !isStored(i.id)).length
  return (
    <div className="storage" role="dialog" aria-label="Choose what is shown in the room">
      <div className="storage-head">
        <div>
          <p className="side-label">What to show</p>
          <p className="storage-sub">
            {out} shown · {owned.length - out} hidden · tap to switch
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onClose}>
          Done
        </button>
      </div>
      {owned.length === 0 ? (
        <p className="storage-empty">Nothing yet — the shop has furniture and decorations.</p>
      ) : (
        <div className="storage-grid">
          {owned.map((item) => {
            const away = isStored(item.id)
            return (
              <button
                key={item.id}
                className={`storage-tile${away ? ' storage-tile-away' : ''}`}
                onClick={() => {
                  toggleStored(item.id)
                  sfx.move()
                }}
                title={away ? 'Show it' : 'Hide it'}
                aria-pressed={!away}
              >
                <img src={`${base}${item.dir === 'furniture' ? furnitureSprite(item.id, getDecorDirection(item.id)) : `${item.dir}/${item.id}.webp`}`} alt="" draggable="false" />
                <span>{item.name}</span>
                <em>{away ? 'Hidden' : 'Shown'}</em>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
