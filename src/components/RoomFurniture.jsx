import { FACE_CORNERS, wallProjection, cssProjection } from '../lib/roomPerspective.js'

export default function RoomFurniture({ id, direction, pos, width, room, src, alt, ...props }) {
  const matrix=wallProjection(id,direction,pos,width,room)
  if(!FACE_CORNERS[id]) return <img {...props} src={src} alt={alt}/>
  return <svg {...props} viewBox="0 0 512 512" aria-label={alt} style={{...props.style,overflow:'visible',pointerEvents:'bounding-box'}}>
    <foreignObject x="0" y="0" width="512" height="512" style={{overflow:'visible',pointerEvents:'none'}}>
      <img src={src} alt="" draggable="false" style={{display:'block',width:512,height:512,maxWidth:'none',transformOrigin:'0 0',transform:matrix ? cssProjection(matrix) : undefined}}/>
    </foreignObject>
  </svg>
}
