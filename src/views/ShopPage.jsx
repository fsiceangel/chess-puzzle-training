import { useState } from 'react'
import { furnitureSprite, roomSprite } from '../data/furnitureLayout.js'
import { boards, pieceSets, decorations, furniture, rooms, pets, effects, STAGE_XP } from '../data/shop.js'
import { check as checkBadges } from '../data/badges.js'
import { buy, equip, getCoins, getEquipped, isOwned, petStage, petXp } from '../lib/storage.js'
import { toast } from '../lib/toast.js'
import { sfx } from '../lib/sound.js'
import ArtPiece from '../components/ArtPieces.jsx'
import { EffectPreview } from '../components/MoveEffect.jsx'
import CompanionEvolution from '../components/CompanionEvolution.jsx'
import { BackLink, useProgressTick } from '../components/ui.jsx'

const base = import.meta.env.BASE_URL

const TABS = [
  ['rooms', 'Rooms'],
  ['boards', 'Boards'],
  ['pieceSets', 'Pieces'],
  ['effects', 'Move effects'],
  ['furniture', 'Furniture'],
  ['decorations', 'Decor'],
  ['pets', 'Companions'],
]

function Preview({ kind, item }) {
  if (kind === 'effects') return <EffectPreview id={item.id} />
  if (kind === 'boards') {
    return (
      <span className={`board-swatch board-t-${item.id}`}>
        <i />
        <i />
        <i />
        <i />
      </span>
    )
  }
  if (kind === 'pieceSets') {
    return (
      <span className="piece-family">
        {['w', 'b'].flatMap((color) => ['k', 'q', 'b', 'n', 'r', 'p'].map((type) => <ArtPiece key={color + type} type={type} color={color} set={item.id} />))}
      </span>
    )
  }
  if (kind === 'pets') {
    return <CompanionEvolution pet={item} currentStage={isOwned('pets', item.id) ? petStage(item.id) : 0} />
  }
  if (kind === 'rooms') {
    return <img className="room-thumb" src={`${base}${roomSprite(item.id)}`} alt="" draggable="false" />
  }
  const dir = kind === 'furniture' ? 'furniture' : 'room'
  return <img src={`${base}${kind === 'furniture' ? furnitureSprite(item.id) : `${dir}/${item.id}.webp`}`} alt="" draggable="false" />
}

function Card({ kind, item, equippedId, onChange }) {
  const [note, setNote] = useState('')
  const owned = isOwned(kind, item.id)
  const wearable = kind !== 'decorations' && kind !== 'furniture'
  const isOn = wearable && equippedId === item.id

  function act() {
    if (owned) {
      if (wearable && equip(kind, item.id)) {
        sfx.move()
        onChange()
      }
      return
    }
    const r = buy(kind, item.id)
    if (!r.ok) {
      setNote(r.reason)
      sfx.wrong()
      return
    }
    setNote('')
    sfx.solved()
    checkBadges().forEach((b) => toast({ icon: b.icon, title: b.name, text: b.blurb }))
    onChange()
  }

  let label = 'Buy'
  if (item.reward && !owned) label = 'Earn it'
  else if (owned && !wearable) label = 'In your room'
  else if (isOn) label = 'Using'
  else if (owned) label = 'Use'

  return (
    <div className={`shop-card shop-card-${kind}${isOn ? ' shop-card-on' : ''}`}>
      <div className="shop-preview">
        <Preview kind={kind} item={item} />
      </div>
      <p className="shop-name">{item.name}</p>
      <p className="shop-blurb">{item.blurb}</p>
      {kind === 'pets' && owned && (
        <p className="shop-stage">
          Stage {petStage(item.id)} · {item.stages?.[petStage(item.id) - 1]}
          {petStage(item.id) < 3 ? ` · ${petXp(item.id)}/${STAGE_XP[petStage(item.id)]} XP` : ' · fully grown'}
        </p>
      )}
      <div className="shop-foot">
        {owned ? (
          <span className="shop-price">✓ Yours</span>
        ) : item.reward ? (
          <span className="shop-price">🏅 Badge</span>
        ) : (
          <span className="shop-price">
            <i className="coin" /> {item.price === 0 ? 'Free' : item.price}
          </span>
        )}
        <button
          className={`btn ${isOn || (owned && !wearable) ? 'btn-ghost' : 'btn-accent'}`}
          onClick={act}
          disabled={isOn || (owned && !wearable) || (item.reward && !owned)}
        >
          {label}
        </button>
      </div>
      <p className="shop-note">{note}</p>
    </div>
  )
}

export default function ShopPage() {
  useProgressTick()
  const [tab, setTab] = useState('rooms')
  const [, bump] = useState(0)
  const coins = getCoins()
  const eq = getEquipped()
  const lists = { boards, pieceSets, decorations, furniture, rooms, pets, effects }
  const equippedId = { boards: eq.board, pieceSets: eq.pieces, pets: eq.pet, rooms: eq.room ?? 'bg', effects: eq.effect }[tab]

  return (
    <main className="page accent-amber">
      <BackLink href="#/">Home</BackLink>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">Shop</p>
          <h1>Spend your coins</h1>
          <p className="lede">Every puzzle you solve pays. A clean solve pays three times as much.</p>
        </div>
        <span className="coin-pill" style={{ fontSize: 20 }}>
          <i className="coin" /> {coins}
        </span>
      </div>

      <div className="shop-tabs" role="tablist">
        {TABS.map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`chip-btn${tab === id ? ' chip-btn-on' : ''}`}
            onClick={() => setTab(id)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={`shop-grid shop-grid-${tab}`}>
        {lists[tab].map((item) => (
          <Card key={item.id} kind={tab} item={item} equippedId={equippedId} onChange={() => bump((n) => n + 1)} />
        ))}
      </div>
    </main>
  )
}
