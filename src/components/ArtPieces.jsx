// Image piece sets. The default painted set lives at public/pieces/; every
// other set is a folder under it. All are pre-trimmed to the same canvas with
// the foot on a shared baseline, so no per-piece nudging here.
const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }

export function pieceSrc(set, type, color) {
  return `${import.meta.env.BASE_URL}pieces/studio/${set}/${type}${color}.svg`
}

export default function ArtPiece({ type, color, set = 'cartoon' }) {
  return (
    <img
      className="pc pc-art"
      src={pieceSrc(set, type, color)}
      alt={`${color === 'w' ? 'white' : 'black'} ${NAMES[type]}`}
      draggable="false"
    />
  )
}
