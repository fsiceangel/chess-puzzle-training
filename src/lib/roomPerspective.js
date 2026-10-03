// Measured from the afternoon room's structural depth lines. Coordinates
// are room percentages; the hand-painted background is only approximately
// single-point perspective.
export const ROOM_VP = { x: 50, y: 54 }
export const FACE_CORNERS = {
  bookshelf: { left: [[181,111],[390,72],[390,425],[181,480]], right: [[312,111],[138,65],[138,421],[312,480]] },
  wardrobe: { left: [[185,124],[386,94],[386,434],[185,482]], right: [[328,122],[126,95],[126,437],[328,482]] },
  fireplace: { left: [[128,209],[426,125],[426,367],[128,471]], right: [[380,211],[88,132],[88,367],[380,473]] },
}

export function homography(from, to) {
  const a = from.flatMap(([x,y], i) => {
    const [u,v] = to[i]
    return [[x,y,1,0,0,0,-u*x,-u*y,u], [0,0,0,x,y,1,-v*x,-v*y,v]]
  })
  for (let col=0; col<8; col++) {
    let pivot=col
    for (let row=col+1; row<8; row++) if(Math.abs(a[row][col])>Math.abs(a[pivot][col])) pivot=row
    if(Math.abs(a[pivot][col])<1e-9) return null
    ;[a[col],a[pivot]]=[a[pivot],a[col]]
    const divisor=a[col][col]
    for(let j=col;j<9;j++) a[col][j]/=divisor
    for(let row=0;row<8;row++) if(row!==col) {
      const factor=a[row][col]
      for(let j=col;j<9;j++) a[row][j]-=factor*a[col][j]
    }
  }
  return [...a.map(row=>row[8]),1]
}

export function wallProjection(id, direction, pos, width, room='bg') {
  const from=FACE_CORNERS[id]?.[direction]
  if(room!=='bg' || !from || !Number.isFinite(width) || width<=0) return null
  const vp=[(ROOM_VP.x-pos.x)/width*512,(ROOM_VP.y-pos.y)/(width*16/9)*512]
  const [nearTop,farTop,farBottom,nearBottom]=from
  const ratio=(farTop[0]-vp[0])/(nearTop[0]-vp[0])
  // A side view facing away from the room centre remains freely placed.
  // Do not fold a sprite through the vanishing point.
  if(!Number.isFinite(ratio) || ratio<.35 || ratio>.97) return null
  const to=[nearTop,[farTop[0],vp[1]+ratio*(nearTop[1]-vp[1])],
    [farBottom[0],vp[1]+ratio*(nearBottom[1]-vp[1])],nearBottom]
  const matrix=homography(from,to)
  if(!matrix) return null
  // Keep the texture outside the measured face away from a projective pole.
  if([[0,0],[512,0],[0,512],[512,512]].some(([x,y])=>matrix[6]*x+matrix[7]*y+1<.2)) return null
  return matrix
}

export function cssProjection(m) {
  return `matrix3d(${[m[0],m[3],0,m[6],m[1],m[4],0,m[7],0,0,1,0,m[2],m[5],0,1].join(',')})`
}
