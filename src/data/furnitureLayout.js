// Both views share a square canvas and a bottom-centre anchor.
export const directionalFurniture = ['bookshelf', 'wardrobe', 'fireplace', 'desk', 'armchair', 'bed']
export const hasDirections = id => directionalFurniture.includes(id)
// Enable each pair only after transparent exports have passed visual review.
export const readyDirectionArt = [...directionalFurniture]
export const hasDirectionArt = id => readyDirectionArt.includes(id)
export const validDirection = value => value === 'right' ? 'right' : 'left'
export function furnitureSprite(id, direction = 'left') {
  return hasDirectionArt(id) ? `furniture/directions/${id}-${validDirection(direction)}.png?v=clean2` : `furniture/${id}.webp`
}
export const roomSprite = id => id === 'bg' ? 'room/studio/afternoon.png' : `room/${id}.webp`
