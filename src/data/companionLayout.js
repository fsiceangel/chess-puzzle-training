// Original 320px sprites: visible bounds plus the main body's approximate
// height, excluding crowns, hats, spread tails and wings. These are display
// measurements only; the source images are not cropped or resampled.
const METRICS = {
  cat: [[13,1,307,319,300], [35,0,284,320,300], [3,45,317,320,230]],
  fox: [[43,1,276,319,285], [44,1,276,319,290], [16,84,303,320,155]],
  owl: [[1,93,320,319,210], [1,16,319,320,260], [20,90,299,320,150]],
  dragon: [[1,44,319,319,250], [1,30,319,319,250], [0,134,320,320,135]],
}
const GROWTH = [1, 1.25, 1.6]

// Relative to the middle form; room resize remains the user's base width.
export function roomEvolutionScale(petId, stage) {
  const forms = METRICS[petId]
  return Math.min(1.8, (GROWTH[stage-1] / GROWTH[1]) * forms[1][4] / forms[stage-1][4])
}

export function evolutionLayout(petId) {
  const forms = METRICS[petId].map(([left,top,right,bottom,bodyHeight], i) => {
    const scale = 100 * GROWTH[i] / bodyHeight
    return { left, top, right, bottom, scale, width: Math.max(95, (right-left)*scale+20) }
  })
  const height = Math.max(...forms.map(f => (f.bottom-f.top)*f.scale)) + 24
  return { height, forms: forms.map(f => ({
    ...f,
    x: (f.width-(f.right-f.left)*f.scale)/2-f.left*f.scale,
    y: height-12-f.bottom*f.scale,
    imageSize: 320*f.scale,
  })) }
}
